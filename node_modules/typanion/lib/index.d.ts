export declare type BoundCoercionFn = () => BoundCoercionFn;
export declare type CoercionFn = (v: any) => BoundCoercionFn;
export declare type Coercion = [string, BoundCoercionFn];
export declare type ValidationState = {
    p?: string;
    errors?: string[];
    coercions?: Coercion[];
    coercion?: CoercionFn;
};
export declare type Trait<Type> = {
    __trait: Type;
};
export declare type InferType<U> = U extends Trait<infer V> ? V : never;
export declare type LooseTest<U> = (value: U, test?: ValidationState) => boolean;
export declare type StrictTest<U, V extends U> = (value: U, test?: ValidationState) => value is V;
export declare type LooseValidator<U, V> = LooseTest<U> & Trait<V>;
export declare type StrictValidator<U, V extends U> = StrictTest<U, V> & Trait<V>;
export declare type AnyStrictValidator = StrictValidator<any, any>;
export declare const simpleKeyRegExp: RegExp;
export declare const colorStringRegExp: RegExp;
export declare const colorStringAlphaRegExp: RegExp;
export declare const base64RegExp: RegExp;
export declare const uuid4RegExp: RegExp;
export declare const iso8601RegExp: RegExp;
export declare const makeTrait: <U>(value: U) => <V>() => U & Trait<V>;
export declare function makeValidator<U, V extends U>({ test }: {
    test: StrictTest<U, V>;
}): StrictValidator<U, V>;
export declare function makeValidator<U, V extends U = U>({ test }: {
    test: LooseTest<U>;
}): LooseValidator<U, V>;
export declare function getPrintable(value: unknown): string;
export declare function computeKey(state: ValidationState | undefined, key: string | number): string;
export declare function makeCoercionFn(target: any, key: any): CoercionFn;
export declare function makeSetter(target: any, key: any): (v: any) => void;
export declare function plural(n: number, singular: string, plural: string): string;
export declare function pushError({ errors, p }: ValidationState | undefined, message: string): boolean;
export declare const isUnknown: () => StrictValidator<unknown, unknown>;
export declare function isLiteral(expected: null): StrictValidator<unknown, null>;
export declare function isLiteral(expected: true): StrictValidator<unknown, true>;
export declare function isLiteral(expected: false): StrictValidator<unknown, false>;
export declare function isLiteral<T extends number>(expected: T): StrictValidator<unknown, T>;
export declare function isLiteral<T extends string>(expected: T): StrictValidator<unknown, T>;
export declare function isLiteral<T>(expected: T): StrictValidator<unknown, T>;
export declare const isString: () => StrictValidator<unknown, string>;
export declare function isEnum<T extends boolean | string | number | null>(values: ReadonlyArray<T>): StrictValidator<unknown, T>;
export declare function isEnum<T>(enumSpec: Record<string, T>): StrictValidator<unknown, T>;
export declare const isBoolean: () => StrictValidator<unknown, boolean>;
export declare const isNumber: () => StrictValidator<unknown, number>;
export declare const isDate: () => StrictValidator<unknown, Date>;
export declare const isArray: <T extends StrictValidator<any, any>>(spec: T, { delimiter }?: {
    delimiter?: string | RegExp | undefined;
}) => StrictValidator<unknown, InferType<T>[]>;
declare type AnyStrictValidatorTuple = AnyStrictValidator[] | [];
declare type InferTypeFromTuple<T extends AnyStrictValidatorTuple> = {
    [K in keyof T]: InferType<T[K]>;
};
export declare const isTuple: <T extends AnyStrictValidatorTuple>(spec: T, { delimiter }?: {
    delimiter?: string | RegExp | undefined;
}) => StrictValidator<unknown, InferTypeFromTuple<T>>;
declare type DeriveIndexUnlessNull<T extends AnyStrictValidator | null> = T extends null ? {} : InferType<T>;
export declare const isDict: <T extends StrictValidator<any, any>>(spec: T, { keys: keySpec, }?: {
    keys?: StrictValidator<unknown, string> | null;
}) => StrictValidator<unknown, {
    [k: string]: InferType<T>;
}>;
declare type UndefinedProperties<T> = {
    [P in keyof T]-?: undefined extends T[P] ? P : never;
}[keyof T];
declare type ToOptional<T> = Partial<Pick<T, UndefinedProperties<T>>> & Pick<T, Exclude<keyof T, UndefinedProperties<T>>>;
export declare const isObject: <T extends { [P in keyof T]: StrictValidator<any, any>; }, UnknownValidator extends StrictValidator<any, any> | null = null>(props: T, { extra: extraSpec, }?: {
    extra?: UnknownValidator | undefined;
}) => StrictValidator<unknown, ToOptional<{ [P_1 in keyof T]: InferType<T[P_1]>; } & DeriveIndexUnlessNull<UnknownValidator>>>;
export declare const isInstanceOf: <T extends new (...args: any) => InstanceType<T>>(constructor: T) => StrictValidator<unknown, InstanceType<T>>;
export declare const isOneOf: <T extends StrictValidator<any, any>>(specs: readonly T[], { exclusive, }?: {
    exclusive?: boolean | undefined;
}) => StrictValidator<unknown, InferType<T>>;
export declare const applyCascade: <T extends StrictValidator<any, any>>(spec: T, followups: (StrictTest<InferType<T>, InferType<T>> | LooseTest<InferType<T>>)[]) => StrictValidator<unknown, InferType<T>>;
export declare const isOptional: <T extends StrictValidator<any, any>>(spec: T) => StrictValidator<unknown, InferType<T> | undefined>;
export declare const isNullable: <T extends StrictValidator<any, any>>(spec: T) => StrictValidator<unknown, InferType<T> | null>;
export declare const hasMinLength: <T extends {
    length: number;
}>(length: number) => LooseValidator<T, T>;
export declare const hasMaxLength: <T extends {
    length: number;
}>(length: number) => LooseValidator<T, T>;
export declare const hasExactLength: <T extends {
    length: number;
}>(length: number) => LooseValidator<T, T>;
export declare const hasUniqueItems: <T>({ map, }?: {
    map?: ((value: T) => unknown) | undefined;
}) => LooseValidator<T[], T[]>;
export declare const isNegative: () => LooseValidator<number, number>;
export declare const isPositive: () => LooseValidator<number, number>;
export declare const isAtLeast: (n: number) => LooseValidator<number, number>;
export declare const isAtMost: (n: number) => LooseValidator<number, number>;
export declare const isInInclusiveRange: (a: number, b: number) => LooseValidator<number, number>;
export declare const isInExclusiveRange: (a: number, b: number) => LooseValidator<number, number>;
export declare const isInteger: ({ unsafe, }?: {
    unsafe?: boolean | undefined;
}) => LooseValidator<number, number>;
export declare const matchesRegExp: (regExp: RegExp) => LooseValidator<string, string>;
export declare const isLowerCase: () => LooseValidator<string, string>;
export declare const isUpperCase: () => LooseValidator<string, string>;
export declare const isUUID4: () => LooseValidator<string, string>;
export declare const isISO8601: () => LooseValidator<string, string>;
export declare const isHexColor: ({ alpha, }: {
    alpha?: boolean | undefined;
}) => LooseValidator<string, string>;
export declare const isBase64: () => LooseValidator<string, string>;
export declare const isJSON: (spec?: AnyStrictValidator) => LooseValidator<string, string>;
export declare const hasRequiredKeys: (requiredKeys: string[]) => LooseValidator<{
    [key: string]: unknown;
}, {
    [key: string]: unknown;
}>;
export declare const hasForbiddenKeys: (forbiddenKeys: string[]) => LooseValidator<{
    [key: string]: unknown;
}, {
    [key: string]: unknown;
}>;
export declare const hasMutuallyExclusiveKeys: (exclusiveKeys: string[]) => LooseValidator<{
    [key: string]: unknown;
}, {
    [key: string]: unknown;
}>;
export declare enum KeyRelationship {
    Forbids = "Forbids",
    Requires = "Requires"
}
export declare const hasKeyRelationship: (subject: string, relationship: KeyRelationship, others: string[], { ignore, }?: {
    ignore?: any[] | undefined;
}) => LooseValidator<{
    [key: string]: unknown;
}, {
    [key: string]: unknown;
}>;
export {};
