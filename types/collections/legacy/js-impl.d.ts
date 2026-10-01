declare const _exports: {
  mask: typeof _mask;
  unmask: typeof _unmask;
};
export = _exports;
/**
 * @param {Uint8Array} source
 * @param {Uint8Array | number[]} mask
 * @param {Uint8Array} output
 * @param {number} offset
 * @param {number} length
 * @returns {void}
 */
declare function _mask(
  source: Uint8Array,
  mask: Uint8Array | number[],
  output: Uint8Array,
  offset: number,
  length: number,
): void;
/**
 * @param {Uint8Array} buffer
 * @param {Uint8Array | number[]} mask
 * @returns {void}
 */
declare function _unmask(buffer: Uint8Array, mask: Uint8Array | number[]): void;
