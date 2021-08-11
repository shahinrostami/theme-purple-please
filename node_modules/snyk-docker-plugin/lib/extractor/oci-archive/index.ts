import { OciArchiveManifest } from "../types";

export { extractArchive } from "./layer";

export function getManifestLayers(manifest: OciArchiveManifest) {
  return manifest.layers.map((layer) => layer.digest);
}

export function getImageIdFromManifest(manifest: OciArchiveManifest): string {
  try {
    return manifest.config.digest;
  } catch (err) {
    throw new Error("Failed to extract image ID from archive manifest");
  }
}
