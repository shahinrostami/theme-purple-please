import * as Debug from "debug";
import { createReadStream } from "fs";
import * as gunzip from "gunzip-maybe";
import { normalize as normalizePath, sep as pathSeparator } from "path";
import { PassThrough } from "stream";
import { extract, Extract } from "tar-stream";
import { streamToJson } from "../../stream-utils";
import { extractImageLayer } from "../layer";
import {
  ExtractAction,
  ExtractedLayers,
  OciArchiveManifest,
  OciImageIndex,
  OciManifestInfo,
} from "../types";

const debug = Debug("snyk");

/**
 * Retrieve the products of files content from the specified oci-archive.
 * @param ociArchiveFilesystemPath Path to image file saved in oci-archive format.
 * @param extractActions Array of pattern-callbacks pairs.
 * @returns Array of extracted files products sorted by the reverse order of the layers from last to first.
 */
export async function extractArchive(
  ociArchiveFilesystemPath: string,
  extractActions: ExtractAction[],
): Promise<{
  layers: ExtractedLayers[];
  manifest: OciArchiveManifest;
}> {
  return new Promise((resolve, reject) => {
    const tarExtractor: Extract = extract();

    const layers: Record<string, ExtractedLayers> = {};
    const manifests: Record<string, OciArchiveManifest> = {};
    let imageIndex: OciImageIndex | undefined;

    tarExtractor.on("entry", async (header, stream, next) => {
      if (header.type === "file") {
        const normalizedHeaderName = normalizePath(header.name);
        if (isImageIndexFile(normalizedHeaderName)) {
          imageIndex = await streamToJson<OciImageIndex>(stream);
        } else {
          const jsonStream = new PassThrough();
          const layerStream = new PassThrough();
          stream.pipe(jsonStream);
          stream.pipe(layerStream);

          const promises = [
            streamToJson(jsonStream).catch(() => undefined),
            extractImageLayer(layerStream, extractActions).catch(
              () => undefined,
            ),
          ];
          const [manifest, layer] = await Promise.all(promises);

          // header format is /blobs/hash_name/hash_value
          // we're extracting hash_name:hash_value format to match manifest digest
          const headerParts = normalizedHeaderName.split(pathSeparator);
          const hashName = headerParts[1];
          const hashValue = headerParts[headerParts.length - 1];
          const digest = `${hashName}:${hashValue}`;
          if (isArchiveManifest(manifest)) {
            manifests[digest] = manifest;
          }
          if (layer !== undefined) {
            layers[digest] = layer as ExtractedLayers;
          }
        }
      }

      stream.resume(); // auto drain the stream
      next(); // ready for next entry
    });

    tarExtractor.on("finish", () => {
      try {
        resolve(
          getLayersContentAndArchiveManifest(imageIndex, manifests, layers),
        );
      } catch (error) {
        debug(
          `Error getting layers and manifest content from oci archive: '${JSON.stringify(
            error,
          )}'`,
        );
        reject(new Error("Invalid OCI archive"));
      }
    });

    tarExtractor.on("error", (error) => {
      reject(error);
    });

    createReadStream(ociArchiveFilesystemPath)
      .pipe(gunzip())
      .pipe(tarExtractor);
  });
}

function getLayersContentAndArchiveManifest(
  imageIndex: OciImageIndex | undefined,
  manifestCollection: Record<string, OciArchiveManifest>,
  layers: Record<string, ExtractedLayers>,
): { layers: ExtractedLayers[]; manifest: OciArchiveManifest } {
  // filter empty layers
  // get the layers content without the name
  // reverse layers order from last to first

  // get manifest file first
  const manifest = getManifest(imageIndex, manifestCollection);
  const filteredLayers = manifest.layers
    .filter((layer) => Object.keys(layers[layer.digest]).length !== 0)
    .map((layer) => layers[layer.digest])
    .reverse();

  if (filteredLayers.length === 0) {
    throw new Error("We found no layers in the provided image");
  }

  return {
    layers: filteredLayers,
    manifest,
  };
}

function getManifest(
  imageIndex: OciImageIndex | undefined,
  manifestCollection: Record<string, OciArchiveManifest>,
): OciArchiveManifest {
  if (!imageIndex) {
    return manifestCollection[Object.keys(manifestCollection)[0]];
  }

  const manifestInfo:
    | OciManifestInfo
    | undefined = imageIndex.manifests.find((item) =>
    item.platform
      ? item.platform.architecture === "amd64" && item.platform.os === "linux"
      : item,
  );

  if (manifestInfo === undefined) {
    throw new Error("Unsupported type of CPU architecture or operating system");
  }

  return manifestCollection[manifestInfo.digest];
}

function isArchiveManifest(manifest: any): manifest is OciArchiveManifest {
  return (
    manifest !== undefined && manifest.layers && manifest.layers.length >= 0
  );
}

function isImageIndexFile(name: string): boolean {
  return name === "index.json";
}
