/// <reference types="node" />
import * as crypto from 'crypto';
export declare function hash(filePath: string, fileEncoding?: string, hashAlgorithm?: string, hashEncoding?: crypto.HexBase64Latin1Encoding): Promise<string>;
