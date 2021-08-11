/// <reference types="node" />
/**
 * Extract the values from a hash index, which is stored in a Hash DB page.
 * The hash index contains key/value pairs. The key is usually some number
 * which is not relevant to the application. This function returns only the
 * values stored in the index.
 * @param data A database page.
 * @param entries How many entries are stored in the index.
 */
export declare function bufferToHashIndexValues(page: Buffer, entries: number): number[];
