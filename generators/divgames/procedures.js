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
 * @fileoverview Generating divgames for procedure blocks.
 * @author daarond@gmail.com (Daaron Dwyer)
 */
'use strict';

goog.provide('Blockly.divgames.procedures');

goog.require('Blockly.divgames');

Blockly.divgames['procedures_defreturn'] = function(block) {
  // Define a procedure with a return value.
  // First, add a 'global' statement for every variable that is assigned.
  var globals = Blockly.Variables.allVariables(block);
  for (var i = globals.length - 1; i >= 0; i--) {
      var varName = globals[i];
      if (block.arguments_.indexOf(varName) == -1) {
          globals[i] = Blockly.divgames.variableDB_.getName(varName,
              Blockly.Variables.NAME_TYPE);
      } else {
          // This variable is actually a parameter name.  Do not include it in
          // the list of globals, thus allowing it be of local scope.
          globals.splice(i, 1);
      }
  }
//  globals = globals.length ? '  global ' + globals.join(', ') + ';\n' : '';

  var funcName = Blockly.divgames.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var branch = Blockly.divgames.statementToCode(block, 'STACK');
  if (Blockly.divgames.STATEMENT_PREFIX) {
    branch = Blockly.divgames.prefixLines(
        Blockly.divgames.STATEMENT_PREFIX.replace(/%1/g,
        '\'' + block.id + '\''), Blockly.divgames.INDENT) + branch;
  }
  if (Blockly.divgames.INFINITE_LOOP_TRAP) {
    branch = Blockly.divgames.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'' + block.id + '\'') + branch;
  }
  var returnValue = Blockly.divgames.valueToCode(block, 'RETURN',
      Blockly.divgames.ORDER_NONE) || '';
  if (returnValue) {
    returnValue = '= ' + returnValue + '\n';
  }
  var args = [];
  for (var x = 0; x < block.arguments_.length; x++) {
    args[x] = Blockly.divgames.variableDB_.getName(block.arguments_[x],
        Blockly.Variables.NAME_TYPE);
  }
  var code = 'PROCESS ' + funcName + '(' + args.join(', ') + ') \nBEGIN\n' +
      branch + returnValue + '\nEND // end process loop\n';
  code = Blockly.divgames.scrub_(block, code);
  Blockly.divgames.definitions_[funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
Blockly.divgames['procedures_defnoreturn'] =
    Blockly.divgames['procedures_defreturn'];

Blockly.divgames['procedures_callreturn'] = function(block) {
  // Call a procedure with a return value.
  var funcName = Blockly.divgames.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var x = 0; x < block.arguments_.length; x++) {
    args[x] = Blockly.divgames.valueToCode(block, 'ARG' + x,
        Blockly.divgames.ORDER_COMMA) || 'null';
  }
  var code = '// spawn ' +funcname + 'process\n' + funcName + '(' + args.join(', ') + ')';
  return [code, Blockly.divgames.ORDER_FUNCTION_CALL];
};

Blockly.divgames['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  var funcName = Blockly.divgames.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var x = 0; x < block.arguments_.length; x++) {
    args[x] = Blockly.divgames.valueToCode(block, 'ARG' + x,
        Blockly.divgames.ORDER_COMMA) || 'null';
  }
  var code = funcName + '(' + args.join(', ') + ');\n';
  return code;
};

Blockly.divgames['procedures_ifreturn'] = function(block) {
  // Conditionally return value from a procedure.
  var condition = Blockly.divgames.valueToCode(block, 'CONDITION',
      Blockly.divgames.ORDER_NONE) || 'false';
  var code = 'if (' + condition + ') {\n';
  if (block.hasReturnValue_) {
    var value = Blockly.divgames.valueToCode(block, 'VALUE',
        Blockly.divgames.ORDER_NONE) || 'null';
    code += '  return ' + value + ';\n';
  } else {
    code += '  return;\n';
  }
  code += '}\n';
  return code;
};
