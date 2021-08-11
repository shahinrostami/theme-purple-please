import { DockerfileParser } from "dockerfile-ast";
import * as fs from "fs";
import { normalize as normalizePath } from "path";
import {
  getDockerfileBaseImageName,
  getLayersFromPackages,
  getPackagesFromDockerfile,
  instructionDigest,
} from "./instruction-parser";
import { updateDockerfileBaseImageName } from "./instruction-updater";
import { DockerFileAnalysis } from "./types";

export {
  analyseDockerfile,
  readDockerfileAndAnalyse,
  instructionDigest,
  getPackagesFromDockerfile,
  getDockerfileBaseImageName,
  updateDockerfileBaseImageName,
  DockerFileAnalysis,
};

async function readDockerfileAndAnalyse(
  dockerfilePath?: string,
): Promise<DockerFileAnalysis | undefined> {
  if (!dockerfilePath) {
    return undefined;
  }

  const contents = await readFile(normalizePath(dockerfilePath));
  return analyseDockerfile(contents);
}

async function analyseDockerfile(
  contents: string,
): Promise<DockerFileAnalysis> {
  const dockerfile = DockerfileParser.parse(contents);
  const baseImageResult = getDockerfileBaseImageName(dockerfile);
  const dockerfilePackages = getPackagesFromDockerfile(dockerfile);
  const dockerfileLayers = getLayersFromPackages(dockerfilePackages);
  return {
    baseImage: baseImageResult.baseImage,
    dockerfilePackages,
    dockerfileLayers,
    error: baseImageResult.error,
  };
}

async function readFile(path: string) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", (err, data) => {
      return err ? reject(err) : resolve(data);
    });
  }) as Promise<string>;
}
