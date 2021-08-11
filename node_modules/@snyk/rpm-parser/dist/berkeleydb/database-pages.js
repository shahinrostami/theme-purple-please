"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const types_2 = require("../types");
/**
 * Extract the values from a hash index, which is stored in a Hash DB page.
 * The hash index contains key/value pairs. The key is usually some number
 * which is not relevant to the application. This function returns only the
 * values stored in the index.
 * @param data A database page.
 * @param entries How many entries are stored in the index.
 */
function bufferToHashIndexValues(page, entries) {
    // Hash table entries are always stored in pairs of 2.
    if (entries % 2 !== 0) {
        const pageNumber = page.readUInt32LE(8);
        throw new types_2.ParserError('The number of entries must be a multiple of 2', {
            entries,
            pageNumber,
        });
    }
    // Every entry is a 2-byte offset that points somewhere in the current database page.
    const hashIndexSize = entries * types_1.HASH_INDEX_ENTRY_SIZE;
    const hashIndex = page.slice(types_1.DATABASE_PAGE_HEADER_SIZE, types_1.DATABASE_PAGE_HEADER_SIZE + hashIndexSize);
    // We only want the values, not the keys. Data is stored in key/value pairs.
    // The following skips over all keys and stores only the values. An entry is 2 bytes long.
    const keyValuePairSize = 2 * types_1.HASH_INDEX_ENTRY_SIZE;
    const hashIndexValues = hashIndex.reduce((values, _, byteOffset) => {
        // Is the current byte the start of a value?
        if ((byteOffset - types_1.HASH_INDEX_ENTRY_SIZE) % keyValuePairSize === 0) {
            const value = hashIndex.readInt16LE(byteOffset);
            values.push(value);
        }
        return values;
    }, new Array());
    return hashIndexValues;
}
exports.bufferToHashIndexValues = bufferToHashIndexValues;
//# sourceMappingURL=database-pages.js.map