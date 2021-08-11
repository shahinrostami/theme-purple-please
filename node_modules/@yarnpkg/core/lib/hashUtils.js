"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checksumPattern = exports.checksumFile = exports.makeHash = void 0;
const tslib_1 = require("tslib");
const fslib_1 = require("@yarnpkg/fslib");
const crypto_1 = require("crypto");
const globby_1 = tslib_1.__importDefault(require("globby"));
function makeHash(...args) {
    const hash = crypto_1.createHash(`sha512`);
    for (const arg of args)
        hash.update(arg ? arg : ``);
    return hash.digest(`hex`);
}
exports.makeHash = makeHash;
function checksumFile(path) {
    return new Promise((resolve, reject) => {
        const hash = crypto_1.createHash(`sha512`);
        const stream = fslib_1.xfs.createReadStream(path);
        stream.on(`data`, chunk => {
            hash.update(chunk);
        });
        stream.on(`error`, error => {
            reject(error);
        });
        stream.on(`end`, () => {
            resolve(hash.digest(`hex`));
        });
    });
}
exports.checksumFile = checksumFile;
async function checksumPattern(pattern, { cwd }) {
    // Note: We use a two-pass glob instead of using the expandDirectories option
    // from globby, because the native implementation is broken.
    //
    // Ref: https://github.com/sindresorhus/globby/issues/147
    const dirListing = await globby_1.default(pattern, {
        cwd: fslib_1.npath.fromPortablePath(cwd),
        expandDirectories: false,
        onlyDirectories: true,
        unique: true,
    });
    const dirPatterns = dirListing.map(entry => {
        return `${entry}/**/*`;
    });
    const listing = await globby_1.default([pattern, ...dirPatterns], {
        cwd: fslib_1.npath.fromPortablePath(cwd),
        expandDirectories: false,
        onlyFiles: false,
        unique: true,
    });
    listing.sort();
    const hashes = await Promise.all(listing.map(async (entry) => {
        const parts = [Buffer.from(entry)];
        const p = fslib_1.npath.toPortablePath(entry);
        const stat = await fslib_1.xfs.lstatPromise(p);
        if (stat.isSymbolicLink())
            parts.push(Buffer.from(await fslib_1.xfs.readlinkPromise(p)));
        else if (stat.isFile())
            parts.push(await fslib_1.xfs.readFilePromise(p));
        return parts.join(`\u0000`);
    }));
    const hash = crypto_1.createHash(`sha512`);
    for (const sub of hashes)
        hash.update(sub);
    return hash.digest(`hex`);
}
exports.checksumPattern = checksumPattern;
