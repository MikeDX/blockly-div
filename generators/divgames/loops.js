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
 * @fileoverview Generating divgames for loop blocks.
 * @author daarond@gmail.com (Daaron Dwyer)
 */
'use strict';

goog.provide('Blockly.divgames.loops');

goog.require('Blockly.divgames');


Blockly.divgames['controls_repeat'] = function(block) {
  // Repeat n times (internal number).
  var repeats = Number(block.getFieldValue('TIMES'));
  var branch = Blockly.divgames.statementToCode(block, 'DO');
  branch = Blockly.divgames.addLoopTrap(branch, block.id);
  var loopVar = Blockly.divgames.variableDB_.getDistinctName(
      'count', Blockly.Variables.NAME_TYPE);
  var code = 'for (' + loopVar + ' = 0; ' +
      loopVar + ' < ' + repeats + '; ' +
      loopVar + '++) {\n' +
      branch + '}\n';
  return code;
};

Blockly.divgames['controls_repeat_ext'] = function(block) {
  // Repeat n times (external number).
  var repeats = Blockly.divgames.valueToCode(block, 'TIMES',
      Blockly.divgames.ORDER_ASSIGNMENT) || '0';
  var branch = Blockly.divgames.statementToCode(block, 'DO');
  branch = Blockly.divgames.addLoopTrap(branch, block.id);
  var code = '';
  var loopVar = Blockly.divgames.variableDB_.getDistinctName(
      'count', Blockly.Variables.NAME_TYPE);
  
  var endVar = repeats;
  if (!repeats.match(/^\w+$/) && !Blockly.isNumber(repeats)) {
    var endVar = Blockly.divgames.variableDB_.getDistinctName(
        'repeat_end', Blockly.Variables.NAME_TYPE);
    code += endVar + ' = ' + repeats + ';\n';
  }
  code += 'FROM ' + loopVar + ' = 0 TO ' +
      endVar + '\n ' +
      branch + '\n' +
      'END\n\n';
  return code;
};

Blockly.divgames['controls_whileUntil'] = function(block) {
  // Do while/until loop.
  var until = block.getFieldValue('MODE') == 'UNTIL';
  var argument0 = Blockly.divgames.valueToCode(block, 'BOOL',
      until ? Blockly.divgames.ORDER_LOGICAL_NOT :
      Blockly.divgames.ORDER_NONE) || 'false';
  var branch = Blockly.divgames.statementToCode(block, 'DO');
  branch = Blockly.divgames.addLoopTrap(branch, block.id);
  if (until) {
    argument0 = '!' + argument0;
  }
  return 'WHILE (' + argument0 + ') \n' + branch + '\nEND\n\n';
};

Blockly.divgames['controls_for'] = function(block) {
  // For loop.
  var variable0 = Blockly.divgames.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.divgames.valueToCode(block, 'FROM',
      Blockly.divgames.ORDER_ASSIGNMENT) || '0';
  var argument1 = Blockly.divgames.valueToCode(block, 'TO',
      Blockly.divgames.ORDER_ASSIGNMENT) || '0';
  var increment = Blockly.divgames.valueToCode(block, 'BY',
      Blockly.divgames.ORDER_ASSIGNMENT) || '1';
  var branch = Blockly.divgames.statementToCode(block, 'DO');
  branch = Blockly.divgames.addLoopTrap(branch, block.id);
  var code;
  if (Blockly.isNumber(argument0) && Blockly.isNumber(argument1) &&
      Blockly.isNumber(increment)) {
    // All arguments are simple numbers.
    var up = parseFloat(argument0) <= parseFloat(argument1);
    code = 'FROM ' + variable0 + ' = ' + argument0 + ' TO ' + argument1 + ' ';
    
    var step = Math.abs(parseFloat(increment));

	code += ' STEP ';
	
    code += up ? '' : '-' + step;
    
    code += ';\n' + branch + '\nEND\n\n';
  } else {
    code = '';
    // Cache non-trivial values to variables to prevent repeated look-ups.
    var startVar = argument0;
    if (!argument0.match(/^\w+$/) && !Blockly.isNumber(argument0)) {
      startVar = Blockly.divgames.variableDB_.getDistinctName(
          variable0 + '_start', Blockly.Variables.NAME_TYPE);
      code += startVar + ' = ' + argument0 + ';\n';
    }
    var endVar = argument1;
    if (!argument1.match(/^\w+$/) && !Blockly.isNumber(argument1)) {
      var endVar = Blockly.divgames.variableDB_.getDistinctName(
          variable0 + '_end', Blockly.Variables.NAME_TYPE);
      code += endVar + ' = ' + argument1 + ';\n';
    }
    // Determine loop direction at start, in case one of the bounds
    // changes during loop execution.
    var incVar = Blockly.divgames.variableDB_.getDistinctName(
        variable0 + '_inc', Blockly.Variables.NAME_TYPE);
    code += incVar + ' = ';
    if (Blockly.isNumber(increment)) {
      code += Math.abs(increment) + ';\n';
    } else {
      code += 'abs(' + increment + ');\n';
    }
    code += 'if (' + startVar + ' > ' + endVar + ') {\n';
    code += Blockly.divgames.INDENT + incVar + ' = -' + incVar + ';\n';
    code += '}\n';
    code += 'for (' + variable0 + ' = ' + startVar + ';\n' +
        '     ' + incVar + ' >= 0 ? ' +
        variable0 + ' <= ' + endVar + ' : ' +
        variable0 + ' >= ' + endVar + ';\n' +
        '     ' + variable0 + ' += ' + incVar + ') {\n' +
        branch + '}\n';
  }
  return code;
};

Blockly.divgames['controls_forEach'] = function(block) {
  // For each loop.
  var variable0 = Blockly.divgames.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.divgames.valueToCode(block, 'LIST',
      Blockly.divgames.ORDER_ASSIGNMENT) || '[]';
  var branch = Blockly.divgames.statementToCode(block, 'DO');
  branch = Blockly.divgames.addLoopTrap(branch, block.id);
  var code = '';
  code += 'foreach (' + argument0 + ' as ' + variable0 +
      ') {\n' + branch + '}\n';
  return code;
};

Blockly.divgames['controls_flow_statements'] = function(block) {
  // Flow statements: continue, break.
  switch (block.getFieldValue('FLOW')) {
    case 'BREAK':
      return 'break;\n';
    case 'CONTINUE':
      return 'continue;\n';
  }
  throw 'Unknown flow statement.';
};
