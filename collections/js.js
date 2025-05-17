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
  if (source !== output || offset !== 0) {
    output.set(
      source.length === length ? source : source.subarray(0, length),
      offset,
    );
  }

  const fixedLength = length - (length & 3);
  const { 0: mask0, 1: mask1, 2: mask2, 3: mask3 } = mask;
  for (let i = 0; i < fixedLength; i += 4) {
    output[i + offset] ^= mask0;
    output[i + offset + 1] ^= mask1;
    output[i + offset + 2] ^= mask2;
    output[i + offset + 3] ^= mask3;
  }
  for (let i = fixedLength; i < length; ++i) {
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
  const fixedLength = length - (length & 3);
  const { 0: mask0, 1: mask1, 2: mask2, 3: mask3 } = mask;
  for (let i = 0; i < fixedLength; i += 4) {
    buffer[i] ^= mask0;
    buffer[i + 1] ^= mask1;
    buffer[i + 2] ^= mask2;
    buffer[i + 3] ^= mask3;
  }
  for (let i = fixedLength; i < length; ++i) {
    buffer[i] ^= mask[i & 3];
  }
}

module.exports = {
  mask,
  unmask,
};
