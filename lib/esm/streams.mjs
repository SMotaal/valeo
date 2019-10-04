import { Sequence } from './promises.mjs';
const { setPrototypeOf, defineProperty } = Object;
export const append = (stream, ...values) => {
    for (const value of values)
        stream.next(value);
};
export const unwrap = async (result) => {
    return (result = await result).value || result;
};
export class Stream {
    constructor() {
        const constructor = this.constructor[Symbol.species] || new.target || Stream;
        const mappers = new Set();
        let sequence = (this.sequence = new Sequence());
        const iteration = sequence.iteration;
        const stream = value => {
            if (value === undefined) {
                const result = sequence = sequence.next();
                return unwrap(result);
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
                append(stream, ...arguments);
            }
        }
        return stream;
    }
    [Symbol.asyncIterator]() { return this; }
}
export const stream = Stream.from;
