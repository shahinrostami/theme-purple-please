// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { UseSignal, ReactWidget } from './vdom';
import { Button } from '@jupyterlab/ui-components';
import { find, map, some } from '@phosphor/algorithm';
import { MessageLoop } from '@phosphor/messaging';
import { AttachedProperty } from '@phosphor/properties';
import { PanelLayout, Widget } from '@phosphor/widgets';
import * as React from 'react';
/**
 * The class name added to toolbars.
 */
const TOOLBAR_CLASS = 'jp-Toolbar';
/**
 * The class name added to toolbar items.
 */
const TOOLBAR_ITEM_CLASS = 'jp-Toolbar-item';
/**
 * The class name added to toolbar kernel name text.
 */
const TOOLBAR_KERNEL_NAME_CLASS = 'jp-Toolbar-kernelName';
/**
 * The class name added to toolbar spacer.
 */
const TOOLBAR_SPACER_CLASS = 'jp-Toolbar-spacer';
/**
 * The class name added to toolbar kernel status icon.
 */
const TOOLBAR_KERNEL_STATUS_CLASS = 'jp-Toolbar-kernelStatus';
/**
 * The class name added to a busy kernel indicator.
 */
const TOOLBAR_BUSY_CLASS = 'jp-FilledCircleIcon';
const TOOLBAR_IDLE_CLASS = 'jp-CircleIcon';
/**
 * A layout for toolbars.
 *
 * #### Notes
 * This layout automatically collapses its height if there are no visible
 * toolbar widgets, and expands to the standard toolbar height if there are
 * visible toolbar widgets.
 */
class ToolbarLayout extends PanelLayout {
    constructor() {
        super(...arguments);
        this._dirty = false;
    }
    /**
     * A message handler invoked on a `'fit-request'` message.
     *
     * If any child widget is visible, expand the toolbar height to the normal
     * toolbar height.
     */
    onFitRequest(msg) {
        super.onFitRequest(msg);
        if (this.parent.isAttached) {
            // If there are any widgets not explicitly hidden, expand the toolbar to
            // accommodate them.
            if (some(this.widgets, w => !w.isHidden)) {
                this.parent.node.style.minHeight = 'var(--jp-private-toolbar-height)';
            }
            else {
                this.parent.node.style.minHeight = '';
            }
        }
        // Set the dirty flag to ensure only a single update occurs.
        this._dirty = true;
        // Notify the ancestor that it should fit immediately. This may
        // cause a resize of the parent, fulfilling the required update.
        if (this.parent.parent) {
            MessageLoop.sendMessage(this.parent.parent, Widget.Msg.FitRequest);
        }
        // If the dirty flag is still set, the parent was not resized.
        // Trigger the required update on the parent widget immediately.
        if (this._dirty) {
            MessageLoop.sendMessage(this.parent, Widget.Msg.UpdateRequest);
        }
    }
    /**
     * A message handler invoked on an `'update-request'` message.
     */
    onUpdateRequest(msg) {
        super.onUpdateRequest(msg);
        if (this.parent.isVisible) {
            this._dirty = false;
        }
    }
    /**
     * A message handler invoked on a `'child-shown'` message.
     */
    onChildShown(msg) {
        super.onChildShown(msg);
        // Post a fit request for the parent widget.
        this.parent.fit();
    }
    /**
     * A message handler invoked on a `'child-hidden'` message.
     */
    onChildHidden(msg) {
        super.onChildHidden(msg);
        // Post a fit request for the parent widget.
        this.parent.fit();
    }
    /**
     * A message handler invoked on a `'before-attach'` message.
     */
    onBeforeAttach(msg) {
        super.onBeforeAttach(msg);
        // Post a fit request for the parent widget.
        this.parent.fit();
    }
    /**
     * Attach a widget to the parent's DOM node.
     *
     * @param index - The current index of the widget in the layout.
     *
     * @param widget - The widget to attach to the parent.
     *
     * #### Notes
     * This is a reimplementation of the superclass method.
     */
    attachWidget(index, widget) {
        super.attachWidget(index, widget);
        // Post a fit request for the parent widget.
        this.parent.fit();
    }
    /**
     * Detach a widget from the parent's DOM node.
     *
     * @param index - The previous index of the widget in the layout.
     *
     * @param widget - The widget to detach from the parent.
     *
     * #### Notes
     * This is a reimplementation of the superclass method.
     */
    detachWidget(index, widget) {
        super.detachWidget(index, widget);
        // Post a fit request for the parent widget.
        this.parent.fit();
    }
}
/**
 * A class which provides a toolbar widget.
 */
export class Toolbar extends Widget {
    /**
     * Construct a new toolbar widget.
     */
    constructor() {
        super();
        this.addClass(TOOLBAR_CLASS);
        this.layout = new ToolbarLayout();
    }
    /**
     * Get an iterator over the ordered toolbar item names.
     *
     * @returns An iterator over the toolbar item names.
     */
    names() {
        let layout = this.layout;
        return map(layout.widgets, widget => {
            return Private.nameProperty.get(widget);
        });
    }
    /**
     * Add an item to the end of the toolbar.
     *
     * @param name - The name of the widget to add to the toolbar.
     *
     * @param widget - The widget to add to the toolbar.
     *
     * @param index - The optional name of the item to insert after.
     *
     * @returns Whether the item was added to toolbar.  Returns false if
     *   an item of the same name is already in the toolbar.
     *
     * #### Notes
     * The item can be removed from the toolbar by setting its parent to `null`.
     */
    addItem(name, widget) {
        let layout = this.layout;
        return this.insertItem(layout.widgets.length, name, widget);
    }
    /**
     * Insert an item into the toolbar at the specified index.
     *
     * @param index - The index at which to insert the item.
     *
     * @param name - The name of the item.
     *
     * @param widget - The widget to add.
     *
     * @returns Whether the item was added to the toolbar. Returns false if
     *   an item of the same name is already in the toolbar.
     *
     * #### Notes
     * The index will be clamped to the bounds of the items.
     * The item can be removed from the toolbar by setting its parent to `null`.
     */
    insertItem(index, name, widget) {
        let existing = find(this.names(), value => value === name);
        if (existing) {
            return false;
        }
        widget.addClass(TOOLBAR_ITEM_CLASS);
        let layout = this.layout;
        layout.insertWidget(index, widget);
        Private.nameProperty.set(widget, name);
        return true;
    }
    /**
     * Insert an item into the toolbar at the after a target item.
     *
     * @param at - The target item to insert after.
     *
     * @param name - The name of the item.
     *
     * @param widget - The widget to add.
     *
     * @returns Whether the item was added to the toolbar. Returns false if
     *   an item of the same name is already in the toolbar.
     *
     * #### Notes
     * The index will be clamped to the bounds of the items.
     * The item can be removed from the toolbar by setting its parent to `null`.
     */
    insertAfter(at, name, widget) {
        return this._insertRelative(at, 1, name, widget);
    }
    /**
     * Insert an item into the toolbar at the before a target item.
     *
     * @param at - The target item to insert before.
     *
     * @param name - The name of the item.
     *
     * @param widget - The widget to add.
     *
     * @returns Whether the item was added to the toolbar. Returns false if
     *   an item of the same name is already in the toolbar.
     *
     * #### Notes
     * The index will be clamped to the bounds of the items.
     * The item can be removed from the toolbar by setting its parent to `null`.
     */
    insertBefore(at, name, widget) {
        return this._insertRelative(at, 0, name, widget);
    }
    _insertRelative(at, offset, name, widget) {
        let nameWithIndex = map(this.names(), (name, i) => {
            return { name: name, index: i };
        });
        let target = find(nameWithIndex, x => x.name === at);
        if (target) {
            return this.insertItem(target.index + offset, name, widget);
        }
        return false;
    }
    /**
     * Handle the DOM events for the widget.
     *
     * @param event - The DOM event sent to the widget.
     *
     * #### Notes
     * This method implements the DOM `EventListener` interface and is
     * called in response to events on the dock panel's node. It should
     * not be called directly by user code.
     */
    handleEvent(event) {
        switch (event.type) {
            case 'click':
                if (!this.node.contains(document.activeElement) && this.parent) {
                    this.parent.activate();
                }
                break;
            default:
                break;
        }
    }
    /**
     * Handle `after-attach` messages for the widget.
     */
    onAfterAttach(msg) {
        this.node.addEventListener('click', this);
    }
    /**
     * Handle `before-detach` messages for the widget.
     */
    onBeforeDetach(msg) {
        this.node.removeEventListener('click', this);
    }
}
/**
 * The namespace for Toolbar class statics.
 */
(function (Toolbar) {
    /**
     * Create an interrupt toolbar item.
     */
    function createInterruptButton(session) {
        return new ToolbarButton({
            iconClassName: 'jp-StopIcon',
            onClick: () => {
                if (session.kernel) {
                    void session.kernel.interrupt();
                }
            },
            tooltip: 'Interrupt the kernel'
        });
    }
    Toolbar.createInterruptButton = createInterruptButton;
    /**
     * Create a restart toolbar item.
     */
    function createRestartButton(session) {
        return new ToolbarButton({
            iconClassName: 'jp-RefreshIcon',
            onClick: () => {
                void session.restart();
            },
            tooltip: 'Restart the kernel'
        });
    }
    Toolbar.createRestartButton = createRestartButton;
    /**
     * Create a toolbar spacer item.
     *
     * #### Notes
     * It is a flex spacer that separates the left toolbar items
     * from the right toolbar items.
     */
    function createSpacerItem() {
        return new Private.Spacer();
    }
    Toolbar.createSpacerItem = createSpacerItem;
    /**
     * Create a kernel name indicator item.
     *
     * #### Notes
     * It will display the `'display_name`' of the current kernel,
     * or `'No Kernel!'` if there is no kernel.
     * It can handle a change in context or kernel.
     */
    function createKernelNameItem(session) {
        const el = ReactWidget.create(React.createElement(Private.KernelNameComponent, { session: session }));
        el.addClass('jp-KernelName');
        return el;
    }
    Toolbar.createKernelNameItem = createKernelNameItem;
    /**
     * Create a kernel status indicator item.
     *
     * #### Notes
     * It will show a busy status if the kernel status is busy.
     * It will show the current status in the node title.
     * It can handle a change to the context or the kernel.
     */
    function createKernelStatusItem(session) {
        return new Private.KernelStatus(session);
    }
    Toolbar.createKernelStatusItem = createKernelStatusItem;
})(Toolbar || (Toolbar = {}));
/**
 * React component for a toolbar button.
 *
 * @param props - The props for ToolbarButtonComponent.
 */
export function ToolbarButtonComponent(props) {
    // In some browsers, a button click event moves the focus from the main
    // content to the button (see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#Clicking_and_focus).
    // We avoid a click event by calling preventDefault in mousedown, and
    // we bind the button action to `mousedown`.
    const handleMouseDown = (event) => {
        // Fire action only when left button is pressed.
        if (event.button === 0) {
            event.preventDefault();
            props.onClick();
        }
    };
    const handleKeyDown = (event) => {
        const { key } = event;
        if (key === 'Enter' || key === ' ') {
            props.onClick();
        }
    };
    return (React.createElement(Button, { className: props.className
            ? props.className + ' jp-ToolbarButtonComponent'
            : 'jp-ToolbarButtonComponent', disabled: props.enabled === false, onMouseDown: handleMouseDown, onKeyDown: handleKeyDown, title: props.tooltip || props.iconLabel, minimal: true },
        props.iconClassName && (React.createElement("span", { className: props.iconClassName +
                ' jp-ToolbarButtonComponent-icon jp-Icon jp-Icon-16' })),
        props.label && (React.createElement("span", { className: "jp-ToolbarButtonComponent-label" }, props.label))));
}
/**
 * Adds the toolbar button class to the toolbar widget.
 * @param w Toolbar button widget.
 */
export function addToolbarButtonClass(w) {
    w.addClass('jp-ToolbarButton');
    return w;
}
/**
 * Phosphor Widget version of static ToolbarButtonComponent.
 */
export class ToolbarButton extends ReactWidget {
    /**
     * Creates a toolbar button
     * @param props props for underlying `ToolbarButton` componenent
     */
    constructor(props = {}) {
        super();
        this.props = props;
        addToolbarButtonClass(this);
    }
    render() {
        return React.createElement(ToolbarButtonComponent, Object.assign({}, this.props));
    }
}
/**
 * React component for a toolbar button that wraps a command.
 *
 * This wraps the ToolbarButtonComponent and watches the command registry
 * for changes to the command.
 */
export function CommandToolbarButtonComponent(props) {
    return (React.createElement(UseSignal, { signal: props.commands.commandChanged, shouldUpdate: (sender, args) => (args.id === props.id && args.type === 'changed') ||
            args.type === 'many-changed' }, () => React.createElement(ToolbarButtonComponent, Object.assign({}, Private.propsFromCommand(props)))));
}
/*
 * Adds the command toolbar button class to the command toolbar widget.
 * @param w Command toolbar button widget.
 */
export function addCommandToolbarButtonClass(w) {
    w.addClass('jp-CommandToolbarButton');
    return w;
}
/**
 * Phosphor Widget version of CommandToolbarButtonComponent.
 */
export class CommandToolbarButton extends ReactWidget {
    /**
     * Creates a command toolbar button
     * @param props props for underlying `CommandToolbarButtonComponent` componenent
     */
    constructor(props) {
        super();
        this.props = props;
        addCommandToolbarButtonClass(this);
    }
    render() {
        return React.createElement(CommandToolbarButtonComponent, Object.assign({}, this.props));
    }
}
/**
 * A namespace for private data.
 */
var Private;
(function (Private) {
    function propsFromCommand(options) {
        let { commands, id } = options;
        const iconClassName = commands.iconClass(id);
        const iconLabel = commands.iconLabel(id);
        const label = commands.label(id);
        let className = commands.className(id);
        // Add the boolean state classes.
        if (commands.isToggled(id)) {
            className += ' p-mod-toggled';
        }
        if (!commands.isVisible(id)) {
            className += ' p-mod-hidden';
        }
        const tooltip = commands.caption(id) || label || iconLabel;
        const onClick = () => {
            void commands.execute(id);
        };
        const enabled = commands.isEnabled(id);
        return { className, iconClassName, tooltip, onClick, enabled, label };
    }
    Private.propsFromCommand = propsFromCommand;
    /**
     * An attached property for the name of a toolbar item.
     */
    Private.nameProperty = new AttachedProperty({
        name: 'name',
        create: () => ''
    });
    /**
     * A no-op function.
     */
    function noOp() {
        /* no-op */
    }
    Private.noOp = noOp;
    /**
     * A spacer widget.
     */
    class Spacer extends Widget {
        /**
         * Construct a new spacer widget.
         */
        constructor() {
            super();
            this.addClass(TOOLBAR_SPACER_CLASS);
        }
    }
    Private.Spacer = Spacer;
    /**
     * React component for a kernel name button.
     *
     * This wraps the ToolbarButtonComponent and watches the kernel
     * session for changes.
     */
    function KernelNameComponent(props) {
        return (React.createElement(UseSignal, { signal: props.session.kernelChanged, initialSender: props.session }, session => (React.createElement(ToolbarButtonComponent, { className: TOOLBAR_KERNEL_NAME_CLASS, onClick: props.session.selectKernel.bind(props.session), tooltip: 'Switch kernel', label: session.kernelDisplayName }))));
    }
    Private.KernelNameComponent = KernelNameComponent;
    /**
     * A toolbar item that displays kernel status.
     */
    class KernelStatus extends Widget {
        /**
         * Construct a new kernel status widget.
         */
        constructor(session) {
            super();
            this.addClass(TOOLBAR_KERNEL_STATUS_CLASS);
            this._onStatusChanged(session);
            session.statusChanged.connect(this._onStatusChanged, this);
        }
        /**
         * Handle a status on a kernel.
         */
        _onStatusChanged(session) {
            if (this.isDisposed) {
                return;
            }
            let status = session.status;
            const busy = this._isBusy(status);
            this.toggleClass(TOOLBAR_BUSY_CLASS, busy);
            this.toggleClass(TOOLBAR_IDLE_CLASS, !busy);
            let title = 'Kernel ' + status[0].toUpperCase() + status.slice(1);
            this.node.title = title;
        }
        /**
         * Check if status should be shown as busy.
         */
        _isBusy(status) {
            return (status === 'busy' || status === 'starting' || status === 'restarting');
        }
    }
    Private.KernelStatus = KernelStatus;
})(Private || (Private = {}));
//# sourceMappingURL=toolbar.js.map