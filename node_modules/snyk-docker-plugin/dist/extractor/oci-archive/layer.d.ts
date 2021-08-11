import { ExtractAction, ExtractedLayers, OciArchiveManifest } from "../types";
/**
 * Retrieve the products of files content from the specified oci-archive.
 * @param ociArchiveFilesystemPath Path to image file saved in oci-archive format.
 * @param extractActions Array of pattern-callbacks pairs.
 * @returns Array of extracted files products sorted by the reverse order of the layers from last to first.
 */
export declare function extractArchive(ociArchiveFilesystemPath: string, extractActions: ExtractAction[]): Promise<{
    layers: ExtractedLayers[];
    manifest: OciArchiveManifest;
}>;
