"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
const tslib_1 = require("tslib");
const fslib_1 = require("@yarnpkg/fslib");
const fslib_2 = require("@yarnpkg/fslib");
const libzip_1 = require("@yarnpkg/libzip");
const fs_1 = tslib_1.__importDefault(require("fs"));
const MessageName_1 = require("./MessageName");
const Report_1 = require("./Report");
const hashUtils = tslib_1.__importStar(require("./hashUtils"));
const miscUtils = tslib_1.__importStar(require("./miscUtils"));
const structUtils = tslib_1.__importStar(require("./structUtils"));
const CACHE_VERSION = 7;
class Cache {
    constructor(cacheCwd, { configuration, immutable = configuration.get(`enableImmutableCache`), check = false }) {
        // Contains the list of cache files that got accessed since the last time
        // you cleared the variable. Useful to know which files aren't needed
        // anymore when used in conjunction with fetchEverything.
        this.markedFiles = new Set();
        this.mutexes = new Map();
        this.configuration = configuration;
        this.cwd = cacheCwd;
        this.immutable = immutable;
        this.check = check;
        const cacheKeyOverride = configuration.get(`cacheKeyOverride`);
        if (cacheKeyOverride !== null) {
            this.cacheKey = `${cacheKeyOverride}`;
        }
        else {
            const compressionLevel = configuration.get(`compressionLevel`);
            const compressionKey = compressionLevel !== fslib_2.DEFAULT_COMPRESSION_LEVEL
                ? `c${compressionLevel}` : ``;
            this.cacheKey = [
                CACHE_VERSION,
                compressionKey,
            ].join(``);
        }
    }
    static async find(configuration, { immutable, check } = {}) {
        const cache = new Cache(configuration.get(`cacheFolder`), { configuration, immutable, check });
        await cache.setup();
        return cache;
    }
    get mirrorCwd() {
        if (!this.configuration.get(`enableMirror`))
            return null;
        const mirrorCwd = `${this.configuration.get(`globalFolder`)}/cache`;
        return mirrorCwd !== this.cwd ? mirrorCwd : null;
    }
    getVersionFilename(locator) {
        return `${structUtils.slugifyLocator(locator)}-${this.cacheKey}.zip`;
    }
    getChecksumFilename(locator, checksum) {
        // We only want the actual checksum (not the cache version, since the whole
        // point is to avoid changing the filenames when the cache version changes)
        const contentChecksum = getHashComponent(checksum);
        // We only care about the first few characters. It doesn't matter if that
        // makes the hash easier to collide with, because we check the file hashes
        // during each install anyway.
        const significantChecksum = contentChecksum.slice(0, 10);
        return `${structUtils.slugifyLocator(locator)}-${significantChecksum}.zip`;
    }
    getLocatorPath(locator, expectedChecksum) {
        // If there is no mirror, then the local cache *is* the mirror, in which
        // case we use the versioned filename pattern.
        if (this.mirrorCwd === null)
            return fslib_2.ppath.resolve(this.cwd, this.getVersionFilename(locator));
        // If we don't yet know the checksum, discard the path resolution for now
        // until the checksum can be obtained from somewhere (mirror or network).
        if (expectedChecksum === null)
            return null;
        // If the cache key changed then we assume that the content probably got
        // altered as well and thus the existing path won't be good enough anymore.
        const cacheKey = getCacheKeyComponent(expectedChecksum);
        if (cacheKey !== this.cacheKey)
            return null;
        return fslib_2.ppath.resolve(this.cwd, this.getChecksumFilename(locator, expectedChecksum));
    }
    getLocatorMirrorPath(locator) {
        const mirrorCwd = this.mirrorCwd;
        return mirrorCwd !== null ? fslib_2.ppath.resolve(mirrorCwd, this.getVersionFilename(locator)) : null;
    }
    async setup() {
        if (!this.configuration.get(`enableGlobalCache`)) {
            await fslib_2.xfs.mkdirPromise(this.cwd, { recursive: true });
            const gitignorePath = fslib_2.ppath.resolve(this.cwd, `.gitignore`);
            await fslib_2.xfs.changeFilePromise(gitignorePath, `/.gitignore\n*.flock\n`);
        }
    }
    async fetchPackageFromCache(locator, expectedChecksum, { onHit, onMiss, loader, skipIntegrityCheck }) {
        const mirrorPath = this.getLocatorMirrorPath(locator);
        const baseFs = new fslib_1.NodeFS();
        const validateFile = async (path, refetchPath = null) => {
            const actualChecksum = (!skipIntegrityCheck || !expectedChecksum) ? `${this.cacheKey}/${await hashUtils.checksumFile(path)}` : expectedChecksum;
            if (refetchPath !== null) {
                const previousChecksum = (!skipIntegrityCheck || !expectedChecksum) ? `${this.cacheKey}/${await hashUtils.checksumFile(refetchPath)}` : expectedChecksum;
                if (actualChecksum !== previousChecksum) {
                    throw new Report_1.ReportError(MessageName_1.MessageName.CACHE_CHECKSUM_MISMATCH, `The remote archive doesn't match the local checksum - has the local cache been corrupted?`);
                }
            }
            if (expectedChecksum !== null && actualChecksum !== expectedChecksum) {
                let checksumBehavior;
                // Using --check-cache overrides any preconfigured checksum behavior
                if (this.check)
                    checksumBehavior = `throw`;
                // If the lockfile references an old cache format, we tolerate different checksums
                else if (getCacheKeyComponent(expectedChecksum) !== getCacheKeyComponent(actualChecksum))
                    checksumBehavior = `update`;
                else
                    checksumBehavior = this.configuration.get(`checksumBehavior`);
                switch (checksumBehavior) {
                    case `ignore`:
                        return expectedChecksum;
                    case `update`:
                        return actualChecksum;
                    default:
                    case `throw`: {
                        throw new Report_1.ReportError(MessageName_1.MessageName.CACHE_CHECKSUM_MISMATCH, `The remote archive doesn't match the expected checksum`);
                    }
                }
            }
            return actualChecksum;
        };
        const validateFileAgainstRemote = async (cachePath) => {
            if (!loader)
                throw new Error(`Cache check required but no loader configured for ${structUtils.prettyLocator(this.configuration, locator)}`);
            const zipFs = await loader();
            const refetchPath = zipFs.getRealPath();
            zipFs.saveAndClose();
            await fslib_2.xfs.chmodPromise(refetchPath, 0o644);
            return await validateFile(cachePath, refetchPath);
        };
        const loadPackageThroughMirror = async () => {
            if (mirrorPath === null || !(await fslib_2.xfs.existsPromise(mirrorPath))) {
                const zipFs = await loader();
                const realPath = zipFs.getRealPath();
                zipFs.saveAndClose();
                return realPath;
            }
            const tempDir = await fslib_2.xfs.mktempPromise();
            const tempPath = fslib_2.ppath.join(tempDir, this.getVersionFilename(locator));
            await fslib_2.xfs.copyFilePromise(mirrorPath, tempPath, fs_1.default.constants.COPYFILE_FICLONE);
            return tempPath;
        };
        const loadPackage = async () => {
            if (!loader)
                throw new Error(`Cache entry required but missing for ${structUtils.prettyLocator(this.configuration, locator)}`);
            if (this.immutable)
                throw new Report_1.ReportError(MessageName_1.MessageName.IMMUTABLE_CACHE, `Cache entry required but missing for ${structUtils.prettyLocator(this.configuration, locator)}`);
            const originalPath = await loadPackageThroughMirror();
            await fslib_2.xfs.chmodPromise(originalPath, 0o644);
            // Do this before moving the file so that we don't pollute the cache with corrupted archives
            const checksum = await validateFile(originalPath);
            const cachePath = this.getLocatorPath(locator, checksum);
            if (!cachePath)
                throw new Error(`Assertion failed: Expected the cache path to be available`);
            return await this.writeFileWithLock(cachePath, async () => {
                return await this.writeFileWithLock(mirrorPath, async () => {
                    // Doing a move is important to ensure atomic writes (todo: cross-drive?)
                    await fslib_2.xfs.movePromise(originalPath, cachePath);
                    if (mirrorPath !== null)
                        await fslib_2.xfs.copyFilePromise(cachePath, mirrorPath, fs_1.default.constants.COPYFILE_FICLONE);
                    return [cachePath, checksum];
                });
            });
        };
        const loadPackageThroughMutex = async () => {
            const mutexedLoad = async () => {
                // We don't yet know whether the cache path can be computed yet, since that
                // depends on whether the cache is actually the mirror or not, and whether
                // the checksum is known or not.
                const tentativeCachePath = this.getLocatorPath(locator, expectedChecksum);
                const cacheExists = tentativeCachePath !== null
                    ? await baseFs.existsPromise(tentativeCachePath)
                    : false;
                const action = cacheExists
                    ? onHit
                    : onMiss;
                if (action)
                    action();
                if (!cacheExists) {
                    return loadPackage();
                }
                else {
                    let checksum = null;
                    const cachePath = tentativeCachePath;
                    if (this.check)
                        checksum = await validateFileAgainstRemote(cachePath);
                    else
                        checksum = await validateFile(cachePath);
                    return [cachePath, checksum];
                }
            };
            const mutex = mutexedLoad();
            this.mutexes.set(locator.locatorHash, mutex);
            try {
                return await mutex;
            }
            finally {
                this.mutexes.delete(locator.locatorHash);
            }
        };
        for (let mutex; (mutex = this.mutexes.get(locator.locatorHash));)
            await mutex;
        const [cachePath, checksum] = await loadPackageThroughMutex();
        this.markedFiles.add(cachePath);
        let zipFs = null;
        const libzip = await libzip_1.getLibzipPromise();
        const lazyFs = new fslib_1.LazyFS(() => miscUtils.prettifySyncErrors(() => {
            return zipFs = new fslib_1.ZipFS(cachePath, { baseFs, libzip, readOnly: true });
        }, message => {
            return `Failed to open the cache entry for ${structUtils.prettyLocator(this.configuration, locator)}: ${message}`;
        }), fslib_2.ppath);
        // We use an AliasFS to speed up getRealPath calls (e.g. VirtualFetcher.ensureVirtualLink)
        // (there's no need to create the lazy baseFs instance to gather the already-known cachePath)
        const aliasFs = new fslib_1.AliasFS(cachePath, { baseFs: lazyFs, pathUtils: fslib_2.ppath });
        const releaseFs = () => {
            if (zipFs !== null) {
                zipFs.discardAndClose();
            }
        };
        return [aliasFs, releaseFs, checksum];
    }
    async writeFileWithLock(file, generator) {
        if (file === null)
            return await generator();
        await fslib_2.xfs.mkdirPromise(fslib_2.ppath.dirname(file), { recursive: true });
        return await fslib_2.xfs.lockPromise(file, async () => {
            return await generator();
        });
    }
}
exports.Cache = Cache;
function getCacheKeyComponent(checksum) {
    const split = checksum.indexOf(`/`);
    return split !== -1 ? checksum.slice(0, split) : null;
}
function getHashComponent(checksum) {
    const split = checksum.indexOf(`/`);
    return split !== -1 ? checksum.slice(split + 1) : checksum;
}
