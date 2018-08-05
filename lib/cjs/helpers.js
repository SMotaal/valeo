"use strict";
/// Symbol Helpers ///
Object.defineProperty(exports, "__esModule", { value: true });
const mappings = new Map();
exports.describe = (symbol) => symbol && `${mappings.get(symbol)}`;
function UniqueSymbol(description, symbol = mappings.get(description)) {
    if (!symbol) {
        mappings.set(description, (symbol = Symbol(description)));
        mappings.set(symbol, description);
    }
    return symbol;
}
exports.UniqueSymbol = UniqueSymbol;
for (const k in Symbol)
    typeof Symbol[k] === 'symbol' && UniqueSymbol(k, Symbol[k]);
/// Logging Helpers ///
exports.formatObject = (object) => {
    let keys = Object.keys(object);
    for (let i = 0, n = keys.length; n--;) {
        const k = keys[i];
        if (typeof k === 'symbol')
            keys[i] = exports.formatSymbol(k);
        else if (/[^\w\.]/.test(k))
            keys[i] = `"${k}"`;
    }
    return `{ ${keys.join(', ')} }`;
};
exports.formatSymbol = (symbol) => typeof symbol === 'symbol'
    ? `Symbol(${exports.describe(symbol) || Symbol.keyFor(symbol) || ''})`
    : undefined;
exports.formatValue = (value) => value === null
    ? 'null'
    : typeof value === 'object'
        ? exports.formatObject(value)
        : typeof value === 'symbol'
            ? exports.formatSymbol(value)
            : JSON.stringify(value);
/// Iterator Helpers ///
exports.closedResult = Object.freeze({ done: true, value: undefined });
exports.closed = async () => exports.closedResult;
/// Sync Helpers ///
exports.noop = () => { };
exports.passthru = a => a;
exports.fail = reason => {
    throw Error(reason);
};
exports.failWith = reason => () => exports.fail(reason);
exports.each = (ƒ, ...values) => {
    if (values.length === 0)
        return exports.each.bind(null, ƒ);
    for (const value of values)
        ƒ(value);
};
exports.bind = Function.call.bind(Function.bind);
exports.call = exports.bind(Function.call);
exports.up = v => (0 + v || 0) + 1;
exports.down = v => (0 + v || 0) - 1;
/// Async Helpers ///
exports.delay = ms => new Promise(resolve => setTimeout(resolve, (ms > 0 && ms) || 0));
exports.cap = (promise, ms = 100, reason = `cutoff (${(ms > 0 && `${ms}ms`) || 0})`) => Promise.race([exports.delay(ms).then(exports.failWith(reason)), promise]);
exports.sync = any => (any && (any.catch && (any = any.catch(exports.passthru))), any);
exports.async = any => (any && (any.then && (any = any.then(exports.passthru))), exports.sync(any));
/// Promise Helpers ///
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
