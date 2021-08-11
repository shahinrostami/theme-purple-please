import { PkgInfo, DepGraph } from '@snyk/dep-graph';
import { Lockfile } from './types';
export default class LockfileParser {
    static readFile(lockfilePath: string): Promise<LockfileParser>;
    static readFileSync(lockfilePath: string): LockfileParser;
    static readContents(contents: string, rootPkgInfo?: PkgInfo): LockfileParser;
    private rootPkgInfo;
    private internalData;
    constructor(hash: Lockfile, rootPkgInfo?: PkgInfo);
    toDepGraph(): DepGraph;
    private nodeIdForPkgInfo;
    private nodeInfoLabelsForPod;
    private checksumForPod;
    private repositoryForPod;
    private externalSourceInfoForPod;
    private checkoutOptionsForPod;
    private get repositories();
    private get pkgManager();
    private get cocoapodsVersion();
    get podfileChecksum(): string | undefined;
}
