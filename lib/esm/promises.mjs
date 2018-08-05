const debugging = false;
const { log } = console;
export const deferred = () => {
    let resolve, reject;
    const promise = new Promise((resolver, rejector) => {
        resolve = resolver;
        reject = rejector;
    });
    Object.defineProperty(promise, 'resolve', { get: () => resolve });
    Object.defineProperty(promise, 'reject', { get: () => reject });
    return promise;
};
export class Deferred {
    constructor() {
        const promise = deferred();
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
export class Sequence {
    constructor(iteration = {}) {
        const promise = (this[This] = deferred());
        this.then = ƒ => promise.then(ƒ);
        this.catch = ƒ => promise.catch(ƒ);
        this.finally = ƒ => promise.finally(ƒ);
        this.iteration = iteration;
        this.result = this[Next] = iteration.value = undefined;
        iteration.done = !!iteration.done;
        // iteration[Next] = this;
        // this[Then] = this;
    }
    static from(...values) {
        const promise = new this();
        for (const value of values)
            promise.next(value);
        return promise;
    }
    ;
    resolve(value) {
        if (this.result)
            return;
        const iteration = this.iteration;
        const done = !!iteration.done;
        const next = this[Next];
        const result = (!done && { done, value }) || iteration;
        this[This].resolve((this.result = result));
        done && next && next.resolve(undefined);
    }
    return() {
        const iteration = this.iteration;
        if (!iteration || iteration.done)
            return this;
        iteration.done = true;
        if (!this.result) {
            this.resolve(undefined);
        }
        else {
            const next = this[Next];
            if (next && next.iteration === iteration) {
                next.resolve(undefined);
                // return next;
            }
        }
        return this;
    }
    next(value) {
        const iteration = this.iteration;
        const done = iteration.done;
        let then;
        //= iteration[Next]; // || (iteration[Next] = this); // this[Then];
        if (done) {
            this.result || this.resolve(undefined);
            debugging && log('done: %O', { then: this === this, done });
            return this;
        }
        const next = this[Next] || (this[Next] = new Sequence(iteration));
        if (arguments.length > 0) {
            if (this.result) {
                this[Next] = next.next(value);
            }
            else {
                debugging && log('next(%O): %O', value, { then: this === this, done });
                this.resolve(value);
            }
            return this;
        }
        const last = iteration[Last];
        then = then || ((!last && this) || (last === this && next) || last.next());
        debugging && log('next(): %O', { then: this === this, done });
        return (iteration[Last] = then);
    }
    [Symbol.asyncIterator]() {
        return this;
    }
}
Object.setPrototypeOf(Sequence, Promise);
Object.setPrototypeOf(Sequence.prototype, Promise.prototype);
export class Peekable extends Sequence {
    peek(until) {
        const iteration = this.iteration;
        const promises = [this];
        let current = this[Next];
        if (typeof until === 'number') {
            for (let n = until; current && --n; current = current[Next]) {
                promises.push(current);
            }
        }
        else {
            if (!until)
                until = iteration[Last];
            if (typeof until !== 'object' || until.iteration !== iteration)
                throw ReferenceError(`Slice called with an incompatible "until" value`);
            for (let n = 500; current && current !== until && current.result && --n; current = current[Next]) {
                promises.push(current);
            }
        }
        return promises;
    }
}
// Object.setPrototypeOf(Peekable, Sequence);
export const resolve = (deferred, value) => (deferred.resolve(value), deferred);
export const reject = (deferred, reason) => (deferred.reject(reason), deferred);
export const { all } = Promise;
export const collate = async (iterative) => {
    const values = [];
    if (!iterative)
        return values;
    // iterative.iteration && iterative.return();
    for await (const value of iterative) {
        values.push(value);
    }
    return values;
};
export const sequence = (...values) => {
    const promise = new Sequence();
    for (const value of values)
        promise.next(value);
    return promise;
};
