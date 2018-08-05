import {Sequence, Last} from './promises';

const {setPrototypeOf, defineProperty} = Object;

export const append = <T>(stream: Stream<T>, ...values: T[]) => {
  for (const value of values) stream.next(value);
};

export const unwrap = async <T>(result: Result<T>): Promise<T> => {
  return (result = await result as any).value || result;
}

export class Stream<T> {

  static from<T>(): Stream<T>;
  static from<T>(stream: Stream<T>): Stream<T>;
  static from<T>(...values: T[]): Stream<T>;
  static from<T>() {
    const species: Constructor<T> = this && (this[Symbol.species] || this) || Stream;
    const stream: Stream<T> = new species();
    if (arguments.length) {
      const source =
        arguments.length === 1 && arguments[0] instanceof Stream && (arguments[0] as Stream<T>);
      if (source) {
        if (!source.map || typeof source.map !== 'function')
          throw TypeError(
            `Stream.from was called with an incompatible source (<source>.map is not a function)`,
          );
        source.map(stream);
      } else {
        append(stream, ...arguments);
      }
    }
    return stream;
  }

  constructor() {
    const constructor: Constructor<any> = this.constructor[Symbol.species] || new.target || Stream;

    const mappers = new Set();

    let sequence = (this.sequence = new Sequence<T>());
    const iteration = sequence.iteration;

    const stream = value => {
      if (value === undefined) {
        const result = sequence = sequence.next();
        return unwrap(result);
      } else {
        sequence.next(value);
        if (mappers.size) for (const mapper of mappers) mapper(value);
        return stream;
      }
    };

    const map = mapper => {
      const stream: Stream<any> = new constructor();
      mappers.add(value => stream(mapper(value)));
      return stream;
    };

    const next = value => {
      if (value === undefined) {
        return sequence.next();
      } else {
        sequence.next(value);
        return stream;
      }
    };

    stream['map'] = map;
    stream['next'] = next;

    return setPrototypeOf(stream, this);
  }

  [Symbol.asyncIterator]() { return this; }

  protected sequence?: Sequence<T>;
}

export const stream = Stream.from;

/// CHECKS ///

// declare const x: Stream<number>;
// const x1 = x.next(1);
// const xs = x.next();

/// AMBIENT ///

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

// export import Iterative = Stream.Iterative;
export import Async = Stream.Async;
export import Result = Stream.Result;
export import Value = Stream.Value;
export import Constructor = Stream.Constructor;
export import Mapper = Stream.Mapper;

export namespace Stream {
  export interface Async<T = any> extends Partial<Pick<Promise<T>, 'then' | 'catch' | 'finally'>> {
    then: Promise<T>['then'];
  }

  export type Result<T = any> = Async<Partial<IteratorResult<T>>>;
  //| Async<Partial<IteratorResult<T>>>;

  export type Value<T = any> = T | Async<T>;

  export interface Constructor<T = any> {
    [Symbol.species]?: Constructor<T>;
    new (...args: any[]): Stream<T>;
  }

  export type Mapper<T = any, U = any> = (value: T) => U;
}
