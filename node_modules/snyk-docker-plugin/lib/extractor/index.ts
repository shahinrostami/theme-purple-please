import { ImageType } from "../types";
import * as dockerExtractor from "./docker-archive";
import * as ociExtractor from "./oci-archive";
import {
  ExtractAction,
  ExtractedLayers,
  ExtractionResult,
  FileContent,
} from "./types";

/**
 * Given a path on the file system to a image archive, open it up to inspect the layers
 * and look for specific files. File content can be transformed with a custom callback function if needed.
 * @param fileSystemPath Path to an existing archive.
 * @param extractActions This denotes a file pattern to look for and how to transform the file if it is found.
 * By default the file is returned raw if no processing is desired.
 */
export async function extractImageContent(
  imageType: ImageType,
  fileSystemPath: string,
  extractActions: ExtractAction[],
): Promise<ExtractionResult> {
  switch (imageType) {
    case ImageType.OciArchive:
      const ociArchive = await ociExtractor.extractArchive(
        fileSystemPath,
        extractActions,
      );

      return {
        imageId: ociExtractor.getImageIdFromManifest(ociArchive.manifest),
        manifestLayers: ociExtractor.getManifestLayers(ociArchive.manifest),
        extractedLayers: layersWithLatestFileModifications(ociArchive.layers),
      };
    default:
      const dockerArchive = await dockerExtractor.extractArchive(
        fileSystemPath,
        extractActions,
      );

      return {
        imageId: dockerExtractor.getImageIdFromManifest(dockerArchive.manifest),
        manifestLayers: dockerExtractor.getManifestLayers(
          dockerArchive.manifest,
        ),
        extractedLayers: layersWithLatestFileModifications(
          dockerArchive.layers,
        ),
        rootFsLayers: dockerExtractor.getRootFsLayersFromConfig(
          dockerArchive.imageConfig,
        ),
        autoDetectedUserInstructions: dockerExtractor.getDetectedLayersInfoFromConfig(
          dockerArchive.imageConfig,
        ),
        platform: dockerExtractor.getPlatformFromConfig(
          dockerArchive.imageConfig,
        ),
        imageLabels: dockerArchive.imageConfig.config.Labels,
      };
  }
}

function layersWithLatestFileModifications(
  layers: ExtractedLayers[],
): ExtractedLayers {
  const extractedLayers: ExtractedLayers = {};
  // TODO: This removes the information about the layer name, maybe we would need it in the future?
  for (const layer of layers) {
    // go over extracted files products found in this layer
    for (const filename of Object.keys(layer)) {
      // file was not found
      if (!Reflect.has(extractedLayers, filename)) {
        extractedLayers[filename] = layer[filename];
      }
    }
  }
  return extractedLayers;
}

function isBufferType(type: FileContent): type is Buffer {
  return (type as Buffer).buffer !== undefined;
}

function isStringType(type: FileContent): type is string {
  return (type as string).substring !== undefined;
}

export function getContentAsBuffer(
  extractedLayers: ExtractedLayers,
  extractAction: ExtractAction,
): Buffer | undefined {
  const content = getContent(extractedLayers, extractAction);
  return content !== undefined && isBufferType(content) ? content : undefined;
}

export function getContentAsString(
  extractedLayers: ExtractedLayers,
  extractAction: ExtractAction,
): string | undefined {
  const content = getContent(extractedLayers, extractAction);
  return content !== undefined && isStringType(content) ? content : undefined;
}

function getContent(
  extractedLayers: ExtractedLayers,
  extractAction: ExtractAction,
): FileContent | undefined {
  const fileNames = Object.keys(extractedLayers);
  const fileNamesProducedByTheExtractAction = fileNames.filter(
    (name) => extractAction.actionName in extractedLayers[name],
  );

  const firstFileNameMatch = fileNamesProducedByTheExtractAction.find((match) =>
    extractAction.filePathMatches(match),
  );

  return firstFileNameMatch !== undefined
    ? extractedLayers[firstFileNameMatch][extractAction.actionName]
    : undefined;
}
