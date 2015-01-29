'use strict';

var typed = require('typed-function');
var BigNumber = require('decimal.js');
var Complex = require('../../type/Complex');
var collection = require('../../type/collection');
var toBigNumber = require('../../util/bignumber').toBigNumber;

/**
 * Add two values, `x + y`.
 * For matrices, the function is evaluated element wise.
 *
 * Syntax:
 *
 *    math.add(x, y)
 *
 * Examples:
 *
 *    math.add(2, 3);               // returns Number 5
 *
 *    var a = math.complex(2, 3);
 *    var b = math.complex(-4, 1);
 *    math.add(a, b);               // returns Complex -2 + 4i
 *
 *    math.add([1, 2, 3], 4);       // returns Array [5, 6, 7]
 *
 *    var c = math.unit('5 cm');
 *    var d = math.unit('2.1 mm');
 *    math.add(c, d);               // returns Unit 52.1 mm
 *
 * See also:
 *
 *    subtract
 *
 * @param  {Number | BigNumber | Boolean | Complex | Unit | String | Array | Matrix | null} x First value to add
 * @param  {Number | BigNumber | Boolean | Complex | Unit | String | Array | Matrix | null} y Second value to add
 * @return {Number | BigNumber | Complex | Unit | String | Array | Matrix} Sum of `x` and `y`
 */
// TODO: use the typed version of math.add
var add = typed('add', {
  'number, number': function (x, y) {
    return x + y;
  },

  'BigNumber, BigNumber': function (x, y) {
    return x.plus(y);
  },

  // TODO: cleanup as soon as typed-function supports fallible conversions
  'number, BigNumber': function (x, y) {
    // try to convert to BigNumber
    var bigX = toBigNumber(x, y.constructor);
    if (bigX instanceof BigNumber) {
      return bigX.plus(y);
    }

    // downgrade to Number
    return x + y.toNumber();
  },

  // TODO: cleanup as soon as typed-function supports fallible conversions
  'BigNumber, number': function (x, y) {
    // try to convert to BigNumber
    var bigY = toBigNumber(y, x.constructor);
    if (bigY instanceof BigNumber) {
      return x.plus(bigY);
    }

    // downgrade to Number
    return x.toNumber() + y;
  },

  'Complex, Complex': function (x, y) {
    return new Complex(
        x.re + y.re,
        x.im + y.im
    );
  },

  'Unit, Unit': function (x, y) {
    if (x.value == null) throw new Error('Parameter x contains a unit with undefined value');
    if (y.value == null) throw new Error('Parameter y contains a unit with undefined value');
    if (!x.equalBase(y)) throw new Error('Units do not match');

    var res = x.clone();
    res.value += y.value;
    res.fixPrefix = false;
    return res;
  },

  'Array | Matrix, any': function (x, y) {
    return collection.deepMap2(x, y, add);
  },

  'any, Array | Matrix': function (x, y) {
    return collection.deepMap2(x, y, add);
  },

  'string, string': function (x, y) {
    return x + y;
  }
});

module.exports = add;