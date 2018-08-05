# Valeō _alpha_
<sub>[Pronounciation](https://en.wiktionary.org/wiki/valeo)

Experimental bare-bones reactive programming using standard ES syntax.

## Goals

The following code should be possible. The take from the code is not that this code is great, but that it becomes conceivable to achieve complete asynchronous serialization with standard ECMAScript syntax.

```js
import {Events} from './valeo/index.mjs';

(async resized => {
  for await (const event of resized) {
    // ... do stuff
  }
})(Events.from(window, 'resize'));
```


