/// <reference types="node" />
import { PortablePath } from '@yarnpkg/fslib';
import { Response } from 'got';
import { Configuration } from './Configuration';
/**
 * Searches through networkSettings and returns the most specific match
 */
export declare function getNetworkSettings(target: string, opts: {
    configuration: Configuration;
}): {
    caFilePath: PortablePath | null;
    enableNetwork: boolean | null;
    httpProxy: string | null;
    httpsProxy: string | null;
};
export declare type Body = ({
    [key: string]: any;
} | string | Buffer | null);
export declare enum Method {
    GET = "GET",
    PUT = "PUT",
    POST = "POST",
    DELETE = "DELETE"
}
export declare type Options = {
    configuration: Configuration;
    headers?: {
        [headerName: string]: string;
    };
    jsonRequest?: boolean;
    jsonResponse?: boolean;
    /** @deprecated use jsonRequest and jsonResponse instead */
    json?: boolean;
    method?: Method;
};
export declare function request(target: string, body: Body, { configuration, headers, json, jsonRequest, jsonResponse, method }: Options): Promise<Response<any>>;
export declare function get(target: string, { configuration, json, jsonResponse, ...rest }: Options): Promise<any>;
export declare function put(target: string, body: Body, options: Options): Promise<Buffer>;
export declare function post(target: string, body: Body, options: Options): Promise<Buffer>;
export declare function del(target: string, options: Options): Promise<Buffer>;
