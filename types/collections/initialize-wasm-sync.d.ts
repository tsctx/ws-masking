/**
 * @returns {{
 *   mask: (source: Uint8Array, mask: Uint8Array | number[], output: Uint8Array, offset: number, length: number) => Uint8Array
 *   unmask: (buffer: Uint8Array, mask: Uint8Array | number[]) => Uint8Array
 * }}
 */
export function initialize(): {
  mask: (
    source: Uint8Array,
    mask: Uint8Array | number[],
    output: Uint8Array,
    offset: number,
    length: number,
  ) => Uint8Array;
  unmask: (buffer: Uint8Array, mask: Uint8Array | number[]) => Uint8Array;
};
