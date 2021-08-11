import { normalize as normalizePath } from "path";
import { ImageType } from "./types";

export function getImageType(targetImage: string): ImageType {
  const imageIdentifier = targetImage.split(":")[0];
  switch (imageIdentifier) {
    case "docker-archive":
      return ImageType.DockerArchive;

    case "oci-archive":
      return ImageType.OciArchive;

    default:
      return ImageType.Identifier;
  }
}

export function getArchivePath(targetImage: string): string {
  if (
    !targetImage.startsWith("docker-archive:") &&
    !targetImage.startsWith("oci-archive:")
  ) {
    throw new Error(
      'The provided archive path is missing a prefix, for example "docker-archive:" or "oci-archive:"',
    );
  }

  return targetImage.indexOf("docker-archive:") !== -1
    ? normalizePath(targetImage.substring("docker-archive:".length))
    : normalizePath(targetImage.substring("oci-archive:".length));
}
