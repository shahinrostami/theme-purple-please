import { AnalysisType, StaticAnalysis } from "../analyzer/types";

export function parseAnalysisResults(targetImage, analysis: StaticAnalysis) {
  let analysisResult = analysis.results.filter((res) => {
    return res.Analysis && res.Analysis.length > 0;
  })[0];

  if (!analysisResult) {
    // Special case when we have no package management
    // on scratch images or images with unknown package manager
    analysisResult = {
      Image: targetImage,
      AnalyzeType: AnalysisType.Linux,
      Analysis: [],
    };
  }

  let depType;
  switch (analysisResult.AnalyzeType) {
    case AnalysisType.Apt: {
      depType = "deb";
      break;
    }
    default: {
      depType = analysisResult.AnalyzeType.toLowerCase();
    }
  }

  return {
    imageId: analysis.imageId,
    platform: analysis.platform,
    targetOS: analysis.osRelease,
    type: depType,
    depInfosList: analysisResult.Analysis,
    imageLayers: analysis.imageLayers,
  };
}
