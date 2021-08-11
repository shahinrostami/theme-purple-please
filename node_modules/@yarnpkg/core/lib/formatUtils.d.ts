import { Configuration } from './Configuration';
import { Report } from './Report';
import { Descriptor, Locator, Ident, PackageExtension } from './types';
export declare enum Type {
    NO_HINT = "NO_HINT",
    NULL = "NULL",
    SCOPE = "SCOPE",
    NAME = "NAME",
    RANGE = "RANGE",
    REFERENCE = "REFERENCE",
    NUMBER = "NUMBER",
    PATH = "PATH",
    URL = "URL",
    ADDED = "ADDED",
    REMOVED = "REMOVED",
    CODE = "CODE",
    DURATION = "DURATION",
    SIZE = "SIZE",
    IDENT = "IDENT",
    DESCRIPTOR = "DESCRIPTOR",
    LOCATOR = "LOCATOR",
    RESOLUTION = "RESOLUTION",
    DEPENDENT = "DEPENDENT",
    PACKAGE_EXTENSION = "PACKAGE_EXTENSION"
}
export declare enum Style {
    BOLD = 2
}
export declare const supportsColor: boolean;
export declare const supportsHyperlinks: boolean;
declare const transforms: {
    NUMBER: {
        pretty: (configuration: any, val: number) => string;
        json: (val: number) => any;
    };
    IDENT: {
        pretty: (configuration: any, val: Ident) => string;
        json: (val: Ident) => any;
    };
    LOCATOR: {
        pretty: (configuration: any, val: Locator) => string;
        json: (val: Locator) => any;
    };
    DESCRIPTOR: {
        pretty: (configuration: any, val: Descriptor) => string;
        json: (val: Descriptor) => any;
    };
    RESOLUTION: {
        pretty: (configuration: any, val: {
            descriptor: Descriptor;
            locator: Locator | null;
        }) => string;
        json: (val: {
            descriptor: Descriptor;
            locator: Locator | null;
        }) => any;
    };
    DEPENDENT: {
        pretty: (configuration: any, val: {
            locator: Locator;
            descriptor: Descriptor;
        }) => string;
        json: (val: {
            locator: Locator;
            descriptor: Descriptor;
        }) => any;
    };
    PACKAGE_EXTENSION: {
        pretty: (configuration: any, val: PackageExtension) => string;
        json: (val: PackageExtension) => any;
    };
    DURATION: {
        pretty: (configuration: any, val: number) => string;
        json: (val: number) => any;
    };
    SIZE: {
        pretty: (configuration: any, val: number) => string;
        json: (val: number) => any;
    };
    PATH: {
        pretty: (configuration: any, val: string) => string;
        json: (val: string) => any;
    };
};
declare type AllTransforms = typeof transforms;
export declare type Source<T> = T extends keyof AllTransforms ? Parameters<AllTransforms[T]['json']>[0] | null : string | null;
export declare type Tuple<T extends Type = Type> = readonly [Source<T>, T];
export declare function tuple<T extends Type>(formatType: T, value: Source<T>): Tuple<T>;
export declare function applyStyle(configuration: Configuration, text: string, flags: Style): string;
export declare function applyColor(configuration: Configuration, value: string, formatType: Type | string): string;
export declare function pretty<T extends Type>(configuration: Configuration, value: Source<T>, formatType: T | string): string;
export declare function prettyList<T extends Type>(configuration: Configuration, values: Iterable<Source<T>>, formatType: T | string, { separator }?: {
    separator?: string;
}): string;
export declare function json<T extends Type>(value: Source<T>, formatType: T | string): any;
export declare function mark(configuration: Configuration): {
    Check: string;
    Cross: string;
    Question: string;
};
export declare enum LogLevel {
    Error = "error",
    Warning = "warning",
    Info = "info",
    Discard = "discard"
}
/**
 * Add support support for the `logFilters` setting to the specified Report
 * instance.
 */
export declare function addLogFilterSupport(report: Report, { configuration }: {
    configuration: Configuration;
}): void;
export {};
