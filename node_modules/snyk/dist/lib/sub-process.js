"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = void 0;
const childProcess = require("child_process");
function execute(command, args, options) {
    const spawnOptions = { shell: true };
    if (options && options.cwd) {
        spawnOptions.cwd = options.cwd;
    }
    return new Promise((resolve, reject) => {
        let stdout = '';
        let stderr = '';
        const proc = childProcess.spawn(command, args, spawnOptions);
        if (proc.stdout) {
            proc.stdout.on('data', (data) => {
                stdout += data;
            });
        }
        if (proc.stderr) {
            proc.stderr.on('data', (data) => {
                stderr += data;
            });
        }
        proc.on('close', (code) => {
            if (code !== 0) {
                return reject(stdout || stderr);
            }
            resolve(stdout || stderr);
        });
    });
}
exports.execute = execute;
//# sourceMappingURL=sub-process.js.map