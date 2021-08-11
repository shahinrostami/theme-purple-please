interface File {
    name: string;
    contents: string;
}
export interface Files {
    gemfileLock?: File;
    gemspec?: File;
}
export declare function tryGetSpec(dir: string, name: string): Promise<File | null>;
export {};
