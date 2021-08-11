import { ExtractAction, ExtractedLayers } from "../../extractor/types";
import { ManifestFile } from "../../types";
export declare function generateExtractAction(globsInclude: string[], globsExclude: string[]): ExtractAction;
export declare function getMatchingFiles(extractedLayers: ExtractedLayers): ManifestFile[];
