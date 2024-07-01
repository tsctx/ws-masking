//@ts-check

"use strict";

const standard = require("./assets/standard");
const simd = require("./assets/simd");
const js = require("./assets/js");

/**
 * @param {{ memory?: number }} init
 * @returns {{
 *   mask: (source: Uint8Array, mask: Uint8Array, output: Uint8Array, offset: number, length: number) => Uint8Array
 *   unmask: (buffer: Uint8Array, mask: Uint8Array) => Uint8Array
 * }}
 */
function initialize(init = {}) {
  const memory = new WebAssembly.Memory({
    // 16 Kib
    initial: init.memory ?? 1,
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
      return {
        mask: js.mask,
        unmask: js.unmask,
      };
    }
  }

  const wasm = new WebAssembly.Instance(mod, {
    imports: {},
    env: {
      memory: memory,
    },
  });

  const viewAB = memory.buffer;
  const view = new Uint8Array(viewAB);
  const memorySize = viewAB.byteLength;

  /**
   * @type {(mask1: number, mask2: number, mask3: number, mask4: number, length: number) => void}
   */
  //@ts-ignore
  const execute = wasm.exports.execute;

  /**
   * @param {Uint8Array} buffer
   * @param {Uint8Array} mask
   * @param {number} length
   * @returns {Uint8Array}
   */
  function wasmMask(buffer, mask, length) {
    view.set(buffer, 0);
    execute(mask[0], mask[1], mask[2], mask[3], length);
    return length === memorySize ? view : new Uint8Array(viewAB, 0, length);
  }

  /**
   * @param {Uint8Array} source
   * @param {Uint8Array} mask
   * @param {Uint8Array} output
   * @param {number} offset
   * @param {number} length
   * @returns {Uint8Array}
   */
  function _mask(source, mask, output, offset, length) {
    if (length <= memorySize) {
      output.set(wasmMask(source, mask, length), offset);
    } else {
      let sourceOffset = 0;
      let outputOffset = offset;
      while (sourceOffset + memorySize < length) {
        output.set(
          wasmMask(
            source.subarray(sourceOffset, sourceOffset + memorySize),
            mask,
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
            mask,
            length - sourceOffset,
          ),
          outputOffset,
        );
      }
    }
    return output;
  }

  /**
   * @param {Uint8Array} buffer
   * @param {Uint8Array} mask
   * @returns {Uint8Array}
   */
  function _unmask(buffer, mask) {
    const length = buffer.length;
    if (length <= memorySize) {
      buffer.set(wasmMask(buffer, mask, length), 0);
    } else {
      let offset = 0;
      while (offset + memorySize < length) {
        buffer.set(
          wasmMask(
            buffer.subarray(offset, offset + memorySize),
            mask,
            memorySize,
          ),
          offset,
        );
        offset += memorySize;
      }
      if (offset !== length) {
        buffer.set(
          wasmMask(buffer.subarray(offset, length), mask, length - offset),
          offset,
        );
      }
    }
    return buffer;
  }

  return {
    mask: _mask,
    unmask: _unmask,
  };
}

module.exports = { initialize };
