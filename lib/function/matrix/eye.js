'use strict';

var typed = require('typed-function');

var BigNumber = require('decimal.js');
var Matrix = require('../../type/Matrix');
var isInteger = require('../../util/number').isInteger;

module.exports = function (config) {
  /**
   * Create a 2-dimensional identity matrix with size m x n or n x n.
   * The matrix has ones on the diagonal and zeros elsewhere.
   *
   * Syntax:
   *
   *    math.eye(n)
   *    math.eye(m, n)
   *    math.eye([m, n])
   *
   * Examples:
   *
   *    math.eye(3);                    // returns [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
   *    math.eye(3, 2);                 // returns [[1, 0], [0, 1], [0, 0]]
   *
   *    var A = [[1, 2, 3], [4, 5, 6]];
   *    math.eye(math.size(b));         // returns [[1, 0, 0], [0, 1, 0]]
   *
   * See also:
   *
   *    diag, ones, zeros, size, range
   *
   * @param {...Number | Matrix | Array} size   The size for the matrix
   * @return {Matrix | Array | Number} A matrix with ones on the diagonal.
   */
  return typed('eye', {
    '': function () {
      return (config.matrix === 'matrix') ? new Matrix([[1]]) : [[1]];
    },

    'number | BigNumber': function (rows) {
      var array = _eye(rows, rows);
      return (config.matrix === 'matrix') ? new Matrix(array) : array;
    },

    'number | BigNumber, number | BigNumber': function (rows, cols) {
      var array = _eye(rows, cols);
      return (config.matrix === 'matrix') ? new Matrix(array) : array;
    },

    'Array': _eyeArray,

    'Matrix': function (size) {
      return new Matrix(_eyeArray(size.valueOf()));
    }
  });

  function _eyeArray (size) {
    if (size.length != 2) {
      throw new Error('Vector containing two values expected');
    }
    return _eye(size[0], size[1]);
  }

  function _eye (rows, cols) {
    // BigNumber constructor with the right precision
    var Big = rows instanceof BigNumber ? rows.constructor :
        cols instanceof BigNumber ? cols.constructor : null;

    if (rows instanceof BigNumber) rows = rows.toNumber();
    if (cols instanceof BigNumber) cols = cols.toNumber();

    if (!isInteger(rows) || rows < 1) {
      throw new Error('Parameters in function eye must be positive integers');
    }
    if (!isInteger(cols) || cols < 1) {
      throw new Error('Parameters in function eye must be positive integers');
    }

    // create the matrix
    var matrix = new Matrix();
    var one = BigNumber ? new BigNumber(1) : 1;
    var defaultValue = Big ? new Big(0) : 0;
    matrix.resize([rows, cols], defaultValue);

    // fill in ones on the diagonal
    var minimum = Math.min(rows, cols);
    var data = matrix.valueOf();
    for (var d = 0; d < minimum; d++) {
      data[d][d] = one;
    }

    return matrix;
  }
};