//@ts-check

"use strict";

/**
 * @returns {{
 *   memory: WebAssembly.Memory;
 *   wasm: WebAssembly.Instance
 * }}
 */
function __js_module() {
  const _memory = new ArrayBuffer(1 << 16);
  const _memory_i32 = new Int32Array(_memory);

  /**
   * Detect endianness.
   * @returns {number} 0 -> BE (big endian), 1 -> LE (little endian)
   */
  function detectEndianness() {
    const u8 = new Uint8Array([0x1, 0x0]);
    const u16 = new Uint16Array(u8.buffer);
    return u16[0] & 1;
  }

  const endianType = detectEndianness();

  /**
   * @param {number} value
   */
  function toLittleEndian(value) {
    return endianType === 1
      ? value | 0
      : ((value & 0x000000ff) << 24) |
          ((value & 0x0000ff00) << 8) |
          ((value & 0x00ff0000) >> 8) |
          ((value & -0x1000000) >> 24);
  }

  /**@type {(mask: number, length: number) => void} */
  function _execute(mask, length) {
    // WebAssembly memory is always little-endian.
    let i = 0;
    const maskKey = toLittleEndian(mask);
    const endIndex = (length + 3) >> 2;
    while (i < endIndex) {
      _memory_i32[i] ^= maskKey;
      _memory_i32[i + 1] ^= maskKey;
      _memory_i32[i + 2] ^= maskKey;
      _memory_i32[i + 3] ^= maskKey;
      i += 4;
    }
  }

  /**@type {WebAssembly.Memory} */
  const memoryImpl = {
    buffer: _memory,
    grow(pages) {
      throw new Error(
        `Memory cannot be grown in this simulation. Attempted to grow by ${pages} pages.`,
      );
    },
  };

  return {
    memory: memoryImpl,
    wasm: {
      exports: {
        execute: _execute,
        memory: memoryImpl,
      },
    },
  };
}

module.exports = { __js_module };
