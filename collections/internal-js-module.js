//@ts-check

"use strict";

/**
 * @returns {{
 *   memory: WebAssembly.Memory;
 *   wasm: WebAssembly.Instance
 * }}
 */
function __js_module() {
  let _memory = new ArrayBuffer(1 << 16);
  let HEAP8 = new Int8Array(_memory);
  let HEAP32 = new Int32Array(_memory);

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
      HEAP32[i] ^= maskKey;
      HEAP32[i + 1] ^= maskKey;
      HEAP32[i + 2] ^= maskKey;
      HEAP32[i + 3] ^= maskKey;
      i += 4;
    }
  }

  /**@type {WebAssembly.Memory} */
  const memoryImpl = {
    get buffer() {
      return _memory;
    },
    grow(pagesToAdd) {
      const oldPages = (_memory.byteLength / 65536) | 0;
      const newPages = (oldPages + pagesToAdd) | 0;
      if (oldPages < newPages && newPages < 65536) {
        const newMemory = new ArrayBuffer(newPages * 65536);
        const newHEAP8 = new Int8Array(newMemory);
        newHEAP8.set(HEAP8);
        HEAP8 = newHEAP8;
        HEAP32 = new Int32Array(newMemory);
        _memory = newMemory;
      }
      return oldPages;
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
