import * as sarif from 'sarif';
import { TestResult, AnnotatedIssue } from '../snyk-test/legacy';
export declare function createSarifOutputForOpenSource(testResults: TestResult[]): sarif.Log;
export declare function getRules(testResult: TestResult): sarif.ReportingDescriptor[];
export declare function getResults(testResult: any): sarif.Result[];
export declare function getLevel(vuln: AnnotatedIssue): "error" | "warning" | "note";
