import * as Debug from "debug";
import * as fs from "fs";
import * as mkdirp from "mkdirp";
import * as path from "path";

import { Docker, DockerOptions } from "../docker";
import {
  ArchiveResult,
  DestinationDir,
  DockerInspectOutput,
  ImageDetails,
} from "./types";

export { getImageArchive, extractImageDetails, pullIfNotLocal };

const debug = Debug("snyk");

async function getInspectResult(
  docker: Docker,
  targetImage: string,
): Promise<DockerInspectOutput> {
  const info = await docker.inspectImage(targetImage);
  return JSON.parse(info.stdout)[0];
}

function cleanupCallback(imageFolderPath: string, imageName: string) {
  return () => {
    const fullImagePath = path.join(imageFolderPath, imageName);
    if (fs.existsSync(fullImagePath)) {
      fs.unlinkSync(fullImagePath);
    }
    fs.rmdir(imageFolderPath, (err) => {
      debug(`Can't remove folder ${imageFolderPath}, got error ${err}`);
    });
  };
}

async function pullWithDockerBinary(
  docker: Docker,
  targetImage: string,
  saveLocation: string,
  username: string | undefined,
  password: string | undefined,
  platform: string | undefined,
): Promise<boolean> {
  let pullAndSaveSuccessful = false;
  try {
    if (username || password) {
      debug(
        "using local docker binary credentials. the credentials you provided will be ignored",
      );
    }
    await docker.pullCli(targetImage, { platform });
    await docker.save(targetImage, saveLocation);
    return (pullAndSaveSuccessful = true);
  } catch (err) {
    debug(
      `couldn't pull ${targetImage} using docker binary: ${JSON.stringify(
        err,
      )}`,
    );

    if (
      err.stderr &&
      err.stderr.includes("unknown operating system or architecture")
    ) {
      throw new Error("Unknown operating system or architecture");
    }

    if (
      err.stderr &&
      err.stderr.includes("operating system is not supported")
    ) {
      throw new Error(`Operating system is not supported`);
    }

    if (err.stderr && err.stderr.includes("no matching manifest for")) {
      if (platform) {
        throw new Error(`The image does not exist for ${platform}`);
      }
      throw new Error(`The image does not exist for the current platform`);
    }

    if (
      err.message &&
      err.message.includes(
        '"--platform" is only supported on a Docker daemon with experimental features enabled',
      )
    ) {
      throw err;
    }

    if (err.stderr && err.stderr.includes("invalid reference format")) {
      throw new Error(`invalid image format`);
    }

    return pullAndSaveSuccessful;
  }
}

async function pullFromContainerRegistry(
  docker: Docker,
  targetImage: string,
  imageSavePath: string,
  username: string | undefined,
  password: string | undefined,
): Promise<void> {
  const { hostname, imageName, tag } = await extractImageDetails(targetImage);
  debug(
    `Attempting to pull: registry: ${hostname}, image: ${imageName}, tag: ${tag}`,
  );
  await docker.pull(
    hostname,
    imageName,
    tag,
    imageSavePath,
    username,
    password,
  );
}

async function pullImage(
  docker: Docker,
  targetImage: string,
  saveLocation: string,
  imageSavePath: string,
  username: string | undefined,
  password: string | undefined,
  platform: string | undefined,
): Promise<void> {
  if (await Docker.binaryExists()) {
    const pullAndSaveSuccessful = await pullWithDockerBinary(
      docker,
      targetImage,
      saveLocation,
      username,
      password,
      platform,
    );
    if (pullAndSaveSuccessful) {
      return;
    }
  }

  await pullFromContainerRegistry(
    docker,
    targetImage,
    imageSavePath,
    username,
    password,
  );
}

/**
 * In the case that an `ImageType.Identifier` is detected we need to produce
 * an image archive, either by saving the image if it's already loaded into
 * the local docker daemon, or by pulling the image from a remote registry and
 * saving it to the filesystem directly.
 *
 * Users may also provide us with a URL to an image in a Docker compatible
 * remote registry.
 *
 * @param {string} targetImage - The image to test, this could be in one of
 *    the following forms:
 *      * [registry/]<repo>/<image>[:tag]
 *      * <repo>/<image>[:tag]
 *      * <image>[:tag]
 *    In the case that a registry is not provided, the plugin will default
 *    this to Docker Hub. If a tag is not provided this will default to
 *    `latest`.
 * @param {string} [username] - Optional username for private repo auth.
 * @param {string} [password] - Optional password for private repo auth.
 * @param {string} [platform] - Optional platform parameter to pull specific image arch.
 */
async function getImageArchive(
  targetImage: string,
  imageSavePath: string,
  username?: string,
  password?: string,
  platform?: string,
): Promise<ArchiveResult> {
  const docker = new Docker();
  mkdirp.sync(imageSavePath);
  const destination: DestinationDir = {
    name: imageSavePath,
    removeCallback: cleanupCallback(imageSavePath, "image.tar"),
  };
  const saveLocation: string = path.join(destination.name, "image.tar");
  let inspectResult: DockerInspectOutput | undefined;

  try {
    inspectResult = await getInspectResult(docker, targetImage);
  } catch {
    debug(`${targetImage} does not exist locally, proceeding to pull image.`);
  }

  if (inspectResult === undefined) {
    await pullImage(
      docker,
      targetImage,
      saveLocation,
      imageSavePath,
      username,
      password,
      platform,
    );

    return {
      path: saveLocation,
      removeArchive: destination.removeCallback,
    };
  }

  if (
    platform !== undefined &&
    inspectResult &&
    !isLocalImageSameArchitecture(platform, inspectResult.Architecture)
  ) {
    await pullImage(
      docker,
      targetImage,
      saveLocation,
      imageSavePath,
      username,
      password,
      platform,
    );
  } else {
    await docker.save(targetImage, saveLocation);
  }

  return {
    path: saveLocation,
    removeArchive: destination.removeCallback,
  };
}

async function extractImageDetails(targetImage: string): Promise<ImageDetails> {
  let remainder: string;
  let hostname: string;
  let imageName: string;
  let tag: string;

  // We need to detect if the `targetImage` is part of a URL. Based on the Docker specification,
  // the hostname should contain a `.` or `:` before the first instance of a `/` otherwise the
  // default hostname will be used (registry-1.docker.io). ref: https://stackoverflow.com/a/37867949
  const i = targetImage.indexOf("/");
  if (
    i === -1 ||
    (!targetImage.substring(0, i).includes(".") &&
      !targetImage.substring(0, i).includes(":") &&
      targetImage.substring(0, i) !== "localhost")
  ) {
    hostname = "registry-1.docker.io";
    remainder = targetImage;
    // First assume the remainder is image@sha
    [imageName, tag] = remainder.split("@");
    if (tag === undefined) {
      [imageName, tag] = remainder.split(":");
    }
    imageName =
      imageName.indexOf("/") === -1 ? "library/" + imageName : imageName;
  } else {
    hostname = targetImage.substring(0, i);
    remainder = targetImage.substring(i + 1);
    [imageName, tag] = remainder.split("@");
    if (tag === undefined) {
      [imageName, tag] = remainder.split(":");
    }
  }

  // Assume the latest tag if no tag was found.
  tag = tag || "latest";

  return {
    hostname,
    imageName,
    tag,
  };
}

function isLocalImageSameArchitecture(
  platformOption: string,
  inspectResultArchitecture: string,
): boolean {
  let platformArchitecture: string;
  try {
    // Note: this is using the same flag/input pattern as the new Docker buildx: eg. linux/arm64/v8
    platformArchitecture = platformOption.split("/")[1];
  } catch (error) {
    debug(`Error parsing platform flag: '${JSON.stringify(error)}'`);
    return false;
  }

  return platformArchitecture === inspectResultArchitecture;
}

async function pullIfNotLocal(targetImage: string, options?: DockerOptions) {
  const docker = new Docker();
  try {
    await docker.inspectImage(targetImage);
    return;
  } catch (err) {
    // image doesn't exist locally
  }
  await docker.pullCli(targetImage);
}
