"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const event_loop_spinner_1 = require("event-loop-spinner");
const types_1 = require("./types");
const types_2 = require("../types");
/**
 * Iterate through RPM metadata entries to build the full package data.
 * @param entries Entries that were previously extracted from a BerkeleyDB blob.
 */
async function getPackageInfo(entries) {
    const packageInfo = {};
    for (const entry of entries) {
        switch (entry.info.tag) {
            case types_1.RpmTag.NAME:
                if (entry.info.type !== types_1.RpmType.STRING) {
                    throw new types_2.ParserError('Unexpected type for name tag', {
                        type: entry.info.type,
                    });
                }
                packageInfo.name = extractString(entry.data);
                break;
            case types_1.RpmTag.RELEASE:
                if (entry.info.type !== types_1.RpmType.STRING) {
                    throw new types_2.ParserError('Unexpected type for release tag', {
                        type: entry.info.type,
                    });
                }
                packageInfo.release = extractString(entry.data);
                break;
            case types_1.RpmTag.ARCH:
                if (entry.info.type !== types_1.RpmType.STRING) {
                    throw new types_2.ParserError('Unexpected type for arch tag', {
                        type: entry.info.type,
                    });
                }
                packageInfo.arch = extractString(entry.data);
                break;
            case types_1.RpmTag.EPOCH:
                if (entry.info.type !== types_1.RpmType.INT32) {
                    throw new types_2.ParserError('Unexpected type for epoch tag', {
                        type: entry.info.type,
                    });
                }
                packageInfo.epoch = entry.data.readInt32BE(0);
                break;
            case types_1.RpmTag.SIZE:
                if (entry.info.type !== types_1.RpmType.INT32) {
                    throw new types_2.ParserError('Unexpected type for size tag', {
                        type: entry.info.type,
                    });
                }
                packageInfo.size = entry.data.readInt32BE(0);
                break;
            case types_1.RpmTag.VERSION:
                if (entry.info.type !== types_1.RpmType.STRING) {
                    throw new types_2.ParserError('Unexpected type for version tag', {
                        type: entry.info.type,
                    });
                }
                packageInfo.version = extractString(entry.data);
                break;
            default:
                break;
        }
        if (event_loop_spinner_1.eventLoopSpinner.isStarving()) {
            await event_loop_spinner_1.eventLoopSpinner.spin();
        }
    }
    return isPackageInfo(packageInfo) ? packageInfo : undefined;
}
exports.getPackageInfo = getPackageInfo;
/**
 * The content may be padded with zeros so we can't directly convert it to string.
 * Find the first 0 byte which indicates where the string ends.
 */
function extractString(data) {
    const contentEnd = data.indexOf(0);
    return data.slice(0, contentEnd).toString('utf-8');
}
/**
 * Type checks to assert we are dealing with the expected type.
 */
function isPackageInfo(packageInfo) {
    return (packageInfo.name !== undefined &&
        packageInfo.version !== undefined &&
        packageInfo.release !== undefined &&
        packageInfo.size !== undefined);
}
//# sourceMappingURL=extensions.js.map