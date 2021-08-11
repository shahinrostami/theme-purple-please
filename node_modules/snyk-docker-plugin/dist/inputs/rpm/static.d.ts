import { ExtractAction, ExtractedLayers } from "../../extractor/types";
export declare const getRpmDbFileContentAction: ExtractAction;
export declare function getRpmDbFileContent(extractedLayers: ExtractedLayers): Promise<string>;
