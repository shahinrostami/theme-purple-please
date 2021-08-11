import { ScannedProject } from '@snyk/cli-interface/legacy/common';
import { MonitorMeta } from '../types';
export declare const IMAGE_SAVE_PATH_OPT = "imageSavePath";
export declare const IMAGE_SAVE_PATH_ENV_VAR = "SNYK_IMAGE_SAVE_PATH";
export declare function isContainer(scannedProject: ScannedProject): boolean;
export declare function getContainerTargetFile(scannedProject: ScannedProject): string | undefined;
export declare function getContainerName(scannedProject: ScannedProject, meta: MonitorMeta): string | undefined;
export declare function getContainerProjectName(scannedProject: ScannedProject, meta: MonitorMeta): string | undefined;
export declare function getContainerImageSavePath(): string | undefined;
