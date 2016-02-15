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
 * @fileoverview Helper functions for generating divgames for blocks.
 * @author daarond@gmail.com (Daaron Dwyer)
 */
'use strict';

goog.provide('Blockly.divgames');

goog.require('Blockly.Generator');


/**
 * divgames code generator.
 * @type {!Blockly.Generator}
 */
Blockly.divgames = new Blockly.Generator('divgames');

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * @private
 */
Blockly.divgames.addReservedWords(
        // http://php.net/manual/en/reserved.keywords.php
    '__halt_compiler,abstract,and,array,as,break,callable,case,catch,class,clone,const,continue,declare,default,die,do,echo,else,elseif,empty,enddeclare,endfor,endforeach,endif,endswitch,endwhile,eval,exit,extends,final,for,foreach,function,global,goto,if,implements,include,include_once,instanceof,insteadof,interface,isset,list,namespace,new,or,print,private,protected,public,require,require_once,return,static,switch,throw,trait,try,unset,use,var,while,xor,' +
        // http://php.net/manual/en/reserved.constants.php
    'divgames_VERSION,divgames_MAJOR_VERSION,divgames_MINOR_VERSION,divgames_RELEASE_VERSION,divgames_VERSION_ID,divgames_EXTRA_VERSION,divgames_ZTS,divgames_DEBUG,divgames_MAXPATHLEN,divgames_OS,divgames_SAPI,divgames_EOL,divgames_INT_MAX,divgames_INT_SIZE,DEFAULT_INCLUDE_PATH,PEAR_INSTALL_DIR,PEAR_EXTENSION_DIR,divgames_EXTENSION_DIR,divgames_PREFIX,divgames_BINDIR,divgames_BINARY,divgames_MANDIR,divgames_LIBDIR,divgames_DATADIR,divgames_SYSCONFDIR,divgames_LOCALSTATEDIR,divgames_CONFIG_FILE_PATH,divgames_CONFIG_FILE_SCAN_DIR,divgames_SHLIB_SUFFIX,E_ERROR,E_WARNING,E_PARSE,E_NOTICE,E_CORE_ERROR,E_CORE_WARNING,E_COMPILE_ERROR,E_COMPILE_WARNING,E_USER_ERROR,E_USER_WARNING,E_USER_NOTICE,E_DEPRECATED,E_USER_DEPRECATED,E_ALL,E_STRICT,__COMPILER_HALT_OFFSET__,TRUE,FALSE,NULL,__CLASS__,__DIR__,__FILE__,__FUNCTION__,__LINE__,__METHOD__,__NAMESPACE__,__TRAIT__');

/**
 * Order of operation ENUMs.
 * http://php.net/manual/en/language.operators.precedence.php
 */
Blockly.divgames.ORDER_ATOMIC = 0;         // 0 "" ...
Blockly.divgames.ORDER_CLONE = 1;          // clone
Blockly.divgames.ORDER_NEW = 1;            // new
Blockly.divgames.ORDER_MEMBER = 2;         // ()
Blockly.divgames.ORDER_FUNCTION_CALL = 2;  // ()
Blockly.divgames.ORDER_INCREMENT = 3;      // ++
Blockly.divgames.ORDER_DECREMENT = 3;      // --
Blockly.divgames.ORDER_LOGICAL_NOT = 4;    // !
Blockly.divgames.ORDER_BITWISE_NOT = 4;    // ~
Blockly.divgames.ORDER_UNARY_PLUS = 4;     // +
Blockly.divgames.ORDER_UNARY_NEGATION = 4; // -
Blockly.divgames.ORDER_MULTIPLICATION = 5; // *
Blockly.divgames.ORDER_DIVISION = 5;       // /
Blockly.divgames.ORDER_MODULUS = 5;        // %
Blockly.divgames.ORDER_ADDITION = 6;       // +
Blockly.divgames.ORDER_SUBTRACTION = 6;    // -
Blockly.divgames.ORDER_BITWISE_SHIFT = 7;  // << >> >>>
Blockly.divgames.ORDER_RELATIONAL = 8;     // < <= > >=
Blockly.divgames.ORDER_IN = 8;             // in
Blockly.divgames.ORDER_INSTANCEOF = 8;     // instanceof
Blockly.divgames.ORDER_EQUALITY = 9;       // == != === !==
Blockly.divgames.ORDER_BITWISE_AND = 10;   // &
Blockly.divgames.ORDER_BITWISE_XOR = 11;   // ^
Blockly.divgames.ORDER_BITWISE_OR = 12;    // |
Blockly.divgames.ORDER_CONDITIONAL = 13;   // ?:
Blockly.divgames.ORDER_ASSIGNMENT = 14;    // = += -= *= /= %= <<= >>= ...
Blockly.divgames.ORDER_LOGICAL_AND = 15;   // &&
Blockly.divgames.ORDER_LOGICAL_OR = 16;    // ||
Blockly.divgames.ORDER_COMMA = 17;         // ,
Blockly.divgames.ORDER_NONE = 99;          // (...)

/**
 * Initialise the database of variable names.
 * @param {!Blockly.Workspace} workspace Workspace to generate code from.
 */
Blockly.divgames.init = function(workspace) {
  // Create a dictionary of definitions to be printed before the code.
  Blockly.divgames.definitions_ = Object.create(null);
  // Create a dictionary mapping desired function names in definitions_
  // to actual function names (to avoid collisions with user functions).
  Blockly.divgames.functionNames_ = Object.create(null);

  if (!Blockly.divgames.variableDB_) {
    Blockly.divgames.variableDB_ =
        new Blockly.Names(Blockly.divgames.RESERVED_WORDS_, '');
  } else {
    Blockly.divgames.variableDB_.reset();
  }

  var defvars = [];
  var variables = Blockly.Variables.allVariables(workspace);
  for (var i = 0; i < variables.length; i++) {
    defvars[i] =  Blockly.divgames.variableDB_.getName(variables[i],
        Blockly.Variables.NAME_TYPE) + ';';
  }
  Blockly.divgames.definitions_['variables'] = defvars.join('\n');
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
Blockly.divgames.finish = function(code) {
  // Convert the definitions dictionary into a list.
  var definitions = [];
  var vars =   Blockly.divgames.definitions_['variables'];
  
  // unset vars so they dont get displayed twice (shit hack?)
  
  Blockly.divgames.definitions_['variables']=[];
  
  for (var name in Blockly.divgames.definitions_) {
    definitions.push(Blockly.divgames.definitions_[name]);
  }
  
  

  return "PROGRAM myprogram;\n\nGLOBAL\n" + vars  + 
  '\n\n\n'+"BEGIN\n" + code + "END\n" + definitions.join('\n\n');
  
  
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.  A trailing semicolon is needed to make this legal.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Blockly.divgames.scrubNakedValue = function(line) {
  return line + '\n';
};

/**
 * Encode a string as a properly escaped divgames string, complete with
 * quotes.
 * @param {string} string Text to encode.
 * @return {string} divgames string.
 * @private
 */
Blockly.divgames.quote_ = function(string) {
  // TODO: This is a quick hack.  Replace with goog.string.quote
  string = string.replace(/\\/g, '\\\\')
                 .replace(/\n/g, '\\\n')
                 .replace(/'/g, '\\\'');
  return '\"' + string + '\"';
};

/**
 * Common tasks for generating divgames from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {!Blockly.Block} block The current block.
 * @param {string} code The divgames code created for this block.
 * @return {string} divgames code with comments and subsequent blocks added.
 * @private
 */
Blockly.divgames.scrub_ = function(block, code) {
  var commentCode = '';
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    var comment = block.getCommentText();
    if (comment) {
      commentCode += Blockly.divgames.prefixLines(comment, '// ') + '\n';
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (var x = 0; x < block.inputList.length; x++) {
      if (block.inputList[x].type == Blockly.INPUT_VALUE) {
        var childBlock = block.inputList[x].connection.targetBlock();
        if (childBlock) {
          var comment = Blockly.divgames.allNestedComments(childBlock);
          if (comment) {
            commentCode += Blockly.divgames.prefixLines(comment, '// ');
          }
        }
      }
    }
  }
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = Blockly.divgames.blockToCode(nextBlock);
  return commentCode + code + nextCode;
};
