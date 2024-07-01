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
ws-masking - wasm (simd)   83.47 ns/iter     (67.58 ns … 616 ns)  83.94 ns    198 ns    377 ns
ws-masking - js            84.96 ns/iter     (67.97 ns … 445 ns)  83.84 ns    207 ns    390 ns
js                         56.77 ns/iter     (48.68 ns … 357 ns)  55.42 ns    104 ns    303 ns
bufferutil                   135 ns/iter       (115 ns … 463 ns)    132 ns    298 ns    455 ns

summary for mask - 32b
  js
   1.47x faster than ws-masking - wasm (simd)
   1.5x faster than ws-masking - js
   2.38x faster than bufferutil

• mask - 64b
---------------------------------------------------------------- -----------------------------
ws-masking - wasm (simd)   95.92 ns/iter     (79.98 ns … 886 ns)  99.07 ns    202 ns    375 ns
ws-masking - js            93.98 ns/iter     (78.86 ns … 412 ns)  95.02 ns    193 ns    291 ns
js                           110 ns/iter     (97.31 ns … 588 ns)    104 ns    200 ns    496 ns
bufferutil                   140 ns/iter       (116 ns … 836 ns)    142 ns    301 ns    520 ns

summary for mask - 64b
  ws-masking - js
   1.02x faster than ws-masking - wasm (simd)
   1.17x faster than js
   1.49x faster than bufferutil

• mask - 16Kib
---------------------------------------------------------------- -----------------------------
ws-masking - wasm (simd)   4'671 ns/iter   (4'375 ns … 6'985 ns)  4'616 ns  6'498 ns  6'985 ns
ws-masking - js            4'160 ns/iter   (3'896 ns … 5'815 ns)  4'053 ns  5'801 ns  5'815 ns
js                        36'225 ns/iter    (24'300 ns … 336 µs) 33'200 ns    110 µs    147 µs
bufferutil                 4'839 ns/iter  (4'333 ns … 17'114 ns)  4'781 ns 10'518 ns 17'114 ns

summary for mask - 16Kib
  ws-masking - js
   1.12x faster than ws-masking - wasm (simd)
   1.16x faster than bufferutil
   8.71x faster than js

• mask - 64Kib
---------------------------------------------------------------- -----------------------------
ws-masking - wasm (simd)  19'944 ns/iter  (16'900 ns … 7'517 µs) 17'600 ns 30'900 ns    215 µs
ws-masking - js           16'299 ns/iter    (14'400 ns … 519 µs) 16'500 ns 32'900 ns 81'500 ns
js                           137 µs/iter       (116 µs … 465 µs)    132 µs    424 µs    436 µs
bufferutil                17'715 ns/iter    (14'900 ns … 296 µs) 17'500 ns 30'100 ns 57'200 ns

summary for mask - 64Kib
  ws-masking - js
   1.09x faster than bufferutil
   1.22x faster than ws-masking - wasm (simd)
   8.38x faster than js

• mask - 128Kib
---------------------------------------------------------------- -----------------------------
ws-masking - wasm (simd)  37'817 ns/iter    (33'200 ns … 327 µs) 37'200 ns 61'500 ns    168 µs
ws-masking - js           31'631 ns/iter    (26'900 ns … 348 µs) 30'600 ns 60'300 ns    148 µs
js                           270 µs/iter       (239 µs … 911 µs)    255 µs    578 µs    771 µs
bufferutil                36'545 ns/iter    (30'300 ns … 305 µs) 37'400 ns 57'500 ns    103 µs

summary for mask - 128Kib
  ws-masking - js
   1.16x faster than bufferutil
   1.2x faster than ws-masking - wasm (simd)
   8.54x faster than js

• mask - 256Kib
---------------------------------------------------------------- -----------------------------
ws-masking - wasm (simd)  79'156 ns/iter    (67'500 ns … 425 µs) 76'900 ns    131 µs    287 µs
ws-masking - js           62'776 ns/iter    (54'200 ns … 552 µs) 59'700 ns    114 µs    223 µs
js                           523 µs/iter       (484 µs … 980 µs)    509 µs    689 µs    965 µs
bufferutil                72'817 ns/iter    (63'400 ns … 484 µs) 70'900 ns    119 µs    206 µs

summary for mask - 256Kib
  ws-masking - js
   1.16x faster than bufferutil
   1.26x faster than ws-masking - wasm (simd)
   8.33x faster than js

• mask - 1MiB
---------------------------------------------------------------- -----------------------------
ws-masking - wasm (simd)     311 µs/iter       (274 µs … 753 µs)    311 µs    501 µs    716 µs
ws-masking - js              250 µs/iter       (216 µs … 935 µs)    239 µs    461 µs    721 µs
bufferutil                   287 µs/iter       (246 µs … 993 µs)    280 µs    465 µs    840 µs

summary for mask - 1MiB
  ws-masking - js
   1.15x faster than bufferutil
   1.25x faster than ws-masking - wasm (simd)

• mask - 16Mib
---------------------------------------------------------------- -----------------------------
ws-masking - wasm (simd)   6'319 µs/iter   (6'159 µs … 7'452 µs)  6'304 µs  7'452 µs  7'452 µs
ws-masking - js            5'326 µs/iter   (5'115 µs … 6'519 µs)  5'304 µs  6'462 µs  6'519 µs
bufferutil                 4'765 µs/iter   (4'677 µs … 5'472 µs)  4'802 µs  5'253 µs  5'472 µs

summary for mask - 16Mib
  bufferutil
   1.12x faster than ws-masking - js
   1.33x faster than ws-masking - wasm (simd)

• mask - 32Mib
---------------------------------------------------------------- -----------------------------
ws-masking - wasm (simd)  12'490 µs/iter (12'359 µs … 12'965 µs) 12'507 µs 12'965 µs 12'965 µs
ws-masking - js           11'063 µs/iter (10'277 µs … 13'773 µs) 11'429 µs 13'773 µs 13'773 µs
bufferutil                 9'760 µs/iter  (9'381 µs … 11'750 µs)  9'732 µs 11'750 µs 11'750 µs

summary for mask - 32Mib
  bufferutil
   1.13x faster than ws-masking - js
   1.28x faster than ws-masking - wasm (simd)

• mask - 64Mib
---------------------------------------------------------------- -----------------------------
ws-masking - wasm (simd)  25'118 µs/iter (24'819 µs … 27'890 µs) 25'120 µs 27'890 µs 27'890 µs
ws-masking - js           21'100 µs/iter (20'509 µs … 26'823 µs) 20'800 µs 26'823 µs 26'823 µs
bufferutil                19'148 µs/iter (18'942 µs … 20'442 µs) 19'113 µs 20'442 µs 20'442 µs

summary for mask - 64Mib
  bufferutil
   1.1x faster than ws-masking - js
   1.31x faster than ws-masking - wasm (simd)

• mask - 128Mib
---------------------------------------------------------------- -----------------------------
ws-masking - wasm (simd)  50'722 µs/iter (49'880 µs … 53'383 µs) 50'786 µs 53'383 µs 53'383 µs
ws-masking - js           41'513 µs/iter (41'151 µs … 42'820 µs) 41'402 µs 42'820 µs 42'820 µs
bufferutil                38'449 µs/iter (38'092 µs … 39'765 µs) 38'596 µs 39'765 µs 39'765 µs

summary for mask - 128Mib
  bufferutil
   1.08x faster than ws-masking - js
   1.32x faster than ws-masking - wasm (simd)
```

## Contribution guidelines

If you want to contribute to this project, be sure to review the [contribution guidelines](CONTRIBUTING.md).
This project adheres to the Contributor Covenant [code of conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.
