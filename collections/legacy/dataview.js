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

// Optimize for platform endianness
const endianType = detectEndianness() === 1;

/**
 * @param {number} k1
 * @param {number} k2
 * @param {number} k3
 * @param {number} k4
 */
function int32(k1, k2, k3, k4) {
  return endianType
    ? k1 + k2 * 2 ** 8 + k3 * 2 ** 16 + (k4 << 24)
    : k4 + k3 * 2 ** 8 + k2 * 2 ** 16 + (k1 << 24);
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
  const sourceView = new DataView(
    source.buffer,
    source.byteOffset,
    source.byteLength,
  );
  const outputView = new DataView(
    output.buffer,
    output.byteOffset + offset,
    output.byteLength - offset,
  );

  const maskKey = int32(mask[0], mask[1], mask[2], mask[3]);

  const len = length >> 2;

  for (let i = 0; i < len; ++i) {
    outputView.setInt32(
      i,
      sourceView.getInt32(i, endianType) ^ maskKey,
      endianType,
    );
  }

  for (let i = len << 2; i < length; ++i) {
    output[i + offset] = source[i] ^ mask[i];
  }
}

// TODO: why slow on v8
/**
 * @param {Uint8Array} buffer
 * @param {Uint8Array | number[]} mask
 * @returns {void}
 */
function _unmask(buffer, mask) {
  const length = buffer.length;
  const bufferView = new DataView(
    buffer.buffer,
    buffer.byteOffset,
    buffer.byteLength,
  );

  const maskKey = int32(mask[0], mask[1], mask[2], mask[3]);

  const len = length >> 2;

  for (let i = 0; i < len; ++i) {
    bufferView.setInt32(
      i,
      bufferView.getInt32(i, endianType) ^ maskKey,
      endianType,
    );
  }

  for (let i = len << 2; i < length; ++i) {
    buffer[i] ^= mask[i];
  }
}

module.exports = { mask: _mask, unmask: _unmask };
