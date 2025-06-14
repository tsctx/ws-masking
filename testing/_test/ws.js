"use strict";

/*
 * Copyright (c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * Copyright (c) 2013 Arnout Kazemier and contributors
 * Copyright (c) 2016 Luigi Pinca and contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

const { deepStrictEqual } = require("node:assert");
const { test } = require("node:test");

module.exports = (
  /** @type {{ mask: (arg0: Uint8Array, arg1: Uint8Array, arg2: Uint8Array, arg3: number, arg4: number) => void; unmask: (arg0: Uint8Array, arg1: Uint8Array) => void; }} */ bufferUtil,
) => {
  test("masks a buffer (1/2)", function () {
    const buf = Buffer.from([0x6c, 0x3c, 0x58, 0xd9, 0x3e, 0x21, 0x09, 0x9f]);
    const mask = Buffer.from([0x48, 0x2a, 0xce, 0x24]);

    bufferUtil.mask(buf, mask, buf, 0, buf.length);

    deepStrictEqual(
      buf,
      Buffer.from([0x24, 0x16, 0x96, 0xfd, 0x76, 0x0b, 0xc7, 0xbb]),
    );
  });

  test("masks a buffer (2/2)", function () {
    const src = Buffer.from([0x6c, 0x3c, 0x58, 0xd9, 0x3e, 0x21, 0x09, 0x9f]);
    const mask = Buffer.from([0x48, 0x2a, 0xce, 0x24]);
    const dest = Buffer.alloc(src.length + 2);

    bufferUtil.mask(src, mask, dest, 2, src.length);

    deepStrictEqual(
      dest,
      Buffer.from([0x00, 0x00, 0x24, 0x16, 0x96, 0xfd, 0x76, 0x0b, 0xc7, 0xbb]),
    );
  });

  test("unmasks a buffer", function () {
    const buf = Buffer.from([0x24, 0x16, 0x96, 0xfd, 0x76, 0x0b, 0xc7, 0xbb]);
    const mask = Buffer.from([0x48, 0x2a, 0xce, 0x24]);

    bufferUtil.unmask(buf, mask);

    deepStrictEqual(
      buf,
      Buffer.from([0x6c, 0x3c, 0x58, 0xd9, 0x3e, 0x21, 0x09, 0x9f]),
    );
  });
};
