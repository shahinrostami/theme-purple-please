import { ScanResult, TestResult, Options } from './types';
export declare function display(scanResults: ScanResult[], testResults: TestResult[], errors: string[], options?: Options): Promise<string>;
