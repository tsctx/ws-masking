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
clk: ~3.27 GHz
cpu: AMD Ryzen 7 8845HS w/ Radeon 780M Graphics
runtime: node 25.2.0 (x64-win32)

benchmark                   avg (min … max) p75 / p99    (min … top 1%)
------------------------------------------- -------------------------------
• 4b
------------------------------------------- -------------------------------
wasm-simd                    471.17 ns/iter 496.12 ns     ▇█
                      (370.34 ns … 1.24 µs) 788.67 ns  ▂▇▅███▆
                    (  3.55  b … 952.14  b)  73.25  b ▄███████▅▁▃▂▁▁▂▁▁▁▁▁▁

wsm                          811.16 ns/iter 812.28 ns    █
                      (727.32 ns … 1.56 µs)   1.16 µs   ██▄
                    (  0.03  b … 250.78  b)   3.59  b ▂▆███▄▃▆▂▂▁▁▁▂▁▁▁▁▁▁▁

js - simple                  448.39 ns/iter 465.89 ns        ██
                    (352.93 ns … 822.88 ns) 592.72 ns       ▂███▃▃
                    ( 15.79  b … 363.90  b)  65.99  b ▂▄▄▅▄▆██████▅▃▂▁▁▁▁▁▁

js                           442.62 ns/iter 459.96 ns          █▂
                    (350.05 ns … 861.21 ns) 542.65 ns         ▅██▃
                    ( 15.79  b … 746.27  b)  70.92  b ▂▂▃▅▄▅▅▅█████▇▇▅▂▁▁▁▁

bufferutil                     1.01 µs/iter   1.02 µs    █▃
                      (928.00 ns … 1.58 µs)   1.31 µs   ▇██
                    (  0.00  b … 362.62  b)   4.87  b ▁▄████▄▄▅▃▂▁▁▁▁▁▁▁▂▁▁

no mask                      350.91 ns/iter 387.08 ns              ▃█▄     
                     (86.18 ns … 512.96 ns) 475.95 ns              ███▄    
                    ( 24.13  b … 441.65  b)  48.29  b ▁▁▃▂▂▂▂▂▃▃▂▇██████▅▃▂

summary
  no mask
   1.26x faster than js
   1.28x faster than js - simple
   1.34x faster than wasm-simd
   2.31x faster than wsm
   2.88x faster than bufferutil

• 64b
------------------------------------------- -------------------------------
wasm-simd                    920.68 ns/iter 919.36 ns    █
                      (835.74 ns … 1.65 µs)   1.25 µs   ▆█▃
                    (  0.03  b … 433.73  b)   4.64  b ▂▃███▅▃▃▂▂▂▁▁▁▁▁▁▁▁▁▁

wsm                          923.00 ns/iter 925.37 ns   █▂
                      (826.20 ns … 1.79 µs)   1.51 µs   ██
                    (  0.03  b … 436.83  b)   5.69  b ▄███▅▃▂▁▁▂▁▁▁▂▁▁▁▁▁▁▁

js - simple                  943.42 ns/iter 939.92 ns    █
                      (847.61 ns … 1.78 µs)   1.38 µs   ██
                    (  0.00  b … 329.81  b)   4.25  b ▂▅██▆▃▄▂▂▂▁▁▂▁▁▁▁▁▁▁▁

js                           893.09 ns/iter 892.21 ns   █
                      (815.48 ns … 1.88 µs)   1.32 µs  ▂██
                    (  0.06  b … 330.25  b)   5.38  b ▃███▃▃▃▂▁▁▁▁▁▁▁▁▁▁▁▁▁

bufferutil                     1.13 µs/iter   1.13 µs  █▄
                        (1.05 µs … 1.94 µs)   1.75 µs  ██
                    (  0.00  b … 329.81  b)   5.39  b ▆██▆▅▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁

no mask                      718.18 ns/iter 720.14 ns     █
                      (603.03 ns … 1.72 µs)   1.13 µs    ██
                    (  0.04  b … 135.22  b)   2.33  b ▁▅███▇▃▄▂▂▁▁▁▁▂▁▁▁▁▁▁

summary
  no mask
   1.24x faster than js
   1.28x faster than wasm-simd
   1.29x faster than wsm
   1.31x faster than js - simple
   1.58x faster than bufferutil

• 16Kib
------------------------------------------- -------------------------------
wasm-simd                     11.24 µs/iter  11.30 µs █
                      (10.94 µs … 11.92 µs)  11.86 µs █   ▇▂▂▇▂ ▂         ▂
                    (  0.03  b … 538.23  b)  55.89  b █▆▆▆█████▁█▁▁▆▁▁▁▁▁▁█

wsm                           12.41 µs/iter  12.54 µs  ▃       █
                      (11.91 µs … 13.95 µs)  13.33 µs  █▇     ▇█
                    (  0.29  b … 681.66  b)  73.32  b ▆██▆▆▆▁▁██▆▁▁▆▁▁▁▁▁▁▆

js - simple                   29.95 µs/iter  29.84 µs      █
                      (28.77 µs … 32.95 µs)  31.46 µs      ██
                    (  0.33  b … 571.76  b)  97.57  b ██▁▁▁████▁▁▁█▁▁▁▁▁▁▁█

js                            20.27 µs/iter  20.58 µs              █       
                      (19.26 µs … 21.03 µs)  20.84 µs ▅▅       ▅▅  █▅▅▅▅▅ ▅
                    (  0.13  b … 573.89  b)  67.38  b ██▁▁▁▁▁▁▁██▁▁██████▁█

bufferutil                    11.23 µs/iter  11.30 µs       █▂ ▂▂
                      (10.68 µs … 11.89 µs)  11.87 µs ▅     ██▅██   ▅     ▅
                    (  0.28  b …   2.79  b)   1.72  b █▇▁▁▁▇█████▁▇▇█▁▁▁▁▁█

no mask                       10.20 µs/iter  10.37 µs       ▂    █
                       (9.73 µs … 10.75 µs)  10.71 µs  ▅ ▅  █ ▅ ▅█ ▅ ▅  ▅
                    (  0.03  b … 167.71  b)  14.26  b ▇█▇█▁▇█▇█▇██▁█▁█▁▇█▁▇

summary
  no mask
   1.1x faster than bufferutil
   1.1x faster than wasm-simd
   1.22x faster than wsm
   1.99x faster than js
   2.94x faster than js - simple

• 64Kib
------------------------------------------- -------------------------------
wasm-simd                     40.24 µs/iter  40.64 µs █ ███ █ ██ █ █   █  █
                      (38.70 µs … 43.06 µs)  41.68 µs █ ███ █ ██ █ █   █  █
                    (  0.08  b … 140.24  b)  47.59  b █▁███▁█▁██▁█▁█▁▁▁█▁▁█

wsm                           42.46 µs/iter  43.83 µs             █     █  
                      (39.38 µs … 45.81 µs)  44.41 µs ▅▅ ▅  ▅     █  ▅ ▅█ ▅
                    (  2.95  b … 124.44  b)  32.60  b ██▁█▁▁█▁▁▁▁▁█▁▁█▁██▁█

js - simple                  160.57 µs/iter 189.50 µs          █  ▇        
                     (83.20 µs … 295.00 µs) 266.00 µs         ██  █
                    (  0.99 kb …  55.73 kb)   1.11 kb ▄█▂█▅▂▁▄██▃██▃▁▂▂▂▁▁▁

js                            94.96 µs/iter 122.70 µs       █     ▆        
                     (45.10 µs … 196.90 µs) 181.80 µs ▃   ▂▄██   ██
                    (  0.99 kb … 100.12 kb)   1.13 kb █▄▁▂████▂▂▂██▃▁▁▁▁▁▁▁

bufferutil                    39.78 µs/iter  61.00 µs  █
                     (14.10 µs … 120.00 µs) 103.20 µs  █
                    (  0.99 kb …   1.23 kb)   0.99 kb ▆█▄▃▁▁▃▃▂▃██▆▂▂▁▁▁▁▁▁

no mask                       33.09 µs/iter  35.48 µs            █
                      (26.89 µs … 37.52 µs)  35.91 µs            █        █
                    (  0.19  b …  56.19  b)  21.61  b █▁▁▁▁█▁▁▁▁▁██▁▁▁█▁███

summary
  no mask
   1.2x faster than bufferutil
   1.22x faster than wasm-simd
   1.28x faster than wsm
   2.87x faster than js
   4.85x faster than js - simple

• 128Kib
------------------------------------------- -------------------------------
wasm-simd                     32.75 µs/iter  33.78 µs   █
                      (26.08 µs … 51.22 µs)  44.85 µs   █   █ █
                    (  0.58  b …  85.20  b)  36.76  b ████▁▁█▁█▁▁▁▁▁▁▁▁▁▁▁█

wsm                           37.14 µs/iter  38.91 µs              ██  █   
                      (30.21 µs … 44.65 µs)  40.45 µs ▅    ▅   ▅ ▅ ██  █  ▅
                    (  4.51  b …  35.89  b)  13.75  b █▁▁▁▁█▁▁▁█▁█▁██▁▁█▁▁█

js - simple                  283.96 µs/iter 324.10 µs             █        
                    (161.40 µs … 485.80 µs) 426.20 µs         ▅   █▂
                    (  0.99 kb …   1.23 kb)   0.99 kb ▅▃▇▂▁▁▂██▇▄▅██▁▁▂▁▁▁▁

js                           166.53 µs/iter 196.80 µs          █  ▇        
                     (85.60 µs … 393.20 µs) 274.00 µs         ██  █
                    (  0.99 kb …   0.99 kb)   0.99 kb ▄█▂▇▆▃▁▃██▃▅█▅▂▂▃▂▁▁▁

bufferutil                    29.73 µs/iter  31.40 µs █        █
                      (24.70 µs … 38.50 µs)  35.17 µs █▅▅     ▅█ ▅ ▅   ▅  ▅
                    (  7.65  b …  31.46  b)  17.28  b ███▁▁▁▁▁██▁█▁█▁▁▁█▁▁█

no mask                       17.47 µs/iter  17.51 µs  █
                      (15.80 µs … 21.75 µs)  20.94 µs  █     ▂
                    (  0.69  b …  31.88  b)   6.30  b ▆█▆▁▆▆▆█▁▁▁▁▁▁▁▁▁▁▆▁▆

summary
  no mask
   1.7x faster than bufferutil
   1.87x faster than wasm-simd
   2.13x faster than wsm
   9.53x faster than js
   16.25x faster than js - simple

• 256Kib
------------------------------------------- -------------------------------
wasm-simd                     45.84 µs/iter  45.92 µs  █
                      (41.36 µs … 56.96 µs)  56.18 µs ██  █
                    (  1.03  b …  60.83  b)  17.99  b ███▁█▁█▁▁▁▁▁█▁▁▁▁▁▁▁█

wsm                           91.74 µs/iter 116.20 µs      ▃█
                     (44.80 µs … 232.10 µs) 166.40 µs      ██     ▂▂
                    (736.00  b …  65.39 kb)   1.01 kb ▂▄▄▃▄██▆▃▃▃▅██▄▂▂▂▁▁▁

js - simple                  492.79 µs/iter 600.60 µs                █     
                      (318.80 µs … 1.06 ms) 694.10 µs                █
                    (632.00  b …   4.58 kb) 635.47  b ▅▅▅▂▃██▆▇▃▁▂▂▂▃█▅▁▁▁▁

js                           294.13 µs/iter 339.40 µs              █       
                    (165.10 µs … 538.40 µs) 443.00 µs       ▂▄  ▃ ██
                    (632.00  b … 632.00  b) 632.00  b ▅▆▅▅▁▂███▆█▅██▃▂▂▂▂▂▁

bufferutil                    48.39 µs/iter  46.58 µs █
                      (44.69 µs … 62.38 µs)  59.44 µs █▂
                    (  0.19  b …  28.03  b)   5.78  b ██▆▆▁▁▁▁▁▆▁▁▁▁▁▁▁▁▁▁▆

no mask                       31.38 µs/iter  31.05 µs   █
                      (27.33 µs … 43.65 µs)  40.01 µs  ██
                    (  0.03  b …   6.84  b)   2.92  b ███▁███▁█▁▁▁▁▁▁▁▁▁▁▁█

summary
  no mask
   1.46x faster than wasm-simd
   1.54x faster than bufferutil
   2.92x faster than wsm
   9.37x faster than js
   15.71x faster than js - simple

• 16Mib
------------------------------------------- -------------------------------
wasm-simd                      3.91 ms/iter   3.94 ms   ▅█▅
                        (3.55 ms … 5.69 ms)   5.49 ms  ▄███
                    ( 26.62 kb …  26.62 kb)  26.62 kb ▃████▃▄▂▃▂▂▁▁▁▁▂▁▁▂▁▁

wsm                            3.97 ms/iter   4.01 ms   █▃▇
                        (3.64 ms … 5.65 ms)   5.44 ms  ████
                    (736.00  b … 976.00  b) 736.86  b ▃█████▃▄▂▂▁▁▁▁▁▁▂▁▁▁▁

js - simple                   23.17 ms/iter  23.56 ms  █
                      (21.70 ms … 29.23 ms)  27.02 ms ▇██ █▂
                    (632.00  b … 632.00  b) 632.00  b ██████▃█▃▁█▃▁▁▁▃▃▃▃▃▃

js                            12.43 ms/iter  12.52 ms   █▃
                      (11.71 ms … 15.70 ms)  15.29 ms ▂███▃
                    (632.00  b … 632.00  b) 632.00  b █████▄▃▅▄▇▃▂▂▂▂▁▁▁▁▁▂

bufferutil                     4.29 ms/iter   4.37 ms  █
                        (3.90 ms … 6.72 ms)   6.09 ms  █ ▆█
                    (632.00  b … 632.00  b) 632.00  b ▇█▆██▇▄▃▃▃▂▁▁▁▁▂▁▁▁▁▁

no mask                        2.07 ms/iter   2.12 ms   █ ▃
                        (1.82 ms … 3.56 ms)   3.08 ms  ▆█ █▆
                    (304.00  b … 304.00  b) 304.00  b ▄██▄██▆▃▃▂▂▂▁▁▂▁▁▁▁▂▁

summary
  no mask
   1.89x faster than wasm-simd
   1.92x faster than wsm
   2.07x faster than bufferutil
   5.99x faster than js
   11.18x faster than js - simple

• 32Mib
------------------------------------------- -------------------------------
wasm-simd                      7.85 ms/iter   7.97 ms  ▅ █
                       (7.28 ms … 10.32 ms)   9.62 ms  █ █
                    ( 52.62 kb …  52.62 kb)  52.62 kb ▇█████▇▃▃▄▄▂▂▃▂▂▂▃▂▂▂

wsm                            7.90 ms/iter   7.92 ms  ▃▂█
                       (7.44 ms … 11.46 ms)  10.11 ms  ███▂
                    (736.00  b … 736.00  b) 736.00  b ▅████▃▃▃▁▁▂▁▁▁▂▁▂▁▂▁▂

js - simple                   46.63 ms/iter  47.50 ms  █▂█
                      (43.78 ms … 52.91 ms)  52.42 ms  ███▅  ▅       ▅
                    (632.00  b … 632.00  b) 632.00  b ▇████▇▇█▁▇▁▇▁▁▁█▁▁▇▁▇

js                            25.67 ms/iter  25.80 ms  █
                      (23.77 ms … 32.95 ms)  31.60 ms ▃█▆ ▅
                    (632.00  b … 632.00  b) 632.00  b ███▇█▅▃▃▃▃▃▁▃▁▃▅▁▃▁▁▃

bufferutil                     8.67 ms/iter   8.78 ms  ▄ █
                       (7.96 ms … 11.16 ms)  10.78 ms  █ ██
                    (632.00  b … 632.00  b) 632.00  b ██▇██▅▆▂▅▄▃▂▃▁▃▃▃▁▃▁▃

no mask                        4.12 ms/iter   4.12 ms  ▃▂█
                        (3.75 ms … 6.18 ms)   5.66 ms  ███▂
                    (304.00  b … 304.00  b) 304.00  b ▄████▄▃▂▃▅▃▂▁▂▂▁▁▁▁▁▂

summary
  no mask
   1.9x faster than wasm-simd
   1.92x faster than wsm
   2.1x faster than bufferutil
   6.23x faster than js
   11.31x faster than js - simple

• 64Mib
------------------------------------------- -------------------------------
wasm-simd                     17.12 ms/iter  17.52 ms     █▆ ▃
                      (14.93 ms … 21.60 ms)  20.82 ms     ██ █▅▃▃
                    ( 40.74 kb … 104.62 kb)  72.68 kb ▃▃▁▃███████▃▃█▄▁▃▁▁▁▃

wsm                           17.73 ms/iter  18.90 ms   ▃     █
                      (15.21 ms … 21.20 ms)  21.18 ms  ▃█▃▃▃ ▃█  ▆      ▃
                    (736.00  b … 736.00  b) 736.00  b ██████▆█████▄█▆▆▆▄█▆▄

js - simple                   91.44 ms/iter  91.46 ms         █
                      (90.13 ms … 94.07 ms)  93.24 ms ▅▅ ▅▅▅▅ █▅   ▅      ▅
                    (632.00  b … 632.00  b) 632.00  b ██▁████▁██▁▁▁█▁▁▁▁▁▁█

js                            50.96 ms/iter  51.59 ms          █
                      (48.46 ms … 54.60 ms)  54.26 ms ▂▂▇     ▂█    ▂    ▂
                    (600.00  b … 632.00  b) 630.40  b ███▁▁▁▆▆██▁▆▁▁█▁▁▁▁█▆

bufferutil                    19.40 ms/iter  21.21 ms   █ ▃
                      (16.45 ms … 24.29 ms)  24.28 ms ▃ █▃█▃▆▃     ▃   ▃
                    (632.00  b … 632.00  b) 632.00  b ████████▆▄█▄██▄▁▄█▆▁▆

no mask                       10.23 ms/iter  10.96 ms     ▃   █
                       (7.82 ms … 14.79 ms)  14.20 ms ▄ ▃▆█   █▄     ▃
                    (272.00  b … 304.00  b) 303.68  b █▅████▆▆██▅▂▃▂▅██▁▂▃▃

summary
  no mask
   1.67x faster than wasm-simd
   1.73x faster than wsm
   1.9x faster than bufferutil
   4.98x faster than js
   8.93x faster than js - simple

• 128Mib
------------------------------------------- -------------------------------
wasm-simd                     34.23 ms/iter  34.83 ms       ▂█ █▂ █        
                      (31.99 ms … 39.42 ms)  36.69 ms ▅▅▅   ██▅██▅█     ▅ ▅
                    ( 62.98 kb …  63.73 kb)  63.43 kb ███▇▇▁███████▁▁▁▇▁█▇█

wsm                           37.15 ms/iter  39.19 ms         ▂ ▂ ▂ █      
                      (30.86 ms … 42.05 ms)  41.08 ms         █▅█▅█ █▅▅▅▅ ▅
                    (736.00  b … 736.00  b) 736.00  b ▇▁▇▁▁▇▇▁█████▇█████▁█

js - simple                  189.10 ms/iter 193.78 ms █
                    (180.10 ms … 202.74 ms) 195.93 ms █  ▅ ▅  ▅▅▅     ▅▅ ▅▅
                    (632.00  b … 632.00  b) 632.00  b █▁▁█▁█▁▁███▁▁▁▁▁██▁██

js                           112.94 ms/iter 114.59 ms                █     
                    (103.68 ms … 117.45 ms) 117.37 ms ▅       ▅    ▅▅█▅   ▅
                    (600.00  b … 632.00  b) 629.33  b █▁▁▁▁▁▁▁█▁▁▁▁████▁▁▁█

bufferutil                    39.07 ms/iter  40.41 ms   ▂     █▂
                      (32.38 ms … 55.52 ms)  48.25 ms ▅▅█ ▅▅  ██▅       ▅
                    (632.00  b … 632.00  b) 632.00  b ███▇██▇▇███▁▇▇▁▇▁▇█▁▇

no mask                       20.77 ms/iter  23.11 ms  █      ▃
                      (16.33 ms … 26.41 ms)  25.94 ms  █      ██      ▂
                    (304.00  b … 304.00  b) 304.00  b ▃█▁▁█▆█▃██▆██▁▆▃█▆▆█▃

summary
  no mask
   1.65x faster than wasm-simd
   1.79x faster than wsm
   1.88x faster than bufferutil
   5.44x faster than js
   9.1x faster than js - simple

• 256Mib
------------------------------------------- -------------------------------
wasm-simd                     68.47 ms/iter  70.67 ms  █ █  █ █    █       
                      (64.10 ms … 74.19 ms)  72.97 ms ▅█ █  █ █   ▅█ ▅ ▅ ▅▅
                    ( 60.96 kb …  63.01 kb)  62.23 kb ██▁█▁▁█▁█▁▁▁██▁█▁█▁██

wsm                           71.87 ms/iter  73.29 ms     █   █
                      (68.46 ms … 78.52 ms)  77.05 ms  █  █   █  █
                    (736.00  b … 736.00  b) 736.00  b ██▁██▁▁██▁▁█▁█▁▁▁▁▁▁█

js - simple                  368.78 ms/iter 372.30 ms                 ██   
                    (350.26 ms … 400.62 ms) 376.69 ms ▅▅       ▅ ▅▅▅  ██  ▅
                    (632.00  b … 632.00  b) 632.00  b ██▁▁▁▁▁▁▁█▁███▁▁██▁▁█

js                           208.04 ms/iter 214.81 ms      █   █      █   █
                    (197.02 ms … 217.87 ms) 215.76 ms ▅▅   █   █      █  ▅█
                    (632.00  b … 632.00  b) 632.00  b ██▁▁▁█▁▁▁█▁▁▁▁▁▁█▁▁██

bufferutil                    77.64 ms/iter  79.44 ms              █       
                      (70.02 ms … 86.35 ms)  84.69 ms █     █   █  █      █
                    (632.00  b … 632.00  b) 632.00  b █▁▁▁█▁█▁▁██▁▁█▁▁▁▁▁▁█

no mask                       42.32 ms/iter  45.93 ms   █   ▂    █
                      (35.26 ms … 54.31 ms)  54.13 ms ▅ █  ▅█    █▅
                    (304.00  b … 304.00  b) 304.00  b █▇█▇▇██▇▇▇▁██▇▇▁▁▁▁▁▇

summary
  no mask
   1.62x faster than wasm-simd
   1.7x faster than wsm
   1.83x faster than bufferutil
   4.92x faster than js
   8.71x faster than js - simple
```

- /benchmarks/mask.mjs

```text
cpu: AMD Ryzen 7 8845HS w/ Radeon 780M Graphics
runtime: node v25.2.0 (x64-win32)

benchmark            time (avg)             (min … max)       p75       p99      p999
------------------------------------------------------- -----------------------------
• mask - 4b
------------------------------------------------------- -----------------------------
wsm - wasm-simd    39.9 ns/iter     (36.13 ns … 379 ns)  36.96 ns  90.14 ns    207 ns
wsm               48.45 ns/iter     (45.07 ns … 474 ns)  45.85 ns    108 ns    219 ns
js - simple       21.46 ns/iter     (20.46 ns … 149 ns)  20.65 ns   39.5 ns  74.32 ns
js                 21.6 ns/iter     (20.56 ns … 435 ns)   20.8 ns  39.11 ns  83.94 ns
bufferutil         84.7 ns/iter      (79.1 ns … 342 ns)  80.37 ns    149 ns    225 ns

summary for mask - 4b
  js - simple
   1.01x faster than js
   1.86x faster than wsm - wasm-simd
   2.26x faster than wsm
   3.95x faster than bufferutil

• mask - 32b
------------------------------------------------------- -----------------------------
wsm - wasm-simd   45.57 ns/iter     (42.33 ns … 303 ns)  43.07 ns  94.24 ns    156 ns
wsm               50.54 ns/iter      (45.9 ns … 723 ns)  46.83 ns    115 ns    296 ns
js - simple       45.18 ns/iter     (42.43 ns … 196 ns)   43.6 ns  78.96 ns    182 ns
js                36.15 ns/iter     (33.79 ns … 229 ns)  35.01 ns  63.43 ns    113 ns
bufferutil        81.75 ns/iter     (77.49 ns … 610 ns)     79 ns    139 ns    354 ns

summary for mask - 32b
  js
   1.25x faster than js - simple
   1.26x faster than wsm - wasm-simd
   1.4x faster than wsm
   2.26x faster than bufferutil

• mask - 64b
------------------------------------------------------- -----------------------------
wsm - wasm-simd   49.38 ns/iter     (45.17 ns … 963 ns)     46 ns    105 ns    234 ns
wsm               55.18 ns/iter    (50.1 ns … 2'950 ns)  50.83 ns    126 ns    356 ns
js - simple        73.3 ns/iter     (69.19 ns … 371 ns)  70.41 ns    128 ns    227 ns
js                54.11 ns/iter     (51.03 ns … 303 ns)   52.2 ns    102 ns    195 ns
bufferutil        84.28 ns/iter     (80.71 ns … 339 ns)  82.13 ns    132 ns    241 ns

summary for mask - 64b
  wsm - wasm-simd
   1.1x faster than js
   1.12x faster than wsm
   1.48x faster than js - simple
   1.71x faster than bufferutil

• mask - 16Kib
------------------------------------------------------- -----------------------------
wsm - wasm-simd     831 ns/iter     (787 ns … 2'449 ns)    808 ns  1'382 ns  2'449 ns
wsm               2'084 ns/iter   (1'998 ns … 2'940 ns)  2'061 ns  2'900 ns  2'940 ns
js - simple      11'402 ns/iter (10'800 ns … 94'000 ns) 11'000 ns 19'400 ns 32'100 ns
js                8'668 ns/iter   (8'512 ns … 9'519 ns)  8'603 ns  9'519 ns  9'519 ns
bufferutil        2'000 ns/iter   (1'911 ns … 2'617 ns)  1'936 ns  2'561 ns  2'617 ns

summary for mask - 16Kib
  wsm - wasm-simd
   2.41x faster than bufferutil
   2.51x faster than wsm
   10.43x faster than js
   13.72x faster than js - simple

• mask - 64Kib
------------------------------------------------------- -----------------------------
wsm - wasm-simd   3'999 ns/iter   (3'917 ns … 4'681 ns)  3'971 ns  4'681 ns  4'681 ns
wsm               8'518 ns/iter  (8'300 ns … 84'600 ns)  8'400 ns 12'800 ns 24'700 ns
js - simple      54'664 ns/iter    (53'399 ns … 341 µs) 53'600 ns 81'600 ns    136 µs
js               35'191 ns/iter    (34'399 ns … 298 µs) 34'501 ns 52'500 ns 86'700 ns
bufferutil        7'462 ns/iter  (7'300 ns … 72'100 ns)  7'400 ns  9'700 ns 19'100 ns

summary for mask - 64Kib
  wsm - wasm-simd
   1.87x faster than bufferutil
   2.13x faster than wsm
   8.8x faster than js
   13.67x faster than js - simple

• mask - 128Kib
------------------------------------------------------- -----------------------------
wsm - wasm-simd   7'956 ns/iter     (7'700 ns … 335 µs)  7'800 ns 11'600 ns 28'500 ns
wsm              16'712 ns/iter    (16'300 ns … 221 µs) 16'400 ns 25'700 ns 46'000 ns
js - simple         108 µs/iter       (107 µs … 720 µs)    107 µs    150 µs    210 µs
js               70'680 ns/iter    (68'600 ns … 649 µs) 68'700 ns    117 µs    175 µs
bufferutil       14'841 ns/iter    (14'500 ns … 195 µs) 14'600 ns 19'600 ns 45'300 ns

summary for mask - 128Kib
  wsm - wasm-simd
   1.87x faster than bufferutil
   2.1x faster than wsm
   8.88x faster than js
   13.63x faster than js - simple

• mask - 256Kib
------------------------------------------------------- -----------------------------
wsm - wasm-simd  16'069 ns/iter    (15'600 ns … 317 µs) 15'800 ns 22'100 ns 44'300 ns
wsm              33'959 ns/iter    (32'900 ns … 809 µs) 33'100 ns 53'800 ns 96'300 ns
js - simple         217 µs/iter       (214 µs … 706 µs)    214 µs    309 µs    453 µs
js                  142 µs/iter     (138 µs … 1'303 µs)    138 µs    221 µs    498 µs
bufferutil       29'801 ns/iter    (29'100 ns … 230 µs) 29'300 ns 39'500 ns 85'800 ns

summary for mask - 256Kib
  wsm - wasm-simd
   1.85x faster than bufferutil
   2.11x faster than wsm
   8.82x faster than js
   13.53x faster than js - simple

• mask - 1MiB
------------------------------------------------------- -----------------------------
wsm - wasm-simd  72'415 ns/iter    (69'200 ns … 469 µs) 71'800 ns 95'100 ns    191 µs
wsm                 138 µs/iter     (133 µs … 1'128 µs)    134 µs    210 µs    625 µs
js - simple         877 µs/iter     (856 µs … 1'906 µs)    869 µs  1'170 µs  1'906 µs
js                  563 µs/iter     (552 µs … 1'210 µs)    558 µs    778 µs  1'101 µs
bufferutil          119 µs/iter       (116 µs … 796 µs)    117 µs    155 µs    291 µs

summary for mask - 1MiB
  wsm - wasm-simd
   1.64x faster than bufferutil
   1.9x faster than wsm
   7.78x faster than js
   12.12x faster than js - simple

• mask - 8MiB
------------------------------------------------------- -----------------------------
wsm - wasm-simd     752 µs/iter     (668 µs … 1'712 µs)    762 µs  1'170 µs  1'712 µs
wsm               1'119 µs/iter   (1'086 µs … 2'086 µs)  1'107 µs  1'712 µs  2'086 µs
js - simple       7'068 µs/iter   (6'895 µs … 9'103 µs)  7'016 µs  9'103 µs  9'103 µs
js                4'555 µs/iter   (4'450 µs … 5'992 µs)  4'544 µs  5'583 µs  5'992 µs
bufferutil          945 µs/iter     (928 µs … 1'368 µs)    941 µs  1'220 µs  1'368 µs

summary for mask - 8MiB
  wsm - wasm-simd
   1.26x faster than bufferutil
   1.49x faster than wsm
   6.06x faster than js
   9.4x faster than js - simple

• mask - 16Mib
------------------------------------------------------- -----------------------------
wsm - wasm-simd   1'894 µs/iter   (1'703 µs … 3'012 µs)  1'897 µs  2'453 µs  3'012 µs
wsm               2'370 µs/iter   (2'292 µs … 3'589 µs)  2'372 µs  3'164 µs  3'589 µs
js - simple      14'089 µs/iter (13'930 µs … 14'822 µs) 14'188 µs 14'822 µs 14'822 µs
js                9'148 µs/iter  (9'024 µs … 10'586 µs)  9'152 µs 10'586 µs 10'586 µs
bufferutil        1'966 µs/iter   (1'930 µs … 2'665 µs)  1'964 µs  2'572 µs  2'665 µs

summary for mask - 16Mib
  wsm - wasm-simd
   1.04x faster than bufferutil
   1.25x faster than wsm
   4.83x faster than js
   7.44x faster than js - simple

• mask - 32Mib
------------------------------------------------------- -----------------------------
wsm - wasm-simd   4'001 µs/iter   (3'875 µs … 5'211 µs)  3'973 µs  4'924 µs  5'211 µs
wsm               4'897 µs/iter   (4'746 µs … 6'657 µs)  4'858 µs  6'516 µs  6'657 µs
js - simple      28'521 µs/iter (27'969 µs … 30'380 µs) 28'416 µs 30'380 µs 30'380 µs
js               18'459 µs/iter (18'173 µs … 20'038 µs) 18'427 µs 20'038 µs 20'038 µs
bufferutil        3'809 µs/iter   (3'739 µs … 5'186 µs)  3'812 µs  4'353 µs  5'186 µs

summary for mask - 32Mib
  bufferutil
   1.05x faster than wsm - wasm-simd
   1.29x faster than wsm
   4.85x faster than js
   7.49x faster than js - simple

• mask - 64Mib
------------------------------------------------------- -----------------------------
wsm - wasm-simd   8'375 µs/iter   (8'109 µs … 9'882 µs)  8'411 µs  9'882 µs  9'882 µs
wsm               9'815 µs/iter  (9'647 µs … 10'296 µs)  9'912 µs 10'296 µs 10'296 µs
js - simple      56'835 µs/iter (56'253 µs … 57'912 µs) 57'421 µs 57'912 µs 57'912 µs
js               36'992 µs/iter (36'586 µs … 38'261 µs) 37'094 µs 38'261 µs 38'261 µs
bufferutil        7'654 µs/iter   (7'504 µs … 8'686 µs)  7'655 µs  8'686 µs  8'686 µs

summary for mask - 64Mib
  bufferutil
   1.09x faster than wsm - wasm-simd
   1.28x faster than wsm
   4.83x faster than js
   7.43x faster than js - simple

• mask - 128Mib
------------------------------------------------------- -----------------------------
wsm - wasm-simd  16'457 µs/iter (16'283 µs … 17'389 µs) 16'460 µs 17'389 µs 17'389 µs
wsm              19'791 µs/iter (19'348 µs … 21'140 µs) 19'993 µs 21'140 µs 21'140 µs
js - simple         114 ms/iter       (113 ms … 115 ms)    115 ms    115 ms    115 ms
js               74'983 µs/iter (74'326 µs … 75'658 µs) 75'600 µs 75'658 µs 75'658 µs
bufferutil       15'829 µs/iter (15'298 µs … 18'812 µs) 15'850 µs 18'812 µs 18'812 µs

summary for mask - 128Mib
  bufferutil
   1.04x faster than wsm - wasm-simd
   1.25x faster than wsm
   4.74x faster than js
   7.23x faster than js - simple

• mask - 256Mib
------------------------------------------------------- -----------------------------
wsm - wasm-simd  34'623 µs/iter (33'127 µs … 39'578 µs) 35'059 µs 39'578 µs 39'578 µs
wsm              39'576 µs/iter (38'792 µs … 42'610 µs) 39'966 µs 42'610 µs 42'610 µs
js - simple         235 ms/iter       (230 ms … 243 ms)    243 ms    243 ms    243 ms
js                  151 ms/iter       (149 ms … 154 ms)    151 ms    154 ms    154 ms
bufferutil       31'291 µs/iter (30'306 µs … 32'821 µs) 31'653 µs 32'821 µs 32'821 µs

summary for mask - 256Mib
  bufferutil
   1.11x faster than wsm - wasm-simd
   1.26x faster than wsm
   4.82x faster than js
   7.51x faster than js - simple
```
