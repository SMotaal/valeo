export declare const isEventSource: <T, K extends string>(target: any) => target is EventSource<T, K>;
export declare type EventListener<T> = (event: T) => any;
export declare type EventSource<T, K extends string = string> = {
    addEventListener(event: K, listener: EventListener<T>, options?: EventListenerOptions): any;
    removeEventListener(event: K, listener: EventListener<T>): any;
} | {
    addListener(event: K, listener: EventListener<T>): any;
    removeListener(event: K, listener: EventListener<T>): any;
};
declare global {
    interface EventListenerOptions {
        passive?: boolean;
    }
}
