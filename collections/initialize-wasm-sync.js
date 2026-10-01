//@ts-check

"use strict";

const standard = require("../assets/standard2");
const simd = require("../assets/simd");
const { __js_module } = require("./internal-js-module");

/**
 * @returns {{
 *   mask: (source: Uint8Array, mask: Uint8Array | number[], output: Uint8Array, offset: number, length: number) => void
 *   unmask: (buffer: Uint8Array, mask: Uint8Array | number[]) => void
 * }}
 */
function initialize() {
  /**@type {WebAssembly.Memory} */
  let memory;
  /**@type {WebAssembly.Instance} */
  let wasm;
  if (typeof WebAssembly === "undefined") {
    const { memory: _memory, wasm: _wasm } = __js_module();

    memory = _memory;

    wasm = _wasm;
  } else {
    memory = new WebAssembly.Memory({
      // 16 Kib
      initial: 1,
    });

    /**@type {WebAssembly.Module} */
    let mod;

    try {
      // simd
      mod = new WebAssembly.Module(simd);
    } catch (_err) {
      try {
        // standard
        mod = new WebAssembly.Module(standard);
      } catch (err) {
        // fallback
        throw err ?? _err ?? new Error("Unsupported");
      }
    }

    wasm = new WebAssembly.Instance(mod, {
      imports: {},
      env: {
        memory: memory,
      },
    });
  }

  const viewAB = memory.buffer;
  const view = new Uint8Array(viewAB);
  const memorySize = viewAB.byteLength;

  /**
   * @type {(mask: number, length: number) => void}
   */
  //@ts-ignore
  const execute = wasm.exports.execute;

  /**
   * @param {Uint8Array} buffer
   * @param {number} maskKey
   * @param {number} length
   * @returns {Uint8Array}
   */
  function wasmMask(buffer, maskKey, length) {
    view.set(buffer, 0);
    // WebAssembly memory is always little-endian.
    execute(maskKey, length);
    return length === memorySize ? view : new Uint8Array(viewAB, 0, length);
  }

  /**
   * @param {Uint8Array} source
   * @param {Uint8Array | number[]} mask
   * @param {Uint8Array} output
   * @param {number} offset
   * @param {number} length
   * @returns {void}
   */
  function _mask(source, mask, output, offset, length) {
    const maskKey =
      mask[0] | (mask[1] << 8) | (mask[2] << 16) | (mask[3] << 24);
    if (length <= memorySize) {
      output.set(
        wasmMask(
          source.length === length ? source : source.subarray(0, length),
          maskKey,
          length,
        ),
        offset,
      );
    } else {
      let sourceOffset = 0;
      let outputOffset = offset;
      while (sourceOffset + memorySize < length) {
        output.set(
          wasmMask(
            source.subarray(sourceOffset, sourceOffset + memorySize),
            maskKey,
            memorySize,
          ),
          outputOffset,
        );
        outputOffset += memorySize;
        sourceOffset += memorySize;
      }
      if (sourceOffset !== length) {
        output.set(
          wasmMask(
            source.subarray(sourceOffset, length),
            maskKey,
            length - sourceOffset,
          ),
          outputOffset,
        );
      }
    }
  }

  /**
   * @param {Uint8Array} buffer
   * @param {Uint8Array | number[]} mask
   * @returns {void}
   */
  function _unmask(buffer, mask) {
    const maskKey =
      mask[0] | (mask[1] << 8) | (mask[2] << 16) | (mask[3] << 24);
    const length = buffer.length;
    if (length <= memorySize) {
      buffer.set(wasmMask(buffer, maskKey, length), 0);
    } else {
      let offset = 0;
      while (offset + memorySize < length) {
        buffer.set(
          wasmMask(
            buffer.subarray(offset, offset + memorySize),
            maskKey,
            memorySize,
          ),
          offset,
        );
        offset += memorySize;
      }
      if (offset !== length) {
        buffer.set(
          wasmMask(buffer.subarray(offset, length), maskKey, length - offset),
          offset,
        );
      }
    }
  }

  return {
    mask: _mask,
    unmask: _unmask,
  };
}

module.exports = { initialize };
