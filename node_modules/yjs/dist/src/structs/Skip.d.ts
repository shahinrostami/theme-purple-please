export const structSkipRefNumber: 10;
/**
 * @private
 */
export class Skip extends AbstractStruct {
    delete(): void;
    /**
     * @param {Transaction} transaction
     * @param {StructStore} store
     * @return {null | number}
     */
    getMissing(transaction: Transaction, store: StructStore): null | number;
}
import { AbstractStruct } from "./AbstractStruct.js";
import { Transaction } from "../utils/Transaction.js";
import { StructStore } from "../utils/StructStore.js";
