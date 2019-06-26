/// <reference types="react" />
import { AbstractPureComponent } from "../../common/abstractPureComponent";
import { IIntentProps, IProps } from "../../common/props";
export interface ISpinnerProps extends IProps, IIntentProps {
    /**
     * Width and height of the spinner in pixels. The size cannot be less than
     * 10px.
     *
     * Constants are available for common sizes:
     * - `Spinner.SIZE_SMALL = 20px`
     * - `Spinner.SIZE_STANDARD = 50px`
     * - `Spinner.SIZE_LARGE = 100px`
     *
     * @default Spinner.SIZE_STANDARD = 50
     */
    size?: number;
    /**
     * HTML tag for the two wrapper elements. If rendering a `<Spinner>` inside
     * an `<svg>`, change this to an SVG element like `"g"`.
     * @default "div"
     */
    tagName?: keyof JSX.IntrinsicElements;
    /**
     * A value between 0 and 1 (inclusive) representing how far along the operation is.
     * Values below 0 or above 1 will be interpreted as 0 or 1 respectively.
     * Omitting this prop will result in an "indeterminate" spinner where the head spins indefinitely.
     */
    value?: number;
}
export declare class Spinner extends AbstractPureComponent<ISpinnerProps, {}> {
    static displayName: string;
    static readonly SIZE_SMALL: number;
    static readonly SIZE_STANDARD: number;
    static readonly SIZE_LARGE: number;
    componentDidUpdate(prevProps: ISpinnerProps): void;
    render(): JSX.Element;
    protected validateProps({className, size}: ISpinnerProps): void;
    /**
     * Resolve size to a pixel value.
     * Size can be set by className, props, default, or minimum constant.
     */
    private getSize();
    /** Compute viewbox such that stroked track sits exactly at edge of image frame. */
    private getViewBox(strokeWidth);
}
