import { Sequence } from './promises';
export declare const append: <T>(stream: Stream<T>, ...values: T[]) => void;
export declare const unwrap: <T>(result: Async<Partial<IteratorResult<T>>>) => Promise<T>;
export declare class Stream<T> {
    static from<T>(): Stream<T>;
    static from<T>(stream: Stream<T>): Stream<T>;
    static from<T>(...values: T[]): Stream<T>;
    constructor();
    protected sequence?: Sequence<T>;
}
export declare const stream: typeof Stream.from;
export interface Stream<T> {
    constructor: Constructor<T>;
    /** Returns a promise for next value @interface {Stream} */
    (): Value<T>;
    /** Appends a value to the stream @interface {Stream} */
    (value: Value<T>): this;
    /** Ends the current stream @interface {Stream} */
    end(): void;
    /** Adds a mapper for future values @interface {Stream} */
    map<U>(mapper: Mapper<T, U>): Stream<U>;
    /** Returns a promise for next iterator result @interface {AsyncIterator} */
    next(): Result<T>;
    /** Appends a value to the stream @interface {Stream} */
    next(value: Value<T>): this;
    /** Standard for Async Iterator protocol @interface {AsyncIterator} */
    [Symbol.asyncIterator](): this;
}
export import Async = Stream.Async;
export import Result = Stream.Result;
export import Value = Stream.Value;
export import Constructor = Stream.Constructor;
export import Mapper = Stream.Mapper;
export declare namespace Stream {
    interface Async<T = any> extends Partial<Pick<Promise<T>, 'then' | 'catch' | 'finally'>> {
        then: Promise<T>['then'];
    }
    type Result<T = any> = Async<Partial<IteratorResult<T>>>;
    type Value<T = any> = T | Async<T>;
    interface Constructor<T = any> {
        [Symbol.species]?: Constructor<T>;
        new (...args: any[]): Stream<T>;
    }
    type Mapper<T = any, U = any> = (value: T) => U;
}
