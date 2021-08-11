/// <reference types="node" />
import { Path } from '@yarnpkg/fslib';
export declare enum ErrorCode {
    API_ERROR = "API_ERROR",
    BLACKLISTED = "BLACKLISTED",
    BUILTIN_NODE_RESOLUTION_FAILED = "BUILTIN_NODE_RESOLUTION_FAILED",
    MISSING_DEPENDENCY = "MISSING_DEPENDENCY",
    MISSING_PEER_DEPENDENCY = "MISSING_PEER_DEPENDENCY",
    QUALIFIED_PATH_RESOLUTION_FAILED = "QUALIFIED_PATH_RESOLUTION_FAILED",
    INTERNAL = "INTERNAL",
    UNDECLARED_DEPENDENCY = "UNDECLARED_DEPENDENCY",
    UNSUPPORTED = "UNSUPPORTED"
}
/**
 * Simple helper function that assign an error code to an error, so that it can more easily be caught and used
 * by third-parties.
 */
export declare function makeError(pnpCode: ErrorCode, message: string, data?: Object): Error;
/**
 * Returns the module that should be used to resolve require calls. It's usually the direct parent, except if we're
 * inside an eval expression.
 */
export declare function getIssuerModule(parent: NodeModule | null | undefined): NodeModule | null;
export declare function getPathForDisplay(p: Path): import("@yarnpkg/fslib").NativePath;
