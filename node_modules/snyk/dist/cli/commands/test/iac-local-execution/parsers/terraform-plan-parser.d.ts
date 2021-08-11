import { IacFileData, IacFileParsed, TerraformPlanJson } from '../types';
import { CustomError } from '../../../../../lib/errors';
export declare function isTerraformPlan(terraformPlanJson: TerraformPlanJson): boolean;
export declare function tryParsingTerraformPlan(terraformPlanFile: IacFileData, terraformPlanJson: TerraformPlanJson, { isFullScan }?: {
    isFullScan: boolean;
}): Array<IacFileParsed>;
export declare class FailedToExtractResourcesInTerraformPlanError extends CustomError {
    constructor(message?: string);
}
