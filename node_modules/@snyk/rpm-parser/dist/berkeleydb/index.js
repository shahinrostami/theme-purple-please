"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const event_loop_spinner_1 = require("event-loop-spinner");
const database_pages_1 = require("./database-pages");
exports.bufferToHashIndexValues = database_pages_1.bufferToHashIndexValues;
const hash_pages_1 = require("./hash-pages");
exports.bufferToHashValueContent = hash_pages_1.bufferToHashValueContent;
const types_1 = require("./types");
const types_2 = require("../types");
const validPageSizes = [
    512,
    1024,
    2048,
    4096,
    8192,
    16384,
    32768,
    65536,
];
/**
 * Extract the RPM package contents from a BerkeleyDB. Note that the contents
 * are returned as a Buffer of data for every package and that they need to be further
 * processed to extract meaningful package information.
 *
 * This implementation is interested in finding only data blobs of type Hash DB.
 *
 * The BerkeleyDB that we are interested in contains only the following pages:
 * - A metadata page -- the first page (index 0) of the database.
 * - A Hash DB page -- this page basically tells us where to find the data in the BerkeleyDB.
 * - An Overflow page -- this page contains the data. The data may span multiple pages (hence "overflow" pages).
 * @param data The contents of a BerkeleyDB database.
 */
async function bufferToHashDbValues(data) {
    validateBerkeleyDbMetadata(data);
    const pageSize = data.readUInt32LE(20);
    validatePageSize(pageSize);
    const lastPageNumber = data.readUInt32LE(32);
    const result = new Array();
    // The 0th index page is the database metadata page, so start from the 1st index page.
    for (let pageNumber = 1; pageNumber < lastPageNumber; pageNumber++) {
        const pageStart = pageNumber * pageSize;
        const pageEnd = pageStart + pageSize;
        const pageType = data[pageStart + 25];
        // Look only for HASH pages, we will traverse their content in subsequent steps.
        if (pageType !== types_1.DatabasePageType.P_HASH) {
            continue;
        }
        const page = data.slice(pageStart, pageEnd);
        const entries = page.readUInt16LE(20);
        // Hash DB entries come in key/value pairs. We are only interested in the values.
        const hashIndex = database_pages_1.bufferToHashIndexValues(page, entries);
        for (const hashPage of hashIndex) {
            const valuePageType = page[hashPage];
            // Only Overflow pages contain package data, skip anything else.
            if (valuePageType !== types_1.HashPageType.H_OFFPAGE) {
                continue;
            }
            // Traverse the page to concatenate the data that may span multiple pages.
            const valueContent = hash_pages_1.bufferToHashValueContent(data, page, hashPage, pageSize);
            result.push(valueContent);
        }
        if (event_loop_spinner_1.eventLoopSpinner.isStarving()) {
            await event_loop_spinner_1.eventLoopSpinner.spin();
        }
    }
    return result;
}
exports.bufferToHashDbValues = bufferToHashDbValues;
/**
 * Exported for testing
 */
function validateBerkeleyDbMetadata(data) {
    // We are only interested in Hash DB. Other types are B-Tree, Queue, Heap, etc.
    const magicNumber = data.readUInt32LE(12);
    if (magicNumber !== types_1.MagicNumber.DB_HASH) {
        throw new types_2.ParserError('Unexpected database magic number', { magicNumber });
    }
    // The first page of the database must be a Hash DB metadata page.
    const pageType = data.readUInt8(25);
    if (pageType !== types_1.DatabasePageType.P_HASHMETA) {
        throw new types_2.ParserError('Unexpected page type', { pageType });
    }
    const encryptionAlgorithm = data.readUInt8(24);
    if (encryptionAlgorithm !== 0) {
        throw new types_2.ParserError('Encrypted databases are not supported', {
            encryptionAlgorithm,
        });
    }
    // We will be pre-allocating some memory for the entries in the database.
    // Choose a very high, possibly unrealistic number, for the number of installed
    // packages on the system. We don't want to allocate too much memory.
    const entriesCount = data.readUInt32LE(88);
    if (entriesCount < 0 || entriesCount > 50000) {
        throw new types_2.ParserError('Invalid number of entries in the database', {
            entriesCount,
        });
    }
}
exports.validateBerkeleyDbMetadata = validateBerkeleyDbMetadata;
/**
 * Exported for testing
 */
function validatePageSize(pageSize) {
    if (!validPageSizes.includes(pageSize)) {
        throw new types_2.ParserError('Invalid page size', { pageSize });
    }
}
exports.validatePageSize = validatePageSize;
//# sourceMappingURL=index.js.map