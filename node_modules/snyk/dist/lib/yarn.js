"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.yarn = void 0;
const Debug = require("debug");
const child_process_1 = require("child_process");
const errors_1 = require("./errors");
const debug = Debug('snyk');
function yarn(method, packages, live, cwd, flags) {
    flags = flags || [];
    if (!packages) {
        packages = [];
    }
    if (!Array.isArray(packages)) {
        packages = [packages];
    }
    method += ' ' + flags.join(' ');
    return new Promise((resolve, reject) => {
        const cmd = 'yarn ' + method + ' ' + packages.join(' ');
        if (!cwd) {
            cwd = process.cwd();
        }
        debug('%s$ %s', cwd, cmd);
        if (!live) {
            debug('[skipping - dry run]');
            return resolve();
        }
        child_process_1.exec(cmd, {
            cwd,
        }, (error, stdout, stderr) => {
            if (error) {
                return reject(error);
            }
            if (stderr.indexOf('ERR!') !== -1) {
                console.error(stderr.trim());
                const e = new errors_1.CustomError('Yarn update issues: ' + stderr.trim());
                e.strCode = 'FAIL_UPDATE';
                e.code = 422;
                return reject(e);
            }
            debug('yarn %s complete', method);
            resolve();
        });
    });
}
exports.yarn = yarn;
//# sourceMappingURL=yarn.js.map