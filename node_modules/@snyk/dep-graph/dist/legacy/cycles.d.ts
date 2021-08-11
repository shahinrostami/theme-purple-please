declare type NodeId = string;
declare type Cycle = NodeId[];
export declare type Cycles = Cycle[];
export declare type PartitionedCycles = {
    cyclesStartWithThisNode: Cycle[];
    cyclesWithThisNode: Cycle[];
};
export declare function getCycle(ancestors: NodeId[], nodeId: NodeId): Cycle | null;
export declare function partitionCycles(nodeId: NodeId, allCyclesTheNodeIsPartOf: Cycle[]): PartitionedCycles;
export {};
