import { IAptFiles } from "../../analyzer/types";
import { ExtractAction, ExtractedLayers } from "../../extractor/types";
export declare const getDpkgFileContentAction: ExtractAction;
export declare const getExtFileContentAction: ExtractAction;
export declare function getAptDbFileContent(extractedLayers: ExtractedLayers): IAptFiles;
