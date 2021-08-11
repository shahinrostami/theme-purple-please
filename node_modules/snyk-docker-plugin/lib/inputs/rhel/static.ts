import {
  ExtractAction,
  ExtractedLayers,
  RedHatRepo,
  RedHatRepos,
} from "../../extractor/types";
import { streamToJson } from "../../stream-utils";

export const getRedHatReposContentAction: ExtractAction = {
  actionName: "redhat-content-manifests",
  filePathMatches: isRedHatContentManifest,
  callback: streamToJson,
};

export function getRedHatReposFromExtractedLayers(
  extractedLayers: ExtractedLayers,
): RedHatRepos {
  const reposByLayer = {};
  for (const filePath in extractedLayers) {
    if (isRedHatContentManifest(filePath)) {
      const content = extractedLayers[filePath][
        "redhat-content-manifests"
      ] as any;
      const layerIndex = content?.metadata?.image_layer_index;
      const repos = content?.content_sets;
      if (layerIndex && repos) {
        reposByLayer[layerIndex] = repos as RedHatRepo;
      }
    }
  }
  return reposByLayer as RedHatRepos;
}

function isRedHatContentManifest(filePath: string): boolean {
  return filePath.startsWith("/root/buildinfo/content_manifests/");
}
