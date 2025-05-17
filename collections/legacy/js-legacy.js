//@ts-check

"use strict";

// /**
//  * @param {number} k1
//  * @param {number} k2
//  * @param {number} k3
//  * @param {number} k4
//  */
// function int32(k1, k2, k3, k4) {
//   return k1 + k2 * 2 ** 8 + k3 * 2 ** 16 + (k4 << 24);
// }

/**
 * @param {Uint8Array} source
 * @param {Uint8Array | number[]} mask
 * @param {Uint8Array} output
 * @param {number} offset
 * @param {number} length
 * @returns {void}
 */
function mask(source, mask, output, offset, length) {
  const fixedLength = length - (length & 3);
  // const maskKey = int32(mask[0], mask[1], mask[2], mask[3]);
  // for (let i = 0; i < fixedLength; i += 4) {
  //   const masked =
  //     int32(source[i], source[i + 1], source[i + 2], source[i + 3]) ^ maskKey;
  //   output[i + offset] = (masked & -0x1000000) >> 24;
  //   output[i + offset + 1] = (masked & 0xff0000) >> 16;
  //   output[i + offset + 2] = (masked & 0xff00) >> 8;
  //   output[i + offset + 3] = (masked & 0xff) >> 0;
  // }
  // for (let i = fixedLength; i < length; ++i) {
  //   output[i + offset] = source[i] ^ mask[i & 3];
  // }
  const { 0: mask0, 1: mask1, 2: mask2, 3: mask3 } = mask;
  for (let i = 0; i < fixedLength; i += 4) {
    output[i + offset] = source[i] ^ mask0;
    output[i + offset + 1] = source[i + 1] ^ mask1;
    output[i + offset + 2] = source[i + 2] ^ mask2;
    output[i + offset + 3] = source[i + 3] ^ mask3;
  }
  for (let i = fixedLength; i < length; ++i) {
    output[i + offset] = source[i] ^ mask[i & 3];
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
