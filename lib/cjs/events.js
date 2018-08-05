"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEventSource = (target) => target &&
    typeof target === 'object' &&
    (typeof target.addEventListener === 'function' || typeof target.addListener === 'function');
