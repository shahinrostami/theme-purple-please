import { normalize as normalizePath } from "path";
import { IAptFiles } from "../../analyzer/types";
import { getContentAsString } from "../../extractor";
import { ExtractAction, ExtractedLayers } from "../../extractor/types";
import { streamToString } from "../../stream-utils";

export const getDpkgFileContentAction: ExtractAction = {
  actionName: "dpkg",
  filePathMatches: (filePath) =>
    filePath === normalizePath("/var/lib/dpkg/status"),
  callback: streamToString,
};

export const getExtFileContentAction: ExtractAction = {
  actionName: "ext",
  filePathMatches: (filePath) =>
    filePath === normalizePath("/var/lib/apt/extended_states"),
  callback: streamToString,
};

export function getAptDbFileContent(
  extractedLayers: ExtractedLayers,
): IAptFiles {
  const dpkgContent = getContentAsString(
    extractedLayers,
    getDpkgFileContentAction,
  );
  const dpkgFile = dpkgContent || "";

  const extContent = getContentAsString(
    extractedLayers,
    getExtFileContentAction,
  );
  const extFile = extContent || "";

  return {
    dpkgFile,
    extFile,
  };
}
