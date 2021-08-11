import { CustomError } from '../../../../lib/errors';
export declare function trackUsage(formattedResults: TrackableResult[]): Promise<void>;
export declare class TestLimitReachedError extends CustomError {
    constructor();
}
export interface TrackableResult {
    meta: {
        isPrivate: boolean;
    };
    result: {
        cloudConfigResults: any[];
    };
}
