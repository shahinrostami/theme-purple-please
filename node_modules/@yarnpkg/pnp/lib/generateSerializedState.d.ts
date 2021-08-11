import { PnpSettings, SerializedState } from './types';
export declare function sortMap<T>(values: Iterable<T>, mappers: ((value: T) => string) | Array<(value: T) => string>): T[];
export declare function generateSerializedState(settings: PnpSettings): SerializedState;
