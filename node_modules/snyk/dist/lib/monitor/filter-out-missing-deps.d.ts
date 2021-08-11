import { DepTree } from '../types';
interface FilteredDepTree {
    filteredDepTree: DepTree;
    missingDeps: string[];
}
export declare function filterOutMissingDeps(depTree: DepTree): FilteredDepTree;
export {};
