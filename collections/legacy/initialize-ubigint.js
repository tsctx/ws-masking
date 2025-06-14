//@ts-check

"use strict";

/**
 * @returns {{
 *   mask: (source: Uint8Array, mask: Uint8Array | number[], output: Uint8Array, offset: number, length: number) => void
 *   unmask: (buffer: Uint8Array, mask: Uint8Array | number[]) => void
 * }}
 */
function initialize() {
  const view = new Uint8Array(16 * 1024);
  const viewAB = view.buffer;
  // const viewBigInt64 = new BigInt64Array(viewAB);
  const viewBigUint64 = new BigUint64Array(viewAB);
  const memorySize = viewAB.byteLength;

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
   * @param {Uint8Array} buffer
   * @param {bigint} maskKey
   * @param {number} length
   * @returns {Uint8Array}
   */
  function jsMask(buffer, maskKey, length) {
    view.set(buffer, 0);
    const bigint64Length = length >> 3;
    // for (let i = 0; i < bigint64Length; ++i) {
    //   viewBigInt64[i] ^= maskKey;
    // }
    // if ((length & 7) !== 0) {
    //   viewBigInt64[bigint64Length] ^= maskKey;
    // }
    for (let i = 0; i < bigint64Length; ++i) {
      viewBigUint64[i] ^= maskKey;
    }
    if ((length & 7) !== 0) {
      viewBigUint64[bigint64Length] ^= maskKey;
    }
    return length === memorySize ? view : new Uint8Array(viewAB, 0, length);
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
    // const maskKey =
    //   endianType === 1
    //     ? BigInt(
    //         mask[0] + mask[1] * 2 ** 8 + mask[2] * 2 ** 16 + mask[3] * 2 ** 24,
    //       ) +
    //       (BigInt(
    //         mask[0] + mask[1] * 2 ** 8 + mask[2] * 2 ** 16 + (mask[3] << 24),
    //       ) <<
    //         32n)
    //     : BigInt(
    //         mask[3] + mask[2] * 2 ** 8 + mask[1] * 2 ** 16 + mask[0] * 2 ** 24,
    //       ) +
    //       (BigInt(
    //         mask[3] + mask[2] * 2 ** 8 + mask[1] * 2 ** 16 + (mask[0] << 24),
    //       ) <<
    //         32n);
    const maskBase =
      endianType === 1
        ? BigInt(
            mask[0] + mask[1] * 2 ** 8 + mask[2] * 2 ** 16 + mask[3] * 2 ** 24,
          )
        : BigInt(
            mask[3] + mask[2] * 2 ** 8 + mask[1] * 2 ** 16 + mask[0] * 2 ** 24,
          );
    const maskKey = maskBase + (maskBase << 32n);
    if (length <= memorySize) {
      output.set(
        jsMask(
          source.length < length ? source : source.subarray(0, length),
          maskKey,
          length,
        ),
        offset,
      );
    } else {
      let sourceOffset = 0;
      let outputOffset = offset;
      while (sourceOffset + memorySize < length) {
        output.set(
          jsMask(
            source.subarray(sourceOffset, sourceOffset + memorySize),
            maskKey,
            memorySize,
          ),
          outputOffset,
        );
        outputOffset += memorySize;
        sourceOffset += memorySize;
      }
      if (sourceOffset !== length) {
        output.set(
          jsMask(
            source.subarray(sourceOffset, length),
            maskKey,
            length - sourceOffset,
          ),
          outputOffset,
        );
      }
    }
  }

  /**
   * @param {Uint8Array} buffer
   * @param {Uint8Array | number[]} mask
   * @returns {void}
   */
  function _unmask(buffer, mask) {
    // const maskKey =
    //   endianType === 1
    //     ? BigInt(
    //         mask[0] + mask[1] * 2 ** 8 + mask[2] * 2 ** 16 + mask[3] * 2 ** 24,
    //       ) +
    //       (BigInt(
    //         mask[0] + mask[1] * 2 ** 8 + mask[2] * 2 ** 16 + (mask[3] << 24),
    //       ) <<
    //         32n)
    //     : BigInt(
    //         mask[3] + mask[2] * 2 ** 8 + mask[1] * 2 ** 16 + mask[0] * 2 ** 24,
    //       ) +
    //       (BigInt(
    //         mask[3] + mask[2] * 2 ** 8 + mask[1] * 2 ** 16 + (mask[0] << 24),
    //       ) <<
    //         32n);
    const maskBase =
      endianType === 1
        ? BigInt(
            mask[0] + mask[1] * 2 ** 8 + mask[2] * 2 ** 16 + mask[3] * 2 ** 24,
          )
        : BigInt(
            mask[3] + mask[2] * 2 ** 8 + mask[1] * 2 ** 16 + mask[0] * 2 ** 24,
          );
    const maskKey = maskBase + (maskBase << 32n);
    const length = buffer.length;
    if (length <= memorySize) {
      buffer.set(jsMask(buffer, maskKey, length), 0);
    } else {
      let offset = 0;
      while (offset + memorySize < length) {
        buffer.set(
          jsMask(
            buffer.subarray(offset, offset + memorySize),
            maskKey,
            memorySize,
          ),
          offset,
        );
        offset += memorySize;
      }
      if (offset !== length) {
        buffer.set(
          jsMask(buffer.subarray(offset, length), maskKey, length - offset),
          offset,
        );
      }
    }
  }

  return {
    mask: _mask,
    unmask: _unmask,
  };
}

module.exports = { initialize };
