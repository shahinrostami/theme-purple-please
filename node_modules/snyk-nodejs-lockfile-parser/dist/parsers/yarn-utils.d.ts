import { structUtils } from '@yarnpkg/core';
export declare type ParseDescriptor = typeof structUtils.parseDescriptor;
export declare type ParseRange = typeof structUtils.parseRange;
export declare type YarnLockFileKeyNormalizer = (fullDescriptor: string) => Set<string>;
export declare const yarnLockFileKeyNormalizer: (parseDescriptor: ParseDescriptor, parseRange: ParseRange) => YarnLockFileKeyNormalizer;
