# ws-masking

There are two variations, [wasm (simd)](#ws-masking-wasm) and [js (pure-js)](#ws-masking-js).

Currently a faster [js](#ws-masking-js) version is recommended.

## ws-masking (js)

A pure-js version implementation of [bufferutil](https://github.com/websockets/bufferutil).

### Usage (js)

```js
import wsm from "ws-masking";

// fast pure-js implementation.
wsm.mask(source, mask, output, offset, length);
wsm.unmask(buffer, mask);
```

## ws-masking (wasm)

A WebAssembly version implementation of [bufferutil](https://github.com/websockets/bufferutil).

If WebAssembly SIMD is supported, the SIMD version of the wasm build is automatically used.
Otherwise, the normal wasm build is used.

### Usage (wasm)

```js
import wsm from "ws-masking/wasm";
// No initialization required.
import wsmSync from "ws-masking/wasm-sync";

// Fall back to js until initialized.
await wsm.initialize();

// API exactly the same as `bufferutil`.
wsm.mask(source, mask, output, offset, length);
wsm.unmask(buffer, mask);
wsmSync.mask(source, mask, output, offset, length);
wsmSync.unmask(buffer, mask);
```

## Benchmarks

```text
benchmark                     time (avg)             (min … max)       p75       p99      p999
---------------------------------------------------------------- -----------------------------
• mask - 32b
---------------------------------------------------------------- -----------------------------
ws-masking - wasm (simd)   27.55 ns/iter     (24.37 ns … 198 ns)  26.61 ns  44.09 ns  79.74 ns
ws-masking - js            28.89 ns/iter     (25.93 ns … 127 ns)  28.71 ns  43.26 ns  59.13 ns
js                         14.95 ns/iter   (14.45 ns … 86.96 ns)  14.89 ns   16.5 ns  72.12 ns
bufferutil                 57.04 ns/iter      (52.1 ns … 122 ns)  58.74 ns  65.28 ns  95.26 ns

summary for mask - 32b
  js
   1.84x faster than ws-masking - wasm (simd)
   1.93x faster than ws-masking - js
   3.82x faster than bufferutil

• mask - 64b
---------------------------------------------------------------- -----------------------------
ws-masking - wasm (simd)   30.66 ns/iter   (27.39 ns … 92.09 ns)  30.47 ns  46.97 ns  67.92 ns
ws-masking - js            34.18 ns/iter   (30.96 ns … 95.85 ns)  34.18 ns  52.54 ns  73.68 ns
js                         36.79 ns/iter     (30.18 ns … 145 ns)  36.57 ns  48.83 ns    130 ns
bufferutil                 58.52 ns/iter     (53.37 ns … 128 ns)  59.47 ns  70.07 ns    111 ns

summary for mask - 64b
  ws-masking - wasm (simd)
   1.11x faster than ws-masking - js
   1.2x faster than js
   1.91x faster than bufferutil

• mask - 16Kib
---------------------------------------------------------------- -----------------------------
ws-masking - wasm (simd)   1'459 ns/iter   (1'446 ns … 1'546 ns)  1'467 ns  1'539 ns  1'546 ns
ws-masking - js            1'549 ns/iter   (1'499 ns … 1'662 ns)  1'575 ns  1'631 ns  1'662 ns
js                         8'552 ns/iter     (7'700 ns … 161 µs)  8'000 ns 30'800 ns 31'000 ns
bufferutil                 1'309 ns/iter     (915 ns … 1'496 ns)  1'379 ns  1'420 ns  1'496 ns

summary for mask - 16Kib
  bufferutil
   1.12x faster than ws-masking - wasm (simd)
   1.18x faster than ws-masking - js
   6.53x faster than js

• mask - 64Kib
---------------------------------------------------------------- -----------------------------
ws-masking - wasm (simd)   7'222 ns/iter   (7'180 ns … 7'317 ns)  7'235 ns  7'288 ns  7'317 ns
ws-masking - js            6'172 ns/iter   (6'128 ns … 6'535 ns)  6'178 ns  6'275 ns  6'535 ns
js                        43'539 ns/iter    (30'800 ns … 231 µs) 50'300 ns    124 µs    131 µs
bufferutil                 7'878 ns/iter   (6'673 ns … 8'962 ns)  8'865 ns  8'960 ns  8'962 ns

summary for mask - 64Kib
  ws-masking - js
   1.17x faster than ws-masking - wasm (simd)
   1.28x faster than bufferutil
   7.05x faster than js

• mask - 128Kib
---------------------------------------------------------------- -----------------------------
ws-masking - wasm (simd)  16'705 ns/iter    (16'400 ns … 183 µs) 16'600 ns 19'400 ns 57'200 ns
ws-masking - js           12'552 ns/iter    (12'200 ns … 221 µs) 12'500 ns 14'500 ns 46'100 ns
js                           120 µs/iter    (95'800 ns … 318 µs)    101 µs    248 µs    275 µs
bufferutil                16'604 ns/iter     (9'500 ns … 101 µs) 17'700 ns 18'800 ns 28'700 ns

summary for mask - 128Kib
  ws-masking - js
   1.32x faster than bufferutil
   1.33x faster than ws-masking - wasm (simd)
   9.55x faster than js

• mask - 256Kib
---------------------------------------------------------------- -----------------------------
ws-masking - wasm (simd)  30'971 ns/iter    (30'700 ns … 158 µs) 30'800 ns 32'300 ns 78'900 ns
ws-masking - js           24'751 ns/iter    (24'200 ns … 169 µs) 24'600 ns 28'700 ns 64'200 ns
js                           199 µs/iter       (192 µs … 309 µs)    201 µs    222 µs    271 µs
bufferutil                29'543 ns/iter    (26'300 ns … 113 µs) 28'400 ns 35'300 ns 59'100 ns

summary for mask - 256Kib
  ws-masking - js
   1.19x faster than bufferutil
   1.25x faster than ws-masking - wasm (simd)
   8.05x faster than js

• mask - 1MiB
---------------------------------------------------------------- -----------------------------
ws-masking - wasm (simd)     131 µs/iter       (130 µs … 279 µs)    131 µs    139 µs    194 µs
ws-masking - js              114 µs/iter       (111 µs … 242 µs)    113 µs    131 µs    197 µs
bufferutil                   100 µs/iter    (80'900 ns … 203 µs)    120 µs    126 µs    183 µs

summary for mask - 1MiB
  bufferutil
   1.13x faster than ws-masking - js
   1.31x faster than ws-masking - wasm (simd)

• mask - 16Mib
---------------------------------------------------------------- -----------------------------
ws-masking - wasm (simd)   2'374 µs/iter   (2'327 µs … 2'659 µs)  2'383 µs  2'616 µs  2'659 µs
ws-masking - js            2'299 µs/iter   (2'244 µs … 2'623 µs)  2'301 µs  2'597 µs  2'623 µs
bufferutil                 1'552 µs/iter   (1'514 µs … 1'824 µs)  1'562 µs  1'727 µs  1'824 µs

summary for mask - 16Mib
  bufferutil
   1.48x faster than ws-masking - js
   1.53x faster than ws-masking - wasm (simd)

• mask - 32Mib
---------------------------------------------------------------- -----------------------------
ws-masking - wasm (simd)   5'414 µs/iter   (5'314 µs … 5'746 µs)  5'459 µs  5'687 µs  5'746 µs
ws-masking - js            5'297 µs/iter   (5'237 µs … 5'547 µs)  5'326 µs  5'537 µs  5'547 µs
bufferutil                 3'379 µs/iter   (3'274 µs … 4'261 µs)  3'396 µs  4'123 µs  4'261 µs

summary for mask - 32Mib
  bufferutil
   1.57x faster than ws-masking - js
   1.6x faster than ws-masking - wasm (simd)

• mask - 64Mib
---------------------------------------------------------------- -----------------------------
ws-masking - wasm (simd)  11'257 µs/iter (11'175 µs … 11'450 µs) 11'301 µs 11'450 µs 11'450 µs
ws-masking - js           11'125 µs/iter (11'008 µs … 11'417 µs) 11'169 µs 11'417 µs 11'417 µs
bufferutil                 7'138 µs/iter   (6'784 µs … 8'799 µs)  7'252 µs  8'799 µs  8'799 µs

summary for mask - 64Mib
  bufferutil
   1.56x faster than ws-masking - js
   1.58x faster than ws-masking - wasm (simd)

• mask - 128Mib
---------------------------------------------------------------- -----------------------------
ws-masking - wasm (simd)  24'853 µs/iter (23'714 µs … 25'945 µs) 25'179 µs 25'945 µs 25'945 µs
ws-masking - js           22'561 µs/iter (22'460 µs … 22'711 µs) 22'619 µs 22'711 µs 22'711 µs
bufferutil                14'188 µs/iter (13'757 µs … 18'630 µs) 14'059 µs 18'630 µs 18'630 µs

summary for mask - 128Mib
  bufferutil
   1.59x faster than ws-masking - js
   1.75x faster than ws-masking - wasm (simd)
```

## Contribution guidelines

If you want to contribute to this project, be sure to review the [contribution guidelines](CONTRIBUTING.md).
This project adheres to the Contributor Covenant [code of conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.
