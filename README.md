# ws-masking

A WebAssembly version implementation of [bufferutil](https://github.com/websockets/bufferutil).

If WebAssembly SIMD is supported, the SIMD version of the wasm build is automatically used.
Otherwise, the normal wasm build is used. In the worst case, fall back to pure-js.

## Usage

```js
import wsm from "ws-masking";

// Fall back to js until initialized.
await wsm.initialize();

// API exactly the same as `bufferutil`.
wsm.mask(source, mask, output, offset, length);
wsm.unmask(buffer, mask);

// fast pure-js implementation.
wsm.js.mask(source, mask, output, offset, length);
wsm.js.unmask(buffer, mask);
```

## Contribution guidelines

If you want to contribute to this project, be sure to review the [contribution guidelines](CONTRIBUTING.md).
This project adheres to the Contributor Covenant [code of conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.
