/// <reference types="node" />
import { ImageType } from "../types";
import { ExtractAction, ExtractedLayers, ExtractionResult } from "./types";
/**
 * Given a path on the file system to a image archive, open it up to inspect the layers
 * and look for specific files. File content can be transformed with a custom callback function if needed.
 * @param fileSystemPath Path to an existing archive.
 * @param extractActions This denotes a file pattern to look for and how to transform the file if it is found.
 * By default the file is returned raw if no processing is desired.
 */
export declare function extractImageContent(imageType: ImageType, fileSystemPath: string, extractActions: ExtractAction[]): Promise<ExtractionResult>;
export declare function getContentAsBuffer(extractedLayers: ExtractedLayers, extractAction: ExtractAction): Buffer | undefined;
export declare function getContentAsString(extractedLayers: ExtractedLayers, extractAction: ExtractAction): string | undefined;
