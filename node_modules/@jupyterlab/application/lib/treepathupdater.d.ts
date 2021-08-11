import { Token } from '@lumino/coreutils';
/**
 * The tree path updater token.
 */
export declare const ITreePathUpdater: Token<ITreePathUpdater>;
/**
 * A function to call to update the tree path.
 */
export interface ITreePathUpdater {
    (treePath: string): void;
}
