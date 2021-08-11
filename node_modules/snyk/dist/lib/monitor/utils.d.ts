import { ScannedProject, DepTree } from '@snyk/cli-interface/legacy/common';
import * as depGraphLib from '@snyk/dep-graph';
import { MonitorMeta } from '../types';
import { PluginMetadata } from '@snyk/cli-interface/legacy/plugin';
export declare function getNameDepTree(scannedProject: ScannedProject, depTree: DepTree, meta: MonitorMeta): string | undefined;
export declare function getNameDepGraph(scannedProject: ScannedProject, depGraph: depGraphLib.DepGraph, meta: MonitorMeta): string | undefined;
export declare function getProjectName(scannedProject: ScannedProject, meta: MonitorMeta): string | undefined;
export declare function getTargetFile(scannedProject: ScannedProject, pluginMeta: PluginMetadata): string | undefined;
