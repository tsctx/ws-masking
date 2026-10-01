declare const _exports: {
  initialize: typeof initialize;
};
export = _exports;
/**
 * @returns {{
 *   mask: (source: Uint8Array, mask: Uint8Array | number[], output: Uint8Array, offset: number, length: number) => void
 *   unmask: (buffer: Uint8Array, mask: Uint8Array | number[]) => void
 * }}
 */
declare function initialize(): {
  mask: (
    source: Uint8Array,
    mask: Uint8Array | number[],
    output: Uint8Array,
    offset: number,
    length: number,
  ) => void;
  unmask: (buffer: Uint8Array, mask: Uint8Array | number[]) => void;
};
