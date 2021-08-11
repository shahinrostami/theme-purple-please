import { ExtractAction, ExtractedLayers } from "../../extractor/types";
import { OsReleaseFilePath } from "../../types";
export declare const getOsReleaseActions: ExtractAction[];
export declare function getOsRelease(extractedLayers: ExtractedLayers, releasePath: OsReleaseFilePath): string;
