/// Symbol Helpers ///
const mappings = new Map();
export const describe = (symbol) => symbol && `${mappings.get(symbol)}`;
export function UniqueSymbol(description, symbol = mappings.get(description)) {
    if (!symbol) {
        mappings.set(description, (symbol = Symbol(description)));
        mappings.set(symbol, description);
    }
    return symbol;
}
for (const k in Symbol)
    typeof Symbol[k] === 'symbol' && UniqueSymbol(k, Symbol[k]);
/// Logging Helpers ///
export const formatObject = (object) => {
    let keys = Object.keys(object);
    for (let i = 0, n = keys.length; n--;) {
        const k = keys[i];
        if (typeof k === 'symbol')
            keys[i] = formatSymbol(k);
        else if (/[^\w\.]/.test(k))
            keys[i] = `"${k}"`;
    }
    return `{ ${keys.join(', ')} }`;
};
export const formatSymbol = (symbol) => typeof symbol === 'symbol'
    ? `Symbol(${describe(symbol) || Symbol.keyFor(symbol) || ''})`
    : undefined;
export const formatValue = (value) => value === null
    ? 'null'
    : typeof value === 'object'
        ? formatObject(value)
        : typeof value === 'symbol'
            ? formatSymbol(value)
            : JSON.stringify(value);
/// Iterator Helpers ///
export const closedResult = Object.freeze({ done: true, value: undefined });
export const closed = async () => closedResult;
/// Sync Helpers ///
export const noop = () => { };
export const passthru = a => a;
export const fail = reason => {
    throw Error(reason);
};
export const failWith = reason => () => fail(reason);
export const each = (ƒ, ...values) => {
    if (values.length === 0)
        return each.bind(null, ƒ);
    for (const value of values)
        ƒ(value);
};
export const bind = Function.call.bind(Function.bind);
export const call = bind(Function.call);
export const up = v => (0 + v || 0) + 1;
export const down = v => (0 + v || 0) - 1;
/// Async Helpers ///
export const delay = ms => new Promise(resolve => setTimeout(resolve, (ms > 0 && ms) || 0));
export const cap = (promise, ms = 100, reason = `cutoff (${(ms > 0 && `${ms}ms`) || 0})`) => Promise.race([delay(ms).then(failWith(reason)), promise]);
export const sync = any => (any && (any.catch && (any = any.catch(passthru))), any);
export const async = any => (any && (any.then && (any = any.then(passthru))), sync(any));
/// Promise Helpers ///
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
