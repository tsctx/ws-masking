# ws-masking

There are two variations, [wasm (simd)](#ws-masking-wasm) and [js (pure-js)](#ws-masking-js).

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

- /benchmarks/mask-backend.mjs

```text
clk: ~3.22 GHz
cpu: AMD Ryzen 7 8845HS w/ Radeon 780M Graphics
runtime: node 24.2.0 (x64-win32)

benchmark                   avg (min … max) p75 / p99    (min … top 1%)
------------------------------------------- -------------------------------
• 4b
------------------------------------------- -------------------------------
wasm-simd                    496.11 ns/iter 518.82 ns       ▂▃  █
                    (378.52 ns … 960.21 ns) 653.20 ns       ██ ██▅
                    (  5.15  b … 385.84  b)  60.75  b ▂▃▄▄▃▃██████▆▂▂▁▂▁▁▁▁

wsm                          784.92 ns/iter 793.46 ns        █▄▆
                      (708.42 ns … 1.12 µs) 877.93 ns     ▃ ▃███▇
                    (  0.03  b … 219.79  b)   2.64  b ▂▄▁▃███████▅▅▃▁▁▄▆▅▅▁

js - simple                  463.94 ns/iter 484.25 ns       █▆
                    (336.94 ns … 711.40 ns) 618.14 ns       ██▃ ▄
                    ( 15.75  b … 363.77  b)  55.70  b ▁▂▄▃▃██████▆▃▂▂▃▅▄▆▄▂

js                           623.11 ns/iter 635.62 ns    █▅
                    (549.07 ns … 988.72 ns) 920.48 ns   ████
                    ( 15.72  b … 288.23  b)  61.66  b ▄█████▄▃▂▂▂▂▁▁▁▁▂▁▁▁▁

bufferutil                     1.44 µs/iter   1.47 µs      ▆█ ▇
                        (1.33 µs … 1.79 µs)   1.61 µs    ▇█████▇▇█ ▂       
                    (  0.00  b … 362.57  b)   6.15  b ▃▆▇███████████▁▃▄▂▁▁▂

no mask                      385.65 ns/iter 498.49 ns                 █    
                    (161.65 ns … 966.02 ns) 585.25 ns  ▃▇▅     ▇▂   ▇██▇   
                    ( 24.12  b … 448.90  b) 126.71  b ▅███▆▄▃████▅▄▃█████▅▂

summary
  no mask
   1.2x faster than js - simple
   1.29x faster than wasm-simd
   1.62x faster than js
   2.04x faster than wsm
   3.73x faster than bufferutil

• 64b
------------------------------------------- -------------------------------
wasm-simd                      1.33 µs/iter   1.35 µs   ▄█▇
                        (1.21 µs … 1.97 µs)   1.77 µs  ▂███▇▂
                    (  0.05  b … 278.98  b)   3.51  b ▃██████▃▄▂▃▁▂▃▁▁▁▁▁▁▁

wsm                            1.26 µs/iter   1.29 µs    ▂█
                        (1.17 µs … 1.60 µs)   1.50 µs   ███▅█▇▅
                    (  0.02  b … 437.20  b)   6.97  b ▅▆███████▆▆▄▃▂▂▂▁▁▁▂▂

js - simple                    1.29 µs/iter   1.31 µs      ▂█▂
                        (1.18 µs … 1.81 µs)   1.47 µs    ▅ ███▆▃▃
                    (  0.06  b … 329.80  b)   5.90  b ▃▅▅█▇██████▆▄▂▃▂▂▁▂▁▂

js                             1.21 µs/iter   1.23 µs   ▅█▇▄
                        (1.12 µs … 1.61 µs)   1.53 µs  ▃████▄
                    (  0.07  b … 330.24  b)   6.71  b ▅██████▇▄▄▁▁▁▁▁▁▁▁▁▁▂

bufferutil                     1.62 µs/iter   1.66 µs    ▂▄ ▇ █
                        (1.49 µs … 2.10 µs)   1.88 µs   ▇████▇██▅
                    (  0.02  b … 329.80  b)   6.75  b ▂▅█████████▆▃▃▃▁▁▁▁▂▂

no mask                      936.93 ns/iter 959.13 ns        ▆█
                      (860.38 ns … 1.09 µs)   1.06 µs    ▄█▄███▆▄▄
                    (  0.04  b … 132.00  b)   1.98  b ▃▅▅██████████▄▂▂▃▁▁▁▁

summary
  no mask
   1.29x faster than js
   1.35x faster than wsm
   1.37x faster than js - simple
   1.42x faster than wasm-simd
   1.73x faster than bufferutil

• 16Kib
------------------------------------------- -------------------------------
wasm-simd                     13.20 µs/iter  13.25 µs  █▂  █
                      (12.81 µs … 14.11 µs)  14.10 µs  ██  █ ▅            ▅
                    (  0.16  b … 176.31  b)  28.75  b ▇██▇▇█▇█▁▇▇▁▁▁▁▁▁▁▁▁█

wsm                           32.71 µs/iter  32.00 µs  █
                     (12.80 µs … 160.00 µs)  91.60 µs  █
                    (  1.07 kb …  65.12 kb)   1.41 kb ▇█▆▁▁▁▁▁▁▁▁▁▁▁▁▂▃▅▄▂▁

js - simple                   40.65 µs/iter  40.87 µs       █
                      (40.08 µs … 41.38 µs)  41.25 µs █     █
                    (  0.22  b … 474.30  b)  68.91  b █▁▁▁█▁█▁▁█▁▁▁███▁▁▁▁█

js                            27.70 µs/iter  27.96 µs █
                      (27.42 µs … 28.11 µs)  27.99 µs █ ▅  ▅▅     ▅      ▅▅
                    (  0.93  b … 573.09  b)  97.01  b █▁█▁▁██▁▁▁▁▁█▁▁▁▁▁▁██

bufferutil                    16.49 µs/iter  16.79 µs                  █   
                      (15.68 µs … 17.51 µs)  16.95 µs           ▅      █
                    (  0.26  b … 466.11  b)  47.61  b ▇▁▇▁▇▇▁▁▇▁█▇▁▇▁▁▁█▇▇▇

no mask                       13.38 µs/iter  13.51 µs            █
                      (13.03 µs … 13.95 µs)  13.88 µs ▅▅▅    ▅ ▅ █
                    (  0.07  b … 246.20  b)  31.55  b ███▇▁▁▇█▇█▁█▁▇▇▇▁▁▁▁▇

summary
  wasm-simd
   1.01x faster than no mask
   1.25x faster than bufferutil
   2.1x faster than js
   2.48x faster than wsm
   3.08x faster than js - simple

• 64Kib
------------------------------------------- -------------------------------
wasm-simd                     49.24 µs/iter  51.47 µs          ██
                      (42.33 µs … 53.60 µs)  53.50 µs ▅        ██▅▅ ▅ ▅▅  ▅
                    (  3.01  b … 144.14  b)  41.39  b █▁▁▁▁▁▁▁▁████▁█▁██▁▁█

wsm                           59.22 µs/iter  59.40 µs        █
                      (57.80 µs … 61.31 µs)  60.95 µs        █  █
                    (  0.47  b … 131.52  b)  35.22  b █▁██▁█▁█▁▁█▁▁▁▁█▁▁▁▁█

js - simple                  215.89 µs/iter 222.40 µs             █        
                    (120.10 µs … 377.80 µs) 290.00 µs           █ █
                    (992.00  b …   1.20 kb) 992.22  b ▁▁▁▁▁▁▂▃▂▄█▂█▂▂▂▂▃▂▁▁

js                           121.35 µs/iter 118.20 µs         █
                     (67.20 µs … 210.60 µs) 186.00 µs         █
                    (992.00  b … 992.00  b) 992.00  b ▂▁▁▁▁▁▂▅██▂▂▂▁▁▁▁▂▃▂▁

bufferutil                    51.69 µs/iter  55.04 µs             █        
                      (43.75 µs … 56.20 µs)  56.17 µs ▅     ▅▅   ▅█▅ ▅  ▅▅▅
                    (  0.24  b … 155.06  b)  29.65  b █▁▁▁▁▁██▁▁▁███▁█▁▁███

no mask                       39.48 µs/iter  42.75 µs                ██    
                      (28.36 µs … 47.80 µs)  46.91 µs ▅   ▅  ▅▅▅    ▅██   ▅
                    (  0.04  b …  52.83  b)  14.78  b █▁▁▁█▁▁███▁▁▁▁███▁▁▁█

summary
  no mask
   1.25x faster than wasm-simd
   1.31x faster than bufferutil
   1.5x faster than wsm
   3.07x faster than js
   5.47x faster than js - simple

• 128Kib
------------------------------------------- -------------------------------
wasm-simd                     39.37 µs/iter  45.40 µs █
                      (27.75 µs … 51.89 µs)  51.24 µs █              █     
                    (  3.49  b …  44.48  b)  25.43  b █▁█▁▁▁█▁▁█▁▁█▁▁█▁▁▁██

wsm                           43.82 µs/iter  40.96 µs  █ ▂
                      (37.22 µs … 65.87 µs)  58.63 µs ▅█ █
                    (  9.05  b …  32.94  b)  20.06  b ██▁█▁▁▁▁▁▁▁▁▇▁▁▁▁▁▁▁▇

js - simple                  405.23 µs/iter 459.30 µs                  █   
                    (233.30 µs … 558.90 µs) 499.60 µs          ▂▇      █
                    (992.00  b …   1.20 kb) 992.22  b ▁▁▁▁▁▁▁▁███▃▅▂▁▁▄█▄▁▁

js                           222.19 µs/iter 226.70 µs              █       
                    (121.50 µs … 399.70 µs) 282.40 µs             ██
                    (632.00  b … 113.03 kb)   0.98 kb ▂▁▁▁▁▁▁▁▁▁▁▅██▂▂▁▁▁▂▂

bufferutil                    41.74 µs/iter  45.14 µs  ██
                      (36.73 µs … 53.05 µs)  47.31 µs ▅██▅▅          ▅▅ ▅ ▅
                    (  1.45  b …  39.61  b)  10.69  b █████▁▁▁▁▁▁▁▁▁▁██▁█▁█

no mask                       22.95 µs/iter  26.80 µs    █
                      (18.62 µs … 29.55 µs)  27.30 µs    █                ▅
                    (  1.22  b …  28.10  b)   9.97  b ▇▇▁█▁▁▁▁▁▁▁▁▁▇▁▁▁▁▁▇█

summary
  no mask
   1.72x faster than wasm-simd
   1.82x faster than bufferutil
   1.91x faster than wsm
   9.68x faster than js
   17.66x faster than js - simple

• 256Kib
------------------------------------------- -------------------------------
wasm-simd                     51.53 µs/iter  50.45 µs  █ █   █
                      (47.78 µs … 66.72 µs)  55.74 µs ▅█▅█ ▅ █          ▅ ▅
                    (  1.13  b …  48.73  b)  13.48  b ████▁█▁█▁▁▁▁▁▁▁▁▁▁█▁█

wsm                          103.52 µs/iter 104.70 µs         █
                     (62.70 µs … 186.50 µs) 164.40 µs         █
                    (736.00  b … 976.00  b) 736.21  b ▁▁▁▁▁▁▂██▄▁▁▁▁▁▁▁▁▁▁▁

js - simple                  697.90 µs/iter 802.20 µs      ▄▃         █    
                    (454.20 µs … 921.00 µs) 879.50 µs      ██         █  ▂
                    (632.00  b … 632.00  b) 632.00  b ▂▁▁▁▂██▃▁▂▁▁▁▁▁▃█▄▁█▇

js                           401.19 µs/iter 418.40 µs           ▄   █      
                    (235.60 µs … 709.70 µs) 492.60 µs          ▄█   █    ▄
                    (632.00  b … 872.00  b) 632.22  b ▂▁▁▁▁▁▁▁▄███▂▂█▂▂▁▃█▃

bufferutil                    74.55 µs/iter  76.79 µs   ██
                      (68.40 µs … 85.74 µs)  82.35 µs ▅ ██▅  ▅▅   ▅      ▅▅
                    (  0.01  b …  37.57  b)  12.59  b █▁███▁▁██▁▁▁█▁▁▁▁▁▁██

no mask                       33.14 µs/iter  31.16 µs  █
                      (30.36 µs … 45.09 µs)  42.01 µs  █
                    (  1.03  b …   6.63  b)   3.52  b ▄█▁▄▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▄

summary
  no mask
   1.55x faster than wasm-simd
   2.25x faster than bufferutil
   3.12x faster than wsm
   12.1x faster than js
   21.06x faster than js - simple

• 16Mib
------------------------------------------- -------------------------------
wasm-simd                      5.16 ms/iter   5.28 ms   █     ▃
                        (4.80 ms … 6.02 ms)   5.86 ms  ▆█ ▂  ▇█▅▂
                    ( 26.62 kb …  26.62 kb)  26.62 kb ▆██▅█▆▇████▇▅▄▃▁▂▂▂▂▄

wsm                            5.98 ms/iter   5.91 ms  █ █
                        (5.37 ms … 8.32 ms)   8.22 ms ▂█ █▂
                    (736.00  b … 736.00  b) 736.00  b █████▃▃▂▃▂▁▁▁▁▁▂▂▅▂▁▁

js - simple                   30.60 ms/iter  30.95 ms   █     ▃
                      (29.96 ms … 31.54 ms)  31.52 ms  ▇█▇▂▇ ▂█▇ ▂ ▂▂   ▂ ▂
                    (632.00  b … 632.00  b) 632.00  b ▆█████▆███▁█▁██▆▁▆█▁█

js                            17.05 ms/iter  17.28 ms  █
                      (16.52 ms … 19.16 ms)  18.51 ms  █ ▆  ▃
                    (632.00  b … 632.00  b) 632.00  b ▆███▅▅█▂▄▂▄▄▆▅▅▁▁▁▁▁▂

bufferutil                     5.75 ms/iter   5.94 ms  █
                        (5.36 ms … 6.60 ms)   6.51 ms  █▂     ▃▄▅▂
                    (632.00  b … 632.00  b) 632.00  b ███▇▃▂▂▇████▂▆▂▂▂▂▂▃▃

no mask                        3.10 ms/iter   3.21 ms  █
                        (2.86 ms … 3.89 ms)   3.75 ms  █▃   ▄▃▇
                    (304.00  b … 304.00  b) 304.00  b ▆██▆▄▄████▄▁▁▁▁▂▂▂▁▁▁

summary
  no mask
   1.66x faster than wasm-simd
   1.86x faster than bufferutil
   1.93x faster than wsm
   5.51x faster than js
   9.88x faster than js - simple

• 32Mib
------------------------------------------- -------------------------------
wasm-simd                     10.03 ms/iter  10.21 ms      █ ▆▃
                       (9.25 ms … 12.78 ms)  11.41 ms  █▅███▃██▆
                    ( 48.57 kb …  52.62 kb)  52.58 kb ██████████▆▄▃▆▄▁▄█▁▄▄

wsm                           11.52 ms/iter  11.79 ms   █
                      (10.72 ms … 15.30 ms)  15.20 ms ▃██
                    (736.00  b … 736.00  b) 736.00  b ███▅▃▅▅▄▃▂▂▁▂▂▂▁▂▁▁▁▂

js - simple                   61.74 ms/iter  62.30 ms █  ██  █      ██     
                      (60.62 ms … 63.95 ms)  62.88 ms █ ▅██▅ █      ██ ▅▅ ▅
                    (632.00  b … 632.00  b) 632.00  b █▁████▁█▁▁▁▁▁▁██▁██▁█

js                            33.90 ms/iter  34.39 ms █ █
                      (33.03 ms … 35.28 ms)  34.87 ms █ █      ▂▂  ▂ ▇   ▇
                    (632.00  b … 632.00  b) 632.00  b █▆█▆▆▁▆▁▆██▆▆█▆█▆▆▆█▆

bufferutil                    11.25 ms/iter  11.47 ms  █▆   ▃
                      (10.61 ms … 13.13 ms)  12.84 ms  ██   █
                    (632.00  b … 632.00  b) 632.00  b ▃██▇▇▇█▇██▅▁▃▃▃▂▃▁▂▁▃

no mask                        6.05 ms/iter   6.13 ms  ▅  █
                        (5.70 ms … 7.54 ms)   7.52 ms ▄█▄ █▇
                    (304.00  b … 304.00  b) 304.00  b ███████▅▂▁▁▁▁▂▁▂▃▂▁▁▂

summary
  no mask
   1.66x faster than wasm-simd
   1.86x faster than bufferutil
   1.9x faster than wsm
   5.61x faster than js
   10.21x faster than js - simple

• 64Mib
------------------------------------------- -------------------------------
wasm-simd                     22.04 ms/iter  22.23 ms   ▅█▅
                      (21.01 ms … 25.06 ms)  24.18 ms  ▃███ ▆            ▃ 
                    ( 40.66 kb …  40.66 kb)  40.66 kb ███████▆▆█▆▄▁▁▄▁▁▆▁█▄

wsm                           25.14 ms/iter  25.30 ms   ▅█
                      (24.29 ms … 27.33 ms)  27.17 ms ▃▆█████▃           ▃
                    (736.00  b … 736.00  b) 736.00  b ██████████▁▄▁▁▁▄▁▁▁█▄

js - simple                  126.84 ms/iter 129.81 ms        █
                    (121.48 ms … 132.82 ms) 132.05 ms        █
                    (632.00  b … 632.00  b) 632.00  b ▇▁▁▁▁▇▇█▇▁▁▁▁▁▁▁▇▇▁▁▇

js                            70.43 ms/iter  70.83 ms       █     █        
                      (69.37 ms … 72.86 ms)  71.83 ms  █    █     █
                    (632.00  b … 632.00  b) 632.00  b █████▁██▁▁▁▁█▁▁▁▁▁█▁█

bufferutil                    25.16 ms/iter  25.25 ms     █
                      (23.48 ms … 29.69 ms)  29.66 ms    ▅█▅
                    (224.00  b … 632.00  b) 624.15  b █▃▆████▁▅▃▃▅▁▃▁▁▃▁▁▁▃

no mask                       14.96 ms/iter  14.93 ms  ▅ █
                      (14.19 ms … 17.44 ms)  17.31 ms  █▇█▃
                    (304.00  b … 304.00  b) 304.00  b ▃████▇▆▃▂▂▁▂▁▁▂▂▁▁▄▄▂

summary
  no mask
   1.47x faster than wasm-simd
   1.68x faster than wsm
   1.68x faster than bufferutil
   4.71x faster than js
   8.48x faster than js - simple

• 128Mib
------------------------------------------- -------------------------------
wasm-simd                     42.82 ms/iter  43.22 ms   █
                      (41.23 ms … 46.71 ms)  46.23 ms   █▂ ▂
                    ( 62.98 kb …  62.98 kb)  62.98 kb ▇▄██▄█▁▇▄▁▇▁▁▁▄▄▁▁▁▄▄

wsm                           49.31 ms/iter  49.98 ms     █ █ ▂  ▂
                      (47.27 ms … 52.74 ms)  52.28 ms     █ █ █  █
                    (736.00  b … 736.00  b) 736.00  b ▇▇▁▇█▇█▁█▇▇█▁▇▁▇▁▁▁▁▇

js - simple                  256.68 ms/iter 255.04 ms    █
                    (243.54 ms … 295.13 ms) 276.76 ms    █
                    (600.00  b … 632.00  b) 629.33  b ▇▁▇█▇▇▁▇▁▁▁▁▁▇▁▁▁▁▁▁▇

js                           139.58 ms/iter 140.65 ms          █    █      
                    (134.75 ms … 144.48 ms) 143.40 ms ▅ ▅    ▅▅█ ▅  █    ▅▅
                    (632.00  b … 632.00  b) 632.00  b █▁█▁▁▁▁███▁█▁▁█▁▁▁▁██

bufferutil                    49.90 ms/iter  50.47 ms    █ █
                      (47.37 ms … 54.35 ms)  54.21 ms █ █████ ██
                    (632.00  b … 872.00  b) 641.23  b █▁████████▁▁█▁▁▁█▁▁██

no mask                       28.67 ms/iter  28.76 ms     █
                      (27.83 ms … 31.59 ms)  31.01 ms  ▃ ██
                    (304.00  b … 304.00  b) 304.00  b ▇█▅██▇▃▃█▃▃▃▁▁▁▁▁▁▃▁▃

summary
  no mask
   1.49x faster than wasm-simd
   1.72x faster than wsm
   1.74x faster than bufferutil
   4.87x faster than js
   8.95x faster than js - simple

• 256Mib
------------------------------------------- -------------------------------
wasm-simd                     82.76 ms/iter  83.25 ms        █
                      (80.08 ms … 88.53 ms)  84.54 ms        █   █
                    ( 63.01 kb …  63.01 kb)  63.01 kb █▁▁▁▁█▁██▁▁█▁███▁▁▁▁█

wsm                           95.86 ms/iter  96.60 ms               ██     
                      (91.66 ms … 97.59 ms)  97.32 ms               ██
                    (736.00  b … 736.00  b) 736.00  b █▁▁▁▁▁▁▁▁▁▁▁▁▁██▁██▁█

js - simple                  503.38 ms/iter 507.41 ms █  █ ██ ███   █ ██  █
                    (490.39 ms … 532.87 ms) 511.42 ms █  █ ██ ███   █ ██  █
                    (632.00  b … 632.00  b) 632.00  b █▁▁█▁██▁███▁▁▁█▁██▁▁█

js                           275.86 ms/iter 276.85 ms                     █
                    (266.36 ms … 289.21 ms) 277.04 ms                 █ █ █
                    (600.00  b … 632.00  b) 629.33  b █▁▁▁▁▁█▁▁▁▁▁▁▁▁▁█████

bufferutil                    96.48 ms/iter  96.52 ms              █       
                      (95.45 ms … 97.70 ms)  97.03 ms              █
                    (600.00  b … 632.00  b) 629.87  b █▁▁▁▁▁▁██▁▁▁███▁█▁▁▁█

no mask                       57.69 ms/iter  57.72 ms █    █
                      (56.02 ms … 64.30 ms)  63.19 ms █ ▇▇▂█
                    (304.00  b … 304.00  b) 304.00  b █▁████▁▁▁▁▁▁▁▁▁▁▁▁▁▁▆

summary
  no mask
   1.43x faster than wasm-simd
   1.66x faster than wsm
   1.67x faster than bufferutil
   4.78x faster than js
   8.73x faster than js - simple
```

### Running on Current

- /benchmarks/mask.mjs

```text
cpu: AMD Ryzen 7 8845HS w/ Radeon 780M Graphics
runtime: node v24.2.0 (x64-win32)

benchmark            time (avg)             (min … max)       p75       p99      p999
------------------------------------------------------- -----------------------------
• mask - 4b
------------------------------------------------------- -----------------------------
wsm - wasm-simd   73.47 ns/iter     (67.38 ns … 460 ns)   68.6 ns    169 ns    311 ns
wsm               47.51 ns/iter     (44.14 ns … 776 ns)  44.87 ns  95.95 ns    289 ns
js - simple       22.41 ns/iter     (21.48 ns … 323 ns)  21.73 ns  47.61 ns    113 ns
js                22.35 ns/iter     (21.58 ns … 240 ns)  21.88 ns  35.21 ns    109 ns
bufferutil        80.42 ns/iter     (77.25 ns … 317 ns)   79.2 ns    116 ns    208 ns

summary for mask - 4b
  js
   1x faster than js - simple
   2.13x faster than wsm
   3.29x faster than wsm - wasm-simd
   3.6x faster than bufferutil

• mask - 32b
------------------------------------------------------- -----------------------------
wsm - wasm-simd   70.48 ns/iter     (66.31 ns … 497 ns)  67.77 ns    140 ns    236 ns
wsm                  48 ns/iter     (45.85 ns … 271 ns)  46.68 ns  99.32 ns    218 ns
js - simple       48.46 ns/iter     (46.88 ns … 255 ns)  47.31 ns  84.57 ns    167 ns
js                35.81 ns/iter     (34.72 ns … 444 ns)  35.11 ns  55.22 ns    123 ns
bufferutil        79.93 ns/iter     (76.81 ns … 335 ns)  78.22 ns    125 ns    245 ns

summary for mask - 32b
  js
   1.34x faster than wsm
   1.35x faster than js - simple
   1.97x faster than wsm - wasm-simd
   2.23x faster than bufferutil

• mask - 64b
------------------------------------------------------- -----------------------------
wsm - wasm-simd   73.65 ns/iter      (68.7 ns … 379 ns)  70.12 ns    158 ns    282 ns
wsm               51.98 ns/iter     (50.05 ns … 280 ns)  50.73 ns  92.92 ns    167 ns
js - simple       79.85 ns/iter     (77.93 ns … 299 ns)  78.42 ns    123 ns    245 ns
js                53.39 ns/iter     (51.17 ns … 224 ns)   52.1 ns  92.19 ns    185 ns
bufferutil        82.64 ns/iter     (79.49 ns … 339 ns)  81.01 ns    130 ns    227 ns

summary for mask - 64b
  wsm
   1.03x faster than js
   1.42x faster than wsm - wasm-simd
   1.54x faster than js - simple
   1.59x faster than bufferutil

• mask - 16Kib
------------------------------------------------------- -----------------------------
wsm - wasm-simd     906 ns/iter     (850 ns … 1'697 ns)    864 ns  1'537 ns  1'697 ns
wsm               1'984 ns/iter   (1'934 ns … 2'844 ns)  1'962 ns  2'674 ns  2'844 ns
js - simple      16'553 ns/iter    (15'600 ns … 273 µs) 16'000 ns 27'800 ns 77'700 ns
js                8'719 ns/iter   (8'516 ns … 9'779 ns)  8'789 ns  9'779 ns  9'779 ns
bufferutil        1'937 ns/iter   (1'900 ns … 2'423 ns)  1'918 ns  2'334 ns  2'423 ns

summary for mask - 16Kib
  wsm - wasm-simd
   2.14x faster than bufferutil
   2.19x faster than wsm
   9.62x faster than js
   18.27x faster than js - simple

• mask - 64Kib
------------------------------------------------------- -----------------------------
wsm - wasm-simd   4'062 ns/iter   (3'970 ns … 4'951 ns)  4'091 ns  4'951 ns  4'951 ns
wsm               8'291 ns/iter   (8'147 ns … 9'090 ns)  8'245 ns  9'090 ns  9'090 ns
js - simple      66'128 ns/iter    (62'899 ns … 401 µs) 64'500 ns 94'100 ns    163 µs
js               35'214 ns/iter    (34'399 ns … 220 µs) 34'600 ns 53'600 ns    121 µs
bufferutil        7'362 ns/iter   (7'240 ns … 8'005 ns)  7'362 ns  8'005 ns  8'005 ns

summary for mask - 64Kib
  wsm - wasm-simd
   1.81x faster than bufferutil
   2.04x faster than wsm
   8.67x faster than js
   16.28x faster than js - simple

• mask - 128Kib
------------------------------------------------------- -----------------------------
wsm - wasm-simd   8'120 ns/iter     (7'800 ns … 279 µs)  8'000 ns 11'300 ns 30'100 ns
wsm              16'668 ns/iter    (16'000 ns … 362 µs) 16'200 ns 29'900 ns 99'400 ns
js - simple         129 µs/iter       (126 µs … 629 µs)    126 µs    200 µs    449 µs
js               70'145 ns/iter    (68'800 ns … 490 µs) 68'900 ns 99'800 ns    221 µs
bufferutil       14'990 ns/iter    (14'500 ns … 253 µs) 14'600 ns 28'300 ns 82'700 ns

summary for mask - 128Kib
  wsm - wasm-simd
   1.85x faster than bufferutil
   2.05x faster than wsm
   8.64x faster than js
   15.85x faster than js - simple

• mask - 256Kib
------------------------------------------------------- -----------------------------
wsm - wasm-simd  16'529 ns/iter    (15'900 ns … 485 µs) 16'200 ns 24'400 ns 87'300 ns
wsm              33'147 ns/iter    (32'000 ns … 358 µs) 32'300 ns 57'100 ns    127 µs
js - simple         259 µs/iter     (251 µs … 1'157 µs)    253 µs    434 µs    784 µs
js                  142 µs/iter       (138 µs … 910 µs)    138 µs    237 µs    452 µs
bufferutil       29'675 ns/iter    (28'900 ns … 345 µs) 29'000 ns 45'600 ns    122 µs

summary for mask - 256Kib
  wsm - wasm-simd
   1.8x faster than bufferutil
   2.01x faster than wsm
   8.56x faster than js
   15.69x faster than js - simple

• mask - 1MiB
------------------------------------------------------- -----------------------------
wsm - wasm-simd  73'230 ns/iter    (69'700 ns … 468 µs) 72'000 ns    108 µs    227 µs
wsm                 133 µs/iter       (130 µs … 723 µs)    130 µs    218 µs    391 µs
js - simple       1'028 µs/iter   (1'006 µs … 1'774 µs)  1'013 µs  1'578 µs  1'774 µs
js                  570 µs/iter     (552 µs … 2'181 µs)    556 µs  1'002 µs  1'981 µs
bufferutil          119 µs/iter       (116 µs … 935 µs)    117 µs    168 µs    320 µs

summary for mask - 1MiB
  wsm - wasm-simd
   1.62x faster than bufferutil
   1.82x faster than wsm
   7.79x faster than js
   14.04x faster than js - simple

• mask - 8MiB
------------------------------------------------------- -----------------------------
wsm - wasm-simd     731 µs/iter     (647 µs … 1'929 µs)    732 µs  1'364 µs  1'929 µs
wsm               1'090 µs/iter   (1'053 µs … 1'721 µs)  1'082 µs  1'440 µs  1'721 µs
js - simple       8'245 µs/iter   (8'093 µs … 9'915 µs)  8'195 µs  9'915 µs  9'915 µs
js                4'565 µs/iter   (4'448 µs … 6'492 µs)  4'528 µs  5'766 µs  6'492 µs
bufferutil          953 µs/iter     (928 µs … 2'091 µs)    941 µs  1'424 µs  2'091 µs

summary for mask - 8MiB
  wsm - wasm-simd
   1.3x faster than bufferutil
   1.49x faster than wsm
   6.24x faster than js
   11.27x faster than js - simple

• mask - 16Mib
------------------------------------------------------- -----------------------------
wsm - wasm-simd   1'692 µs/iter   (1'555 µs … 2'800 µs)  1'706 µs  2'444 µs  2'800 µs
wsm               2'446 µs/iter  (2'220 µs … 22'886 µs)  2'323 µs  4'091 µs 22'886 µs
js - simple      16'823 µs/iter (16'379 µs … 18'950 µs) 17'022 µs 18'950 µs 18'950 µs
js                9'361 µs/iter  (9'037 µs … 13'540 µs)  9'292 µs 13'540 µs 13'540 µs
bufferutil        1'918 µs/iter   (1'863 µs … 2'976 µs)  1'900 µs  2'698 µs  2'976 µs

summary for mask - 16Mib
  wsm - wasm-simd
   1.13x faster than bufferutil
   1.45x faster than wsm
   5.53x faster than js
   9.95x faster than js - simple

• mask - 32Mib
------------------------------------------------------- -----------------------------
wsm - wasm-simd   4'076 µs/iter   (3'887 µs … 6'473 µs)  4'078 µs  6'236 µs  6'473 µs
wsm               4'797 µs/iter   (4'597 µs … 7'101 µs)  4'774 µs  6'708 µs  7'101 µs
js - simple      33'559 µs/iter (32'863 µs … 35'091 µs) 34'045 µs 35'091 µs 35'091 µs
js               18'519 µs/iter (18'215 µs … 20'449 µs) 18'598 µs 20'449 µs 20'449 µs
bufferutil        3'880 µs/iter   (3'758 µs … 5'101 µs)  3'868 µs  5'037 µs  5'101 µs

summary for mask - 32Mib
  bufferutil
   1.05x faster than wsm - wasm-simd
   1.24x faster than wsm
   4.77x faster than js
   8.65x faster than js - simple

• mask - 64Mib
------------------------------------------------------- -----------------------------
wsm - wasm-simd   8'477 µs/iter   (8'196 µs … 9'726 µs)  8'540 µs  9'726 µs  9'726 µs
wsm              10'047 µs/iter  (9'615 µs … 12'734 µs) 10'013 µs 12'734 µs 12'734 µs
js - simple      68'259 µs/iter (66'508 µs … 70'178 µs) 70'129 µs 70'178 µs 70'178 µs
js               38'430 µs/iter (36'946 µs … 42'639 µs) 39'156 µs 42'639 µs 42'639 µs
bufferutil        8'288 µs/iter  (7'528 µs … 11'742 µs)  9'002 µs 11'742 µs 11'742 µs

summary for mask - 64Mib
  bufferutil
   1.02x faster than wsm - wasm-simd
   1.21x faster than wsm
   4.64x faster than js
   8.24x faster than js - simple

• mask - 128Mib
------------------------------------------------------- -----------------------------
wsm - wasm-simd  17'252 µs/iter (16'550 µs … 19'804 µs) 17'613 µs 19'804 µs 19'804 µs
wsm              20'075 µs/iter (18'991 µs … 28'155 µs) 19'863 µs 28'155 µs 28'155 µs
js - simple         137 ms/iter       (133 ms … 141 ms)    138 ms    141 ms    141 ms
js               75'362 µs/iter (74'099 µs … 77'962 µs) 76'391 µs 77'962 µs 77'962 µs
bufferutil       15'828 µs/iter (15'083 µs … 18'207 µs) 16'272 µs 18'207 µs 18'207 µs

summary for mask - 128Mib
  bufferutil
   1.09x faster than wsm - wasm-simd
   1.27x faster than wsm
   4.76x faster than js
   8.67x faster than js - simple

• mask - 256Mib
------------------------------------------------------- -----------------------------
wsm - wasm-simd  34'474 µs/iter (33'553 µs … 38'064 µs) 34'594 µs 38'064 µs 38'064 µs
wsm              39'156 µs/iter (38'237 µs … 41'864 µs) 39'449 µs 41'864 µs 41'864 µs
js - simple         275 ms/iter       (267 ms … 282 ms)    282 ms    282 ms    282 ms
js                  152 ms/iter       (149 ms … 155 ms)    154 ms    155 ms    155 ms
bufferutil       31'799 µs/iter (30'844 µs … 36'459 µs) 31'383 µs 36'459 µs 36'459 µs

summary for mask - 256Mib
  bufferutil
   1.08x faster than wsm - wasm-simd
   1.23x faster than wsm
   4.79x faster than js
   8.65x faster than js - simple

• mask - 512Mib
------------------------------------------------------- -----------------------------
wsm - wasm-simd  67'600 µs/iter (66'899 µs … 69'858 µs) 68'419 µs 69'858 µs 69'858 µs
wsm              76'430 µs/iter (75'899 µs … 76'927 µs) 76'780 µs 76'927 µs 76'927 µs
js - simple         541 ms/iter       (537 ms … 545 ms)    545 ms    545 ms    545 ms
js                  305 ms/iter       (298 ms … 317 ms)    317 ms    317 ms    317 ms
bufferutil       61'476 µs/iter (60'989 µs … 62'282 µs) 61'791 µs 62'282 µs 62'282 µs

summary for mask - 512Mib
  bufferutil
   1.1x faster than wsm - wasm-simd
   1.24x faster than wsm
   4.96x faster than js
   8.8x faster than js - simple

• mask - 1Gib
------------------------------------------------------- -----------------------------
wsm - wasm-simd     142 ms/iter       (142 ms … 144 ms)    142 ms    144 ms    144 ms
wsm                 158 ms/iter       (154 ms … 162 ms)    158 ms    162 ms    162 ms
js - simple       1'075 ms/iter   (1'070 ms … 1'079 ms)  1'079 ms  1'079 ms  1'079 ms
js                  596 ms/iter       (595 ms … 596 ms)    596 ms    596 ms    596 ms
bufferutil          127 ms/iter       (124 ms … 128 ms)    128 ms    128 ms    128 ms

summary for mask - 1Gib
  bufferutil
   1.12x faster than wsm - wasm-simd
   1.25x faster than wsm
   4.7x faster than js
   8.48x faster than js - simple
```

### Running on LTS

- /benchmarks/mask.mjs

```text
cpu: AMD Ryzen 7 8845HS w/ Radeon 780M Graphics
runtime: node v22.16.0 (x64-win32)

benchmark            time (avg)             (min … max)       p75       p99      p999
------------------------------------------------------- -----------------------------
• mask - 4b
------------------------------------------------------- -----------------------------
wsm - wasm-simd   79.98 ns/iter    (64.7 ns … 6'687 ns)  66.55 ns    243 ns    919 ns
wsm               45.88 ns/iter    (41.6 ns … 1'025 ns)  42.24 ns    113 ns    385 ns
js - simple       22.19 ns/iter     (20.07 ns … 422 ns)  20.56 ns  40.53 ns    113 ns
js                20.91 ns/iter     (19.34 ns … 910 ns)  19.78 ns  36.96 ns  92.82 ns
bufferutil        83.21 ns/iter     (76.56 ns … 450 ns)  79.05 ns    162 ns    304 ns

summary for mask - 4b
  js
   1.06x faster than js - simple
   2.19x faster than wsm
   3.83x faster than wsm - wasm-simd
   3.98x faster than bufferutil

• mask - 32b
------------------------------------------------------- -----------------------------
wsm - wasm-simd   69.63 ns/iter     (62.74 ns … 404 ns)  63.96 ns    164 ns    302 ns
wsm               46.68 ns/iter     (43.12 ns … 630 ns)   43.7 ns    109 ns    277 ns
js - simple       48.39 ns/iter     (46.14 ns … 265 ns)  46.63 ns   89.5 ns    176 ns
js                35.34 ns/iter     (33.06 ns … 786 ns)  33.94 ns  61.18 ns    136 ns
bufferutil        83.24 ns/iter     (76.95 ns … 591 ns)     79 ns    176 ns    503 ns

summary for mask - 32b
  js
   1.32x faster than wsm
   1.37x faster than js - simple
   1.97x faster than wsm - wasm-simd
   2.36x faster than bufferutil

• mask - 64b
------------------------------------------------------- -----------------------------
wsm - wasm-simd   74.04 ns/iter     (66.75 ns … 922 ns)  68.16 ns    152 ns    347 ns
wsm               51.44 ns/iter     (47.36 ns … 385 ns)     48 ns    119 ns    221 ns
js - simple       81.34 ns/iter     (77.29 ns … 601 ns)  77.78 ns    146 ns    265 ns
js                52.86 ns/iter      (50.2 ns … 351 ns)  51.12 ns  93.12 ns    185 ns
bufferutil        83.35 ns/iter     (78.27 ns … 529 ns)  80.76 ns    145 ns    342 ns

summary for mask - 64b
  wsm
   1.03x faster than js
   1.44x faster than wsm - wasm-simd
   1.58x faster than js - simple
   1.62x faster than bufferutil

• mask - 16Kib
------------------------------------------------------- -----------------------------
wsm - wasm-simd   1'272 ns/iter   (1'210 ns … 2'167 ns)  1'235 ns  2'165 ns  2'167 ns
wsm               2'054 ns/iter   (2'000 ns … 2'963 ns)  2'042 ns  2'838 ns  2'963 ns
js - simple      16'516 ns/iter    (15'700 ns … 288 µs) 16'100 ns 28'200 ns 78'100 ns
js                8'833 ns/iter  (8'616 ns … 10'218 ns)  8'851 ns 10'218 ns 10'218 ns
bufferutil        2'045 ns/iter   (1'995 ns … 2'616 ns)  2'033 ns  2'608 ns  2'616 ns

summary for mask - 16Kib
  wsm - wasm-simd
   1.61x faster than bufferutil
   1.62x faster than wsm
   6.95x faster than js
   12.99x faster than js - simple

• mask - 64Kib
------------------------------------------------------- -----------------------------
wsm - wasm-simd   5'459 ns/iter   (5'334 ns … 6'715 ns)  5'415 ns  6'715 ns  6'715 ns
wsm               8'340 ns/iter     (7'999 ns … 214 µs)  8'100 ns 14'000 ns 33'300 ns
js - simple      65'506 ns/iter    (62'699 ns … 698 µs) 62'900 ns    113 µs    360 µs
js               35'619 ns/iter    (34'399 ns … 380 µs) 34'500 ns 62'500 ns    142 µs
bufferutil        7'606 ns/iter     (7'300 ns … 246 µs)  7'400 ns 10'900 ns 35'700 ns

summary for mask - 64Kib
  wsm - wasm-simd
   1.39x faster than bufferutil
   1.53x faster than wsm
   6.53x faster than js
   12x faster than js - simple

• mask - 128Kib
------------------------------------------------------- -----------------------------
wsm - wasm-simd  11'431 ns/iter  (10'800 ns … 1'151 µs) 11'000 ns 17'000 ns 53'300 ns
wsm              16'781 ns/iter    (16'100 ns … 331 µs) 16'300 ns 28'600 ns 84'900 ns
js - simple         134 µs/iter     (126 µs … 1'672 µs)    126 µs    237 µs    488 µs
js               71'683 ns/iter    (68'800 ns … 742 µs) 69'000 ns    126 µs    367 µs
bufferutil       15'543 ns/iter    (14'600 ns … 506 µs) 14'900 ns 22'700 ns 74'000 ns

summary for mask - 128Kib
  wsm - wasm-simd
   1.36x faster than bufferutil
   1.47x faster than wsm
   6.27x faster than js
   11.76x faster than js - simple

• mask - 256Kib
------------------------------------------------------- -----------------------------
wsm - wasm-simd  22'364 ns/iter  (21'200 ns … 1'201 µs) 21'300 ns 33'800 ns    136 µs
wsm              32'848 ns/iter    (31'700 ns … 317 µs) 31'900 ns 56'200 ns    137 µs
js - simple         262 µs/iter     (251 µs … 1'071 µs)    251 µs    466 µs    908 µs
js                  141 µs/iter       (137 µs … 600 µs)    137 µs    246 µs    346 µs
bufferutil       30'483 ns/iter  (28'800 ns … 1'261 µs) 29'000 ns 48'400 ns    169 µs

summary for mask - 256Kib
  wsm - wasm-simd
   1.36x faster than bufferutil
   1.47x faster than wsm
   6.31x faster than js
   11.7x faster than js - simple

• mask - 1MiB
------------------------------------------------------- -----------------------------
wsm - wasm-simd  98'091 ns/iter    (92'800 ns … 907 µs) 95'200 ns    179 µs    371 µs
wsm                 132 µs/iter       (130 µs … 587 µs)    131 µs    178 µs    340 µs
js - simple       1'027 µs/iter   (1'006 µs … 2'207 µs)  1'013 µs  1'393 µs  2'207 µs
js                  562 µs/iter     (552 µs … 1'383 µs)    556 µs    773 µs  1'354 µs
bufferutil          129 µs/iter       (116 µs … 742 µs)    125 µs    262 µs    587 µs

summary for mask - 1MiB
  wsm - wasm-simd
   1.31x faster than bufferutil
   1.35x faster than wsm
   5.73x faster than js
   10.47x faster than js - simple

• mask - 8MiB
------------------------------------------------------- -----------------------------
wsm - wasm-simd     949 µs/iter     (839 µs … 2'100 µs)    966 µs  1'462 µs  2'100 µs
wsm               1'103 µs/iter   (1'059 µs … 2'458 µs)  1'084 µs  1'764 µs  2'458 µs
js - simple       8'320 µs/iter  (8'097 µs … 10'595 µs)  8'261 µs 10'595 µs 10'595 µs
js                4'562 µs/iter   (4'448 µs … 5'765 µs)  4'529 µs  5'619 µs  5'765 µs
bufferutil          959 µs/iter     (933 µs … 1'779 µs)    947 µs  1'297 µs  1'779 µs

summary for mask - 8MiB
  wsm - wasm-simd
   1.01x faster than bufferutil
   1.16x faster than wsm
   4.81x faster than js
   8.77x faster than js - simple

• mask - 16Mib
------------------------------------------------------- -----------------------------
wsm - wasm-simd   2'216 µs/iter   (1'959 µs … 3'226 µs)  2'259 µs  2'981 µs  3'226 µs
wsm               2'335 µs/iter   (2'231 µs … 4'228 µs)  2'302 µs  3'436 µs  4'228 µs
js - simple      16'565 µs/iter (16'308 µs … 17'194 µs) 16'708 µs 17'194 µs 17'194 µs
js                9'142 µs/iter  (9'023 µs … 10'248 µs)  9'164 µs 10'248 µs 10'248 µs
bufferutil        1'903 µs/iter   (1'860 µs … 2'571 µs)  1'893 µs  2'455 µs  2'571 µs

summary for mask - 16Mib
  bufferutil
   1.16x faster than wsm - wasm-simd
   1.23x faster than wsm
   4.8x faster than js
   8.7x faster than js - simple

• mask - 32Mib
------------------------------------------------------- -----------------------------
wsm - wasm-simd   4'774 µs/iter   (4'608 µs … 6'378 µs)  4'730 µs  5'943 µs  6'378 µs
wsm               4'789 µs/iter   (4'627 µs … 6'945 µs)  4'754 µs  6'934 µs  6'945 µs
js - simple      33'283 µs/iter (32'807 µs … 34'222 µs) 33'536 µs 34'222 µs 34'222 µs
js               18'386 µs/iter (18'170 µs … 19'067 µs) 18'492 µs 19'067 µs 19'067 µs
bufferutil        3'890 µs/iter   (3'753 µs … 5'761 µs)  3'866 µs  5'439 µs  5'761 µs

summary for mask - 32Mib
  bufferutil
   1.23x faster than wsm - wasm-simd
   1.23x faster than wsm
   4.73x faster than js
   8.56x faster than js - simple

• mask - 64Mib
------------------------------------------------------- -----------------------------
wsm - wasm-simd   9'809 µs/iter  (9'646 µs … 10'569 µs)  9'829 µs 10'569 µs 10'569 µs
wsm               9'799 µs/iter  (9'564 µs … 11'598 µs)  9'804 µs 11'598 µs 11'598 µs
js - simple      66'816 µs/iter (65'893 µs … 67'556 µs) 67'418 µs 67'556 µs 67'556 µs
js               37'238 µs/iter (36'704 µs … 38'126 µs) 37'484 µs 38'126 µs 38'126 µs
bufferutil        7'786 µs/iter   (7'635 µs … 8'701 µs)  7'799 µs  8'701 µs  8'701 µs

summary for mask - 64Mib
  bufferutil
   1.26x faster than wsm
   1.26x faster than wsm - wasm-simd
   4.78x faster than js
   8.58x faster than js - simple

• mask - 128Mib
------------------------------------------------------- -----------------------------
wsm - wasm-simd  19'901 µs/iter (19'413 µs … 21'702 µs) 20'294 µs 21'702 µs 21'702 µs
wsm              19'481 µs/iter (19'046 µs … 20'932 µs) 19'824 µs 20'932 µs 20'932 µs
js - simple         133 ms/iter       (132 ms … 134 ms)    133 ms    134 ms    134 ms
js               74'351 µs/iter (73'379 µs … 75'247 µs) 75'142 µs 75'247 µs 75'247 µs
bufferutil       15'552 µs/iter (15'322 µs … 16'362 µs) 15'560 µs 16'362 µs 16'362 µs

summary for mask - 128Mib
  bufferutil
   1.25x faster than wsm
   1.28x faster than wsm - wasm-simd
   4.78x faster than js
   8.53x faster than js - simple

• mask - 256Mib
------------------------------------------------------- -----------------------------
wsm - wasm-simd  39'247 µs/iter (38'937 µs … 40'114 µs) 39'335 µs 40'114 µs 40'114 µs
wsm              38'389 µs/iter (37'732 µs … 39'710 µs) 39'101 µs 39'710 µs 39'710 µs
js - simple         265 ms/iter       (265 ms … 266 ms)    266 ms    266 ms    266 ms
js                  147 ms/iter       (147 ms … 148 ms)    148 ms    148 ms    148 ms
bufferutil       30'934 µs/iter (30'433 µs … 31'887 µs) 31'197 µs 31'887 µs 31'887 µs

summary for mask - 256Mib
  bufferutil
   1.24x faster than wsm
   1.27x faster than wsm - wasm-simd
   4.77x faster than js
   8.58x faster than js - simple

• mask - 512Mib
------------------------------------------------------- -----------------------------
wsm - wasm-simd  80'910 µs/iter (79'777 µs … 83'530 µs) 81'072 µs 83'530 µs 83'530 µs
wsm              75'945 µs/iter (75'108 µs … 76'558 µs) 76'491 µs 76'558 µs 76'558 µs
js - simple         541 ms/iter       (532 ms … 550 ms)    550 ms    550 ms    550 ms
js                  297 ms/iter       (294 ms … 300 ms)    300 ms    300 ms    300 ms
bufferutil       61'369 µs/iter (60'636 µs … 62'352 µs) 61'524 µs 62'352 µs 62'352 µs

summary for mask - 512Mib
  bufferutil
   1.24x faster than wsm
   1.32x faster than wsm - wasm-simd
   4.83x faster than js
   8.82x faster than js - simple

• mask - 1Gib
------------------------------------------------------- -----------------------------
wsm - wasm-simd     159 ms/iter       (159 ms … 160 ms)    160 ms    160 ms    160 ms
wsm                 153 ms/iter       (150 ms … 159 ms)    154 ms    159 ms    159 ms
js - simple       1'071 ms/iter   (1'066 ms … 1'076 ms)  1'076 ms  1'076 ms  1'076 ms
js                  595 ms/iter       (593 ms … 596 ms)    596 ms    596 ms    596 ms
bufferutil          124 ms/iter       (123 ms … 125 ms)    125 ms    125 ms    125 ms

summary for mask - 1Gib
  bufferutil
   1.23x faster than wsm
   1.28x faster than wsm - wasm-simd
   4.79x faster than js
   8.63x faster than js - simple
```
