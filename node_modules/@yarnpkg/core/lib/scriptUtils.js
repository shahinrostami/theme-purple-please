"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeWorkspaceAccessibleBinary = exports.executePackageAccessibleBinary = exports.getWorkspaceAccessibleBinaries = exports.getPackageAccessibleBinaries = exports.maybeExecuteWorkspaceLifecycleScript = exports.executeWorkspaceLifecycleScript = exports.hasWorkspaceScript = exports.executeWorkspaceScript = exports.executePackageShellcode = exports.executePackageScript = exports.hasPackageScript = exports.prepareExternalProject = exports.makeScriptEnv = void 0;
const tslib_1 = require("tslib");
const fslib_1 = require("@yarnpkg/fslib");
const fslib_2 = require("@yarnpkg/fslib");
const libzip_1 = require("@yarnpkg/libzip");
const shell_1 = require("@yarnpkg/shell");
const binjumper_1 = require("binjumper");
const capitalize_1 = tslib_1.__importDefault(require("lodash/capitalize"));
const p_limit_1 = tslib_1.__importDefault(require("p-limit"));
const stream_1 = require("stream");
const Manifest_1 = require("./Manifest");
const MessageName_1 = require("./MessageName");
const Report_1 = require("./Report");
const StreamReport_1 = require("./StreamReport");
const YarnVersion_1 = require("./YarnVersion");
const execUtils = tslib_1.__importStar(require("./execUtils"));
const formatUtils = tslib_1.__importStar(require("./formatUtils"));
const miscUtils = tslib_1.__importStar(require("./miscUtils"));
const structUtils = tslib_1.__importStar(require("./structUtils"));
var PackageManager;
(function (PackageManager) {
    PackageManager["Yarn1"] = "Yarn Classic";
    PackageManager["Yarn2"] = "Yarn";
    PackageManager["Npm"] = "npm";
    PackageManager["Pnpm"] = "pnpm";
})(PackageManager || (PackageManager = {}));
async function makePathWrapper(location, name, argv0, args = []) {
    if (process.platform === `win32`) {
        await Promise.all([
            fslib_2.xfs.writeFilePromise(fslib_2.ppath.format({ dir: location, name, ext: `.exe` }), binjumper_1.getBinjumper()),
            fslib_2.xfs.writeFilePromise(fslib_2.ppath.format({ dir: location, name, ext: `.exe.info` }), [argv0, ...args].join(`\n`)),
            fslib_2.xfs.writeFilePromise(fslib_2.ppath.format({ dir: location, name, ext: `.cmd` }), `@"${argv0}" ${args.map(arg => `"${arg.replace(`"`, `""`)}"`).join(` `)} %*\n`),
        ]);
    }
    await fslib_2.xfs.writeFilePromise(fslib_2.ppath.join(location, name), `#!/bin/sh\nexec "${argv0}" ${args.map(arg => `'${arg.replace(/'/g, `'"'"'`)}'`).join(` `)} "$@"\n`);
    await fslib_2.xfs.chmodPromise(fslib_2.ppath.join(location, name), 0o755);
}
async function detectPackageManager(location) {
    let yarnLock = null;
    try {
        yarnLock = await fslib_2.xfs.readFilePromise(fslib_2.ppath.join(location, fslib_1.Filename.lockfile), `utf8`);
    }
    catch (_a) { }
    if (yarnLock !== null) {
        if (yarnLock.match(/^__metadata:$/m)) {
            return PackageManager.Yarn2;
        }
        else {
            return PackageManager.Yarn1;
        }
    }
    if (fslib_2.xfs.existsSync(fslib_2.ppath.join(location, `package-lock.json`)))
        return PackageManager.Npm;
    if (fslib_2.xfs.existsSync(fslib_2.ppath.join(location, `pnpm-lock.yaml`)))
        return PackageManager.Pnpm;
    return null;
}
async function makeScriptEnv({ project, binFolder, lifecycleScript }) {
    const scriptEnv = {};
    for (const [key, value] of Object.entries(process.env))
        if (typeof value !== `undefined`)
            scriptEnv[key.toLowerCase() !== `path` ? key : `PATH`] = value;
    const nBinFolder = fslib_2.npath.fromPortablePath(binFolder);
    // We expose the base folder in the environment so that we can later add the
    // binaries for the dependencies of the active package
    scriptEnv.BERRY_BIN_FOLDER = fslib_2.npath.fromPortablePath(nBinFolder);
    // Register some binaries that must be made available in all subprocesses
    // spawned by Yarn (we thus ensure that they always use the right version)
    await makePathWrapper(binFolder, `node`, process.execPath);
    if (YarnVersion_1.YarnVersion !== null) {
        await makePathWrapper(binFolder, `run`, process.execPath, [process.argv[1], `run`]);
        await makePathWrapper(binFolder, `yarn`, process.execPath, [process.argv[1]]);
        await makePathWrapper(binFolder, `yarnpkg`, process.execPath, [process.argv[1]]);
        await makePathWrapper(binFolder, `node-gyp`, process.execPath, [process.argv[1], `run`, `--top-level`, `node-gyp`]);
    }
    if (project)
        scriptEnv.INIT_CWD = fslib_2.npath.fromPortablePath(project.configuration.startingCwd);
    scriptEnv.PATH = scriptEnv.PATH
        ? `${nBinFolder}${fslib_2.npath.delimiter}${scriptEnv.PATH}`
        : `${nBinFolder}`;
    scriptEnv.npm_execpath = `${nBinFolder}${fslib_2.npath.sep}yarn`;
    scriptEnv.npm_node_execpath = `${nBinFolder}${fslib_2.npath.sep}node`;
    const version = YarnVersion_1.YarnVersion !== null
        ? `yarn/${YarnVersion_1.YarnVersion}`
        : `yarn/${miscUtils.dynamicRequire(`@yarnpkg/core`).version}-core`;
    scriptEnv.npm_config_user_agent = `${version} npm/? node/${process.versions.node} ${process.platform} ${process.arch}`;
    if (lifecycleScript)
        scriptEnv.npm_lifecycle_event = lifecycleScript;
    if (project) {
        await project.configuration.triggerHook(hook => hook.setupScriptEnvironment, project, scriptEnv, async (name, argv0, args) => {
            return await makePathWrapper(binFolder, fslib_2.toFilename(name), argv0, args);
        });
    }
    return scriptEnv;
}
exports.makeScriptEnv = makeScriptEnv;
/**
 * Given a folder, prepares this project for use. Runs `yarn install` then
 * `yarn build` if a `package.json` is found.
 */
const MAX_PREPARE_CONCURRENCY = 2;
const prepareLimit = p_limit_1.default(MAX_PREPARE_CONCURRENCY);
async function prepareExternalProject(cwd, outputPath, { configuration, report, workspace = null }) {
    await prepareLimit(async () => {
        await fslib_2.xfs.mktempPromise(async (logDir) => {
            const logFile = fslib_2.ppath.join(logDir, `pack.log`);
            const stdin = null;
            const { stdout, stderr } = configuration.getSubprocessStreams(logFile, { prefix: cwd, report });
            const packageManager = await detectPackageManager(cwd);
            let effectivePackageManager;
            if (packageManager !== null) {
                stdout.write(`Installing the project using ${packageManager}\n\n`);
                effectivePackageManager = packageManager;
            }
            else {
                stdout.write(`No package manager detected; defaulting to Yarn\n\n`);
                effectivePackageManager = PackageManager.Yarn2;
            }
            await fslib_2.xfs.mktempPromise(async (binFolder) => {
                const env = await makeScriptEnv({ binFolder });
                const workflows = new Map([
                    [PackageManager.Yarn1, async () => {
                            const workspaceCli = workspace !== null
                                ? [`workspace`, workspace]
                                : [];
                            // Makes sure that we'll be using Yarn 1.x
                            const version = await execUtils.pipevp(`yarn`, [`set`, `version`, `classic`, `--only-if-needed`], { cwd, env, stdin, stdout, stderr, end: execUtils.EndStrategy.ErrorCode });
                            if (version.code !== 0)
                                return version.code;
                            // Otherwise Yarn 1 will pack the .yarn directory :(
                            await fslib_2.xfs.appendFilePromise(fslib_2.ppath.join(cwd, `.npmignore`), `/.yarn\n`);
                            stdout.write(`\n`);
                            // Run an install; we can't avoid it unless we inspect the
                            // package.json, which I don't want to do to keep the codebase
                            // clean (even if it has a slight perf cost when cloning v1 repos)
                            const install = await execUtils.pipevp(`yarn`, [`install`], { cwd, env, stdin, stdout, stderr, end: execUtils.EndStrategy.ErrorCode });
                            if (install.code !== 0)
                                return install.code;
                            stdout.write(`\n`);
                            const pack = await execUtils.pipevp(`yarn`, [...workspaceCli, `pack`, `--filename`, fslib_2.npath.fromPortablePath(outputPath)], { cwd, env, stdin, stdout, stderr });
                            if (pack.code !== 0)
                                return pack.code;
                            return 0;
                        }],
                    [PackageManager.Yarn2, async () => {
                            const workspaceCli = workspace !== null
                                ? [`workspace`, workspace]
                                : [];
                            // We enable inline builds, because nobody wants to
                            // read a logfile telling them to open another logfile
                            env.YARN_ENABLE_INLINE_BUILDS = `1`;
                            // If a lockfile doesn't exist we create a empty one to
                            // prevent the project root detection from thinking it's in an
                            // undeclared workspace when the user has a lockfile in their home
                            // directory on Windows
                            const lockfilePath = fslib_2.ppath.join(cwd, fslib_1.Filename.lockfile);
                            if (!(await fslib_2.xfs.existsPromise(lockfilePath)))
                                await fslib_2.xfs.writeFilePromise(lockfilePath, ``);
                            // Yarn 2 supports doing the install and the pack in a single command,
                            // so we leverage that. We also don't need the "set version" call since
                            // we're already operating within a Yarn 2 context (plus people should
                            // really check-in their Yarn versions anyway).
                            const pack = await execUtils.pipevp(`yarn`, [...workspaceCli, `pack`, `--install-if-needed`, `--filename`, fslib_2.npath.fromPortablePath(outputPath)], { cwd, env, stdin, stdout, stderr });
                            if (pack.code !== 0)
                                return pack.code;
                            return 0;
                        }],
                    [PackageManager.Npm, async () => {
                            if (workspace !== null)
                                throw new Error(`Workspaces aren't supported by npm, which has been detected as the primary package manager for ${cwd}`);
                            // Otherwise npm won't properly set the user agent, using the Yarn
                            // one instead
                            delete env.npm_config_user_agent;
                            // We can't use `npm ci` because some projects don't have npm
                            // lockfiles that are up-to-date. Hopefully npm won't decide
                            // to change the versions randomly.
                            const install = await execUtils.pipevp(`npm`, [`install`], { cwd, env, stdin, stdout, stderr, end: execUtils.EndStrategy.ErrorCode });
                            if (install.code !== 0)
                                return install.code;
                            const packStream = new stream_1.PassThrough();
                            const packPromise = miscUtils.bufferStream(packStream);
                            packStream.pipe(stdout);
                            // It seems that npm doesn't support specifying the pack output path,
                            // so we have to extract the stdout on top of forking it to the logs.
                            const pack = await execUtils.pipevp(`npm`, [`pack`, `--silent`], { cwd, env, stdin, stdout: packStream, stderr });
                            if (pack.code !== 0)
                                return pack.code;
                            const packOutput = (await packPromise).toString().trim();
                            const packTarget = fslib_2.ppath.resolve(cwd, fslib_2.npath.toPortablePath(packOutput));
                            // Only then can we move the pack to its rightful location
                            await fslib_2.xfs.renamePromise(packTarget, outputPath);
                            return 0;
                        }],
                ]);
                const workflow = workflows.get(effectivePackageManager);
                if (typeof workflow === `undefined`)
                    throw new Error(`Assertion failed: Unsupported workflow`);
                const code = await workflow();
                if (code === 0 || typeof code === `undefined`)
                    return;
                fslib_2.xfs.detachTemp(logDir);
                throw new Report_1.ReportError(MessageName_1.MessageName.PACKAGE_PREPARATION_FAILED, `Packing the package failed (exit code ${code}, logs can be found here: ${logFile})`);
            });
        });
    });
}
exports.prepareExternalProject = prepareExternalProject;
async function hasPackageScript(locator, scriptName, { project }) {
    const pkg = project.storedPackages.get(locator.locatorHash);
    if (!pkg)
        throw new Error(`Package for ${structUtils.prettyLocator(project.configuration, locator)} not found in the project`);
    return await fslib_1.ZipOpenFS.openPromise(async (zipOpenFs) => {
        const configuration = project.configuration;
        const linkers = project.configuration.getLinkers();
        const linkerOptions = { project, report: new StreamReport_1.StreamReport({ stdout: new stream_1.PassThrough(), configuration }) };
        const linker = linkers.find(linker => linker.supportsPackage(pkg, linkerOptions));
        if (!linker)
            throw new Error(`The package ${structUtils.prettyLocator(project.configuration, pkg)} isn't supported by any of the available linkers`);
        const packageLocation = await linker.findPackageLocation(pkg, linkerOptions);
        const packageFs = new fslib_1.CwdFS(packageLocation, { baseFs: zipOpenFs });
        const manifest = await Manifest_1.Manifest.find(fslib_1.PortablePath.dot, { baseFs: packageFs });
        return manifest.scripts.has(scriptName);
    }, {
        libzip: await libzip_1.getLibzipPromise(),
    });
}
exports.hasPackageScript = hasPackageScript;
async function executePackageScript(locator, scriptName, args, { cwd, project, stdin, stdout, stderr }) {
    return await fslib_2.xfs.mktempPromise(async (binFolder) => {
        const { manifest, env, cwd: realCwd } = await initializePackageEnvironment(locator, { project, binFolder, cwd, lifecycleScript: scriptName });
        const script = manifest.scripts.get(scriptName);
        if (typeof script === `undefined`)
            return 1;
        const realExecutor = async () => {
            return await shell_1.execute(script, args, { cwd: realCwd, env, stdin, stdout, stderr });
        };
        const executor = await project.configuration.reduceHook(hooks => {
            return hooks.wrapScriptExecution;
        }, realExecutor, project, locator, scriptName, {
            script, args, cwd: realCwd, env, stdin, stdout, stderr,
        });
        return await executor();
    });
}
exports.executePackageScript = executePackageScript;
async function executePackageShellcode(locator, command, args, { cwd, project, stdin, stdout, stderr }) {
    return await fslib_2.xfs.mktempPromise(async (binFolder) => {
        const { env, cwd: realCwd } = await initializePackageEnvironment(locator, { project, binFolder, cwd });
        return await shell_1.execute(command, args, { cwd: realCwd, env, stdin, stdout, stderr });
    });
}
exports.executePackageShellcode = executePackageShellcode;
async function initializePackageEnvironment(locator, { project, binFolder, cwd, lifecycleScript }) {
    const pkg = project.storedPackages.get(locator.locatorHash);
    if (!pkg)
        throw new Error(`Package for ${structUtils.prettyLocator(project.configuration, locator)} not found in the project`);
    return await fslib_1.ZipOpenFS.openPromise(async (zipOpenFs) => {
        const configuration = project.configuration;
        const linkers = project.configuration.getLinkers();
        const linkerOptions = { project, report: new StreamReport_1.StreamReport({ stdout: new stream_1.PassThrough(), configuration }) };
        const linker = linkers.find(linker => linker.supportsPackage(pkg, linkerOptions));
        if (!linker)
            throw new Error(`The package ${structUtils.prettyLocator(project.configuration, pkg)} isn't supported by any of the available linkers`);
        const env = await makeScriptEnv({ project, binFolder, lifecycleScript });
        await Promise.all(Array.from(await getPackageAccessibleBinaries(locator, { project }), ([binaryName, [, binaryPath]]) => makePathWrapper(binFolder, fslib_2.toFilename(binaryName), process.execPath, [binaryPath])));
        const packageLocation = await linker.findPackageLocation(pkg, linkerOptions);
        const packageFs = new fslib_1.CwdFS(packageLocation, { baseFs: zipOpenFs });
        const manifest = await Manifest_1.Manifest.find(fslib_1.PortablePath.dot, { baseFs: packageFs });
        if (typeof cwd === `undefined`)
            cwd = packageLocation;
        return { manifest, binFolder, env, cwd };
    }, {
        libzip: await libzip_1.getLibzipPromise(),
    });
}
async function executeWorkspaceScript(workspace, scriptName, args, { cwd, stdin, stdout, stderr }) {
    return await executePackageScript(workspace.anchoredLocator, scriptName, args, { cwd, project: workspace.project, stdin, stdout, stderr });
}
exports.executeWorkspaceScript = executeWorkspaceScript;
function hasWorkspaceScript(workspace, scriptName) {
    return workspace.manifest.scripts.has(scriptName);
}
exports.hasWorkspaceScript = hasWorkspaceScript;
async function executeWorkspaceLifecycleScript(workspace, lifecycleScriptName, { cwd, report }) {
    const { configuration } = workspace.project;
    const stdin = null;
    await fslib_2.xfs.mktempPromise(async (logDir) => {
        const logFile = fslib_2.ppath.join(logDir, `${lifecycleScriptName}.log`);
        const header = `# This file contains the result of Yarn calling the "${lifecycleScriptName}" lifecycle script inside a workspace ("${workspace.cwd}")\n`;
        const { stdout, stderr } = configuration.getSubprocessStreams(logFile, {
            report,
            prefix: structUtils.prettyLocator(configuration, workspace.anchoredLocator),
            header,
        });
        report.reportInfo(MessageName_1.MessageName.LIFECYCLE_SCRIPT, `Calling the "${lifecycleScriptName}" lifecycle script`);
        const exitCode = await executeWorkspaceScript(workspace, lifecycleScriptName, [], { cwd, stdin, stdout, stderr });
        stdout.end();
        stderr.end();
        if (exitCode !== 0) {
            fslib_2.xfs.detachTemp(logDir);
            throw new Report_1.ReportError(MessageName_1.MessageName.LIFECYCLE_SCRIPT, `${capitalize_1.default(lifecycleScriptName)} script failed (exit code ${formatUtils.pretty(configuration, exitCode, formatUtils.Type.NUMBER)}, logs can be found here: ${formatUtils.pretty(configuration, logFile, formatUtils.Type.PATH)}); run ${formatUtils.pretty(configuration, `yarn ${lifecycleScriptName}`, formatUtils.Type.CODE)} to investigate`);
        }
    });
}
exports.executeWorkspaceLifecycleScript = executeWorkspaceLifecycleScript;
async function maybeExecuteWorkspaceLifecycleScript(workspace, lifecycleScriptName, opts) {
    if (hasWorkspaceScript(workspace, lifecycleScriptName)) {
        await executeWorkspaceLifecycleScript(workspace, lifecycleScriptName, opts);
    }
}
exports.maybeExecuteWorkspaceLifecycleScript = maybeExecuteWorkspaceLifecycleScript;
/**
 * Return the binaries that can be accessed by the specified package
 *
 * @param locator The queried package
 * @param project The project owning the package
 */
async function getPackageAccessibleBinaries(locator, { project }) {
    const configuration = project.configuration;
    const binaries = new Map();
    const pkg = project.storedPackages.get(locator.locatorHash);
    if (!pkg)
        throw new Error(`Package for ${structUtils.prettyLocator(configuration, locator)} not found in the project`);
    const stdout = new stream_1.Writable();
    const linkers = configuration.getLinkers();
    const linkerOptions = { project, report: new StreamReport_1.StreamReport({ configuration, stdout }) };
    const visibleLocators = new Set([locator.locatorHash]);
    for (const descriptor of pkg.dependencies.values()) {
        const resolution = project.storedResolutions.get(descriptor.descriptorHash);
        if (!resolution)
            throw new Error(`Assertion failed: The resolution (${structUtils.prettyDescriptor(configuration, descriptor)}) should have been registered`);
        visibleLocators.add(resolution);
    }
    for (const locatorHash of visibleLocators) {
        const dependency = project.storedPackages.get(locatorHash);
        if (!dependency)
            throw new Error(`Assertion failed: The package (${locatorHash}) should have been registered`);
        if (dependency.bin.size === 0)
            continue;
        const linker = linkers.find(linker => linker.supportsPackage(dependency, linkerOptions));
        if (!linker)
            continue;
        let packageLocation = null;
        try {
            packageLocation = await linker.findPackageLocation(dependency, linkerOptions);
        }
        catch (err) {
            // Some packages may not be installed when they are incompatible
            // with the current system.
            if (err.code === `LOCATOR_NOT_INSTALLED`) {
                continue;
            }
            else {
                throw err;
            }
        }
        for (const [name, target] of dependency.bin) {
            binaries.set(name, [dependency, fslib_2.npath.fromPortablePath(fslib_2.ppath.resolve(packageLocation, target))]);
        }
    }
    return binaries;
}
exports.getPackageAccessibleBinaries = getPackageAccessibleBinaries;
/**
 * Return the binaries that can be accessed by the specified workspace
 *
 * @param workspace The queried workspace
 */
async function getWorkspaceAccessibleBinaries(workspace) {
    return await getPackageAccessibleBinaries(workspace.anchoredLocator, { project: workspace.project });
}
exports.getWorkspaceAccessibleBinaries = getWorkspaceAccessibleBinaries;
/**
 * Execute a binary from the specified package.
 *
 * Note that "binary" in this sense means "a Javascript file". Actual native
 * binaries cannot be executed this way, because we use Node in order to
 * transparently read from the archives.
 *
 * @param locator The queried package
 * @param binaryName The name of the binary file to execute
 * @param args The arguments to pass to the file
 */
async function executePackageAccessibleBinary(locator, binaryName, args, { cwd, project, stdin, stdout, stderr, nodeArgs = [] }) {
    const packageAccessibleBinaries = await getPackageAccessibleBinaries(locator, { project });
    const binary = packageAccessibleBinaries.get(binaryName);
    if (!binary)
        throw new Error(`Binary not found (${binaryName}) for ${structUtils.prettyLocator(project.configuration, locator)}`);
    return await fslib_2.xfs.mktempPromise(async (binFolder) => {
        const [, binaryPath] = binary;
        const env = await makeScriptEnv({ project, binFolder });
        await Promise.all(Array.from(packageAccessibleBinaries, ([binaryName, [, binaryPath]]) => makePathWrapper(env.BERRY_BIN_FOLDER, fslib_2.toFilename(binaryName), process.execPath, [binaryPath])));
        let result;
        try {
            result = await execUtils.pipevp(process.execPath, [...nodeArgs, binaryPath, ...args], { cwd, env, stdin, stdout, stderr });
        }
        finally {
            await fslib_2.xfs.removePromise(env.BERRY_BIN_FOLDER);
        }
        return result.code;
    });
}
exports.executePackageAccessibleBinary = executePackageAccessibleBinary;
/**
 * Execute a binary from the specified workspace
 *
 * @param workspace The queried package
 * @param binaryName The name of the binary file to execute
 * @param args The arguments to pass to the file
 */
async function executeWorkspaceAccessibleBinary(workspace, binaryName, args, { cwd, stdin, stdout, stderr }) {
    return await executePackageAccessibleBinary(workspace.anchoredLocator, binaryName, args, { project: workspace.project, cwd, stdin, stdout, stderr });
}
exports.executeWorkspaceAccessibleBinary = executeWorkspaceAccessibleBinary;
