"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.abridgeErrorMessage = void 0;
function abridgeErrorMessage(msg, maxLen, ellipsis = ' ... ') {
    if (msg.length <= maxLen) {
        return msg;
    }
    const toKeep = Math.floor((maxLen - ellipsis.length) / 2);
    return (msg.slice(0, toKeep) + ellipsis + msg.slice(msg.length - toKeep, msg.length));
}
exports.abridgeErrorMessage = abridgeErrorMessage;
//# sourceMappingURL=error-format.js.map