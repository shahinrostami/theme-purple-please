import { Message } from '@phosphor/messaging';
import { Widget } from '@phosphor/widgets';
/**
 * The spinner class.
 */
export declare class Spinner extends Widget {
    /**
     * Construct a spinner widget.
     */
    constructor();
    /**
     * Handle `'activate-request'` messages.
     */
    protected onActivateRequest(msg: Message): void;
}
