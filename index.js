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
 * @param {number} k1
 * @param {number} k2
 * @param {number} k3
 * @param {number} k4
 */
function int32(k1, k2, k3, k4) {
  return endianType === 1
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
  if (source !== output || offset !== 0) {
    output.set(
      source.length === length ? source : source.subarray(0, length),
      offset,
    );
  }
  const byteOffset = output.byteOffset + offset;
  let i = 0;

  for (; i < length && ((byteOffset + i) & 3) !== 0; ++i) {
    output[i + offset] ^= mask[i & 3];
  }

  if (i < length) {
    const maskKey =
      i === 3
        ? int32(mask[3], mask[0], mask[1], mask[2])
        : i === 2
          ? int32(mask[2], mask[3], mask[0], mask[1])
          : i === 1
            ? int32(mask[1], mask[2], mask[3], mask[0])
            : int32(mask[0], mask[1], mask[2], mask[3]);

    const i32al = (length - i) >> 2;
    const i32a = new Int32Array(output.buffer, byteOffset + i, i32al);

    const unrollI32al = i32al - (i32al & 7);
    for (let j = 0; j < unrollI32al; j += 8) {
      i32a[j] ^= maskKey;
      i32a[j + 1] ^= maskKey;
      i32a[j + 2] ^= maskKey;
      i32a[j + 3] ^= maskKey;
      i32a[j + 4] ^= maskKey;
      i32a[j + 5] ^= maskKey;
      i32a[j + 6] ^= maskKey;
      i32a[j + 7] ^= maskKey;
    }

    for (let j = unrollI32al; j < i32al; ++j) {
      i32a[j] ^= maskKey;
    }

    i += i32al << 2;
  }

  for (; i < length; ++i) {
    output[i + offset] ^= mask[i & 3];
  }
}

/**
 * @param {Uint8Array} buffer
 * @param {Uint8Array | number[]} mask
 * @returns {void}
 */
function _unmask(buffer, mask) {
  const length = buffer.length;
  const byteOffset = buffer.byteOffset;
  let i = 0;

  for (; i < length && ((byteOffset + i) & 3) !== 0; ++i) {
    buffer[i] ^= mask[i & 3];
  }

  if (i < length) {
    const maskKey =
      i === 3
        ? int32(mask[3], mask[0], mask[1], mask[2])
        : i === 2
          ? int32(mask[2], mask[3], mask[0], mask[1])
          : i === 1
            ? int32(mask[1], mask[2], mask[3], mask[0])
            : int32(mask[0], mask[1], mask[2], mask[3]);

    const i32al = (length - i) >> 2;
    const i32a = new Int32Array(buffer.buffer, byteOffset + i, i32al);

    const unrollI32al = i32al - (i32al & 7);
    for (let j = 0; j < unrollI32al; j += 8) {
      i32a[j] ^= maskKey;
      i32a[j + 1] ^= maskKey;
      i32a[j + 2] ^= maskKey;
      i32a[j + 3] ^= maskKey;
      i32a[j + 4] ^= maskKey;
      i32a[j + 5] ^= maskKey;
      i32a[j + 6] ^= maskKey;
      i32a[j + 7] ^= maskKey;
    }

    for (let j = unrollI32al; j < i32al; ++j) {
      i32a[j] ^= maskKey;
    }

    i += i32al << 2;
  }

  for (; i < length; ++i) {
    buffer[i] ^= mask[i & 3];
  }
}

module.exports = { mask: _mask, unmask: _unmask };
