import * as graphlib from 'graphlib';
import { DepGraph } from '@snyk/dep-graph';
export { DepGraph };
export interface DepTreeDep {
    name?: string;
    version?: string;
    dependencies?: {
        [depName: string]: DepTreeDep;
    };
    labels?: {
        [key: string]: string;
    };
}
export interface DepTree extends DepTreeDep {
    type?: string;
    packageFormatVersion?: string;
    targetOS?: {
        name: string;
        version: string;
    };
    targetFile?: string;
    policy?: string;
    docker?: any;
    files?: any;
}
export interface ScannedProject {
    depTree?: DepTree;
    depGraph?: DepGraph;
    targetFile?: string;
    meta?: any;
    callGraph?: CallGraphResult;
}
export declare type SupportedPackageManagers = 'rubygems' | // Ruby
'npm' | 'yarn' | // Node.js
'maven' | 'sbt' | 'gradle' | // JVM
'golangdep' | 'govendor' | 'gomodules' | // Go
'pip' | // Python
'nuget' | 'paket' | // .Net
'composer' | // PHP
'rpm' | 'apk' | 'deb' | 'dockerfile';
export interface CallGraphError {
    message: string;
    innerError: Error;
}
export declare type CallGraph = graphlib.Graph;
export declare type CallGraphResult = CallGraph | CallGraphError;
