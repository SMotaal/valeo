"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const debugging = false;
const { log } = console;
exports.deferred = () => {
    let resolve, reject;
    const promise = new Promise((resolver, rejector) => {
        resolve = resolver;
        reject = rejector;
    });
    Object.defineProperty(promise, 'resolve', { get: () => resolve });
    Object.defineProperty(promise, 'reject', { get: () => reject });
    return promise;
};
class Deferred {
    constructor() {
        const promise = exports.deferred();
        this.then = ƒ => promise.then(ƒ);
        this.catch = ƒ => promise.catch(ƒ);
        this.finally = ƒ => promise.finally(ƒ);
        this.resolve = value => promise.resolve(value);
        this.reject = value => promise.reject(value);
    }
}
exports.Deferred = Deferred;
Object.setPrototypeOf(Deferred, Promise);
Object.setPrototypeOf(Deferred.prototype, Promise.prototype);
exports.Next = Symbol('[[next]]');
exports.Last = Symbol('[[last]]');
exports.This = Symbol('[[this]]');
// const Then = Symbol('[[then]]');
class Sequence {
    constructor(iteration = {}) {
        const promise = (this[exports.This] = exports.deferred());
        this.then = ƒ => promise.then(ƒ);
        this.catch = ƒ => promise.catch(ƒ);
        this.finally = ƒ => promise.finally(ƒ);
        this.iteration = iteration;
        this.result = this[exports.Next] = iteration.value = undefined;
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
        const next = this[exports.Next];
        const result = (!done && { done, value }) || iteration;
        this[exports.This].resolve((this.result = result));
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
            const next = this[exports.Next];
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
        const next = this[exports.Next] || (this[exports.Next] = new Sequence(iteration));
        if (arguments.length > 0) {
            if (this.result) {
                this[exports.Next] = next.next(value);
            }
            else {
                debugging && log('next(%O): %O', value, { then: this === this, done });
                this.resolve(value);
            }
            return this;
        }
        const last = iteration[exports.Last];
        then = then || ((!last && this) || (last === this && next) || last.next());
        debugging && log('next(): %O', { then: this === this, done });
        return (iteration[exports.Last] = then);
    }
    [Symbol.asyncIterator]() {
        return this;
    }
}
exports.Sequence = Sequence;
Object.setPrototypeOf(Sequence, Promise);
Object.setPrototypeOf(Sequence.prototype, Promise.prototype);
class Peekable extends Sequence {
    peek(until) {
        const iteration = this.iteration;
        const promises = [this];
        let current = this[exports.Next];
        if (typeof until === 'number') {
            for (let n = until; current && --n; current = current[exports.Next]) {
                promises.push(current);
            }
        }
        else {
            if (!until)
                until = iteration[exports.Last];
            if (typeof until !== 'object' || until.iteration !== iteration)
                throw ReferenceError(`Slice called with an incompatible "until" value`);
            for (let n = 500; current && current !== until && current.result && --n; current = current[exports.Next]) {
                promises.push(current);
            }
        }
        return promises;
    }
}
exports.Peekable = Peekable;
// Object.setPrototypeOf(Peekable, Sequence);
exports.resolve = (deferred, value) => (deferred.resolve(value), deferred);
exports.reject = (deferred, reason) => (deferred.reject(reason), deferred);
exports.all = Promise.all;
exports.collate = async (iterative) => {
    var e_1, _a;
    const values = [];
    if (!iterative)
        return values;
    try {
        // iterative.iteration && iterative.return();
        for (var iterative_1 = __asyncValues(iterative), iterative_1_1; iterative_1_1 = await iterative_1.next(), !iterative_1_1.done;) {
            const value = iterative_1_1.value;
            values.push(value);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (iterative_1_1 && !iterative_1_1.done && (_a = iterative_1.return)) await _a.call(iterative_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return values;
};
exports.sequence = (...values) => {
    const promise = new Sequence();
    for (const value of values)
        promise.next(value);
    return promise;
};
