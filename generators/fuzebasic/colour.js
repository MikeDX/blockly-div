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
 * @fileoverview Generating fuzebasic for colour blocks.
 * @author daarond@gmail.com (Daaron Dwyer)
 */
'use strict';

goog.provide('Blockly.fuzebasic.colour');

goog.require('Blockly.fuzebasic');


Blockly.fuzebasic['colour_picker'] = function(block) {
  // Colour picker.
  var code = '\'' + block.getFieldValue('COLOUR') + '\'';
  return [code, Blockly.fuzebasic.ORDER_ATOMIC];
};

Blockly.fuzebasic['colour_random'] = function(block) {
  // Generate a random colour.
  var functionName = Blockly.fuzebasic.provideFunction_(
      'colour_random',
      [ 'function ' + Blockly.fuzebasic.FUNCTION_NAME_PLACEHOLDER_ + '() {',
        '  return random(0,0)',
        '}']);
  var code = functionName + '()';
  return [code, Blockly.fuzebasic.ORDER_FUNCTION_CALL];
};

Blockly.fuzebasic['colour_rgb'] = function(block) {
  // Compose a colour from RGB components expressed as percentages.
  var red = Blockly.fuzebasic.valueToCode(block, 'RED',
      Blockly.fuzebasic.ORDER_COMMA) || 0;
  var green = Blockly.fuzebasic.valueToCode(block, 'GREEN',
      Blockly.fuzebasic.ORDER_COMMA) || 0;
  var blue = Blockly.fuzebasic.valueToCode(block, 'BLUE',
      Blockly.fuzebasic.ORDER_COMMA) || 0;
  var functionName = Blockly.fuzebasic.provideFunction_(
      'colour_rgb',
      [ 'function ' + Blockly.fuzebasic.FUNCTION_NAME_PLACEHOLDER_ +
          '($r, $g, $b) {',
        '  $r = round(max(min($r, 100), 0) * 2.55);',
        '  $g = round(max(min($g, 100), 0) * 2.55);',
        '  $b = round(max(min($b, 100), 0) * 2.55);',
        '  $hex = "#";',
        '  $hex .= str_pad(dechex($r), 2, "0", STR_PAD_LEFT);',
        '  $hex .= str_pad(dechex($g), 2, "0", STR_PAD_LEFT);',
        '  $hex .= str_pad(dechex($b), 2, "0", STR_PAD_LEFT);',
        '  return $hex;',
        '}']);
  var code = functionName + '(' + red + ', ' + green + ', ' + blue + ')';
  return [code, Blockly.fuzebasic.ORDER_FUNCTION_CALL];
};

Blockly.fuzebasic['colour_blend'] = function(block) {
  // Blend two colours together.
  var c1 = Blockly.fuzebasic.valueToCode(block, 'COLOUR1',
      Blockly.fuzebasic.ORDER_COMMA) || '\'#000000\'';
  var c2 = Blockly.fuzebasic.valueToCode(block, 'COLOUR2',
      Blockly.fuzebasic.ORDER_COMMA) || '\'#000000\'';
  var ratio = Blockly.fuzebasic.valueToCode(block, 'RATIO',
      Blockly.fuzebasic.ORDER_COMMA) || 0.5;
  var functionName = Blockly.fuzebasic.provideFunction_(
      'colour_blend',
      [ 'function ' + Blockly.fuzebasic.FUNCTION_NAME_PLACEHOLDER_ +
          '($c1, $c2, $ratio) {',
        '  $ratio = max(min($ratio, 1), 0);',
        '  $r1 = hexdec(substr($c1, 1, 2));',
        '  $g1 = hexdec(substr($c1, 3, 2));',
        '  $b1 = hexdec(substr($c1, 5, 2));',
        '  $r2 = hexdec(substr($c2, 1, 2));',
        '  $g2 = hexdec(substr($c2, 3, 2));',
        '  $b2 = hexdec(substr($c2, 5, 2));',
        '  $r = round($r1 * (1 - $ratio) + $r2 * $ratio);',
        '  $g = round($g1 * (1 - $ratio) + $g2 * $ratio);',
        '  $b = round($b1 * (1 - $ratio) + $b2 * $ratio);',
        '  $hex = "#";',
        '  $hex .= str_pad(dechex($r), 2, "0", STR_PAD_LEFT);',
        '  $hex .= str_pad(dechex($g), 2, "0", STR_PAD_LEFT);',
        '  $hex .= str_pad(dechex($b), 2, "0", STR_PAD_LEFT);',
        '  return $hex;',
        '}']);
  var code = functionName + '(' + c1 + ', ' + c2 + ', ' + ratio + ')';
  return [code, Blockly.fuzebasic.ORDER_FUNCTION_CALL];
};
