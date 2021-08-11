export declare function assembleQueryString(options: any): {
    org: string;
    severityThreshold?: boolean | undefined;
    ignorePolicy?: boolean | undefined;
} | null;
export declare enum SEVERITY {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare const SEVERITIES: Array<{
    verboseName: SEVERITY;
    value: number;
}>;
export declare function colorTextBySeverity(severity: string, textToColor: string): string;
export declare enum FAIL_ON {
    all = "all",
    upgradable = "upgradable",
    patchable = "patchable"
}
export declare type FailOn = 'all' | 'upgradable' | 'patchable';
