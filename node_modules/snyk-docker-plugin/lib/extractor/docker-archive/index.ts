import { normalize as normalizePath } from "path";
import {
  getLayersFromPackages,
  getPackagesFromRunInstructions,
} from "../../dockerfile/instruction-parser";
import { AutoDetectedUserInstructions, HashAlgorithm } from "../../types";

import { DockerArchiveImageConfig, DockerArchiveManifest } from "../types";
export { extractArchive } from "./layer";

export function getManifestLayers(manifest: DockerArchiveManifest) {
  return manifest.Layers.map((layer) => normalizePath(layer));
}

export function getImageIdFromManifest(
  manifest: DockerArchiveManifest,
): string {
  try {
    const imageId = manifest.Config.split(".")[0];
    if (imageId.includes(":")) {
      // imageId includes the algorithm prefix
      return imageId;
    }
    return `${HashAlgorithm.Sha256}:${imageId}`;
  } catch (err) {
    throw new Error("Failed to extract image ID from archive manifest");
  }
}

export function getRootFsLayersFromConfig(
  imageConfig: DockerArchiveImageConfig,
): string[] {
  try {
    return imageConfig.rootfs.diff_ids;
  } catch (err) {
    throw new Error("Failed to extract rootfs array from image config");
  }
}

export function getPlatformFromConfig(
  imageConfig: DockerArchiveImageConfig,
): string | undefined {
  return imageConfig.os && imageConfig.architecture
    ? `${imageConfig.os}/${imageConfig.architecture}`
    : undefined;
}

export function getDetectedLayersInfoFromConfig(
  imageConfig,
): AutoDetectedUserInstructions {
  const runInstructions = getUserInstructionLayersFromConfig(imageConfig)
    .filter((instruction) => !instruction.empty_layer && instruction.created_by)
    .map((instruction) => instruction.created_by.replace("# buildkit", ""));

  const dockerfilePackages = getPackagesFromRunInstructions(runInstructions);
  const dockerfileLayers = getLayersFromPackages(dockerfilePackages);
  return { dockerfilePackages, dockerfileLayers };
}

export function getUserInstructionLayersFromConfig(imageConfig) {
  const diffInHours = (d1, d2) => Math.abs(d1 - d2) / 1000 / (60 * 60);
  const maxDiffInHours = 5;

  const history = imageConfig.history;
  if (!history) {
    return [];
  }
  const lastInstructionTime = new Date(history.slice(-1)[0].created);
  const userInstructionLayers = history.filter((layer) => {
    return (
      diffInHours(new Date(layer.created), lastInstructionTime) <=
      maxDiffInHours
    );
  });
  // should only happen if there are no layers created by user instructions
  if (userInstructionLayers.length === history.length) {
    return [];
  }
  return userInstructionLayers;
}
