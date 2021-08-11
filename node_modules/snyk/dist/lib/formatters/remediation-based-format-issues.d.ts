import { TestOptions } from '../../lib/types';
import { GroupedVuln, LegalInstruction, REACHABILITY, RemediationChanges, SEVERITY } from '../../lib/snyk-test/legacy';
import { SampleReachablePaths } from './types';
export declare function formatIssuesWithRemediation(vulns: GroupedVuln[], remediationInfo: RemediationChanges, options: TestOptions): string[];
export declare function printPath(path: string[], slice?: number): string;
export declare function formatIssue(id: string, title: string, severity: SEVERITY, isNew: boolean, vulnerableModule: string, paths: string[][], testOptions: TestOptions, note: string | false, originalSeverity?: SEVERITY, legalInstructions?: LegalInstruction[], reachability?: REACHABILITY, sampleReachablePaths?: SampleReachablePaths): string;
