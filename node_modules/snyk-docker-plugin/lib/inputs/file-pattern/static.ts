import * as minimatch from "minimatch";
import * as path from "path";

import { ExtractAction, ExtractedLayers } from "../../extractor/types";
import { streamToString } from "../../stream-utils";
import { ManifestFile } from "../../types";

function generatePathMatcher(
  globsInclude: string[],
  globsExclude: string[],
): (filePath: string) => boolean {
  return (filePath: string): boolean => {
    let exclude = false;
    for (const g of globsExclude) {
      if (!exclude && minimatch(filePath, g)) {
        exclude = true;
      }
    }
    if (!exclude) {
      for (const g of globsInclude) {
        if (minimatch(filePath, g)) {
          return true;
        }
      }
    }
    return false;
  };
}

export function generateExtractAction(
  globsInclude: string[],
  globsExclude: string[],
): ExtractAction {
  return {
    actionName: "find-files-by-pattern",
    filePathMatches: generatePathMatcher(globsInclude, globsExclude),
    callback: (dataStream, streamSize) =>
      streamToString(dataStream, streamSize, "base64"),
  };
}

export function getMatchingFiles(
  extractedLayers: ExtractedLayers,
): ManifestFile[] {
  const manifestFiles: ManifestFile[] = [];

  for (const filePath of Object.keys(extractedLayers)) {
    for (const actionName of Object.keys(extractedLayers[filePath])) {
      if (actionName !== "find-files-by-pattern") {
        continue;
      }

      if (typeof extractedLayers[filePath][actionName] !== "string") {
        throw new Error("expected a string");
      }

      manifestFiles.push({
        name: path.basename(filePath),
        path: path.dirname(filePath),
        contents: extractedLayers[filePath][actionName] as string,
      });
    }
  }

  return manifestFiles;
}
