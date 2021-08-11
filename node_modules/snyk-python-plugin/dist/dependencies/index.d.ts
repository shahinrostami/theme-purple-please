import { legacyPlugin as api } from '@snyk/cli-interface';
export interface PythonInspectOptions {
    command?: string;
    allowMissing?: boolean;
    args?: string[];
}
declare type Options = api.SingleSubprojectInspectOptions & PythonInspectOptions;
export declare function getDependencies(root: string, targetFile: string, options?: Options): Promise<api.SinglePackageResult>;
export {};
