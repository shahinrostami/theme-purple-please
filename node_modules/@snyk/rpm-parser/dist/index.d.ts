/// <reference types="node" />
import { IParserResponse } from './types';
/**
 * Get a list of packages given a Buffer that contains an RPM database in BerkeleyDB format.
 * The database is inspected as best-effort, returning all valid/readable entries.
 * @param data An RPM database in BerkeleyDB format.
 * @deprecated Should use snyk/dep-graph. The response format is kept for backwards compatibility with snyk/kubernetes-monitor.
 */
export declare function getPackages(data: Buffer): Promise<IParserResponse>;
