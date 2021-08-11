import * as needle from 'needle';
declare function makeRequestWrapper(payload: any): Promise<{
    res: needle.NeedleResponse;
    body: any;
}>;
declare function makeRequestWrapper(payload: any, callback: (err: Error | null, res?: any, body?: any) => void): Promise<void>;
export { makeRequestWrapper as makeRequest };
