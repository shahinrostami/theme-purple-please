export interface GitTarget {
    remoteUrl?: string;
    branch?: string;
}
export interface ContainerTarget {
    image?: string;
}
export declare function isGitTarget(target: any): target is GitTarget;
