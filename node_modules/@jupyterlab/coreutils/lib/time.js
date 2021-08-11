"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Time = void 0;
const moment_1 = __importDefault(require("moment"));
/**
 * The namespace for date functions.
 */
var Time;
(function (Time) {
    /**
     * Convert a timestring to a human readable string (e.g. 'two minutes ago').
     *
     * @param value - The date timestring or date object.
     *
     * @returns A formatted date.
     */
    function formatHuman(value) {
        moment_1.default.locale(document.documentElement.lang);
        let time = moment_1.default(value).fromNow();
        // FIXME-TRANS: This is not localization friendly!
        time = time === 'a few seconds ago' ? 'seconds ago' : time;
        return time;
    }
    Time.formatHuman = formatHuman;
    /**
     * Convert a timestring to a date format.
     *
     * @param value - The date timestring or date object.
     *
     * @param format - The format string.
     *
     * @returns A formatted date.
     */
    function format(value, timeFormat = 'YYYY-MM-DD HH:mm') {
        return moment_1.default(value).format(timeFormat);
    }
    Time.format = format;
})(Time = exports.Time || (exports.Time = {}));
//# sourceMappingURL=time.js.map