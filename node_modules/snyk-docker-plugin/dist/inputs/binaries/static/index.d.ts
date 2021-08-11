import { ExtractAction, ExtractedLayers } from "../../../extractor/types";
export declare const getOpenJDKBinariesFileContentAction: ExtractAction;
export declare const getNodeBinariesFileContentAction: ExtractAction;
export declare function getBinariesHashes(extractedLayers: ExtractedLayers): string[];
