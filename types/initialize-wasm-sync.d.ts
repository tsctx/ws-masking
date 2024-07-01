/**
 * @param {{ memory?: number }} init
 * @returns {{
 *   mask: (source: Uint8Array, mask: Uint8Array, output: Uint8Array, offset: number, length: number) => Uint8Array
 *   unmask: (buffer: Uint8Array, mask: Uint8Array) => Uint8Array
 * }}
 */
export function initialize(init?: {
  memory?: number;
}): {
  mask: (
    source: Uint8Array,
    mask: Uint8Array,
    output: Uint8Array,
    offset: number,
    length: number,
  ) => Uint8Array;
  unmask: (buffer: Uint8Array, mask: Uint8Array) => Uint8Array;
};
