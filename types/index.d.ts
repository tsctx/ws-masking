export function initialize(): Promise<void>;
export function mask(
  source: Uint8Array,
  mask: Uint8Array,
  output: Uint8Array,
  offset: number,
  length: number,
): Uint8Array;
export function unmask(buffer: Uint8Array, mask: Uint8Array): Uint8Array;
export namespace js {
  let mask_1: (
    source: Uint8Array,
    mask: Uint8Array,
    output: Uint8Array,
    offset: number,
    length: number,
  ) => Uint8Array;
  export { mask_1 as mask };
  let unmask_1: (buffer: Uint8Array, mask: Uint8Array) => Uint8Array;
  export { unmask_1 as unmask };
}
