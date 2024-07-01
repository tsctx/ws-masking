//@ts-check

"use strict";

/**
 * @param {Uint8Array} source
 * @param {Uint8Array} mask
 * @param {Uint8Array} output
 * @param {number} offset
 * @param {number} length
 * @returns {Uint8Array}
 */
function mask(source, mask, output, offset, length) {
  const fixedLength = length - (length & 3);
  for (let i = 0; i < fixedLength; i += 4) {
    output[i + offset] = source[i] ^ mask[0];
    output[i + offset + 1] = source[i + 1] ^ mask[1];
    output[i + offset + 2] = source[i + 2] ^ mask[2];
    output[i + offset + 3] = source[i + 3] ^ mask[3];
  }
  for (let i = fixedLength; i < length; ++i) {
    output[i + offset] = source[i] ^ mask[i & 3];
  }
  return output;
}

/**
 * @param {Uint8Array} buffer
 * @param {Uint8Array} mask
 * @returns {Uint8Array}
 */
function unmask(buffer, mask) {
  const length = buffer.length;
  const fixedLength = length - (length & 3);
  for (let i = 0; i < fixedLength; i += 4) {
    buffer[i] ^= mask[0];
    buffer[i + 1] ^= mask[1];
    buffer[i + 2] ^= mask[2];
    buffer[i + 3] ^= mask[3];
  }
  for (let i = fixedLength; i < length; ++i) {
    buffer[i] ^= mask[i & 3];
  }
  return buffer;
}

module.exports = {
  mask,
  unmask,
};
