import { TestResult } from '../snyk-test/legacy';
import { Options, SupportedProjectTypes, TestOptions } from '../types';
export declare function showFixTip(projectType: SupportedProjectTypes, res: TestResult, options: TestOptions & Options): string;
