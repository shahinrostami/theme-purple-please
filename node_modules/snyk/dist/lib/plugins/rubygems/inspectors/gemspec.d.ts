import { Spec } from './index';
export declare function canHandle(file: string): boolean;
export declare function gatherSpecs(root: string, target: string): Promise<Spec>;
