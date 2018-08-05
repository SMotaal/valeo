export const isEventSource = <T, K extends string>(
  target: EventSource<T, K> | any,
): target is EventSource<T, K> =>
  target &&
  typeof target === 'object' &&
  (typeof target.addEventListener === 'function' || typeof target.addListener === 'function');

// export const listen = <T, K extends string>(
//   target: EventSource<T, K>,
//   event: K,
//   listener: EventListener<T>,
//   options?: EventListenerOptions,
// ) => {
//   // TODO: Handle non-desctructurable taget
//   const {
//     addEventListener,
//     removeEventListener,
//     addListener,
//     removeListener,
//   } = target as EventTarget & NodeJS.EventEmitter;

//   const isTarget = typeof addEventListener === 'function';
//   const isEmitter = !isTarget && typeof addListener === 'function';
//   const isValid =
//     (isEmitter && typeof removeListener === 'function') ||
//     (isTarget && typeof removeEventListener === 'function');

//   if (!isEventSource(target)) {
//     throw ReferenceError(`Events.listen was called on an incompatible target`);
//   }
// };

// import {deferred, Deferred, noop, closed} from './helpers';

// export function events<T, K extends string>(
//   target: EventTarget & EventSource<T, K>,
//   event: K,
//   options?: EventListenerOptions,
// ): EventStream<T, K>;

// export function events<T, K extends string>(
//   target: NodeJS.EventEmitter & EventSource<T, K>,
//   event: K,
// ): EventStream<T, K>;

// export function events<T, K extends string>(
//   target: EventSource<T, K>,
//   event: K,
//   options?: EventListenerOptions,
// ) {
//   let done = false;
//   let promise: Deferred<T> = deferred<T>();
//   let events = new WeakMap<Deferred<T>, Deferred<T>>();

//   if (!isEventSource(target)) {
//     throw ReferenceError(`Event stream targets must either be EventTargets or EventEmitters`);
//   }

//   const handler = (event: T) => {
//     const currentPromise = promise;
//     const nextPromise = (promise = deferred<T>());
//     currentPromise.next = nextPromise;
//     events.set(currentPromise, nextPromise);
//     currentPromise.resolve(event);
//   };

//   let remove: () => void;

//   if ('addEventListener' in target) {
//     target.addEventListener(event, handler, {
//       ...options,
//       passive: options && options.passive === false ? false : true,
//     });
//     remove = () => target.removeEventListener(event, handler);
//   } else if ('addListener' in target) {
//     target.addListener(event, handler);
//     remove = () => target.removeListener(event, handler);
//   }

//   let close = () => {
//     remove && remove();
//     remove = close = noop;
//     events.delete(promise);
//     promise = events = undefined;
//   };

//   const iterator = () => {
//     let nextPromise = promise;

//     let next = async () => {
//       const currentPromise = nextPromise;
//       nextPromise =
//         currentPromise.next || (currentPromise.then(() => currentPromise.next) as Deferred<T>);
//       const value = done ? undefined : await currentPromise;
//       return {value, done}; // currentPromise.then(value => ({value, done}))
//     };

//     const iterator = {
//       next,
//       return: () => ((nextPromise = undefined), (iterator.return = iterator.next = closed))(),
//     };

//     return iterator;
//   };

//   const iterable: EventStream<T> = {
//     target,
//     event,
//     [Symbol.asyncIterator]: iterator,
//     close,
//   };

//   return iterable;
// }

/// CHECKS ///

// TEST: const closedStream = events(window, 'event').close();
// TEST: const windowEventIterator = events(window, 'event')[Symbol.asyncIterator]();
// TEST: const processEventIterator = events(process, 'event')[Symbol.asyncIterator]();

/// AMBIENT ///

export type EventListener<T> = (event: T) => any;

export type EventSource<T, K extends string = string> =
  | {
      addEventListener(event: K, listener: EventListener<T>, options?: EventListenerOptions);
      removeEventListener(event: K, listener: EventListener<T>);
    }
  | {
      addListener(event: K, listener: EventListener<T>);
      removeListener(event: K, listener: EventListener<T>);
    };

// export interface EventStream<T, K extends string = string> extends AsyncIterable<T> {
//   target: EventSource<T, K>;
//   event: K;
//   close(): void;
// }

declare global {
  interface EventListenerOptions {
    passive?: boolean;
  }
}
