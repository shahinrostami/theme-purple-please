/// <reference types="react" />
import * as React from "react";
import { IConstructor } from "../../common/constructor";
export interface IContextMenuTargetComponent extends React.Component {
    render(): React.ReactElement<any> | null | undefined;
    renderContextMenu(e: React.MouseEvent<HTMLElement>): JSX.Element | undefined;
    onContextMenuClose?(): void;
}
export declare function ContextMenuTarget<T extends IConstructor<IContextMenuTargetComponent>>(WrappedComponent: T): {
    new (...args: any[]): {
        render(): React.ReactElement<any>;
        renderContextMenu(e: React.MouseEvent<HTMLElement>): JSX.Element;
        onContextMenuClose?(): void;
        setState<K extends never>(state: {} | ((prevState: Readonly<{}>, props: Readonly<{}>) => {} | Pick<{}, K>) | Pick<{}, K>, callback?: () => void): void;
        forceUpdate(callBack?: () => void): void;
        readonly props: Readonly<{
            children?: React.ReactNode;
        }> & Readonly<{}>;
        state: Readonly<{}>;
        context: any;
        refs: {
            [key: string]: React.ReactInstance;
        };
        componentDidMount?(): void;
        shouldComponentUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): boolean;
        componentWillUnmount?(): void;
        componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
        getSnapshotBeforeUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>): any;
        componentDidUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>, snapshot?: any): void;
        componentWillMount?(): void;
        UNSAFE_componentWillMount?(): void;
        componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void;
        UNSAFE_componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void;
        componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void;
        UNSAFE_componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void;
    };
    displayName: string;
} & T;
