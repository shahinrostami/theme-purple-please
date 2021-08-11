/// <reference types="node" />
import { bufferToHashIndexValues } from './database-pages';
import { bufferToHashValueContent } from './hash-pages';
export { bufferToHashIndexValues, bufferToHashValueContent };
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
export declare function bufferToHashDbValues(data: Buffer): Promise<Buffer[] | never>;
/**
 * Exported for testing
 */
export declare function validateBerkeleyDbMetadata(data: Buffer): void | never;
/**
 * Exported for testing
 */
export declare function validatePageSize(pageSize: number): void | never;
