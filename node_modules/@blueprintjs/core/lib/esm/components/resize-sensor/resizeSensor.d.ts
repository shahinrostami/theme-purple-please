/// <reference types="react" />
import * as React from "react";
/** A parallel type to `ResizeObserverEntry` (from resize-observer-polyfill). */
export interface IResizeEntry {
    /** Measured dimensions of the target. */
    contentRect: DOMRectReadOnly;
    /** The resized element. */
    target: Element;
}
/** `ResizeSensor` requires a single DOM element child and will error otherwise. */
export interface IResizeSensorProps {
    /**
     * Callback invoked when the wrapped element resizes.
     *
     * The `entries` array contains an entry for each observed element. In the
     * default case (no `observeParents`), the array will contain only one
     * element: the single child of the `ResizeSensor`.
     *
     * Note that this method is called _asynchronously_ after a resize is
     * detected and typically it will be called no more than once per frame.
     */
    onResize: (entries: IResizeEntry[]) => void;
    /**
     * If `true`, all parent DOM elements of the container will also be
     * observed for size changes. The array of entries passed to `onResize`
     * will now contain an entry for each parent element up to the root of the
     * document.
     *
     * Only enable this prop if a parent element resizes in a way that does
     * not also cause the child element to resize.
     * @default false
     */
    observeParents?: boolean;
}
export declare class ResizeSensor extends React.PureComponent<IResizeSensorProps> {
    static displayName: string;
    private element;
    private observer;
    render(): React.ReactElement<any>;
    componentDidMount(): void;
    componentDidUpdate(prevProps: IResizeSensorProps): void;
    componentWillUnmount(): void;
    /**
     * Observe the DOM element, if defined and different from the currently
     * observed element. Pass `force` argument to skip element checks and always
     * re-observe.
     */
    private observeElement(force?);
    private getElement();
}
