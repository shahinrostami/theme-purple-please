import { normalize as normalizePath } from "path";
import { getContentAsString } from "../../extractor";
import { ExtractAction, ExtractedLayers } from "../../extractor/types";
import { streamToString } from "../../stream-utils";

export const getApkDbFileContentAction: ExtractAction = {
  actionName: "apk-db",
  filePathMatches: (filePath) =>
    filePath === normalizePath("/lib/apk/db/installed"),
  callback: streamToString,
};

export function getApkDbFileContent(extractedLayers: ExtractedLayers): string {
  const apkDb = getContentAsString(extractedLayers, getApkDbFileContentAction);
  return apkDb || "";
}
