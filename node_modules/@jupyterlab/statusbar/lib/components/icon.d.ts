import * as React from 'react';
/**
 * A namespace for IconItem statics.
 */
export declare namespace IconItem {
    /**
     * Props for an IconItem
     */
    interface IProps {
        /**
         * A CSS class name for the icon.
         */
        source: string;
    }
}
/**
 * A functional tsx component for an icon.
 */
export declare function IconItem(props: IconItem.IProps & React.HTMLAttributes<HTMLDivElement>): React.ReactElement<IconItem.IProps>;
