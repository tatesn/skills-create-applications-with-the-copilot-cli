#!/usr/bin/env node
'use strict';

/**
 * Node.js CLI Calculator
 *
 * Supported operations:
 *  - addition       (add or +)
 *  - subtraction    (sub or -)
 *  - multiplication (mul or * or x)
 *  - division       (div or /)
 *  - modulo         (mod or %)
 *  - power          (pow or ^)
 *  - square root    (sqrt)
 */

function printUsage() {
  const usage = `Usage:
  node src/calculator.js <operation> <a> [b]

Operations:
  add | +        addition (a + b)
  sub | -        subtraction (a - b)
  mul | * | x    multiplication (a * b)
  div | /        division (a / b)
  mod | %        modulo (a % b)
  pow | ^        exponentiation (a ^ b)
  sqrt           square root (sqrt(a))

Examples:
  node src/calculator.js add 2 3
  node src/calculator.js sub 10 4
  node src/calculator.js mul 6 7
  node src/calculator.js div 8 2
  node src/calculator.js mod 10 3
  node src/calculator.js pow 2 8
  node src/calculator.js sqrt 9
`;
  process.stdout.write(usage);
}

function exitWithError(message) {
  process.stderr.write(`Error: ${message}\n`);
  printUsage();
  process.exitCode = 1;
}

function parseNumber(value, label) {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    throw new Error(`${label} must be a valid number (received: ${JSON.stringify(value)})`);
  }
  return n;
}

function normalizeOperation(opRaw) {
  const op = String(opRaw ?? '').trim().toLowerCase();

  switch (op) {
    case 'add':
    case '+':
      return 'add';

    case 'sub':
    case '-':
      return 'sub';

    case 'mul':
    case '*':
    case 'x':
      return 'mul';

    case 'div':
    case '/':
      return 'div';

    case 'mod':
    case '%':
      return 'mod';

    case 'pow':
    case '^':
      return 'pow';

    case 'sqrt':
      return 'sqrt';

    default:
      return null;
  }
}

function addition(a, b) {
  return a + b;
}

function subtraction(a, b) {
  return a - b;
}

function multiplication(a, b) {
  return a * b;
}

function division(a, b) {
  if (b === 0) {
    const err = new Error('division by zero');
    err.code = 'DIV_BY_ZERO';
    throw err;
  }

  return a / b;
}

function modulo(a, b) {
  if (b === 0) {
    const err = new Error('modulo by zero');
    err.code = 'MOD_BY_ZERO';
    throw err;
  }

  return a % b;
}

function power(base, exponent) {
  return base ** exponent;
}

function squareRoot(n) {
  if (n < 0) {
    const err = new Error('square root of negative number');
    err.code = 'NEGATIVE_SQRT';
    throw err;
  }

  return Math.sqrt(n);
}

function calculate(operation, a, b) {
  switch (operation) {
    case 'add':
      return addition(a, b);

    case 'sub':
      return subtraction(a, b);

    case 'mul':
      return multiplication(a, b);

    case 'div':
      return division(a, b);

    case 'mod':
      return modulo(a, b);

    case 'pow':
      return power(a, b);

    case 'sqrt':
      return squareRoot(a);

    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }
}

function main(argv) {
  const [operationRaw, aRaw, bRaw] = argv;

  if (!operationRaw || aRaw == null) {
    exitWithError('missing required arguments');
    return;
  }

  const operation = normalizeOperation(operationRaw);
  if (!operation) {
    exitWithError(`unsupported operation: ${JSON.stringify(operationRaw)}`);
    return;
  }

  const requiresSecondOperand = operation !== 'sqrt';
  if (requiresSecondOperand && bRaw == null) {
    exitWithError('missing required arguments');
    return;
  }

  let a;
  let b;
  try {
    a = parseNumber(aRaw, 'a');
    if (requiresSecondOperand) {
      b = parseNumber(bRaw, 'b');
    }
  } catch (e) {
    exitWithError(e.message);
    return;
  }

  try {
    const result = calculate(operation, a, b);
    process.stdout.write(`${result}\n`);
  } catch (e) {
    if (e && (e.code === 'DIV_BY_ZERO' || e.code === 'MOD_BY_ZERO' || e.code === 'NEGATIVE_SQRT')) {
      process.stderr.write(`Error: ${e.message}\n`);
      process.exitCode = 1;
      return;
    }

    process.stderr.write(`Error: ${e?.message || String(e)}\n`);
    process.exitCode = 1;
  }
}

// If called as a CLI, run main() with the user-provided arguments.
if (require.main === module) {
  main(process.argv.slice(2));
}

module.exports = {
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
};
