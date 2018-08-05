import { dirns } from '@draftout/common/console';
import { readdirSync, renameSync } from 'fs';
import { resolve } from 'path';
// const { log, warn, group, groupEnd } = console;

const rename = (dirname, matcher, replacer) => {
  // TODO: Traverse nested directories
  for (const name of readdirSync(dirname)) {
    let renamed = name.replace(matcher, replacer);
    if (renamed && name !== renamed) {
      renameSync(resolve(dirname, name), resolve(dirname, renamed));
    }
  }
}

export default (...args) => {
  // const options = new Options(args, { m: 'mongoose', });

  const base = import.meta.url.replace(/^file:\/\/(.*)\/scripts\/[^/]+(?:[?#].*|)$/, '$1/lib/esm');

  console.log(base);
  rename(base, /\.js$/, '.mjs');
  // for (const entry of readdirSync())

};
