//@ts-check

"use strict";

const standard = require("../../assets/standard2");
const simd = require("../../assets/simd");
const { __js_module } = require("../internal-js-module");

/**
 * @param {number} k1
 * @param {number} k2
 * @param {number} k3
 * @param {number} k4
 */
function int32(k1, k2, k3, k4) {
  return k1 + k2 * 2 ** 8 + k3 * 2 ** 16 + (k4 << 24);
}

function loadWasm() {
  /**@type {WebAssembly.Memory} */
  let memory;
  /**@type {WebAssembly.Instance} */
  let wasm;
  if (typeof WebAssembly === "undefined") {
    const { memory: _memory, wasm: _wasm } = __js_module();

    memory = _memory;

    wasm = _wasm;
  } else {
    memory = new WebAssembly.Memory({
      // 16 Kib
      initial: 1,
    });

    /**@type {WebAssembly.Module} */
    let mod;

    try {
      // simd
      mod = new WebAssembly.Module(simd);
    } catch (_err) {
      try {
        // standard
        mod = new WebAssembly.Module(standard);
      } catch (err) {
        // fallback
        throw err ?? _err ?? new Error("Unsupported");
      }
    }

    wasm = new WebAssembly.Instance(mod, {
      imports: {},
      env: {
        memory: memory,
      },
    });
  }

  /**
   * @type {(mask: number, length: number) => void}
   */
  //@ts-ignore
  const execute = wasm.exports.execute;

  return { memory: new Uint8Array(memory.buffer), execute: execute };
}

const wasm = loadWasm();

/**
 * @example
 * ```ts
 * const stream = new Stream(new Uint8Array([0, 0, 0, 0])); // mask
 * const data = socket.read(); // data
 * const unmasked = stream.write(data); // unmasked & copied & should be less or equal 16Kib
 * ```
 */
class Stream {
  /**@type {Uint8Array} */
  #mask;
  #offset = 0;

  /**
   * @param {Uint8Array} mask
   */
  constructor(mask) {
    this.#mask = mask;
  }

  /**
   * @param {Uint8Array} binary
   */
  write(binary) {
    const length = binary.length;
    if (length > 1 << 16) {
      throw new TypeError("Unsupported");
    }

    const maskKey =
      (this.#offset & 3) === 3
        ? int32(this.#mask[3], this.#mask[0], this.#mask[1], this.#mask[2])
        : (this.#offset & 3) === 2
          ? int32(this.#mask[2], this.#mask[3], this.#mask[0], this.#mask[1])
          : (this.#offset & 3) === 1
            ? int32(this.#mask[1], this.#mask[2], this.#mask[3], this.#mask[0])
            : int32(this.#mask[0], this.#mask[1], this.#mask[2], this.#mask[3]);

    wasm.memory.set(binary, 0);

    wasm.execute(maskKey, length);

    this.#offset = (this.#offset + length) & 3;

    return wasm.memory.slice(0, length);
  }
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
class StreamWriter {
  /**@type {Stream} */
  #stream;
  #offset = 0;

  /**
   * @param {Uint8Array} mask
   */
  constructor(mask) {
    this.#stream = new Stream(mask);
  }

  /**
   * @param {Uint8Array} binary
   * @returns {Uint8Array | null}
   */
  write(binary) {
    const length = binary.length;

    if (this.#offset === 0 && length <= 1 << 16) {
      this.#offset = length;

      return this.#stream.write(binary);
    }

    if (this.#offset === length) {
      return null;
    }

    const lastIndex =
      this.#offset + (1 << 16) < length ? this.#offset + (1 << 16) : length;

    const target = binary.subarray(this.#offset, lastIndex);

    this.#offset = lastIndex;

    return this.#stream.write(target);
  }
}

module.exports = { Stream, StreamWriter };
