"use strict";
/// API ///
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./promises"));
__export(require("./streams"));
//* SEE: Meiosis
//*   Meiosis: https://meiosis.js.org/
//*   Examples: https://github.com/foxdonut/meiosis-examples
//* SEE: Async Generators
//*   Events: https://gist.github.com/nybblr/3af62797052c42f7090b4f8614b5e157
