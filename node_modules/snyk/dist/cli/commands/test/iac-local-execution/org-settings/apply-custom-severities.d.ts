import { IacCustomPolicies, IacFileScanResult } from '../types';
export declare function applyCustomSeverities(scannedFiles: IacFileScanResult[], customPolicies: IacCustomPolicies): Promise<IacFileScanResult[]>;
