const debugging = false;
const {log} = console;

export const deferred = <T>(): Deferred<T> => {
  let resolve, reject;
  const promise = new Promise((resolver, rejector) => {
    resolve = resolver;
    reject = rejector;
  });
  Object.defineProperty(promise, 'resolve', {get: () => resolve});
  Object.defineProperty(promise, 'reject', {get: () => reject});
  return promise as any;
};

export class Deferred<T> {
  then: Promise<T>['then'];
  catch: Promise<T>['catch'];
  finally: Promise<T>['finally'];
  constructor() {
    const promise = deferred<T>();
    this.then = ƒ => promise.then(ƒ);
    this.catch = ƒ => promise.catch(ƒ);
    this.finally = ƒ => promise.finally(ƒ);
    this.resolve = value => promise.resolve(value);
    this.reject = value => promise.reject(value);
  }
}

Object.setPrototypeOf(Deferred, Promise);
Object.setPrototypeOf(Deferred.prototype, Promise.prototype);

export const Next = Symbol('[[next]]');
export const Last = Symbol('[[last]]');
export const This = Symbol('[[this]]');
// const Then = Symbol('[[then]]');

export class Sequence<T> {
  static from(...values) {
    const promise = new this();
    for (const value of values) promise.next(value);
    return promise;
  };

  protected readonly [This]: Deferred<IteratorResult<T>>;
  protected [Next]: Sequence<T>;

  constructor(iteration: Iteration<T> = {}) {
    const promise = (this[This] = deferred<IteratorResult<T>>());
    this.then = ƒ => promise.then(ƒ);
    this.catch = ƒ => promise.catch(ƒ);
    this.finally = ƒ => promise.finally(ƒ);
    this.iteration = iteration;
    this.result = this[Next] = iteration.value = undefined;
    iteration.done = !!iteration.done;
    // iteration[Next] = this;
    // this[Then] = this;
  }

  resolve(value: T) {
    if (this.result) return;
    const iteration = this.iteration;
    const done = !!iteration.done;
    const next = this[Next];
    const result = (!done && {done, value}) || iteration;
    this[This].resolve((this.result = result as IteratorResult<T>));
    done && next && next.resolve(undefined);
  }

  return() {
    const iteration = this.iteration;

    if (!iteration || iteration.done) return this;

    iteration.done = true;

    if (!this.result) {
      this.resolve(undefined);
    } else {
      const next = this[Next];
      if (next && next.iteration === iteration) {
        next.resolve(undefined);
        // return next;
      }
    }
    return this;
  }

  next(value?: T) {
    const iteration = this.iteration;
    const done = iteration.done;
    let then;
    //= iteration[Next]; // || (iteration[Next] = this); // this[Then];

    if (done) {
      this.result || this.resolve(undefined);
      debugging && log('done: %O', {then: this === this, done});
      return this;
    }

    const next = this[Next] || (this[Next] = new Sequence<T>(iteration));

    if (arguments.length > 0) {
      if (this.result) {
        this[Next] = next.next(value);
      } else {
        debugging && log('next(%O): %O', value, {then: this === this, done});
        this.resolve(value);
      }
      return this;
    }

    const last = iteration[Last];

    then = then || ((!last && this) || (last === this && next) || last.next());

    debugging && log('next(): %O', {then: this === this, done});

    return (iteration[Last] = then);
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<T> {
    return this;
  }
}

Object.setPrototypeOf(Sequence, Promise);
Object.setPrototypeOf(Sequence.prototype, Promise.prototype);

export class Peekable<T> extends Sequence<T> {
  peek(until?: Sequence<T> | number) {
    const iteration = this.iteration;
    const promises: Sequence<T>[] = [this];
    let current = this[Next];
    if (typeof until === 'number') {
      for (let n = until; current && --n; current = current[Next]) {
        promises.push(current);
      }
    } else {
      if (!until) until = iteration[Last];
      if (typeof until !== 'object' || until.iteration !== iteration)
        throw ReferenceError(`Slice called with an incompatible "until" value`);
      for (
        let n = 500;
        current && current !== until && current.result && --n;
        current = current[Next]
      ) {
        promises.push(current);
      }
    }
    return promises;
  }

  // static from<T>(... values: T[]): Peekable<T>;
}

// Object.setPrototypeOf(Peekable, Sequence);

export const resolve = (deferred, value) => (deferred.resolve(value), deferred);
export const reject = (deferred, reason) => (deferred.reject(reason), deferred);

export const {all} = Promise;
export const collate = async iterative => {
  const values = [];
  if (!iterative) return values;
  // iterative.iteration && iterative.return();
  for await (const value of iterative) {
    values.push(value);
  }
  return values;
};
export const sequence = (...values) => {
  const promise = new Sequence();
  for (const value of values) promise.next(value);
  return promise;
};

/// AMBIENT ///

export interface Resolvable<T> extends Promise<T> {
  resolve(value: T): void;
}
export interface Rejectable<T> extends Promise<T> {
  reject(reason: any): void;
}

export interface Deferred<T> extends Resolvable<T>, Rejectable<T> {}

export interface AsyncIteratorResult<T> extends Promise<IteratorResult<T>> {}

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
  // reject: (reason) => void;
  resolve(value: T): void;
  next(value?: any): Sequence<T>;
}

export declare namespace Peekable {
  export function from<T>(... values: T[]): Peekable<T>;
}
