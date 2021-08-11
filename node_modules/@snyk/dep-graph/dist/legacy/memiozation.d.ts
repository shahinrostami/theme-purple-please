import { DepTree } from './index';
import { PartitionedCycles } from './cycles';
declare type NodeId = string;
export declare type MemoizationMap = Map<NodeId, {
    depTree: DepTree;
    cycleNodeIds?: Set<NodeId>;
}>;
export declare function memoize(nodeId: NodeId, memoizationMap: MemoizationMap, depTree: DepTree, partitionedCycles: PartitionedCycles): void;
export declare function getMemoizedDepTree(nodeId: NodeId, ancestors: NodeId[], memoizationMap: MemoizationMap): DepTree | null;
export {};
