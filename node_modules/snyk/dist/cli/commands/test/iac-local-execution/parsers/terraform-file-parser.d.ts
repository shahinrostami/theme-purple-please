import { IacFileData, IacFileParsed } from '../types';
import { CustomError } from '../../../../../lib/errors';
export declare function tryParsingTerraformFile(fileData: IacFileData): Array<IacFileParsed>;
export declare class FailedToParseTerraformFileError extends CustomError {
    constructor(filename: string);
}
