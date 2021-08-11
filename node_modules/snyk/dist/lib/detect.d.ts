import { SupportedPackageManagers } from './package-managers';
export declare const AUTO_DETECTABLE_FILES: string[];
export declare function isPathToPackageFile(path: string): boolean;
export declare function detectPackageManager(root: string, options: any): any;
export declare function localFileSuppliedButNotFound(root: any, file: any): boolean;
export declare function isLocalFolder(root: string): boolean;
export declare function detectPackageFile(root: any): string | undefined;
export declare function detectPackageManagerFromFile(file: string): SupportedPackageManagers;
