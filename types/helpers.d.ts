export declare const describe: (symbol: symbol) => string;
export declare function UniqueSymbol(description: any, symbol?: symbol): symbol;
export declare const formatObject: (object: any) => string;
export declare const formatSymbol: (symbol: any) => string;
export declare const formatValue: (value: any) => string;
export declare const closedResult: Readonly<{
    done: boolean;
    value: any;
}>;
export declare const closed: () => Promise<Readonly<{
    done: boolean;
    value: any;
}>>;
export declare const noop: (...args: any[]) => void;
export declare const passthru: <T>(value: T, ...args: any[]) => T;
export declare const fail: (reason: any) => never;
export declare const failWith: (reason: any) => () => never;
export declare const each: (ƒ: any, ...values: any[]) => any;
export declare const bind: any;
export declare const call: any;
export declare const up: (v: any) => any;
export declare const down: (v: any) => number;
export declare const delay: (ms: any) => Promise<{}>;
export declare const cap: (promise: any, ms?: number, reason?: string) => Promise<any>;
export declare const sync: (any: any) => any;
export declare const async: (any: any) => any;
export declare const deferred: <T>() => DeferredPromise<T>;
export interface DeferredPromise<T> extends Promise<T> {
    resolve(value: T): void;
    reject(reason: any): void;
}
