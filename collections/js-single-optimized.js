//@ts-check

"use strict";

/**
 * @param {Uint8Array} source
 * @param {Uint8Array | number[]} mask
 * @param {Uint8Array} output
 * @param {number} offset
 * @param {number} length
 * @returns {Uint8Array}
 */
function mask(source, mask, output, offset, length) {
  output.set(
    source.length === length ? source : source.subarray(0, length),
    offset,
  );
  for (let i = 0; i < length; ++i) {
    output[i + offset] ^= mask[i & 3];
  }
  return output;
}

/**
 * @param {Uint8Array} buffer
 * @param {Uint8Array | number[]} mask
 * @returns {Uint8Array}
 */
function unmask(buffer, mask) {
  const length = buffer.length;
  for (let i = 0; i < length; ++i) {
    buffer[i] ^= mask[i & 3];
  }
  return buffer;
}

module.exports = {
  mask,
  unmask,
};
