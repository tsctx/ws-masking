/**
 * @example
 * ```ts
 * const stream = new Stream(new Uint8Array([0, 0, 0, 0])); // mask
 * const data = socket.read(); // data
 * const unmasked = stream.write(data); // unmasked & copied & should be less or equal 16Kib
 * ```
 */
export class Stream {
  /**
   * @param {Uint8Array} mask
   */
  constructor(mask: Uint8Array);
  /**
   * @param {Uint8Array} binary
   */
  write(binary: Uint8Array): Uint8Array<ArrayBuffer>;
  #private;
}
/**
 * @example
 * ```ts
 * const stream = new StreamWriter(new Uint8Array([0, 0, 0, 0])); // mask
 * const data = socket.readAll(); // data
 * for (let chunk = stream.write(data); chunk !== null; chunk = stream.write(data)) {
 *   // ...process
 * }
 * ```
 */
export class StreamWriter {
  /**
   * @param {Uint8Array} mask
   */
  constructor(mask: Uint8Array);
  /**
   * @param {Uint8Array} binary
   * @returns {Uint8Array | null}
   */
  write(binary: Uint8Array): Uint8Array | null;
  #private;
}
