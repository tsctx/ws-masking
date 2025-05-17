//@ts-check

"use strict";

/**
 * @param {Uint8Array} source
 * @param {Uint8Array | number[]} mask
 * @param {Uint8Array} output
 * @param {number} offset
 * @param {number} length
 * @returns {void}
 */
function mask(source, mask, output, offset, length) {
  // for (let i = 0; i < length; ++i) {
  //   output[i + offset] = source[i] ^ mask[i & 3];
  // }
  // 1.1x faster
  if (source !== output || offset !== 0) {
    output.set(
      source.length === length ? source : source.subarray(0, length),
      offset,
    );
  }
  for (let i = 0; i < length; ++i) {
    output[i + offset] ^= mask[i & 3];
  }
}

/**
 * @param {Uint8Array} buffer
 * @param {Uint8Array | number[]} mask
 * @returns {void}
 */
function unmask(buffer, mask) {
  const length = buffer.length;
  for (let i = 0; i < length; ++i) {
    buffer[i] ^= mask[i & 3];
  }
}

module.exports = {
  mask,
  unmask,
};
