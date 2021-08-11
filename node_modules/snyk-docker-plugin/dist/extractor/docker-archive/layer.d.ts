import { ExtractAction, ExtractedLayersAndManifest } from "../types";
/**
 * Retrieve the products of files content from the specified docker-archive.
 * @param dockerArchiveFilesystemPath Path to image file saved in docker-archive format.
 * @param extractActions Array of pattern-callbacks pairs.
 * @returns Array of extracted files products sorted by the reverse order of the layers from last to first.
 */
export declare function extractArchive(dockerArchiveFilesystemPath: string, extractActions: ExtractAction[]): Promise<ExtractedLayersAndManifest>;
