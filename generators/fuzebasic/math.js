/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2015 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generating fuzebasic for math blocks.
 * @author daarond@gmail.com (Daaron Dwyer)
 */
'use strict';

goog.provide('Blockly.fuzebasic.math');

goog.require('Blockly.fuzebasic');


Blockly.fuzebasic['math_number'] = function(block) {
  // Numeric value.
  var code = parseFloat(block.getFieldValue('NUM'));
  return [code, Blockly.fuzebasic.ORDER_ATOMIC];
};

Blockly.fuzebasic['math_arithmetic'] = function(block) {
  // Basic arithmetic operators, and power.
  var OPERATORS = {
    'ADD': [' + ', Blockly.fuzebasic.ORDER_ADDITION],
    'MINUS': [' - ', Blockly.fuzebasic.ORDER_SUBTRACTION],
    'MULTIPLY': [' * ', Blockly.fuzebasic.ORDER_MULTIPLICATION],
    'DIVIDE': [' / ', Blockly.fuzebasic.ORDER_DIVISION],
    'POWER': [null, Blockly.fuzebasic.ORDER_COMMA]  // Handle power separately.
  };
  var tuple = OPERATORS[block.getFieldValue('OP')];
  var operator = tuple[0];
  var order = tuple[1];
  var argument0 = Blockly.fuzebasic.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.fuzebasic.valueToCode(block, 'B', order) || '0';
  var code;
  // Power in fuzebasic requires a special case since it has no operator.
  if (!operator) {
    code = 'pow(' + argument0 + ', ' + argument1 + ')';
    return [code, Blockly.fuzebasic.ORDER_FUNCTION_CALL];
  }
  code = argument0 + operator + argument1;
  return [code, order];
};

Blockly.fuzebasic['math_single'] = function(block) {
  // Math operators with single operand.
  var operator = block.getFieldValue('OP');
  var code;
  var arg;
  if (operator == 'NEG') {
    // Negation is a special case given its different operator precedence.
    arg = Blockly.fuzebasic.valueToCode(block, 'NUM',
        Blockly.fuzebasic.ORDER_UNARY_NEGATION) || '0';
    if (arg[0] == '-') {
      // --3 is not legal in JS.
      arg = ' ' + arg;
    }
    code = '-' + arg;
    return [code, Blockly.fuzebasic.ORDER_UNARY_NEGATION];
  }
  if (operator == 'SIN' || operator == 'COS' || operator == 'TAN') {
    arg = Blockly.fuzebasic.valueToCode(block, 'NUM',
        Blockly.fuzebasic.ORDER_DIVISION) || '0';
  } else {
    arg = Blockly.fuzebasic.valueToCode(block, 'NUM',
        Blockly.fuzebasic.ORDER_NONE) || '0';
  }
  // First, handle cases which generate values that don't need parentheses
  // wrapping the code.
  switch (operator) {
    case 'ABS':
      code = 'abs(' + arg + ')';
      break;
    case 'ROOT':
      code = 'sqrt(' + arg + ')';
      break;
    case 'LN':
      code = 'log(' + arg + ')';
      break;
    case 'EXP':
      code = 'exp(' + arg + ')';
      break;
    case 'POW10':
      code = 'pow(10,' + arg + ')';
      break;
    case 'ROUND':
      code = 'round(' + arg + ')';
      break;
    case 'ROUNDUP':
      code = 'ceil(' + arg + ')';
      break;
    case 'ROUNDDOWN':
      code = 'floor(' + arg + ')';
      break;
    case 'SIN':
      code = 'sin(' + arg + ' / 180 * pi())';
      break;
    case 'COS':
      code = 'cos(' + arg + ' / 180 * pi())';
      break;
    case 'TAN':
      code = 'tan(' + arg + ' / 180 * pi())';
      break;
  }
  if (code) {
    return [code, Blockly.fuzebasic.ORDER_FUNCTION_CALL];
  }
  // Second, handle cases which generate values that may need parentheses
  // wrapping the code.
  switch (operator) {
    case 'LOG10':
      code = 'log(' + arg + ') / log(10)';
      break;
    case 'ASIN':
      code = 'asin(' + arg + ') / pi() * 180';
      break;
    case 'ACOS':
      code = 'acos(' + arg + ') / pi() * 180';
      break;
    case 'ATAN':
      code = 'atan(' + arg + ') / pi() * 180';
      break;
    default:
      throw 'Unknown math operator: ' + operator;
  }
  return [code, Blockly.fuzebasic.ORDER_DIVISION];
};

Blockly.fuzebasic['math_constant'] = function(block) {
  // Constants: PI, E, the Golden Ratio, sqrt(2), 1/sqrt(2), INFINITY.
  var CONSTANTS = {
    'PI': ['M_PI', Blockly.fuzebasic.ORDER_ATOMIC],
    'E': ['M_E', Blockly.fuzebasic.ORDER_ATOMIC],
    'GOLDEN_RATIO': ['(1 + sqrt(5)) / 2', Blockly.fuzebasic.ORDER_DIVISION],
    'SQRT2': ['M_SQRT2', Blockly.fuzebasic.ORDER_ATOMIC],
    'SQRT1_2': ['M_SQRT1_2', Blockly.fuzebasic.ORDER_ATOMIC],
    'INFINITY': ['INF', Blockly.fuzebasic.ORDER_ATOMIC]
  };
  return CONSTANTS[block.getFieldValue('CONSTANT')];
};

Blockly.fuzebasic['math_number_property'] = function(block) {
  // Check if a number is even, odd, prime, whole, positive, or negative
  // or if it is divisible by certain number. Returns true or false.
  var number_to_check = Blockly.fuzebasic.valueToCode(block, 'NUMBER_TO_CHECK',
      Blockly.fuzebasic.ORDER_MODULUS) || '0';
  var dropdown_property = block.getFieldValue('PROPERTY');
  var code;
  if (dropdown_property == 'PRIME') {
    // Prime is a special case as it is not a one-liner test.
    var functionName = Blockly.fuzebasic.provideFunction_(
        'math_isPrime',
        [ 'function ' + Blockly.fuzebasic.FUNCTION_NAME_PLACEHOLDER_ + '($n) {',
          '  // https://en.wikipedia.org/wiki/Primality_test#Naive_methods',
          '  if ($n == 2 || $n == 3) {',
          '    return true;',
          '  }',
          '  // False if n is NaN, negative, is 1, or not whole.',
          '  // And false if n is divisible by 2 or 3.',
          '  if (!is_numeric($n) || $n <= 1 || $n % 1 != 0 || $n % 2 == 0 ||' +
          ' $n % 3 == 0) {',
          '    return false;',
          '  }',
          '  // Check all the numbers of form 6k +/- 1, up to sqrt(n).',
          '  for ($x = 6; $x <= sqrt($n) + 1; $x += 6) {',
          '    if ($n % ($x - 1) == 0 || $n % ($x + 1) == 0) {',
          '      return false;',
          '    }',
          '  }',
          '  return true;',
          '}']);
    code = functionName + '(' + number_to_check + ')';
    return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  }
  switch (dropdown_property) {
    case 'EVEN':
      code = number_to_check + ' % 2 == 0';
      break;
    case 'ODD':
      code = number_to_check + ' % 2 == 1';
      break;
    case 'WHOLE':
      code = 'is_int(' + number_to_check + ')';
      break;
    case 'POSITIVE':
      code = number_to_check + ' > 0';
      break;
    case 'NEGATIVE':
      code = number_to_check + ' < 0';
      break;
    case 'DIVISIBLE_BY':
      var divisor = Blockly.fuzebasic.valueToCode(block, 'DIVISOR',
          Blockly.fuzebasic.ORDER_MODULUS) || '0';
      code = number_to_check + ' % ' + divisor + ' == 0';
      break;
  }
  return [code, Blockly.fuzebasic.ORDER_EQUALITY];
};

Blockly.fuzebasic['math_change'] = function(block) {
  // Add to a variable in place.
  var argument0 = Blockly.fuzebasic.valueToCode(block, 'DELTA',
      Blockly.fuzebasic.ORDER_ADDITION) || '0';
  var varName = Blockly.fuzebasic.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  return varName + ' += ' + argument0 + ';\n';
};

// Rounding functions have a single operand.
Blockly.fuzebasic['math_round'] = Blockly.fuzebasic['math_single'];
// Trigonometry functions have a single operand.
Blockly.fuzebasic['math_trig'] = Blockly.fuzebasic['math_single'];

Blockly.fuzebasic['math_on_list'] = function(block) {
  // Math functions for lists.
  var func = block.getFieldValue('OP');
  var list, code;
  switch (func) {
    case 'SUM':
      list = Blockly.fuzebasic.valueToCode(block, 'LIST',
          Blockly.fuzebasic.ORDER_FUNCTION_CALL) || 'array()';
      code = 'array_sum(' + list + ')';
      break;
    case 'MIN':
      list = Blockly.fuzebasic.valueToCode(block, 'LIST',
          Blockly.fuzebasic.ORDER_FUNCTION_CALL) || 'array()';
      code = 'min(' + list + ')';
      break;
    case 'MAX':
      list = Blockly.fuzebasic.valueToCode(block, 'LIST',
          Blockly.fuzebasic.ORDER_FUNCTION_CALL) || 'array()';
      code = 'max(' + list + ')';
      break;
    case 'AVERAGE':
      var functionName = Blockly.fuzebasic.provideFunction_(
          'math_mean',
          [ 'function ' + Blockly.fuzebasic.FUNCTION_NAME_PLACEHOLDER_ +
              '($myList) {',
            '  return array_sum($myList) / count($myList);',
            '}']);
      list = Blockly.fuzebasic.valueToCode(block, 'LIST',
          Blockly.fuzebasic.ORDER_NONE) || 'array()';
      code = functionName + '(' + list + ')';
      break;
    case 'MEDIAN':
      var functionName = Blockly.fuzebasic.provideFunction_(
          'math_median',
          [ 'function ' + Blockly.fuzebasic.FUNCTION_NAME_PLACEHOLDER_ +
              '($arr) {',
            '  sort($arr,SORT_NUMERIC);',
            '  return (count($arr) % 2) ? $arr[floor(count($arr)/2)] : ',
            '      ($arr[floor(count($arr)/2)] + $arr[floor(count($arr)/2) - 1]) / 2;',
            '}']);
      list = Blockly.fuzebasic.valueToCode(block, 'LIST',
          Blockly.fuzebasic.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    case 'MODE':
      // As a list of numbers can contain more than one mode,
      // the returned result is provided as an array.
      // Mode of [3, 'x', 'x', 1, 1, 2, '3'] -> ['x', 1].
      var functionName = Blockly.fuzebasic.provideFunction_(
          'math_modes',
          [ 'function ' + Blockly.fuzebasic.FUNCTION_NAME_PLACEHOLDER_ +
              '($values) {',
            '  $v = array_count_values($values);',
            '  arsort($v);',
            '  foreach($v as $k => $v){$total = $k; break;}',
            '  return array($total);',
            '}']);
      list = Blockly.fuzebasic.valueToCode(block, 'LIST',
          Blockly.fuzebasic.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    case 'STD_DEV':
      var functionName = Blockly.fuzebasic.provideFunction_(
          'math_standard_deviation',
          [ 'function ' + Blockly.fuzebasic.FUNCTION_NAME_PLACEHOLDER_ +
          '($numbers) {',
            '  $n = count($numbers);',
            '  if (!$n) return null;',
            '  $mean = array_sum($numbers) / count($numbers);',
            '  foreach($numbers as $key => $num) $devs[$key] = pow($num - $mean, 2);',
            '  return sqrt(array_sum($devs) / (count($devs) - 1));',
            '}']);
      list = Blockly.fuzebasic.valueToCode(block, 'LIST',
              Blockly.fuzebasic.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    case 'RANDOM':
      var functionName = Blockly.fuzebasic.provideFunction_(
          'math_random_list',
          [ 'function ' + Blockly.fuzebasic.FUNCTION_NAME_PLACEHOLDER_ +
              '($list) {',
            '  $x = rand(0, count($list)-1);',
            '  return $list[$x];',
            '}']);
      list = Blockly.fuzebasic.valueToCode(block, 'LIST',
          Blockly.fuzebasic.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    default:
      throw 'Unknown operator: ' + func;
  }
  return [code, Blockly.fuzebasic.ORDER_FUNCTION_CALL];
};

Blockly.fuzebasic['math_modulo'] = function(block) {
  // Remainder computation.
  var argument0 = Blockly.fuzebasic.valueToCode(block, 'DIVIDEND',
      Blockly.fuzebasic.ORDER_MODULUS) || '0';
  var argument1 = Blockly.fuzebasic.valueToCode(block, 'DIVISOR',
      Blockly.fuzebasic.ORDER_MODULUS) || '0';
  var code = argument0 + ' % ' + argument1;
  return [code, Blockly.fuzebasic.ORDER_MODULUS];
};

Blockly.fuzebasic['math_constrain'] = function(block) {
  // Constrain a number between two limits.
  var argument0 = Blockly.fuzebasic.valueToCode(block, 'VALUE',
      Blockly.fuzebasic.ORDER_COMMA) || '0';
  var argument1 = Blockly.fuzebasic.valueToCode(block, 'LOW',
      Blockly.fuzebasic.ORDER_COMMA) || '0';
  var argument2 = Blockly.fuzebasic.valueToCode(block, 'HIGH',
      Blockly.fuzebasic.ORDER_COMMA) || 'Infinity';
  var code = 'min(max(' + argument0 + ', ' + argument1 + '), ' +
      argument2 + ')';
  return [code, Blockly.fuzebasic.ORDER_FUNCTION_CALL];
};

Blockly.fuzebasic['math_random_int'] = function(block) {
  // Random integer between [X] and [Y].
  var argument0 = Blockly.fuzebasic.valueToCode(block, 'FROM',
      Blockly.fuzebasic.ORDER_COMMA) || '0';
  var argument1 = Blockly.fuzebasic.valueToCode(block, 'TO',
      Blockly.fuzebasic.ORDER_COMMA) || '0';
  var functionName = Blockly.fuzebasic.provideFunction_(
      'math_random_int',
      [ 'function ' + Blockly.fuzebasic.FUNCTION_NAME_PLACEHOLDER_ +
          '($a, $b) {',
        '  if ($a > $b) {',
        '    return rand($b, $a);',
        '  }',
        '  return rand($a, $b);',
        '}']);
  var code = functionName + '(' + argument0 + ', ' + argument1 + ')';
  return [code, Blockly.fuzebasic.ORDER_FUNCTION_CALL];
};

Blockly.fuzebasic['math_random_float'] = function(block) {
  // Random fraction between 0 and 1.
  return ['(float)rand()/(float)getrandmax()', Blockly.fuzebasic.ORDER_FUNCTION_CALL];
};
