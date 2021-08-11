import { legacyPlugin as pluginApi } from '@snyk/cli-interface';
export declare function ModuleInfo(plugin: any, policy: any): {
    inspect(root: any, targetFile: any, options: any): Promise<pluginApi.SinglePackageResult | pluginApi.MultiProjectResult>;
};
