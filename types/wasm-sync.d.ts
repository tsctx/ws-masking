declare const _exports: {
  mask: (
    source: Uint8Array,
    mask: Uint8Array | number[],
    output: Uint8Array,
    offset: number,
    length: number,
  ) => void;
  unmask: (buffer: Uint8Array, mask: Uint8Array | number[]) => void;
};
export = _exports;
