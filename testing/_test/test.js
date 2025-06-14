"use strict";

const { test } = require("node:test");
const assert = require("node:assert");

/**
 * @param {{ mask: Function, unmask: Function }} module
 * @param {string} implementationName
 */
function runTests(module, implementationName) {
  const maskBytes = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
  test(`mask function (${implementationName})`, (t) => {
    t.test(
      "should correctly mask a Uint8Array with varying mask cycles",
      () => {
        const source = new Uint8Array([
          0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b,
          0x0c, 0x0d, 0x0e, 0x0f, 0x10,
        ]);
        const output = new Uint8Array(16);
        const expected = source.map((v, i) => v ^ maskBytes[i & 3]);

        module.mask(source, maskBytes, output, 0, source.length);
        assert.deepStrictEqual(output, expected);
      },
    );

    t.test("should correctly mask with an offset and partial length", () => {
      const source = new Uint8Array([0x10, 0x20, 0x30, 0x40, 0x50]);
      const output = new Uint8Array(8).fill(0xee);
      const expected = new Uint8Array([
        0xee, 0xee, 0x11, 0x22, 0x33, 0xee, 0xee, 0xee,
      ]);

      module.mask(source, maskBytes, output, 2, 3);
      assert.deepStrictEqual(output, expected);
    });

    t.test("should handle empty source array with length 0", () => {
      const source = new Uint8Array(0);
      const output = new Uint8Array(5);
      const expected = new Uint8Array(5);

      module.mask(source, maskBytes, output, 0, 0);
      assert.deepStrictEqual(output, expected);
    });

    t.test("should handle length 0 with non-empty source", () => {
      const source = new Uint8Array([0x11, 0x22, 0x33]);
      const output = new Uint8Array(3).fill(0xee);
      const expected = new Uint8Array(3).fill(0xee);

      module.mask(source, maskBytes, output, 0, 0);
      assert.deepStrictEqual(output, expected);
    });
  });

  test(`unmask function (${implementationName})`, (t) => {
    t.test(
      "should correctly unmask a buffer that cycled through the mask multiple times",
      () => {
        const original = new Uint8Array([
          0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b,
          0x0c, 0x0d, 0x0e, 0x0f, 0x10,
        ]);
        const maskedBuffer = original.map((v, i) => v ^ maskBytes[i & 3]);

        module.unmask(maskedBuffer, maskBytes);
        assert.deepStrictEqual(maskedBuffer, original);
      },
    );

    t.test("should correctly unmask a short buffer", () => {
      const maskedBuffer = new Uint8Array([0xab, 0xb9]);
      const expected = maskedBuffer.map((v, i) => v ^ maskBytes[i & 3]);

      module.unmask(maskedBuffer, maskBytes);
      assert.deepStrictEqual(maskedBuffer, expected);
    });

    t.test("should handle empty buffer", () => {
      const buffer = new Uint8Array(0);
      const expected = new Uint8Array(0);

      module.unmask(buffer, maskBytes);
      assert.deepStrictEqual(buffer, expected);
    });
  });
}

module.exports = runTests;
