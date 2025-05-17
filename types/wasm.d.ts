export function initialize(): Promise<void>;
/**
 * @param {Uint8Array} source
 * @param {Uint8Array} mask
 * @param {Uint8Array} output
 * @param {number} offset
 * @param {number} length
 * @returns {void}
 */
export function mask(
  source: Uint8Array,
  mask: Uint8Array,
  output: Uint8Array,
  offset: number,
  length: number,
): void;
/**
 * @param {Uint8Array} buffer
 * @param {Uint8Array} mask
 * @returns {void}
 */
export function unmask(buffer: Uint8Array, mask: Uint8Array): void;
