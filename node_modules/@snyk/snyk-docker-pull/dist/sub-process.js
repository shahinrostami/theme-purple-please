"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = void 0;
const childProcess = require("child_process");
async function execute(command, args, cwd, env, shell = false) {
    const spawnOptions = { shell };
    if (cwd) {
        spawnOptions.cwd = cwd;
    }
    if (env) {
        spawnOptions.env = env;
    }
    return new Promise((resolve, reject) => {
        let stdout = "";
        let stderr = "";
        const proc = childProcess.spawn(command, args, spawnOptions);
        proc.stdout.on("data", data => {
            stdout = stdout + data;
        });
        proc.stderr.on("data", data => {
            stderr = stderr + data;
        });
        proc.on("close", code => {
            const output = { stdout, stderr };
            if (code !== 0) {
                return reject(output);
            }
            resolve(output);
        });
    });
}
exports.execute = execute;
//# sourceMappingURL=sub-process.js.map