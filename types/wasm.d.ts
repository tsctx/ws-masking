export function initialize(): Promise<void>;
export function mask(
  source: Uint8Array,
  mask: Uint8Array,
  output: Uint8Array,
  offset: number,
  length: number,
): Uint8Array;
export function unmask(buffer: Uint8Array, mask: Uint8Array): Uint8Array;
