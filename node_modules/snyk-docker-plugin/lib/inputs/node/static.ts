import { basename } from "path";

import { ExtractAction } from "../../extractor/types";
import { streamToString } from "../../stream-utils";

const nodeAppFiles = ["package.json", "package-lock.json", "yarn.lock"];

function filePathMatches(filePath: string): boolean {
  const fileName = basename(filePath);
  return (
    filePath.indexOf("node_modules") === -1 && nodeAppFiles.includes(fileName)
  );
}

export const getNodeAppFileContentAction: ExtractAction = {
  actionName: "node-app-files",
  filePathMatches,
  callback: streamToString,
};
