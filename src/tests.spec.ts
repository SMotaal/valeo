import chalk from 'chalk';
import {async, sync, cap, noop, bind} from './helpers';
import {Deferred, Sequence, Peekable, resolve, reject, Stream} from './index';

/// ASPECTS ///

const aspects: any = {Deferred, Sequence, Stream};
const aspect = (name, ...tests) => (aspects[name] ? test(name, ...tests) : noop);

/// VALUES ///

const value = [];
const $123 = [1, 2, 3];
const resolved = Promise.resolve(value);
const rejected = Promise.reject(value);
async(rejected); // Avoid unhandled rejection exception

/// TESTS ///
const tests: any = <any[]>[];
const times = (n, v) => Array(n).fill(v);
const test = bind(tests.push, tests);

let sequence, stream;

//#region [A] Promises > Deferred
aspect(
  'Deferred',
  $ => new Deferred() instanceof Promise,
  $ => resolve(new Deferred(), value),
  $ => reject(new Deferred(), value).catch(async),
);
//#endregion Promises > Deferred

//#region [B] Promises > Sequence
aspect(
  'Sequence',
  $ => new Sequence() instanceof Promise,
  $ => async(resolve(new Sequence(), value)),
  $ => async(resolve(new Sequence({done: true}), value)),
  $ => async(new Sequence().next(value)),
  $ => async(Sequence.from().next(value)),
  $ => async(Sequence.from(...$123).return()),
  $ => async((sequence = Sequence.from(...$123))),
  ...times(4, $ => async(cap(sequence.next()))),
  $ => async(sequence.return()),
  $ => async(cap(Promise.all(Peekable.from(...$123).peek(3)))),
  $ => async(cap(Promise.all(Peekable.from(...$123).peek(4)))),
  $ => async(cap(Promise.all((sequence = Peekable.from(...$123)).peek(3)))),
  ...times(4, $ => async(cap(sequence.next()))),
  $ => async(sequence.return(/* b */)),
  $ => async(cap(tics(100, 5), 1000)),
);
//#endregion Promises > Sequence

//#region [C] Streams > Stream
aspect(
  'Stream',
  $ => new Stream(),
  $ => sync(cap(new Stream()(1), 100)),
  $ => sync(cap(new Stream()(1)(), 100)),
  $ => sync(cap(new Stream()(1).next(), 100)),
  $ => sync(cap((stream = new Stream())(1)(2), 100)),
  ...times(2, $ => sync(cap(stream.next(), 100))),
  $ => sync(cap(stream(1)(), 100)),
  $ => sync(cap((stream = Stream.from(...$123)), 100)),
  ...times(4, $ => sync(cap(stream.next(), 100))),
);
//#endregion Streams > Stream

/// RUN ///

(async () => {
  const queue = tests;
  const length = queue.length;
  if (!length) return;
  const logs = [];
  let failed = 0;
  const PASS = chalk.greenBright.bold(`\u2713`.normalize());
  const FAIL = chalk.red.bold(`\u2715 `.normalize());
  const {log, group, groupEnd} = console;

  group('Running %d tests', length);
  try {
    for (const test of queue) {
      if (typeof test === 'string') {
        logs.push(test);
        continue;
      }
      try {
        const result = await test();
        const error =
          result &&
          result instanceof Error &&
          result.message &&
          chalk.redBright.bold(result.message);
        const pass = result !== false; // !error &&
        logs.push(
          pass
            ? [`%s %s => %${error ? 's' : 'O'}`, PASS, test, error || result]
            : ['%s %s => %o', FAIL, test, result],
        );
        pass || failed++;
      } catch (exception) {
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
        } else if (args.length) {
          log(...args);
        }
      }
    } finally {
      groupEnd();
    }
  } finally {
    groupEnd();
  }

  return;
})();

/// Factories ///

async function tics(interval = 100, steps = 5) {
  const length = steps;
  const timeout = interval * (steps + 1);
  if (timeout > 0) {
    const promise = Peekable.from();
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
