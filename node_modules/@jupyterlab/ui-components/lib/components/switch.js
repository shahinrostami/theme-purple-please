// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { Signal } from '@lumino/signaling';
import { Widget } from '@lumino/widgets';
/**
 * A Switch widget
 */
export class Switch extends Widget {
    constructor() {
        super();
        this._button = document.createElement('button');
        this._label = document.createElement('label');
        this._valueChanged = new Signal(this);
        // switch accessibility refs:
        // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Switch_role
        // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#Accessibility_concerns
        this._button.className = 'jp-switch';
        this._button.setAttribute('role', 'switch');
        this._label.className = 'jp-switch-label';
        const track = document.createElement('div');
        track.className = 'jp-switch-track';
        track.setAttribute('aria-hidden', 'true');
        this._button.appendChild(this._label);
        this._button.appendChild(track);
        this.node.appendChild(this._button);
    }
    /**
     * The value of the switch.
     */
    get value() {
        return this._value;
    }
    set value(newValue) {
        const oldValue = this._value;
        if (oldValue === newValue) {
            return;
        }
        this._button.setAttribute('aria-checked', newValue.toString());
        this._value = newValue;
        this._valueChanged.emit({ name: 'value', oldValue, newValue });
    }
    /**
     * A signal emitted when the value changes.
     */
    get valueChanged() {
        return this._valueChanged;
    }
    /**
     * The visible label of the switch.
     */
    get label() {
        var _a;
        return (_a = this._label.textContent) !== null && _a !== void 0 ? _a : '';
    }
    set label(x) {
        this._label.textContent = x;
    }
    /**
     * The caption (title) of the switch.
     */
    get caption() {
        return this._button.title;
    }
    set caption(x) {
        this._button.title = x;
        this._label.title = x;
    }
    handleEvent(event) {
        switch (event.type) {
            case 'click':
                this.value = !this.value;
                break;
            default:
                break;
        }
    }
    onAfterAttach() {
        this._button.addEventListener('click', this);
    }
    onBeforeDetach() {
        this._button.removeEventListener('click', this);
    }
}
//# sourceMappingURL=switch.js.map