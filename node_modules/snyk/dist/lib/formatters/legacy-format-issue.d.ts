import { Options, TestOptions } from '../../lib/types';
import { GroupedVuln } from '../../lib/snyk-test/legacy';
export declare function formatIssues(vuln: GroupedVuln, options: Options & TestOptions): string;
export declare function titleCaseText(text: any): any;
