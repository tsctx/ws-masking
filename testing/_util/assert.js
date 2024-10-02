//@ts-check

"use strict";

/**
 * @param {unknown} condition
 * @param {string | Error} [message]
 */
function assert(condition, message = "Assertion failed") {
  if (!condition) {
    throw new TypeError(`${message}`);
  }
}

module.exports = assert;
