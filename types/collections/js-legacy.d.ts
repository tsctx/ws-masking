/**
 * @param {Uint8Array} source
 * @param {Uint8Array | number[]} mask
 * @param {Uint8Array} output
 * @param {number} offset
 * @param {number} length
 * @returns {Uint8Array}
 */
export function mask(
  source: Uint8Array,
  mask: Uint8Array | number[],
  output: Uint8Array,
  offset: number,
  length: number,
): Uint8Array;
/**
 * @param {Uint8Array} buffer
 * @param {Uint8Array | number[]} mask
 * @returns {Uint8Array}
 */
export function unmask(
  buffer: Uint8Array,
  mask: Uint8Array | number[],
): Uint8Array;
