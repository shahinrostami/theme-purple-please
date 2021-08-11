"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeBinjumperSync = exports.makeBinjumper = exports.getBinjumper = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const util_1 = require("util");
const binjumper_1 = require("./binjumper");
Object.defineProperty(exports, "getBinjumper", { enumerable: true, get: function () { return binjumper_1.getBinjumper; } });
async function makeBinjumper(opts) {
    const writeFilePromise = util_1.promisify(fs_1.writeFile);
    const mkdirPromise = util_1.promisify(fs_1.mkdir);
    await mkdirPromise(opts.dir, { recursive: true });
    if (process.platform === 'win32') {
        await Promise.all([
            writeFilePromise(path_1.join(opts.dir, `${opts.name}.exe`), binjumper_1.getBinjumper()),
            writeFilePromise(path_1.join(opts.dir, `${opts.name}.exe.info`), [opts.target, ...(opts.args || [])].join('\n')),
        ]);
    }
    await writeFilePromise(path_1.join(opts.dir, opts.name), `#!/bin/sh\nexec "${opts.target}" ${(opts.args || [])
        .map((arg) => `'${arg.replace(/'/g, `'"'"'`)}'`)
        .join(' ')} "$@"\n`, { mode: 0o755 });
}
exports.makeBinjumper = makeBinjumper;
function makeBinjumperSync(opts) {
    fs_1.mkdirSync(opts.dir, { recursive: true });
    if (process.platform === 'win32') {
        fs_1.writeFileSync(path_1.join(opts.dir, `${opts.name}.exe`), binjumper_1.getBinjumper());
        fs_1.writeFileSync(path_1.join(opts.dir, `${opts.name}.exe.info`), [opts.target, ...(opts.args || [])].join('\n'));
    }
    fs_1.writeFileSync(path_1.join(opts.dir, opts.name), `#!/bin/sh\nexec "${opts.target}" ${(opts.args || [])
        .map((arg) => `'${arg.replace(/'/g, `'"'"'`)}'`)
        .join(' ')} "$@"\n`, { mode: 0o755 });
}
exports.makeBinjumperSync = makeBinjumperSync;
