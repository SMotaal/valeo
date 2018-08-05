"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("./promises");
const { setPrototypeOf, defineProperty } = Object;
exports.append = (stream, ...values) => {
    for (const value of values)
        stream.next(value);
};
exports.unwrap = async (result) => {
    return (result = await result).value || result;
};
class Stream {
    constructor() {
        const constructor = this.constructor[Symbol.species] || new.target || Stream;
        const mappers = new Set();
        let sequence = (this.sequence = new promises_1.Sequence());
        const iteration = sequence.iteration;
        const stream = value => {
            if (value === undefined) {
                const result = sequence = sequence.next();
                return exports.unwrap(result);
            }
            else {
                sequence.next(value);
                if (mappers.size)
                    for (const mapper of mappers)
                        mapper(value);
                return stream;
            }
        };
        const map = mapper => {
            const stream = new constructor();
            mappers.add(value => stream(mapper(value)));
            return stream;
        };
        const next = value => {
            if (value === undefined) {
                return sequence.next();
            }
            else {
                sequence.next(value);
                return stream;
            }
        };
        stream['map'] = map;
        stream['next'] = next;
        return setPrototypeOf(stream, this);
    }
    static from() {
        const species = this && (this[Symbol.species] || this) || Stream;
        const stream = new species();
        if (arguments.length) {
            const source = arguments.length === 1 && arguments[0] instanceof Stream && arguments[0];
            if (source) {
                if (!source.map || typeof source.map !== 'function')
                    throw TypeError(`Stream.from was called with an incompatible source (<source>.map is not a function)`);
                source.map(stream);
            }
            else {
                exports.append(stream, ...arguments);
            }
        }
        return stream;
    }
    [Symbol.asyncIterator]() { return this; }
}
exports.Stream = Stream;
exports.stream = Stream.from;
