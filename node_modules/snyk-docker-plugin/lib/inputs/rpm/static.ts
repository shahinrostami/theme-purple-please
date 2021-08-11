import { getPackages } from "@snyk/rpm-parser";
import * as Debug from "debug";
import { normalize as normalizePath } from "path";
import { getContentAsBuffer } from "../../extractor";
import { ExtractAction, ExtractedLayers } from "../../extractor/types";
import { streamToBuffer } from "../../stream-utils";

const debug = Debug("snyk");

export const getRpmDbFileContentAction: ExtractAction = {
  actionName: "rpm-db",
  filePathMatches: (filePath) =>
    filePath === normalizePath("/var/lib/rpm/Packages") ||
    filePath === normalizePath("/usr/lib/sysimage/rpm/Packages"),
  callback: streamToBuffer,
};

export async function getRpmDbFileContent(
  extractedLayers: ExtractedLayers,
): Promise<string> {
  const rpmDb = getContentAsBuffer(extractedLayers, getRpmDbFileContentAction);
  if (!rpmDb) {
    return "";
  }

  try {
    const parserResponse = await getPackages(rpmDb);
    if (parserResponse.error !== undefined) {
      throw parserResponse.error;
    }
    return parserResponse.response;
  } catch (error) {
    debug(
      `An error occurred while analysing RPM packages: ${JSON.stringify(
        error,
      )}`,
    );
    return "";
  }
}
