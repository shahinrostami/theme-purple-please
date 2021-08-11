/// <reference types="node" />
import { types } from "@snyk/docker-registry-v2-client";
import * as fs from "fs";
export interface Layer {
    config: types.LayerConfig;
    blob: Buffer;
}
export declare const readDir: typeof fs.readdir.__promisify__;
export declare const readFile: typeof fs.readFile.__promisify__;
export declare const unlink: typeof fs.unlink.__promisify__;
