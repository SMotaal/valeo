#!/usr/bin/env node --experimental-modules  --loader loadout --no-warnings --harmony-class-fields

import {meta} from '@draftout/common/modules';
import {format} from '@draftout/common/console';
import Package from '../package.json';

meta(import.meta);

const packageName = Package.name;

export const resolve = specifier => import.meta.resolve(specifier).pathname;
export const [bin, main, command, ...args] = process.argv;
export const aliases = {init: 'initialize', gen: 'generate'};

export async function execute(command, args) {
  let alias = command;

  command = aliases[command] || command;

  const exec = {command, args};

  command === alias || (exec.alias = alias);

  try {
    exec.specifier = `./${command
      .replace(/^:/, '../')
      .replace(/:/g, '/')}.mjs`;
    exec.import = import(exec.specifier);
    exec.executor = (exec.namespace = await exec.import).default;
    exec.executed = await Reflect.apply(exec.executor, null, args);
    // throw new Error('No Error');
  } catch (exception) {
    exception.stack;
    exec.exception = exception;
  }
  return exec;
}

if ('object' === typeof process && process.argv) {
  const url = import.meta.url;
  const specifier = url.slice(7);
  const executable = `/.bin/${packageName}`;

  // Assuming it is always absolute
  const main = `${process.argv[1] || ''}`;

  if (main.includes(specifier) || main.includes(executable)) {
    execute(command, args).then(
      ({ exception, ...exec } = {}) =>
        exception
          ? (console.group('\n \u{274C}  %O\n', exception),
            Object.entries(exec).map(([k, v]) =>
              console.log(`    - ${`${`${k}`.slice(0, 9)}:`.padEnd(10)} %O`, v),
            ),
            console.groupEnd())
          : console.log('\n \u{1F3C1}  %s %s\n', command, args.join(' ')),
    );

  }

  // console.log(process.argv)
  // const Prefix = /^.*?(?=\/[^/]+\/[^/]+)$/;
  // import.meta.url.replace(Prefix, '');
}


if (import.meta.url.includes(main) && command) {
}
