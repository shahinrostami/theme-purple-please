/// <reference types="react" />
import * as React from "react";
import { IConstructor } from "../../common/constructor";
import { IHotkeysProps } from "./hotkeys";
import { HotkeysEvents } from "./hotkeysEvents";
export interface IHotkeysTargetComponent extends React.Component {
    /** Components decorated with the `@HotkeysTarget` decorator must implement React's component `render` function. */
    render(): React.ReactElement<any> | null | undefined;
    /**
     * Components decorated with the `@HotkeysTarget` decorator must implement
     * this method, and it must return a `Hotkeys` React element.
     */
    renderHotkeys(): React.ReactElement<IHotkeysProps>;
}
export declare function HotkeysTarget<T extends IConstructor<IHotkeysTargetComponent>>(WrappedComponent: T): {
    new (...args: any[]): {
        globalHotkeysEvents?: HotkeysEvents;
        localHotkeysEvents?: HotkeysEvents;
        componentWillMount(): void;
        componentDidMount(): void;
        componentWillUnmount(): void;
        render(): React.ReactElement<any>;
        renderHotkeys(): React.ReactElement<IHotkeysProps>;
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
        shouldComponentUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): boolean;
        componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
        getSnapshotBeforeUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>): any;
        componentDidUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>, snapshot?: any): void;
        UNSAFE_componentWillMount?(): void;
        componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void;
        UNSAFE_componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void;
        componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void;
        UNSAFE_componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void;
    };
    displayName: string;
} & T;
