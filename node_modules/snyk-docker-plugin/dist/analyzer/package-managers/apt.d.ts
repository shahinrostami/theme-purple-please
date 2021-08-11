import { IAptFiles, ImageAnalysis } from "../types";
export declare function analyze(targetImage: string, aptFiles: IAptFiles): Promise<ImageAnalysis>;
export declare function analyzeDistroless(targetImage: string, aptFiles: string[]): Promise<ImageAnalysis>;
