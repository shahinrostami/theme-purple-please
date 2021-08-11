import { IChangedArgs } from '@jupyterlab/coreutils';
import { ISignal } from '@lumino/signaling';
import { Widget } from '@lumino/widgets';
/**
 * A Switch widget
 */
export declare class Switch extends Widget {
    constructor();
    /**
     * The value of the switch.
     */
    get value(): boolean;
    set value(newValue: boolean);
    /**
     * A signal emitted when the value changes.
     */
    get valueChanged(): ISignal<this, IChangedArgs<boolean, boolean, 'value'>>;
    /**
     * The visible label of the switch.
     */
    get label(): string;
    set label(x: string);
    /**
     * The caption (title) of the switch.
     */
    get caption(): string;
    set caption(x: string);
    handleEvent(event: Event): void;
    protected onAfterAttach(): void;
    protected onBeforeDetach(): void;
    private _button;
    private _label;
    private _value;
    private _valueChanged;
}
