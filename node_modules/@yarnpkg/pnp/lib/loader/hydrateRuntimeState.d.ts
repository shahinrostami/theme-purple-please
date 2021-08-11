import { RuntimeState, SerializedState } from '../types';
export declare type HydrateRuntimeStateOptions = {
    basePath: string;
};
export declare function hydrateRuntimeState(data: SerializedState, { basePath }: HydrateRuntimeStateOptions): RuntimeState;
