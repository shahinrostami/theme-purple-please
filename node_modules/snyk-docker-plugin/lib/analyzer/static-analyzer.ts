import * as Debug from "debug";
import { DockerFileAnalysis } from "../dockerfile";
import * as archiveExtractor from "../extractor";
import {
  getGoModulesContentAction,
  goModulesToScannedProjects,
} from "../go-parser";
import { getElfFileContent, getFileContent } from "../inputs";
import {
  getApkDbFileContent,
  getApkDbFileContentAction,
} from "../inputs/apk/static";
import {
  getAptDbFileContent,
  getDpkgFileContentAction,
  getExtFileContentAction,
} from "../inputs/apt/static";
import {
  getBinariesHashes,
  getNodeBinariesFileContentAction,
  getOpenJDKBinariesFileContentAction,
} from "../inputs/binaries/static";
import {
  getAptFiles,
  getDpkgPackageFileContentAction,
} from "../inputs/distroless/static";
import * as filePatternStatic from "../inputs/file-pattern/static";
import { getJarFileContentAction } from "../inputs/java/static";
import { getNodeAppFileContentAction } from "../inputs/node/static";
import { getOsReleaseActions } from "../inputs/os-release/static";
import {
  getRpmDbFileContent,
  getRpmDbFileContentAction,
} from "../inputs/rpm/static";
import { ImageType, ManifestFile } from "../types";
import { nodeFilesToScannedProjects } from "./applications";
import { jarFilesToScannedProjects } from "./applications/java";
import { AppDepsScanResultWithoutTarget } from "./applications/types";
import * as osReleaseDetector from "./os-release";
import { analyze as apkAnalyze } from "./package-managers/apk";
import {
  analyze as aptAnalyze,
  analyzeDistroless as aptDistrolessAnalyze,
} from "./package-managers/apt";
import { analyze as rpmAnalyze } from "./package-managers/rpm";
import { ImageAnalysis, OSRelease, StaticAnalysis } from "./types";

const debug = Debug("snyk");

export async function analyze(
  targetImage: string,
  dockerfileAnalysis: DockerFileAnalysis | undefined,
  imageType: ImageType,
  imagePath: string,
  globsToFind: { include: string[]; exclude: string[] },
  appScan: boolean,
): Promise<StaticAnalysis> {
  const staticAnalysisActions = [
    getApkDbFileContentAction,
    getDpkgFileContentAction,
    getExtFileContentAction,
    getRpmDbFileContentAction,
    ...getOsReleaseActions,
    getNodeBinariesFileContentAction,
    getOpenJDKBinariesFileContentAction,
    getDpkgPackageFileContentAction,
  ];

  const checkForGlobs = shouldCheckForGlobs(globsToFind);
  if (checkForGlobs) {
    staticAnalysisActions.push(
      filePatternStatic.generateExtractAction(
        globsToFind.include,
        globsToFind.exclude,
      ),
    );
  }

  if (appScan) {
    staticAnalysisActions.push(
      ...[
        getNodeAppFileContentAction,
        getJarFileContentAction,
        getGoModulesContentAction,
      ],
    );
  }

  const {
    imageId,
    manifestLayers,
    extractedLayers,
    rootFsLayers,
    autoDetectedUserInstructions,
    platform,
    imageLabels,
  } = await archiveExtractor.extractImageContent(
    imageType,
    imagePath,
    staticAnalysisActions,
  );

  const [
    apkDbFileContent,
    aptDbFileContent,
    rpmDbFileContent,
  ] = await Promise.all([
    getApkDbFileContent(extractedLayers),
    getAptDbFileContent(extractedLayers),
    getRpmDbFileContent(extractedLayers),
  ]);

  const distrolessAptFiles = getAptFiles(extractedLayers);

  const manifestFiles: ManifestFile[] = [];
  if (checkForGlobs) {
    const matchingFiles = filePatternStatic.getMatchingFiles(extractedLayers);
    manifestFiles.push(...matchingFiles);
  }

  let osRelease: OSRelease;
  try {
    osRelease = await osReleaseDetector.detectStatically(
      extractedLayers,
      dockerfileAnalysis,
    );
  } catch (err) {
    debug(`Could not detect OS release: ${JSON.stringify(err)}`);
    throw new Error("Failed to detect OS release");
  }

  let results: ImageAnalysis[];
  try {
    results = await Promise.all([
      apkAnalyze(targetImage, apkDbFileContent),
      aptAnalyze(targetImage, aptDbFileContent),
      rpmAnalyze(targetImage, rpmDbFileContent),
      aptDistrolessAnalyze(targetImage, distrolessAptFiles),
    ]);
  } catch (err) {
    debug(`Could not detect installed OS packages: ${JSON.stringify(err)}`);
    throw new Error("Failed to detect installed OS packages");
  }

  const binaries = getBinariesHashes(extractedLayers);

  const applicationDependenciesScanResults: AppDepsScanResultWithoutTarget[] = [];

  if (appScan) {
    const nodeDependenciesScanResults = await nodeFilesToScannedProjects(
      getFileContent(extractedLayers, getNodeAppFileContentAction.actionName),
    );
    const jarFingerprintScanResults = await jarFilesToScannedProjects(
      getFileContent(extractedLayers, getJarFileContentAction.actionName),
      targetImage,
    );
    const goModulesScanResult = await goModulesToScannedProjects(
      getElfFileContent(extractedLayers, getGoModulesContentAction.actionName),
    );

    applicationDependenciesScanResults.push(
      ...nodeDependenciesScanResults,
      ...jarFingerprintScanResults,
      ...goModulesScanResult,
    );
  }

  return {
    imageId,
    osRelease,
    platform,
    results,
    binaries,
    imageLayers: manifestLayers,
    rootFsLayers,
    applicationDependenciesScanResults,
    manifestFiles,
    autoDetectedUserInstructions,
    imageLabels,
  };
}

function shouldCheckForGlobs(globsToFind: {
  include: string[];
  exclude: string[];
}): boolean {
  return globsToFind.include.length > 0;
}
