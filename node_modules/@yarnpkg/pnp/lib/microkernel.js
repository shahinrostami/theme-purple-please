module.exports =
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 890:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "LinkType": () => /* reexport */ LinkType,
  "hydratePnpFile": () => /* reexport */ hydratePnpFile,
  "hydratePnpSource": () => /* reexport */ hydratePnpSource
});

// CONCATENATED MODULE: ./sources/types.ts
// Note: most of those types are useless for most users. Just check the
// PnpSettings and PnpApi types at the end and you'll be fine.
//
// Apart from that, note that the "Data"-suffixed types are the ones stored
// within the state files (hence why they only use JSON datatypes).
var LinkType;

(function (LinkType) {
  LinkType["HARD"] = "HARD";
  LinkType["SOFT"] = "SOFT";
})(LinkType || (LinkType = {}));
// CONCATENATED MODULE: external "fs"
const external_fs_namespaceObject = require("fs");;
var external_fs_default = /*#__PURE__*/__webpack_require__.n(external_fs_namespaceObject);

// CONCATENATED MODULE: external "path"
const external_path_namespaceObject = require("path");;
var external_path_default = /*#__PURE__*/__webpack_require__.n(external_path_namespaceObject);

// CONCATENATED MODULE: external "util"
const external_util_namespaceObject = require("util");;
// CONCATENATED MODULE: ../yarnpkg-fslib/sources/path.ts

var PathType;

(function (PathType) {
  PathType[PathType["File"] = 0] = "File";
  PathType[PathType["Portable"] = 1] = "Portable";
  PathType[PathType["Native"] = 2] = "Native";
})(PathType || (PathType = {}));

const PortablePath = {
  root: `/`,
  dot: `.`
};
const Filename = {
  nodeModules: `node_modules`,
  manifest: `package.json`,
  lockfile: `yarn.lock`,
  pnpJs: `.pnp.js`,
  rc: `.yarnrc.yml`
};
const npath = Object.create((external_path_default()));
const ppath = Object.create((external_path_default()).posix);

npath.cwd = () => process.cwd();

ppath.cwd = () => toPortablePath(process.cwd());

ppath.resolve = (...segments) => {
  if (segments.length > 0 && ppath.isAbsolute(segments[0])) {
    return external_path_default().posix.resolve(...segments);
  } else {
    return external_path_default().posix.resolve(ppath.cwd(), ...segments);
  }
};

const contains = function (pathUtils, from, to) {
  from = pathUtils.normalize(from);
  to = pathUtils.normalize(to);
  if (from === to) return `.`;
  if (!from.endsWith(pathUtils.sep)) from = from + pathUtils.sep;

  if (to.startsWith(from)) {
    return to.slice(from.length);
  } else {
    return null;
  }
};

npath.fromPortablePath = fromPortablePath;
npath.toPortablePath = toPortablePath;

npath.contains = (from, to) => contains(npath, from, to);

ppath.contains = (from, to) => contains(ppath, from, to);

const WINDOWS_PATH_REGEXP = /^([a-zA-Z]:.*)$/;
const UNC_WINDOWS_PATH_REGEXP = /^\\\\(\.\\)?(.*)$/;
const PORTABLE_PATH_REGEXP = /^\/([a-zA-Z]:.*)$/;
const UNC_PORTABLE_PATH_REGEXP = /^\/unc\/(\.dot\/)?(.*)$/; // Path should look like "/N:/berry/scripts/plugin-pack.js"
// And transform to "N:\berry\scripts\plugin-pack.js"

function fromPortablePath(p) {
  if (process.platform !== `win32`) return p;
  if (p.match(PORTABLE_PATH_REGEXP)) p = p.replace(PORTABLE_PATH_REGEXP, `$1`);else if (p.match(UNC_PORTABLE_PATH_REGEXP)) p = p.replace(UNC_PORTABLE_PATH_REGEXP, (match, p1, p2) => `\\\\${p1 ? `.\\` : ``}${p2}`);else return p;
  return p.replace(/\//g, `\\`);
} // Path should look like "N:/berry/scripts/plugin-pack.js"
// And transform to "/N:/berry/scripts/plugin-pack.js"


function toPortablePath(p) {
  if (process.platform !== `win32`) return p;
  if (p.match(WINDOWS_PATH_REGEXP)) p = p.replace(WINDOWS_PATH_REGEXP, `/$1`);else if (p.match(UNC_WINDOWS_PATH_REGEXP)) p = p.replace(UNC_WINDOWS_PATH_REGEXP, (match, p1, p2) => `/unc/${p1 ? `.dot/` : ``}${p2}`);
  return p.replace(/\\/g, `/`);
}

function convertPath(targetPathUtils, sourcePath) {
  return targetPathUtils === npath ? fromPortablePath(sourcePath) : toPortablePath(sourcePath);
}
function toFilename(filename) {
  if (npath.parse(filename).dir !== `` || ppath.parse(filename).dir !== ``) throw new Error(`Invalid filename: "${filename}"`);
  return filename;
}
// CONCATENATED MODULE: ./sources/loader/hydrateRuntimeState.ts

function hydrateRuntimeState(data, {
  basePath
}) {
  const portablePath = npath.toPortablePath(basePath);
  const absolutePortablePath = ppath.resolve(portablePath);
  const ignorePattern = data.ignorePatternData !== null ? new RegExp(data.ignorePatternData) : null;
  const packageRegistry = new Map(data.packageRegistryData.map(([packageName, packageStoreData]) => {
    return [packageName, new Map(packageStoreData.map(([packageReference, packageInformationData]) => {
      return [packageReference, {
        // We use ppath.join instead of ppath.resolve because:
        // 1) packageInformationData.packageLocation is a relative path when part of the SerializedState
        // 2) ppath.join preserves trailing slashes
        packageLocation: ppath.join(absolutePortablePath, packageInformationData.packageLocation),
        packageDependencies: new Map(packageInformationData.packageDependencies),
        packagePeers: new Set(packageInformationData.packagePeers),
        linkType: packageInformationData.linkType,
        discardFromLookup: packageInformationData.discardFromLookup || false
      }];
    }))];
  }));
  const packageLocatorsByLocations = new Map();
  const packageLocationLengths = new Set();

  for (const [packageName, storeData] of data.packageRegistryData) {
    for (const [packageReference, packageInformationData] of storeData) {
      if (packageName === null !== (packageReference === null)) throw new Error(`Assertion failed: The name and reference should be null, or neither should`);
      if (packageInformationData.discardFromLookup) continue; // @ts-expect-error: TypeScript isn't smart enough to understand the type assertion

      const packageLocator = {
        name: packageName,
        reference: packageReference
      };
      packageLocatorsByLocations.set(packageInformationData.packageLocation, packageLocator);
      packageLocationLengths.add(packageInformationData.packageLocation.length);
    }
  }

  for (const location of data.locationBlacklistData) packageLocatorsByLocations.set(location, null);

  const fallbackExclusionList = new Map(data.fallbackExclusionList.map(([packageName, packageReferences]) => {
    return [packageName, new Set(packageReferences)];
  }));
  const fallbackPool = new Map(data.fallbackPool);
  const dependencyTreeRoots = data.dependencyTreeRoots;
  const enableTopLevelFallback = data.enableTopLevelFallback;
  return {
    basePath: portablePath,
    dependencyTreeRoots,
    enableTopLevelFallback,
    fallbackExclusionList,
    fallbackPool,
    ignorePattern,
    packageLocationLengths: [...packageLocationLengths].sort((a, b) => b - a),
    packageLocatorsByLocations,
    packageRegistry
  };
}
// CONCATENATED MODULE: external "os"
const external_os_namespaceObject = require("os");;
// CONCATENATED MODULE: ../yarnpkg-fslib/sources/algorithms/copyPromise.ts

 // 1980-01-01, like Fedora

const defaultTime = new Date(315532800 * 1000);
async function copyPromise(destinationFs, destination, sourceFs, source, opts) {
  const normalizedDestination = destinationFs.pathUtils.normalize(destination);
  const normalizedSource = sourceFs.pathUtils.normalize(source);
  const prelayout = [];
  const postlayout = [];
  await destinationFs.mkdirPromise(destinationFs.pathUtils.dirname(destination), {
    recursive: true
  });
  const updateTime = typeof destinationFs.lutimesPromise === `function` ? destinationFs.lutimesPromise.bind(destinationFs) : destinationFs.utimesPromise.bind(destinationFs);
  await copyImpl(prelayout, postlayout, updateTime, destinationFs, normalizedDestination, sourceFs, normalizedSource, opts);

  for (const operation of prelayout) await operation();

  await Promise.all(postlayout.map(operation => {
    return operation();
  }));
}

async function copyImpl(prelayout, postlayout, updateTime, destinationFs, destination, sourceFs, source, opts) {
  var _a, _b;

  const destinationStat = await maybeLStat(destinationFs, destination);
  const sourceStat = await sourceFs.lstatPromise(source);
  const referenceTime = opts.stableTime ? {
    mtime: defaultTime,
    atime: defaultTime
  } : sourceStat;
  let updated;

  switch (true) {
    case sourceStat.isDirectory():
      {
        updated = await copyFolder(prelayout, postlayout, updateTime, destinationFs, destination, destinationStat, sourceFs, source, sourceStat, opts);
      }
      break;

    case sourceStat.isFile():
      {
        updated = await copyFile(prelayout, postlayout, updateTime, destinationFs, destination, destinationStat, sourceFs, source, sourceStat, opts);
      }
      break;

    case sourceStat.isSymbolicLink():
      {
        updated = await copySymlink(prelayout, postlayout, updateTime, destinationFs, destination, destinationStat, sourceFs, source, sourceStat, opts);
      }
      break;

    default:
      {
        throw new Error(`Unsupported file type (${sourceStat.mode})`);
      }
      break;
  }

  if (updated || ((_a = destinationStat === null || destinationStat === void 0 ? void 0 : destinationStat.mtime) === null || _a === void 0 ? void 0 : _a.getTime()) !== referenceTime.mtime.getTime() || ((_b = destinationStat === null || destinationStat === void 0 ? void 0 : destinationStat.atime) === null || _b === void 0 ? void 0 : _b.getTime()) !== referenceTime.atime.getTime()) {
    postlayout.push(() => updateTime(destination, referenceTime.atime, referenceTime.mtime));
    updated = true;
  }

  if (destinationStat === null || (destinationStat.mode & 0o777) !== (sourceStat.mode & 0o777)) {
    postlayout.push(() => destinationFs.chmodPromise(destination, sourceStat.mode & 0o777));
    updated = true;
  }

  return updated;
}

async function maybeLStat(baseFs, p) {
  try {
    return await baseFs.lstatPromise(p);
  } catch (e) {
    return null;
  }
}

async function copyFolder(prelayout, postlayout, updateTime, destinationFs, destination, destinationStat, sourceFs, source, sourceStat, opts) {
  if (destinationStat !== null && !destinationStat.isDirectory()) {
    if (opts.overwrite) {
      prelayout.push(async () => destinationFs.removePromise(destination));
      destinationStat = null;
    } else {
      return false;
    }
  }

  let updated = false;

  if (destinationStat === null) {
    prelayout.push(async () => destinationFs.mkdirPromise(destination, {
      mode: sourceStat.mode
    }));
    updated = true;
  }

  const entries = await sourceFs.readdirPromise(source);

  if (opts.stableSort) {
    for (const entry of entries.sort()) {
      if (await copyImpl(prelayout, postlayout, updateTime, destinationFs, destinationFs.pathUtils.join(destination, entry), sourceFs, sourceFs.pathUtils.join(source, entry), opts)) {
        updated = true;
      }
    }
  } else {
    const entriesUpdateStatus = await Promise.all(entries.map(async entry => {
      await copyImpl(prelayout, postlayout, updateTime, destinationFs, destinationFs.pathUtils.join(destination, entry), sourceFs, sourceFs.pathUtils.join(source, entry), opts);
    }));

    if (entriesUpdateStatus.some(status => status)) {
      updated = true;
    }
  }

  return updated;
}

async function copyFile(prelayout, postlayout, updateTime, destinationFs, destination, destinationStat, sourceFs, source, sourceStat, opts) {
  if (destinationStat !== null) {
    if (opts.overwrite) {
      prelayout.push(async () => destinationFs.removePromise(destination));
      destinationStat = null;
    } else {
      return false;
    }
  }

  const op = destinationFs === sourceFs ? async () => destinationFs.copyFilePromise(source, destination, (external_fs_default()).constants.COPYFILE_FICLONE) : async () => destinationFs.writeFilePromise(destination, await sourceFs.readFilePromise(source));
  prelayout.push(async () => op());
  return true;
}

async function copySymlink(prelayout, postlayout, updateTime, destinationFs, destination, destinationStat, sourceFs, source, sourceStat, opts) {
  if (destinationStat !== null) {
    if (opts.overwrite) {
      prelayout.push(async () => destinationFs.removePromise(destination));
      destinationStat = null;
    } else {
      return false;
    }
  }

  prelayout.push(async () => {
    await destinationFs.symlinkPromise(convertPath(destinationFs.pathUtils, await sourceFs.readlinkPromise(source)), destination);
  });
  return true;
}
// CONCATENATED MODULE: ../yarnpkg-fslib/sources/FakeFS.ts



class FakeFS {
  constructor(pathUtils) {
    this.pathUtils = pathUtils;
  }

  async *genTraversePromise(init, {
    stableSort = false
  } = {}) {
    const stack = [init];

    while (stack.length > 0) {
      const p = stack.shift();
      const entry = await this.lstatPromise(p);

      if (entry.isDirectory()) {
        const entries = await this.readdirPromise(p);

        if (stableSort) {
          for (const entry of entries.sort()) {
            stack.push(this.pathUtils.join(p, entry));
          }
        } else {
          throw new Error(`Not supported`);
        }
      } else {
        yield p;
      }
    }
  }

  async removePromise(p, {
    recursive = true,
    maxRetries = 5
  } = {}) {
    let stat;

    try {
      stat = await this.lstatPromise(p);
    } catch (error) {
      if (error.code === `ENOENT`) {
        return;
      } else {
        throw error;
      }
    }

    if (stat.isDirectory()) {
      if (recursive) for (const entry of await this.readdirPromise(p)) await this.removePromise(this.pathUtils.resolve(p, entry)); // 5 gives 1s worth of retries at worst

      let t = 0;

      do {
        try {
          await this.rmdirPromise(p);
          break;
        } catch (error) {
          if (error.code === `EBUSY` || error.code === `ENOTEMPTY`) {
            if (maxRetries === 0) {
              break;
            } else {
              await new Promise(resolve => setTimeout(resolve, t * 100));
              continue;
            }
          } else {
            throw error;
          }
        }
      } while (t++ < maxRetries);
    } else {
      await this.unlinkPromise(p);
    }
  }

  removeSync(p, {
    recursive = true
  } = {}) {
    let stat;

    try {
      stat = this.lstatSync(p);
    } catch (error) {
      if (error.code === `ENOENT`) {
        return;
      } else {
        throw error;
      }
    }

    if (stat.isDirectory()) {
      if (recursive) for (const entry of this.readdirSync(p)) this.removeSync(this.pathUtils.resolve(p, entry));
      this.rmdirSync(p);
    } else {
      this.unlinkSync(p);
    }
  }

  async mkdirpPromise(p, {
    chmod,
    utimes
  } = {}) {
    p = this.resolve(p);
    if (p === this.pathUtils.dirname(p)) return;
    const parts = p.split(this.pathUtils.sep);

    for (let u = 2; u <= parts.length; ++u) {
      const subPath = parts.slice(0, u).join(this.pathUtils.sep);

      if (!this.existsSync(subPath)) {
        try {
          await this.mkdirPromise(subPath);
        } catch (error) {
          if (error.code === `EEXIST`) {
            continue;
          } else {
            throw error;
          }
        }

        if (chmod != null) await this.chmodPromise(subPath, chmod);

        if (utimes != null) {
          await this.utimesPromise(subPath, utimes[0], utimes[1]);
        } else {
          const parentStat = await this.statPromise(this.pathUtils.dirname(subPath));
          await this.utimesPromise(subPath, parentStat.atime, parentStat.mtime);
        }
      }
    }
  }

  mkdirpSync(p, {
    chmod,
    utimes
  } = {}) {
    p = this.resolve(p);
    if (p === this.pathUtils.dirname(p)) return;
    const parts = p.split(this.pathUtils.sep);

    for (let u = 2; u <= parts.length; ++u) {
      const subPath = parts.slice(0, u).join(this.pathUtils.sep);

      if (!this.existsSync(subPath)) {
        try {
          this.mkdirSync(subPath);
        } catch (error) {
          if (error.code === `EEXIST`) {
            continue;
          } else {
            throw error;
          }
        }

        if (chmod != null) this.chmodSync(subPath, chmod);

        if (utimes != null) {
          this.utimesSync(subPath, utimes[0], utimes[1]);
        } else {
          const parentStat = this.statSync(this.pathUtils.dirname(subPath));
          this.utimesSync(subPath, parentStat.atime, parentStat.mtime);
        }
      }
    }
  }

  async copyPromise(destination, source, {
    baseFs = this,
    overwrite = true,
    stableSort = false,
    stableTime = false
  } = {}) {
    return await copyPromise(this, destination, baseFs, source, {
      overwrite,
      stableSort,
      stableTime
    });
  }

  copySync(destination, source, {
    baseFs = this,
    overwrite = true
  } = {}) {
    const stat = baseFs.lstatSync(source);
    const exists = this.existsSync(destination);

    if (stat.isDirectory()) {
      this.mkdirpSync(destination);
      const directoryListing = baseFs.readdirSync(source);

      for (const entry of directoryListing) {
        this.copySync(this.pathUtils.join(destination, entry), baseFs.pathUtils.join(source, entry), {
          baseFs,
          overwrite
        });
      }
    } else if (stat.isFile()) {
      if (!exists || overwrite) {
        if (exists) this.removeSync(destination);
        const content = baseFs.readFileSync(source);
        this.writeFileSync(destination, content);
      }
    } else if (stat.isSymbolicLink()) {
      if (!exists || overwrite) {
        if (exists) this.removeSync(destination);
        const target = baseFs.readlinkSync(source);
        this.symlinkSync(convertPath(this.pathUtils, target), destination);
      }
    } else {
      throw new Error(`Unsupported file type (file: ${source}, mode: 0o${stat.mode.toString(8).padStart(6, `0`)})`);
    }

    const mode = stat.mode & 0o777;
    this.chmodSync(destination, mode);
  }

  async changeFilePromise(p, content, opts = {}) {
    if (Buffer.isBuffer(content)) {
      return this.changeFileBufferPromise(p, content);
    } else {
      return this.changeFileTextPromise(p, content, opts);
    }
  }

  async changeFileBufferPromise(p, content) {
    let current = Buffer.alloc(0);

    try {
      current = await this.readFilePromise(p);
    } catch (error) {// ignore errors, no big deal
    }

    if (Buffer.compare(current, content) === 0) return;
    await this.writeFilePromise(p, content);
  }

  async changeFileTextPromise(p, content, {
    automaticNewlines
  } = {}) {
    let current = ``;

    try {
      current = await this.readFilePromise(p, `utf8`);
    } catch (error) {// ignore errors, no big deal
    }

    const normalizedContent = automaticNewlines ? normalizeLineEndings(current, content) : content;
    if (current === normalizedContent) return;
    await this.writeFilePromise(p, normalizedContent);
  }

  changeFileSync(p, content, opts = {}) {
    if (Buffer.isBuffer(content)) {
      return this.changeFileBufferSync(p, content);
    } else {
      return this.changeFileTextSync(p, content, opts);
    }
  }

  changeFileBufferSync(p, content) {
    let current = Buffer.alloc(0);

    try {
      current = this.readFileSync(p);
    } catch (error) {// ignore errors, no big deal
    }

    if (Buffer.compare(current, content) === 0) return;
    this.writeFileSync(p, content);
  }

  changeFileTextSync(p, content, {
    automaticNewlines = false
  } = {}) {
    let current = ``;

    try {
      current = this.readFileSync(p, `utf8`);
    } catch (error) {// ignore errors, no big deal
    }

    const normalizedContent = automaticNewlines ? normalizeLineEndings(current, content) : content;
    if (current === normalizedContent) return;
    this.writeFileSync(p, normalizedContent);
  }

  async movePromise(fromP, toP) {
    try {
      await this.renamePromise(fromP, toP);
    } catch (error) {
      if (error.code === `EXDEV`) {
        await this.copyPromise(toP, fromP);
        await this.removePromise(fromP);
      } else {
        throw error;
      }
    }
  }

  moveSync(fromP, toP) {
    try {
      this.renameSync(fromP, toP);
    } catch (error) {
      if (error.code === `EXDEV`) {
        this.copySync(toP, fromP);
        this.removeSync(fromP);
      } else {
        throw error;
      }
    }
  }

  async lockPromise(affectedPath, callback) {
    const lockPath = `${affectedPath}.flock`;
    const interval = 1000 / 60;
    const startTime = Date.now();
    let fd = null; // Even when we detect that a lock file exists, we still look inside to see
    // whether the pid that created it is still alive. It's not foolproof
    // (there are false positive), but there are no false negative and that's
    // all that matters in 99% of the cases.

    const isAlive = async () => {
      let pid;

      try {
        [pid] = await this.readJsonPromise(lockPath);
      } catch (error) {
        // If we can't read the file repeatedly, we assume the process was
        // aborted before even writing finishing writing the payload.
        return Date.now() - startTime < 500;
      }

      try {
        // "As a special case, a signal of 0 can be used to test for the
        // existence of a process" - so we check whether it's alive.
        process.kill(pid, 0);
        return true;
      } catch (error) {
        return false;
      }
    };

    while (fd === null) {
      try {
        fd = await this.openPromise(lockPath, `wx`);
      } catch (error) {
        if (error.code === `EEXIST`) {
          if (!(await isAlive())) {
            try {
              await this.unlinkPromise(lockPath);
              continue;
            } catch (error) {// No big deal if we can't remove it. Just fallback to wait for
              // it to be eventually released by its owner.
            }
          }

          if (Date.now() - startTime < 60 * 1000) {
            await new Promise(resolve => setTimeout(resolve, interval));
          } else {
            throw new Error(`Couldn't acquire a lock in a reasonable time (via ${lockPath})`);
          }
        } else {
          throw error;
        }
      }
    }

    await this.writePromise(fd, JSON.stringify([process.pid]));

    try {
      return await callback();
    } finally {
      try {
        // closePromise needs to come before unlinkPromise otherwise another process can attempt
        // to get the file handle after the unlink but before close resuling in
        // EPERM: operation not permitted, open
        await this.closePromise(fd);
        await this.unlinkPromise(lockPath);
      } catch (error) {// noop
      }
    }
  }

  async readJsonPromise(p) {
    const content = await this.readFilePromise(p, `utf8`);

    try {
      return JSON.parse(content);
    } catch (error) {
      error.message += ` (in ${p})`;
      throw error;
    }
  }

  readJsonSync(p) {
    const content = this.readFileSync(p, `utf8`);

    try {
      return JSON.parse(content);
    } catch (error) {
      error.message += ` (in ${p})`;
      throw error;
    }
  }

  async writeJsonPromise(p, data) {
    return await this.writeFilePromise(p, `${JSON.stringify(data, null, 2)}\n`);
  }

  writeJsonSync(p, data) {
    return this.writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`);
  }

  async preserveTimePromise(p, cb) {
    const stat = await this.lstatPromise(p);
    const result = await cb();
    if (typeof result !== `undefined`) p = result;

    if (this.lutimesPromise) {
      await this.lutimesPromise(p, stat.atime, stat.mtime);
    } else if (!stat.isSymbolicLink()) {
      await this.utimesPromise(p, stat.atime, stat.mtime);
    }
  }

  async preserveTimeSync(p, cb) {
    const stat = this.lstatSync(p);
    const result = cb();
    if (typeof result !== `undefined`) p = result;

    if (this.lutimesSync) {
      this.lutimesSync(p, stat.atime, stat.mtime);
    } else if (!stat.isSymbolicLink()) {
      this.utimesSync(p, stat.atime, stat.mtime);
    }
  }

}
FakeFS.DEFAULT_TIME = 315532800;
class BasePortableFakeFS extends FakeFS {
  constructor() {
    super(ppath);
  }

}

function getEndOfLine(content) {
  const matches = content.match(/\r?\n/g);
  if (matches === null) return external_os_namespaceObject.EOL;
  const crlf = matches.filter(nl => nl === `\r\n`).length;
  const lf = matches.length - crlf;
  return crlf > lf ? `\r\n` : `\n`;
}

function normalizeLineEndings(originalContent, newContent) {
  return newContent.replace(/\r?\n/g, getEndOfLine(originalContent));
}
// CONCATENATED MODULE: ../yarnpkg-fslib/sources/errors.ts
function makeError(code, message) {
  return Object.assign(new Error(`${code}: ${message}`), {
    code
  });
}

function EBUSY(message) {
  return makeError(`EBUSY`, message);
}
function ENOSYS(message, reason) {
  return makeError(`ENOSYS`, `${message}, ${reason}`);
}
function EINVAL(reason) {
  return makeError(`EINVAL`, `invalid argument, ${reason}`);
}
function EBADF(reason) {
  return makeError(`EBADF`, `bad file descriptor, ${reason}`);
}
function ENOENT(reason) {
  return makeError(`ENOENT`, `no such file or directory, ${reason}`);
}
function ENOTDIR(reason) {
  return makeError(`ENOTDIR`, `not a directory, ${reason}`);
}
function EISDIR(reason) {
  return makeError(`EISDIR`, `illegal operation on a directory, ${reason}`);
}
function EEXIST(reason) {
  return makeError(`EEXIST`, `file already exists, ${reason}`);
}
function EROFS(reason) {
  return makeError(`EROFS`, `read-only filesystem, ${reason}`);
}
function ENOTEMPTY(reason) {
  return makeError(`ENOTEMPTY`, `directory not empty, ${reason}`);
}
function EOPNOTSUPP(reason) {
  return makeError(`EOPNOTSUPP`, `operation not supported, ${reason}`);
} // ------------------------------------------------------------------------

function ERR_DIR_CLOSED() {
  return makeError(`ERR_DIR_CLOSED`, `Directory handle was closed`);
} // ------------------------------------------------------------------------

class LibzipError extends Error {
  constructor(message, code) {
    super(message);
    this.name = `Libzip Error`;
    this.code = code;
  }

}
// CONCATENATED MODULE: ../yarnpkg-fslib/sources/NodeFS.ts




class NodeFS extends BasePortableFakeFS {
  constructor(realFs = (external_fs_default())) {
    super();
    this.realFs = realFs; // @ts-expect-error

    if (typeof this.realFs.lutimes !== `undefined`) {
      this.lutimesPromise = this.lutimesPromiseImpl;
      this.lutimesSync = this.lutimesSyncImpl;
    }
  }

  getExtractHint() {
    return false;
  }

  getRealPath() {
    return PortablePath.root;
  }

  resolve(p) {
    return ppath.resolve(p);
  }

  async openPromise(p, flags, mode) {
    return await new Promise((resolve, reject) => {
      this.realFs.open(npath.fromPortablePath(p), flags, mode, this.makeCallback(resolve, reject));
    });
  }

  openSync(p, flags, mode) {
    return this.realFs.openSync(npath.fromPortablePath(p), flags, mode);
  }

  async opendirPromise(p, opts) {
    return await new Promise((resolve, reject) => {
      if (typeof opts !== `undefined`) {
        this.realFs.opendir(npath.fromPortablePath(p), opts, this.makeCallback(resolve, reject));
      } else {
        this.realFs.opendir(npath.fromPortablePath(p), this.makeCallback(resolve, reject));
      }
    }).then(dir => {
      return Object.defineProperty(dir, `path`, {
        value: p,
        configurable: true,
        writable: true
      });
    });
  }

  opendirSync(p, opts) {
    const dir = typeof opts !== `undefined` ? this.realFs.opendirSync(npath.fromPortablePath(p), opts) : this.realFs.opendirSync(npath.fromPortablePath(p));
    return Object.defineProperty(dir, `path`, {
      value: p,
      configurable: true,
      writable: true
    });
  }

  async readPromise(fd, buffer, offset = 0, length = 0, position = -1) {
    return await new Promise((resolve, reject) => {
      this.realFs.read(fd, buffer, offset, length, position, (error, bytesRead) => {
        if (error) {
          reject(error);
        } else {
          resolve(bytesRead);
        }
      });
    });
  }

  readSync(fd, buffer, offset, length, position) {
    return this.realFs.readSync(fd, buffer, offset, length, position);
  }

  async writePromise(fd, buffer, offset, length, position) {
    return await new Promise((resolve, reject) => {
      if (typeof buffer === `string`) {
        return this.realFs.write(fd, buffer, offset, this.makeCallback(resolve, reject));
      } else {
        return this.realFs.write(fd, buffer, offset, length, position, this.makeCallback(resolve, reject));
      }
    });
  }

  writeSync(fd, buffer, offset, length, position) {
    if (typeof buffer === `string`) {
      return this.realFs.writeSync(fd, buffer, offset);
    } else {
      return this.realFs.writeSync(fd, buffer, offset, length, position);
    }
  }

  async closePromise(fd) {
    await new Promise((resolve, reject) => {
      this.realFs.close(fd, this.makeCallback(resolve, reject));
    });
  }

  closeSync(fd) {
    this.realFs.closeSync(fd);
  }

  createReadStream(p, opts) {
    const realPath = p !== null ? npath.fromPortablePath(p) : p;
    return this.realFs.createReadStream(realPath, opts);
  }

  createWriteStream(p, opts) {
    const realPath = p !== null ? npath.fromPortablePath(p) : p;
    return this.realFs.createWriteStream(realPath, opts);
  }

  async realpathPromise(p) {
    return await new Promise((resolve, reject) => {
      this.realFs.realpath(npath.fromPortablePath(p), {}, this.makeCallback(resolve, reject));
    }).then(path => {
      return npath.toPortablePath(path);
    });
  }

  realpathSync(p) {
    return npath.toPortablePath(this.realFs.realpathSync(npath.fromPortablePath(p), {}));
  }

  async existsPromise(p) {
    return await new Promise(resolve => {
      this.realFs.exists(npath.fromPortablePath(p), resolve);
    });
  }

  accessSync(p, mode) {
    return this.realFs.accessSync(npath.fromPortablePath(p), mode);
  }

  async accessPromise(p, mode) {
    return await new Promise((resolve, reject) => {
      this.realFs.access(npath.fromPortablePath(p), mode, this.makeCallback(resolve, reject));
    });
  }

  existsSync(p) {
    return this.realFs.existsSync(npath.fromPortablePath(p));
  }

  async statPromise(p) {
    return await new Promise((resolve, reject) => {
      this.realFs.stat(npath.fromPortablePath(p), this.makeCallback(resolve, reject));
    });
  }

  statSync(p) {
    return this.realFs.statSync(npath.fromPortablePath(p));
  }

  async lstatPromise(p) {
    return await new Promise((resolve, reject) => {
      this.realFs.lstat(npath.fromPortablePath(p), this.makeCallback(resolve, reject));
    });
  }

  lstatSync(p) {
    return this.realFs.lstatSync(npath.fromPortablePath(p));
  }

  async chmodPromise(p, mask) {
    return await new Promise((resolve, reject) => {
      this.realFs.chmod(npath.fromPortablePath(p), mask, this.makeCallback(resolve, reject));
    });
  }

  chmodSync(p, mask) {
    return this.realFs.chmodSync(npath.fromPortablePath(p), mask);
  }

  async chownPromise(p, uid, gid) {
    return await new Promise((resolve, reject) => {
      this.realFs.chown(npath.fromPortablePath(p), uid, gid, this.makeCallback(resolve, reject));
    });
  }

  chownSync(p, uid, gid) {
    return this.realFs.chownSync(npath.fromPortablePath(p), uid, gid);
  }

  async renamePromise(oldP, newP) {
    return await new Promise((resolve, reject) => {
      this.realFs.rename(npath.fromPortablePath(oldP), npath.fromPortablePath(newP), this.makeCallback(resolve, reject));
    });
  }

  renameSync(oldP, newP) {
    return this.realFs.renameSync(npath.fromPortablePath(oldP), npath.fromPortablePath(newP));
  }

  async copyFilePromise(sourceP, destP, flags = 0) {
    return await new Promise((resolve, reject) => {
      this.realFs.copyFile(npath.fromPortablePath(sourceP), npath.fromPortablePath(destP), flags, this.makeCallback(resolve, reject));
    });
  }

  copyFileSync(sourceP, destP, flags = 0) {
    return this.realFs.copyFileSync(npath.fromPortablePath(sourceP), npath.fromPortablePath(destP), flags);
  }

  async appendFilePromise(p, content, opts) {
    return await new Promise((resolve, reject) => {
      const fsNativePath = typeof p === `string` ? npath.fromPortablePath(p) : p;

      if (opts) {
        this.realFs.appendFile(fsNativePath, content, opts, this.makeCallback(resolve, reject));
      } else {
        this.realFs.appendFile(fsNativePath, content, this.makeCallback(resolve, reject));
      }
    });
  }

  appendFileSync(p, content, opts) {
    const fsNativePath = typeof p === `string` ? npath.fromPortablePath(p) : p;

    if (opts) {
      this.realFs.appendFileSync(fsNativePath, content, opts);
    } else {
      this.realFs.appendFileSync(fsNativePath, content);
    }
  }

  async writeFilePromise(p, content, opts) {
    return await new Promise((resolve, reject) => {
      const fsNativePath = typeof p === `string` ? npath.fromPortablePath(p) : p;

      if (opts) {
        this.realFs.writeFile(fsNativePath, content, opts, this.makeCallback(resolve, reject));
      } else {
        this.realFs.writeFile(fsNativePath, content, this.makeCallback(resolve, reject));
      }
    });
  }

  writeFileSync(p, content, opts) {
    const fsNativePath = typeof p === `string` ? npath.fromPortablePath(p) : p;

    if (opts) {
      this.realFs.writeFileSync(fsNativePath, content, opts);
    } else {
      this.realFs.writeFileSync(fsNativePath, content);
    }
  }

  async unlinkPromise(p) {
    return await new Promise((resolve, reject) => {
      this.realFs.unlink(npath.fromPortablePath(p), this.makeCallback(resolve, reject));
    });
  }

  unlinkSync(p) {
    return this.realFs.unlinkSync(npath.fromPortablePath(p));
  }

  async utimesPromise(p, atime, mtime) {
    return await new Promise((resolve, reject) => {
      this.realFs.utimes(npath.fromPortablePath(p), atime, mtime, this.makeCallback(resolve, reject));
    });
  }

  utimesSync(p, atime, mtime) {
    this.realFs.utimesSync(npath.fromPortablePath(p), atime, mtime);
  }

  async lutimesPromiseImpl(p, atime, mtime) {
    // @ts-expect-error: Not yet in DefinitelyTyped
    const lutimes = this.realFs.lutimes;
    if (typeof lutimes === `undefined`) throw ENOSYS(`unavailable Node binding`, `lutimes '${p}'`);
    return await new Promise((resolve, reject) => {
      lutimes.call(this.realFs, npath.fromPortablePath(p), atime, mtime, this.makeCallback(resolve, reject));
    });
  }

  lutimesSyncImpl(p, atime, mtime) {
    // @ts-expect-error: Not yet in DefinitelyTyped
    const lutimesSync = this.realFs.lutimesSync;
    if (typeof lutimesSync === `undefined`) throw ENOSYS(`unavailable Node binding`, `lutimes '${p}'`);
    lutimesSync.call(this.realFs, npath.fromPortablePath(p), atime, mtime);
  }

  async mkdirPromise(p, opts) {
    return await new Promise((resolve, reject) => {
      this.realFs.mkdir(npath.fromPortablePath(p), opts, this.makeCallback(resolve, reject));
    });
  }

  mkdirSync(p, opts) {
    return this.realFs.mkdirSync(npath.fromPortablePath(p), opts);
  }

  async rmdirPromise(p, opts) {
    return await new Promise((resolve, reject) => {
      // TODO: always pass opts when min node version is 12.10+
      if (opts) {
        this.realFs.rmdir(npath.fromPortablePath(p), opts, this.makeCallback(resolve, reject));
      } else {
        this.realFs.rmdir(npath.fromPortablePath(p), this.makeCallback(resolve, reject));
      }
    });
  }

  rmdirSync(p, opts) {
    return this.realFs.rmdirSync(npath.fromPortablePath(p), opts);
  }

  async linkPromise(existingP, newP) {
    return await new Promise((resolve, reject) => {
      this.realFs.link(npath.fromPortablePath(existingP), npath.fromPortablePath(newP), this.makeCallback(resolve, reject));
    });
  }

  linkSync(existingP, newP) {
    return this.realFs.linkSync(npath.fromPortablePath(existingP), npath.fromPortablePath(newP));
  }

  async symlinkPromise(target, p, type) {
    const symlinkType = type || (target.endsWith(`/`) ? `dir` : `file`);
    return await new Promise((resolve, reject) => {
      this.realFs.symlink(npath.fromPortablePath(target.replace(/\/+$/, ``)), npath.fromPortablePath(p), symlinkType, this.makeCallback(resolve, reject));
    });
  }

  symlinkSync(target, p, type) {
    const symlinkType = type || (target.endsWith(`/`) ? `dir` : `file`);
    return this.realFs.symlinkSync(npath.fromPortablePath(target.replace(/\/+$/, ``)), npath.fromPortablePath(p), symlinkType);
  }

  async readFilePromise(p, encoding) {
    return await new Promise((resolve, reject) => {
      const fsNativePath = typeof p === `string` ? npath.fromPortablePath(p) : p;
      this.realFs.readFile(fsNativePath, encoding, this.makeCallback(resolve, reject));
    });
  }

  readFileSync(p, encoding) {
    const fsNativePath = typeof p === `string` ? npath.fromPortablePath(p) : p;
    return this.realFs.readFileSync(fsNativePath, encoding);
  }

  async readdirPromise(p, {
    withFileTypes
  } = {}) {
    return await new Promise((resolve, reject) => {
      if (withFileTypes) {
        this.realFs.readdir(npath.fromPortablePath(p), {
          withFileTypes: true
        }, this.makeCallback(resolve, reject));
      } else {
        this.realFs.readdir(npath.fromPortablePath(p), this.makeCallback(value => resolve(value), reject));
      }
    });
  }

  readdirSync(p, {
    withFileTypes
  } = {}) {
    if (withFileTypes) {
      return this.realFs.readdirSync(npath.fromPortablePath(p), {
        withFileTypes: true
      });
    } else {
      return this.realFs.readdirSync(npath.fromPortablePath(p));
    }
  }

  async readlinkPromise(p) {
    return await new Promise((resolve, reject) => {
      this.realFs.readlink(npath.fromPortablePath(p), this.makeCallback(resolve, reject));
    }).then(path => {
      return npath.toPortablePath(path);
    });
  }

  readlinkSync(p) {
    return npath.toPortablePath(this.realFs.readlinkSync(npath.fromPortablePath(p)));
  }

  async truncatePromise(p, len) {
    return await new Promise((resolve, reject) => {
      this.realFs.truncate(npath.fromPortablePath(p), len, this.makeCallback(resolve, reject));
    });
  }

  truncateSync(p, len) {
    return this.realFs.truncateSync(npath.fromPortablePath(p), len);
  }

  watch(p, a, b) {
    return this.realFs.watch(npath.fromPortablePath(p), // @ts-expect-error
    a, b);
  }

  watchFile(p, a, b) {
    return this.realFs.watchFile(npath.fromPortablePath(p), // @ts-expect-error
    a, b);
  }

  unwatchFile(p, cb) {
    return this.realFs.unwatchFile(npath.fromPortablePath(p), cb);
  }

  makeCallback(resolve, reject) {
    return (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    };
  }

}
// CONCATENATED MODULE: ../yarnpkg-fslib/sources/ProxiedFS.ts

class ProxiedFS extends FakeFS {
  getExtractHint(hints) {
    return this.baseFs.getExtractHint(hints);
  }

  resolve(path) {
    return this.mapFromBase(this.baseFs.resolve(this.mapToBase(path)));
  }

  getRealPath() {
    return this.mapFromBase(this.baseFs.getRealPath());
  }

  async openPromise(p, flags, mode) {
    return this.baseFs.openPromise(this.mapToBase(p), flags, mode);
  }

  openSync(p, flags, mode) {
    return this.baseFs.openSync(this.mapToBase(p), flags, mode);
  }

  async opendirPromise(p, opts) {
    return Object.assign(await this.baseFs.opendirPromise(this.mapToBase(p), opts), {
      path: p
    });
  }

  opendirSync(p, opts) {
    return Object.assign(this.baseFs.opendirSync(this.mapToBase(p), opts), {
      path: p
    });
  }

  async readPromise(fd, buffer, offset, length, position) {
    return await this.baseFs.readPromise(fd, buffer, offset, length, position);
  }

  readSync(fd, buffer, offset, length, position) {
    return this.baseFs.readSync(fd, buffer, offset, length, position);
  }

  async writePromise(fd, buffer, offset, length, position) {
    if (typeof buffer === `string`) {
      return await this.baseFs.writePromise(fd, buffer, offset);
    } else {
      return await this.baseFs.writePromise(fd, buffer, offset, length, position);
    }
  }

  writeSync(fd, buffer, offset, length, position) {
    if (typeof buffer === `string`) {
      return this.baseFs.writeSync(fd, buffer, offset);
    } else {
      return this.baseFs.writeSync(fd, buffer, offset, length, position);
    }
  }

  async closePromise(fd) {
    return this.baseFs.closePromise(fd);
  }

  closeSync(fd) {
    this.baseFs.closeSync(fd);
  }

  createReadStream(p, opts) {
    return this.baseFs.createReadStream(p !== null ? this.mapToBase(p) : p, opts);
  }

  createWriteStream(p, opts) {
    return this.baseFs.createWriteStream(p !== null ? this.mapToBase(p) : p, opts);
  }

  async realpathPromise(p) {
    return this.mapFromBase(await this.baseFs.realpathPromise(this.mapToBase(p)));
  }

  realpathSync(p) {
    return this.mapFromBase(this.baseFs.realpathSync(this.mapToBase(p)));
  }

  async existsPromise(p) {
    return this.baseFs.existsPromise(this.mapToBase(p));
  }

  existsSync(p) {
    return this.baseFs.existsSync(this.mapToBase(p));
  }

  accessSync(p, mode) {
    return this.baseFs.accessSync(this.mapToBase(p), mode);
  }

  async accessPromise(p, mode) {
    return this.baseFs.accessPromise(this.mapToBase(p), mode);
  }

  async statPromise(p) {
    return this.baseFs.statPromise(this.mapToBase(p));
  }

  statSync(p) {
    return this.baseFs.statSync(this.mapToBase(p));
  }

  async lstatPromise(p) {
    return this.baseFs.lstatPromise(this.mapToBase(p));
  }

  lstatSync(p) {
    return this.baseFs.lstatSync(this.mapToBase(p));
  }

  async chmodPromise(p, mask) {
    return this.baseFs.chmodPromise(this.mapToBase(p), mask);
  }

  chmodSync(p, mask) {
    return this.baseFs.chmodSync(this.mapToBase(p), mask);
  }

  async chownPromise(p, uid, gid) {
    return this.baseFs.chownPromise(this.mapToBase(p), uid, gid);
  }

  chownSync(p, uid, gid) {
    return this.baseFs.chownSync(this.mapToBase(p), uid, gid);
  }

  async renamePromise(oldP, newP) {
    return this.baseFs.renamePromise(this.mapToBase(oldP), this.mapToBase(newP));
  }

  renameSync(oldP, newP) {
    return this.baseFs.renameSync(this.mapToBase(oldP), this.mapToBase(newP));
  }

  async copyFilePromise(sourceP, destP, flags = 0) {
    return this.baseFs.copyFilePromise(this.mapToBase(sourceP), this.mapToBase(destP), flags);
  }

  copyFileSync(sourceP, destP, flags = 0) {
    return this.baseFs.copyFileSync(this.mapToBase(sourceP), this.mapToBase(destP), flags);
  }

  async appendFilePromise(p, content, opts) {
    return this.baseFs.appendFilePromise(this.fsMapToBase(p), content, opts);
  }

  appendFileSync(p, content, opts) {
    return this.baseFs.appendFileSync(this.fsMapToBase(p), content, opts);
  }

  async writeFilePromise(p, content, opts) {
    return this.baseFs.writeFilePromise(this.fsMapToBase(p), content, opts);
  }

  writeFileSync(p, content, opts) {
    return this.baseFs.writeFileSync(this.fsMapToBase(p), content, opts);
  }

  async unlinkPromise(p) {
    return this.baseFs.unlinkPromise(this.mapToBase(p));
  }

  unlinkSync(p) {
    return this.baseFs.unlinkSync(this.mapToBase(p));
  }

  async utimesPromise(p, atime, mtime) {
    return this.baseFs.utimesPromise(this.mapToBase(p), atime, mtime);
  }

  utimesSync(p, atime, mtime) {
    return this.baseFs.utimesSync(this.mapToBase(p), atime, mtime);
  }

  async mkdirPromise(p, opts) {
    return this.baseFs.mkdirPromise(this.mapToBase(p), opts);
  }

  mkdirSync(p, opts) {
    return this.baseFs.mkdirSync(this.mapToBase(p), opts);
  }

  async rmdirPromise(p, opts) {
    return this.baseFs.rmdirPromise(this.mapToBase(p), opts);
  }

  rmdirSync(p, opts) {
    return this.baseFs.rmdirSync(this.mapToBase(p), opts);
  }

  async linkPromise(existingP, newP) {
    return this.baseFs.linkPromise(this.mapToBase(existingP), this.mapToBase(newP));
  }

  linkSync(existingP, newP) {
    return this.baseFs.linkSync(this.mapToBase(existingP), this.mapToBase(newP));
  }

  async symlinkPromise(target, p, type) {
    return this.baseFs.symlinkPromise(this.mapToBase(target), this.mapToBase(p), type);
  }

  symlinkSync(target, p, type) {
    return this.baseFs.symlinkSync(this.mapToBase(target), this.mapToBase(p), type);
  }

  async readFilePromise(p, encoding) {
    // This weird condition is required to tell TypeScript that the signatures are proper (otherwise it thinks that only the generic one is covered)
    if (encoding === `utf8`) {
      return this.baseFs.readFilePromise(this.fsMapToBase(p), encoding);
    } else {
      return this.baseFs.readFilePromise(this.fsMapToBase(p), encoding);
    }
  }

  readFileSync(p, encoding) {
    // This weird condition is required to tell TypeScript that the signatures are proper (otherwise it thinks that only the generic one is covered)
    if (encoding === `utf8`) {
      return this.baseFs.readFileSync(this.fsMapToBase(p), encoding);
    } else {
      return this.baseFs.readFileSync(this.fsMapToBase(p), encoding);
    }
  }

  async readdirPromise(p, {
    withFileTypes
  } = {}) {
    return this.baseFs.readdirPromise(this.mapToBase(p), {
      withFileTypes: withFileTypes
    });
  }

  readdirSync(p, {
    withFileTypes
  } = {}) {
    return this.baseFs.readdirSync(this.mapToBase(p), {
      withFileTypes: withFileTypes
    });
  }

  async readlinkPromise(p) {
    return this.mapFromBase(await this.baseFs.readlinkPromise(this.mapToBase(p)));
  }

  readlinkSync(p) {
    return this.mapFromBase(this.baseFs.readlinkSync(this.mapToBase(p)));
  }

  async truncatePromise(p, len) {
    return this.baseFs.truncatePromise(this.mapToBase(p), len);
  }

  truncateSync(p, len) {
    return this.baseFs.truncateSync(this.mapToBase(p), len);
  }

  watch(p, a, b) {
    return this.baseFs.watch(this.mapToBase(p), // @ts-expect-error
    a, b);
  }

  watchFile(p, a, b) {
    return this.baseFs.watchFile(this.mapToBase(p), // @ts-expect-error
    a, b);
  }

  unwatchFile(p, cb) {
    return this.baseFs.unwatchFile(this.mapToBase(p), cb);
  }

  fsMapToBase(p) {
    if (typeof p === `number`) {
      return p;
    } else {
      return this.mapToBase(p);
    }
  }

}
// CONCATENATED MODULE: ../yarnpkg-fslib/sources/VirtualFS.ts



const NUMBER_REGEXP = /^[0-9]+$/; // $0: full path
// $1: virtual folder
// $2: virtual segment
// $3: hash
// $4: depth
// $5: subpath

const VIRTUAL_REGEXP = /^(\/(?:[^/]+\/)*?\$\$virtual)((?:\/((?:[^/]+-)?[a-f0-9]+)(?:\/([^/]+))?)?((?:\/.*)?))$/;
const VALID_COMPONENT = /^([^/]+-)?[a-f0-9]+$/;
class VirtualFS extends ProxiedFS {
  constructor({
    baseFs = new NodeFS()
  } = {}) {
    super(ppath);
    this.baseFs = baseFs;
  }

  static makeVirtualPath(base, component, to) {
    if (ppath.basename(base) !== `$$virtual`) throw new Error(`Assertion failed: Virtual folders must be named "$$virtual"`);
    if (!ppath.basename(component).match(VALID_COMPONENT)) throw new Error(`Assertion failed: Virtual components must be ended by an hexadecimal hash`); // Obtains the relative distance between the virtual path and its actual target

    const target = ppath.relative(ppath.dirname(base), to);
    const segments = target.split(`/`); // Counts how many levels we need to go back to start applying the rest of the path

    let depth = 0;

    while (depth < segments.length && segments[depth] === `..`) depth += 1;

    const finalSegments = segments.slice(depth);
    const fullVirtualPath = ppath.join(base, component, String(depth), ...finalSegments);
    return fullVirtualPath;
  }

  static resolveVirtual(p) {
    const match = p.match(VIRTUAL_REGEXP);
    if (!match || !match[3] && match[5]) return p;
    const target = ppath.dirname(match[1]);
    if (!match[3] || !match[4]) return target;
    const isnum = NUMBER_REGEXP.test(match[4]);
    if (!isnum) return p;
    const depth = Number(match[4]);
    const backstep = `../`.repeat(depth);
    const subpath = match[5] || `.`;
    return VirtualFS.resolveVirtual(ppath.join(target, backstep, subpath));
  }

  getExtractHint(hints) {
    return this.baseFs.getExtractHint(hints);
  }

  getRealPath() {
    return this.baseFs.getRealPath();
  }

  realpathSync(p) {
    const match = p.match(VIRTUAL_REGEXP);
    if (!match) return this.baseFs.realpathSync(p);
    if (!match[5]) return p;
    const realpath = this.baseFs.realpathSync(this.mapToBase(p));
    return VirtualFS.makeVirtualPath(match[1], match[3], realpath);
  }

  async realpathPromise(p) {
    const match = p.match(VIRTUAL_REGEXP);
    if (!match) return await this.baseFs.realpathPromise(p);
    if (!match[5]) return p;
    const realpath = await this.baseFs.realpathPromise(this.mapToBase(p));
    return VirtualFS.makeVirtualPath(match[1], match[3], realpath);
  }

  mapToBase(p) {
    return VirtualFS.resolveVirtual(p);
  }

  mapFromBase(p) {
    return p;
  }

}
// CONCATENATED MODULE: external "module"
const external_module_namespaceObject = require("module");;
// CONCATENATED MODULE: ./sources/loader/internalTools.ts

var ErrorCode;

(function (ErrorCode) {
  ErrorCode["API_ERROR"] = "API_ERROR";
  ErrorCode["BLACKLISTED"] = "BLACKLISTED";
  ErrorCode["BUILTIN_NODE_RESOLUTION_FAILED"] = "BUILTIN_NODE_RESOLUTION_FAILED";
  ErrorCode["MISSING_DEPENDENCY"] = "MISSING_DEPENDENCY";
  ErrorCode["MISSING_PEER_DEPENDENCY"] = "MISSING_PEER_DEPENDENCY";
  ErrorCode["QUALIFIED_PATH_RESOLUTION_FAILED"] = "QUALIFIED_PATH_RESOLUTION_FAILED";
  ErrorCode["INTERNAL"] = "INTERNAL";
  ErrorCode["UNDECLARED_DEPENDENCY"] = "UNDECLARED_DEPENDENCY";
  ErrorCode["UNSUPPORTED"] = "UNSUPPORTED";
})(ErrorCode || (ErrorCode = {})); // Some errors are exposed as MODULE_NOT_FOUND for compatibility with packages
// that expect this umbrella error when the resolution fails


const MODULE_NOT_FOUND_ERRORS = new Set([ErrorCode.BLACKLISTED, ErrorCode.BUILTIN_NODE_RESOLUTION_FAILED, ErrorCode.MISSING_DEPENDENCY, ErrorCode.MISSING_PEER_DEPENDENCY, ErrorCode.QUALIFIED_PATH_RESOLUTION_FAILED, ErrorCode.UNDECLARED_DEPENDENCY]);
/**
 * Simple helper function that assign an error code to an error, so that it can more easily be caught and used
 * by third-parties.
 */

function internalTools_makeError(pnpCode, message, data = {}) {
  const code = MODULE_NOT_FOUND_ERRORS.has(pnpCode) ? `MODULE_NOT_FOUND` : pnpCode;
  const propertySpec = {
    configurable: true,
    writable: true,
    enumerable: false
  };
  return Object.defineProperties(new Error(message), {
    code: { ...propertySpec,
      value: code
    },
    pnpCode: { ...propertySpec,
      value: pnpCode
    },
    data: { ...propertySpec,
      value: data
    }
  });
}
/**
 * Returns the module that should be used to resolve require calls. It's usually the direct parent, except if we're
 * inside an eval expression.
 */

function getIssuerModule(parent) {
  let issuer = parent;

  while (issuer && (issuer.id === `[eval]` || issuer.id === `<repl>` || !issuer.filename)) issuer = issuer.parent;

  return issuer || null;
}
function getPathForDisplay(p) {
  return npath.normalize(npath.fromPortablePath(p));
}
// CONCATENATED MODULE: ./sources/loader/makeApi.ts




function makeApi(runtimeState, opts) {
  const alwaysWarnOnFallback = Number(process.env.PNP_ALWAYS_WARN_ON_FALLBACK) > 0;
  const debugLevel = Number(process.env.PNP_DEBUG_LEVEL); // @ts-expect-error

  const builtinModules = new Set(external_module_namespaceObject.Module.builtinModules || Object.keys(process.binding(`natives`))); // Splits a require request into its components, or return null if the request is a file path

  const pathRegExp = /^(?![a-zA-Z]:[\\/]|\\\\|\.{0,2}(?:\/|$))((?:@[^/]+\/)?[^/]+)\/*(.*|)$/; // Matches if the path starts with a valid path qualifier (./, ../, /)
  // eslint-disable-next-line no-unused-vars

  const isStrictRegExp = /^(\/|\.{1,2}(\/|$))/; // Matches if the path must point to a directory (ie ends with /)

  const isDirRegExp = /\/$/; // We only instantiate one of those so that we can use strict-equal comparisons

  const topLevelLocator = {
    name: null,
    reference: null
  }; // Used for compatibility purposes - cf setupCompatibilityLayer

  const fallbackLocators = []; // To avoid emitting the same warning multiple times

  const emittedWarnings = new Set();
  if (runtimeState.enableTopLevelFallback === true) fallbackLocators.push(topLevelLocator);

  if (opts.compatibilityMode !== false) {
    // ESLint currently doesn't have any portable way for shared configs to
    // specify their own plugins that should be used (cf issue #10125). This
    // will likely get fixed at some point but it'll take time, so in the
    // meantime we'll just add additional fallback entries for common shared
    // configs.
    // Similarly, Gatsby generates files within the `public` folder located
    // within the project, but doesn't pre-resolve the `require` calls to use
    // its own dependencies. Meaning that when PnP see a file from the `public`
    // folder making a require, it thinks that your project forgot to list one
    // of your dependencies.
    for (const name of [`react-scripts`, `gatsby`]) {
      const packageStore = runtimeState.packageRegistry.get(name);

      if (packageStore) {
        for (const reference of packageStore.keys()) {
          if (reference === null) {
            throw new Error(`Assertion failed: This reference shouldn't be null`);
          } else {
            fallbackLocators.push({
              name,
              reference
            });
          }
        }
      }
    }
  }
  /**
   * The setup code will be injected here. The tables listed below are guaranteed to be filled after the call to
   * the $$DYNAMICALLY_GENERATED_CODE function.
   */


  const {
    ignorePattern,
    packageRegistry,
    packageLocatorsByLocations,
    packageLocationLengths
  } = runtimeState;
  /**
   * Allows to print useful logs just be setting a value in the environment
   */

  function makeLogEntry(name, args) {
    return {
      fn: name,
      args,
      error: null,
      result: null
    };
  }

  function maybeLog(name, fn) {
    if (opts.allowDebug === false) return fn;

    if (Number.isFinite(debugLevel)) {
      if (debugLevel >= 2) {
        return (...args) => {
          const logEntry = makeLogEntry(name, args);

          try {
            return logEntry.result = fn(...args);
          } catch (error) {
            throw logEntry.error = error;
          } finally {
            console.trace(logEntry);
          }
        };
      } else if (debugLevel >= 1) {
        return (...args) => {
          try {
            return fn(...args);
          } catch (error) {
            const logEntry = makeLogEntry(name, args);
            logEntry.error = error;
            console.trace(logEntry);
            throw error;
          }
        };
      }
    }

    return fn;
  }
  /**
   * Returns information about a package in a safe way (will throw if they cannot be retrieved)
   */


  function getPackageInformationSafe(packageLocator) {
    const packageInformation = getPackageInformation(packageLocator);

    if (!packageInformation) {
      throw internalTools_makeError(ErrorCode.INTERNAL, `Couldn't find a matching entry in the dependency tree for the specified parent (this is probably an internal error)`);
    }

    return packageInformation;
  }
  /**
   * Returns whether the specified locator is a dependency tree root (in which case it's part of the project) or not
   */


  function isDependencyTreeRoot(packageLocator) {
    if (packageLocator.name === null) return true;

    for (const dependencyTreeRoot of runtimeState.dependencyTreeRoots) if (dependencyTreeRoot.name === packageLocator.name && dependencyTreeRoot.reference === packageLocator.reference) return true;

    return false;
  }
  /**
   * Implements the node resolution for folder access and extension selection
   */


  function applyNodeExtensionResolution(unqualifiedPath, candidates, {
    extensions
  }) {
    let stat;

    try {
      candidates.push(unqualifiedPath);
      stat = opts.fakeFs.statSync(unqualifiedPath);
    } catch (error) {} // If the file exists and is a file, we can stop right there


    if (stat && !stat.isDirectory()) return opts.fakeFs.realpathSync(unqualifiedPath); // If the file is a directory, we must check if it contains a package.json with a "main" entry

    if (stat && stat.isDirectory()) {
      let pkgJson;

      try {
        pkgJson = JSON.parse(opts.fakeFs.readFileSync(ppath.join(unqualifiedPath, `package.json`), `utf8`));
      } catch (error) {}

      let nextUnqualifiedPath;
      if (pkgJson && pkgJson.main) nextUnqualifiedPath = ppath.resolve(unqualifiedPath, pkgJson.main); // If the "main" field changed the path, we start again from this new location

      if (nextUnqualifiedPath && nextUnqualifiedPath !== unqualifiedPath) {
        const resolution = applyNodeExtensionResolution(nextUnqualifiedPath, candidates, {
          extensions
        });

        if (resolution !== null) {
          return resolution;
        }
      }
    } // Otherwise we check if we find a file that match one of the supported extensions


    for (let i = 0, length = extensions.length; i < length; i++) {
      const candidateFile = `${unqualifiedPath}${extensions[i]}`;
      candidates.push(candidateFile);

      if (opts.fakeFs.existsSync(candidateFile)) {
        return candidateFile;
      }
    } // Otherwise, we check if the path is a folder - in such a case, we try to use its index


    if (stat && stat.isDirectory()) {
      for (let i = 0, length = extensions.length; i < length; i++) {
        const candidateFile = ppath.format({
          dir: unqualifiedPath,
          name: `index`,
          ext: extensions[i]
        });
        candidates.push(candidateFile);

        if (opts.fakeFs.existsSync(candidateFile)) {
          return candidateFile;
        }
      }
    } // Otherwise there's nothing else we can do :(


    return null;
  }
  /**
   * This function creates fake modules that can be used with the _resolveFilename function.
   * Ideally it would be nice to be able to avoid this, since it causes useless allocations
   * and cannot be cached efficiently (we recompute the nodeModulePaths every time).
   *
   * Fortunately, this should only affect the fallback, and there hopefully shouldn't have a
   * lot of them.
   */


  function makeFakeModule(path) {
    // @ts-expect-error
    const fakeModule = new external_module_namespaceObject.Module(path, null);
    fakeModule.filename = path;
    fakeModule.paths = external_module_namespaceObject.Module._nodeModulePaths(path);
    return fakeModule;
  }
  /**
   * Normalize path to posix format.
   */


  function normalizePath(p) {
    return npath.toPortablePath(p);
  }
  /**
   * Forward the resolution to the next resolver (usually the native one)
   */


  function callNativeResolution(request, issuer) {
    if (issuer.endsWith(`/`)) issuer = ppath.join(issuer, `internal.js`); // Since we would need to create a fake module anyway (to call _resolveLookupPath that
    // would give us the paths to give to _resolveFilename), we can as well not use
    // the {paths} option at all, since it internally makes _resolveFilename create another
    // fake module anyway.

    return external_module_namespaceObject.Module._resolveFilename(npath.fromPortablePath(request), makeFakeModule(npath.fromPortablePath(issuer)), false, {
      plugnplay: false
    });
  }
  /**
   *
   */


  function isPathIgnored(path) {
    if (ignorePattern === null) return false;
    const subPath = ppath.contains(runtimeState.basePath, path);
    if (subPath === null) return false;

    if (ignorePattern.test(subPath.replace(/\/$/, ``))) {
      return true;
    } else {
      return false;
    }
  }
  /**
   * This key indicates which version of the standard is implemented by this resolver. The `std` key is the
   * Plug'n'Play standard, and any other key are third-party extensions. Third-party extensions are not allowed
   * to override the standard, and can only offer new methods.
   *
   * If a new version of the Plug'n'Play standard is released and some extensions conflict with newly added
   * functions, they'll just have to fix the conflicts and bump their own version number.
   */


  const VERSIONS = {
    std: 3,
    resolveVirtual: 1,
    getAllLocators: 1
  };
  /**
   * We export a special symbol for easy access to the top level locator.
   */

  const topLevel = topLevelLocator;
  /**
   * Gets the package information for a given locator. Returns null if they cannot be retrieved.
   */

  function getPackageInformation({
    name,
    reference
  }) {
    const packageInformationStore = packageRegistry.get(name);
    if (!packageInformationStore) return null;
    const packageInformation = packageInformationStore.get(reference);
    if (!packageInformation) return null;
    return packageInformation;
  }
  /**
   * Find all packages that depend on the specified one.
   *
   * Note: This is a private function; we expect consumers to implement it
   * themselves. We keep it that way because this implementation isn't
   * optimized at all, since we only need it when printing errors.
   */


  function findPackageDependents({
    name,
    reference
  }) {
    const dependents = [];

    for (const [dependentName, packageInformationStore] of packageRegistry) {
      if (dependentName === null) continue;

      for (const [dependentReference, packageInformation] of packageInformationStore) {
        if (dependentReference === null) continue;
        const dependencyReference = packageInformation.packageDependencies.get(name);
        if (dependencyReference !== reference) continue; // Don't forget that all packages depend on themselves

        if (dependentName === name && dependentReference === reference) continue;
        dependents.push({
          name: dependentName,
          reference: dependentReference
        });
      }
    }

    return dependents;
  }
  /**
   * Find all packages that broke the peer dependency on X, starting from Y.
   *
   * Note: This is a private function; we expect consumers to implement it
   * themselves. We keep it that way because this implementation isn't
   * optimized at all, since we only need it when printing errors.
   */


  function findBrokenPeerDependencies(dependency, initialPackage) {
    const brokenPackages = new Map();
    const alreadyVisited = new Set();

    const traversal = currentPackage => {
      const identifier = JSON.stringify(currentPackage.name);
      if (alreadyVisited.has(identifier)) return;
      alreadyVisited.add(identifier);
      const dependents = findPackageDependents(currentPackage);

      for (const dependent of dependents) {
        const dependentInformation = getPackageInformationSafe(dependent);

        if (dependentInformation.packagePeers.has(dependency)) {
          traversal(dependent);
        } else {
          let brokenSet = brokenPackages.get(dependent.name);
          if (typeof brokenSet === `undefined`) brokenPackages.set(dependent.name, brokenSet = new Set());
          brokenSet.add(dependent.reference);
        }
      }
    };

    traversal(initialPackage);
    const brokenList = [];

    for (const name of [...brokenPackages.keys()].sort()) for (const reference of [...brokenPackages.get(name)].sort()) brokenList.push({
      name,
      reference
    });

    return brokenList;
  }
  /**
   * Finds the package locator that owns the specified path. If none is found, returns null instead.
   */


  function findPackageLocator(location) {
    if (isPathIgnored(location)) return null;
    let relativeLocation = normalizePath(ppath.relative(runtimeState.basePath, location));
    if (!relativeLocation.match(isStrictRegExp)) relativeLocation = `./${relativeLocation}`;
    if (location.match(isDirRegExp) && !relativeLocation.endsWith(`/`)) relativeLocation = `${relativeLocation}/`;
    let from = 0; // If someone wants to use a binary search to go from O(n) to O(log n), be my guest

    while (from < packageLocationLengths.length && packageLocationLengths[from] > relativeLocation.length) from += 1;

    for (let t = from; t < packageLocationLengths.length; ++t) {
      const locator = packageLocatorsByLocations.get(relativeLocation.substr(0, packageLocationLengths[t]));
      if (typeof locator === `undefined`) continue; // Ensures that the returned locator isn't a blacklisted one.
      //
      // Blacklisted packages are packages that cannot be used because their dependencies cannot be deduced. This only
      // happens with peer dependencies, which effectively have different sets of dependencies depending on their
      // parents.
      //
      // In order to deambiguate those different sets of dependencies, the Yarn implementation of PnP will generate a
      // symlink for each combination of <package name>/<package version>/<dependent package> it will find, and will
      // blacklist the target of those symlinks. By doing this, we ensure that files loaded through a specific path
      // will always have the same set of dependencies, provided the symlinks are correctly preserved.
      //
      // Unfortunately, some tools do not preserve them, and when it happens PnP isn't able anymore to deduce the set of
      // dependencies based on the path of the file that makes the require calls. But since we've blacklisted those
      // paths, we're able to print a more helpful error message that points out that a third-party package is doing
      // something incompatible!

      if (locator === null) {
        const locationForDisplay = getPathForDisplay(location);
        throw internalTools_makeError(ErrorCode.BLACKLISTED, `A forbidden path has been used in the package resolution process - this is usually caused by one of your tools calling 'fs.realpath' on the return value of 'require.resolve'. Since we need to use symlinks to simultaneously provide valid filesystem paths and disambiguate peer dependencies, they must be passed untransformed to 'require'.\n\nForbidden path: ${locationForDisplay}`, {
          location: locationForDisplay
        });
      }

      return locator;
    }

    return null;
  }
  /**
   * Transforms a request (what's typically passed as argument to the require function) into an unqualified path.
   * This path is called "unqualified" because it only changes the package name to the package location on the disk,
   * which means that the end result still cannot be directly accessed (for example, it doesn't try to resolve the
   * file extension, or to resolve directories to their "index.js" content). Use the "resolveUnqualified" function
   * to convert them to fully-qualified paths, or just use "resolveRequest" that do both operations in one go.
   *
   * Note that it is extremely important that the `issuer` path ends with a forward slash if the issuer is to be
   * treated as a folder (ie. "/tmp/foo/" rather than "/tmp/foo" if "foo" is a directory). Otherwise relative
   * imports won't be computed correctly (they'll get resolved relative to "/tmp/" instead of "/tmp/foo/").
   */


  function resolveToUnqualified(request, issuer, {
    considerBuiltins = true
  } = {}) {
    // The 'pnpapi' request is reserved and will always return the path to the PnP file, from everywhere
    if (request === `pnpapi`) return npath.toPortablePath(opts.pnpapiResolution); // Bailout if the request is a native module

    if (considerBuiltins && builtinModules.has(request)) return null;
    const requestForDisplay = getPathForDisplay(request);
    const issuerForDisplay = issuer && getPathForDisplay(issuer); // We allow disabling the pnp resolution for some subpaths.
    // This is because some projects, often legacy, contain multiple
    // levels of dependencies (ie. a yarn.lock inside a subfolder of
    // a yarn.lock). This is typically solved using workspaces, but
    // not all of them have been converted already.

    if (issuer && isPathIgnored(issuer)) {
      // Absolute paths that seem to belong to a PnP tree are still
      // handled by our runtime even if the issuer isn't. This is
      // because the native Node resolution uses a special version
      // of the `stat` syscall which would otherwise bypass the
      // filesystem layer we require to access the files.
      if (!ppath.isAbsolute(request) || findPackageLocator(request) === null) {
        const result = callNativeResolution(request, issuer);

        if (result === false) {
          throw internalTools_makeError(ErrorCode.BUILTIN_NODE_RESOLUTION_FAILED, `The builtin node resolution algorithm was unable to resolve the requested module (it didn't go through the pnp resolver because the issuer was explicitely ignored by the regexp)\n\nRequire request: "${requestForDisplay}"\nRequired by: ${issuerForDisplay}\n`, {
            request: requestForDisplay,
            issuer: issuerForDisplay
          });
        }

        return npath.toPortablePath(result);
      }
    }

    let unqualifiedPath; // If the request is a relative or absolute path, we just return it normalized

    const dependencyNameMatch = request.match(pathRegExp);

    if (!dependencyNameMatch) {
      if (ppath.isAbsolute(request)) {
        unqualifiedPath = ppath.normalize(request);
      } else {
        if (!issuer) {
          throw internalTools_makeError(ErrorCode.API_ERROR, `The resolveToUnqualified function must be called with a valid issuer when the path isn't a builtin nor absolute`, {
            request: requestForDisplay,
            issuer: issuerForDisplay
          });
        } // We use ppath.join instead of ppath.resolve because:
        // 1) The request is a relative path in this branch
        // 2) ppath.join preserves trailing slashes


        const absoluteIssuer = ppath.resolve(issuer);

        if (issuer.match(isDirRegExp)) {
          unqualifiedPath = ppath.normalize(ppath.join(absoluteIssuer, request));
        } else {
          unqualifiedPath = ppath.normalize(ppath.join(ppath.dirname(absoluteIssuer), request));
        }
      } // No need to use the return value; we just want to check the blacklist status


      findPackageLocator(unqualifiedPath);
    } // Things are more hairy if it's a package require - we then need to figure out which package is needed, and in
    // particular the exact version for the given location on the dependency tree
    else {
        if (!issuer) {
          throw internalTools_makeError(ErrorCode.API_ERROR, `The resolveToUnqualified function must be called with a valid issuer when the path isn't a builtin nor absolute`, {
            request: requestForDisplay,
            issuer: issuerForDisplay
          });
        }

        const [, dependencyName, subPath] = dependencyNameMatch;
        const issuerLocator = findPackageLocator(issuer); // If the issuer file doesn't seem to be owned by a package managed through pnp, then we resort to using the next
        // resolution algorithm in the chain, usually the native Node resolution one

        if (!issuerLocator) {
          const result = callNativeResolution(request, issuer);

          if (result === false) {
            throw internalTools_makeError(ErrorCode.BUILTIN_NODE_RESOLUTION_FAILED, `The builtin node resolution algorithm was unable to resolve the requested module (it didn't go through the pnp resolver because the issuer doesn't seem to be part of the Yarn-managed dependency tree).\n\nRequire path: "${requestForDisplay}"\nRequired by: ${issuerForDisplay}\n`, {
              request: requestForDisplay,
              issuer: issuerForDisplay
            });
          }

          return npath.toPortablePath(result);
        }

        const issuerInformation = getPackageInformationSafe(issuerLocator); // We obtain the dependency reference in regard to the package that request it

        let dependencyReference = issuerInformation.packageDependencies.get(dependencyName);
        let fallbackReference = null; // If we can't find it, we check if we can potentially load it from the packages that have been defined as potential fallbacks.
        // It's a bit of a hack, but it improves compatibility with the existing Node ecosystem. Hopefully we should eventually be able
        // to kill this logic and become stricter once pnp gets enough traction and the affected packages fix themselves.

        if (dependencyReference == null) {
          if (issuerLocator.name !== null) {
            // To allow programs to become gradually stricter, starting from the v2 we enforce that workspaces cannot depend on fallbacks.
            // This works by having a list containing all their locators, and checking when a fallback is required whether it's one of them.
            const exclusionEntry = runtimeState.fallbackExclusionList.get(issuerLocator.name);
            const canUseFallbacks = !exclusionEntry || !exclusionEntry.has(issuerLocator.reference);

            if (canUseFallbacks) {
              for (let t = 0, T = fallbackLocators.length; t < T; ++t) {
                const fallbackInformation = getPackageInformationSafe(fallbackLocators[t]);
                const reference = fallbackInformation.packageDependencies.get(dependencyName);
                if (reference == null) continue;
                if (alwaysWarnOnFallback) fallbackReference = reference;else dependencyReference = reference;
                break;
              }

              if (runtimeState.enableTopLevelFallback) {
                if (dependencyReference == null && fallbackReference === null) {
                  const reference = runtimeState.fallbackPool.get(dependencyName);

                  if (reference != null) {
                    fallbackReference = reference;
                  }
                }
              }
            }
          }
        } // If we can't find the path, and if the package making the request is the top-level, we can offer nicer error messages


        let error = null;

        if (dependencyReference === null) {
          if (isDependencyTreeRoot(issuerLocator)) {
            error = internalTools_makeError(ErrorCode.MISSING_PEER_DEPENDENCY, `Your application tried to access ${dependencyName} (a peer dependency); this isn't allowed as there is no ancestor to satisfy the requirement. Use a devDependency if needed.\n\nRequired package: ${dependencyName} (via "${requestForDisplay}")\nRequired by: ${issuerForDisplay}\n`, {
              request: requestForDisplay,
              issuer: issuerForDisplay,
              dependencyName
            });
          } else {
            const brokenAncestors = findBrokenPeerDependencies(dependencyName, issuerLocator);

            if (brokenAncestors.every(ancestor => isDependencyTreeRoot(ancestor))) {
              error = internalTools_makeError(ErrorCode.MISSING_PEER_DEPENDENCY, `${issuerLocator.name} tried to access ${dependencyName} (a peer dependency) but it isn't provided by your application; this makes the require call ambiguous and unsound.\n\nRequired package: ${dependencyName} (via "${requestForDisplay}")\nRequired by: ${issuerLocator.name}@${issuerLocator.reference} (via ${issuerForDisplay})\n${brokenAncestors.map(ancestorLocator => `Ancestor breaking the chain: ${ancestorLocator.name}@${ancestorLocator.reference}\n`).join(``)}\n`, {
                request: requestForDisplay,
                issuer: issuerForDisplay,
                issuerLocator: Object.assign({}, issuerLocator),
                dependencyName,
                brokenAncestors
              });
            } else {
              error = internalTools_makeError(ErrorCode.MISSING_PEER_DEPENDENCY, `${issuerLocator.name} tried to access ${dependencyName} (a peer dependency) but it isn't provided by its ancestors; this makes the require call ambiguous and unsound.\n\nRequired package: ${dependencyName} (via "${requestForDisplay}")\nRequired by: ${issuerLocator.name}@${issuerLocator.reference} (via ${issuerForDisplay})\n${brokenAncestors.map(ancestorLocator => `Ancestor breaking the chain: ${ancestorLocator.name}@${ancestorLocator.reference}\n`).join(``)}\n`, {
                request: requestForDisplay,
                issuer: issuerForDisplay,
                issuerLocator: Object.assign({}, issuerLocator),
                dependencyName,
                brokenAncestors
              });
            }
          }
        } else if (dependencyReference === undefined) {
          if (!considerBuiltins && builtinModules.has(request)) {
            if (isDependencyTreeRoot(issuerLocator)) {
              error = internalTools_makeError(ErrorCode.UNDECLARED_DEPENDENCY, `Your application tried to access ${dependencyName}. While this module is usually interpreted as a Node builtin, your resolver is running inside a non-Node resolution context where such builtins are ignored. Since ${dependencyName} isn't otherwise declared in your dependencies, this makes the require call ambiguous and unsound.\n\nRequired package: ${dependencyName} (via "${requestForDisplay}")\nRequired by: ${issuerForDisplay}\n`, {
                request: requestForDisplay,
                issuer: issuerForDisplay,
                dependencyName
              });
            } else {
              error = internalTools_makeError(ErrorCode.UNDECLARED_DEPENDENCY, `${issuerLocator.name} tried to access ${dependencyName}. While this module is usually interpreted as a Node builtin, your resolver is running inside a non-Node resolution context where such builtins are ignored. Since ${dependencyName} isn't otherwise declared in ${issuerLocator.name}'s dependencies, this makes the require call ambiguous and unsound.\n\nRequired package: ${dependencyName} (via "${requestForDisplay}")\nRequired by: ${issuerForDisplay}\n`, {
                request: requestForDisplay,
                issuer: issuerForDisplay,
                issuerLocator: Object.assign({}, issuerLocator),
                dependencyName
              });
            }
          } else {
            if (isDependencyTreeRoot(issuerLocator)) {
              error = internalTools_makeError(ErrorCode.UNDECLARED_DEPENDENCY, `Your application tried to access ${dependencyName}, but it isn't declared in your dependencies; this makes the require call ambiguous and unsound.\n\nRequired package: ${dependencyName} (via "${requestForDisplay}")\nRequired by: ${issuerForDisplay}\n`, {
                request: requestForDisplay,
                issuer: issuerForDisplay,
                dependencyName
              });
            } else {
              error = internalTools_makeError(ErrorCode.UNDECLARED_DEPENDENCY, `${issuerLocator.name} tried to access ${dependencyName}, but it isn't declared in its dependencies; this makes the require call ambiguous and unsound.\n\nRequired package: ${dependencyName} (via "${requestForDisplay}")\nRequired by: ${issuerLocator.name}@${issuerLocator.reference} (via ${issuerForDisplay})\n`, {
                request: requestForDisplay,
                issuer: issuerForDisplay,
                issuerLocator: Object.assign({}, issuerLocator),
                dependencyName
              });
            }
          }
        }

        if (dependencyReference == null) {
          if (fallbackReference === null || error === null) throw error || new Error(`Assertion failed: Expected an error to have been set`);
          dependencyReference = fallbackReference;
          const message = error.message.replace(/\n.*/g, ``);
          error.message = message;

          if (!emittedWarnings.has(message)) {
            emittedWarnings.add(message);
            process.emitWarning(error);
          }
        } // We need to check that the package exists on the filesystem, because it might not have been installed


        const dependencyLocator = Array.isArray(dependencyReference) ? {
          name: dependencyReference[0],
          reference: dependencyReference[1]
        } : {
          name: dependencyName,
          reference: dependencyReference
        };
        const dependencyInformation = getPackageInformationSafe(dependencyLocator);

        if (!dependencyInformation.packageLocation) {
          throw internalTools_makeError(ErrorCode.MISSING_DEPENDENCY, `A dependency seems valid but didn't get installed for some reason. This might be caused by a partial install, such as dev vs prod.\n\nRequired package: ${dependencyLocator.name}@${dependencyLocator.reference} (via "${requestForDisplay}")\nRequired by: ${issuerLocator.name}@${issuerLocator.reference} (via ${issuerForDisplay})\n`, {
            request: requestForDisplay,
            issuer: issuerForDisplay,
            dependencyLocator: Object.assign({}, dependencyLocator)
          });
        } // Now that we know which package we should resolve to, we only have to find out the file location
        // packageLocation is always absolute as it's returned by getPackageInformationSafe


        const dependencyLocation = dependencyInformation.packageLocation;

        if (subPath) {
          // We use ppath.join instead of ppath.resolve because:
          // 1) subPath is always a relative path
          // 2) ppath.join preserves trailing slashes
          unqualifiedPath = ppath.join(dependencyLocation, subPath);
        } else {
          unqualifiedPath = dependencyLocation;
        }
      }

    return ppath.normalize(unqualifiedPath);
  }
  /**
   * Transforms an unqualified path into a qualified path by using the Node resolution algorithm (which automatically
   * appends ".js" / ".json", and transforms directory accesses into "index.js").
   */


  function resolveUnqualified(unqualifiedPath, {
    extensions = Object.keys(external_module_namespaceObject.Module._extensions)
  } = {}) {
    const candidates = [];
    const qualifiedPath = applyNodeExtensionResolution(unqualifiedPath, candidates, {
      extensions
    });

    if (qualifiedPath) {
      return ppath.normalize(qualifiedPath);
    } else {
      const unqualifiedPathForDisplay = getPathForDisplay(unqualifiedPath);
      throw internalTools_makeError(ErrorCode.QUALIFIED_PATH_RESOLUTION_FAILED, `Qualified path resolution failed - none of the candidates can be found on the disk.\n\nSource path: ${unqualifiedPathForDisplay}\n${candidates.map(candidate => `Rejected candidate: ${getPathForDisplay(candidate)}\n`).join(``)}`, {
        unqualifiedPath: unqualifiedPathForDisplay
      });
    }
  }
  /**
   * Transforms a request into a fully qualified path.
   *
   * Note that it is extremely important that the `issuer` path ends with a forward slash if the issuer is to be
   * treated as a folder (ie. "/tmp/foo/" rather than "/tmp/foo" if "foo" is a directory). Otherwise relative
   * imports won't be computed correctly (they'll get resolved relative to "/tmp/" instead of "/tmp/foo/").
   */


  function resolveRequest(request, issuer, {
    considerBuiltins,
    extensions
  } = {}) {
    const unqualifiedPath = resolveToUnqualified(request, issuer, {
      considerBuiltins
    });
    if (unqualifiedPath === null) return null;

    try {
      return resolveUnqualified(unqualifiedPath, {
        extensions
      });
    } catch (resolutionError) {
      if (resolutionError.pnpCode === `QUALIFIED_PATH_RESOLUTION_FAILED`) Object.assign(resolutionError.data, {
        request: getPathForDisplay(request),
        issuer: issuer && getPathForDisplay(issuer)
      });
      throw resolutionError;
    }
  }

  function resolveVirtual(request) {
    const normalized = ppath.normalize(request);
    const resolved = VirtualFS.resolveVirtual(normalized);
    return resolved !== normalized ? resolved : null;
  }

  return {
    VERSIONS,
    topLevel,
    getLocator: (name, referencish) => {
      if (Array.isArray(referencish)) {
        return {
          name: referencish[0],
          reference: referencish[1]
        };
      } else {
        return {
          name,
          reference: referencish
        };
      }
    },
    getDependencyTreeRoots: () => {
      return [...runtimeState.dependencyTreeRoots];
    },

    getAllLocators() {
      const locators = [];

      for (const [name, entry] of packageRegistry) for (const reference of entry.keys()) if (name !== null && reference !== null) locators.push({
        name,
        reference
      });

      return locators;
    },

    getPackageInformation: locator => {
      const info = getPackageInformation(locator);
      if (info === null) return null;
      const packageLocation = npath.fromPortablePath(info.packageLocation);
      const nativeInfo = { ...info,
        packageLocation
      };
      return nativeInfo;
    },
    findPackageLocator: path => {
      return findPackageLocator(npath.toPortablePath(path));
    },
    resolveToUnqualified: maybeLog(`resolveToUnqualified`, (request, issuer, opts) => {
      const portableIssuer = issuer !== null ? npath.toPortablePath(issuer) : null;
      const resolution = resolveToUnqualified(npath.toPortablePath(request), portableIssuer, opts);
      if (resolution === null) return null;
      return npath.fromPortablePath(resolution);
    }),
    resolveUnqualified: maybeLog(`resolveUnqualified`, (unqualifiedPath, opts) => {
      return npath.fromPortablePath(resolveUnqualified(npath.toPortablePath(unqualifiedPath), opts));
    }),
    resolveRequest: maybeLog(`resolveRequest`, (request, issuer, opts) => {
      const portableIssuer = issuer !== null ? npath.toPortablePath(issuer) : null;
      const resolution = resolveRequest(npath.toPortablePath(request), portableIssuer, opts);
      if (resolution === null) return null;
      return npath.fromPortablePath(resolution);
    }),
    resolveVirtual: maybeLog(`resolveVirtual`, path => {
      const result = resolveVirtual(npath.toPortablePath(path));

      if (result !== null) {
        return npath.fromPortablePath(result);
      } else {
        return null;
      }
    })
  };
}
// CONCATENATED MODULE: ./sources/hydratePnpApi.ts





const readFileP = (0,external_util_namespaceObject.promisify)(external_fs_namespaceObject.readFile); // Note that using those functions is typically NOT needed! The PnP API is
// designed to be consumed directly from within Node - meaning that depending
// on your situation you probably should use one of those two alternatives
// instead:
//
//   - If your script is executing within a PnP environment, you'll be able to
//     simply `require("pnpapi")` in order to get a reference to the running
//     API. You can also simply check whether you're actually running within a
//     PnP environment by checking `process.versions.pnp`.
//
//   - Or if you're not running within a PnP environment, or wish to interact
//     with a different one than the current one, then you can directly require
//     its `.pnp.js` file.
//
// The function exported in this file only work when the PnP data are kept
// outside of the loader (pnpEnableInlining = false in Yarn), and their only
// real use case is to access the PnP API without running the risk of executing
// third-party Javascript code.

async function hydratePnpFile(location, {
  fakeFs,
  pnpapiResolution
}) {
  const source = await readFileP(location, `utf8`);
  return hydratePnpSource(source, {
    basePath: (0,external_path_namespaceObject.dirname)(location),
    fakeFs,
    pnpapiResolution
  });
}
function hydratePnpSource(source, {
  basePath,
  fakeFs,
  pnpapiResolution
}) {
  const data = JSON.parse(source);
  const runtimeState = hydrateRuntimeState(data, {
    basePath
  });
  return makeApi(runtimeState, {
    compatibilityMode: true,
    fakeFs,
    pnpapiResolution
  });
}
// CONCATENATED MODULE: ./sources/microkernel.ts



/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => module['default'] :
/******/ 				() => module;
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(890);
/******/ })()
;