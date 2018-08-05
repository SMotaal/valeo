"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const helpers_1 = require("./helpers");
const index_1 = require("./index");
/// ASPECTS ///
const aspects = { Deferred: index_1.Deferred, Sequence: index_1.Sequence, Stream: index_1.Stream };
const aspect = (name, ...tests) => (aspects[name] ? test(name, ...tests) : helpers_1.noop);
/// VALUES ///
const value = [];
const $123 = [1, 2, 3];
const resolved = Promise.resolve(value);
const rejected = Promise.reject(value);
helpers_1.async(rejected); // Avoid unhandled rejection exception
/// TESTS ///
const tests = [];
const times = (n, v) => Array(n).fill(v);
const test = helpers_1.bind(tests.push, tests);
let sequence, stream;
//#region [A] Promises > Deferred
aspect('Deferred', $ => new index_1.Deferred() instanceof Promise, $ => index_1.resolve(new index_1.Deferred(), value), $ => index_1.reject(new index_1.Deferred(), value).catch(helpers_1.async));
//#endregion Promises > Deferred
//#region [B] Promises > Sequence
aspect('Sequence', $ => new index_1.Sequence() instanceof Promise, $ => helpers_1.async(index_1.resolve(new index_1.Sequence(), value)), $ => helpers_1.async(index_1.resolve(new index_1.Sequence({ done: true }), value)), $ => helpers_1.async(new index_1.Sequence().next(value)), $ => helpers_1.async(index_1.Sequence.from().next(value)), $ => helpers_1.async(index_1.Sequence.from(...$123).return()), $ => helpers_1.async((sequence = index_1.Sequence.from(...$123))), ...times(4, $ => helpers_1.async(helpers_1.cap(sequence.next()))), $ => helpers_1.async(sequence.return()), $ => helpers_1.async(helpers_1.cap(Promise.all(index_1.Peekable.from(...$123).peek(3)))), $ => helpers_1.async(helpers_1.cap(Promise.all(index_1.Peekable.from(...$123).peek(4)))), $ => helpers_1.async(helpers_1.cap(Promise.all((sequence = index_1.Peekable.from(...$123)).peek(3)))), ...times(4, $ => helpers_1.async(helpers_1.cap(sequence.next()))), $ => helpers_1.async(sequence.return( /* b */)), $ => helpers_1.async(helpers_1.cap(tics(100, 5), 1000)));
//#endregion Promises > Sequence
//#region [C] Streams > Stream
aspect('Stream', $ => new index_1.Stream(), $ => helpers_1.sync(helpers_1.cap(new index_1.Stream()(1), 100)), $ => helpers_1.sync(helpers_1.cap(new index_1.Stream()(1)(), 100)), $ => helpers_1.sync(helpers_1.cap(new index_1.Stream()(1).next(), 100)), $ => helpers_1.sync(helpers_1.cap((stream = new index_1.Stream())(1)(2), 100)), ...times(2, $ => helpers_1.sync(helpers_1.cap(stream.next(), 100))), $ => helpers_1.sync(helpers_1.cap(stream(1)(), 100)), $ => helpers_1.sync(helpers_1.cap((stream = index_1.Stream.from(...$123)), 100)), ...times(4, $ => helpers_1.sync(helpers_1.cap(stream.next(), 100))));
//#endregion Streams > Stream
/// RUN ///
(async () => {
    const queue = tests;
    const length = queue.length;
    if (!length)
        return;
    const logs = [];
    let failed = 0;
    const PASS = chalk_1.default.greenBright.bold(`\u2713`.normalize());
    const FAIL = chalk_1.default.red.bold(`\u2715 `.normalize());
    const { log, group, groupEnd } = console;
    group('Running %d tests', length);
    try {
        for (const test of queue) {
            if (typeof test === 'string') {
                logs.push(test);
                continue;
            }
            try {
                const result = await test();
                const error = result &&
                    result instanceof Error &&
                    result.message &&
                    chalk_1.default.redBright.bold(result.message);
                const pass = result !== false; // !error &&
                logs.push(pass
                    ? [`%s %s => %${error ? 's' : 'O'}`, PASS, test, error || result]
                    : ['%s %s => %o', FAIL, test, result]);
                pass || failed++;
            }
            catch (exception) {
                failed++;
                logs.push(['%s %s => %O', FAIL, test, exception]);
                process.exitCode = 1;
            }
        }
        group('Results', length);
        let grouping;
        try {
            for (const args of logs) {
                if (typeof args === 'string') {
                    grouping && groupEnd();
                    (grouping = args) && group(grouping);
                }
                else if (args.length) {
                    log(...args);
                }
            }
        }
        finally {
            groupEnd();
        }
    }
    finally {
        groupEnd();
    }
    return;
})();
/// Factories ///
async function tics(interval = 100, steps = 5) {
    const length = steps;
    const timeout = interval * (steps + 1);
    if (timeout > 0) {
        const promise = index_1.Peekable.from();
        return new Promise(resolve => {
            const handle = setInterval(() => promise.next(interval * --steps), interval);
            setTimeout(() => {
                clearInterval(handle);
                promise.return();
                resolve(Promise.all(promise.peek(length)));
            }, timeout);
        });
    }
    return Promise.resolve([]);
}
