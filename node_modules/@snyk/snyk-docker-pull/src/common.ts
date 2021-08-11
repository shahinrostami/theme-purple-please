import { types } from "@snyk/docker-registry-v2-client";
import * as fs from "fs";
import { promisify } from "util";

export interface Layer {
  config: types.LayerConfig;
  blob: Buffer;
}

export const readDir = promisify(fs.readdir);
export const readFile = promisify(fs.readFile);
export const unlink = promisify(fs.unlink);
