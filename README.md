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

### Running on Current

```text
cpu: AMD Ryzen 7 8845HS w/ Radeon 780M Graphics
runtime: node v24.0.2 (x64-win32)

benchmark            time (avg)             (min … max)       p75       p99      p999
------------------------------------------------------- -----------------------------
• mask - 4b
------------------------------------------------------- -----------------------------
wsm - wasm-simd   40.92 ns/iter     (36.08 ns … 433 ns)   37.6 ns    105 ns    275 ns
wsm - zero-pool   46.38 ns/iter     (43.65 ns … 483 ns)  44.48 ns  98.63 ns    250 ns
wsm - js          41.81 ns/iter      (39.4 ns … 897 ns)  40.77 ns  89.75 ns    178 ns
js - simple       21.07 ns/iter     (20.56 ns … 131 ns)  20.75 ns  31.69 ns  65.58 ns
js                20.95 ns/iter     (20.12 ns … 436 ns)  20.41 ns  34.72 ns  78.76 ns
bufferutil        79.46 ns/iter     (76.81 ns … 512 ns)  78.37 ns    115 ns    225 ns

summary for mask - 4b
  js
   1.01x faster than js - simple
   1.95x faster than wsm - wasm-simd
   2x faster than wsm - js
   2.21x faster than wsm - zero-pool
   3.79x faster than bufferutil

• mask - 32b
------------------------------------------------------- -----------------------------
wsm - wasm-simd   42.96 ns/iter     (41.06 ns … 329 ns)  41.89 ns  78.03 ns    180 ns
wsm - zero-pool   47.36 ns/iter     (45.51 ns … 367 ns)  46.19 ns   91.6 ns    174 ns
wsm - js          93.19 ns/iter       (0 ps … 3'039 µs)    100 ns    200 ns    900 ns
js - simple       41.58 ns/iter     (40.09 ns … 274 ns)  40.14 ns  74.27 ns    153 ns
js                35.94 ns/iter     (33.84 ns … 476 ns)  34.42 ns  63.82 ns    150 ns
bufferutil         80.5 ns/iter     (75.59 ns … 614 ns)  77.69 ns    142 ns    232 ns

summary for mask - 32b
  js
   1.16x faster than js - simple
   1.2x faster than wsm - wasm-simd
   1.32x faster than wsm - zero-pool
   2.24x faster than bufferutil
   2.59x faster than wsm - js

• mask - 64b
------------------------------------------------------- -----------------------------
wsm - wasm-simd    47.5 ns/iter     (44.04 ns … 490 ns)  44.87 ns  89.11 ns    187 ns
wsm - zero-pool   53.25 ns/iter     (49.85 ns … 513 ns)  50.68 ns    113 ns    215 ns
wsm - js          49.96 ns/iter   (45.56 ns … 1'049 ns)  46.58 ns    100 ns    247 ns
js - simple       81.25 ns/iter   (77.93 ns … 2'148 ns)  78.22 ns    135 ns    332 ns
js                53.71 ns/iter     (50.78 ns … 953 ns)  51.37 ns    101 ns    204 ns
bufferutil        84.95 ns/iter      (79.3 ns … 596 ns)  80.81 ns    151 ns    271 ns

summary for mask - 64b
  wsm - wasm-simd
   1.05x faster than wsm - js
   1.12x faster than wsm - zero-pool
   1.13x faster than js
   1.71x faster than js - simple
   1.79x faster than bufferutil

• mask - 16Kib
------------------------------------------------------- -----------------------------
wsm - wasm-simd     823 ns/iter     (793 ns … 2'129 ns)    799 ns  1'253 ns  2'129 ns
wsm - zero-pool   2'033 ns/iter   (1'976 ns … 2'829 ns)  2'002 ns  2'796 ns  2'829 ns
wsm - js          2'036 ns/iter   (1'927 ns … 4'080 ns)  1'955 ns  3'323 ns  4'080 ns
js - simple      16'549 ns/iter    (15'600 ns … 209 µs) 16'100 ns 29'200 ns 61'100 ns
js                8'761 ns/iter  (8'542 ns … 10'660 ns)  8'714 ns 10'660 ns 10'660 ns
bufferutil        1'972 ns/iter   (1'894 ns … 3'933 ns)  1'926 ns  2'729 ns  3'933 ns

summary for mask - 16Kib
  wsm - wasm-simd
   2.4x faster than bufferutil
   2.47x faster than wsm - zero-pool
   2.47x faster than wsm - js
   10.64x faster than js
   20.1x faster than js - simple

• mask - 64Kib
------------------------------------------------------- -----------------------------
wsm - wasm-simd   4'000 ns/iter   (3'919 ns … 5'166 ns)  3'971 ns  5'166 ns  5'166 ns
wsm - zero-pool   8'654 ns/iter   (8'100 ns … 3'423 µs)  8'200 ns 14'800 ns 44'600 ns
wsm - js          7'881 ns/iter     (7'500 ns … 939 µs)  7'700 ns 12'500 ns 29'700 ns
js - simple      64'275 ns/iter  (62'800 ns … 1'004 µs) 63'000 ns 94'900 ns    218 µs
js               35'828 ns/iter  (34'400 ns … 1'527 µs) 34'500 ns 55'300 ns    130 µs
bufferutil        7'480 ns/iter   (7'250 ns … 9'281 ns)  7'534 ns  9'281 ns  9'281 ns

summary for mask - 64Kib
  wsm - wasm-simd
   1.87x faster than bufferutil
   1.97x faster than wsm - js
   2.16x faster than wsm - zero-pool
   8.96x faster than js
   16.07x faster than js - simple

• mask - 128Kib
------------------------------------------------------- -----------------------------
wsm - wasm-simd   8'024 ns/iter   (7'700 ns … 3'176 µs)  7'800 ns 11'200 ns 34'700 ns
wsm - zero-pool  16'581 ns/iter    (15'900 ns … 199 µs) 16'000 ns 27'300 ns 55'400 ns
wsm - js         15'932 ns/iter  (14'800 ns … 4'165 µs) 15'000 ns 25'900 ns 63'400 ns
js - simple         129 µs/iter     (125 µs … 1'497 µs)    126 µs    200 µs    391 µs
js               70'385 ns/iter  (68'600 ns … 1'528 µs) 68'700 ns    105 µs    227 µs
bufferutil       14'797 ns/iter    (14'300 ns … 403 µs) 14'400 ns 20'200 ns 61'000 ns

summary for mask - 128Kib
  wsm - wasm-simd
   1.84x faster than bufferutil
   1.99x faster than wsm - js
   2.07x faster than wsm - zero-pool
   8.77x faster than js
   16.05x faster than js - simple

• mask - 256Kib
------------------------------------------------------- -----------------------------
wsm - wasm-simd  15'974 ns/iter    (15'300 ns … 455 µs) 15'500 ns 25'300 ns 65'800 ns
wsm - zero-pool  33'584 ns/iter  (31'700 ns … 5'357 µs) 31'900 ns 57'500 ns    124 µs
wsm - js         30'890 ns/iter    (29'400 ns … 357 µs) 29'700 ns 55'100 ns    132 µs
js - simple         268 µs/iter     (251 µs … 1'758 µs)    254 µs    495 µs    780 µs
js                  142 µs/iter       (137 µs … 935 µs)    138 µs    244 µs    372 µs
bufferutil       30'695 ns/iter  (28'600 ns … 7'704 µs) 28'700 ns 38'700 ns    183 µs

summary for mask - 256Kib
  wsm - wasm-simd
   1.92x faster than bufferutil
   1.93x faster than wsm - js
   2.1x faster than wsm - zero-pool
   8.91x faster than js
   16.76x faster than js - simple

• mask - 1MiB
------------------------------------------------------- -----------------------------
wsm - wasm-simd  73'909 ns/iter  (69'700 ns … 5'914 µs) 71'900 ns    105 µs    230 µs
wsm - zero-pool     135 µs/iter     (130 µs … 2'299 µs)    130 µs    209 µs    514 µs
wsm - js            132 µs/iter       (126 µs … 835 µs)    128 µs    220 µs    612 µs
js - simple       1'046 µs/iter   (1'006 µs … 2'398 µs)  1'015 µs  1'610 µs  2'398 µs
js                  584 µs/iter     (552 µs … 2'665 µs)    557 µs  1'084 µs  2'198 µs
bufferutil          120 µs/iter     (116 µs … 1'061 µs)    116 µs    165 µs    507 µs

summary for mask - 1MiB
  wsm - wasm-simd
   1.62x faster than bufferutil
   1.78x faster than wsm - js
   1.82x faster than wsm - zero-pool
   7.9x faster than js
   14.15x faster than js - simple

• mask - 16Mib
------------------------------------------------------- -----------------------------
wsm - wasm-simd   1'682 µs/iter   (1'544 µs … 2'911 µs)  1'709 µs  2'509 µs  2'911 µs
wsm - zero-pool   2'338 µs/iter   (2'206 µs … 5'039 µs)  2'296 µs  4'010 µs  5'039 µs
wsm - js          2'725 µs/iter   (2'552 µs … 4'236 µs)  2'723 µs  3'903 µs  4'236 µs
js - simple      16'847 µs/iter (16'337 µs … 23'373 µs) 16'767 µs 23'373 µs 23'373 µs
js                9'388 µs/iter  (9'003 µs … 14'421 µs)  9'186 µs 14'421 µs 14'421 µs
bufferutil        1'921 µs/iter   (1'857 µs … 3'085 µs)  1'901 µs  2'663 µs  3'085 µs

summary for mask - 16Mib
  wsm - wasm-simd
   1.14x faster than bufferutil
   1.39x faster than wsm - zero-pool
   1.62x faster than wsm - js
   5.58x faster than js
   10.02x faster than js - simple

• mask - 32Mib
------------------------------------------------------- -----------------------------
wsm - wasm-simd   4'110 µs/iter   (3'903 µs … 6'142 µs)  4'099 µs  5'143 µs  6'142 µs
wsm - zero-pool   4'780 µs/iter   (4'561 µs … 6'878 µs)  4'693 µs  6'871 µs  6'878 µs
wsm - js          6'164 µs/iter   (5'898 µs … 8'339 µs)  6'248 µs  7'925 µs  8'339 µs
js - simple      33'344 µs/iter (32'792 µs … 34'719 µs) 34'005 µs 34'719 µs 34'719 µs
js               18'528 µs/iter (18'111 µs … 20'718 µs) 18'713 µs 20'718 µs 20'718 µs
bufferutil        3'808 µs/iter   (3'738 µs … 4'958 µs)  3'802 µs  4'955 µs  4'958 µs

summary for mask - 32Mib
  bufferutil
   1.08x faster than wsm - wasm-simd
   1.26x faster than wsm - zero-pool
   1.62x faster than wsm - js
   4.87x faster than js
   8.76x faster than js - simple

• mask - 64Mib
------------------------------------------------------- -----------------------------
wsm - wasm-simd   8'461 µs/iter  (8'125 µs … 11'521 µs)  8'417 µs 11'521 µs 11'521 µs
wsm - zero-pool   9'725 µs/iter  (9'387 µs … 12'452 µs)  9'660 µs 12'452 µs 12'452 µs
wsm - js         12'649 µs/iter (12'166 µs … 15'927 µs) 12'701 µs 15'927 µs 15'927 µs
js - simple      66'617 µs/iter (66'035 µs … 67'776 µs) 67'152 µs 67'776 µs 67'776 µs
js               37'208 µs/iter (36'589 µs … 39'947 µs) 37'264 µs 39'947 µs 39'947 µs
bufferutil        7'619 µs/iter   (7'498 µs … 8'466 µs)  7'625 µs  8'466 µs  8'466 µs

summary for mask - 64Mib
  bufferutil
   1.11x faster than wsm - wasm-simd
   1.28x faster than wsm - zero-pool
   1.66x faster than wsm - js
   4.88x faster than js
   8.74x faster than js - simple

• mask - 128Mib
------------------------------------------------------- -----------------------------
wsm - wasm-simd  17'112 µs/iter (16'521 µs … 23'056 µs) 16'875 µs 23'056 µs 23'056 µs
wsm - zero-pool  19'454 µs/iter (18'765 µs … 25'617 µs) 19'423 µs 25'617 µs 25'617 µs
wsm - js         25'002 µs/iter (24'375 µs … 28'413 µs) 24'915 µs 28'413 µs 28'413 µs
js - simple         134 ms/iter       (132 ms … 142 ms)    132 ms    142 ms    142 ms
js               73'651 µs/iter (73'293 µs … 74'395 µs) 74'104 µs 74'395 µs 74'395 µs
bufferutil       15'257 µs/iter (15'076 µs … 16'103 µs) 15'305 µs 16'103 µs 16'103 µs

summary for mask - 128Mib
  bufferutil
   1.12x faster than wsm - wasm-simd
   1.28x faster than wsm - zero-pool
   1.64x faster than wsm - js
   4.83x faster than js
   8.77x faster than js - simple

• mask - 256Mib
------------------------------------------------------- -----------------------------
wsm - wasm-simd  33'674 µs/iter (33'155 µs … 35'087 µs) 33'993 µs 35'087 µs 35'087 µs
wsm - zero-pool  38'144 µs/iter (37'464 µs … 39'958 µs) 38'759 µs 39'958 µs 39'958 µs
wsm - js         50'100 µs/iter (48'562 µs … 53'292 µs) 51'402 µs 53'292 µs 53'292 µs
js - simple         268 ms/iter       (265 ms … 274 ms)    274 ms    274 ms    274 ms
js                  148 ms/iter       (146 ms … 152 ms)    148 ms    152 ms    152 ms
bufferutil       31'150 µs/iter (30'617 µs … 34'024 µs) 31'524 µs 34'024 µs 34'024 µs

summary for mask - 256Mib
  bufferutil
   1.08x faster than wsm - wasm-simd
   1.22x faster than wsm - zero-pool
   1.61x faster than wsm - js
   4.75x faster than js
   8.61x faster than js - simple
```

### Running on LTS

```text
cpu: AMD Ryzen 7 8845HS w/ Radeon 780M Graphics
runtime: node v22.15.1 (x64-win32)

benchmark            time (avg)             (min … max)       p75       p99      p999
------------------------------------------------------- -----------------------------
• mask - 4b
------------------------------------------------------- -----------------------------
wsm - wasm-simd    38.3 ns/iter   (34.67 ns … 2'128 ns)  35.21 ns    101 ns    254 ns
wsm - zero-pool   46.71 ns/iter     (42.24 ns … 478 ns)  44.78 ns    108 ns    279 ns
wsm - js          41.18 ns/iter   (37.55 ns … 2'653 ns)  38.23 ns  97.41 ns    218 ns
js - simple       21.16 ns/iter     (20.21 ns … 279 ns)  20.61 ns  37.94 ns  94.58 ns
js                20.87 ns/iter   (19.34 ns … 1'759 ns)  19.78 ns  37.35 ns  88.57 ns
bufferutil        80.42 ns/iter        (77 ns … 852 ns)  77.93 ns    139 ns    319 ns

summary for mask - 4b
  js
   1.01x faster than js - simple
   1.84x faster than wsm - wasm-simd
   1.97x faster than wsm - js
   2.24x faster than wsm - zero-pool
   3.85x faster than bufferutil

• mask - 32b
------------------------------------------------------- -----------------------------
wsm - wasm-simd    43.6 ns/iter     (39.45 ns … 484 ns)  40.04 ns    103 ns    215 ns
wsm - zero-pool   46.95 ns/iter   (43.31 ns … 2'910 ns)   43.9 ns    108 ns    271 ns
wsm - js          41.87 ns/iter     (38.77 ns … 388 ns)  39.55 ns    103 ns    199 ns
js - simple        48.7 ns/iter     (46.14 ns … 460 ns)  46.63 ns  86.28 ns    194 ns
js                35.79 ns/iter     (33.06 ns … 399 ns)  33.98 ns  62.65 ns    113 ns
bufferutil        81.25 ns/iter        (77 ns … 492 ns)  77.64 ns    137 ns    322 ns

summary for mask - 32b
  js
   1.17x faster than wsm - js
   1.22x faster than wsm - wasm-simd
   1.31x faster than wsm - zero-pool
   1.36x faster than js - simple
   2.27x faster than bufferutil

• mask - 64b
------------------------------------------------------- -----------------------------
wsm - wasm-simd   47.81 ns/iter     (43.02 ns … 716 ns)  43.85 ns    112 ns    213 ns
wsm - zero-pool   51.61 ns/iter     (47.56 ns … 627 ns)  48.19 ns    115 ns    178 ns
wsm - js          47.79 ns/iter     (43.95 ns … 395 ns)  44.82 ns    110 ns    285 ns
js - simple       82.77 ns/iter   (77.29 ns … 2'255 ns)  77.78 ns    153 ns    282 ns
js                53.33 ns/iter      (50.2 ns … 324 ns)  51.07 ns  99.56 ns    160 ns
bufferutil        82.27 ns/iter     (78.76 ns … 508 ns)  80.22 ns    137 ns    250 ns

summary for mask - 64b
  wsm - js
   1x faster than wsm - wasm-simd
   1.08x faster than wsm - zero-pool
   1.12x faster than js
   1.72x faster than bufferutil
   1.73x faster than js - simple

• mask - 16Kib
------------------------------------------------------- -----------------------------
wsm - wasm-simd   1'257 ns/iter   (1'217 ns … 3'821 ns)  1'238 ns  1'738 ns  3'821 ns
wsm - zero-pool   2'060 ns/iter   (1'967 ns … 4'193 ns)  2'007 ns  3'243 ns  4'193 ns
wsm - js          2'035 ns/iter   (1'980 ns … 3'021 ns)  2'008 ns  2'801 ns  3'021 ns
js - simple      16'694 ns/iter  (15'700 ns … 3'631 µs) 16'100 ns 30'000 ns 68'100 ns
js                8'976 ns/iter  (8'555 ns … 11'423 ns)  8'917 ns 11'423 ns 11'423 ns
bufferutil        1'985 ns/iter   (1'914 ns … 3'893 ns)  1'967 ns  2'794 ns  3'893 ns

summary for mask - 16Kib
  wsm - wasm-simd
   1.58x faster than bufferutil
   1.62x faster than wsm - js
   1.64x faster than wsm - zero-pool
   7.14x faster than js
   13.28x faster than js - simple

• mask - 64Kib
------------------------------------------------------- -----------------------------
wsm - wasm-simd   5'538 ns/iter   (5'287 ns … 8'303 ns)  5'416 ns  8'303 ns  8'303 ns
wsm - zero-pool   8'403 ns/iter     (8'000 ns … 270 µs)  8'100 ns 14'100 ns 33'000 ns
wsm - js          8'548 ns/iter     (7'600 ns … 643 µs)  8'100 ns 13'600 ns 34'600 ns
js - simple      69'384 ns/iter    (62'700 ns … 715 µs) 62'900 ns    137 µs    309 µs
js               36'123 ns/iter    (34'300 ns … 985 µs) 34'500 ns 60'100 ns 91'300 ns
bufferutil        7'634 ns/iter   (7'332 ns … 8'498 ns)  7'817 ns  8'498 ns  8'498 ns

summary for mask - 64Kib
  wsm - wasm-simd
   1.38x faster than bufferutil
   1.52x faster than wsm - zero-pool
   1.54x faster than wsm - js
   6.52x faster than js
   12.53x faster than js - simple

• mask - 128Kib
------------------------------------------------------- -----------------------------
wsm - wasm-simd  11'586 ns/iter  (10'800 ns … 1'209 µs) 11'000 ns 17'300 ns 63'400 ns
wsm - zero-pool  16'947 ns/iter    (16'100 ns … 526 µs) 16'300 ns 29'300 ns 62'700 ns
wsm - js         17'390 ns/iter    (16'400 ns … 948 µs) 16'700 ns 27'300 ns 63'700 ns
js - simple         130 µs/iter     (126 µs … 1'019 µs)    126 µs    190 µs    352 µs
js               71'711 ns/iter    (68'800 ns … 565 µs) 69'000 ns    119 µs    233 µs
bufferutil       15'162 ns/iter  (14'500 ns … 2'389 µs) 14'700 ns 19'700 ns 50'200 ns

summary for mask - 128Kib
  wsm - wasm-simd
   1.31x faster than bufferutil
   1.46x faster than wsm - zero-pool
   1.5x faster than wsm - js
   6.19x faster than js
   11.2x faster than js - simple

• mask - 256Kib
------------------------------------------------------- -----------------------------
wsm - wasm-simd  22'621 ns/iter    (21'500 ns … 562 µs) 21'800 ns 38'200 ns 84'700 ns
wsm - zero-pool  33'362 ns/iter    (32'100 ns … 283 µs) 32'300 ns 58'200 ns    121 µs
wsm - js         34'400 ns/iter    (32'900 ns … 504 µs) 33'200 ns 55'800 ns    136 µs
js - simple         262 µs/iter     (251 µs … 1'919 µs)    253 µs    402 µs    796 µs
js                  142 µs/iter       (138 µs … 547 µs)    138 µs    240 µs    365 µs
bufferutil       29'852 ns/iter    (28'900 ns … 273 µs) 29'100 ns 42'100 ns    103 µs

summary for mask - 256Kib
  wsm - wasm-simd
   1.32x faster than bufferutil
   1.47x faster than wsm - zero-pool
   1.52x faster than wsm - js
   6.29x faster than js
   11.59x faster than js - simple

• mask - 1MiB
------------------------------------------------------- -----------------------------
wsm - wasm-simd  97'923 ns/iter    (92'600 ns … 729 µs) 95'000 ns    150 µs    336 µs
wsm - zero-pool     133 µs/iter       (130 µs … 624 µs)    131 µs    189 µs    373 µs
wsm - js            147 µs/iter       (139 µs … 922 µs)    143 µs    227 µs    494 µs
js - simple       1'046 µs/iter   (1'006 µs … 2'320 µs)  1'014 µs  1'672 µs  2'320 µs
js                  562 µs/iter     (552 µs … 1'355 µs)    557 µs    778 µs  1'306 µs
bufferutil          119 µs/iter       (116 µs … 615 µs)    117 µs    174 µs    393 µs

summary for mask - 1MiB
  wsm - wasm-simd
   1.21x faster than bufferutil
   1.36x faster than wsm - zero-pool
   1.5x faster than wsm - js
   5.74x faster than js
   10.68x faster than js - simple

• mask - 16Mib
------------------------------------------------------- -----------------------------
wsm - wasm-simd   2'291 µs/iter   (1'999 µs … 3'857 µs)  2'282 µs  3'300 µs  3'857 µs
wsm - zero-pool   2'299 µs/iter   (2'226 µs … 3'043 µs)  2'292 µs  3'023 µs  3'043 µs
wsm - js          3'164 µs/iter   (2'841 µs … 4'688 µs)  3'127 µs  4'099 µs  4'688 µs
js - simple      16'541 µs/iter (16'321 µs … 18'654 µs) 16'462 µs 18'654 µs 18'654 µs
js                9'163 µs/iter  (9'010 µs … 10'386 µs)  9'110 µs 10'386 µs 10'386 µs
bufferutil        1'908 µs/iter   (1'864 µs … 2'877 µs)  1'889 µs  2'494 µs  2'877 µs

summary for mask - 16Mib
  bufferutil
   1.2x faster than wsm - wasm-simd
   1.2x faster than wsm - zero-pool
   1.66x faster than wsm - js
   4.8x faster than js
   8.67x faster than js - simple

• mask - 32Mib
------------------------------------------------------- -----------------------------
wsm - wasm-simd   4'805 µs/iter   (4'645 µs … 6'363 µs)  4'789 µs  5'921 µs  6'363 µs
wsm - zero-pool   4'749 µs/iter   (4'596 µs … 6'447 µs)  4'717 µs  5'840 µs  6'447 µs
wsm - js          6'403 µs/iter   (6'251 µs … 8'152 µs)  6'339 µs  8'152 µs  8'152 µs
js - simple      33'027 µs/iter (32'739 µs … 34'217 µs) 32'907 µs 34'217 µs 34'217 µs
js               18'402 µs/iter (18'166 µs … 19'542 µs) 18'442 µs 19'542 µs 19'542 µs
bufferutil        3'804 µs/iter   (3'737 µs … 4'978 µs)  3'800 µs  4'763 µs  4'978 µs

summary for mask - 32Mib
  bufferutil
   1.25x faster than wsm - zero-pool
   1.26x faster than wsm - wasm-simd
   1.68x faster than wsm - js
   4.84x faster than js
   8.68x faster than js - simple

• mask - 64Mib
------------------------------------------------------- -----------------------------
wsm - wasm-simd   9'774 µs/iter  (9'567 µs … 10'689 µs)  9'764 µs 10'689 µs 10'689 µs
wsm - zero-pool   9'879 µs/iter  (9'421 µs … 12'289 µs)  9'932 µs 12'289 µs 12'289 µs
wsm - js         13'112 µs/iter (12'796 µs … 15'362 µs) 13'206 µs 15'362 µs 15'362 µs
js - simple      66'328 µs/iter (65'966 µs … 66'742 µs) 66'652 µs 66'742 µs 66'742 µs
js               36'923 µs/iter (36'673 µs … 37'516 µs) 37'083 µs 37'516 µs 37'516 µs
bufferutil        7'678 µs/iter   (7'504 µs … 9'294 µs)  7'632 µs  9'294 µs  9'294 µs

summary for mask - 64Mib
  bufferutil
   1.27x faster than wsm - wasm-simd
   1.29x faster than wsm - zero-pool
   1.71x faster than wsm - js
   4.81x faster than js
   8.64x faster than js - simple

• mask - 128Mib
------------------------------------------------------- -----------------------------
wsm - wasm-simd  19'764 µs/iter (19'366 µs … 20'934 µs) 19'811 µs 20'934 µs 20'934 µs
wsm - zero-pool  19'476 µs/iter (18'854 µs … 23'625 µs) 19'370 µs 23'625 µs 23'625 µs
wsm - js         25'856 µs/iter (25'721 µs … 26'347 µs) 25'869 µs 26'347 µs 26'347 µs
js - simple         132 ms/iter       (132 ms … 133 ms)    132 ms    133 ms    133 ms
js               73'561 µs/iter (73'133 µs … 74'101 µs) 73'906 µs 74'101 µs 74'101 µs
bufferutil       15'290 µs/iter (15'069 µs … 16'411 µs) 15'321 µs 16'411 µs 16'411 µs

summary for mask - 128Mib
  bufferutil
   1.27x faster than wsm - zero-pool
   1.29x faster than wsm - wasm-simd
   1.69x faster than wsm - js
   4.81x faster than js
   8.65x faster than js - simple

• mask - 256Mib
------------------------------------------------------- -----------------------------
wsm - wasm-simd  39'707 µs/iter (39'166 µs … 41'460 µs) 40'106 µs 41'460 µs 41'460 µs
wsm - zero-pool  38'368 µs/iter (37'451 µs … 42'129 µs) 38'536 µs 42'129 µs 42'129 µs
wsm - js         52'945 µs/iter (52'040 µs … 55'086 µs) 53'002 µs 55'086 µs 55'086 µs
js - simple         264 ms/iter       (263 ms … 264 ms)    264 ms    264 ms    264 ms
js                  147 ms/iter       (146 ms … 148 ms)    147 ms    148 ms    148 ms
bufferutil       30'557 µs/iter (30'165 µs … 31'474 µs) 30'903 µs 31'474 µs 31'474 µs

summary for mask - 256Mib
  bufferutil
   1.26x faster than wsm - zero-pool
   1.3x faster than wsm - wasm-simd
   1.73x faster than wsm - js
   4.81x faster than js
   8.63x faster than js - simple
```
