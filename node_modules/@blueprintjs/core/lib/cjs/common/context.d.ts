export declare type Validator = (props: {
    [key: string]: any;
}, propName: string, componentName: string, location: string, propFullName: string) => Error | null;
export declare type ValidationMap<T> = {
    [K in keyof T]?: Validator;
};
