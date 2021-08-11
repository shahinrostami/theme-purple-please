"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Every entry in the index is a 2-byte offset that points somewhere in the current database page.
 */
exports.HASH_INDEX_ENTRY_SIZE = 2;
/**
 * Every DB page has a 26 bytes header at the start of the page.
 */
exports.DATABASE_PAGE_HEADER_SIZE = 26;
/**
 * Every BerkeleyDB will contain a magic number that additionally proves that
 * the file is of a particular type.
 */
var MagicNumber;
(function (MagicNumber) {
    MagicNumber[MagicNumber["DB_HASH"] = 398689] = "DB_HASH";
})(MagicNumber = exports.MagicNumber || (exports.MagicNumber = {}));
/**
 * Every page in the database has a particular type.
 * These are the only types we need for fully reading the list of packages.
 */
var DatabasePageType;
(function (DatabasePageType) {
    DatabasePageType[DatabasePageType["P_OVERFLOW"] = 7] = "P_OVERFLOW";
    DatabasePageType[DatabasePageType["P_HASHMETA"] = 8] = "P_HASHMETA";
    DatabasePageType[DatabasePageType["P_HASH"] = 13] = "P_HASH";
})(DatabasePageType = exports.DatabasePageType || (exports.DatabasePageType = {}));
/**
 * We are only interested in Hash pages of type Overflow since they are the only ones containing data.
 */
var HashPageType;
(function (HashPageType) {
    HashPageType[HashPageType["H_OFFPAGE"] = 3] = "H_OFFPAGE";
})(HashPageType = exports.HashPageType || (exports.HashPageType = {}));
//# sourceMappingURL=types.js.map