import * as path from "path";
import { JarFingerprintsFact } from "../../facts";
import { JarFingerprint } from "../types";
import { AppDepsScanResultWithoutTarget, FilePathToContent } from "./types";

function groupJarFingerprintsByPath(input: {
  [fileName: string]: string;
}): {
  [path: string]: JarFingerprint[];
} {
  const jarFingerprints: JarFingerprint[] = Object.entries(input).map(
    ([filePath, digest]) => {
      return {
        location: filePath,
        digest,
      };
    },
  );

  const resultAggregatedByPath = jarFingerprints.reduce(
    (jarsAggregatedByPath, jarFingerprint) => {
      const location = path.dirname(jarFingerprint.location);
      jarsAggregatedByPath[location] = jarsAggregatedByPath[location] || [];
      jarsAggregatedByPath[location].push(jarFingerprint);
      return jarsAggregatedByPath;
    },
    {},
  );

  return resultAggregatedByPath;
}

export async function jarFilesToScannedProjects(
  filePathToContent: FilePathToContent,
  targetImage: string,
): Promise<AppDepsScanResultWithoutTarget[]> {
  const mappedResult = groupJarFingerprintsByPath(filePathToContent);
  const scanResults: AppDepsScanResultWithoutTarget[] = [];

  for (const path in mappedResult) {
    if (!mappedResult.hasOwnProperty(path)) {
      continue;
    }
    const jarFingerprintsFact: JarFingerprintsFact = {
      type: "jarFingerprints",
      data: {
        fingerprints: mappedResult[path],
        origin: targetImage,
        path,
      },
    };
    scanResults.push({
      facts: [jarFingerprintsFact],
      identity: {
        type: "maven",
        targetFile: path,
      },
    });
  }

  return scanResults;
}
