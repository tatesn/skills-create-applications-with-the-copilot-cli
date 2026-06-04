'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const {
  addition,
  subtraction,
  multiplication,
  division,
  modulo,
  power,
  squareRoot,
  calculate,
  normalizeOperation,
  parseNumber,
} = require('../calculator.js');

test('addition: computes sums correctly (including image example 2 + 3)', () => {
  assert.equal(addition(2, 3), 5);
  assert.equal(addition(-2, 3), 1);
  assert.equal(addition(0, 0), 0);
  assert.equal(addition(1.5, 2.25), 3.75);
});

test('subtraction: computes differences correctly (including image example 10 - 4)', () => {
  assert.equal(subtraction(10, 4), 6);
  assert.equal(subtraction(4, 10), -6);
  assert.equal(subtraction(-3, -7), 4);
  assert.equal(subtraction(1.5, 0.25), 1.25);
});

test('multiplication: computes products correctly (including image example 45 * 2)', () => {
  assert.equal(multiplication(45, 2), 90);
  assert.equal(multiplication(-3, 4), -12);
  assert.equal(multiplication(0, 999), 0);
  assert.equal(multiplication(1.5, 2), 3);
});

test('division: computes quotients correctly (including image example 20 / 5)', () => {
  assert.equal(division(20, 5), 4);
  assert.equal(division(9, 2), 4.5);
  assert.equal(division(-9, 3), -3);
});

test('division: throws a clear error for division by zero', () => {
  assert.throws(() => division(1, 0), (err) => {
    assert.ok(err instanceof Error);
    assert.equal(err.message, 'division by zero');
    assert.equal(err.code, 'DIV_BY_ZERO');
    return true;
  });
});

test('modulo: computes remainders and errors on modulo by zero', () => {
  assert.equal(modulo(10, 3), 1);
  assert.equal(modulo(20, 5), 0);
  assert.equal(modulo(-9, 4), -1);

  assert.throws(() => modulo(1, 0), (err) => {
    assert.ok(err instanceof Error);
    assert.equal(err.message, 'modulo by zero');
    assert.equal(err.code, 'MOD_BY_ZERO');
    return true;
  });
});

test('power: computes exponentiation results', () => {
  assert.equal(power(2, 3), 8);
  assert.equal(power(9, 0.5), 3);
  assert.equal(power(5, 0), 1);
});

test('squareRoot: computes roots and errors on negative numbers', () => {
  assert.equal(squareRoot(0), 0);
  assert.equal(squareRoot(9), 3);
  assert.equal(squareRoot(2), Math.sqrt(2));

  assert.throws(() => squareRoot(-1), (err) => {
    assert.ok(err instanceof Error);
    assert.equal(err.message, 'square root of negative number');
    assert.equal(err.code, 'NEGATIVE_SQRT');
    return true;
  });
});

test('normalizeOperation: supports add/sub/mul/div/mod/pow/sqrt plus common symbols', () => {
  assert.equal(normalizeOperation('add'), 'add');
  assert.equal(normalizeOperation('ADD'), 'add');
  assert.equal(normalizeOperation(' + '), 'add');

  assert.equal(normalizeOperation('sub'), 'sub');
  assert.equal(normalizeOperation('-'), 'sub');

  assert.equal(normalizeOperation('mul'), 'mul');
  assert.equal(normalizeOperation('*'), 'mul');
  assert.equal(normalizeOperation('x'), 'mul');

  assert.equal(normalizeOperation('div'), 'div');
  assert.equal(normalizeOperation('/'), 'div');

  assert.equal(normalizeOperation('mod'), 'mod');
  assert.equal(normalizeOperation('%'), 'mod');

  assert.equal(normalizeOperation('pow'), 'pow');
  assert.equal(normalizeOperation('^'), 'pow');

  assert.equal(normalizeOperation('sqrt'), 'sqrt');

  assert.equal(normalizeOperation('nope'), null);
  assert.equal(normalizeOperation(''), null);
});

test('parseNumber: parses numeric strings and rejects non-finite values', () => {
  assert.equal(parseNumber('3', 'a'), 3);
  assert.equal(parseNumber('3.5', 'a'), 3.5);
  assert.equal(parseNumber('-2', 'a'), -2);

  assert.throws(() => parseNumber('abc', 'a'), /must be a valid number/);
  assert.throws(() => parseNumber('Infinity', 'a'), /must be a valid number/);
  assert.throws(() => parseNumber('NaN', 'a'), /must be a valid number/);
});

test('calculate: routes operations correctly and rejects unsupported operations', () => {
  assert.equal(calculate('add', 2, 3), 5);
  assert.equal(calculate('sub', 10, 4), 6);
  assert.equal(calculate('mul', 45, 2), 90);
  assert.equal(calculate('div', 20, 5), 4);
  assert.equal(calculate('mod', 10, 3), 1);
  assert.equal(calculate('pow', 2, 8), 256);
  assert.equal(calculate('sqrt', 9), 3);

  assert.throws(() => calculate('nope', 1, 2), /Unsupported operation/);
});

test('CLI: computes operation examples including new symbols', () => {
  const scriptPath = path.join(__dirname, '..', 'calculator.js');

  const run = (args) => {
    const res = spawnSync(process.execPath, [scriptPath, ...args], {
      encoding: 'utf8',
    });
    return {
      status: res.status,
      stdout: res.stdout,
      stderr: res.stderr,
    };
  };

  assert.deepEqual(run(['+', '2', '3']), { status: 0, stdout: '5\n', stderr: '' });
  assert.deepEqual(run(['-', '10', '4']), { status: 0, stdout: '6\n', stderr: '' });
  assert.deepEqual(run(['*', '45', '2']), { status: 0, stdout: '90\n', stderr: '' });
  assert.deepEqual(run(['/', '20', '5']), { status: 0, stdout: '4\n', stderr: '' });
  assert.deepEqual(run(['%', '10', '3']), { status: 0, stdout: '1\n', stderr: '' });
  assert.deepEqual(run(['^', '2', '8']), { status: 0, stdout: '256\n', stderr: '' });
  assert.deepEqual(run(['sqrt', '9']), { status: 0, stdout: '3\n', stderr: '' });
});

test('CLI: exits non-zero and prints clear messages for operation errors', () => {
  const scriptPath = path.join(__dirname, '..', 'calculator.js');

  const divisionByZero = spawnSync(process.execPath, [scriptPath, '/', '8', '0'], {
    encoding: 'utf8',
  });
  assert.equal(divisionByZero.status, 1);
  assert.match(divisionByZero.stderr, /division by zero/);

  const moduloByZero = spawnSync(process.execPath, [scriptPath, '%', '8', '0'], {
    encoding: 'utf8',
  });
  assert.equal(moduloByZero.status, 1);
  assert.match(moduloByZero.stderr, /modulo by zero/);

  const negativeSqrt = spawnSync(process.execPath, [scriptPath, 'sqrt', '-1'], {
    encoding: 'utf8',
  });
  assert.equal(negativeSqrt.status, 1);
  assert.match(negativeSqrt.stderr, /square root of negative number/);
});

test('CLI: shows usage for missing/invalid arguments', () => {
  const scriptPath = path.join(__dirname, '..', 'calculator.js');

  const missing = spawnSync(process.execPath, [scriptPath, 'add', '1'], {
    encoding: 'utf8',
  });
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /missing required arguments/);
  assert.match(missing.stdout, /Usage:/);

  const invalid = spawnSync(process.execPath, [scriptPath, 'add', 'a', '2'], {
    encoding: 'utf8',
  });
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /must be a valid number/);
  assert.match(invalid.stdout, /Usage:/);
});
