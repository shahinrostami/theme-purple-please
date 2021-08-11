declare const Configstore: any;
export declare class ConfigStoreWithEnvironmentVariables extends Configstore {
    constructor(id: any, defaults?: undefined, options?: {});
    get(key: string): string | undefined;
}
export declare const config: ConfigStoreWithEnvironmentVariables;
export {};
