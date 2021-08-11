import * as elf from "elfy";
import { eventLoopSpinner } from "event-loop-spinner";
import * as path from "path";
import { Readable } from "stream";

import {
  AppDepsScanResultWithoutTarget,
  FilePathToElfContent,
} from "../analyzer/applications/types";
import { ExtractAction } from "../extractor/types";
import { DepGraphFact } from "../facts";
import { parseGoBinary } from "./parser";
import { Elf } from "./types";

const ignoredPaths = [
  path.normalize("/boot"),
  path.normalize("/dev"),
  path.normalize("/etc"),
  path.normalize("/home"),
  path.normalize("/media"),
  path.normalize("/mnt"),
  path.normalize("/proc"),
  path.normalize("/root"),
  path.normalize("/run"),
  path.normalize("/sbin"),
  path.normalize("/sys"),
  path.normalize("/tmp"),
  path.normalize("/var"),
];

export const DEP_GRAPH_TYPE = "gomodules";

function filePathMatches(filePath: string): boolean {
  const dirName = path.dirname(filePath);
  return (
    !path.parse(filePath).ext &&
    !ignoredPaths.some((ignorePath) => dirName.startsWith(ignorePath))
  );
}

export const getGoModulesContentAction: ExtractAction = {
  actionName: "gomodules",
  filePathMatches,
  callback: findGoBinaries,
};

async function findGoBinaries(
  stream: Readable,
  streamSize?: number,
): Promise<any> {
  return new Promise((resolve, reject) => {
    const encoding = "binary";
    const buildIdMagic = "Go";
    const elfHeaderMagic = "\x7FELF";
    const buildInfoMagic = "\xff Go buildinf:";
    // ELF section headers and so ".go.buildinfo" & ".note.go.buildid" blobs are available in the first 64kb
    const elfBuildInfoSize = 64 * 1024;

    const buffer: Buffer = Buffer.alloc(streamSize ?? elfBuildInfoSize);
    let bytesWritten = 0;

    stream.on("end", () => {
      try {
        // Discard
        if (bytesWritten === 0) {
          return resolve();
        }

        const binaryFile = elf.parse(buffer);

        const goBuildInfo = binaryFile.body.sections.find(
          (section) => section.name === ".go.buildinfo",
        );
        // Could be found in file headers
        const goBuildId = binaryFile.body.sections.find(
          (section) => section.name === ".note.go.buildid",
        );

        const interp = binaryFile.body.sections.find(
          (section) => section.name === ".interp",
        );

        if (!goBuildInfo && !goBuildId) {
          return resolve();
        } else if (interp) {
          // Compiled using cgo
          // we wouldn't be able to extract modules
          // TODO: cgo-compiled binaries are not supported in this iteration
          return resolve();
        } else if (goBuildInfo) {
          const info = goBuildInfo.data
            .slice(0, buildInfoMagic.length)
            .toString(encoding);

          if (info === buildInfoMagic) {
            return resolve(binaryFile);
          }

          return resolve();
        } else if (goBuildId) {
          const strings = goBuildId.data
            .toString()
            .split(/\0+/g)
            .filter(Boolean);
          const go = strings[strings.length - 2];
          const buildIdParts = strings[strings.length - 1].split("/");

          // Build ID's precise form is actionID/[.../]contentID.
          // Usually the buildID is simply actionID/contentID, but with exceptions.
          // https://github.com/golang/go/blob/master/src/cmd/go/internal/work/buildid.go#L23
          if (go === buildIdMagic && buildIdParts.length >= 2) {
            return resolve(binaryFile);
          }

          return resolve();
        }
      } catch (error) {
        // catching exception during elf file parse shouldn't fail the archive iteration
        // it either we recognize file as binary or not
        return resolve();
      }
    });

    stream.on("error", (error) => {
      reject(error);
    });

    stream.once("data", (chunk) => {
      const first4Bytes = chunk.toString(encoding, 0, 4);

      if (first4Bytes === elfHeaderMagic) {
        Buffer.from(chunk).copy(buffer, bytesWritten, 0);
        bytesWritten += chunk.length;
        // Listen to next chunks only if it's an ELF executable
        stream.addListener("data", (chunk) => {
          Buffer.from(chunk).copy(buffer, bytesWritten, 0);
          bytesWritten += chunk.length;
        });
      }
    });
  });
}

/**
 * Build depGraphs for each Go executable
 * @param filePathToContent
 */
export async function goModulesToScannedProjects(
  filePathToContent: FilePathToElfContent,
): Promise<AppDepsScanResultWithoutTarget[]> {
  const scanResults: AppDepsScanResultWithoutTarget[] = [];

  for (const [filePath, goBinary] of Object.entries(filePathToContent)) {
    if (eventLoopSpinner.isStarving()) {
      await eventLoopSpinner.spin();
    }

    const depGraph = await parseGoBinary(goBinary as Elf);

    if (!depGraph) {
      continue;
    }

    const depGraphFact: DepGraphFact = {
      type: "depGraph",
      data: depGraph,
    };
    scanResults.push({
      facts: [depGraphFact],
      identity: {
        type: DEP_GRAPH_TYPE,
        targetFile: filePath,
      },
    });
  }

  return scanResults;
}
