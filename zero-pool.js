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
 * @returns {Uint8Array}
 */
function _mask(source, mask, output, offset, length) {
  output.set(
    source.length === length ? source : source.subarray(0, length),
    offset,
  );
  const byteOffset = output.byteOffset + offset;
  // [0, 0, 0, 0, 0, 0, 0, 0, < 0, 0, 0, 0 >, < 0, 0, 0, 0 >, 0, 0, 0]
  //  //////////  ^  <----->  ^<---int32---> | <---int32--->  ^
  //  //////////  |        ^  |<four-chunks> | <four-chunks>  |
  //  //////////  |<-offset|  |<-start                        |<-remaining
  //  //////////  1.       2. 3.                              4.
  // 1~2.
  if ((byteOffset & 3) !== 0) {
    if (length < 4) {
      for (let i = 0; i < length; ++i) {
        output[i + offset] ^= mask[i & 3];
      }
      return output;
    }
    for (let i = 0, l = 4 - (byteOffset & 3); i < l; ++i) {
      output[i + offset] ^= mask[i & 3];
    }
  }
  const int32FixedOffset =
    (byteOffset & 3) === 0 ? byteOffset : byteOffset + (4 - (byteOffset & 3));
  // fixing length
  const fixedLength = length - (length & 3);
  // convert Int32Array length
  const int32Length = fixedLength >> 2;
  const int32FixedLength =
    (byteOffset & 3) !== 0 ? int32Length - 1 : int32Length;
  const viewInt32 = new Int32Array(
    output.buffer,
    int32FixedOffset,
    int32FixedLength,
  );
  /**@type {number} */
  let maskKey = 0;
  switch (byteOffset & 3) {
    case 3:
      maskKey = int32(mask[3], mask[0], mask[1], mask[2]);
      break;
    case 2:
      maskKey = int32(mask[2], mask[3], mask[0], mask[1]);
      break;
    case 1:
      maskKey = int32(mask[1], mask[2], mask[3], mask[0]);
      break;
    case 0:
      maskKey = int32(mask[0], mask[1], mask[2], mask[3]);
      break;
    default:
      throw new TypeError("Unreachable");
  }
  // 3. 4 vector masking.
  for (let i = 0; i < int32FixedLength; ++i) {
    viewInt32[i] ^= maskKey;
  }
  // 4.
  if (int32Length !== int32FixedLength) {
    for (let i = fixedLength - (byteOffset & 3); i < fixedLength; ++i) {
      output[i + offset] ^= mask[i & 3];
    }
  }
  if (length !== fixedLength) {
    for (let i = fixedLength; i < length; ++i) {
      output[i + offset] ^= mask[i & 3];
    }
  }
  return output;
}

/**
 * @param {Uint8Array} buffer
 * @param {Uint8Array | number[]} mask
 * @returns {Uint8Array}
 */
function _unmask(buffer, mask) {
  const length = buffer.length;
  const byteOffset = buffer.byteOffset;
  // [0, 0, 0, 0, 0, 0, 0, 0, < 0, 0, 0, 0 >, < 0, 0, 0, 0 >, 0, 0, 0]
  //  //////////  ^  <----->  ^<---int32---> | <---int32--->  ^
  //  //////////  |        ^  |<four-chunks> | <four-chunks>  |
  //  //////////  |<-offset|  |<-start                        |<-remaining
  //  //////////  1.       2. 3.                              4.
  // 1~2.
  if ((byteOffset & 3) !== 0) {
    if (length < 4) {
      for (let i = 0; i < length; ++i) {
        buffer[i] ^= mask[i & 3];
      }
      return buffer;
    }
    for (let i = 0, l = 4 - (byteOffset & 3); i < l; ++i) {
      buffer[i] ^= mask[i & 3];
    }
  }
  const int32FixedOffset =
    (byteOffset & 3) === 0 ? byteOffset : byteOffset + (4 - (byteOffset & 3));
  // fixing length
  const fixedLength = length - (length & 3);
  // convert Int32Array length
  const int32Length = fixedLength >> 2;
  const int32FixedLength =
    (byteOffset & 3) !== 0 ? int32Length - 1 : int32Length;
  const viewInt32 = new Int32Array(
    buffer.buffer,
    int32FixedOffset,
    int32FixedLength,
  );
  /**@type {number} */
  let maskKey = 0;
  switch (byteOffset & 3) {
    case 3:
      maskKey = int32(mask[3], mask[0], mask[1], mask[2]);
      break;
    case 2:
      maskKey = int32(mask[2], mask[3], mask[0], mask[1]);
      break;
    case 1:
      maskKey = int32(mask[1], mask[2], mask[3], mask[0]);
      break;
    case 0:
      maskKey = int32(mask[0], mask[1], mask[2], mask[3]);
      break;
    default:
      throw new TypeError("Unreachable");
  }
  // 3. four-vector masking.
  for (let i = 0; i < int32FixedLength; ++i) {
    viewInt32[i] ^= maskKey;
  }
  // 4.
  if (int32Length !== int32FixedLength) {
    for (let i = fixedLength - (byteOffset & 3); i < fixedLength; ++i) {
      buffer[i] ^= mask[i & 3];
    }
  }
  if (length !== fixedLength) {
    for (let i = fixedLength; i < length; ++i) {
      buffer[i] ^= mask[i & 3];
    }
  }
  return buffer;
}

module.exports = { mask: _mask, unmask: _unmask };
