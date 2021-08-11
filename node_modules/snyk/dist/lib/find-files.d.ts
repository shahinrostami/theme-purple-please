/// <reference types="node" />
import * as fs from 'fs';
/**
 * Returns files inside given file path.
 *
 * @param path file path.
 */
export declare function readDirectory(path: string): Promise<string[]>;
/**
 * Returns file stats object for given file path.
 *
 * @param path path to file or directory.
 */
export declare function getStats(path: string): Promise<fs.Stats>;
interface FindFilesRes {
    files: string[];
    allFilesFound: string[];
}
/**
 * Find all files in given search path. Returns paths to files found.
 *
 * @param path file path to search.
 * @param ignore (optional) files to ignore. Will always ignore node_modules.
 * @param filter (optional) file names to find. If not provided all files are returned.
 * @param levelsDeep (optional) how many levels deep to search, defaults to two, this path and one sub directory.
 */
export declare function find(path: string, ignore?: string[], filter?: string[], levelsDeep?: number): Promise<FindFilesRes>;
export {};
