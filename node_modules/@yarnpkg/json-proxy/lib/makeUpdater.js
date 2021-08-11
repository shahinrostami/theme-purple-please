"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAndSave = exports.makeUpdater = void 0;
const fslib_1 = require("@yarnpkg/fslib");
const makeTracker_1 = require("./makeTracker");
async function makeUpdater(filename) {
    let indent = `  `;
    let obj;
    if (fslib_1.xfs.existsSync(filename)) {
        const content = await fslib_1.xfs.readFilePromise(filename, `utf8`);
        const indentMatch = content.match(/^[ \t]+/m);
        if (indentMatch)
            indent = indentMatch[0];
        obj = JSON.parse(content || `{}`);
    }
    if (!obj)
        obj = {};
    const tracker = makeTracker_1.makeTracker(obj);
    const initial = tracker.immutable;
    return {
        open(cb) {
            tracker.open(cb);
        },
        async save() {
            if (tracker.immutable === initial)
                return;
            const data = `${JSON.stringify(tracker.immutable, null, indent)}\n`;
            await fslib_1.xfs.writeFilePromise(filename, data);
        },
    };
}
exports.makeUpdater = makeUpdater;
async function updateAndSave(filename, cb) {
    const updater = await makeUpdater(filename);
    updater.open(cb);
    await updater.save();
}
exports.updateAndSave = updateAndSave;
