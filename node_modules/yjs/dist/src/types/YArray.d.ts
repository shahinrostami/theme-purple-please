/**
 * Event that describes the changes on a YArray
 * @template T
 */
export class YArrayEvent<T> extends YEvent {
    /**
     * @param {YArray<T>} yarray The changed type
     * @param {Transaction} transaction The transaction object
     */
    constructor(yarray: YArray<T>, transaction: Transaction);
    _transaction: Transaction;
}
/**
 * A shared Array implementation.
 * @template T
 * @extends AbstractType<YArrayEvent<T>>
 * @implements {Iterable<T>}
 */
export class YArray<T> extends AbstractType<YArrayEvent<T>> implements Iterable<T> {
    /**
     * Construct a new YArray containing the specified items.
     * @template T
     * @param {Array<T>} items
     * @return {YArray<T>}
     */
    static from<T_2>(items: T_2[]): YArray<T_2>;
    /**
     * @type {Array<any>?}
     * @private
     */
    private _prelimContent;
    get length(): number;
    /**
     * Inserts new content at an index.
     *
     * Important: This function expects an array of content. Not just a content
     * object. The reason for this "weirdness" is that inserting several elements
     * is very efficient when it is done as a single operation.
     *
     * @example
     *  // Insert character 'a' at position 0
     *  yarray.insert(0, ['a'])
     *  // Insert numbers 1, 2 at position 1
     *  yarray.insert(1, [1, 2])
     *
     * @param {number} index The index to insert content at.
     * @param {Array<T>} content The array of content
     */
    insert(index: number, content: Array<T>): void;
    /**
     * Appends content to this YArray.
     *
     * @param {Array<T>} content Array of content to append.
     */
    push(content: Array<T>): void;
    /**
     * Preppends content to this YArray.
     *
     * @param {Array<T>} content Array of content to preppend.
     */
    unshift(content: Array<T>): void;
    /**
     * Deletes elements starting from an index.
     *
     * @param {number} index Index at which to start deleting elements
     * @param {number} length The number of elements to remove. Defaults to 1.
     */
    delete(index: number, length?: number): void;
    /**
     * Returns the i-th element from a YArray.
     *
     * @param {number} index The index of the element to return from the YArray
     * @return {T}
     */
    get(index: number): T;
    /**
     * Transforms this YArray to a JavaScript Array.
     *
     * @return {Array<T>}
     */
    toArray(): Array<T>;
    /**
     * Transforms this YArray to a JavaScript Array.
     *
     * @param {number} [start]
     * @param {number} [end]
     * @return {Array<T>}
     */
    slice(start?: number | undefined, end?: number | undefined): Array<T>;
    /**
     * Returns an Array with the result of calling a provided function on every
     * element of this YArray.
     *
     * @template T,M
     * @param {function(T,number,YArray<T>):M} f Function that produces an element of the new Array
     * @return {Array<M>} A new array with each element being the result of the
     *                 callback function
     */
    map<T_1, M>(f: (arg0: T_1, arg1: number, arg2: YArray<T_1>) => M): M[];
    /**
     * Executes a provided function on once on overy element of this YArray.
     *
     * @param {function(T,number,YArray<T>):void} f A function to execute on every element of this YArray.
     */
    forEach(f: (arg0: T, arg1: number, arg2: YArray<T>) => void): void;
    /**
     * @return {IterableIterator<T>}
     */
    [Symbol.iterator](): IterableIterator<T>;
}
export function readYArray(decoder: UpdateDecoderV1 | UpdateDecoderV2): YArray<any>;
import { YEvent } from "../utils/YEvent.js";
import { Transaction } from "../utils/Transaction.js";
import { AbstractType } from "./AbstractType.js";
import { UpdateDecoderV1 } from "../utils/UpdateDecoder.js";
import { UpdateDecoderV2 } from "../utils/UpdateDecoder.js";
