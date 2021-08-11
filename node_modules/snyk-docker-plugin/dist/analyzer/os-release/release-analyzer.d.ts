import { OSRelease } from "../types";
export declare function tryOSRelease(text: string): Promise<OSRelease | null>;
export declare function tryLsbRelease(text: string): Promise<OSRelease | null>;
export declare function tryDebianVersion(text: string): Promise<OSRelease | null>;
export declare function tryAlpineRelease(text: string): Promise<OSRelease | null>;
export declare function tryRedHatRelease(text: string): Promise<OSRelease | null>;
export declare function tryCentosRelease(text: string): Promise<OSRelease | null>;
export declare function tryOracleRelease(text: string): Promise<OSRelease | null>;
