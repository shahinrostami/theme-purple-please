/**
 * @typedef {Object} UndoManagerOptions
 * @property {number} [UndoManagerOptions.captureTimeout=500]
 * @property {function(Item):boolean} [UndoManagerOptions.deleteFilter=()=>true] Sometimes
 * it is necessary to filter whan an Undo/Redo operation can delete. If this
 * filter returns false, the type/item won't be deleted even it is in the
 * undo/redo scope.
 * @property {Set<any>} [UndoManagerOptions.trackedOrigins=new Set([null])]
 */
/**
 * Fires 'stack-item-added' event when a stack item was added to either the undo- or
 * the redo-stack. You may store additional stack information via the
 * metadata property on `event.stackItem.meta` (it is a `Map` of metadata properties).
 * Fires 'stack-item-popped' event when a stack item was popped from either the
 * undo- or the redo-stack. You may restore the saved stack information from `event.stackItem.meta`.
 *
 * @extends {Observable<'stack-item-added'|'stack-item-popped'>}
 */
export class UndoManager extends Observable<"stack-item-added" | "stack-item-popped"> {
    /**
     * @param {AbstractType<any>|Array<AbstractType<any>>} typeScope Accepts either a single type, or an array of types
     * @param {UndoManagerOptions} options
     */
    constructor(typeScope: AbstractType<any> | Array<AbstractType<any>>, { captureTimeout, deleteFilter, trackedOrigins }?: UndoManagerOptions);
    scope: AbstractType<any>[];
    deleteFilter: (arg0: Item) => boolean;
    trackedOrigins: Set<any>;
    /**
     * @type {Array<StackItem>}
     */
    undoStack: Array<StackItem>;
    /**
     * @type {Array<StackItem>}
     */
    redoStack: Array<StackItem>;
    /**
     * Whether the client is currently undoing (calling UndoManager.undo)
     *
     * @type {boolean}
     */
    undoing: boolean;
    redoing: boolean;
    doc: Doc;
    lastChange: number;
    clear(): void;
    /**
     * UndoManager merges Undo-StackItem if they are created within time-gap
     * smaller than `options.captureTimeout`. Call `um.stopCapturing()` so that the next
     * StackItem won't be merged.
     *
     *
     * @example
     *     // without stopCapturing
     *     ytext.insert(0, 'a')
     *     ytext.insert(1, 'b')
     *     um.undo()
     *     ytext.toString() // => '' (note that 'ab' was removed)
     *     // with stopCapturing
     *     ytext.insert(0, 'a')
     *     um.stopCapturing()
     *     ytext.insert(0, 'b')
     *     um.undo()
     *     ytext.toString() // => 'a' (note that only 'b' was removed)
     *
     */
    stopCapturing(): void;
    /**
     * Undo last changes on type.
     *
     * @return {StackItem?} Returns StackItem if a change was applied
     */
    undo(): StackItem | null;
    /**
     * Redo last undo operation.
     *
     * @return {StackItem?} Returns StackItem if a change was applied
     */
    redo(): StackItem | null;
}
export type UndoManagerOptions = {
    captureTimeout?: number | undefined;
    /**
     * Sometimes
     * it is necessary to filter whan an Undo/Redo operation can delete. If this
     * filter returns false, the type/item won't be deleted even it is in the
     * undo/redo scope.
     */
    deleteFilter?: ((arg0: Item) => boolean) | undefined;
    trackedOrigins?: Set<any> | undefined;
};
import { Observable } from "lib0/observable";
import { AbstractType } from "../types/AbstractType.js";
import { Item } from "../structs/Item.js";
declare class StackItem {
    /**
     * @param {DeleteSet} deletions
     * @param {DeleteSet} insertions
     */
    constructor(deletions: DeleteSet, insertions: DeleteSet);
    insertions: DeleteSet;
    deletions: DeleteSet;
    /**
     * Use this to save and restore metadata like selection range
     */
    meta: Map<any, any>;
}
import { Doc } from "./Doc.js";
import { DeleteSet } from "./DeleteSet.js";
export {};
