/// <reference types="node" />
/**
 * Traverse the data (overflow) pages and extract the data.
 * The data may be spread over multiple pages, so for every page we need to:
 * 1. Strip the page header of every page.
 * 2. Collate with data collected so far.
 * 3. Make sure to read the right data offset if we reach the last page.
 * The pages are not in order, so we may have to jump all across the BerkeleyDB file.
 * This is why we also need a Buffer to the database contents.
 * @param berkeleydb The contents of the database.
 * @param page Which page to start looking from. This should be an Overflow page.
 * @param pageStartOffset Which byte in the BerkeleyDB points to the start of the page.
 * @param pageSizeBytes How big is every page (typically it would be 4096 bytes).
 */
export declare function bufferToHashValueContent(berkeleydb: Buffer, page: Buffer, pageStartOffset: number, pageSizeBytes: number): Buffer;
