"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Workspace = void 0;
const tslib_1 = require("tslib");
const fslib_1 = require("@yarnpkg/fslib");
const globby_1 = tslib_1.__importDefault(require("globby"));
const semver_1 = tslib_1.__importDefault(require("semver"));
const Manifest_1 = require("./Manifest");
const WorkspaceResolver_1 = require("./WorkspaceResolver");
const hashUtils = tslib_1.__importStar(require("./hashUtils"));
const structUtils = tslib_1.__importStar(require("./structUtils"));
class Workspace {
    constructor(workspaceCwd, { project }) {
        this.workspacesCwds = new Set();
        // Generated at resolution; basically dependencies + devDependencies + child workspaces
        this.dependencies = new Map();
        this.project = project;
        this.cwd = workspaceCwd;
    }
    async setup() {
        // @ts-expect-error: It's ok to initialize it now
        this.manifest = fslib_1.xfs.existsSync(fslib_1.ppath.join(this.cwd, Manifest_1.Manifest.fileName))
            ? await Manifest_1.Manifest.find(this.cwd)
            : new Manifest_1.Manifest();
        // We use ppath.relative to guarantee that the default hash will be consistent even if the project is installed on different OS / path
        // @ts-expect-error: It's ok to initialize it now, even if it's readonly (setup is called right after construction)
        this.relativeCwd = fslib_1.ppath.relative(this.project.cwd, this.cwd) || fslib_1.PortablePath.dot;
        const ident = this.manifest.name ? this.manifest.name : structUtils.makeIdent(null, `${this.computeCandidateName()}-${hashUtils.makeHash(this.relativeCwd).substr(0, 6)}`);
        const reference = this.manifest.version ? this.manifest.version : `0.0.0`;
        // @ts-expect-error: It's ok to initialize it now, even if it's readonly (setup is called right after construction)
        this.locator = structUtils.makeLocator(ident, reference);
        // @ts-expect-error: It's ok to initialize it now, even if it's readonly (setup is called right after construction)
        this.anchoredDescriptor = structUtils.makeDescriptor(this.locator, `${WorkspaceResolver_1.WorkspaceResolver.protocol}${this.relativeCwd}`);
        // @ts-expect-error: It's ok to initialize it now, even if it's readonly (setup is called right after construction)
        this.anchoredLocator = structUtils.makeLocator(this.locator, `${WorkspaceResolver_1.WorkspaceResolver.protocol}${this.relativeCwd}`);
        const patterns = this.manifest.workspaceDefinitions.map(({ pattern }) => pattern);
        const relativeCwds = await globby_1.default(patterns, {
            absolute: true,
            cwd: fslib_1.npath.fromPortablePath(this.cwd),
            expandDirectories: false,
            onlyDirectories: true,
            onlyFiles: false,
            ignore: [`**/node_modules`, `**/.git`, `**/.yarn`],
        });
        // It seems that the return value of globby isn't in any guaranteed order - not even the directory listing order
        relativeCwds.sort();
        for (const relativeCwd of relativeCwds) {
            const candidateCwd = fslib_1.ppath.resolve(this.cwd, fslib_1.npath.toPortablePath(relativeCwd));
            if (fslib_1.xfs.existsSync(fslib_1.ppath.join(candidateCwd, `package.json`))) {
                this.workspacesCwds.add(candidateCwd);
            }
        }
    }
    accepts(range) {
        const protocolIndex = range.indexOf(`:`);
        const protocol = protocolIndex !== -1
            ? range.slice(0, protocolIndex + 1)
            : null;
        const pathname = protocolIndex !== -1
            ? range.slice(protocolIndex + 1)
            : range;
        if (protocol === WorkspaceResolver_1.WorkspaceResolver.protocol && fslib_1.ppath.normalize(pathname) === this.relativeCwd)
            return true;
        if (protocol === WorkspaceResolver_1.WorkspaceResolver.protocol && pathname === `*`)
            return true;
        if (!semver_1.default.validRange(pathname))
            return false;
        if (protocol === WorkspaceResolver_1.WorkspaceResolver.protocol)
            return semver_1.default.satisfies(this.manifest.version !== null ? this.manifest.version : `0.0.0`, pathname);
        if (!this.project.configuration.get(`enableTransparentWorkspaces`))
            return false;
        if (this.manifest.version !== null)
            return semver_1.default.satisfies(this.manifest.version, pathname);
        return false;
    }
    computeCandidateName() {
        if (this.cwd === this.project.cwd) {
            return `root-workspace`;
        }
        else {
            return `${fslib_1.ppath.basename(this.cwd)}` || `unnamed-workspace`;
        }
    }
    async persistManifest() {
        const data = {};
        this.manifest.exportTo(data);
        const path = fslib_1.ppath.join(this.cwd, Manifest_1.Manifest.fileName);
        const content = `${JSON.stringify(data, null, this.manifest.indent)}\n`;
        await fslib_1.xfs.changeFilePromise(path, content, {
            automaticNewlines: true,
        });
    }
}
exports.Workspace = Workspace;
