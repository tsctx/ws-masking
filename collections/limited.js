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
 * @param {number} offset
 * @param {number} length
 * @returns {void}
 */
function fastMask(source, mask, offset, length) {
  if (source.byteLength !== source.buffer.byteLength || (offset & 3) !== 0) {
    throw new TypeError("Assertion failed.");
  }

  const maskKey =
    endianType === 1
      ? mask[0] + mask[1] * 2 ** 8 + mask[2] * 2 ** 16 + (mask[3] << 24)
      : mask[3] + mask[2] * 2 ** 8 + mask[1] * 2 ** 16 + (mask[0] << 24);

  const int32Length = length >> 2;
  const i32Array = new Int32Array(source.buffer, offset, int32Length);

  const unrollInt32Length = int32Length - (int32Length & 7);
  for (let startIndex = 0; startIndex < unrollInt32Length; startIndex += 8) {
    i32Array[startIndex] ^= maskKey;
    i32Array[startIndex + 1] ^= maskKey;
    i32Array[startIndex + 2] ^= maskKey;
    i32Array[startIndex + 3] ^= maskKey;
    i32Array[startIndex + 4] ^= maskKey;
    i32Array[startIndex + 5] ^= maskKey;
    i32Array[startIndex + 6] ^= maskKey;
    i32Array[startIndex + 7] ^= maskKey;
  }
  for (let i = unrollInt32Length; i < int32Length; ++i) {
    i32Array[i] ^= maskKey;
  }

  if ((length & 3) !== 0) {
    for (let i = length - (length & 3); i < length; ++i) {
      source[i] = mask[i & 3];
    }
  }
}

/**
 * @param {Uint8Array} source
 * @param {Uint8Array | number[]} mask
 * @param {Uint8Array} output
 * @param {number} offset
 * @param {number} length
 * @returns {void}
 */
function mask(source, mask, output, offset, length) {
  if ((offset & 3) !== 0 || source.byteLength !== source.buffer.byteLength) {
    throw new TypeError("Assertion failed.");
  }
  if (source !== output || offset !== 0) {
    output.set(
      source.length === length ? source : source.subarray(0, length),
      offset,
    );
  }
  return fastMask(output, mask, 0, length);
}

/**
 * @param {Uint8Array} buffer
 * @param {Uint8Array | number[]} mask
 * @returns {void}
 */
function unmask(buffer, mask) {
  return fastMask(buffer, mask, 0, buffer.length);
}

module.exports = {
  mask,
  unmask,
};
