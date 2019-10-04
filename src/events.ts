export const isEventSource = <T, K extends string>(
  target: EventSource<T, K> | any,
): target is EventSource<T, K> =>
  target &&
  typeof target === 'object' &&
  (typeof target.addEventListener === 'function' || typeof target.addListener === 'function');

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

declare global {
  interface EventListenerOptions {
    passive?: boolean;
  }
}
