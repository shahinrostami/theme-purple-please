import { DockerfileParser } from "dockerfile-ast";
import { EOL } from "os";
import { getDockerfileBaseImageName } from "./instruction-parser";
import {
  UpdateDockerfileBaseImageNameErrorCode,
  UpdateDockerfileBaseImageNameResult,
} from "./types";

export { updateDockerfileBaseImageName };

/**
 * Updates the image name of the last from stage, after resolving all aliases
 * @param contents Contents of the Dockerfile to update
 * @param newBaseImageName New base image name Dockerfile contents should be updated to
 */
function updateDockerfileBaseImageName(
  contents: string,
  newBaseImageName: string,
): UpdateDockerfileBaseImageNameResult {
  const dockerfile = DockerfileParser.parse(contents);

  const result = getDockerfileBaseImageName(dockerfile);

  if (result.error) {
    return {
      contents,
      error: {
        code: UpdateDockerfileBaseImageNameErrorCode.BASE_IMAGE_NAME_NOT_FOUND,
      },
    };
  }

  const currentBaseImageName = result.baseImage;

  const fromRanges = dockerfile
    .getFROMs()
    .filter((from) => from.getImage() === currentBaseImageName)
    .map((from) => from.getImageRange()!);

  const argRanges = dockerfile
    .getARGs()
    .filter((arg) => arg.getProperty()?.getValue() === currentBaseImageName)
    .map((arg) => arg.getProperty()?.getValueRange()!);

  const ranges = fromRanges.concat(argRanges);

  if (ranges.length === 0) {
    /**
     * This happens when the image is split over multiple FROM and ARG statements
     * making it difficult to update Dockerfiles that fall into these edge cases.
     * e.g.:
     *    ARG REPO=repo
     *    ARG TAG=tag
     *    FROM ${REPO}:${TAG}
     */
    return {
      contents,
      error: {
        code: UpdateDockerfileBaseImageNameErrorCode.BASE_IMAGE_NAME_FRAGMENTED,
      },
    };
  }

  const lines = contents.split(EOL);

  for (const range of ranges) {
    const lineNumber = range.start.line;
    const start = range.start.character;
    const end = range.end.character;

    const content = lines[lineNumber];
    const updated =
      content.substring(0, start) + newBaseImageName + content.substring(end);
    lines[lineNumber] = updated;
  }

  const updatedContents = lines.join(EOL);
  const updatedDockerfile = DockerfileParser.parse(updatedContents);

  if (
    dockerfile.getInstructions().length !==
    updatedDockerfile.getInstructions().length
  ) {
    return {
      contents,
      error: {
        code:
          UpdateDockerfileBaseImageNameErrorCode.DOCKERFILE_GENERATION_FAILED,
      },
    };
  }

  return {
    contents: updatedContents,
  };
}
