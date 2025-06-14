//@ts-check

"use strict";

const standard = require("../../assets/standard");
const simd = require("../../assets/simd");
const { __js_module } = require("../internal-js-module");

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

  let view = new Uint8Array(memory.buffer);
  let memorySize = memory.buffer.byteLength;

  /**
   * @param {number} length
   */
  function glowUp(length) {
    if (length > memorySize) {
      memory.grow(Math.ceil(memorySize - length) / (2 << 15));
      view = new Uint8Array(memory.buffer);
      memorySize = memory.buffer.byteLength;
    }
  }

  /**
   * @type {(mask: number, length: number) => void}
   */
  //@ts-ignore
  const execute = wasm.exports.execute;

  /**
   * @param {Uint8Array} buffer
   * @param {Uint8Array | number[]} mask
   * @param {number} length
   * @returns {Uint8Array}
   */
  function wasmMask(buffer, mask, length) {
    view.set(buffer, 0);
    // WebAssembly memory is always little-endian.
    execute(
      mask[0] + mask[1] * 2 ** 8 + mask[2] * 2 ** 16 + (mask[3] << 24),
      length,
    );
    return length === memorySize
      ? view
      : new Uint8Array(view.buffer, 0, length);
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
    if (length > memorySize) {
      glowUp(length);
    }
    output.set(
      wasmMask(
        source.length < length ? source : source.subarray(0, length),
        mask,
        length,
      ),
      offset,
    );
  }

  /**
   * @param {Uint8Array} buffer
   * @param {Uint8Array | number[]} mask
   * @returns {void}
   */
  function _unmask(buffer, mask) {
    const length = buffer.length;
    if (length > memorySize) {
      glowUp(length);
    }
    buffer.set(wasmMask(buffer, mask, length), 0);
  }

  return {
    mask: _mask,
    unmask: _unmask,
  };
}

module.exports = initialize();
