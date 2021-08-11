"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeCommand = void 0;
const child_process_1 = require("child_process");
// TODO: is this different to child process exec?
function executeCommand(cmd, root) {
    return new Promise((resolve, reject) => {
        child_process_1.exec(cmd, { cwd: root }, (err, stdout, stderr) => {
            const error = stderr.trim();
            if (error) {
                return reject(new Error(error + ' / ' + cmd));
            }
            resolve(stdout.split('\n').join(''));
        });
    });
}
exports.executeCommand = executeCommand;
//# sourceMappingURL=exec.js.map