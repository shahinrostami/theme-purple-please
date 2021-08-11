import * as needle from 'needle';
import { Payload } from './types';
export declare function makeRequest(payload: Payload): Promise<{
    res: needle.NeedleResponse;
    body: any;
}>;
