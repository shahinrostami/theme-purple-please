"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rightPadWithSpaces = void 0;
function rightPadWithSpaces(s, padding) {
    const padLength = padding - s.length;
    if (padLength <= 0) {
        return s;
    }
    return s + ' '.repeat(padLength);
}
exports.rightPadWithSpaces = rightPadWithSpaces;
//# sourceMappingURL=right-pad.js.map