/// <reference types="node" />
export declare const deferred: <T>() => Deferred<T>;
export declare class Deferred<T> {
    then: Promise<T>['then'];
    catch: Promise<T>['catch'];
    finally: Promise<T>['finally'];
    constructor();
}
export declare const Next: unique symbol;
export declare const Last: unique symbol;
export declare const This: unique symbol;
export declare class Sequence<T> {
    static from(...values: any[]): Sequence<{}>;
    protected readonly [This]: Deferred<IteratorResult<T>>;
    protected [Next]: Sequence<T>;
    constructor(iteration?: Iteration<T>);
    return(): this;
    [Symbol.asyncIterator](): AsyncIterableIterator<T>;
}
export declare class Peekable<T> extends Sequence<T> {
    peek(until?: Sequence<T> | number): Sequence<T>[];
}
export declare const resolve: (deferred: any, value: any) => any;
export declare const reject: (deferred: any, reason: any) => any;
export declare const all: {
    <TAll>(values: Iterable<TAll | PromiseLike<TAll>>): Promise<TAll[]>;
    <T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>, T9 | PromiseLike<T9>, T10 | PromiseLike<T10>]): Promise<[T1, T2, T3, T4, T5, T6, T7, T8, T9, T10]>;
    <T1, T2, T3, T4, T5, T6, T7, T8, T9>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>, T9 | PromiseLike<T9>]): Promise<[T1, T2, T3, T4, T5, T6, T7, T8, T9]>;
    <T1, T2, T3, T4, T5, T6, T7, T8>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>]): Promise<[T1, T2, T3, T4, T5, T6, T7, T8]>;
    <T1, T2, T3, T4, T5, T6, T7>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>]): Promise<[T1, T2, T3, T4, T5, T6, T7]>;
    <T1, T2, T3, T4, T5, T6>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>]): Promise<[T1, T2, T3, T4, T5, T6]>;
    <T1, T2, T3, T4, T5>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>]): Promise<[T1, T2, T3, T4, T5]>;
    <T1, T2, T3, T4>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>]): Promise<[T1, T2, T3, T4]>;
    <T1, T2, T3>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>]): Promise<[T1, T2, T3]>;
    <T1, T2>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>]): Promise<[T1, T2]>;
    <T>(values: (T | PromiseLike<T>)[]): Promise<T[]>;
};
export declare const collate: (iterative: any) => Promise<any[]>;
export declare const sequence: (...values: any[]) => Sequence<{}>;
export interface Resolvable<T> extends Promise<T> {
    resolve(value: T): void;
}
export interface Rejectable<T> extends Promise<T> {
    reject(reason: any): void;
}
export interface Deferred<T> extends Resolvable<T>, Rejectable<T> {
}
export interface AsyncIteratorResult<T> extends Promise<IteratorResult<T>> {
}
export interface Iteration<T> extends Partial<IteratorResult<T>> {
    done?: boolean;
    value?: T;
    next?: Sequence<T>;
}
export interface Sequence<T> extends AsyncIteratorResult<T>, AsyncIterableIterator<T> {
    then: AsyncIteratorResult<T>['then'];
    catch: AsyncIteratorResult<T>['catch'];
    finally: AsyncIteratorResult<T>['finally'];
    result: IteratorResult<T> | Iteration<T>;
    iteration: Iteration<T>;
    resolve(value: T): void;
    next(value?: any): Sequence<T>;
}
export declare namespace Peekable {
    function from<T>(...values: T[]): Peekable<T>;
}
