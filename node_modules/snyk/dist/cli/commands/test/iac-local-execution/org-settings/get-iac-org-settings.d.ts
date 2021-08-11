import { IacOrgSettings } from '../types';
import { CustomError } from '../../../../../lib/errors';
export declare function getIacOrgSettings(publicOrgId?: string): Promise<IacOrgSettings>;
export declare class FailedToGetIacOrgSettingsError extends CustomError {
    constructor(message?: string);
}
