//@ts-check

"use strict";

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
 * @param {Uint8Array} source
 * @param {Uint8Array | number[]} mask
 * @returns {Uint8Array}
 */
function fastMask(source, mask) {
  if (source.byteLength !== source.buffer.byteLength) {
    throw new TypeError("Assertion failed.");
  }

  const length = source.length;
  const maskKey =
    endianType === 1
      ? mask[0] + mask[1] * 2 ** 8 + mask[2] * 2 ** 16 + (mask[3] << 24)
      : mask[3] + mask[2] * 2 ** 8 + mask[1] * 2 ** 16 + (mask[0] << 24);

  const int32Length = length >> 2;
  const i32Array = new Int32Array(source.buffer, 0, int32Length);

  for (let i = 0; i < int32Length; ++i) {
    i32Array[i] ^= maskKey;
  }

  if ((length & 3) !== 0) {
    for (let i = length - (length & 3); i < length; ++i) {
      source[i] = mask[i & 3];
    }
  }

  return source;
}

/**
 * @param {Uint8Array} source
 * @param {Uint8Array | number[]} mask
 * @param {Uint8Array} output
 * @param {number} offset
 * @param {number} length
 * @returns {Uint8Array}
 */
function mask(source, mask, output, offset, length) {
  if (
    source !== output ||
    offset !== 0 ||
    length !== source.length ||
    source.byteLength !== source.buffer.byteLength
  ) {
    throw new TypeError("Assertion failed.");
  }
  return fastMask(source, mask);
}

/**
 * @param {Uint8Array} buffer
 * @param {Uint8Array | number[]} mask
 * @returns {Uint8Array}
 */
function unmask(buffer, mask) {
  return fastMask(buffer, mask);
}

module.exports = {
  mask,
  unmask,
};
