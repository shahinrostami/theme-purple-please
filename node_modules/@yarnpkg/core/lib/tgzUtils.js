"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractArchiveTo = exports.convertToZip = exports.makeArchiveFromDirectory = void 0;
const tslib_1 = require("tslib");
const fslib_1 = require("@yarnpkg/fslib");
const libzip_1 = require("@yarnpkg/libzip");
const tar_stream_1 = tslib_1.__importDefault(require("tar-stream"));
const util_1 = require("util");
const zlib_1 = tslib_1.__importDefault(require("zlib"));
const gunzip = util_1.promisify(zlib_1.default.gunzip);
async function makeArchiveFromDirectory(source, { baseFs = new fslib_1.NodeFS(), prefixPath = fslib_1.PortablePath.root, compressionLevel, inMemory = false } = {}) {
    const libzip = await libzip_1.getLibzipPromise();
    let zipFs;
    if (inMemory) {
        zipFs = new fslib_1.ZipFS(null, { libzip, level: compressionLevel });
    }
    else {
        const tmpFolder = await fslib_1.xfs.mktempPromise();
        const tmpFile = fslib_1.ppath.join(tmpFolder, `archive.zip`);
        zipFs = new fslib_1.ZipFS(tmpFile, { create: true, libzip, level: compressionLevel });
    }
    const target = fslib_1.ppath.resolve(fslib_1.PortablePath.root, prefixPath);
    await zipFs.copyPromise(target, source, { baseFs, stableTime: true, stableSort: true });
    return zipFs;
}
exports.makeArchiveFromDirectory = makeArchiveFromDirectory;
async function convertToZip(tgz, opts) {
    const tmpFolder = await fslib_1.xfs.mktempPromise();
    const tmpFile = fslib_1.ppath.join(tmpFolder, `archive.zip`);
    const { compressionLevel, ...bufferOpts } = opts;
    return await extractArchiveTo(tgz, new fslib_1.ZipFS(tmpFile, { create: true, libzip: await libzip_1.getLibzipPromise(), level: compressionLevel }), bufferOpts);
}
exports.convertToZip = convertToZip;
async function extractArchiveTo(tgz, targetFs, { stripComponents = 0, prefixPath = fslib_1.PortablePath.dot } = {}) {
    // 1980-01-01, like Fedora
    const defaultTime = 315532800;
    const parser = tar_stream_1.default.extract();
    function ignore(entry) {
        // Disallow absolute paths; might be malicious (ex: /etc/passwd)
        if (entry.name[0] === `/`)
            return true;
        const parts = entry.name.split(/\//g);
        // We also ignore paths that could lead to escaping outside the archive
        if (parts.some((part) => part === `..`))
            return true;
        if (parts.length <= stripComponents)
            return true;
        return false;
    }
    parser.on(`entry`, (header, stream, next) => {
        var _a, _b;
        if (ignore(header)) {
            next();
            return;
        }
        const parts = fslib_1.ppath.normalize(fslib_1.npath.toPortablePath(header.name)).replace(/\/$/, ``).split(/\//g);
        if (parts.length <= stripComponents) {
            stream.resume();
            next();
            return;
        }
        const slicePath = parts.slice(stripComponents).join(`/`);
        const mappedPath = fslib_1.ppath.join(prefixPath, slicePath);
        let mode = 0o644;
        // If a single executable bit is set, normalize so that all are
        if (header.type === `directory` || (((_a = header.mode) !== null && _a !== void 0 ? _a : 0) & 0o111) !== 0)
            mode |= 0o111;
        switch (header.type) {
            case `directory`:
                {
                    targetFs.mkdirpSync(fslib_1.ppath.dirname(mappedPath), { chmod: 0o755, utimes: [defaultTime, defaultTime] });
                    targetFs.mkdirSync(mappedPath);
                    targetFs.chmodSync(mappedPath, mode);
                    targetFs.utimesSync(mappedPath, defaultTime, defaultTime);
                    next();
                }
                break;
            case `file`:
                {
                    targetFs.mkdirpSync(fslib_1.ppath.dirname(mappedPath), { chmod: 0o755, utimes: [defaultTime, defaultTime] });
                    const chunks = [];
                    stream.on(`data`, (chunk) => chunks.push(chunk));
                    stream.on(`end`, () => {
                        targetFs.writeFileSync(mappedPath, Buffer.concat(chunks));
                        targetFs.chmodSync(mappedPath, mode);
                        targetFs.utimesSync(mappedPath, defaultTime, defaultTime);
                        next();
                    });
                }
                break;
            case `symlink`:
                {
                    targetFs.mkdirpSync(fslib_1.ppath.dirname(mappedPath), { chmod: 0o755, utimes: [defaultTime, defaultTime] });
                    targetFs.symlinkSync(header.linkname, mappedPath);
                    (_b = targetFs.lutimesSync) === null || _b === void 0 ? void 0 : _b.call(targetFs, mappedPath, defaultTime, defaultTime);
                    next();
                }
                break;
            default: {
                stream.resume();
                next();
            }
        }
    });
    const gunzipped = await gunzip(tgz);
    return await new Promise((resolve, reject) => {
        parser.on(`error`, (error) => {
            reject(error);
        });
        parser.on(`finish`, () => {
            resolve(targetFs);
        });
        parser.end(gunzipped);
    });
}
exports.extractArchiveTo = extractArchiveTo;
