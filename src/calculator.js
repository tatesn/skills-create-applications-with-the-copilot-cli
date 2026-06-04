#!/usr/bin/env node
'use strict';

/**
 * Node.js CLI Calculator
 *
 * Supported operations (based only on the four basic math operations):
 *  - addition       (add or +)
 *  - subtraction    (sub or -)
 *  - multiplication (mul or * or x)
 *  - division       (div or /)
 */

function printUsage() {
  const usage = `Usage:
  node src/calculator.js <operation> <a> <b>

Operations:
  add | +        addition (a + b)
  sub | -        subtraction (a - b)
  mul | * | x    multiplication (a * b)
  div | /        division (a / b)

Examples:
  node src/calculator.js add 2 3
  node src/calculator.js sub 10 4
  node src/calculator.js mul 6 7
  node src/calculator.js div 8 2
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

    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }
}

function main(argv) {
  const [operationRaw, aRaw, bRaw] = argv;

  if (!operationRaw || aRaw == null || bRaw == null) {
    exitWithError('missing required arguments');
    return;
  }

  const operation = normalizeOperation(operationRaw);
  if (!operation) {
    exitWithError(`unsupported operation: ${JSON.stringify(operationRaw)}`);
    return;
  }

  let a;
  let b;
  try {
    a = parseNumber(aRaw, 'a');
    b = parseNumber(bRaw, 'b');
  } catch (e) {
    exitWithError(e.message);
    return;
  }

  try {
    const result = calculate(operation, a, b);
    process.stdout.write(`${result}\n`);
  } catch (e) {
    if (e && e.code === 'DIV_BY_ZERO') {
      process.stderr.write('Error: division by zero\n');
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
  calculate,
  normalizeOperation,
  parseNumber,
};
