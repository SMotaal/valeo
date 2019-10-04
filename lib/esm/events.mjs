export const isEventSource = (target) => target &&
    typeof target === 'object' &&
    (typeof target.addEventListener === 'function' || typeof target.addListener === 'function');
