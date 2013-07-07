// Note: Some Emscripten settings will significantly limit the speed of the generated code.
// Note: Some Emscripten settings may limit the speed of the generated code.
try {
  this['Module'] = Module;
  Module.test;
} catch(e) {
  this['Module'] = Module = {};
}
// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (typeof module === "object") {
  module.exports = Module;
}
if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  Module['print'] = function(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function(x) {
    process['stderr'].write(x + '\n');
  };
  var nodeFS = require('fs');
  var nodePath = require('path');
  Module['read'] = function(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };
  Module['readBinary'] = function(filename) { return Module['read'](filename, true) };
  Module['load'] = function(f) {
    globalEval(read(f));
  };
  if (!Module['arguments']) {
    Module['arguments'] = process['argv'].slice(2);
  }
}
if (ENVIRONMENT_IS_SHELL) {
  Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm
  Module['read'] = read;
  Module['readBinary'] = function(f) {
    return read(f, 'binary');
  };
  if (!Module['arguments']) {
    if (typeof scriptArgs != 'undefined') {
      Module['arguments'] = scriptArgs;
    } else if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}
if (ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER) {
  if (!Module['print']) {
    Module['print'] = function(x) {
      console.log(x);
    };
  }
  if (!Module['printErr']) {
    Module['printErr'] = function(x) {
      console.log(x);
    };
  }
}
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (!Module['arguments']) {
    if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}
if (ENVIRONMENT_IS_WORKER) {
  // We can do very little here...
  var TRY_USE_DUMP = false;
  if (!Module['print']) {
    Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }
  Module['load'] = importScripts;
}
if (!ENVIRONMENT_IS_WORKER && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_SHELL) {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}
function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***
// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];
// Callbacks
if (!Module['preRun']) Module['preRun'] = [];
if (!Module['postRun']) Module['postRun'] = [];
// === Auto-generated preamble library stuff ===
//========================================
// Runtime code shared with compiler
//========================================
var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      var logg = log2(quantum);
      return '((((' +target + ')+' + (quantum-1) + ')>>' + logg + ')<<' + logg + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type, quantumSize) {
    if (Runtime.QUANTUM_SIZE == 1) return 1;
    var size = {
      '%i1': 1,
      '%i8': 1,
      '%i16': 2,
      '%i32': 4,
      '%i64': 8,
      "%float": 4,
      "%double": 8
    }['%'+type]; // add '%' since float and double confuse Closure compiler as keys, and also spidermonkey as a compiler will remove 's from '_i8' etc
    if (!size) {
      if (type.charAt(type.length-1) == '*') {
        size = Runtime.QUANTUM_SIZE; // A pointer
      } else if (type[0] == 'i') {
        var bits = parseInt(type.substr(1));
        assert(bits % 8 == 0);
        size = bits/8;
      }
    }
    return size;
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (type == 'i64' || type == 'double' || vararg) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    type.flatIndexes = type.fields.map(function(field) {
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        size = Types.types[field].flatSize;
        alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else {
        throw 'Unclear type in struct: ' + field + ', in ' + type.name_ + ' :: ' + dump(Types.types[type.name_]);
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2 + 2*i;
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xff;
      if (needed) {
        buffer.push(code);
        needed--;
      }
      if (buffer.length == 0) {
        if (code < 128) return String.fromCharCode(code);
        buffer.push(code);
        if (code > 191 && code < 224) {
          needed = 1;
        } else {
          needed = 2;
        }
        return '';
      }
      if (needed > 0) return '';
      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var ret;
      if (c1 > 191 && c1 < 224) {
        ret = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
      } else {
        ret = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = ((((STACKTOP)+7)>>3)<<3); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = ((((STATICTOP)+7)>>3)<<3); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = ((((DYNAMICTOP)+7)>>3)<<3); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+(((low)>>>(0))))+((+(((high)>>>(0))))*(+(4294967296)))) : ((+(((low)>>>(0))))+((+(((high)|(0))))*(+(4294967296))))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function abort(text) {
  Module.print(text + ':\n' + (new Error).stack);
  ABORT = true;
  throw "Assertion: " + text;
}
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}
var globalScope = this;
// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;
// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = globalScope['Module']['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}
// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length+1);
      writeStringToMemory(value, ret);
      return ret;
    } else if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}
// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;
// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,((Math.min((+(Math.floor((value)/(+(4294967296))))), (+(4294967295))))|0)>>>0],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;
// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;
var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;
// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }
  var singleType = typeof types === 'string' ? types : null;
  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }
  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }
  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }
  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];
    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }
    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later
    setValue(ret+i, curr, type);
    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }
  return ret;
}
Module['allocate'] = allocate;
function Pointer_stringify(ptr, /* optional */ length) {
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;
  var ret = '';
  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;
// Memory management
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return ((x+4095)>>12)<<12;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk
function enlargeMemory() {
  abort('Cannot enlarge memory arrays in asm.js. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value, or (2) set Module.TOTAL_MEMORY before the program runs.');
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;
// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(!!Int32Array && !!Float64Array && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');
var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');
Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var __ATINIT__ = []; // functions called during startup
var __ATMAIN__ = []; // functions called when main() is to be run
var __ATEXIT__ = []; // functions called during shutdown
var runtimeInitialized = false;
function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}
// Tools
// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;
function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;
// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;
function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}
if (!Math['imul']) Math['imul'] = function(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyTracking = {};
var calledInit = false, calledRun = false;
var runDependencyWatcher = null;
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    } 
    // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
    if (!calledRun && shouldRunNow) run();
  }
}
Module['removeRunDependency'] = removeRunDependency;
Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data
function addPreRun(func) {
  if (!Module['preRun']) Module['preRun'] = [];
  else if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
  Module['preRun'].push(func);
}
var awaitingMemoryInitializer = false;
function loadMemoryInitializer(filename) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
    runPostSets();
  }
  // always do this asynchronously, to keep shell and web as similar as possible
  addPreRun(function() {
    if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
      applyData(Module['readBinary'](filename));
    } else {
      Browser.asyncLoad(filename, function(data) {
        applyData(data);
      }, function(data) {
        throw 'could not load memory initializer ' + filename;
      });
    }
  });
  awaitingMemoryInitializer = false;
}
// === Body ===
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 1864;
var _stderr;
var ___progname;
var __ZTVN10__cxxabiv120__si_class_type_infoE;
var __ZTVN10__cxxabiv117__class_type_infoE;
var __ZNSt9bad_allocC1Ev;
var __ZNSt9bad_allocD1Ev;
var __ZNSt20bad_array_new_lengthC1Ev;
var __ZNSt20bad_array_new_lengthD1Ev;
var __ZNSt20bad_array_new_lengthD2Ev;
var _err;
var _errx;
var _warn;
var _warnx;
var _verr;
var _verrx;
var _vwarn;
var _vwarnx;
var _stderr = _stderr=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var __ZTVN10__cxxabiv120__si_class_type_infoE = __ZTVN10__cxxabiv120__si_class_type_infoE=allocate([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var __ZTVN10__cxxabiv117__class_type_infoE = __ZTVN10__cxxabiv117__class_type_infoE=allocate([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* memory initializer */ allocate([105,110,32,102,117,110,99,32,116,101,115,116,95,115,116,114,105,110,103,0,0,0,0,0,111,112,116,105,111,110,32,114,101,113,117,105,114,101,115,32,97,110,32,97,114,103,117,109,101,110,116,32,45,45,32,37,115,0,0,0,0,0,0,0,111,112,116,105,111,110,32,114,101,113,117,105,114,101,115,32,97,110,32,97,114,103,117,109,101,110,116,32,45,45,32,37,99,0,0,0,0,0,0,0,0,0,0,0,0,0,36,64,0,0,0,0,0,0,89,64,0,0,0,0,0,136,195,64,0,0,0,0,132,215,151,65,0,128,224,55,121,195,65,67,23,110,5,181,181,184,147,70,245,249,63,233,3,79,56,77,50,29,48,249,72,119,130,90,60,191,115,127,221,79,21,117,208,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,63,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,111,112,116,105,111,110,32,100,111,101,115,110,39,116,32,116,97,107,101,32,97,110,32,97,114,103,117,109,101,110,116,32,45,45,32,37,46,42,115,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,117,110,107,110,111,119,110,32,111,112,116,105,111,110,32,45,45,32,37,115,0,0,0,0,117,110,107,110,111,119,110,32,111,112,116,105,111,110,32,45,45,32,37,99,0,0,0,0,255,255,255,255,0,0,0,0,120,4,0,0,64,4,0,0,152,3,0,0,32,3,0,0,216,2,0,0,136,2,0,0,96,2,0,0,8,2,0,0,97,109,98,105,103,117,111,117,115,32,111,112,116,105,111,110,32,45,45,32,37,46,42,115,0,0,0,0,0,0,0,0,109,97,120,32,115,121,115,116,101,109,32,98,121,116,101,115,32,61,32,37,49,48,108,117,10,0,0,0,0,0,0,0,105,110,32,102,117,110,99,32,116,101,115,116,95,115,116,114,105,110,103,10,0,0,0,0,98,97,115,101,120,109,108,58,48,48,55,58,66,97,115,101,88,77,76,32,105,108,108,101,103,97,108,32,105,110,112,117,116,32,45,32,85,110,101,120,112,101,99,116,101,100,32,101,110,100,32,111,102,32,100,101,99,111,100,105,110,103,32,115,116,114,101,97,109,46,0,0,80,79,83,73,88,76,89,95,67,79,82,82,69,67,84,0,98,97,115,101,120,109,108,58,48,48,54,58,83,121,110,116,97,120,58,32,84,111,111,32,109,97,110,121,32,97,114,103,117,109,101,110,116,115,46,0,98,97,115,101,120,109,108,58,48,48,53,58,66,97,115,101,88,77,76,32,105,108,108,101,103,97,108,32,105,110,112,117,116,32,45,32,73,108,108,101,103,97,108,32,66,97,115,101,88,77,76,32,116,101,114,109,105,110,97,116,105,111,110,32,115,101,113,117,101,110,99,101,46,0,0,0,0,0,0,0,98,97,115,101,120,109,108,58,48,48,52,58,69,114,114,111,114,32,111,110,32,111,117,116,112,117,116,32,102,105,108,101,32,99,108,111,115,101,46,0,115,116,100,58,58,101,120,99,101,112,116,105,111,110,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,98,97,115,101,120,109,108,58,48,48,51,58,70,105,108,101,32,73,47,79,32,69,114,114,111,114,32,45,45,32,78,111,116,101,58,32,111,117,116,112,117,116,32,102,105,108,101,32,110,111,116,32,114,101,109,111,118,101,100,46,0,0,0,0,37,115,58,32,0,0,0,0,37,115,10,0,0,0,0,0,37,115,10,0,0,0,0,0,105,110,32,117,115,101,32,98,121,116,101,115,32,32,32,32,32,61,32,37,49,48,108,117,10,0,0,0,0,0,0,0,98,97,115,101,120,109,108,58,48,48,50,58,70,105,108,101,32,69,114,114,111,114,32,79,112,101,110,105,110,103,47,67,114,101,97,116,105,110,103,32,70,105,108,101,115,46,0,0,37,115,58,32,0,0,0,0,0,0,0,0,0,0,0,0,37,115,58,32,0,0,0,0,98,97,100,95,97,114,114,97,121,95,110,101,119,95,108,101,110,103,116,104,0,0,0,0,10,0,0,0,0,0,0,0,58,32,0,0,0,0,0,0,10,0,0,0,0,0,0,0,58,32,0,0,0,0,0,0,115,121,115,116,101,109,32,98,121,116,101,115,32,32,32,32,32,61,32,37,49,48,108,117,10,0,0,0,0,0,0,0,37,115,58,32,0,0,0,0,98,97,115,101,120,109,108,58,48,48,49,58,83,121,110,116,97,120,32,69,114,114,111,114,32,45,45,32,99,104,101,99,107,32,104,101,108,112,32,40,45,104,41,32,102,111,114,32,117,115,97,103,101,46,0,0,98,97,115,101,120,109,108,58,48,48,48,58,73,110,118,97,108,105,100,32,77,101,115,115,97,103,101,32,67,111,100,101,46,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,7,0,0,22,0,0,0,34,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,7,0,0,16,0,0,0,26,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,7,0,0,16,0,0,0,6,0,0,0,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,83,116,57,101,120,99,101,112,116,105,111,110,0,0,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,83,116,50,48,98,97,100,95,97,114,114,97,121,95,110,101,119,95,108,101,110,103,116,104,0,0,0,0,0,0,0,0,0,0,0,0,216,6,0,0,0,0,0,0,232,6,0,0,24,7,0,0,0,0,0,0,0,0,0,0,248,6,0,0,32,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
function runPostSets() {
HEAP32[((1816)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((1824)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((1840)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
__ZNSt9bad_allocC1Ev = 24;
__ZNSt9bad_allocD1Ev = 16;
__ZNSt20bad_array_new_lengthC1Ev = 2;
__ZNSt20bad_array_new_lengthD1Ev = (16);
__ZNSt20bad_array_new_lengthD2Ev = (16);
_err = 12;
_errx = 30;
_warn = 8;
_warnx = 32;
_verr = 10;
_verrx = 4;
_vwarn = 28;
_vwarnx = 36;
}
if (!awaitingMemoryInitializer) runPostSets();
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
}
function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
}
  var _ceil=Math.ceil;
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:35,EIDRM:36,ECHRNG:37,EL2NSYNC:38,EL3HLT:39,EL3RST:40,ELNRNG:41,EUNATCH:42,ENOCSI:43,EL2HLT:44,EDEADLK:45,ENOLCK:46,EBADE:50,EBADR:51,EXFULL:52,ENOANO:53,EBADRQC:54,EBADSLT:55,EDEADLOCK:56,EBFONT:57,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:74,ELBIN:75,EDOTDOT:76,EBADMSG:77,EFTYPE:79,ENOTUNIQ:80,EBADFD:81,EREMCHG:82,ELIBACC:83,ELIBBAD:84,ELIBSCN:85,ELIBMAX:86,ELIBEXEC:87,ENOSYS:88,ENMFILE:89,ENOTEMPTY:90,ENAMETOOLONG:91,ELOOP:92,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:106,EPROTOTYPE:107,ENOTSOCK:108,ENOPROTOOPT:109,ESHUTDOWN:110,ECONNREFUSED:111,EADDRINUSE:112,ECONNABORTED:113,ENETUNREACH:114,ENETDOWN:115,ETIMEDOUT:116,EHOSTDOWN:117,EHOSTUNREACH:118,EINPROGRESS:119,EALREADY:120,EDESTADDRREQ:121,EMSGSIZE:122,EPROTONOSUPPORT:123,ESOCKTNOSUPPORT:124,EADDRNOTAVAIL:125,ENETRESET:126,EISCONN:127,ENOTCONN:128,ETOOMANYREFS:129,EPROCLIM:130,EUSERS:131,EDQUOT:132,ESTALE:133,ENOTSUP:134,ENOMEDIUM:135,ENOSHARE:136,ECASECLASH:137,EILSEQ:138,EOVERFLOW:139,ECANCELED:140,ENOTRECOVERABLE:141,EOWNERDEAD:142,ESTRPIPE:143};
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value
      return value;
    }
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  var __impure_ptr=allocate(1, "i32*", ALLOC_STATIC);var FS={currentPath:"/",nextInode:2,streams:[null],ignorePermissions:true,createFileHandle:function (stream, fd) {
        if (typeof stream === 'undefined') {
          stream = null;
        }
        if (!fd) {
          if (stream && stream.socket) {
            for (var i = 1; i < 64; i++) {
              if (!FS.streams[i]) {
                fd = i;
                break;
              }
            }
            assert(fd, 'ran out of low fds for sockets');
          } else {
            fd = Math.max(FS.streams.length, 64);
            for (var i = FS.streams.length; i < fd; i++) {
              FS.streams[i] = null; // Keep dense
            }
          }
        }
        // Close WebSocket first if we are about to replace the fd (i.e. dup2)
        if (FS.streams[fd] && FS.streams[fd].socket && FS.streams[fd].socket.close) {
          FS.streams[fd].socket.close();
        }
        FS.streams[fd] = stream;
        return fd;
      },removeFileHandle:function (fd) {
        FS.streams[fd] = null;
      },joinPath:function (parts, forceRelative) {
        var ret = parts[0];
        for (var i = 1; i < parts.length; i++) {
          if (ret[ret.length-1] != '/') ret += '/';
          ret += parts[i];
        }
        if (forceRelative && ret[0] == '/') ret = ret.substr(1);
        return ret;
      },absolutePath:function (relative, base) {
        if (typeof relative !== 'string') return null;
        if (base === undefined) base = FS.currentPath;
        if (relative && relative[0] == '/') base = '';
        var full = base + '/' + relative;
        var parts = full.split('/').reverse();
        var absolute = [''];
        while (parts.length) {
          var part = parts.pop();
          if (part == '' || part == '.') {
            // Nothing.
          } else if (part == '..') {
            if (absolute.length > 1) absolute.pop();
          } else {
            absolute.push(part);
          }
        }
        return absolute.length == 1 ? '/' : absolute.join('/');
      },analyzePath:function (path, dontResolveLastLink, linksVisited) {
        var ret = {
          isRoot: false,
          exists: false,
          error: 0,
          name: null,
          path: null,
          object: null,
          parentExists: false,
          parentPath: null,
          parentObject: null
        };
        path = FS.absolutePath(path);
        if (path == '/') {
          ret.isRoot = true;
          ret.exists = ret.parentExists = true;
          ret.name = '/';
          ret.path = ret.parentPath = '/';
          ret.object = ret.parentObject = FS.root;
        } else if (path !== null) {
          linksVisited = linksVisited || 0;
          path = path.slice(1).split('/');
          var current = FS.root;
          var traversed = [''];
          while (path.length) {
            if (path.length == 1 && current.isFolder) {
              ret.parentExists = true;
              ret.parentPath = traversed.length == 1 ? '/' : traversed.join('/');
              ret.parentObject = current;
              ret.name = path[0];
            }
            var target = path.shift();
            if (!current.isFolder) {
              ret.error = ERRNO_CODES.ENOTDIR;
              break;
            } else if (!current.read) {
              ret.error = ERRNO_CODES.EACCES;
              break;
            } else if (!current.contents.hasOwnProperty(target)) {
              ret.error = ERRNO_CODES.ENOENT;
              break;
            }
            current = current.contents[target];
            if (current.link && !(dontResolveLastLink && path.length == 0)) {
              if (linksVisited > 40) { // Usual Linux SYMLOOP_MAX.
                ret.error = ERRNO_CODES.ELOOP;
                break;
              }
              var link = FS.absolutePath(current.link, traversed.join('/'));
              ret = FS.analyzePath([link].concat(path).join('/'),
                                   dontResolveLastLink, linksVisited + 1);
              return ret;
            }
            traversed.push(target);
            if (path.length == 0) {
              ret.exists = true;
              ret.path = traversed.join('/');
              ret.object = current;
            }
          }
        }
        return ret;
      },findObject:function (path, dontResolveLastLink) {
        FS.ensureRoot();
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },createObject:function (parent, name, properties, canRead, canWrite) {
        if (!parent) parent = '/';
        if (typeof parent === 'string') parent = FS.findObject(parent);
        if (!parent) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent path must exist.');
        }
        if (!parent.isFolder) {
          ___setErrNo(ERRNO_CODES.ENOTDIR);
          throw new Error('Parent must be a folder.');
        }
        if (!parent.write && !FS.ignorePermissions) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent folder must be writeable.');
        }
        if (!name || name == '.' || name == '..') {
          ___setErrNo(ERRNO_CODES.ENOENT);
          throw new Error('Name must not be empty.');
        }
        if (parent.contents.hasOwnProperty(name)) {
          ___setErrNo(ERRNO_CODES.EEXIST);
          throw new Error("Can't overwrite object.");
        }
        parent.contents[name] = {
          read: canRead === undefined ? true : canRead,
          write: canWrite === undefined ? false : canWrite,
          timestamp: Date.now(),
          inodeNumber: FS.nextInode++
        };
        for (var key in properties) {
          if (properties.hasOwnProperty(key)) {
            parent.contents[name][key] = properties[key];
          }
        }
        return parent.contents[name];
      },createFolder:function (parent, name, canRead, canWrite) {
        var properties = {isFolder: true, isDevice: false, contents: {}};
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createPath:function (parent, path, canRead, canWrite) {
        var current = FS.findObject(parent);
        if (current === null) throw new Error('Invalid parent.');
        path = path.split('/').reverse();
        while (path.length) {
          var part = path.pop();
          if (!part) continue;
          if (!current.contents.hasOwnProperty(part)) {
            FS.createFolder(current, part, canRead, canWrite);
          }
          current = current.contents[part];
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        properties.isFolder = false;
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createDataFile:function (parent, name, data, canRead, canWrite) {
        if (typeof data === 'string') {
          var dataArray = new Array(data.length);
          for (var i = 0, len = data.length; i < len; ++i) dataArray[i] = data.charCodeAt(i);
          data = dataArray;
        }
        var properties = {
          isDevice: false,
          contents: data.subarray ? data.subarray(0) : data // as an optimization, create a new array wrapper (not buffer) here, to help JS engines understand this object
        };
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          var LazyUint8Array = function() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
              if (!hasByteServing) chunkSize = datalength;
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile) {
        Browser.init();
        var fullname = FS.joinPath([parent, name], true);
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },createLink:function (parent, name, target, canRead, canWrite) {
        var properties = {isDevice: false, link: target};
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createDevice:function (parent, name, input, output) {
        if (!(input || output)) {
          throw new Error('A device must have at least one callback defined.');
        }
        var ops = {isDevice: true, input: input, output: output};
        return FS.createFile(parent, name, ops, Boolean(input), Boolean(output));
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },ensureRoot:function () {
        if (FS.root) return;
        // The main file system tree. All the contents are inside this.
        FS.root = {
          read: true,
          write: true,
          isFolder: true,
          isDevice: false,
          timestamp: Date.now(),
          inodeNumber: 1,
          contents: {}
        };
      },init:function (input, output, error) {
        // Make sure we initialize only once.
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
        FS.ensureRoot();
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        input = input || Module['stdin'];
        output = output || Module['stdout'];
        error = error || Module['stderr'];
        // Default handlers.
        var stdinOverridden = true, stdoutOverridden = true, stderrOverridden = true;
        if (!input) {
          stdinOverridden = false;
          input = function() {
            if (!input.cache || !input.cache.length) {
              var result;
              if (typeof window != 'undefined' &&
                  typeof window.prompt == 'function') {
                // Browser.
                result = window.prompt('Input: ');
                if (result === null) result = String.fromCharCode(0); // cancel ==> EOF
              } else if (typeof readline == 'function') {
                // Command line.
                result = readline();
              }
              if (!result) result = '';
              input.cache = intArrayFromString(result + '\n', true);
            }
            return input.cache.shift();
          };
        }
        var utf8 = new Runtime.UTF8Processor();
        function simpleOutput(val) {
          if (val === null || val === 10) {
            output.printer(output.buffer.join(''));
            output.buffer = [];
          } else {
            output.buffer.push(utf8.processCChar(val));
          }
        }
        if (!output) {
          stdoutOverridden = false;
          output = simpleOutput;
        }
        if (!output.printer) output.printer = Module['print'];
        if (!output.buffer) output.buffer = [];
        if (!error) {
          stderrOverridden = false;
          error = simpleOutput;
        }
        if (!error.printer) error.printer = Module['print'];
        if (!error.buffer) error.buffer = [];
        // Create the temporary folder, if not already created
        try {
          FS.createFolder('/', 'tmp', true, true);
        } catch(e) {}
        // Create the I/O devices.
        var devFolder = FS.createFolder('/', 'dev', true, true);
        var stdin = FS.createDevice(devFolder, 'stdin', input);
        var stdout = FS.createDevice(devFolder, 'stdout', null, output);
        var stderr = FS.createDevice(devFolder, 'stderr', null, error);
        FS.createDevice(devFolder, 'tty', input, output);
        FS.createDevice(devFolder, 'null', function(){}, function(){});
        // Create default streams.
        FS.streams[1] = {
          path: '/dev/stdin',
          object: stdin,
          position: 0,
          isRead: true,
          isWrite: false,
          isAppend: false,
          isTerminal: !stdinOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[2] = {
          path: '/dev/stdout',
          object: stdout,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          isTerminal: !stdoutOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[3] = {
          path: '/dev/stderr',
          object: stderr,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          isTerminal: !stderrOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        // TODO: put these low in memory like we used to assert on: assert(Math.max(_stdin, _stdout, _stderr) < 15000); // make sure these are low, we flatten arrays with these
        HEAP32[((_stdin)>>2)]=1;
        HEAP32[((_stdout)>>2)]=2;
        HEAP32[((_stderr)>>2)]=3;
        // Other system paths
        FS.createPath('/', 'dev/shm/tmp', true, true); // temp files
        // Newlib initialization
        for (var i = FS.streams.length; i < Math.max(_stdin, _stdout, _stderr) + 4; i++) {
          FS.streams[i] = null; // Make sure to keep FS.streams dense
        }
        FS.streams[_stdin] = FS.streams[1];
        FS.streams[_stdout] = FS.streams[2];
        FS.streams[_stderr] = FS.streams[3];
        allocate([ allocate(
          [0, 0, 0, 0, _stdin, 0, 0, 0, _stdout, 0, 0, 0, _stderr, 0, 0, 0],
          'void*', ALLOC_NORMAL) ], 'void*', ALLOC_NONE, __impure_ptr);
      },quit:function () {
        if (!FS.init.initialized) return;
        // Flush any partially-printed lines in stdout and stderr. Careful, they may have been closed
        if (FS.streams[2] && FS.streams[2].object.output.buffer.length > 0) FS.streams[2].object.output(10);
        if (FS.streams[3] && FS.streams[3].object.output.buffer.length > 0) FS.streams[3].object.output(10);
      },standardizePath:function (path) {
        if (path.substr(0, 2) == './') path = path.substr(2);
        return path;
      },deleteFile:function (path) {
        path = FS.analyzePath(path);
        if (!path.parentExists || !path.exists) {
          throw 'Invalid path ' + path;
        }
        delete path.parentObject.contents[path.name];
      }};
  function _send(fd, buf, len, flags) {
      var info = FS.streams[fd];
      if (!info) return -1;
      info.sender(HEAPU8.subarray(buf, buf+len));
      return len;
    }
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (!stream || stream.object.isDevice) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (stream.object.isFolder) {
        ___setErrNo(ERRNO_CODES.EISDIR);
        return -1;
      } else if (nbyte < 0 || offset < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var contents = stream.object.contents;
        while (contents.length < offset) contents.push(0);
        for (var i = 0; i < nbyte; i++) {
          contents[offset + i] = HEAPU8[(((buf)+(i))|0)];
        }
        stream.object.timestamp = Date.now();
        return i;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (stream && ('socket' in stream)) {
          return _send(fildes, buf, nbyte, 0);
      } else if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (nbyte < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        if (stream.object.isDevice) {
          if (stream.object.output) {
            for (var i = 0; i < nbyte; i++) {
              try {
                stream.object.output(HEAP8[(((buf)+(i))|0)]);
              } catch (e) {
                ___setErrNo(ERRNO_CODES.EIO);
                return -1;
              }
            }
            stream.object.timestamp = Date.now();
            return i;
          } else {
            ___setErrNo(ERRNO_CODES.ENXIO);
            return -1;
          }
        } else {
          var bytesWritten = _pwrite(fildes, buf, nbyte, stream.position);
          if (bytesWritten != -1) stream.position += bytesWritten;
          return bytesWritten;
        }
      }
    }
  Module["_strlen"] = _strlen;function _fputs(s, stream) {
      // int fputs(const char *restrict s, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputs.html
      return _write(stream, s, _strlen(s));
    }
  function _fputc(c, stream) {
      // int fputc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
      var chr = unSign(c & 0xFF);
      HEAP8[((_fputc.ret)|0)]=chr
      var ret = _write(stream, _fputc.ret, 1);
      if (ret == -1) {
        if (FS.streams[stream]) FS.streams[stream].error = true;
        return -1;
      } else {
        return chr;
      }
    }function _puts(s) {
      // int puts(const char *s);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/puts.html
      // NOTE: puts() always writes an extra newline.
      var stdout = HEAP32[((_stdout)>>2)];
      var ret = _fputs(s, stdout);
      if (ret < 0) {
        return ret;
      } else {
        var newlineRet = _fputc(10, stdout);
        return (newlineRet < 0) ? -1 : ret + 1;
      }
    }
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"No message of desired type",36:"Identifier removed",37:"Channel number out of range",38:"Level 2 not synchronized",39:"Level 3 halted",40:"Level 3 reset",41:"Link number out of range",42:"Protocol driver not attached",43:"No CSI structure available",44:"Level 2 halted",45:"Deadlock condition",46:"No record locks available",50:"Invalid exchange",51:"Invalid request descriptor",52:"Exchange full",53:"No anode",54:"Invalid request code",55:"Invalid slot",56:"File locking deadlock error",57:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",74:"Multihop attempted",75:"Inode is remote (not really error)",76:"Cross mount point (not really error)",77:"Trying to read unreadable message",79:"Inappropriate file type or format",80:"Given log. name not unique",81:"f.d. invalid for this operation",82:"Remote address changed",83:"Can\t access a needed shared lib",84:"Accessing a corrupted shared lib",85:".lib section in a.out corrupted",86:"Attempting to link in too many libs",87:"Attempting to exec a shared library",88:"Function not implemented",89:"No more files",90:"Directory not empty",91:"File or path name too long",92:"Too many symbolic links",95:"Operation not supported on transport endpoint",96:"Protocol family not supported",104:"Connection reset by peer",105:"No buffer space available",106:"Address family not supported by protocol family",107:"Protocol wrong type for socket",108:"Socket operation on non-socket",109:"Protocol not available",110:"Can't send after socket shutdown",111:"Connection refused",112:"Address already in use",113:"Connection aborted",114:"Network is unreachable",115:"Network interface is not configured",116:"Connection timed out",117:"Host is down",118:"Host is unreachable",119:"Connection already in progress",120:"Socket already connected",121:"Destination address required",122:"Message too long",123:"Unknown protocol",124:"Socket type not supported",125:"Address not available",126:"ENETRESET",127:"Socket is already connected",128:"Socket is not connected",129:"TOOMANYREFS",130:"EPROCLIM",131:"EUSERS",132:"EDQUOT",133:"ESTALE",134:"Not supported",135:"No medium (in tape drive)",136:"No such host or network path",137:"Filename exists with different case",138:"EILSEQ",139:"Value too large for defined data type",140:"Operation canceled",141:"State not recoverable",142:"Previous owner died",143:"Streams pipe error"};function _strerror_r(errnum, strerrbuf, buflen) {
      if (errnum in ERRNO_MESSAGES) {
        if (ERRNO_MESSAGES[errnum].length > buflen - 1) {
          return ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          var msg = ERRNO_MESSAGES[errnum];
          for (var i = 0; i < msg.length; i++) {
            HEAP8[(((strerrbuf)+(i))|0)]=msg.charCodeAt(i)
          }
          HEAP8[(((strerrbuf)+(i))|0)]=0
          return 0;
        }
      } else {
        return ___setErrNo(ERRNO_CODES.EINVAL);
      }
    }function _strerror(errnum) {
      if (!_strerror.buffer) _strerror.buffer = _malloc(256);
      _strerror_r(errnum, _strerror.buffer, 256);
      return _strerror.buffer;
    }
  function ___errno_location() {
      return ___errno_state;
    }function _perror(s) {
      // void perror(const char *s);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/perror.html
      var stdout = HEAP32[((_stdout)>>2)];
      if (s) {
        _fputs(s, stdout);
        _fputc(58, stdout);
        _fputc(32, stdout);
      }
      var errnum = HEAP32[((___errno_location())>>2)];
      _puts(_strerror(errnum));
    }
  function _abort() {
      ABORT = true;
      throw 'abort() at ' + (new Error().stack);
    }
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;
  var ___errno=___errno_location;
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var bytesWritten = _write(stream, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        if (FS.streams[stream]) FS.streams[stream].error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
          // Handle precision.
          var precisionSet = false;
          if (next == 46) {
            var precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          } else {
            var precision = 6; // Standard default.
          }
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
              // Add sign if needed
              if (flagAlwaysSigned) {
                if (currArg < 0) {
                  prefix = '-' + prefix;
                } else {
                  prefix = '+' + prefix;
                }
              }
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
                // Add sign.
                if (flagAlwaysSigned && currArg >= 0) {
                  argText = '+' + argText;
                }
              }
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }
  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 8: return PAGE_SIZE;
        case 54:
        case 56:
        case 21:
        case 61:
        case 63:
        case 22:
        case 67:
        case 23:
        case 24:
        case 25:
        case 26:
        case 27:
        case 69:
        case 28:
        case 101:
        case 70:
        case 71:
        case 29:
        case 30:
        case 199:
        case 75:
        case 76:
        case 32:
        case 43:
        case 44:
        case 80:
        case 46:
        case 47:
        case 45:
        case 48:
        case 49:
        case 42:
        case 82:
        case 33:
        case 7:
        case 108:
        case 109:
        case 107:
        case 112:
        case 119:
        case 121:
          return 200809;
        case 13:
        case 104:
        case 94:
        case 95:
        case 34:
        case 35:
        case 77:
        case 81:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 91:
        case 94:
        case 95:
        case 110:
        case 111:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 120:
        case 40:
        case 16:
        case 79:
        case 19:
          return -1;
        case 92:
        case 93:
        case 5:
        case 72:
        case 6:
        case 74:
        case 92:
        case 93:
        case 96:
        case 97:
        case 98:
        case 99:
        case 102:
        case 103:
        case 105:
          return 1;
        case 38:
        case 66:
        case 50:
        case 51:
        case 4:
          return 1024;
        case 15:
        case 64:
        case 41:
          return 32;
        case 55:
        case 37:
        case 17:
          return 2147483647;
        case 18:
        case 1:
          return 47839;
        case 59:
        case 57:
          return 99;
        case 68:
        case 58:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 14: return 32768;
        case 73: return 32767;
        case 39: return 16384;
        case 60: return 1000;
        case 106: return 700;
        case 52: return 256;
        case 62: return 255;
        case 2: return 100;
        case 65: return 64;
        case 36: return 20;
        case 100: return 16;
        case 20: return 6;
        case 53: return 4;
        case 10: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }
  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret
      }
      return ret;
    }
  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }
  function ___gxx_personality_v0() {
    }
  function ___cxa_allocate_exception(size) {
      return _malloc(size);
    }
  function _llvm_eh_exception() {
      return HEAP32[((_llvm_eh_exception.buf)>>2)];
    }
  function __ZSt18uncaught_exceptionv() { // std::uncaught_exception()
      return !!__ZSt18uncaught_exceptionv.uncaught_exception;
    }
  function ___cxa_is_number_type(type) {
      var isNumber = false;
      try { if (type == __ZTIi) isNumber = true } catch(e){}
      try { if (type == __ZTIj) isNumber = true } catch(e){}
      try { if (type == __ZTIl) isNumber = true } catch(e){}
      try { if (type == __ZTIm) isNumber = true } catch(e){}
      try { if (type == __ZTIx) isNumber = true } catch(e){}
      try { if (type == __ZTIy) isNumber = true } catch(e){}
      try { if (type == __ZTIf) isNumber = true } catch(e){}
      try { if (type == __ZTId) isNumber = true } catch(e){}
      try { if (type == __ZTIe) isNumber = true } catch(e){}
      try { if (type == __ZTIc) isNumber = true } catch(e){}
      try { if (type == __ZTIa) isNumber = true } catch(e){}
      try { if (type == __ZTIh) isNumber = true } catch(e){}
      try { if (type == __ZTIs) isNumber = true } catch(e){}
      try { if (type == __ZTIt) isNumber = true } catch(e){}
      return isNumber;
    }function ___cxa_does_inherit(definiteType, possibilityType, possibility) {
      if (possibility == 0) return false;
      if (possibilityType == 0 || possibilityType == definiteType)
        return true;
      var possibility_type_info;
      if (___cxa_is_number_type(possibilityType)) {
        possibility_type_info = possibilityType;
      } else {
        var possibility_type_infoAddr = HEAP32[((possibilityType)>>2)] - 8;
        possibility_type_info = HEAP32[((possibility_type_infoAddr)>>2)];
      }
      switch (possibility_type_info) {
      case 0: // possibility is a pointer
        // See if definite type is a pointer
        var definite_type_infoAddr = HEAP32[((definiteType)>>2)] - 8;
        var definite_type_info = HEAP32[((definite_type_infoAddr)>>2)];
        if (definite_type_info == 0) {
          // Also a pointer; compare base types of pointers
          var defPointerBaseAddr = definiteType+8;
          var defPointerBaseType = HEAP32[((defPointerBaseAddr)>>2)];
          var possPointerBaseAddr = possibilityType+8;
          var possPointerBaseType = HEAP32[((possPointerBaseAddr)>>2)];
          return ___cxa_does_inherit(defPointerBaseType, possPointerBaseType, possibility);
        } else
          return false; // one pointer and one non-pointer
      case 1: // class with no base class
        return false;
      case 2: // class with base class
        var parentTypeAddr = possibilityType + 8;
        var parentType = HEAP32[((parentTypeAddr)>>2)];
        return ___cxa_does_inherit(definiteType, parentType, possibility);
      default:
        return false; // some unencountered type
      }
    }
  function ___resumeException(ptr) {
      if (HEAP32[((_llvm_eh_exception.buf)>>2)] == 0) HEAP32[((_llvm_eh_exception.buf)>>2)]=ptr;
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";;
    }function ___cxa_find_matching_catch(thrown, throwntype) {
      if (thrown == -1) thrown = HEAP32[((_llvm_eh_exception.buf)>>2)];
      if (throwntype == -1) throwntype = HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)];
      var typeArray = Array.prototype.slice.call(arguments, 2);
      // If throwntype is a pointer, this means a pointer has been
      // thrown. When a pointer is thrown, actually what's thrown
      // is a pointer to the pointer. We'll dereference it.
      if (throwntype != 0 && !___cxa_is_number_type(throwntype)) {
        var throwntypeInfoAddr= HEAP32[((throwntype)>>2)] - 8;
        var throwntypeInfo= HEAP32[((throwntypeInfoAddr)>>2)];
        if (throwntypeInfo == 0)
          thrown = HEAP32[((thrown)>>2)];
      }
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var i = 0; i < typeArray.length; i++) {
        if (___cxa_does_inherit(typeArray[i], throwntype, thrown))
          return ((asm["setTempRet0"](typeArray[i]),thrown)|0);
      }
      // Shouldn't happen unless we have bogus data in typeArray
      // or encounter a type for which emscripten doesn't have suitable
      // typeinfo defined. Best-efforts match just in case.
      return ((asm["setTempRet0"](throwntype),thrown)|0);
    }function ___cxa_throw(ptr, type, destructor) {
      if (!___cxa_throw.initialized) {
        try {
          HEAP32[((__ZTVN10__cxxabiv119__pointer_type_infoE)>>2)]=0; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv117__class_type_infoE)>>2)]=1; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv120__si_class_type_infoE)>>2)]=2; // Workaround for libcxxabi integration bug
        } catch(e){}
        ___cxa_throw.initialized = true;
      }
      HEAP32[((_llvm_eh_exception.buf)>>2)]=ptr
      HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)]=type
      HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)]=destructor
      if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
        __ZSt18uncaught_exceptionv.uncaught_exception = 1;
      } else {
        __ZSt18uncaught_exceptionv.uncaught_exception++;
      }
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";;
    }
  function ___cxa_call_unexpected(exception) {
      Module.printErr('Unexpected exception thrown, this is not properly supported - aborting');
      ABORT = true;
      throw exception;
    }
  function ___cxa_begin_catch(ptr) {
      __ZSt18uncaught_exceptionv.uncaught_exception--;
      return ptr;
    }
  function ___cxa_free_exception(ptr) {
      try {
        return _free(ptr);
      } catch(e) { // XXX FIXME
      }
    }function ___cxa_end_catch() {
      if (___cxa_end_catch.rethrown) {
        ___cxa_end_catch.rethrown = false;
        return;
      }
      // Clear state flag.
      asm['setThrew'](0);
      // Clear type.
      HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)]=0
      // Call destructor if one is registered then clear it.
      var ptr = HEAP32[((_llvm_eh_exception.buf)>>2)];
      var destructor = HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)];
      if (destructor) {
        Runtime.dynCall('vi', destructor, [ptr]);
        HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)]=0
      }
      // Free ptr if it isn't null.
      if (ptr) {
        ___cxa_free_exception(ptr);
        HEAP32[((_llvm_eh_exception.buf)>>2)]=0
      }
    }
  var _environ=allocate(1, "i32*", ALLOC_STATIC);var ___environ=_environ;function ___buildEnvironment(env) {
      // WARNING: Arbitrary limit!
      var MAX_ENV_VALUES = 64;
      var TOTAL_ENV_SIZE = 1024;
      // Statically allocate memory for the environment.
      var poolPtr;
      var envPtr;
      if (!___buildEnvironment.called) {
        ___buildEnvironment.called = true;
        // Set default values. Use string keys for Closure Compiler compatibility.
        ENV['USER'] = 'root';
        ENV['PATH'] = '/';
        ENV['PWD'] = '/';
        ENV['HOME'] = '/home/emscripten';
        ENV['LANG'] = 'en_US.UTF-8';
        ENV['_'] = './this.program';
        // Allocate memory.
        poolPtr = allocate(TOTAL_ENV_SIZE, 'i8', ALLOC_STATIC);
        envPtr = allocate(MAX_ENV_VALUES * 4,
                          'i8*', ALLOC_STATIC);
        HEAP32[((envPtr)>>2)]=poolPtr
        HEAP32[((_environ)>>2)]=envPtr;
      } else {
        envPtr = HEAP32[((_environ)>>2)];
        poolPtr = HEAP32[((envPtr)>>2)];
      }
      // Collect key=value lines.
      var strings = [];
      var totalSize = 0;
      for (var key in env) {
        if (typeof env[key] === 'string') {
          var line = key + '=' + env[key];
          strings.push(line);
          totalSize += line.length;
        }
      }
      if (totalSize > TOTAL_ENV_SIZE) {
        throw new Error('Environment size exceeded TOTAL_ENV_SIZE!');
      }
      // Make new.
      var ptrSize = 4;
      for (var i = 0; i < strings.length; i++) {
        var line = strings[i];
        for (var j = 0; j < line.length; j++) {
          HEAP8[(((poolPtr)+(j))|0)]=line.charCodeAt(j);
        }
        HEAP8[(((poolPtr)+(j))|0)]=0;
        HEAP32[(((envPtr)+(i * ptrSize))>>2)]=poolPtr;
        poolPtr += line.length + 1;
      }
      HEAP32[(((envPtr)+(strings.length * ptrSize))>>2)]=0;
    }var ENV={};function _getenv(name) {
      // char *getenv(const char *name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/getenv.html
      if (name === 0) return 0;
      name = Pointer_stringify(name);
      if (!ENV.hasOwnProperty(name)) return 0;
      if (_getenv.ret) _free(_getenv.ret);
      _getenv.ret = allocate(intArrayFromString(ENV[name]), 'i8', ALLOC_NORMAL);
      return _getenv.ret;
    }
  function _strchr(ptr, chr) {
      ptr--;
      do {
        ptr++;
        var val = HEAP8[(ptr)];
        if (val == chr) return ptr;
      } while (val);
      return 0;
    }
  function _strncmp(px, py, n) {
      var i = 0;
      while (i < n) {
        var x = HEAPU8[(((px)+(i))|0)];
        var y = HEAPU8[(((py)+(i))|0)];
        if (x == y && x == 0) return 0;
        if (x == 0) return -1;
        if (y == 0) return 1;
        if (x == y) {
          i ++;
          continue;
        } else {
          return x > y ? 1 : -1;
        }
      }
      return 0;
    }
  var _llvm_va_start=undefined;
  function _llvm_va_end() {}
  function _vfprintf(s, f, va_arg) {
      return _fprintf(s, f, HEAP32[((va_arg)>>2)]);
    }
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      function ExitStatus() {
        this.name = "ExitStatus";
        this.message = "Program terminated with exit(" + status + ")";
        this.status = status;
        Module.print('Exit Status: ' + status);
      };
      ExitStatus.prototype = new Error();
      ExitStatus.prototype.constructor = ExitStatus;
      exitRuntime();
      ABORT = true;
      throw new ExitStatus();
    }function _exit(status) {
      __exit(status);
    }
  function _isspace(chr) {
      return chr in { 32: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0 };
    }
  var _ceilf=Math.ceil;
  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : console.log("warning: cannot create object URLs");
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
        function getMimetype(name) {
          return {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'bmp': 'image/bmp',
            'ogg': 'audio/ogg',
            'wav': 'audio/wav',
            'mp3': 'audio/mpeg'
          }[name.substr(name.lastIndexOf('.')+1)];
        }
        var imagePlugin = {};
        imagePlugin['canHandle'] = function(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/.exec(name);
        };
        imagePlugin['handle'] = function(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: getMimetype(name) });
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin['canHandle'] = function(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
        // Canvas event setup
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule) {
        var ctx;
        try {
          if (useWebGL) {
            ctx = canvas.getContext('experimental-webgl', {
              alpha: false
            });
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas - ' + e);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function (func) {
        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                         window['mozRequestAnimationFrame'] ||
                                         window['webkitRequestAnimationFrame'] ||
                                         window['msRequestAnimationFrame'] ||
                                         window['oRequestAnimationFrame'] ||
                                         window['setTimeout'];
        }
        window.requestAnimationFrame(func);
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x = event.pageX - (window.scrollX + rect.left);
          var y = event.pageY - (window.scrollY + rect.top);
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      }};
__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
_llvm_eh_exception.buf = allocate(12, "void*", ALLOC_STATIC);
___buildEnvironment(ENV);
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
var Math_min = Math.min;
function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vii(index,a1,a2) {
  try {
    Module["dynCall_vii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viii(index,a1,a2,a3) {
  try {
    Module["dynCall_viii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm = (function(global, env, buffer) {
  'use asm';
  var HEAP8 = new global.Int8Array(buffer);
  var HEAP16 = new global.Int16Array(buffer);
  var HEAP32 = new global.Int32Array(buffer);
  var HEAPU8 = new global.Uint8Array(buffer);
  var HEAPU16 = new global.Uint16Array(buffer);
  var HEAPU32 = new global.Uint32Array(buffer);
  var HEAPF32 = new global.Float32Array(buffer);
  var HEAPF64 = new global.Float64Array(buffer);
  var STACKTOP=env.STACKTOP|0;
  var STACK_MAX=env.STACK_MAX|0;
  var tempDoublePtr=env.tempDoublePtr|0;
  var ABORT=env.ABORT|0;
  var _stderr=env._stderr|0;
  var __ZTVN10__cxxabiv120__si_class_type_infoE=env.__ZTVN10__cxxabiv120__si_class_type_infoE|0;
  var __ZTVN10__cxxabiv117__class_type_infoE=env.__ZTVN10__cxxabiv117__class_type_infoE|0;
  var ___progname=env.___progname|0;
  var NaN=+env.NaN;
  var Infinity=+env.Infinity;
  var __THREW__ = 0;
  var threwValue = 0;
  var setjmpId = 0;
  var undef = 0;
  var tempInt = 0, tempBigInt = 0, tempBigIntP = 0, tempBigIntS = 0, tempBigIntR = 0.0, tempBigIntI = 0, tempBigIntD = 0, tempValue = 0, tempDouble = 0.0;
  var tempRet0 = 0;
  var tempRet1 = 0;
  var tempRet2 = 0;
  var tempRet3 = 0;
  var tempRet4 = 0;
  var tempRet5 = 0;
  var tempRet6 = 0;
  var tempRet7 = 0;
  var tempRet8 = 0;
  var tempRet9 = 0;
  var Math_floor=global.Math.floor;
  var Math_abs=global.Math.abs;
  var Math_sqrt=global.Math.sqrt;
  var Math_pow=global.Math.pow;
  var Math_cos=global.Math.cos;
  var Math_sin=global.Math.sin;
  var Math_tan=global.Math.tan;
  var Math_acos=global.Math.acos;
  var Math_asin=global.Math.asin;
  var Math_atan=global.Math.atan;
  var Math_atan2=global.Math.atan2;
  var Math_exp=global.Math.exp;
  var Math_log=global.Math.log;
  var Math_ceil=global.Math.ceil;
  var Math_imul=global.Math.imul;
  var abort=env.abort;
  var assert=env.assert;
  var asmPrintInt=env.asmPrintInt;
  var asmPrintFloat=env.asmPrintFloat;
  var Math_min=env.min;
  var invoke_vi=env.invoke_vi;
  var invoke_vii=env.invoke_vii;
  var invoke_ii=env.invoke_ii;
  var invoke_viii=env.invoke_viii;
  var invoke_v=env.invoke_v;
  var invoke_iii=env.invoke_iii;
  var _strncmp=env._strncmp;
  var _llvm_va_end=env._llvm_va_end;
  var _sysconf=env._sysconf;
  var ___cxa_throw=env.___cxa_throw;
  var ___gxx_personality_v0=env.___gxx_personality_v0;
  var _abort=env._abort;
  var _fprintf=env._fprintf;
  var _llvm_eh_exception=env._llvm_eh_exception;
  var ___cxa_free_exception=env.___cxa_free_exception;
  var ___buildEnvironment=env.___buildEnvironment;
  var __reallyNegative=env.__reallyNegative;
  var _strchr=env._strchr;
  var _fputc=env._fputc;
  var _puts=env._puts;
  var ___setErrNo=env.___setErrNo;
  var _fwrite=env._fwrite;
  var _send=env._send;
  var _write=env._write;
  var _fputs=env._fputs;
  var _exit=env._exit;
  var ___cxa_find_matching_catch=env.___cxa_find_matching_catch;
  var ___cxa_allocate_exception=env.___cxa_allocate_exception;
  var _isspace=env._isspace;
  var _ceilf=env._ceilf;
  var ___cxa_is_number_type=env.___cxa_is_number_type;
  var ___resumeException=env.___resumeException;
  var __formatString=env.__formatString;
  var ___cxa_does_inherit=env.___cxa_does_inherit;
  var _ceil=env._ceil;
  var _vfprintf=env._vfprintf;
  var ___cxa_begin_catch=env.___cxa_begin_catch;
  var _getenv=env._getenv;
  var __ZSt18uncaught_exceptionv=env.__ZSt18uncaught_exceptionv;
  var _pwrite=env._pwrite;
  var _perror=env._perror;
  var ___cxa_call_unexpected=env.___cxa_call_unexpected;
  var _sbrk=env._sbrk;
  var _strerror_r=env._strerror_r;
  var ___errno_location=env.___errno_location;
  var _strerror=env._strerror;
  var _time=env._time;
  var __exit=env.__exit;
  var ___cxa_end_catch=env.___cxa_end_catch;
// EMSCRIPTEN_START_FUNCS
function stackAlloc(size){size=size|0;var ret=0;ret=STACKTOP;STACKTOP=STACKTOP+size|0;STACKTOP=STACKTOP+7>>3<<3;return ret|0}function stackSave(){return STACKTOP|0}function stackRestore(top){top=top|0;STACKTOP=top}function setThrew(threw,value){threw=threw|0;value=value|0;if((__THREW__|0)==0){__THREW__=threw;threwValue=value}}function copyTempFloat(ptr){ptr=ptr|0;HEAP8[tempDoublePtr]=HEAP8[ptr];HEAP8[tempDoublePtr+1|0]=HEAP8[ptr+1|0];HEAP8[tempDoublePtr+2|0]=HEAP8[ptr+2|0];HEAP8[tempDoublePtr+3|0]=HEAP8[ptr+3|0]}function copyTempDouble(ptr){ptr=ptr|0;HEAP8[tempDoublePtr]=HEAP8[ptr];HEAP8[tempDoublePtr+1|0]=HEAP8[ptr+1|0];HEAP8[tempDoublePtr+2|0]=HEAP8[ptr+2|0];HEAP8[tempDoublePtr+3|0]=HEAP8[ptr+3|0];HEAP8[tempDoublePtr+4|0]=HEAP8[ptr+4|0];HEAP8[tempDoublePtr+5|0]=HEAP8[ptr+5|0];HEAP8[tempDoublePtr+6|0]=HEAP8[ptr+6|0];HEAP8[tempDoublePtr+7|0]=HEAP8[ptr+7|0]}function setTempRet0(value){value=value|0;tempRet0=value}function setTempRet1(value){value=value|0;tempRet1=value}function setTempRet2(value){value=value|0;tempRet2=value}function setTempRet3(value){value=value|0;tempRet3=value}function setTempRet4(value){value=value|0;tempRet4=value}function setTempRet5(value){value=value|0;tempRet5=value}function setTempRet6(value){value=value|0;tempRet6=value}function setTempRet7(value){value=value|0;tempRet7=value}function setTempRet8(value){value=value|0;tempRet8=value}function setTempRet9(value){value=value|0;tempRet9=value}function _get_length(){return HEAP32[48]|0}function _encodeblock($in,$out,$len_in,$len_out){$in=$in|0;$out=$out|0;$len_in=$len_in|0;$len_out=$len_out|0;var $5=0,$i_062=0,$i5_061=0,$j_060=0,$7=0,$13=0,$21=0,$31=0,$50=0,$60=0,$i5_1=0,$111=0,$115=0,$129=0,$136=0,$147=0,$154=0,$163=0,$165=0,$167=0,$181=0,$197=0,$204=0,$215=0,$222=0,$235=0,$242=0,$255=0,$262=0,$270=0,$277=0,$284=0,$j_0_lcssa=0,$309=0,$j_1=0,label=0;label=1;while(1)switch(label|0){case 1:$5=~~+Math_ceil(+(+($len_in>>>0>>>0)/2.5));HEAP32[$len_out>>2]=0;if(($5|0)==0){$j_0_lcssa=0;label=46;break}else{$j_060=0;$i5_061=0;$i_062=0;label=2;break};case 2:$7=$i_062+1|0;if(($7|0)==($5|0)){label=3;break}else{label=17;break};case 3:HEAP32[84]=0;if(($i_062&1|0)==0){label=11;break}else{label=4;break};case 4:$13=$i5_061+2|0;if($13>>>0<$len_in>>>0){label=5;break}else{label=6;break};case 5:HEAP32[84]=(HEAPU8[$in+$13|0]|0)<<28;label=6;break;case 6:$21=$i5_061+3|0;if($21>>>0<$len_in>>>0){label=7;break}else{label=8;break};case 7:HEAP32[84]=(HEAPU8[$in+$21|0]|0)<<20|HEAP32[84];label=8;break;case 8:$31=$i5_061+4|0;if($31>>>0<$len_in>>>0){label=9;break}else{label=10;break};case 9:HEAP32[84]=(HEAPU8[$in+$31|0]|0)<<12|HEAP32[84];label=10;break;case 10:$i5_1=$i5_061+5|0;label=20;break;case 11:if($i5_061>>>0<$len_in>>>0){label=12;break}else{label=13;break};case 12:HEAP32[84]=(HEAPU8[$in+$i5_061|0]|0)<<24;label=13;break;case 13:$50=$i5_061+1|0;if($50>>>0<$len_in>>>0){label=14;break}else{label=15;break};case 14:HEAP32[84]=(HEAPU8[$in+$50|0]|0)<<16|HEAP32[84];label=15;break;case 15:$60=$i5_061+2|0;if($60>>>0<$len_in>>>0){label=16;break}else{$i5_1=$i5_061;label=20;break};case 16:HEAP32[84]=(HEAPU8[$in+$60|0]|0)<<8&61440|HEAP32[84];$i5_1=$i5_061;label=20;break;case 17:if(($i_062&1|0)==0){label=19;break}else{label=18;break};case 18:HEAP32[84]=(HEAPU8[$in+($i5_061+3)|0]|0)<<20|(HEAPU8[$in+($i5_061+2)|0]|0)<<28|(HEAPU8[$in+($i5_061+4)|0]|0)<<12;$i5_1=$i5_061+5|0;label=20;break;case 19:HEAP32[84]=(HEAPU8[$in+($i5_061+1)|0]|0)<<16|(HEAPU8[$in+$i5_061|0]|0)<<24|(HEAPU8[$in+($i5_061+2)|0]|0)<<8&61440;$i5_1=$i5_061;label=20;break;case 20:$111=HEAP32[84]|0;if(($111&66048e3|0)==31703040){label=21;break}else{label=22;break};case 21:$115=HEAP32[84]|0;HEAP32[52]=$115<<11&16777216|$115<<5&33554432|$115>>>10&4128768|943734784;label=38;break;case 22:if(($111&65536e3|0)==31457280){label=23;break}else{label=24;break};case 23:$129=HEAP32[84]|0;$136=HEAP32[84]|0;HEAP32[52]=$136>>>5&16128|$136>>>10&4128768|($129<<12&16777216|$129<<5&33554432|809517056);label=38;break;case 24:if(($111&512e3|0)==245760){label=25;break}else{label=26;break};case 25:$147=HEAP32[84]|0;$154=HEAP32[84]|0;HEAP32[52]=$154>>>12&16128|$154>>>10&4128768|($147<<5&16777216|$147<<12&33554432|876625920);label=38;break;case 26:$163=($111&50331648|0)==0;$165=($111&393216|0)==0;if($163|$165){label=28;break}else{label=27;break};case 27:$167=HEAP32[84]|0;HEAP32[52]=$167>>>3&8323072|$167>>>2&1056964608|$167>>>4&32512|1073741824;label=38;break;case 28:if(($111&-218103808|0)==0){label=29;break}else{label=30;break};case 29:$181=HEAP32[84]|0;HEAP32[52]=$181&201326592|$181<<2&50331648|$181>>>2&983040|$181>>>4&16128|538984448;label=38;break;case 30:if(($111&-268042240|0)==0){label=31;break}else{label=32;break};case 31:$197=HEAP32[84]|0;$204=HEAP32[84]|0;HEAP32[52]=$204>>>4&3840|$204>>>3&4128768|($197>>>1&117440512|$197<<11&134217728|541073408);label=38;break;case 32:if(($111&50724864|0)==0){label=33;break}else{label=34;break};case 33:$215=HEAP32[84]|0;$222=HEAP32[84]|0;HEAP32[52]=$222>>>6&8192|$222>>>4&983040|($215>>>6&3145728|$215>>>4&251658240|541081600)|(HEAP32[84]|0)>>>4&7936;label=38;break;case 34:if($163){label=35;break}else{label=36;break};case 35:$235=HEAP32[84]|0;$242=HEAP32[84]|0;HEAP32[52]=$242>>>14&4096|$242>>>6&8192|($235>>>11&2031616|$235<<12&2130706432|12615680)|(HEAP32[84]|0)>>>12&3840;label=38;break;case 36:if($165){label=37;break}else{label=38;break};case 37:$255=HEAP32[84]|0;$262=HEAP32[84]|0;HEAP32[52]=$262>>>11&32512|$262<<4&2031616|($255>>>5&2097152|$255>>>3&520093696|-1065353216);label=38;break;case 38:$270=HEAP32[52]|0;if(($270&-16777216|0)==637534208){label=39;break}else{label=40;break};case 39:HEAP32[52]=$270&16777215|150994944;label=40;break;case 40:$277=HEAP32[52]|0;if(($277&16711680|0)==2490368){label=41;break}else{label=42;break};case 41:HEAP32[52]=$277&-16711681|589824;label=42;break;case 42:$284=HEAP32[52]|0;if(($284&65280|0)==9728){label=43;break}else{label=44;break};case 43:HEAP32[52]=$284&-65281|2304;label=44;break;case 44:HEAP8[$out+$j_060|0]=(HEAP32[52]|0)>>>24&255;HEAP8[$out+($j_060+1)|0]=(HEAP32[52]|0)>>>16&255;HEAP8[$out+($j_060+2)|0]=(HEAP32[52]|0)>>>8&255;if($7>>>0<$5>>>0){$j_060=$j_060+3|0;$i5_061=$i5_1;$i_062=$7;label=2;break}else{label=45;break};case 45:$j_0_lcssa=$5*3&-1;label=46;break;case 46:$309=($len_in>>>0)%5>>>0;if(($309|0)==0){$j_1=$j_0_lcssa;label=48;break}else{label=47;break};case 47:HEAP8[$out+$j_0_lcssa|0]=63;HEAP8[$out+($j_0_lcssa+1)|0]=($309|48)&255;HEAP8[$out+($j_0_lcssa+2)|0]=63;$j_1=$j_0_lcssa+3|0;label=48;break;case 48:HEAP32[$len_out>>2]=$j_1;return}}function _decodeblock($in,$out,$len_in,$len_out){$in=$in|0;$out=$out|0;$len_in=$len_in|0;$len_out=$len_out|0;var $4=0,$i_065=0,$i3_064=0,$j_063=0,$6=0,$11=0,$26=0,$37=0,$48=0,$56=0,$79=0,$86=0,$93=0,$100=0,$104=0,$115=0,$117=0,$124=0,$132=0,$139=0,$154=0,$168=0,$187=0,$206=0,$213=0,$228=0,$235=0,$250=0,$264=0,$268=0,$j_1=0,$j_060=0,$j_059=0,$302=0,label=0;label=1;while(1)switch(label|0){case 1:$4=~~+Math_ceil(+(+($len_in>>>0>>>0)/6.0))<<1;HEAP32[$len_out>>2]=0;if(($4|0)==0){$j_060=0;label=41;break}else{$j_063=0;$i3_064=0;$i_065=0;label=2;break};case 2:HEAP32[84]=0;$6=$i_065+1|0;if(($6|0)==($4|0)|($i_065+2|0)==($4|0)){label=3;break}else{label=13;break};case 3:$11=$i3_064+2|0;if($11>>>0<$len_in>>>0){label=4;break}else{label=9;break};case 4:if((HEAP8[$in+$i3_064|0]|0)==63){label=5;break}else{label=9;break};case 5:if((HEAP8[$in+$11|0]|0)==63){label=6;break}else{label=9;break};case 6:$26=HEAP8[$in+($i3_064+1)|0]&7;if(($26|0)==0|$26>>>0>4){label=7;break}else{label=8;break};case 7:_perror(HEAP32[105]|0);$j_060=$j_063;label=41;break;case 8:$37=$j_063-(-($i_065&1^1)&5)+$26|0;HEAP32[$len_out>>2]=$37;$302=$37;$j_059=$j_063;label=42;break;case 9:if($i3_064>>>0<$len_in>>>0){label=10;break}else{label=11;break};case 10:HEAP32[84]=HEAPU8[$in+$i3_064|0]<<24|HEAP32[84];label=11;break;case 11:$48=$i3_064+1|0;if($48>>>0<$len_in>>>0){label=12;break}else{label=14;break};case 12:$56=HEAPU8[$in+$48|0]<<16|HEAP32[84];HEAP32[84]=$56;HEAP32[84]=HEAPU8[$in+$11|0]<<8|$56;label=14;break;case 13:HEAP32[84]=HEAPU8[$in+($i3_064+1)|0]<<16|HEAPU8[$in+$i3_064|0]<<24|HEAPU8[$in+($i3_064+2)|0]<<8;label=14;break;case 14:HEAP32[52]=0;$79=HEAP32[84]|0;if(($79&-16777216|0)==150994944){label=15;break}else{label=16;break};case 15:HEAP32[84]=$79&16777215|637534208;label=16;break;case 16:$86=HEAP32[84]|0;if(($86&16711680|0)==589824){label=17;break}else{label=18;break};case 17:HEAP32[84]=$86&-16711681|2490368;label=18;break;case 18:$93=HEAP32[84]|0;if(($93&65280|0)==2304){label=19;break}else{label=20;break};case 19:HEAP32[84]=$93&-65281|9728;label=20;break;case 20:$100=HEAP32[84]|0;if(($100&-54464512|0)==943734784){label=21;break}else{label=22;break};case 21:$104=HEAP32[84]|0;HEAP32[52]=$104>>>11&8192|$104>>>5&1048576|$104<<10&-67108864|31703040;label=37;break;case 22:$115=$100&-54476800;if(($115|0)==809517056){label=23;break}else if(($115|0)==876625920){label=24;break}else{label=25;break};case 23:$117=HEAP32[84]|0;$124=HEAP32[84]|0;HEAP32[52]=$124<<5&516096|$124<<10&-67108864|($117>>>12&4096|$117>>>5&1048576|31457280);label=37;break;case 24:$132=HEAP32[84]|0;$139=HEAP32[84]|0;HEAP32[52]=$139<<12&66060288|$139<<10&-67108864|($132>>>5&524288|$132>>>12&8192|245760);label=37;break;case 25:if(($100&-1065320448|0)==1073741824){label=26;break}else{label=27;break};case 26:$154=HEAP32[84]|0;HEAP32[52]=$154<<3&66584576|(HEAP32[52]|$100<<2&-67108864)|$154<<4&520192;label=37;break;case 27:if(($100&-252657664|0)==538984448){label=28;break}else{label=29;break};case 28:$168=HEAP32[84]|0;HEAP32[52]=$168>>>2&12582912|(HEAP32[52]|$100&201326592)|$168<<2&3932160|HEAP32[84]<<4&258048;label=37;break;case 29:if(($100&-255791104|0)==541073408){label=30;break}else{label=31;break};case 30:$187=HEAP32[84]|0;HEAP32[52]=$187<<1&234881024|(HEAP32[52]|$100>>>11&65536)|$187<<3&33030144|HEAP32[84]<<4&61440;label=37;break;case 31:if(($100&-255803392|0)==541081600){label=32;break}else{label=33;break};case 32:$206=HEAP32[84]|0;$213=HEAP32[84]|0;HEAP32[52]=$213<<4&126976|$213<<6&524288|($206<<6&201326592|(HEAP32[52]|$100<<4&-268435456)|$206<<4&15728640);label=37;break;case 33:if(($100&-2132754432|0)==12615680){label=34;break}else{label=35;break};case 34:$228=HEAP32[84]|0;$235=HEAP32[84]|0;HEAP32[52]=$235<<12&15728640|$235<<14&67108864|($228<<11&-134217728|(HEAP32[52]|$100>>>12&520192)|$228<<6&524288);label=37;break;case 35:if(($100&-524255232|0)==-1065353216){label=36;break}else{label=37;break};case 36:$250=HEAP32[84]|0;HEAP32[52]=$250<<5&67108864|(HEAP32[52]|$100<<3&-134217728)|$250>>>4&126976|HEAP32[84]<<11&66584576;label=37;break;case 37:$264=HEAP32[52]|0;if(($i_065&1|0)==0){label=39;break}else{label=38;break};case 38:$268=$out+($j_063+2)|0;HEAP8[$268]=(HEAPU8[$268]|$264>>>28)&255;HEAP8[$out+($j_063+3)|0]=(HEAP32[52]|0)>>>20&255;HEAP8[$out+($j_063+4)|0]=(HEAP32[52]|0)>>>12&255;$j_1=$j_063+5|0;label=40;break;case 39:HEAP8[$out+$j_063|0]=$264>>>24&255;HEAP8[$out+($j_063+1)|0]=(HEAP32[52]|0)>>>16&255;HEAP8[$out+($j_063+2)|0]=(HEAP32[52]|0)>>>8&255;$j_1=$j_063;label=40;break;case 40:if($6>>>0<$4>>>0){$j_063=$j_1;$i3_064=$i3_064+3|0;$i_065=$6;label=2;break}else{$j_060=$j_1;label=41;break};case 41:$302=HEAP32[$len_out>>2]|0;$j_059=$j_060;label=42;break;case 42:if(($302|0)==0){label=43;break}else{label=44;break};case 43:HEAP32[$len_out>>2]=$j_059;label=44;break;case 44:return}}function _encode_string($input_buffer,$input_len){$input_buffer=$input_buffer|0;$input_len=$input_len|0;var $4=0;$4=_malloc(((($input_len*6&-1)>>>0)/5>>>0)+12|0)|0;_encodeblock($input_buffer,$4,$input_len,192);return $4|0}function _decode_string($input_buffer,$input_len){$input_buffer=$input_buffer|0;$input_len=$input_len|0;var $4=0;$4=_malloc(((($input_len*5&-1)>>>0)/6>>>0)+5|0)|0;HEAP32[50]=$4;_decodeblock($input_buffer,$4,$input_len,192);return HEAP32[50]|0}function _test_string(){HEAP32[50]=_malloc(10)|0;_puts(8)|0;HEAP8[HEAP32[50]|0]=104;HEAP8[(HEAP32[50]|0)+1|0]=101;HEAP8[(HEAP32[50]|0)+2|0]=108;HEAP8[(HEAP32[50]|0)+3|0]=108;HEAP8[(HEAP32[50]|0)+4|0]=111;HEAP8[(HEAP32[50]|0)+5|0]=0;HEAP8[(HEAP32[50]|0)+6|0]=111;return HEAP32[50]|0}function _malloc($bytes){$bytes=$bytes|0;var $8=0,$9=0,$10=0,$11=0,$17=0,$18=0,$20=0,$21=0,$22=0,$23=0,$24=0,$35=0,$40=0,$45=0,$56=0,$59=0,$62=0,$64=0,$65=0,$67=0,$69=0,$71=0,$73=0,$75=0,$77=0,$79=0,$82=0,$83=0,$85=0,$86=0,$87=0,$88=0,$89=0,$100=0,$105=0,$106=0,$109=0,$117=0,$120=0,$121=0,$122=0,$124=0,$125=0,$126=0,$133=0,$F4_0=0,$149=0,$155=0,$159=0,$nb_0=0,$162=0,$165=0,$166=0,$169=0,$184=0,$191=0,$194=0,$195=0,$196=0,$mem_0=0,label=0;label=1;while(1)switch(label|0){case 1:if($bytes>>>0<245){label=2;break}else{label=29;break};case 2:if($bytes>>>0<11){$8=16;label=4;break}else{label=3;break};case 3:$8=$bytes+11&-8;label=4;break;case 4:$9=$8>>>3;$10=HEAP32[296]|0;$11=$10>>>($9>>>0);if(($11&3|0)==0){label=12;break}else{label=5;break};case 5:$17=($11&1^1)+$9|0;$18=$17<<1;$20=1224+($18<<2)|0;$21=1224+($18+2<<2)|0;$22=HEAP32[$21>>2]|0;$23=$22+8|0;$24=HEAP32[$23>>2]|0;if(($20|0)==($24|0)){label=6;break}else{label=7;break};case 6:HEAP32[296]=$10&(1<<$17^-1);label=11;break;case 7:if($24>>>0<(HEAP32[300]|0)>>>0){label=10;break}else{label=8;break};case 8:$35=$24+12|0;if((HEAP32[$35>>2]|0)==($22|0)){label=9;break}else{label=10;break};case 9:HEAP32[$35>>2]=$20;HEAP32[$21>>2]=$24;label=11;break;case 10:_abort();return 0;return 0;case 11:$40=$17<<3;HEAP32[$22+4>>2]=$40|3;$45=$22+($40|4)|0;HEAP32[$45>>2]=HEAP32[$45>>2]|1;$mem_0=$23;label=40;break;case 12:if($8>>>0>(HEAP32[298]|0)>>>0){label=13;break}else{$nb_0=$8;label=32;break};case 13:if(($11|0)==0){label=27;break}else{label=14;break};case 14:$56=2<<$9;$59=$11<<$9&($56|-$56);$62=($59&-$59)-1|0;$64=$62>>>12&16;$65=$62>>>($64>>>0);$67=$65>>>5&8;$69=$65>>>($67>>>0);$71=$69>>>2&4;$73=$69>>>($71>>>0);$75=$73>>>1&2;$77=$73>>>($75>>>0);$79=$77>>>1&1;$82=($67|$64|$71|$75|$79)+($77>>>($79>>>0))|0;$83=$82<<1;$85=1224+($83<<2)|0;$86=1224+($83+2<<2)|0;$87=HEAP32[$86>>2]|0;$88=$87+8|0;$89=HEAP32[$88>>2]|0;if(($85|0)==($89|0)){label=15;break}else{label=16;break};case 15:HEAP32[296]=$10&(1<<$82^-1);label=20;break;case 16:if($89>>>0<(HEAP32[300]|0)>>>0){label=19;break}else{label=17;break};case 17:$100=$89+12|0;if((HEAP32[$100>>2]|0)==($87|0)){label=18;break}else{label=19;break};case 18:HEAP32[$100>>2]=$85;HEAP32[$86>>2]=$89;label=20;break;case 19:_abort();return 0;return 0;case 20:$105=$82<<3;$106=$105-$8|0;HEAP32[$87+4>>2]=$8|3;$109=$87;HEAP32[$109+($8|4)>>2]=$106|1;HEAP32[$109+$105>>2]=$106;$117=HEAP32[298]|0;if(($117|0)==0){label=26;break}else{label=21;break};case 21:$120=HEAP32[301]|0;$121=$117>>>3;$122=$121<<1;$124=1224+($122<<2)|0;$125=HEAP32[296]|0;$126=1<<$121;if(($125&$126|0)==0){label=22;break}else{label=23;break};case 22:HEAP32[296]=$125|$126;$F4_0=$124;label=25;break;case 23:$133=HEAP32[1224+($122+2<<2)>>2]|0;if($133>>>0<(HEAP32[300]|0)>>>0){label=24;break}else{$F4_0=$133;label=25;break};case 24:_abort();return 0;return 0;case 25:HEAP32[1224+($122+2<<2)>>2]=$120;HEAP32[$F4_0+12>>2]=$120;HEAP32[$120+8>>2]=$F4_0;HEAP32[$120+12>>2]=$124;label=26;break;case 26:HEAP32[298]=$106;HEAP32[301]=$109+$8;$mem_0=$88;label=40;break;case 27:if((HEAP32[297]|0)==0){$nb_0=$8;label=32;break}else{label=28;break};case 28:$149=_tmalloc_small($8)|0;if(($149|0)==0){$nb_0=$8;label=32;break}else{$mem_0=$149;label=40;break};case 29:if($bytes>>>0>4294967231){$nb_0=-1;label=32;break}else{label=30;break};case 30:$155=$bytes+11&-8;if((HEAP32[297]|0)==0){$nb_0=$155;label=32;break}else{label=31;break};case 31:$159=_tmalloc_large($155)|0;if(($159|0)==0){$nb_0=$155;label=32;break}else{$mem_0=$159;label=40;break};case 32:$162=HEAP32[298]|0;if($nb_0>>>0>$162>>>0){label=37;break}else{label=33;break};case 33:$165=$162-$nb_0|0;$166=HEAP32[301]|0;if($165>>>0>15){label=34;break}else{label=35;break};case 34:$169=$166;HEAP32[301]=$169+$nb_0;HEAP32[298]=$165;HEAP32[$169+($nb_0+4)>>2]=$165|1;HEAP32[$169+$162>>2]=$165;HEAP32[$166+4>>2]=$nb_0|3;label=36;break;case 35:HEAP32[298]=0;HEAP32[301]=0;HEAP32[$166+4>>2]=$162|3;$184=$166+($162+4)|0;HEAP32[$184>>2]=HEAP32[$184>>2]|1;label=36;break;case 36:$mem_0=$166+8|0;label=40;break;case 37:$191=HEAP32[299]|0;if($nb_0>>>0<$191>>>0){label=38;break}else{label=39;break};case 38:$194=$191-$nb_0|0;HEAP32[299]=$194;$195=HEAP32[302]|0;$196=$195;HEAP32[302]=$196+$nb_0;HEAP32[$196+($nb_0+4)>>2]=$194|1;HEAP32[$195+4>>2]=$nb_0|3;$mem_0=$195+8|0;label=40;break;case 39:$mem_0=_sys_alloc($nb_0)|0;label=40;break;case 40:return $mem_0|0}return 0}function _tmalloc_small($nb){$nb=$nb|0;var $1=0,$4=0,$6=0,$7=0,$9=0,$11=0,$13=0,$15=0,$17=0,$19=0,$21=0,$26=0,$rsize_0=0,$v_0=0,$t_0=0,$33=0,$37=0,$39=0,$43=0,$44=0,$46=0,$47=0,$50=0,$55=0,$57=0,$61=0,$65=0,$69=0,$74=0,$75=0,$78=0,$79=0,$RP_0=0,$R_0=0,$81=0,$85=0,$CP_0=0,$R_1=0,$98=0,$100=0,$114=0,$130=0,$142=0,$156=0,$160=0,$171=0,$174=0,$175=0,$176=0,$178=0,$179=0,$180=0,$187=0,$F1_0=0,label=0;label=1;while(1)switch(label|0){case 1:$1=HEAP32[297]|0;$4=($1&-$1)-1|0;$6=$4>>>12&16;$7=$4>>>($6>>>0);$9=$7>>>5&8;$11=$7>>>($9>>>0);$13=$11>>>2&4;$15=$11>>>($13>>>0);$17=$15>>>1&2;$19=$15>>>($17>>>0);$21=$19>>>1&1;$26=HEAP32[1488+(($9|$6|$13|$17|$21)+($19>>>($21>>>0))<<2)>>2]|0;$t_0=$26;$v_0=$26;$rsize_0=(HEAP32[$26+4>>2]&-8)-$nb|0;label=2;break;case 2:$33=HEAP32[$t_0+16>>2]|0;if(($33|0)==0){label=3;break}else{$39=$33;label=4;break};case 3:$37=HEAP32[$t_0+20>>2]|0;if(($37|0)==0){label=5;break}else{$39=$37;label=4;break};case 4:$43=(HEAP32[$39+4>>2]&-8)-$nb|0;$44=$43>>>0<$rsize_0>>>0;$t_0=$39;$v_0=$44?$39:$v_0;$rsize_0=$44?$43:$rsize_0;label=2;break;case 5:$46=$v_0;$47=HEAP32[300]|0;if($46>>>0<$47>>>0){label=51;break}else{label=6;break};case 6:$50=$46+$nb|0;if($46>>>0<$50>>>0){label=7;break}else{label=51;break};case 7:$55=HEAP32[$v_0+24>>2]|0;$57=HEAP32[$v_0+12>>2]|0;if(($57|0)==($v_0|0)){label=13;break}else{label=8;break};case 8:$61=HEAP32[$v_0+8>>2]|0;if($61>>>0<$47>>>0){label=12;break}else{label=9;break};case 9:$65=$61+12|0;if((HEAP32[$65>>2]|0)==($v_0|0)){label=10;break}else{label=12;break};case 10:$69=$57+8|0;if((HEAP32[$69>>2]|0)==($v_0|0)){label=11;break}else{label=12;break};case 11:HEAP32[$65>>2]=$57;HEAP32[$69>>2]=$61;$R_1=$57;label=21;break;case 12:_abort();return 0;return 0;case 13:$74=$v_0+20|0;$75=HEAP32[$74>>2]|0;if(($75|0)==0){label=14;break}else{$R_0=$75;$RP_0=$74;label=15;break};case 14:$78=$v_0+16|0;$79=HEAP32[$78>>2]|0;if(($79|0)==0){$R_1=0;label=21;break}else{$R_0=$79;$RP_0=$78;label=15;break};case 15:$81=$R_0+20|0;if((HEAP32[$81>>2]|0)==0){label=16;break}else{$CP_0=$81;label=17;break};case 16:$85=$R_0+16|0;if((HEAP32[$85>>2]|0)==0){label=18;break}else{$CP_0=$85;label=17;break};case 17:$R_0=HEAP32[$CP_0>>2]|0;$RP_0=$CP_0;label=15;break;case 18:if($RP_0>>>0<(HEAP32[300]|0)>>>0){label=20;break}else{label=19;break};case 19:HEAP32[$RP_0>>2]=0;$R_1=$R_0;label=21;break;case 20:_abort();return 0;return 0;case 21:if(($55|0)==0){label=41;break}else{label=22;break};case 22:$98=$v_0+28|0;$100=1488+(HEAP32[$98>>2]<<2)|0;if(($v_0|0)==(HEAP32[$100>>2]|0)){label=23;break}else{label=25;break};case 23:HEAP32[$100>>2]=$R_1;if(($R_1|0)==0){label=24;break}else{label=31;break};case 24:HEAP32[297]=HEAP32[297]&(1<<HEAP32[$98>>2]^-1);label=41;break;case 25:if($55>>>0<(HEAP32[300]|0)>>>0){label=29;break}else{label=26;break};case 26:$114=$55+16|0;if((HEAP32[$114>>2]|0)==($v_0|0)){label=27;break}else{label=28;break};case 27:HEAP32[$114>>2]=$R_1;label=30;break;case 28:HEAP32[$55+20>>2]=$R_1;label=30;break;case 29:_abort();return 0;return 0;case 30:if(($R_1|0)==0){label=41;break}else{label=31;break};case 31:if($R_1>>>0<(HEAP32[300]|0)>>>0){label=40;break}else{label=32;break};case 32:HEAP32[$R_1+24>>2]=$55;$130=HEAP32[$v_0+16>>2]|0;if(($130|0)==0){label=36;break}else{label=33;break};case 33:if($130>>>0<(HEAP32[300]|0)>>>0){label=35;break}else{label=34;break};case 34:HEAP32[$R_1+16>>2]=$130;HEAP32[$130+24>>2]=$R_1;label=36;break;case 35:_abort();return 0;return 0;case 36:$142=HEAP32[$v_0+20>>2]|0;if(($142|0)==0){label=41;break}else{label=37;break};case 37:if($142>>>0<(HEAP32[300]|0)>>>0){label=39;break}else{label=38;break};case 38:HEAP32[$R_1+20>>2]=$142;HEAP32[$142+24>>2]=$R_1;label=41;break;case 39:_abort();return 0;return 0;case 40:_abort();return 0;return 0;case 41:if($rsize_0>>>0<16){label=42;break}else{label=43;break};case 42:$156=$rsize_0+$nb|0;HEAP32[$v_0+4>>2]=$156|3;$160=$46+($156+4)|0;HEAP32[$160>>2]=HEAP32[$160>>2]|1;label=50;break;case 43:HEAP32[$v_0+4>>2]=$nb|3;HEAP32[$46+($nb+4)>>2]=$rsize_0|1;HEAP32[$46+($rsize_0+$nb)>>2]=$rsize_0;$171=HEAP32[298]|0;if(($171|0)==0){label=49;break}else{label=44;break};case 44:$174=HEAP32[301]|0;$175=$171>>>3;$176=$175<<1;$178=1224+($176<<2)|0;$179=HEAP32[296]|0;$180=1<<$175;if(($179&$180|0)==0){label=45;break}else{label=46;break};case 45:HEAP32[296]=$179|$180;$F1_0=$178;label=48;break;case 46:$187=HEAP32[1224+($176+2<<2)>>2]|0;if($187>>>0<(HEAP32[300]|0)>>>0){label=47;break}else{$F1_0=$187;label=48;break};case 47:_abort();return 0;return 0;case 48:HEAP32[1224+($176+2<<2)>>2]=$174;HEAP32[$F1_0+12>>2]=$174;HEAP32[$174+8>>2]=$F1_0;HEAP32[$174+12>>2]=$178;label=49;break;case 49:HEAP32[298]=$rsize_0;HEAP32[301]=$50;label=50;break;case 50:return $v_0+8|0;case 51:_abort();return 0;return 0}return 0}function _tmalloc_large($nb){$nb=$nb|0;var $1=0,$2=0,$9=0,$10=0,$13=0,$15=0,$18=0,$23=0,$idx_0=0,$31=0,$39=0,$rst_0=0,$sizebits_0=0,$t_0=0,$rsize_0=0,$v_0=0,$44=0,$45=0,$rsize_1=0,$v_1=0,$51=0,$54=0,$rst_1=0,$t_1=0,$rsize_2=0,$v_2=0,$62=0,$66=0,$71=0,$73=0,$74=0,$76=0,$78=0,$80=0,$82=0,$84=0,$86=0,$88=0,$t_2_ph=0,$v_330=0,$rsize_329=0,$t_228=0,$98=0,$99=0,$_rsize_3=0,$t_2_v_3=0,$101=0,$104=0,$v_3_lcssa=0,$rsize_3_lcssa=0,$112=0,$113=0,$116=0,$117=0,$121=0,$123=0,$127=0,$131=0,$135=0,$140=0,$141=0,$144=0,$145=0,$RP_0=0,$R_0=0,$147=0,$151=0,$CP_0=0,$R_1=0,$164=0,$166=0,$180=0,$196=0,$208=0,$222=0,$226=0,$237=0,$240=0,$242=0,$243=0,$244=0,$251=0,$F5_0=0,$264=0,$265=0,$272=0,$273=0,$276=0,$278=0,$281=0,$286=0,$I7_0=0,$293=0,$300=0,$301=0,$320=0,$T_0=0,$K12_0=0,$329=0,$330=0,$346=0,$347=0,$349=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$1=-$nb|0;$2=$nb>>>8;if(($2|0)==0){$idx_0=0;label=4;break}else{label=2;break};case 2:if($nb>>>0>16777215){$idx_0=31;label=4;break}else{label=3;break};case 3:$9=($2+1048320|0)>>>16&8;$10=$2<<$9;$13=($10+520192|0)>>>16&4;$15=$10<<$13;$18=($15+245760|0)>>>16&2;$23=14-($13|$9|$18)+($15<<$18>>>15)|0;$idx_0=$nb>>>(($23+7|0)>>>0)&1|$23<<1;label=4;break;case 4:$31=HEAP32[1488+($idx_0<<2)>>2]|0;if(($31|0)==0){$v_2=0;$rsize_2=$1;$t_1=0;label=11;break}else{label=5;break};case 5:if(($idx_0|0)==31){$39=0;label=7;break}else{label=6;break};case 6:$39=25-($idx_0>>>1)|0;label=7;break;case 7:$v_0=0;$rsize_0=$1;$t_0=$31;$sizebits_0=$nb<<$39;$rst_0=0;label=8;break;case 8:$44=HEAP32[$t_0+4>>2]&-8;$45=$44-$nb|0;if($45>>>0<$rsize_0>>>0){label=9;break}else{$v_1=$v_0;$rsize_1=$rsize_0;label=10;break};case 9:if(($44|0)==($nb|0)){$v_2=$t_0;$rsize_2=$45;$t_1=$t_0;label=11;break}else{$v_1=$t_0;$rsize_1=$45;label=10;break};case 10:$51=HEAP32[$t_0+20>>2]|0;$54=HEAP32[$t_0+16+($sizebits_0>>>31<<2)>>2]|0;$rst_1=($51|0)==0|($51|0)==($54|0)?$rst_0:$51;if(($54|0)==0){$v_2=$v_1;$rsize_2=$rsize_1;$t_1=$rst_1;label=11;break}else{$v_0=$v_1;$rsize_0=$rsize_1;$t_0=$54;$sizebits_0=$sizebits_0<<1;$rst_0=$rst_1;label=8;break};case 11:if(($t_1|0)==0&($v_2|0)==0){label=12;break}else{$t_2_ph=$t_1;label=14;break};case 12:$62=2<<$idx_0;$66=HEAP32[297]&($62|-$62);if(($66|0)==0){$t_2_ph=$t_1;label=14;break}else{label=13;break};case 13:$71=($66&-$66)-1|0;$73=$71>>>12&16;$74=$71>>>($73>>>0);$76=$74>>>5&8;$78=$74>>>($76>>>0);$80=$78>>>2&4;$82=$78>>>($80>>>0);$84=$82>>>1&2;$86=$82>>>($84>>>0);$88=$86>>>1&1;$t_2_ph=HEAP32[1488+(($76|$73|$80|$84|$88)+($86>>>($88>>>0))<<2)>>2]|0;label=14;break;case 14:if(($t_2_ph|0)==0){$rsize_3_lcssa=$rsize_2;$v_3_lcssa=$v_2;label=17;break}else{$t_228=$t_2_ph;$rsize_329=$rsize_2;$v_330=$v_2;label=15;break};case 15:$98=(HEAP32[$t_228+4>>2]&-8)-$nb|0;$99=$98>>>0<$rsize_329>>>0;$_rsize_3=$99?$98:$rsize_329;$t_2_v_3=$99?$t_228:$v_330;$101=HEAP32[$t_228+16>>2]|0;if(($101|0)==0){label=16;break}else{$t_228=$101;$rsize_329=$_rsize_3;$v_330=$t_2_v_3;label=15;break};case 16:$104=HEAP32[$t_228+20>>2]|0;if(($104|0)==0){$rsize_3_lcssa=$_rsize_3;$v_3_lcssa=$t_2_v_3;label=17;break}else{$t_228=$104;$rsize_329=$_rsize_3;$v_330=$t_2_v_3;label=15;break};case 17:if(($v_3_lcssa|0)==0){$_0=0;label=82;break}else{label=18;break};case 18:if($rsize_3_lcssa>>>0<((HEAP32[298]|0)-$nb|0)>>>0){label=19;break}else{$_0=0;label=82;break};case 19:$112=$v_3_lcssa;$113=HEAP32[300]|0;if($112>>>0<$113>>>0){label=81;break}else{label=20;break};case 20:$116=$112+$nb|0;$117=$116;if($112>>>0<$116>>>0){label=21;break}else{label=81;break};case 21:$121=HEAP32[$v_3_lcssa+24>>2]|0;$123=HEAP32[$v_3_lcssa+12>>2]|0;if(($123|0)==($v_3_lcssa|0)){label=27;break}else{label=22;break};case 22:$127=HEAP32[$v_3_lcssa+8>>2]|0;if($127>>>0<$113>>>0){label=26;break}else{label=23;break};case 23:$131=$127+12|0;if((HEAP32[$131>>2]|0)==($v_3_lcssa|0)){label=24;break}else{label=26;break};case 24:$135=$123+8|0;if((HEAP32[$135>>2]|0)==($v_3_lcssa|0)){label=25;break}else{label=26;break};case 25:HEAP32[$131>>2]=$123;HEAP32[$135>>2]=$127;$R_1=$123;label=35;break;case 26:_abort();return 0;return 0;case 27:$140=$v_3_lcssa+20|0;$141=HEAP32[$140>>2]|0;if(($141|0)==0){label=28;break}else{$R_0=$141;$RP_0=$140;label=29;break};case 28:$144=$v_3_lcssa+16|0;$145=HEAP32[$144>>2]|0;if(($145|0)==0){$R_1=0;label=35;break}else{$R_0=$145;$RP_0=$144;label=29;break};case 29:$147=$R_0+20|0;if((HEAP32[$147>>2]|0)==0){label=30;break}else{$CP_0=$147;label=31;break};case 30:$151=$R_0+16|0;if((HEAP32[$151>>2]|0)==0){label=32;break}else{$CP_0=$151;label=31;break};case 31:$R_0=HEAP32[$CP_0>>2]|0;$RP_0=$CP_0;label=29;break;case 32:if($RP_0>>>0<(HEAP32[300]|0)>>>0){label=34;break}else{label=33;break};case 33:HEAP32[$RP_0>>2]=0;$R_1=$R_0;label=35;break;case 34:_abort();return 0;return 0;case 35:if(($121|0)==0){label=55;break}else{label=36;break};case 36:$164=$v_3_lcssa+28|0;$166=1488+(HEAP32[$164>>2]<<2)|0;if(($v_3_lcssa|0)==(HEAP32[$166>>2]|0)){label=37;break}else{label=39;break};case 37:HEAP32[$166>>2]=$R_1;if(($R_1|0)==0){label=38;break}else{label=45;break};case 38:HEAP32[297]=HEAP32[297]&(1<<HEAP32[$164>>2]^-1);label=55;break;case 39:if($121>>>0<(HEAP32[300]|0)>>>0){label=43;break}else{label=40;break};case 40:$180=$121+16|0;if((HEAP32[$180>>2]|0)==($v_3_lcssa|0)){label=41;break}else{label=42;break};case 41:HEAP32[$180>>2]=$R_1;label=44;break;case 42:HEAP32[$121+20>>2]=$R_1;label=44;break;case 43:_abort();return 0;return 0;case 44:if(($R_1|0)==0){label=55;break}else{label=45;break};case 45:if($R_1>>>0<(HEAP32[300]|0)>>>0){label=54;break}else{label=46;break};case 46:HEAP32[$R_1+24>>2]=$121;$196=HEAP32[$v_3_lcssa+16>>2]|0;if(($196|0)==0){label=50;break}else{label=47;break};case 47:if($196>>>0<(HEAP32[300]|0)>>>0){label=49;break}else{label=48;break};case 48:HEAP32[$R_1+16>>2]=$196;HEAP32[$196+24>>2]=$R_1;label=50;break;case 49:_abort();return 0;return 0;case 50:$208=HEAP32[$v_3_lcssa+20>>2]|0;if(($208|0)==0){label=55;break}else{label=51;break};case 51:if($208>>>0<(HEAP32[300]|0)>>>0){label=53;break}else{label=52;break};case 52:HEAP32[$R_1+20>>2]=$208;HEAP32[$208+24>>2]=$R_1;label=55;break;case 53:_abort();return 0;return 0;case 54:_abort();return 0;return 0;case 55:if($rsize_3_lcssa>>>0<16){label=56;break}else{label=57;break};case 56:$222=$rsize_3_lcssa+$nb|0;HEAP32[$v_3_lcssa+4>>2]=$222|3;$226=$112+($222+4)|0;HEAP32[$226>>2]=HEAP32[$226>>2]|1;label=80;break;case 57:HEAP32[$v_3_lcssa+4>>2]=$nb|3;HEAP32[$112+($nb+4)>>2]=$rsize_3_lcssa|1;HEAP32[$112+($rsize_3_lcssa+$nb)>>2]=$rsize_3_lcssa;$237=$rsize_3_lcssa>>>3;if($rsize_3_lcssa>>>0<256){label=58;break}else{label=63;break};case 58:$240=$237<<1;$242=1224+($240<<2)|0;$243=HEAP32[296]|0;$244=1<<$237;if(($243&$244|0)==0){label=59;break}else{label=60;break};case 59:HEAP32[296]=$243|$244;$F5_0=$242;label=62;break;case 60:$251=HEAP32[1224+($240+2<<2)>>2]|0;if($251>>>0<(HEAP32[300]|0)>>>0){label=61;break}else{$F5_0=$251;label=62;break};case 61:_abort();return 0;return 0;case 62:HEAP32[1224+($240+2<<2)>>2]=$117;HEAP32[$F5_0+12>>2]=$117;HEAP32[$112+($nb+8)>>2]=$F5_0;HEAP32[$112+($nb+12)>>2]=$242;label=80;break;case 63:$264=$116;$265=$rsize_3_lcssa>>>8;if(($265|0)==0){$I7_0=0;label=66;break}else{label=64;break};case 64:if($rsize_3_lcssa>>>0>16777215){$I7_0=31;label=66;break}else{label=65;break};case 65:$272=($265+1048320|0)>>>16&8;$273=$265<<$272;$276=($273+520192|0)>>>16&4;$278=$273<<$276;$281=($278+245760|0)>>>16&2;$286=14-($276|$272|$281)+($278<<$281>>>15)|0;$I7_0=$rsize_3_lcssa>>>(($286+7|0)>>>0)&1|$286<<1;label=66;break;case 66:$293=1488+($I7_0<<2)|0;HEAP32[$112+($nb+28)>>2]=$I7_0;HEAP32[$112+($nb+20)>>2]=0;HEAP32[$112+($nb+16)>>2]=0;$300=HEAP32[297]|0;$301=1<<$I7_0;if(($300&$301|0)==0){label=67;break}else{label=68;break};case 67:HEAP32[297]=$300|$301;HEAP32[$293>>2]=$264;HEAP32[$112+($nb+24)>>2]=$293;HEAP32[$112+($nb+12)>>2]=$264;HEAP32[$112+($nb+8)>>2]=$264;label=80;break;case 68:if(($I7_0|0)==31){$320=0;label=70;break}else{label=69;break};case 69:$320=25-($I7_0>>>1)|0;label=70;break;case 70:$K12_0=$rsize_3_lcssa<<$320;$T_0=HEAP32[$293>>2]|0;label=71;break;case 71:if((HEAP32[$T_0+4>>2]&-8|0)==($rsize_3_lcssa|0)){label=76;break}else{label=72;break};case 72:$329=$T_0+16+($K12_0>>>31<<2)|0;$330=HEAP32[$329>>2]|0;if(($330|0)==0){label=73;break}else{$K12_0=$K12_0<<1;$T_0=$330;label=71;break};case 73:if($329>>>0<(HEAP32[300]|0)>>>0){label=75;break}else{label=74;break};case 74:HEAP32[$329>>2]=$264;HEAP32[$112+($nb+24)>>2]=$T_0;HEAP32[$112+($nb+12)>>2]=$264;HEAP32[$112+($nb+8)>>2]=$264;label=80;break;case 75:_abort();return 0;return 0;case 76:$346=$T_0+8|0;$347=HEAP32[$346>>2]|0;$349=HEAP32[300]|0;if($T_0>>>0<$349>>>0){label=79;break}else{label=77;break};case 77:if($347>>>0<$349>>>0){label=79;break}else{label=78;break};case 78:HEAP32[$347+12>>2]=$264;HEAP32[$346>>2]=$264;HEAP32[$112+($nb+8)>>2]=$347;HEAP32[$112+($nb+12)>>2]=$T_0;HEAP32[$112+($nb+24)>>2]=0;label=80;break;case 79:_abort();return 0;return 0;case 80:$_0=$v_3_lcssa+8|0;label=82;break;case 81:_abort();return 0;return 0;case 82:return $_0|0}return 0}function _sys_alloc($nb){$nb=$nb|0;var $6=0,$10=0,$13=0,$16=0,$17=0,$25=0,$29=0,$31=0,$34=0,$35=0,$36=0,$ssize_0=0,$46=0,$47=0,$51=0,$57=0,$58=0,$61=0,$66=0,$69=0,$75=0,$ssize_1=0,$br_0=0,$tsize_0=0,$tbase_0=0,$84=0,$89=0,$ssize_2=0,$tsize_0172326=0,$tsize_1=0,$105=0,$106=0,$110=0,$112=0,$_tbase_1=0,$tbase_232=0,$tsize_231=0,$115=0,$123=0,$sp_044=0,$132=0,$133=0,$134=0,$135=0,$139=0,$147=0,$sp_137=0,$160=0,$161=0,$165=0,$172=0,$177=0,$180=0,$181=0,$182=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:if((HEAP32[78]|0)==0){label=2;break}else{label=3;break};case 2:_init_mparams();label=3;break;case 3:$6=HEAP32[80]|0;$10=$nb+47+$6&-$6;if($10>>>0>$nb>>>0){label=4;break}else{$_0=0;label=51;break};case 4:$13=HEAP32[406]|0;if(($13|0)==0){label=6;break}else{label=5;break};case 5:$16=HEAP32[404]|0;$17=$16+$10|0;if($17>>>0<=$16>>>0|$17>>>0>$13>>>0){$_0=0;label=51;break}else{label=6;break};case 6:if((HEAP32[407]&4|0)==0){label=7;break}else{$tsize_1=0;label=26;break};case 7:$25=HEAP32[302]|0;if(($25|0)==0){label=9;break}else{label=8;break};case 8:$29=_segment_holding($25)|0;if(($29|0)==0){label=9;break}else{label=16;break};case 9:$31=_sbrk(0)|0;if(($31|0)==-1){$tsize_0172326=0;label=25;break}else{label=10;break};case 10:$34=$31;$35=HEAP32[79]|0;$36=$35-1|0;if(($36&$34|0)==0){$ssize_0=$10;label=12;break}else{label=11;break};case 11:$ssize_0=$10-$34+($36+$34&-$35)|0;label=12;break;case 12:$46=HEAP32[404]|0;$47=$46+$ssize_0|0;if($ssize_0>>>0>$nb>>>0&$ssize_0>>>0<2147483647){label=13;break}else{$tsize_0172326=0;label=25;break};case 13:$51=HEAP32[406]|0;if(($51|0)==0){label=15;break}else{label=14;break};case 14:if($47>>>0<=$46>>>0|$47>>>0>$51>>>0){$tsize_0172326=0;label=25;break}else{label=15;break};case 15:$57=_sbrk($ssize_0|0)|0;$58=($57|0)==($31|0);$tbase_0=$58?$31:-1;$tsize_0=$58?$ssize_0:0;$br_0=$57;$ssize_1=$ssize_0;label=18;break;case 16:$61=HEAP32[80]|0;$66=$nb+47-(HEAP32[299]|0)+$61&-$61;if($66>>>0<2147483647){label=17;break}else{$tsize_0172326=0;label=25;break};case 17:$69=_sbrk($66|0)|0;$75=($69|0)==((HEAP32[$29>>2]|0)+(HEAP32[$29+4>>2]|0)|0);$tbase_0=$75?$69:-1;$tsize_0=$75?$66:0;$br_0=$69;$ssize_1=$66;label=18;break;case 18:if(($tbase_0|0)==-1){label=19;break}else{$tsize_231=$tsize_0;$tbase_232=$tbase_0;label=29;break};case 19:if(($br_0|0)!=-1&$ssize_1>>>0<2147483647&$ssize_1>>>0<($nb+48|0)>>>0){label=20;break}else{$ssize_2=$ssize_1;label=24;break};case 20:$84=HEAP32[80]|0;$89=$nb+47-$ssize_1+$84&-$84;if($89>>>0<2147483647){label=21;break}else{$ssize_2=$ssize_1;label=24;break};case 21:if((_sbrk($89|0)|0)==-1){label=23;break}else{label=22;break};case 22:$ssize_2=$89+$ssize_1|0;label=24;break;case 23:_sbrk(-$ssize_1|0)|0;$tsize_0172326=$tsize_0;label=25;break;case 24:if(($br_0|0)==-1){$tsize_0172326=$tsize_0;label=25;break}else{$tsize_231=$ssize_2;$tbase_232=$br_0;label=29;break};case 25:HEAP32[407]=HEAP32[407]|4;$tsize_1=$tsize_0172326;label=26;break;case 26:if($10>>>0<2147483647){label=27;break}else{label=50;break};case 27:$105=_sbrk($10|0)|0;$106=_sbrk(0)|0;if(($106|0)!=-1&($105|0)!=-1&$105>>>0<$106>>>0){label=28;break}else{label=50;break};case 28:$110=$106-$105|0;$112=$110>>>0>($nb+40|0)>>>0;$_tbase_1=$112?$105:-1;if(($_tbase_1|0)==-1){label=50;break}else{$tsize_231=$112?$110:$tsize_1;$tbase_232=$_tbase_1;label=29;break};case 29:$115=(HEAP32[404]|0)+$tsize_231|0;HEAP32[404]=$115;if($115>>>0>(HEAP32[405]|0)>>>0){label=30;break}else{label=31;break};case 30:HEAP32[405]=$115;label=31;break;case 31:if((HEAP32[302]|0)==0){label=32;break}else{$sp_044=1632;label=35;break};case 32:$123=HEAP32[300]|0;if(($123|0)==0|$tbase_232>>>0<$123>>>0){label=33;break}else{label=34;break};case 33:HEAP32[300]=$tbase_232;label=34;break;case 34:HEAP32[408]=$tbase_232;HEAP32[409]=$tsize_231;HEAP32[411]=0;HEAP32[305]=HEAP32[78];HEAP32[304]=-1;_init_bins();_init_top($tbase_232,$tsize_231-40|0);label=48;break;case 35:$132=HEAP32[$sp_044>>2]|0;$133=$sp_044+4|0;$134=HEAP32[$133>>2]|0;$135=$132+$134|0;if(($tbase_232|0)==($135|0)){label=37;break}else{label=36;break};case 36:$139=HEAP32[$sp_044+8>>2]|0;if(($139|0)==0){label=40;break}else{$sp_044=$139;label=35;break};case 37:if((HEAP32[$sp_044+12>>2]&8|0)==0){label=38;break}else{label=40;break};case 38:$147=HEAP32[302]|0;if($147>>>0>=$132>>>0&$147>>>0<$135>>>0){label=39;break}else{label=40;break};case 39:HEAP32[$133>>2]=$134+$tsize_231;_init_top(HEAP32[302]|0,(HEAP32[299]|0)+$tsize_231|0);label=48;break;case 40:if($tbase_232>>>0<(HEAP32[300]|0)>>>0){label=41;break}else{label=42;break};case 41:HEAP32[300]=$tbase_232;label=42;break;case 42:$sp_137=1632;label=43;break;case 43:$160=$sp_137|0;$161=HEAP32[$160>>2]|0;if(($161|0)==($tbase_232+$tsize_231|0)){label=45;break}else{label=44;break};case 44:$165=HEAP32[$sp_137+8>>2]|0;if(($165|0)==0){label=47;break}else{$sp_137=$165;label=43;break};case 45:if((HEAP32[$sp_137+12>>2]&8|0)==0){label=46;break}else{label=47;break};case 46:HEAP32[$160>>2]=$tbase_232;$172=$sp_137+4|0;HEAP32[$172>>2]=(HEAP32[$172>>2]|0)+$tsize_231;$_0=_prepend_alloc($tbase_232,$161,$nb)|0;label=51;break;case 47:_add_segment($tbase_232,$tsize_231);label=48;break;case 48:$177=HEAP32[299]|0;if($177>>>0>$nb>>>0){label=49;break}else{label=50;break};case 49:$180=$177-$nb|0;HEAP32[299]=$180;$181=HEAP32[302]|0;$182=$181;HEAP32[302]=$182+$nb;HEAP32[$182+($nb+4)>>2]=$180|1;HEAP32[$181+4>>2]=$nb|3;$_0=$181+8|0;label=51;break;case 50:HEAP32[(___errno_location()|0)>>2]=12;$_0=0;label=51;break;case 51:return $_0|0}return 0}function _free($mem){$mem=$mem|0;var $3=0,$5=0,$10=0,$11=0,$14=0,$15=0,$16=0,$21=0,$_sum233=0,$24=0,$25=0,$26=0,$32=0,$37=0,$40=0,$43=0,$71=0,$74=0,$77=0,$82=0,$86=0,$90=0,$96=0,$97=0,$101=0,$102=0,$RP_0=0,$R_0=0,$104=0,$108=0,$CP_0=0,$R_1=0,$122=0,$124=0,$138=0,$155=0,$168=0,$181=0,$psize_0=0,$p_0=0,$193=0,$197=0,$198=0,$208=0,$224=0,$231=0,$232=0,$237=0,$240=0,$243=0,$272=0,$275=0,$278=0,$283=0,$288=0,$292=0,$298=0,$299=0,$303=0,$304=0,$RP9_0=0,$R7_0=0,$306=0,$310=0,$CP10_0=0,$R7_1=0,$324=0,$326=0,$340=0,$357=0,$370=0,$psize_1=0,$396=0,$399=0,$401=0,$402=0,$403=0,$410=0,$F16_0=0,$421=0,$422=0,$429=0,$430=0,$433=0,$435=0,$438=0,$443=0,$I18_0=0,$450=0,$454=0,$455=0,$470=0,$T_0=0,$K19_0=0,$479=0,$480=0,$493=0,$494=0,$496=0,$508=0,label=0;label=1;while(1)switch(label|0){case 1:if(($mem|0)==0){label=141;break}else{label=2;break};case 2:$3=$mem-8|0;$5=HEAP32[300]|0;if($3>>>0<$5>>>0){label=140;break}else{label=3;break};case 3:$10=HEAP32[$mem-4>>2]|0;$11=$10&3;if(($11|0)==1){label=140;break}else{label=4;break};case 4:$14=$10&-8;$15=$mem+($14-8)|0;$16=$15;if(($10&1|0)==0){label=5;break}else{$p_0=$3;$psize_0=$14;label=56;break};case 5:$21=HEAP32[$3>>2]|0;if(($11|0)==0){label=141;break}else{label=6;break};case 6:$_sum233=-8-$21|0;$24=$mem+$_sum233|0;$25=$24;$26=$21+$14|0;if($24>>>0<$5>>>0){label=140;break}else{label=7;break};case 7:if(($25|0)==(HEAP32[301]|0)){label=54;break}else{label=8;break};case 8:$32=$21>>>3;if($21>>>0<256){label=9;break}else{label=20;break};case 9:$37=HEAP32[$mem+($_sum233+8)>>2]|0;$40=HEAP32[$mem+($_sum233+12)>>2]|0;$43=1224+($32<<1<<2)|0;if(($37|0)==($43|0)){label=12;break}else{label=10;break};case 10:if($37>>>0<$5>>>0){label=19;break}else{label=11;break};case 11:if((HEAP32[$37+12>>2]|0)==($25|0)){label=12;break}else{label=19;break};case 12:if(($40|0)==($37|0)){label=13;break}else{label=14;break};case 13:HEAP32[296]=HEAP32[296]&(1<<$32^-1);$p_0=$25;$psize_0=$26;label=56;break;case 14:if(($40|0)==($43|0)){label=17;break}else{label=15;break};case 15:if($40>>>0<(HEAP32[300]|0)>>>0){label=18;break}else{label=16;break};case 16:if((HEAP32[$40+8>>2]|0)==($25|0)){label=17;break}else{label=18;break};case 17:HEAP32[$37+12>>2]=$40;HEAP32[$40+8>>2]=$37;$p_0=$25;$psize_0=$26;label=56;break;case 18:_abort();case 19:_abort();case 20:$71=$24;$74=HEAP32[$mem+($_sum233+24)>>2]|0;$77=HEAP32[$mem+($_sum233+12)>>2]|0;if(($77|0)==($71|0)){label=26;break}else{label=21;break};case 21:$82=HEAP32[$mem+($_sum233+8)>>2]|0;if($82>>>0<$5>>>0){label=25;break}else{label=22;break};case 22:$86=$82+12|0;if((HEAP32[$86>>2]|0)==($71|0)){label=23;break}else{label=25;break};case 23:$90=$77+8|0;if((HEAP32[$90>>2]|0)==($71|0)){label=24;break}else{label=25;break};case 24:HEAP32[$86>>2]=$77;HEAP32[$90>>2]=$82;$R_1=$77;label=34;break;case 25:_abort();case 26:$96=$mem+($_sum233+20)|0;$97=HEAP32[$96>>2]|0;if(($97|0)==0){label=27;break}else{$R_0=$97;$RP_0=$96;label=28;break};case 27:$101=$mem+($_sum233+16)|0;$102=HEAP32[$101>>2]|0;if(($102|0)==0){$R_1=0;label=34;break}else{$R_0=$102;$RP_0=$101;label=28;break};case 28:$104=$R_0+20|0;if((HEAP32[$104>>2]|0)==0){label=29;break}else{$CP_0=$104;label=30;break};case 29:$108=$R_0+16|0;if((HEAP32[$108>>2]|0)==0){label=31;break}else{$CP_0=$108;label=30;break};case 30:$R_0=HEAP32[$CP_0>>2]|0;$RP_0=$CP_0;label=28;break;case 31:if($RP_0>>>0<(HEAP32[300]|0)>>>0){label=33;break}else{label=32;break};case 32:HEAP32[$RP_0>>2]=0;$R_1=$R_0;label=34;break;case 33:_abort();case 34:if(($74|0)==0){$p_0=$25;$psize_0=$26;label=56;break}else{label=35;break};case 35:$122=$mem+($_sum233+28)|0;$124=1488+(HEAP32[$122>>2]<<2)|0;if(($71|0)==(HEAP32[$124>>2]|0)){label=36;break}else{label=38;break};case 36:HEAP32[$124>>2]=$R_1;if(($R_1|0)==0){label=37;break}else{label=44;break};case 37:HEAP32[297]=HEAP32[297]&(1<<HEAP32[$122>>2]^-1);$p_0=$25;$psize_0=$26;label=56;break;case 38:if($74>>>0<(HEAP32[300]|0)>>>0){label=42;break}else{label=39;break};case 39:$138=$74+16|0;if((HEAP32[$138>>2]|0)==($71|0)){label=40;break}else{label=41;break};case 40:HEAP32[$138>>2]=$R_1;label=43;break;case 41:HEAP32[$74+20>>2]=$R_1;label=43;break;case 42:_abort();case 43:if(($R_1|0)==0){$p_0=$25;$psize_0=$26;label=56;break}else{label=44;break};case 44:if($R_1>>>0<(HEAP32[300]|0)>>>0){label=53;break}else{label=45;break};case 45:HEAP32[$R_1+24>>2]=$74;$155=HEAP32[$mem+($_sum233+16)>>2]|0;if(($155|0)==0){label=49;break}else{label=46;break};case 46:if($155>>>0<(HEAP32[300]|0)>>>0){label=48;break}else{label=47;break};case 47:HEAP32[$R_1+16>>2]=$155;HEAP32[$155+24>>2]=$R_1;label=49;break;case 48:_abort();case 49:$168=HEAP32[$mem+($_sum233+20)>>2]|0;if(($168|0)==0){$p_0=$25;$psize_0=$26;label=56;break}else{label=50;break};case 50:if($168>>>0<(HEAP32[300]|0)>>>0){label=52;break}else{label=51;break};case 51:HEAP32[$R_1+20>>2]=$168;HEAP32[$168+24>>2]=$R_1;$p_0=$25;$psize_0=$26;label=56;break;case 52:_abort();case 53:_abort();case 54:$181=$mem+($14-4)|0;if((HEAP32[$181>>2]&3|0)==3){label=55;break}else{$p_0=$25;$psize_0=$26;label=56;break};case 55:HEAP32[298]=$26;HEAP32[$181>>2]=HEAP32[$181>>2]&-2;HEAP32[$mem+($_sum233+4)>>2]=$26|1;HEAP32[$15>>2]=$26;label=141;break;case 56:$193=$p_0;if($193>>>0<$15>>>0){label=57;break}else{label=140;break};case 57:$197=$mem+($14-4)|0;$198=HEAP32[$197>>2]|0;if(($198&1|0)==0){label=140;break}else{label=58;break};case 58:if(($198&2|0)==0){label=59;break}else{label=114;break};case 59:if(($16|0)==(HEAP32[302]|0)){label=60;break}else{label=64;break};case 60:$208=(HEAP32[299]|0)+$psize_0|0;HEAP32[299]=$208;HEAP32[302]=$p_0;HEAP32[$p_0+4>>2]=$208|1;if(($p_0|0)==(HEAP32[301]|0)){label=61;break}else{label=62;break};case 61:HEAP32[301]=0;HEAP32[298]=0;label=62;break;case 62:if($208>>>0>(HEAP32[303]|0)>>>0){label=63;break}else{label=141;break};case 63:_sys_trim(0)|0;label=141;break;case 64:if(($16|0)==(HEAP32[301]|0)){label=65;break}else{label=66;break};case 65:$224=(HEAP32[298]|0)+$psize_0|0;HEAP32[298]=$224;HEAP32[301]=$p_0;HEAP32[$p_0+4>>2]=$224|1;HEAP32[$193+$224>>2]=$224;label=141;break;case 66:$231=($198&-8)+$psize_0|0;$232=$198>>>3;if($198>>>0<256){label=67;break}else{label=78;break};case 67:$237=HEAP32[$mem+$14>>2]|0;$240=HEAP32[$mem+($14|4)>>2]|0;$243=1224+($232<<1<<2)|0;if(($237|0)==($243|0)){label=70;break}else{label=68;break};case 68:if($237>>>0<(HEAP32[300]|0)>>>0){label=77;break}else{label=69;break};case 69:if((HEAP32[$237+12>>2]|0)==($16|0)){label=70;break}else{label=77;break};case 70:if(($240|0)==($237|0)){label=71;break}else{label=72;break};case 71:HEAP32[296]=HEAP32[296]&(1<<$232^-1);label=112;break;case 72:if(($240|0)==($243|0)){label=75;break}else{label=73;break};case 73:if($240>>>0<(HEAP32[300]|0)>>>0){label=76;break}else{label=74;break};case 74:if((HEAP32[$240+8>>2]|0)==($16|0)){label=75;break}else{label=76;break};case 75:HEAP32[$237+12>>2]=$240;HEAP32[$240+8>>2]=$237;label=112;break;case 76:_abort();case 77:_abort();case 78:$272=$15;$275=HEAP32[$mem+($14+16)>>2]|0;$278=HEAP32[$mem+($14|4)>>2]|0;if(($278|0)==($272|0)){label=84;break}else{label=79;break};case 79:$283=HEAP32[$mem+$14>>2]|0;if($283>>>0<(HEAP32[300]|0)>>>0){label=83;break}else{label=80;break};case 80:$288=$283+12|0;if((HEAP32[$288>>2]|0)==($272|0)){label=81;break}else{label=83;break};case 81:$292=$278+8|0;if((HEAP32[$292>>2]|0)==($272|0)){label=82;break}else{label=83;break};case 82:HEAP32[$288>>2]=$278;HEAP32[$292>>2]=$283;$R7_1=$278;label=92;break;case 83:_abort();case 84:$298=$mem+($14+12)|0;$299=HEAP32[$298>>2]|0;if(($299|0)==0){label=85;break}else{$R7_0=$299;$RP9_0=$298;label=86;break};case 85:$303=$mem+($14+8)|0;$304=HEAP32[$303>>2]|0;if(($304|0)==0){$R7_1=0;label=92;break}else{$R7_0=$304;$RP9_0=$303;label=86;break};case 86:$306=$R7_0+20|0;if((HEAP32[$306>>2]|0)==0){label=87;break}else{$CP10_0=$306;label=88;break};case 87:$310=$R7_0+16|0;if((HEAP32[$310>>2]|0)==0){label=89;break}else{$CP10_0=$310;label=88;break};case 88:$R7_0=HEAP32[$CP10_0>>2]|0;$RP9_0=$CP10_0;label=86;break;case 89:if($RP9_0>>>0<(HEAP32[300]|0)>>>0){label=91;break}else{label=90;break};case 90:HEAP32[$RP9_0>>2]=0;$R7_1=$R7_0;label=92;break;case 91:_abort();case 92:if(($275|0)==0){label=112;break}else{label=93;break};case 93:$324=$mem+($14+20)|0;$326=1488+(HEAP32[$324>>2]<<2)|0;if(($272|0)==(HEAP32[$326>>2]|0)){label=94;break}else{label=96;break};case 94:HEAP32[$326>>2]=$R7_1;if(($R7_1|0)==0){label=95;break}else{label=102;break};case 95:HEAP32[297]=HEAP32[297]&(1<<HEAP32[$324>>2]^-1);label=112;break;case 96:if($275>>>0<(HEAP32[300]|0)>>>0){label=100;break}else{label=97;break};case 97:$340=$275+16|0;if((HEAP32[$340>>2]|0)==($272|0)){label=98;break}else{label=99;break};case 98:HEAP32[$340>>2]=$R7_1;label=101;break;case 99:HEAP32[$275+20>>2]=$R7_1;label=101;break;case 100:_abort();case 101:if(($R7_1|0)==0){label=112;break}else{label=102;break};case 102:if($R7_1>>>0<(HEAP32[300]|0)>>>0){label=111;break}else{label=103;break};case 103:HEAP32[$R7_1+24>>2]=$275;$357=HEAP32[$mem+($14+8)>>2]|0;if(($357|0)==0){label=107;break}else{label=104;break};case 104:if($357>>>0<(HEAP32[300]|0)>>>0){label=106;break}else{label=105;break};case 105:HEAP32[$R7_1+16>>2]=$357;HEAP32[$357+24>>2]=$R7_1;label=107;break;case 106:_abort();case 107:$370=HEAP32[$mem+($14+12)>>2]|0;if(($370|0)==0){label=112;break}else{label=108;break};case 108:if($370>>>0<(HEAP32[300]|0)>>>0){label=110;break}else{label=109;break};case 109:HEAP32[$R7_1+20>>2]=$370;HEAP32[$370+24>>2]=$R7_1;label=112;break;case 110:_abort();case 111:_abort();case 112:HEAP32[$p_0+4>>2]=$231|1;HEAP32[$193+$231>>2]=$231;if(($p_0|0)==(HEAP32[301]|0)){label=113;break}else{$psize_1=$231;label=115;break};case 113:HEAP32[298]=$231;label=141;break;case 114:HEAP32[$197>>2]=$198&-2;HEAP32[$p_0+4>>2]=$psize_0|1;HEAP32[$193+$psize_0>>2]=$psize_0;$psize_1=$psize_0;label=115;break;case 115:$396=$psize_1>>>3;if($psize_1>>>0<256){label=116;break}else{label=121;break};case 116:$399=$396<<1;$401=1224+($399<<2)|0;$402=HEAP32[296]|0;$403=1<<$396;if(($402&$403|0)==0){label=117;break}else{label=118;break};case 117:HEAP32[296]=$402|$403;$F16_0=$401;label=120;break;case 118:$410=HEAP32[1224+($399+2<<2)>>2]|0;if($410>>>0<(HEAP32[300]|0)>>>0){label=119;break}else{$F16_0=$410;label=120;break};case 119:_abort();case 120:HEAP32[1224+($399+2<<2)>>2]=$p_0;HEAP32[$F16_0+12>>2]=$p_0;HEAP32[$p_0+8>>2]=$F16_0;HEAP32[$p_0+12>>2]=$401;label=141;break;case 121:$421=$p_0;$422=$psize_1>>>8;if(($422|0)==0){$I18_0=0;label=124;break}else{label=122;break};case 122:if($psize_1>>>0>16777215){$I18_0=31;label=124;break}else{label=123;break};case 123:$429=($422+1048320|0)>>>16&8;$430=$422<<$429;$433=($430+520192|0)>>>16&4;$435=$430<<$433;$438=($435+245760|0)>>>16&2;$443=14-($433|$429|$438)+($435<<$438>>>15)|0;$I18_0=$psize_1>>>(($443+7|0)>>>0)&1|$443<<1;label=124;break;case 124:$450=1488+($I18_0<<2)|0;HEAP32[$p_0+28>>2]=$I18_0;HEAP32[$p_0+20>>2]=0;HEAP32[$p_0+16>>2]=0;$454=HEAP32[297]|0;$455=1<<$I18_0;if(($454&$455|0)==0){label=125;break}else{label=126;break};case 125:HEAP32[297]=$454|$455;HEAP32[$450>>2]=$421;HEAP32[$p_0+24>>2]=$450;HEAP32[$p_0+12>>2]=$p_0;HEAP32[$p_0+8>>2]=$p_0;label=138;break;case 126:if(($I18_0|0)==31){$470=0;label=128;break}else{label=127;break};case 127:$470=25-($I18_0>>>1)|0;label=128;break;case 128:$K19_0=$psize_1<<$470;$T_0=HEAP32[$450>>2]|0;label=129;break;case 129:if((HEAP32[$T_0+4>>2]&-8|0)==($psize_1|0)){label=134;break}else{label=130;break};case 130:$479=$T_0+16+($K19_0>>>31<<2)|0;$480=HEAP32[$479>>2]|0;if(($480|0)==0){label=131;break}else{$K19_0=$K19_0<<1;$T_0=$480;label=129;break};case 131:if($479>>>0<(HEAP32[300]|0)>>>0){label=133;break}else{label=132;break};case 132:HEAP32[$479>>2]=$421;HEAP32[$p_0+24>>2]=$T_0;HEAP32[$p_0+12>>2]=$p_0;HEAP32[$p_0+8>>2]=$p_0;label=138;break;case 133:_abort();case 134:$493=$T_0+8|0;$494=HEAP32[$493>>2]|0;$496=HEAP32[300]|0;if($T_0>>>0<$496>>>0){label=137;break}else{label=135;break};case 135:if($494>>>0<$496>>>0){label=137;break}else{label=136;break};case 136:HEAP32[$494+12>>2]=$421;HEAP32[$493>>2]=$421;HEAP32[$p_0+8>>2]=$494;HEAP32[$p_0+12>>2]=$T_0;HEAP32[$p_0+24>>2]=0;label=138;break;case 137:_abort();case 138:$508=(HEAP32[304]|0)-1|0;HEAP32[304]=$508;if(($508|0)==0){label=139;break}else{label=141;break};case 139:_release_unused_segments();label=141;break;case 140:_abort();case 141:return}}function _release_unused_segments(){var $sp_0_in=0,$sp_0=0,label=0;label=1;while(1)switch(label|0){case 1:$sp_0_in=1640;label=2;break;case 2:$sp_0=HEAP32[$sp_0_in>>2]|0;if(($sp_0|0)==0){label=3;break}else{$sp_0_in=$sp_0+8|0;label=2;break};case 3:HEAP32[304]=-1;return}}function _sys_trim($pad){$pad=$pad|0;var $7=0,$11=0,$14=0,$20=0,$22=0,$28=0,$39=0,$40=0,$46=0,$49=0,$released_2=0,label=0;label=1;while(1)switch(label|0){case 1:if((HEAP32[78]|0)==0){label=2;break}else{label=3;break};case 2:_init_mparams();label=3;break;case 3:if($pad>>>0<4294967232){label=4;break}else{$released_2=0;label=13;break};case 4:$7=HEAP32[302]|0;if(($7|0)==0){$released_2=0;label=13;break}else{label=5;break};case 5:$11=HEAP32[299]|0;if($11>>>0>($pad+40|0)>>>0){label=6;break}else{label=11;break};case 6:$14=HEAP32[80]|0;$20=Math_imul((((-40-$pad-1+$11+$14|0)>>>0)/($14>>>0)>>>0)-1|0,$14)|0;$22=_segment_holding($7)|0;if((HEAP32[$22+12>>2]&8|0)==0){label=7;break}else{label=11;break};case 7:$28=_sbrk(0)|0;if(($28|0)==((HEAP32[$22>>2]|0)+(HEAP32[$22+4>>2]|0)|0)){label=8;break}else{label=11;break};case 8:$39=_sbrk(-($20>>>0>2147483646?-2147483648-$14|0:$20)|0)|0;$40=_sbrk(0)|0;if(($39|0)!=-1&$40>>>0<$28>>>0){label=9;break}else{label=11;break};case 9:$46=$28-$40|0;if(($28|0)==($40|0)){label=11;break}else{label=10;break};case 10:$49=$22+4|0;HEAP32[$49>>2]=(HEAP32[$49>>2]|0)-$46;HEAP32[404]=(HEAP32[404]|0)-$46;_init_top(HEAP32[302]|0,(HEAP32[299]|0)-$46|0);$released_2=($28|0)!=($40|0)&1;label=13;break;case 11:if((HEAP32[299]|0)>>>0>(HEAP32[303]|0)>>>0){label=12;break}else{$released_2=0;label=13;break};case 12:HEAP32[303]=-1;$released_2=0;label=13;break;case 13:return $released_2|0}return 0}function _calloc($n_elements,$elem_size){$n_elements=$n_elements|0;$elem_size=$elem_size|0;var $3=0,$req_0=0,$10=0,label=0;label=1;while(1)switch(label|0){case 1:if(($n_elements|0)==0){$req_0=0;label=4;break}else{label=2;break};case 2:$3=Math_imul($elem_size,$n_elements)|0;if(($elem_size|$n_elements)>>>0>65535){label=3;break}else{$req_0=$3;label=4;break};case 3:$req_0=(($3>>>0)/($n_elements>>>0)>>>0|0)==($elem_size|0)?$3:-1;label=4;break;case 4:$10=_malloc($req_0)|0;if(($10|0)==0){label=7;break}else{label=5;break};case 5:if((HEAP32[$10-4>>2]&3|0)==0){label=7;break}else{label=6;break};case 6:_memset($10|0,0,$req_0|0);label=7;break;case 7:return $10|0}return 0}function _realloc($oldmem,$bytes){$oldmem=$oldmem|0;$bytes=$bytes|0;var $14=0,$17=0,$23=0,$28=0,$33=0,$mem_0=0,label=0;label=1;while(1)switch(label|0){case 1:if(($oldmem|0)==0){label=2;break}else{label=3;break};case 2:$mem_0=_malloc($bytes)|0;label=11;break;case 3:if($bytes>>>0>4294967231){label=4;break}else{label=5;break};case 4:HEAP32[(___errno_location()|0)>>2]=12;$mem_0=0;label=11;break;case 5:if($bytes>>>0<11){$14=16;label=7;break}else{label=6;break};case 6:$14=$bytes+11&-8;label=7;break;case 7:$17=_try_realloc_chunk($oldmem-8|0,$14)|0;if(($17|0)==0){label=9;break}else{label=8;break};case 8:$mem_0=$17+8|0;label=11;break;case 9:$23=_malloc($bytes)|0;if(($23|0)==0){$mem_0=0;label=11;break}else{label=10;break};case 10:$28=HEAP32[$oldmem-4>>2]|0;$33=($28&-8)-(($28&3|0)==0?8:4)|0;_memcpy($23|0,$oldmem|0,$33>>>0<$bytes>>>0?$33:$bytes)|0;_free($oldmem);$mem_0=$23;label=11;break;case 11:return $mem_0|0}return 0}function _realloc_in_place($oldmem,$bytes){$oldmem=$oldmem|0;$bytes=$bytes|0;var $12=0,$14=0,label=0;label=1;while(1)switch(label|0){case 1:if(($oldmem|0)==0){label=7;break}else{label=2;break};case 2:if($bytes>>>0>4294967231){label=3;break}else{label=4;break};case 3:HEAP32[(___errno_location()|0)>>2]=12;label=7;break;case 4:if($bytes>>>0<11){$12=16;label=6;break}else{label=5;break};case 5:$12=$bytes+11&-8;label=6;break;case 6:$14=$oldmem-8|0;return((_try_realloc_chunk($14,$12)|0)==($14|0)?$oldmem:0)|0;case 7:return 0}return 0}function _memalign($alignment,$bytes){$alignment=$alignment|0;$bytes=$bytes|0;var $_0=0,label=0;label=1;while(1)switch(label|0){case 1:if($alignment>>>0<9){label=2;break}else{label=3;break};case 2:$_0=_malloc($bytes)|0;label=4;break;case 3:$_0=_internal_memalign($alignment,$bytes)|0;label=4;break;case 4:return $_0|0}return 0}function _internal_memalign($alignment,$bytes){$alignment=$alignment|0;$bytes=$bytes|0;var $_alignment=0,$a_0=0,$_1=0,$17=0,$20=0,$23=0,$24=0,$26=0,$34=0,$35=0,$37=0,$43=0,$44=0,$46=0,$48=0,$49=0,$51=0,$63=0,$69=0,$77=0,$p_0=0,$81=0,$82=0,$86=0,$90=0,$91=0,$101=0,$mem_0=0,label=0;label=1;while(1)switch(label|0){case 1:$_alignment=$alignment>>>0<16?16:$alignment;if(($_alignment-1&$_alignment|0)==0){$_1=$_alignment;label=3;break}else{$a_0=16;label=2;break};case 2:if($a_0>>>0<$_alignment>>>0){$a_0=$a_0<<1;label=2;break}else{$_1=$a_0;label=3;break};case 3:if((-64-$_1|0)>>>0>$bytes>>>0){label=5;break}else{label=4;break};case 4:HEAP32[(___errno_location()|0)>>2]=12;$mem_0=0;label=18;break;case 5:if($bytes>>>0<11){$17=16;label=7;break}else{label=6;break};case 6:$17=$bytes+11&-8;label=7;break;case 7:$20=_malloc($_1+12+$17|0)|0;if(($20|0)==0){$mem_0=0;label=18;break}else{label=8;break};case 8:$23=$20-8|0;$24=$23;$26=$_1-1|0;if(($20&$26|0)==0){$p_0=$24;label=14;break}else{label=9;break};case 9:$34=$20+$26&-$_1;$35=$34-8|0;$37=$23;if(($35-$37|0)>>>0>15){$43=$35;label=11;break}else{label=10;break};case 10:$43=$34+($_1-8)|0;label=11;break;case 11:$44=$43;$46=$43-$37|0;$48=$20-4|0;$49=HEAP32[$48>>2]|0;$51=($49&-8)-$46|0;if(($49&3|0)==0){label=12;break}else{label=13;break};case 12:HEAP32[$43>>2]=(HEAP32[$23>>2]|0)+$46;HEAP32[$43+4>>2]=$51;$p_0=$44;label=14;break;case 13:$63=$43+4|0;HEAP32[$63>>2]=$51|HEAP32[$63>>2]&1|2;$69=$43+($51+4)|0;HEAP32[$69>>2]=HEAP32[$69>>2]|1;HEAP32[$48>>2]=$46|HEAP32[$48>>2]&1|2;$77=$20+($46-4)|0;HEAP32[$77>>2]=HEAP32[$77>>2]|1;_dispose_chunk($24,$46);$p_0=$44;label=14;break;case 14:$81=$p_0+4|0;$82=HEAP32[$81>>2]|0;if(($82&3|0)==0){label=17;break}else{label=15;break};case 15:$86=$82&-8;if($86>>>0>($17+16|0)>>>0){label=16;break}else{label=17;break};case 16:$90=$86-$17|0;$91=$p_0;HEAP32[$81>>2]=$17|$82&1|2;HEAP32[$91+($17|4)>>2]=$90|3;$101=$91+($86|4)|0;HEAP32[$101>>2]=HEAP32[$101>>2]|1;_dispose_chunk($91+$17|0,$90);label=17;break;case 17:$mem_0=$p_0+8|0;label=18;break;case 18:return $mem_0|0}return 0}function _posix_memalign($pp,$alignment,$bytes){$pp=$pp|0;$alignment=$alignment|0;$bytes=$bytes|0;var $5=0,$mem_0=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:if(($alignment|0)==8){label=2;break}else{label=3;break};case 2:$mem_0=_malloc($bytes)|0;label=7;break;case 3:$5=$alignment>>>2;if(($alignment&3|0)!=0|($5|0)==0){$_0=22;label=9;break}else{label=4;break};case 4:if(($5+1073741823&$5|0)==0){label=5;break}else{$_0=22;label=9;break};case 5:if((-64-$alignment|0)>>>0<$bytes>>>0){$_0=12;label=9;break}else{label=6;break};case 6:$mem_0=_internal_memalign($alignment>>>0<16?16:$alignment,$bytes)|0;label=7;break;case 7:if(($mem_0|0)==0){$_0=12;label=9;break}else{label=8;break};case 8:HEAP32[$pp>>2]=$mem_0;$_0=0;label=9;break;case 9:return $_0|0}return 0}function _valloc($bytes){$bytes=$bytes|0;var label=0;label=1;while(1)switch(label|0){case 1:if((HEAP32[78]|0)==0){label=2;break}else{label=3;break};case 2:_init_mparams();label=3;break;case 3:return _memalign(HEAP32[79]|0,$bytes)|0}return 0}function _try_realloc_chunk($p,$nb){$p=$p|0;$nb=$nb|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$7=0,$10=0,$15=0,$16=0,$25=0,$43=0,$46=0,$60=0,$63=0,$77=0,$85=0,$storemerge27=0,$storemerge=0,$94=0,$97=0,$98=0,$103=0,$106=0,$109=0,$137=0,$140=0,$143=0,$148=0,$152=0,$156=0,$162=0,$163=0,$167=0,$168=0,$RP_0=0,$R_0=0,$170=0,$174=0,$CP_0=0,$R_1=0,$188=0,$190=0,$204=0,$221=0,$234=0,$253=0,$267=0,$newp_0=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$p+4|0;$2=HEAP32[$1>>2]|0;$3=$2&-8;$4=$p;$5=$4+$3|0;$6=$5;$7=HEAP32[300]|0;if($4>>>0<$7>>>0){label=69;break}else{label=2;break};case 2:$10=$2&3;if(($10|0)!=1&$4>>>0<$5>>>0){label=3;break}else{label=69;break};case 3:$15=$4+($3|4)|0;$16=HEAP32[$15>>2]|0;if(($16&1|0)==0){label=69;break}else{label=4;break};case 4:if(($10|0)==0){label=5;break}else{label=6;break};case 5:$newp_0=_mmap_resize($p,$nb)|0;label=70;break;case 6:if($3>>>0<$nb>>>0){label=9;break}else{label=7;break};case 7:$25=$3-$nb|0;if($25>>>0>15){label=8;break}else{$newp_0=$p;label=70;break};case 8:HEAP32[$1>>2]=$2&1|$nb|2;HEAP32[$4+($nb+4)>>2]=$25|3;HEAP32[$15>>2]=HEAP32[$15>>2]|1;_dispose_chunk($4+$nb|0,$25);$newp_0=$p;label=70;break;case 9:if(($6|0)==(HEAP32[302]|0)){label=10;break}else{label=12;break};case 10:$43=(HEAP32[299]|0)+$3|0;if($43>>>0>$nb>>>0){label=11;break}else{$newp_0=0;label=70;break};case 11:$46=$43-$nb|0;HEAP32[$1>>2]=$2&1|$nb|2;HEAP32[$4+($nb+4)>>2]=$46|1;HEAP32[302]=$4+$nb;HEAP32[299]=$46;$newp_0=$p;label=70;break;case 12:if(($6|0)==(HEAP32[301]|0)){label=13;break}else{label=18;break};case 13:$60=(HEAP32[298]|0)+$3|0;if($60>>>0<$nb>>>0){$newp_0=0;label=70;break}else{label=14;break};case 14:$63=$60-$nb|0;if($63>>>0>15){label=15;break}else{label=16;break};case 15:HEAP32[$1>>2]=$2&1|$nb|2;HEAP32[$4+($nb+4)>>2]=$63|1;HEAP32[$4+$60>>2]=$63;$77=$4+($60+4)|0;HEAP32[$77>>2]=HEAP32[$77>>2]&-2;$storemerge=$4+$nb|0;$storemerge27=$63;label=17;break;case 16:HEAP32[$1>>2]=$2&1|$60|2;$85=$4+($60+4)|0;HEAP32[$85>>2]=HEAP32[$85>>2]|1;$storemerge=0;$storemerge27=0;label=17;break;case 17:HEAP32[298]=$storemerge27;HEAP32[301]=$storemerge;$newp_0=$p;label=70;break;case 18:if(($16&2|0)==0){label=19;break}else{$newp_0=0;label=70;break};case 19:$94=($16&-8)+$3|0;if($94>>>0<$nb>>>0){$newp_0=0;label=70;break}else{label=20;break};case 20:$97=$94-$nb|0;$98=$16>>>3;if($16>>>0<256){label=21;break}else{label=32;break};case 21:$103=HEAP32[$4+($3+8)>>2]|0;$106=HEAP32[$4+($3+12)>>2]|0;$109=1224+($98<<1<<2)|0;if(($103|0)==($109|0)){label=24;break}else{label=22;break};case 22:if($103>>>0<$7>>>0){label=31;break}else{label=23;break};case 23:if((HEAP32[$103+12>>2]|0)==($6|0)){label=24;break}else{label=31;break};case 24:if(($106|0)==($103|0)){label=25;break}else{label=26;break};case 25:HEAP32[296]=HEAP32[296]&(1<<$98^-1);label=66;break;case 26:if(($106|0)==($109|0)){label=29;break}else{label=27;break};case 27:if($106>>>0<(HEAP32[300]|0)>>>0){label=30;break}else{label=28;break};case 28:if((HEAP32[$106+8>>2]|0)==($6|0)){label=29;break}else{label=30;break};case 29:HEAP32[$103+12>>2]=$106;HEAP32[$106+8>>2]=$103;label=66;break;case 30:_abort();return 0;return 0;case 31:_abort();return 0;return 0;case 32:$137=$5;$140=HEAP32[$4+($3+24)>>2]|0;$143=HEAP32[$4+($3+12)>>2]|0;if(($143|0)==($137|0)){label=38;break}else{label=33;break};case 33:$148=HEAP32[$4+($3+8)>>2]|0;if($148>>>0<$7>>>0){label=37;break}else{label=34;break};case 34:$152=$148+12|0;if((HEAP32[$152>>2]|0)==($137|0)){label=35;break}else{label=37;break};case 35:$156=$143+8|0;if((HEAP32[$156>>2]|0)==($137|0)){label=36;break}else{label=37;break};case 36:HEAP32[$152>>2]=$143;HEAP32[$156>>2]=$148;$R_1=$143;label=46;break;case 37:_abort();return 0;return 0;case 38:$162=$4+($3+20)|0;$163=HEAP32[$162>>2]|0;if(($163|0)==0){label=39;break}else{$R_0=$163;$RP_0=$162;label=40;break};case 39:$167=$4+($3+16)|0;$168=HEAP32[$167>>2]|0;if(($168|0)==0){$R_1=0;label=46;break}else{$R_0=$168;$RP_0=$167;label=40;break};case 40:$170=$R_0+20|0;if((HEAP32[$170>>2]|0)==0){label=41;break}else{$CP_0=$170;label=42;break};case 41:$174=$R_0+16|0;if((HEAP32[$174>>2]|0)==0){label=43;break}else{$CP_0=$174;label=42;break};case 42:$R_0=HEAP32[$CP_0>>2]|0;$RP_0=$CP_0;label=40;break;case 43:if($RP_0>>>0<(HEAP32[300]|0)>>>0){label=45;break}else{label=44;break};case 44:HEAP32[$RP_0>>2]=0;$R_1=$R_0;label=46;break;case 45:_abort();return 0;return 0;case 46:if(($140|0)==0){label=66;break}else{label=47;break};case 47:$188=$4+($3+28)|0;$190=1488+(HEAP32[$188>>2]<<2)|0;if(($137|0)==(HEAP32[$190>>2]|0)){label=48;break}else{label=50;break};case 48:HEAP32[$190>>2]=$R_1;if(($R_1|0)==0){label=49;break}else{label=56;break};case 49:HEAP32[297]=HEAP32[297]&(1<<HEAP32[$188>>2]^-1);label=66;break;case 50:if($140>>>0<(HEAP32[300]|0)>>>0){label=54;break}else{label=51;break};case 51:$204=$140+16|0;if((HEAP32[$204>>2]|0)==($137|0)){label=52;break}else{label=53;break};case 52:HEAP32[$204>>2]=$R_1;label=55;break;case 53:HEAP32[$140+20>>2]=$R_1;label=55;break;case 54:_abort();return 0;return 0;case 55:if(($R_1|0)==0){label=66;break}else{label=56;break};case 56:if($R_1>>>0<(HEAP32[300]|0)>>>0){label=65;break}else{label=57;break};case 57:HEAP32[$R_1+24>>2]=$140;$221=HEAP32[$4+($3+16)>>2]|0;if(($221|0)==0){label=61;break}else{label=58;break};case 58:if($221>>>0<(HEAP32[300]|0)>>>0){label=60;break}else{label=59;break};case 59:HEAP32[$R_1+16>>2]=$221;HEAP32[$221+24>>2]=$R_1;label=61;break;case 60:_abort();return 0;return 0;case 61:$234=HEAP32[$4+($3+20)>>2]|0;if(($234|0)==0){label=66;break}else{label=62;break};case 62:if($234>>>0<(HEAP32[300]|0)>>>0){label=64;break}else{label=63;break};case 63:HEAP32[$R_1+20>>2]=$234;HEAP32[$234+24>>2]=$R_1;label=66;break;case 64:_abort();return 0;return 0;case 65:_abort();return 0;return 0;case 66:if($97>>>0<16){label=67;break}else{label=68;break};case 67:HEAP32[$1>>2]=$94|HEAP32[$1>>2]&1|2;$253=$4+($94|4)|0;HEAP32[$253>>2]=HEAP32[$253>>2]|1;$newp_0=$p;label=70;break;case 68:HEAP32[$1>>2]=HEAP32[$1>>2]&1|$nb|2;HEAP32[$4+($nb+4)>>2]=$97|3;$267=$4+($94|4)|0;HEAP32[$267>>2]=HEAP32[$267>>2]|1;_dispose_chunk($4+$nb|0,$97);$newp_0=$p;label=70;break;case 69:_abort();return 0;return 0;case 70:return $newp_0|0}return 0}function _malloc_footprint(){return HEAP32[404]|0}function _malloc_max_footprint(){return HEAP32[405]|0}function _malloc_footprint_limit(){var $1=0;$1=HEAP32[406]|0;return(($1|0)==0?-1:$1)|0}function _malloc_set_footprint_limit($bytes){$bytes=$bytes|0;var $3=0,$result_0=0,label=0;label=1;while(1)switch(label|0){case 1:if(($bytes|0)==-1){$result_0=0;label=3;break}else{label=2;break};case 2:$3=HEAP32[80]|0;$result_0=$bytes-1+$3&-$3;label=3;break;case 3:HEAP32[406]=$result_0;return $result_0|0}return 0}function _malloc_usable_size($mem){$mem=$mem|0;var $5=0,$6=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:if(($mem|0)==0){$_0=0;label=4;break}else{label=2;break};case 2:$5=HEAP32[$mem-4>>2]|0;$6=$5&3;if(($6|0)==1){$_0=0;label=4;break}else{label=3;break};case 3:$_0=($5&-8)-(($6|0)==0?8:4)|0;label=4;break;case 4:return $_0|0}return 0}function _pvalloc($bytes){$bytes=$bytes|0;var $5=0,label=0;label=1;while(1)switch(label|0){case 1:if((HEAP32[78]|0)==0){label=2;break}else{label=3;break};case 2:_init_mparams();label=3;break;case 3:$5=HEAP32[79]|0;return _memalign($5,$bytes-1+$5&-$5)|0}return 0}function _independent_calloc($n_elements,$elem_size,$chunks){$n_elements=$n_elements|0;$elem_size=$elem_size|0;$chunks=$chunks|0;var $sz=0,$1=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+8|0;$sz=__stackBase__|0;HEAP32[$sz>>2]=$elem_size;$1=_ialloc($n_elements,$sz,3,$chunks)|0;STACKTOP=__stackBase__;return $1|0}function _ialloc($n_elements,$sizes,$opts,$chunks){$n_elements=$n_elements|0;$sizes=$sizes|0;$opts=$opts|0;$chunks=$chunks|0;var $6=0,$13=0,$array_size_0=0,$marray_0=0,$23=0,$29=0,$i_08=0,$contents_size_07=0,$32=0,$38=0,$39=0,$40=0,$contents_size_1=0,$element_size_0=0,$44=0,$47=0,$51=0,$remainder_size_0=0,$marray_1=0,$67=0,$i_15=0,$remainder_size_14=0,$p_0_in3=0,$73=0,$size_0=0,$79=0,$83=0,$84=0,$remainder_size_1_lcssa=0,$p_0_in_lcssa=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:if((HEAP32[78]|0)==0){label=2;break}else{label=3;break};case 2:_init_mparams();label=3;break;case 3:$6=($n_elements|0)==0;if(($chunks|0)==0){label=5;break}else{label=4;break};case 4:if($6){$_0=$chunks;label=29;break}else{$marray_0=$chunks;$array_size_0=0;label=9;break};case 5:if($6){label=6;break}else{label=7;break};case 6:$_0=_malloc(0)|0;label=29;break;case 7:$13=$n_elements<<2;if($13>>>0<11){$marray_0=0;$array_size_0=16;label=9;break}else{label=8;break};case 8:$marray_0=0;$array_size_0=$13+11&-8;label=9;break;case 9:if(($opts&1|0)==0){label=10;break}else{label=11;break};case 10:if(($n_elements|0)==0){$element_size_0=0;$contents_size_1=0;label=17;break}else{$contents_size_07=0;$i_08=0;label=14;break};case 11:$23=HEAP32[$sizes>>2]|0;if($23>>>0<11){$29=16;label=13;break}else{label=12;break};case 12:$29=$23+11&-8;label=13;break;case 13:$element_size_0=$29;$contents_size_1=Math_imul($29,$n_elements)|0;label=17;break;case 14:$32=HEAP32[$sizes+($i_08<<2)>>2]|0;if($32>>>0<11){$38=16;label=16;break}else{label=15;break};case 15:$38=$32+11&-8;label=16;break;case 16:$39=$38+$contents_size_07|0;$40=$i_08+1|0;if(($40|0)==($n_elements|0)){$element_size_0=0;$contents_size_1=$39;label=17;break}else{$contents_size_07=$39;$i_08=$40;label=14;break};case 17:$44=_malloc($array_size_0-4+$contents_size_1|0)|0;if(($44|0)==0){$_0=0;label=29;break}else{label=18;break};case 18:$47=$44-8|0;$51=HEAP32[$44-4>>2]&-8;if(($opts&2|0)==0){label=20;break}else{label=19;break};case 19:_memset($44|0,0,-4-$array_size_0+$51|0);label=20;break;case 20:if(($marray_0|0)==0){label=21;break}else{$marray_1=$marray_0;$remainder_size_0=$51;label=22;break};case 21:HEAP32[$44+($contents_size_1-4)>>2]=$51-$contents_size_1|3;$marray_1=$44+$contents_size_1|0;$remainder_size_0=$contents_size_1;label=22;break;case 22:HEAP32[$marray_1>>2]=$44;$67=$n_elements-1|0;if(($67|0)==0){$p_0_in_lcssa=$47;$remainder_size_1_lcssa=$remainder_size_0;label=28;break}else{label=23;break};case 23:$p_0_in3=$47;$remainder_size_14=$remainder_size_0;$i_15=0;label=24;break;case 24:if(($element_size_0|0)==0){label=25;break}else{$size_0=$element_size_0;label=27;break};case 25:$73=HEAP32[$sizes+($i_15<<2)>>2]|0;if($73>>>0<11){$size_0=16;label=27;break}else{label=26;break};case 26:$size_0=$73+11&-8;label=27;break;case 27:$79=$remainder_size_14-$size_0|0;HEAP32[$p_0_in3+4>>2]=$size_0|3;$83=$p_0_in3+$size_0|0;$84=$i_15+1|0;HEAP32[$marray_1+($84<<2)>>2]=$p_0_in3+($size_0+8);if(($84|0)==($67|0)){$p_0_in_lcssa=$83;$remainder_size_1_lcssa=$79;label=28;break}else{$p_0_in3=$83;$remainder_size_14=$79;$i_15=$84;label=24;break};case 28:HEAP32[$p_0_in_lcssa+4>>2]=$remainder_size_1_lcssa|3;$_0=$marray_1;label=29;break;case 29:return $_0|0}return 0}function _independent_comalloc($n_elements,$sizes,$chunks){$n_elements=$n_elements|0;$sizes=$sizes|0;$chunks=$chunks|0;return _ialloc($n_elements,$sizes,0,$chunks)|0}function _bulk_free($array,$nelem){$array=$array|0;$nelem=$nelem|0;_internal_bulk_free($array,$nelem);return 0}function _malloc_trim($pad){$pad=$pad|0;var label=0;label=1;while(1)switch(label|0){case 1:if((HEAP32[78]|0)==0){label=2;break}else{label=3;break};case 2:_init_mparams();label=3;break;case 3:return _sys_trim($pad)|0}return 0}function _mallinfo($agg_result){$agg_result=$agg_result|0;_internal_mallinfo($agg_result);return}function _internal_mallinfo($agg_result){$agg_result=$agg_result|0;var $9=0,$s_011=0,$sum_010=0,$mfree_09=0,$nfree_08=0,$12=0,$13=0,$15=0,$22=0,$23=0,$24=0,$29=0,$q_0_in5=0,$sum_14=0,$mfree_13=0,$nfree_12=0,$35=0,$36=0,$39=0,$40=0,$nfree_2=0,$mfree_2=0,$49=0,$50=0,$sum_1_lcssa=0,$mfree_1_lcssa=0,$nfree_1_lcssa=0,$53=0,$56=0,$nm_sroa_7_0=0,$nm_sroa_6_0=0,$nm_sroa_4_0=0,$nm_sroa_3_0=0,$nm_sroa_1_0=0,$nm_sroa_0_0=0,$nm_sroa_8_0=0,$62=0,label=0;label=1;while(1)switch(label|0){case 1:if((HEAP32[78]|0)==0){label=2;break}else{label=3;break};case 2:_init_mparams();label=3;break;case 3:if((HEAP32[302]|0)==0){$nm_sroa_8_0=0;$nm_sroa_0_0=0;$nm_sroa_1_0=0;$nm_sroa_3_0=0;$nm_sroa_4_0=0;$nm_sroa_6_0=0;$nm_sroa_7_0=0;label=16;break}else{label=4;break};case 4:$9=(HEAP32[299]|0)+40|0;$nfree_08=1;$mfree_09=$9;$sum_010=$9;$s_011=1632;label=5;break;case 5:$12=$s_011|0;$13=HEAP32[$12>>2]|0;$15=$13+8|0;if(($15&7|0)==0){$22=0;label=7;break}else{label=6;break};case 6:$22=-$15&7;label=7;break;case 7:$23=$13+$22|0;$24=HEAP32[$12>>2]|0;if($23>>>0<$24>>>0){$nfree_1_lcssa=$nfree_08;$mfree_1_lcssa=$mfree_09;$sum_1_lcssa=$sum_010;label=14;break}else{label=8;break};case 8:$nfree_12=$nfree_08;$mfree_13=$mfree_09;$sum_14=$sum_010;$q_0_in5=$23;$29=$24;label=9;break;case 9:if($q_0_in5>>>0>=($29+(HEAP32[$s_011+4>>2]|0)|0)>>>0|($q_0_in5|0)==(HEAP32[302]|0)){$nfree_1_lcssa=$nfree_12;$mfree_1_lcssa=$mfree_13;$sum_1_lcssa=$sum_14;label=14;break}else{label=10;break};case 10:$35=$q_0_in5+4|0;$36=HEAP32[$35>>2]|0;if(($36|0)==7){$nfree_1_lcssa=$nfree_12;$mfree_1_lcssa=$mfree_13;$sum_1_lcssa=$sum_14;label=14;break}else{label=11;break};case 11:$39=$36&-8;$40=$39+$sum_14|0;if(($36&3|0)==1){label=12;break}else{$mfree_2=$mfree_13;$nfree_2=$nfree_12;label=13;break};case 12:$mfree_2=$39+$mfree_13|0;$nfree_2=$nfree_12+1|0;label=13;break;case 13:$49=$q_0_in5+(HEAP32[$35>>2]&-8)|0;$50=HEAP32[$12>>2]|0;if($49>>>0<$50>>>0){$nfree_1_lcssa=$nfree_2;$mfree_1_lcssa=$mfree_2;$sum_1_lcssa=$40;label=14;break}else{$nfree_12=$nfree_2;$mfree_13=$mfree_2;$sum_14=$40;$q_0_in5=$49;$29=$50;label=9;break};case 14:$53=HEAP32[$s_011+8>>2]|0;if(($53|0)==0){label=15;break}else{$nfree_08=$nfree_1_lcssa;$mfree_09=$mfree_1_lcssa;$sum_010=$sum_1_lcssa;$s_011=$53;label=5;break};case 15:$56=HEAP32[404]|0;$nm_sroa_8_0=HEAP32[299]|0;$nm_sroa_0_0=$sum_1_lcssa;$nm_sroa_1_0=$nfree_1_lcssa;$nm_sroa_3_0=$56-$sum_1_lcssa|0;$nm_sroa_4_0=HEAP32[405]|0;$nm_sroa_6_0=$56-$mfree_1_lcssa|0;$nm_sroa_7_0=$mfree_1_lcssa;label=16;break;case 16:HEAP32[$agg_result>>2]=$nm_sroa_0_0;HEAP32[$agg_result+4>>2]=$nm_sroa_1_0;$62=$agg_result+8|0;HEAP32[$62>>2]=0;HEAP32[$62+4>>2]=0;HEAP32[$agg_result+16>>2]=$nm_sroa_3_0;HEAP32[$agg_result+20>>2]=$nm_sroa_4_0;HEAP32[$agg_result+24>>2]=0;HEAP32[$agg_result+28>>2]=$nm_sroa_6_0;HEAP32[$agg_result+32>>2]=$nm_sroa_7_0;HEAP32[$agg_result+36>>2]=$nm_sroa_8_0;return}}function _malloc_stats(){_internal_malloc_stats();return}function _internal_malloc_stats(){var $9=0,$s_06=0,$used_05=0,$14=0,$15=0,$17=0,$24=0,$25=0,$26=0,$31=0,$q_0_in4=0,$used_13=0,$37=0,$38=0,$used_2=0,$49=0,$50=0,$used_1_lcssa=0,$53=0,$maxfp_0=0,$fp_0=0,$used_3=0,label=0,__stackBase__=0;__stackBase__=STACKTOP;label=1;while(1)switch(label|0){case 1:if((HEAP32[78]|0)==0){label=2;break}else{label=3;break};case 2:_init_mparams();label=3;break;case 3:if((HEAP32[302]|0)==0){$used_3=0;$fp_0=0;$maxfp_0=0;label=15;break}else{label=4;break};case 4:$9=HEAP32[404]|0;$used_05=$9-40-(HEAP32[299]|0)|0;$s_06=1632;label=5;break;case 5:$14=$s_06|0;$15=HEAP32[$14>>2]|0;$17=$15+8|0;if(($17&7|0)==0){$24=0;label=7;break}else{label=6;break};case 6:$24=-$17&7;label=7;break;case 7:$25=$15+$24|0;$26=HEAP32[$14>>2]|0;if($25>>>0<$26>>>0){$used_1_lcssa=$used_05;label=14;break}else{label=8;break};case 8:$used_13=$used_05;$q_0_in4=$25;$31=$26;label=9;break;case 9:if($q_0_in4>>>0>=($31+(HEAP32[$s_06+4>>2]|0)|0)>>>0|($q_0_in4|0)==(HEAP32[302]|0)){$used_1_lcssa=$used_13;label=14;break}else{label=10;break};case 10:$37=$q_0_in4+4|0;$38=HEAP32[$37>>2]|0;if(($38|0)==7){$used_1_lcssa=$used_13;label=14;break}else{label=11;break};case 11:if(($38&3|0)==1){label=12;break}else{$used_2=$used_13;label=13;break};case 12:$used_2=$used_13-($38&-8)|0;label=13;break;case 13:$49=$q_0_in4+(HEAP32[$37>>2]&-8)|0;$50=HEAP32[$14>>2]|0;if($49>>>0<$50>>>0){$used_1_lcssa=$used_2;label=14;break}else{$used_13=$used_2;$q_0_in4=$49;$31=$50;label=9;break};case 14:$53=HEAP32[$s_06+8>>2]|0;if(($53|0)==0){$used_3=$used_1_lcssa;$fp_0=$9;$maxfp_0=HEAP32[405]|0;label=15;break}else{$used_05=$used_1_lcssa;$s_06=$53;label=5;break};case 15:_fprintf(HEAP32[_stderr>>2]|0,464,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=$maxfp_0,tempInt)|0)|0;_fprintf(HEAP32[_stderr>>2]|0,1048,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=$fp_0,tempInt)|0)|0;_fprintf(HEAP32[_stderr>>2]|0,888,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=$used_3,tempInt)|0)|0;STACKTOP=__stackBase__;return}}function _mallopt($param_number,$value){$param_number=$param_number|0;$value=$value|0;return _change_mparam($param_number,$value)|0}function _change_mparam($param_number,$value){$param_number=$param_number|0;$value=$value|0;var $_0=0,label=0;label=1;while(1)switch(label|0){case 1:if((HEAP32[78]|0)==0){label=2;break}else{label=3;break};case 2:_init_mparams();label=3;break;case 3:if(($param_number|0)==(-1|0)){label=4;break}else if(($param_number|0)==(-2|0)){label=5;break}else if(($param_number|0)==(-3|0)){label=8;break}else{$_0=0;label=9;break};case 4:HEAP32[82]=$value;$_0=1;label=9;break;case 5:if((HEAP32[79]|0)>>>0>$value>>>0){$_0=0;label=9;break}else{label=6;break};case 6:if(($value-1&$value|0)==0){label=7;break}else{$_0=0;label=9;break};case 7:HEAP32[80]=$value;$_0=1;label=9;break;case 8:HEAP32[81]=$value;$_0=1;label=9;break;case 9:return $_0|0}return 0}function _init_mparams(){var $4=0,label=0;label=1;while(1)switch(label|0){case 1:if((HEAP32[78]|0)==0){label=2;break}else{label=5;break};case 2:$4=_sysconf(8)|0;if(($4-1&$4|0)==0){label=4;break}else{label=3;break};case 3:_abort();case 4:HEAP32[80]=$4;HEAP32[79]=$4;HEAP32[81]=-1;HEAP32[82]=2097152;HEAP32[83]=0;HEAP32[407]=0;HEAP32[78]=(_time(0)|0)&-16^1431655768;label=5;break;case 5:return}}function _internal_bulk_free($array,$nelem){$array=$array|0;$nelem=$nelem|0;var $1=0,$a_07=0,$3=0,$6=0,$9=0,$11=0,$15=0,$19=0,$_sum=0,$31=0,$36=0,$41=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$array+($nelem<<2)|0;if(($nelem|0)==0){label=11;break}else{$a_07=$array;label=2;break};case 2:$3=HEAP32[$a_07>>2]|0;if(($3|0)==0){label=10;break}else{label=3;break};case 3:$6=$3-8|0;$9=$3-4|0;$11=HEAP32[$9>>2]&-8;HEAP32[$a_07>>2]=0;if($6>>>0<(HEAP32[300]|0)>>>0){label=9;break}else{label=4;break};case 4:$15=HEAP32[$9>>2]|0;if(($15&3|0)==1){label=9;break}else{label=5;break};case 5:$19=$a_07+4|0;$_sum=$15-8&-8;if(($19|0)==($1|0)){label=8;break}else{label=6;break};case 6:if((HEAP32[$19>>2]|0)==($3+($_sum+8)|0)){label=7;break}else{label=8;break};case 7:$31=(HEAP32[$3+($_sum|4)>>2]&-8)+$11|0;HEAP32[$9>>2]=$15&1|$31|2;$36=$3+($31-4)|0;HEAP32[$36>>2]=HEAP32[$36>>2]|1;HEAP32[$19>>2]=$3;label=10;break;case 8:_dispose_chunk($6,$11);label=10;break;case 9:_abort();case 10:$41=$a_07+4|0;if(($41|0)==($1|0)){label=11;break}else{$a_07=$41;label=2;break};case 11:if((HEAP32[299]|0)>>>0>(HEAP32[303]|0)>>>0){label=12;break}else{label=13;break};case 12:_sys_trim(0)|0;label=13;break;case 13:return}}function _mmap_resize($oldp,$nb){$oldp=$oldp|0;$nb=$nb|0;var $3=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$3=HEAP32[$oldp+4>>2]&-8;if($nb>>>0<256){$_0=0;label=5;break}else{label=2;break};case 2:if($3>>>0<($nb+4|0)>>>0){label=4;break}else{label=3;break};case 3:if(($3-$nb|0)>>>0>HEAP32[80]<<1>>>0){label=4;break}else{$_0=$oldp;label=5;break};case 4:$_0=0;label=5;break;case 5:return $_0|0}return 0}function _segment_holding($addr){$addr=$addr|0;var $sp_0=0,$3=0,$12=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$sp_0=1632;label=2;break;case 2:$3=HEAP32[$sp_0>>2]|0;if($3>>>0>$addr>>>0){label=4;break}else{label=3;break};case 3:if(($3+(HEAP32[$sp_0+4>>2]|0)|0)>>>0>$addr>>>0){$_0=$sp_0;label=5;break}else{label=4;break};case 4:$12=HEAP32[$sp_0+8>>2]|0;if(($12|0)==0){$_0=0;label=5;break}else{$sp_0=$12;label=2;break};case 5:return $_0|0}return 0}function _dispose_chunk($p,$psize){$p=$p|0;$psize=$psize|0;var $1=0,$2=0,$3=0,$5=0,$10=0,$15=0,$16=0,$17=0,$18=0,$24=0,$29=0,$32=0,$35=0,$63=0,$66=0,$69=0,$74=0,$78=0,$82=0,$_sum28=0,$88=0,$89=0,$93=0,$94=0,$RP_0=0,$R_0=0,$96=0,$100=0,$CP_0=0,$R_1=0,$114=0,$116=0,$130=0,$_sum31=0,$147=0,$160=0,$173=0,$_0277=0,$_0=0,$186=0,$190=0,$191=0,$199=0,$210=0,$218=0,$219=0,$224=0,$227=0,$230=0,$258=0,$261=0,$264=0,$269=0,$273=0,$277=0,$283=0,$284=0,$288=0,$289=0,$RP9_0=0,$R7_0=0,$291=0,$295=0,$CP10_0=0,$R7_1=0,$309=0,$311=0,$325=0,$342=0,$355=0,$_1=0,$383=0,$386=0,$388=0,$389=0,$390=0,$397=0,$F16_0=0,$408=0,$409=0,$416=0,$417=0,$420=0,$422=0,$425=0,$430=0,$I19_0=0,$437=0,$441=0,$442=0,$457=0,$T_0=0,$K20_0=0,$466=0,$467=0,$480=0,$481=0,$483=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$p;$2=$1+$psize|0;$3=$2;$5=HEAP32[$p+4>>2]|0;if(($5&1|0)==0){label=2;break}else{$_0=$p;$_0277=$psize;label=54;break};case 2:$10=HEAP32[$p>>2]|0;if(($5&3|0)==0){label=134;break}else{label=3;break};case 3:$15=$1+(-$10|0)|0;$16=$15;$17=$10+$psize|0;$18=HEAP32[300]|0;if($15>>>0<$18>>>0){label=53;break}else{label=4;break};case 4:if(($16|0)==(HEAP32[301]|0)){label=51;break}else{label=5;break};case 5:$24=$10>>>3;if($10>>>0<256){label=6;break}else{label=17;break};case 6:$29=HEAP32[$1+(8-$10)>>2]|0;$32=HEAP32[$1+(12-$10)>>2]|0;$35=1224+($24<<1<<2)|0;if(($29|0)==($35|0)){label=9;break}else{label=7;break};case 7:if($29>>>0<$18>>>0){label=16;break}else{label=8;break};case 8:if((HEAP32[$29+12>>2]|0)==($16|0)){label=9;break}else{label=16;break};case 9:if(($32|0)==($29|0)){label=10;break}else{label=11;break};case 10:HEAP32[296]=HEAP32[296]&(1<<$24^-1);$_0=$16;$_0277=$17;label=54;break;case 11:if(($32|0)==($35|0)){label=14;break}else{label=12;break};case 12:if($32>>>0<(HEAP32[300]|0)>>>0){label=15;break}else{label=13;break};case 13:if((HEAP32[$32+8>>2]|0)==($16|0)){label=14;break}else{label=15;break};case 14:HEAP32[$29+12>>2]=$32;HEAP32[$32+8>>2]=$29;$_0=$16;$_0277=$17;label=54;break;case 15:_abort();case 16:_abort();case 17:$63=$15;$66=HEAP32[$1+(24-$10)>>2]|0;$69=HEAP32[$1+(12-$10)>>2]|0;if(($69|0)==($63|0)){label=23;break}else{label=18;break};case 18:$74=HEAP32[$1+(8-$10)>>2]|0;if($74>>>0<$18>>>0){label=22;break}else{label=19;break};case 19:$78=$74+12|0;if((HEAP32[$78>>2]|0)==($63|0)){label=20;break}else{label=22;break};case 20:$82=$69+8|0;if((HEAP32[$82>>2]|0)==($63|0)){label=21;break}else{label=22;break};case 21:HEAP32[$78>>2]=$69;HEAP32[$82>>2]=$74;$R_1=$69;label=31;break;case 22:_abort();case 23:$_sum28=16-$10|0;$88=$1+($_sum28+4)|0;$89=HEAP32[$88>>2]|0;if(($89|0)==0){label=24;break}else{$R_0=$89;$RP_0=$88;label=25;break};case 24:$93=$1+$_sum28|0;$94=HEAP32[$93>>2]|0;if(($94|0)==0){$R_1=0;label=31;break}else{$R_0=$94;$RP_0=$93;label=25;break};case 25:$96=$R_0+20|0;if((HEAP32[$96>>2]|0)==0){label=26;break}else{$CP_0=$96;label=27;break};case 26:$100=$R_0+16|0;if((HEAP32[$100>>2]|0)==0){label=28;break}else{$CP_0=$100;label=27;break};case 27:$R_0=HEAP32[$CP_0>>2]|0;$RP_0=$CP_0;label=25;break;case 28:if($RP_0>>>0<(HEAP32[300]|0)>>>0){label=30;break}else{label=29;break};case 29:HEAP32[$RP_0>>2]=0;$R_1=$R_0;label=31;break;case 30:_abort();case 31:if(($66|0)==0){$_0=$16;$_0277=$17;label=54;break}else{label=32;break};case 32:$114=$1+(28-$10)|0;$116=1488+(HEAP32[$114>>2]<<2)|0;if(($63|0)==(HEAP32[$116>>2]|0)){label=33;break}else{label=35;break};case 33:HEAP32[$116>>2]=$R_1;if(($R_1|0)==0){label=34;break}else{label=41;break};case 34:HEAP32[297]=HEAP32[297]&(1<<HEAP32[$114>>2]^-1);$_0=$16;$_0277=$17;label=54;break;case 35:if($66>>>0<(HEAP32[300]|0)>>>0){label=39;break}else{label=36;break};case 36:$130=$66+16|0;if((HEAP32[$130>>2]|0)==($63|0)){label=37;break}else{label=38;break};case 37:HEAP32[$130>>2]=$R_1;label=40;break;case 38:HEAP32[$66+20>>2]=$R_1;label=40;break;case 39:_abort();case 40:if(($R_1|0)==0){$_0=$16;$_0277=$17;label=54;break}else{label=41;break};case 41:if($R_1>>>0<(HEAP32[300]|0)>>>0){label=50;break}else{label=42;break};case 42:HEAP32[$R_1+24>>2]=$66;$_sum31=16-$10|0;$147=HEAP32[$1+$_sum31>>2]|0;if(($147|0)==0){label=46;break}else{label=43;break};case 43:if($147>>>0<(HEAP32[300]|0)>>>0){label=45;break}else{label=44;break};case 44:HEAP32[$R_1+16>>2]=$147;HEAP32[$147+24>>2]=$R_1;label=46;break;case 45:_abort();case 46:$160=HEAP32[$1+($_sum31+4)>>2]|0;if(($160|0)==0){$_0=$16;$_0277=$17;label=54;break}else{label=47;break};case 47:if($160>>>0<(HEAP32[300]|0)>>>0){label=49;break}else{label=48;break};case 48:HEAP32[$R_1+20>>2]=$160;HEAP32[$160+24>>2]=$R_1;$_0=$16;$_0277=$17;label=54;break;case 49:_abort();case 50:_abort();case 51:$173=$1+($psize+4)|0;if((HEAP32[$173>>2]&3|0)==3){label=52;break}else{$_0=$16;$_0277=$17;label=54;break};case 52:HEAP32[298]=$17;HEAP32[$173>>2]=HEAP32[$173>>2]&-2;HEAP32[$1+(4-$10)>>2]=$17|1;HEAP32[$2>>2]=$17;label=134;break;case 53:_abort();case 54:$186=HEAP32[300]|0;if($2>>>0<$186>>>0){label=133;break}else{label=55;break};case 55:$190=$1+($psize+4)|0;$191=HEAP32[$190>>2]|0;if(($191&2|0)==0){label=56;break}else{label=109;break};case 56:if(($3|0)==(HEAP32[302]|0)){label=57;break}else{label=59;break};case 57:$199=(HEAP32[299]|0)+$_0277|0;HEAP32[299]=$199;HEAP32[302]=$_0;HEAP32[$_0+4>>2]=$199|1;if(($_0|0)==(HEAP32[301]|0)){label=58;break}else{label=134;break};case 58:HEAP32[301]=0;HEAP32[298]=0;label=134;break;case 59:if(($3|0)==(HEAP32[301]|0)){label=60;break}else{label=61;break};case 60:$210=(HEAP32[298]|0)+$_0277|0;HEAP32[298]=$210;HEAP32[301]=$_0;HEAP32[$_0+4>>2]=$210|1;HEAP32[$_0+$210>>2]=$210;label=134;break;case 61:$218=($191&-8)+$_0277|0;$219=$191>>>3;if($191>>>0<256){label=62;break}else{label=73;break};case 62:$224=HEAP32[$1+($psize+8)>>2]|0;$227=HEAP32[$1+($psize+12)>>2]|0;$230=1224+($219<<1<<2)|0;if(($224|0)==($230|0)){label=65;break}else{label=63;break};case 63:if($224>>>0<$186>>>0){label=72;break}else{label=64;break};case 64:if((HEAP32[$224+12>>2]|0)==($3|0)){label=65;break}else{label=72;break};case 65:if(($227|0)==($224|0)){label=66;break}else{label=67;break};case 66:HEAP32[296]=HEAP32[296]&(1<<$219^-1);label=107;break;case 67:if(($227|0)==($230|0)){label=70;break}else{label=68;break};case 68:if($227>>>0<(HEAP32[300]|0)>>>0){label=71;break}else{label=69;break};case 69:if((HEAP32[$227+8>>2]|0)==($3|0)){label=70;break}else{label=71;break};case 70:HEAP32[$224+12>>2]=$227;HEAP32[$227+8>>2]=$224;label=107;break;case 71:_abort();case 72:_abort();case 73:$258=$2;$261=HEAP32[$1+($psize+24)>>2]|0;$264=HEAP32[$1+($psize+12)>>2]|0;if(($264|0)==($258|0)){label=79;break}else{label=74;break};case 74:$269=HEAP32[$1+($psize+8)>>2]|0;if($269>>>0<$186>>>0){label=78;break}else{label=75;break};case 75:$273=$269+12|0;if((HEAP32[$273>>2]|0)==($258|0)){label=76;break}else{label=78;break};case 76:$277=$264+8|0;if((HEAP32[$277>>2]|0)==($258|0)){label=77;break}else{label=78;break};case 77:HEAP32[$273>>2]=$264;HEAP32[$277>>2]=$269;$R7_1=$264;label=87;break;case 78:_abort();case 79:$283=$1+($psize+20)|0;$284=HEAP32[$283>>2]|0;if(($284|0)==0){label=80;break}else{$R7_0=$284;$RP9_0=$283;label=81;break};case 80:$288=$1+($psize+16)|0;$289=HEAP32[$288>>2]|0;if(($289|0)==0){$R7_1=0;label=87;break}else{$R7_0=$289;$RP9_0=$288;label=81;break};case 81:$291=$R7_0+20|0;if((HEAP32[$291>>2]|0)==0){label=82;break}else{$CP10_0=$291;label=83;break};case 82:$295=$R7_0+16|0;if((HEAP32[$295>>2]|0)==0){label=84;break}else{$CP10_0=$295;label=83;break};case 83:$R7_0=HEAP32[$CP10_0>>2]|0;$RP9_0=$CP10_0;label=81;break;case 84:if($RP9_0>>>0<(HEAP32[300]|0)>>>0){label=86;break}else{label=85;break};case 85:HEAP32[$RP9_0>>2]=0;$R7_1=$R7_0;label=87;break;case 86:_abort();case 87:if(($261|0)==0){label=107;break}else{label=88;break};case 88:$309=$1+($psize+28)|0;$311=1488+(HEAP32[$309>>2]<<2)|0;if(($258|0)==(HEAP32[$311>>2]|0)){label=89;break}else{label=91;break};case 89:HEAP32[$311>>2]=$R7_1;if(($R7_1|0)==0){label=90;break}else{label=97;break};case 90:HEAP32[297]=HEAP32[297]&(1<<HEAP32[$309>>2]^-1);label=107;break;case 91:if($261>>>0<(HEAP32[300]|0)>>>0){label=95;break}else{label=92;break};case 92:$325=$261+16|0;if((HEAP32[$325>>2]|0)==($258|0)){label=93;break}else{label=94;break};case 93:HEAP32[$325>>2]=$R7_1;label=96;break;case 94:HEAP32[$261+20>>2]=$R7_1;label=96;break;case 95:_abort();case 96:if(($R7_1|0)==0){label=107;break}else{label=97;break};case 97:if($R7_1>>>0<(HEAP32[300]|0)>>>0){label=106;break}else{label=98;break};case 98:HEAP32[$R7_1+24>>2]=$261;$342=HEAP32[$1+($psize+16)>>2]|0;if(($342|0)==0){label=102;break}else{label=99;break};case 99:if($342>>>0<(HEAP32[300]|0)>>>0){label=101;break}else{label=100;break};case 100:HEAP32[$R7_1+16>>2]=$342;HEAP32[$342+24>>2]=$R7_1;label=102;break;case 101:_abort();case 102:$355=HEAP32[$1+($psize+20)>>2]|0;if(($355|0)==0){label=107;break}else{label=103;break};case 103:if($355>>>0<(HEAP32[300]|0)>>>0){label=105;break}else{label=104;break};case 104:HEAP32[$R7_1+20>>2]=$355;HEAP32[$355+24>>2]=$R7_1;label=107;break;case 105:_abort();case 106:_abort();case 107:HEAP32[$_0+4>>2]=$218|1;HEAP32[$_0+$218>>2]=$218;if(($_0|0)==(HEAP32[301]|0)){label=108;break}else{$_1=$218;label=110;break};case 108:HEAP32[298]=$218;label=134;break;case 109:HEAP32[$190>>2]=$191&-2;HEAP32[$_0+4>>2]=$_0277|1;HEAP32[$_0+$_0277>>2]=$_0277;$_1=$_0277;label=110;break;case 110:$383=$_1>>>3;if($_1>>>0<256){label=111;break}else{label=116;break};case 111:$386=$383<<1;$388=1224+($386<<2)|0;$389=HEAP32[296]|0;$390=1<<$383;if(($389&$390|0)==0){label=112;break}else{label=113;break};case 112:HEAP32[296]=$389|$390;$F16_0=$388;label=115;break;case 113:$397=HEAP32[1224+($386+2<<2)>>2]|0;if($397>>>0<(HEAP32[300]|0)>>>0){label=114;break}else{$F16_0=$397;label=115;break};case 114:_abort();case 115:HEAP32[1224+($386+2<<2)>>2]=$_0;HEAP32[$F16_0+12>>2]=$_0;HEAP32[$_0+8>>2]=$F16_0;HEAP32[$_0+12>>2]=$388;label=134;break;case 116:$408=$_0;$409=$_1>>>8;if(($409|0)==0){$I19_0=0;label=119;break}else{label=117;break};case 117:if($_1>>>0>16777215){$I19_0=31;label=119;break}else{label=118;break};case 118:$416=($409+1048320|0)>>>16&8;$417=$409<<$416;$420=($417+520192|0)>>>16&4;$422=$417<<$420;$425=($422+245760|0)>>>16&2;$430=14-($420|$416|$425)+($422<<$425>>>15)|0;$I19_0=$_1>>>(($430+7|0)>>>0)&1|$430<<1;label=119;break;case 119:$437=1488+($I19_0<<2)|0;HEAP32[$_0+28>>2]=$I19_0;HEAP32[$_0+20>>2]=0;HEAP32[$_0+16>>2]=0;$441=HEAP32[297]|0;$442=1<<$I19_0;if(($441&$442|0)==0){label=120;break}else{label=121;break};case 120:HEAP32[297]=$441|$442;HEAP32[$437>>2]=$408;HEAP32[$_0+24>>2]=$437;HEAP32[$_0+12>>2]=$_0;HEAP32[$_0+8>>2]=$_0;label=134;break;case 121:if(($I19_0|0)==31){$457=0;label=123;break}else{label=122;break};case 122:$457=25-($I19_0>>>1)|0;label=123;break;case 123:$K20_0=$_1<<$457;$T_0=HEAP32[$437>>2]|0;label=124;break;case 124:if((HEAP32[$T_0+4>>2]&-8|0)==($_1|0)){label=129;break}else{label=125;break};case 125:$466=$T_0+16+($K20_0>>>31<<2)|0;$467=HEAP32[$466>>2]|0;if(($467|0)==0){label=126;break}else{$K20_0=$K20_0<<1;$T_0=$467;label=124;break};case 126:if($466>>>0<(HEAP32[300]|0)>>>0){label=128;break}else{label=127;break};case 127:HEAP32[$466>>2]=$408;HEAP32[$_0+24>>2]=$T_0;HEAP32[$_0+12>>2]=$_0;HEAP32[$_0+8>>2]=$_0;label=134;break;case 128:_abort();case 129:$480=$T_0+8|0;$481=HEAP32[$480>>2]|0;$483=HEAP32[300]|0;if($T_0>>>0<$483>>>0){label=132;break}else{label=130;break};case 130:if($481>>>0<$483>>>0){label=132;break}else{label=131;break};case 131:HEAP32[$481+12>>2]=$408;HEAP32[$480>>2]=$408;HEAP32[$_0+8>>2]=$481;HEAP32[$_0+12>>2]=$T_0;HEAP32[$_0+24>>2]=0;label=134;break;case 132:_abort();case 133:_abort();case 134:return}}function _init_top($p,$psize){$p=$p|0;$psize=$psize|0;var $1=0,$3=0,$10=0,$13=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$p;$3=$p+8|0;if(($3&7|0)==0){$10=0;label=3;break}else{label=2;break};case 2:$10=-$3&7;label=3;break;case 3:$13=$psize-$10|0;HEAP32[302]=$1+$10;HEAP32[299]=$13;HEAP32[$1+($10+4)>>2]=$13|1;HEAP32[$1+($psize+4)>>2]=40;HEAP32[303]=HEAP32[82];return}}function _init_bins(){var $i_02=0,$2=0,$4=0,$7=0,label=0;label=1;while(1)switch(label|0){case 1:$i_02=0;label=2;break;case 2:$2=$i_02<<1;$4=1224+($2<<2)|0;HEAP32[1224+($2+3<<2)>>2]=$4;HEAP32[1224+($2+2<<2)>>2]=$4;$7=$i_02+1|0;if($7>>>0<32){$i_02=$7;label=2;break}else{label=3;break};case 3:return}}function _mmap_alloc(){}function _prepend_alloc($newbase,$oldbase,$nb){$newbase=$newbase|0;$oldbase=$oldbase|0;$nb=$nb|0;var $2=0,$9=0,$12=0,$19=0,$20=0,$21=0,$_sum=0,$25=0,$26=0,$27=0,$35=0,$44=0,$53=0,$57=0,$58=0,$63=0,$66=0,$69=0,$98=0,$101=0,$104=0,$109=0,$114=0,$118=0,$_sum67=0,$124=0,$125=0,$129=0,$130=0,$RP_0=0,$R_0=0,$132=0,$136=0,$CP_0=0,$R_1=0,$150=0,$152=0,$166=0,$_sum3233=0,$183=0,$196=0,$qsize_0=0,$oldfirst_0=0,$212=0,$220=0,$223=0,$225=0,$226=0,$227=0,$234=0,$F4_0=0,$247=0,$248=0,$255=0,$256=0,$259=0,$261=0,$264=0,$269=0,$I7_0=0,$276=0,$283=0,$284=0,$303=0,$T_0=0,$K8_0=0,$312=0,$313=0,$329=0,$330=0,$332=0,label=0;label=1;while(1)switch(label|0){case 1:$2=$newbase+8|0;if(($2&7|0)==0){$9=0;label=3;break}else{label=2;break};case 2:$9=-$2&7;label=3;break;case 3:$12=$oldbase+8|0;if(($12&7|0)==0){$19=0;label=5;break}else{label=4;break};case 4:$19=-$12&7;label=5;break;case 5:$20=$oldbase+$19|0;$21=$20;$_sum=$9+$nb|0;$25=$newbase+$_sum|0;$26=$25;$27=$20-($newbase+$9)-$nb|0;HEAP32[$newbase+($9+4)>>2]=$nb|3;if(($21|0)==(HEAP32[302]|0)){label=6;break}else{label=7;break};case 6:$35=(HEAP32[299]|0)+$27|0;HEAP32[299]=$35;HEAP32[302]=$26;HEAP32[$newbase+($_sum+4)>>2]=$35|1;label=80;break;case 7:if(($21|0)==(HEAP32[301]|0)){label=8;break}else{label=9;break};case 8:$44=(HEAP32[298]|0)+$27|0;HEAP32[298]=$44;HEAP32[301]=$26;HEAP32[$newbase+($_sum+4)>>2]=$44|1;HEAP32[$newbase+($44+$_sum)>>2]=$44;label=80;break;case 9:$53=HEAP32[$oldbase+($19+4)>>2]|0;if(($53&3|0)==1){label=10;break}else{$oldfirst_0=$21;$qsize_0=$27;label=57;break};case 10:$57=$53&-8;$58=$53>>>3;if($53>>>0<256){label=11;break}else{label=22;break};case 11:$63=HEAP32[$oldbase+($19|8)>>2]|0;$66=HEAP32[$oldbase+($19+12)>>2]|0;$69=1224+($58<<1<<2)|0;if(($63|0)==($69|0)){label=14;break}else{label=12;break};case 12:if($63>>>0<(HEAP32[300]|0)>>>0){label=21;break}else{label=13;break};case 13:if((HEAP32[$63+12>>2]|0)==($21|0)){label=14;break}else{label=21;break};case 14:if(($66|0)==($63|0)){label=15;break}else{label=16;break};case 15:HEAP32[296]=HEAP32[296]&(1<<$58^-1);label=56;break;case 16:if(($66|0)==($69|0)){label=19;break}else{label=17;break};case 17:if($66>>>0<(HEAP32[300]|0)>>>0){label=20;break}else{label=18;break};case 18:if((HEAP32[$66+8>>2]|0)==($21|0)){label=19;break}else{label=20;break};case 19:HEAP32[$63+12>>2]=$66;HEAP32[$66+8>>2]=$63;label=56;break;case 20:_abort();return 0;return 0;case 21:_abort();return 0;return 0;case 22:$98=$20;$101=HEAP32[$oldbase+($19|24)>>2]|0;$104=HEAP32[$oldbase+($19+12)>>2]|0;if(($104|0)==($98|0)){label=28;break}else{label=23;break};case 23:$109=HEAP32[$oldbase+($19|8)>>2]|0;if($109>>>0<(HEAP32[300]|0)>>>0){label=27;break}else{label=24;break};case 24:$114=$109+12|0;if((HEAP32[$114>>2]|0)==($98|0)){label=25;break}else{label=27;break};case 25:$118=$104+8|0;if((HEAP32[$118>>2]|0)==($98|0)){label=26;break}else{label=27;break};case 26:HEAP32[$114>>2]=$104;HEAP32[$118>>2]=$109;$R_1=$104;label=36;break;case 27:_abort();return 0;return 0;case 28:$_sum67=$19|16;$124=$oldbase+($_sum67+4)|0;$125=HEAP32[$124>>2]|0;if(($125|0)==0){label=29;break}else{$R_0=$125;$RP_0=$124;label=30;break};case 29:$129=$oldbase+$_sum67|0;$130=HEAP32[$129>>2]|0;if(($130|0)==0){$R_1=0;label=36;break}else{$R_0=$130;$RP_0=$129;label=30;break};case 30:$132=$R_0+20|0;if((HEAP32[$132>>2]|0)==0){label=31;break}else{$CP_0=$132;label=32;break};case 31:$136=$R_0+16|0;if((HEAP32[$136>>2]|0)==0){label=33;break}else{$CP_0=$136;label=32;break};case 32:$R_0=HEAP32[$CP_0>>2]|0;$RP_0=$CP_0;label=30;break;case 33:if($RP_0>>>0<(HEAP32[300]|0)>>>0){label=35;break}else{label=34;break};case 34:HEAP32[$RP_0>>2]=0;$R_1=$R_0;label=36;break;case 35:_abort();return 0;return 0;case 36:if(($101|0)==0){label=56;break}else{label=37;break};case 37:$150=$oldbase+($19+28)|0;$152=1488+(HEAP32[$150>>2]<<2)|0;if(($98|0)==(HEAP32[$152>>2]|0)){label=38;break}else{label=40;break};case 38:HEAP32[$152>>2]=$R_1;if(($R_1|0)==0){label=39;break}else{label=46;break};case 39:HEAP32[297]=HEAP32[297]&(1<<HEAP32[$150>>2]^-1);label=56;break;case 40:if($101>>>0<(HEAP32[300]|0)>>>0){label=44;break}else{label=41;break};case 41:$166=$101+16|0;if((HEAP32[$166>>2]|0)==($98|0)){label=42;break}else{label=43;break};case 42:HEAP32[$166>>2]=$R_1;label=45;break;case 43:HEAP32[$101+20>>2]=$R_1;label=45;break;case 44:_abort();return 0;return 0;case 45:if(($R_1|0)==0){label=56;break}else{label=46;break};case 46:if($R_1>>>0<(HEAP32[300]|0)>>>0){label=55;break}else{label=47;break};case 47:HEAP32[$R_1+24>>2]=$101;$_sum3233=$19|16;$183=HEAP32[$oldbase+$_sum3233>>2]|0;if(($183|0)==0){label=51;break}else{label=48;break};case 48:if($183>>>0<(HEAP32[300]|0)>>>0){label=50;break}else{label=49;break};case 49:HEAP32[$R_1+16>>2]=$183;HEAP32[$183+24>>2]=$R_1;label=51;break;case 50:_abort();return 0;return 0;case 51:$196=HEAP32[$oldbase+($_sum3233+4)>>2]|0;if(($196|0)==0){label=56;break}else{label=52;break};case 52:if($196>>>0<(HEAP32[300]|0)>>>0){label=54;break}else{label=53;break};case 53:HEAP32[$R_1+20>>2]=$196;HEAP32[$196+24>>2]=$R_1;label=56;break;case 54:_abort();return 0;return 0;case 55:_abort();return 0;return 0;case 56:$oldfirst_0=$oldbase+($57|$19)|0;$qsize_0=$57+$27|0;label=57;break;case 57:$212=$oldfirst_0+4|0;HEAP32[$212>>2]=HEAP32[$212>>2]&-2;HEAP32[$newbase+($_sum+4)>>2]=$qsize_0|1;HEAP32[$newbase+($qsize_0+$_sum)>>2]=$qsize_0;$220=$qsize_0>>>3;if($qsize_0>>>0<256){label=58;break}else{label=63;break};case 58:$223=$220<<1;$225=1224+($223<<2)|0;$226=HEAP32[296]|0;$227=1<<$220;if(($226&$227|0)==0){label=59;break}else{label=60;break};case 59:HEAP32[296]=$226|$227;$F4_0=$225;label=62;break;case 60:$234=HEAP32[1224+($223+2<<2)>>2]|0;if($234>>>0<(HEAP32[300]|0)>>>0){label=61;break}else{$F4_0=$234;label=62;break};case 61:_abort();return 0;return 0;case 62:HEAP32[1224+($223+2<<2)>>2]=$26;HEAP32[$F4_0+12>>2]=$26;HEAP32[$newbase+($_sum+8)>>2]=$F4_0;HEAP32[$newbase+($_sum+12)>>2]=$225;label=80;break;case 63:$247=$25;$248=$qsize_0>>>8;if(($248|0)==0){$I7_0=0;label=66;break}else{label=64;break};case 64:if($qsize_0>>>0>16777215){$I7_0=31;label=66;break}else{label=65;break};case 65:$255=($248+1048320|0)>>>16&8;$256=$248<<$255;$259=($256+520192|0)>>>16&4;$261=$256<<$259;$264=($261+245760|0)>>>16&2;$269=14-($259|$255|$264)+($261<<$264>>>15)|0;$I7_0=$qsize_0>>>(($269+7|0)>>>0)&1|$269<<1;label=66;break;case 66:$276=1488+($I7_0<<2)|0;HEAP32[$newbase+($_sum+28)>>2]=$I7_0;HEAP32[$newbase+($_sum+20)>>2]=0;HEAP32[$newbase+($_sum+16)>>2]=0;$283=HEAP32[297]|0;$284=1<<$I7_0;if(($283&$284|0)==0){label=67;break}else{label=68;break};case 67:HEAP32[297]=$283|$284;HEAP32[$276>>2]=$247;HEAP32[$newbase+($_sum+24)>>2]=$276;HEAP32[$newbase+($_sum+12)>>2]=$247;HEAP32[$newbase+($_sum+8)>>2]=$247;label=80;break;case 68:if(($I7_0|0)==31){$303=0;label=70;break}else{label=69;break};case 69:$303=25-($I7_0>>>1)|0;label=70;break;case 70:$K8_0=$qsize_0<<$303;$T_0=HEAP32[$276>>2]|0;label=71;break;case 71:if((HEAP32[$T_0+4>>2]&-8|0)==($qsize_0|0)){label=76;break}else{label=72;break};case 72:$312=$T_0+16+($K8_0>>>31<<2)|0;$313=HEAP32[$312>>2]|0;if(($313|0)==0){label=73;break}else{$K8_0=$K8_0<<1;$T_0=$313;label=71;break};case 73:if($312>>>0<(HEAP32[300]|0)>>>0){label=75;break}else{label=74;break};case 74:HEAP32[$312>>2]=$247;HEAP32[$newbase+($_sum+24)>>2]=$T_0;HEAP32[$newbase+($_sum+12)>>2]=$247;HEAP32[$newbase+($_sum+8)>>2]=$247;label=80;break;case 75:_abort();return 0;return 0;case 76:$329=$T_0+8|0;$330=HEAP32[$329>>2]|0;$332=HEAP32[300]|0;if($T_0>>>0<$332>>>0){label=79;break}else{label=77;break};case 77:if($330>>>0<$332>>>0){label=79;break}else{label=78;break};case 78:HEAP32[$330+12>>2]=$247;HEAP32[$329>>2]=$247;HEAP32[$newbase+($_sum+8)>>2]=$330;HEAP32[$newbase+($_sum+12)>>2]=$T_0;HEAP32[$newbase+($_sum+24)>>2]=0;label=80;break;case 79:_abort();return 0;return 0;case 80:return $newbase+($9|8)|0}return 0}function _add_segment($tbase,$tsize){$tbase=$tbase|0;$tsize=$tsize|0;var $1=0,$2=0,$3=0,$5=0,$7=0,$8=0,$10=0,$17=0,$18=0,$22=0,$23=0,$30=0,$33=0,$34=0,$42=0,$45=0,$51=0,$54=0,$56=0,$57=0,$58=0,$65=0,$F_0=0,$76=0,$77=0,$84=0,$85=0,$88=0,$90=0,$93=0,$98=0,$I1_0=0,$105=0,$109=0,$110=0,$125=0,$T_0=0,$K2_0=0,$134=0,$135=0,$148=0,$149=0,$151=0,label=0;label=1;while(1)switch(label|0){case 1:$1=HEAP32[302]|0;$2=$1;$3=_segment_holding($2)|0;$5=HEAP32[$3>>2]|0;$7=HEAP32[$3+4>>2]|0;$8=$5+$7|0;$10=$5+($7-39)|0;if(($10&7|0)==0){$17=0;label=3;break}else{label=2;break};case 2:$17=-$10&7;label=3;break;case 3:$18=$5+($7-47+$17)|0;$22=$18>>>0<($1+16|0)>>>0?$2:$18;$23=$22+8|0;_init_top($tbase,$tsize-40|0);HEAP32[$22+4>>2]=27;HEAP32[$23>>2]=HEAP32[408];HEAP32[$23+4>>2]=HEAP32[1636>>2];HEAP32[$23+8>>2]=HEAP32[1640>>2];HEAP32[$23+12>>2]=HEAP32[1644>>2];HEAP32[408]=$tbase;HEAP32[409]=$tsize;HEAP32[411]=0;HEAP32[410]=$23;$30=$22+28|0;HEAP32[$30>>2]=7;if(($22+32|0)>>>0<$8>>>0){$33=$30;label=4;break}else{label=5;break};case 4:$34=$33+4|0;HEAP32[$34>>2]=7;if(($33+8|0)>>>0<$8>>>0){$33=$34;label=4;break}else{label=5;break};case 5:if(($22|0)==($2|0)){label=29;break}else{label=6;break};case 6:$42=$22-$1|0;$45=$2+($42+4)|0;HEAP32[$45>>2]=HEAP32[$45>>2]&-2;HEAP32[$1+4>>2]=$42|1;HEAP32[$2+$42>>2]=$42;$51=$42>>>3;if($42>>>0<256){label=7;break}else{label=12;break};case 7:$54=$51<<1;$56=1224+($54<<2)|0;$57=HEAP32[296]|0;$58=1<<$51;if(($57&$58|0)==0){label=8;break}else{label=9;break};case 8:HEAP32[296]=$57|$58;$F_0=$56;label=11;break;case 9:$65=HEAP32[1224+($54+2<<2)>>2]|0;if($65>>>0<(HEAP32[300]|0)>>>0){label=10;break}else{$F_0=$65;label=11;break};case 10:_abort();case 11:HEAP32[1224+($54+2<<2)>>2]=$1;HEAP32[$F_0+12>>2]=$1;HEAP32[$1+8>>2]=$F_0;HEAP32[$1+12>>2]=$56;label=29;break;case 12:$76=$1;$77=$42>>>8;if(($77|0)==0){$I1_0=0;label=15;break}else{label=13;break};case 13:if($42>>>0>16777215){$I1_0=31;label=15;break}else{label=14;break};case 14:$84=($77+1048320|0)>>>16&8;$85=$77<<$84;$88=($85+520192|0)>>>16&4;$90=$85<<$88;$93=($90+245760|0)>>>16&2;$98=14-($88|$84|$93)+($90<<$93>>>15)|0;$I1_0=$42>>>(($98+7|0)>>>0)&1|$98<<1;label=15;break;case 15:$105=1488+($I1_0<<2)|0;HEAP32[$1+28>>2]=$I1_0;HEAP32[$1+20>>2]=0;HEAP32[$1+16>>2]=0;$109=HEAP32[297]|0;$110=1<<$I1_0;if(($109&$110|0)==0){label=16;break}else{label=17;break};case 16:HEAP32[297]=$109|$110;HEAP32[$105>>2]=$76;HEAP32[$1+24>>2]=$105;HEAP32[$1+12>>2]=$1;HEAP32[$1+8>>2]=$1;label=29;break;case 17:if(($I1_0|0)==31){$125=0;label=19;break}else{label=18;break};case 18:$125=25-($I1_0>>>1)|0;label=19;break;case 19:$K2_0=$42<<$125;$T_0=HEAP32[$105>>2]|0;label=20;break;case 20:if((HEAP32[$T_0+4>>2]&-8|0)==($42|0)){label=25;break}else{label=21;break};case 21:$134=$T_0+16+($K2_0>>>31<<2)|0;$135=HEAP32[$134>>2]|0;if(($135|0)==0){label=22;break}else{$K2_0=$K2_0<<1;$T_0=$135;label=20;break};case 22:if($134>>>0<(HEAP32[300]|0)>>>0){label=24;break}else{label=23;break};case 23:HEAP32[$134>>2]=$76;HEAP32[$1+24>>2]=$T_0;HEAP32[$1+12>>2]=$1;HEAP32[$1+8>>2]=$1;label=29;break;case 24:_abort();case 25:$148=$T_0+8|0;$149=HEAP32[$148>>2]|0;$151=HEAP32[300]|0;if($T_0>>>0<$151>>>0){label=28;break}else{label=26;break};case 26:if($149>>>0<$151>>>0){label=28;break}else{label=27;break};case 27:HEAP32[$149+12>>2]=$76;HEAP32[$148>>2]=$76;HEAP32[$1+8>>2]=$149;HEAP32[$1+12>>2]=$T_0;HEAP32[$1+24>>2]=0;label=29;break;case 28:_abort();case 29:return}}function __ZNSt9bad_allocD2Ev($this){$this=$this|0;return}function __ZNSt9exceptionD2Ev($this){$this=$this|0;return}function __ZNKSt9bad_alloc4whatEv($this){$this=$this|0;return 784|0}function __ZNKSt20bad_array_new_length4whatEv($this){$this=$this|0;return 992|0}function __ZNSt9exceptionD1Ev($this){$this=$this|0;return}function __ZNKSt9exception4whatEv($this){$this=$this|0;return 768|0}function __ZSt15get_new_handlerv(){return(tempValue=HEAP32[466]|0,HEAP32[466]=tempValue+0,tempValue)|0}function __ZSt15set_new_handlerPFvvE($handler){$handler=$handler|0;return(tempValue=HEAP32[466]|0,HEAP32[466]=$handler,tempValue)|0}function __ZNSt9bad_allocC2Ev($this){$this=$this|0;HEAP32[$this>>2]=1696;return}function __ZdlPv($ptr){$ptr=$ptr|0;var label=0;label=1;while(1)switch(label|0){case 1:if(($ptr|0)==0){label=3;break}else{label=2;break};case 2:_free($ptr);label=3;break;case 3:return}}function __ZdlPvRKSt9nothrow_t($ptr,$0){$ptr=$ptr|0;$0=$0|0;__ZdlPv($ptr);return}function __ZdaPv($ptr){$ptr=$ptr|0;__ZdlPv($ptr);return}function __ZdaPvRKSt9nothrow_t($ptr,$0){$ptr=$ptr|0;$0=$0|0;__ZdaPv($ptr);return}function __ZNSt9bad_allocD0Ev($this){$this=$this|0;__ZdlPv($this);return}function __ZNSt20bad_array_new_lengthC2Ev($this){$this=$this|0;__ZNSt9bad_allocC2Ev($this|0);HEAP32[$this>>2]=1728;return}function __ZNSt20bad_array_new_lengthD0Ev($this){$this=$this|0;__ZdlPv($this);return}function __ZNSt9exceptionD0Ev($this){$this=$this|0;__ZdlPv($this);return}function _getopt($nargc,$nargv,$options){$nargc=$nargc|0;$nargv=$nargv|0;$options=$options|0;return _getopt_internal($nargc,$nargv,$options,0,0,0)|0}function _getopt_internal($nargc,$nargv,$options,$long_options,$idx,$flags){$nargc=$nargc|0;$nargv=$nargv|0;$options=$options|0;$long_options=$long_options|0;$idx=$idx|0;$flags=$flags|0;var $16=0,$_0=0,$26=0,$_060=0,$37=0,$40=0,$42=0,$56=0,$70=0,$78=0,$83=0,$103=0,$104=0,$117=0,$129=0,$131=0,$143=0,$144=0,$short_too_0=0,$151=0,$155=0,$156=0,$157=0,$158=0,$163=0,$197=0,$214=0,$227=0,$237=0,$_059=0,label=0,__stackBase__=0;__stackBase__=STACKTOP;label=1;while(1)switch(label|0){case 1:if(($options|0)==0){$_059=-1;label=83;break}else{label=2;break};case 2:if((HEAP32[58]|0)==0){label=3;break}else{label=4;break};case 3:HEAP32[54]=1;HEAP32[58]=1;label=4;break;case 4:if((HEAP32[98]|0)==-1|(HEAP32[54]|0)!=0){label=5;break}else{label=6;break};case 5:HEAP32[98]=(_getenv(592)|0)!=0&1;label=6;break;case 6:$16=HEAP8[$options]|0;if($16<<24>>24==45){label=7;break}else{label=8;break};case 7:$_0=$flags|2;label=9;break;case 8:$_0=(HEAP32[98]|0)!=0|$16<<24>>24==43?$flags&-2:$flags;label=9;break;case 9:$26=HEAP8[$options]|0;if(($26<<24>>24|0)==43|($26<<24>>24|0)==45){label=10;break}else{$_060=$options;label=11;break};case 10:$_060=$options+1|0;label=11;break;case 11:HEAP32[62]=0;if((HEAP32[54]|0)==0){label=14;break}else{label=12;break};case 12:HEAP32[66]=-1;HEAP32[64]=-1;label=13;break;case 13:if((HEAP32[54]|0)==0){label=14;break}else{label=15;break};case 14:if((HEAP8[HEAP32[46]|0]|0)==0){label=15;break}else{label=40;break};case 15:HEAP32[54]=0;$37=HEAP32[58]|0;if(($37|0)<($nargc|0)){label=21;break}else{label=16;break};case 16:HEAP32[46]=976;$40=HEAP32[66]|0;$42=HEAP32[64]|0;if(($40|0)==-1){label=18;break}else{label=17;break};case 17:_permute_args($42,$40,HEAP32[58]|0,$nargv);HEAP32[58]=(HEAP32[64]|0)-(HEAP32[66]|0)+(HEAP32[58]|0);label=20;break;case 18:if(($42|0)==-1){label=20;break}else{label=19;break};case 19:HEAP32[58]=$42;label=20;break;case 20:HEAP32[66]=-1;HEAP32[64]=-1;$_059=-1;label=83;break;case 21:$56=HEAP32[$nargv+($37<<2)>>2]|0;HEAP32[46]=$56;if((HEAP8[$56]|0)==45){label=22;break}else{label=24;break};case 22:if((HEAP8[$56+1|0]|0)==0){label=23;break}else{label=32;break};case 23:if((_strchr($_060|0,45)|0)==0){label=24;break}else{label=32;break};case 24:HEAP32[46]=976;if(($_0&2|0)==0){label=26;break}else{label=25;break};case 25:$70=HEAP32[58]|0;HEAP32[58]=$70+1;HEAP32[62]=HEAP32[$nargv+($70<<2)>>2];$_059=1;label=83;break;case 26:if(($_0&1|0)==0){$_059=-1;label=83;break}else{label=27;break};case 27:$78=HEAP32[64]|0;if(($78|0)==-1){label=28;break}else{label=29;break};case 28:HEAP32[64]=HEAP32[58];label=31;break;case 29:$83=HEAP32[66]|0;if(($83|0)==-1){label=31;break}else{label=30;break};case 30:_permute_args($78,$83,HEAP32[58]|0,$nargv);HEAP32[64]=(HEAP32[58]|0)-(HEAP32[66]|0)+(HEAP32[64]|0);HEAP32[66]=-1;label=31;break;case 31:HEAP32[58]=(HEAP32[58]|0)+1;label=13;break;case 32:if((HEAP32[64]|0)!=-1&(HEAP32[66]|0)==-1){label=33;break}else{label=34;break};case 33:HEAP32[66]=HEAP32[58];label=34;break;case 34:$103=HEAP32[46]|0;$104=$103+1|0;if((HEAP8[$104]|0)==0){label=40;break}else{label=35;break};case 35:HEAP32[46]=$104;if((HEAP8[$104]|0)==45){label=36;break}else{label=40;break};case 36:if((HEAP8[$103+2|0]|0)==0){label=37;break}else{label=40;break};case 37:HEAP32[58]=(HEAP32[58]|0)+1;HEAP32[46]=976;$117=HEAP32[66]|0;if(($117|0)==-1){label=39;break}else{label=38;break};case 38:_permute_args(HEAP32[64]|0,$117,HEAP32[58]|0,$nargv);HEAP32[58]=(HEAP32[64]|0)-(HEAP32[66]|0)+(HEAP32[58]|0);label=39;break;case 39:HEAP32[66]=-1;HEAP32[64]=-1;$_059=-1;label=83;break;case 40:$129=($long_options|0)!=0;if($129){label=41;break}else{label=49;break};case 41:$131=HEAP32[46]|0;if(($131|0)==(HEAP32[$nargv+(HEAP32[58]<<2)>>2]|0)){label=49;break}else{label=42;break};case 42:if((HEAP8[$131]|0)==45){label=44;break}else{label=43;break};case 43:if(($_0&4|0)==0){label=49;break}else{label=44;break};case 44:$143=HEAP32[46]|0;$144=HEAP8[$143]|0;if(($144<<24>>24|0)==45){label=45;break}else if(($144<<24>>24|0)==58){$short_too_0=0;label=47;break}else{label=46;break};case 45:HEAP32[46]=$143+1;$short_too_0=0;label=47;break;case 46:$short_too_0=(_strchr($_060|0,$144<<24>>24|0)|0)!=0&1;label=47;break;case 47:$151=_parse_long_options($nargv,$_060,$long_options,$idx,$short_too_0)|0;if(($151|0)==-1){label=49;break}else{label=48;break};case 48:HEAP32[46]=976;$_059=$151;label=83;break;case 49:$155=HEAP32[46]|0;$156=$155+1|0;HEAP32[46]=$156;$157=HEAP8[$155]|0;$158=$157<<24>>24;if(($157<<24>>24|0)==45){label=50;break}else if(($157<<24>>24|0)==58){label=54;break}else{label=51;break};case 50:if((HEAP8[$156]|0)==0){label=51;break}else{label=53;break};case 51:$163=_strchr($_060|0,$158|0)|0;if(($163|0)==0){label=52;break}else{label=60;break};case 52:if($157<<24>>24==45){label=53;break}else{label=54;break};case 53:if((HEAP8[HEAP32[46]|0]|0)==0){$_059=-1;label=83;break}else{label=54;break};case 54:if((HEAP8[HEAP32[46]|0]|0)==0){label=55;break}else{label=56;break};case 55:HEAP32[58]=(HEAP32[58]|0)+1;label=56;break;case 56:if((HEAP32[60]|0)==0){label=59;break}else{label=57;break};case 57:if((HEAP8[$_060]|0)==58){label=59;break}else{label=58;break};case 58:__warnx(368,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=$158,tempInt)|0);label=59;break;case 59:HEAP32[56]=$158;$_059=63;label=83;break;case 60:if($129&$157<<24>>24==87){label=61;break}else{label=70;break};case 61:if((HEAP8[$163+1|0]|0)==59){label=62;break}else{label=70;break};case 62:if((HEAP8[HEAP32[46]|0]|0)==0){label=63;break}else{label=69;break};case 63:$197=(HEAP32[58]|0)+1|0;HEAP32[58]=$197;if(($197|0)<($nargc|0)){label=68;break}else{label=64;break};case 64:HEAP32[46]=976;if((HEAP32[60]|0)==0){label=67;break}else{label=65;break};case 65:if((HEAP8[$_060]|0)==58){label=67;break}else{label=66;break};case 66:__warnx(72,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=$158,tempInt)|0);label=67;break;case 67:HEAP32[56]=$158;$_059=(HEAP8[$_060]|0)==58?58:63;label=83;break;case 68:HEAP32[46]=HEAP32[$nargv+($197<<2)>>2];label=69;break;case 69:$214=_parse_long_options($nargv,$_060,$long_options,$idx,0)|0;HEAP32[46]=976;$_059=$214;label=83;break;case 70:if((HEAP8[$163+1|0]|0)==58){label=73;break}else{label=71;break};case 71:if((HEAP8[HEAP32[46]|0]|0)==0){label=72;break}else{$_059=$158;label=83;break};case 72:HEAP32[58]=(HEAP32[58]|0)+1;$_059=$158;label=83;break;case 73:HEAP32[62]=0;$227=HEAP32[46]|0;if((HEAP8[$227]|0)==0){label=75;break}else{label=74;break};case 74:HEAP32[62]=$227;label=82;break;case 75:if((HEAP8[$163+2|0]|0)==58){label=82;break}else{label=76;break};case 76:$237=(HEAP32[58]|0)+1|0;HEAP32[58]=$237;if(($237|0)<($nargc|0)){label=81;break}else{label=77;break};case 77:HEAP32[46]=976;if((HEAP32[60]|0)==0){label=80;break}else{label=78;break};case 78:if((HEAP8[$_060]|0)==58){label=80;break}else{label=79;break};case 79:__warnx(72,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=$158,tempInt)|0);label=80;break;case 80:HEAP32[56]=$158;$_059=(HEAP8[$_060]|0)==58?58:63;label=83;break;case 81:HEAP32[62]=HEAP32[$nargv+($237<<2)>>2];label=82;break;case 82:HEAP32[46]=976;HEAP32[58]=(HEAP32[58]|0)+1;$_059=$158;label=83;break;case 83:STACKTOP=__stackBase__;return $_059|0}return 0}function _getopt_long($nargc,$nargv,$options,$long_options,$idx){$nargc=$nargc|0;$nargv=$nargv|0;$options=$options|0;$long_options=$long_options|0;$idx=$idx|0;return _getopt_internal($nargc,$nargv,$options,$long_options,$idx,1)|0}function _getopt_long_only($nargc,$nargv,$options,$long_options,$idx){$nargc=$nargc|0;$nargv=$nargv|0;$options=$options|0;$long_options=$long_options|0;$idx=$idx|0;return _getopt_internal($nargc,$nargv,$options,$long_options,$idx,5)|0}function _permute_args($panonopt_start,$panonopt_end,$opt_end,$nargv){$panonopt_start=$panonopt_start|0;$panonopt_end=$panonopt_end|0;$opt_end=$opt_end|0;$nargv=$nargv|0;var $1=0,$2=0,$3=0,$5=0,$i_026=0,$10=0,$11=0,$pos_025=0,$j_024=0,$pos_1=0,$14=0,$15=0,$17=0,$19=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$panonopt_end-$panonopt_start|0;$2=$opt_end-$panonopt_end|0;$3=_gcd($1,$2)|0;$5=($opt_end-$panonopt_start|0)/($3|0)&-1;if(($3|0)>0){label=2;break}else{label=7;break};case 2:$i_026=0;label=3;break;case 3:$10=$i_026+$panonopt_end|0;if(($5|0)>0){label=4;break}else{label=6;break};case 4:$11=$nargv+($10<<2)|0;$j_024=0;$pos_025=$10;label=5;break;case 5:$pos_1=(($pos_025|0)<($panonopt_end|0)?$2:-$1|0)+$pos_025|0;$14=$nargv+($pos_1<<2)|0;$15=HEAP32[$14>>2]|0;HEAP32[$14>>2]=HEAP32[$11>>2];HEAP32[$11>>2]=$15;$17=$j_024+1|0;if(($17|0)<($5|0)){$j_024=$17;$pos_025=$pos_1;label=5;break}else{label=6;break};case 6:$19=$i_026+1|0;if(($19|0)<($3|0)){$i_026=$19;label=3;break}else{label=7;break};case 7:return}}function __Znwj($size){$size=$size|0;var $3=0,$6=0,$lpad_phi$0=0,$lpad_phi$1=0,$15=0,label=0;label=1;while(1)switch(label|0){case 1:label=2;break;case 2:$3=_malloc(($size|0)==0?1:$size)|0;if(($3|0)==0){label=3;break}else{label=10;break};case 3:$6=__ZSt15get_new_handlerv()|0;if(($6|0)==0){label=9;break}else{label=4;break};case 4:FUNCTION_TABLE_v[$6&63]();label=2;break;case 5:$lpad_phi$1=0;$lpad_phi$0=0;label=7;break;case 6:$lpad_phi$1=0;$lpad_phi$0=0;label=7;break;case 7:if(($lpad_phi$1|0)<0){label=8;break}else{label=11;break};case 8:___cxa_call_unexpected($lpad_phi$0|0);return 0;case 9:$15=___cxa_allocate_exception(4)|0;__ZNSt9bad_allocC2Ev($15);___cxa_throw($15|0,1824,16);label=12;break;case 10:return $3|0;case 11:abort();case 12:return 0}return 0}function __ZnwjRKSt9nothrow_t($size,$0){$size=$size|0;$0=$0|0;var $p_0=0,label=0;label=1;while(1)switch(label|0){case 1:$p_0=__Znwj($size)|0;label=3;break;case 2:___cxa_begin_catch(0)|0;___cxa_end_catch();$p_0=0;label=3;break;case 3:return $p_0|0;case 4:___cxa_call_unexpected(0);return 0}return 0}function __Znaj($size){$size=$size|0;var label=0;label=1;while(1)switch(label|0){case 1:label=2;break;case 2:return __Znwj($size)|0;case 3:if(0<0){label=4;break}else{label=5;break};case 4:___cxa_call_unexpected(0);return 0;case 5:abort()}return 0}function __ZnajRKSt9nothrow_t($size,$0){$size=$size|0;$0=$0|0;var $p_0=0,label=0;label=1;while(1)switch(label|0){case 1:$p_0=__Znaj($size)|0;label=3;break;case 2:___cxa_begin_catch(0)|0;___cxa_end_catch();$p_0=0;label=3;break;case 3:return $p_0|0;case 4:___cxa_call_unexpected(0);return 0}return 0}function __ZSt17__throw_bad_allocv(){var $1=0;$1=___cxa_allocate_exception(4)|0;__ZNSt9bad_allocC2Ev($1);___cxa_throw($1|0,1824,16)}function _gcd($a,$b){$a=$a|0;$b=$b|0;var $1=0,$c_07=0,$_06=0,$3=0,$_0_lcssa=0,label=0;label=1;while(1)switch(label|0){case 1:$1=($a|0)%($b|0)&-1;if(($1|0)==0){$_0_lcssa=$b;label=3;break}else{$_06=$b;$c_07=$1;label=2;break};case 2:$3=($_06|0)%($c_07|0)&-1;if(($3|0)==0){$_0_lcssa=$c_07;label=3;break}else{$_06=$c_07;$c_07=$3;label=2;break};case 3:return $_0_lcssa|0}return 0}function _parse_long_options($nargv,$options,$long_options,$idx,$short_too){$nargv=$nargv|0;$options=$options|0;$long_options=$long_options|0;$idx=$idx|0;$short_too=$short_too|0;var $1=0,$4=0,$has_equal_0=0,$current_argv_len_0=0,$15=0,$20=0,$match_066=0,$i_065=0,$match_1=0,$38=0,$40=0,$match_2=0,$44=0,$45=0,$47=0,$storemerge62=0,$72=0,$storemerge=0,$118=0,$121=0,$_0=0,label=0,__stackBase__=0;__stackBase__=STACKTOP;label=1;while(1)switch(label|0){case 1:$1=HEAP32[46]|0;HEAP32[58]=(HEAP32[58]|0)+1;$4=_strchr($1|0,61)|0;if(($4|0)==0){label=3;break}else{label=2;break};case 2:$current_argv_len_0=$4-$1|0;$has_equal_0=$4+1|0;label=4;break;case 3:$current_argv_len_0=_strlen($1|0)|0;$has_equal_0=0;label=4;break;case 4:$15=HEAP32[$long_options>>2]|0;if(($15|0)==0){label=35;break}else{label=5;break};case 5:$i_065=0;$match_066=-1;$20=$15;label=6;break;case 6:if((_strncmp($1|0,$20|0,$current_argv_len_0|0)|0)==0){label=7;break}else{$match_1=$match_066;label=14;break};case 7:if((_strlen($20|0)|0)==($current_argv_len_0|0)){$match_2=$i_065;label=15;break}else{label=8;break};case 8:if(($short_too|0)!=0&($current_argv_len_0|0)==1){$match_1=$match_066;label=14;break}else{label=9;break};case 9:if(($match_066|0)==-1){$match_1=$i_065;label=14;break}else{label=10;break};case 10:if((HEAP32[60]|0)==0){label=13;break}else{label=11;break};case 11:if((HEAP8[$options]|0)==58){label=13;break}else{label=12;break};case 12:__warnx(432,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=$current_argv_len_0,HEAP32[tempInt+8>>2]=$1,tempInt)|0);label=13;break;case 13:HEAP32[56]=0;$_0=63;label=45;break;case 14:$38=$i_065+1|0;$40=HEAP32[$long_options+($38<<4)>>2]|0;if(($40|0)==0){$match_2=$match_1;label=15;break}else{$i_065=$38;$match_066=$match_1;$20=$40;label=6;break};case 15:if(($match_2|0)==-1){label=35;break}else{label=16;break};case 16:$44=$long_options+($match_2<<4)+4|0;$45=HEAP32[$44>>2]|0;$47=($has_equal_0|0)==0;if(($45|0)!=0|$47){label=23;break}else{label=17;break};case 17:if((HEAP32[60]|0)==0){label=20;break}else{label=18;break};case 18:if((HEAP8[$options]|0)==58){label=20;break}else{label=19;break};case 19:__warnx(272,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=$current_argv_len_0,HEAP32[tempInt+8>>2]=$1,tempInt)|0);label=20;break;case 20:if((HEAP32[$long_options+($match_2<<4)+8>>2]|0)==0){label=21;break}else{$storemerge62=0;label=22;break};case 21:$storemerge62=HEAP32[$long_options+($match_2<<4)+12>>2]|0;label=22;break;case 22:HEAP32[56]=$storemerge62;$_0=(HEAP8[$options]|0)==58?58:63;label=45;break;case 23:if(($45-1|0)>>>0<2){label=24;break}else{label=28;break};case 24:if($47){label=26;break}else{label=25;break};case 25:HEAP32[62]=$has_equal_0;label=28;break;case 26:if(($45|0)==1){label=27;break}else{label=28;break};case 27:$72=HEAP32[58]|0;HEAP32[58]=$72+1;HEAP32[62]=HEAP32[$nargv+($72<<2)>>2];label=28;break;case 28:if((HEAP32[$44>>2]|0)==1&(HEAP32[62]|0)==0){label=29;break}else{label=41;break};case 29:if((HEAP32[60]|0)==0){label=32;break}else{label=30;break};case 30:if((HEAP8[$options]|0)==58){label=32;break}else{label=31;break};case 31:__warnx(32,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=$1,tempInt)|0);label=32;break;case 32:if((HEAP32[$long_options+($match_2<<4)+8>>2]|0)==0){label=33;break}else{$storemerge=0;label=34;break};case 33:$storemerge=HEAP32[$long_options+($match_2<<4)+12>>2]|0;label=34;break;case 34:HEAP32[56]=$storemerge;HEAP32[58]=(HEAP32[58]|0)-1;$_0=(HEAP8[$options]|0)==58?58:63;label=45;break;case 35:if(($short_too|0)==0){label=37;break}else{label=36;break};case 36:HEAP32[58]=(HEAP32[58]|0)-1;$_0=-1;label=45;break;case 37:if((HEAP32[60]|0)==0){label=40;break}else{label=38;break};case 38:if((HEAP8[$options]|0)==58){label=40;break}else{label=39;break};case 39:__warnx(344,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=$1,tempInt)|0);label=40;break;case 40:HEAP32[56]=0;$_0=63;label=45;break;case 41:if(($idx|0)==0){label=43;break}else{label=42;break};case 42:HEAP32[$idx>>2]=$match_2;label=43;break;case 43:$118=HEAP32[$long_options+($match_2<<4)+8>>2]|0;$121=HEAP32[$long_options+($match_2<<4)+12>>2]|0;if(($118|0)==0){$_0=$121;label=45;break}else{label=44;break};case 44:HEAP32[$118>>2]=$121;$_0=0;label=45;break;case 45:STACKTOP=__stackBase__;return $_0|0}return 0}function __warn($fmt,varrp){$fmt=$fmt|0;varrp=varrp|0;var $ap=0,$2=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+16|0;$ap=__stackBase__|0;$2=$ap;HEAP32[$2>>2]=varrp;HEAP32[$2+4>>2]=0;__vwarn($fmt,$ap|0);STACKTOP=__stackBase__;return}function __warnx($fmt,varrp){$fmt=$fmt|0;varrp=varrp|0;var $ap=0,$2=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+16|0;$ap=__stackBase__|0;$2=$ap;HEAP32[$2>>2]=varrp;HEAP32[$2+4>>2]=0;__vwarnx($fmt,$ap|0);STACKTOP=__stackBase__;return}function __vwarn($fmt,$ap){$fmt=$fmt|0;$ap=$ap|0;var $2=0,$4=0,$13=0,$14=0,label=0,__stackBase__=0;__stackBase__=STACKTOP;label=1;while(1)switch(label|0){case 1:$2=HEAP32[(___errno_location()|0)>>2]|0;$4=HEAP32[___progname>>2]|0;_fprintf(HEAP32[_stderr>>2]|0,968,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=$4,tempInt)|0)|0;if(($fmt|0)==0){label=3;break}else{label=2;break};case 2:_vfprintf(HEAP32[_stderr>>2]|0,$fmt|0,$ap|0)|0;_fwrite(1024,2,1,HEAP32[_stderr>>2]|0)|0;label=3;break;case 3:$13=HEAP32[_stderr>>2]|0;$14=_strerror($2|0)|0;_fprintf($13|0,872,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=$14,tempInt)|0)|0;STACKTOP=__stackBase__;return}}function __vwarnx($fmt,$ap){$fmt=$fmt|0;$ap=$ap|0;var $2=0,label=0,__stackBase__=0;__stackBase__=STACKTOP;label=1;while(1)switch(label|0){case 1:$2=HEAP32[___progname>>2]|0;_fprintf(HEAP32[_stderr>>2]|0,864,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=$2,tempInt)|0)|0;if(($fmt|0)==0){label=3;break}else{label=2;break};case 2:_vfprintf(HEAP32[_stderr>>2]|0,$fmt|0,$ap|0)|0;label=3;break;case 3:_fputc(10,HEAP32[_stderr>>2]|0)|0;STACKTOP=__stackBase__;return}}function _strtod($string,$endPtr){$string=$string|0;$endPtr=$endPtr|0;var $p_0=0,$8=0,$sign_0=0,$p_2=0,$p_3=0,$mantSize_0=0,$decPt_0=0,$15=0,$decPt_1=0,$25=0,$26=0,$mantSize_1=0,$28=0,$fracExp_0=0,$mantSize_2=0,$p_4_lcssa99=0,$mantSize_3_lcssa98=0,$frac1_0_lcssa97=0.0,$frac1_085=0,$mantSize_384=0,$p_483=0,$33=0,$34=0,$p_5=0,$c_0_in=0,$42=0,$43=0,$frac2_078=0,$mantSize_477=0,$p_676=0,$46=0,$47=0,$p_7=0,$c_1_in=0,$55=0,$56=0,$frac1_0_lcssa96=0.0,$frac2_0_lcssa=0.0,$59=0.0,$60=0,$62=0,$63=0,$expSign_0_ph=0,$p_9_ph=0,$exp_071=0,$p_970=0,$74=0,$75=0,$expSign_1=0,$p_10=0,$exp_1=0,$exp_2=0,$exp_3=0,$exp_566=0,$d_065=0,$dblExp_064=0.0,$dblExp_1=0.0,$91=0,$dblExp_0_lcssa=0.0,$fraction_0=0.0,$p_11=0,$_0=0.0,label=0;label=1;while(1)switch(label|0){case 1:$p_0=$string;label=2;break;case 2:if((_isspace(HEAP8[$p_0]|0)|0)==0){label=3;break}else{$p_0=$p_0+1|0;label=2;break};case 3:$8=HEAP8[$p_0]|0;if(($8<<24>>24|0)==45){label=4;break}else if(($8<<24>>24|0)==43){label=5;break}else{$p_2=$p_0;$sign_0=0;label=6;break};case 4:$p_2=$p_0+1|0;$sign_0=1;label=6;break;case 5:$p_2=$p_0+1|0;$sign_0=0;label=6;break;case 6:$decPt_0=-1;$mantSize_0=0;$p_3=$p_2;label=7;break;case 7:$15=HEAP8[$p_3]|0;if((($15<<24>>24)-48|0)>>>0<10){$decPt_1=$decPt_0;label=9;break}else{label=8;break};case 8:if($15<<24>>24!=46|($decPt_0|0)>-1){label=10;break}else{$decPt_1=$mantSize_0;label=9;break};case 9:$decPt_0=$decPt_1;$mantSize_0=$mantSize_0+1|0;$p_3=$p_3+1|0;label=7;break;case 10:$25=$p_3+(-$mantSize_0|0)|0;$26=($decPt_0|0)<0;$mantSize_1=(($26^1)<<31>>31)+$mantSize_0|0;$28=($mantSize_1|0)>18;$fracExp_0=($28?-18:-$mantSize_1|0)+($26?$mantSize_0:$decPt_0)|0;$mantSize_2=$28?18:$mantSize_1;if(($mantSize_2|0)==0){$p_11=$string;$fraction_0=0.0;label=37;break}else{label=11;break};case 11:if(($mantSize_2|0)>9){$p_483=$25;$mantSize_384=$mantSize_2;$frac1_085=0;label=15;break}else{label=13;break};case 12:$frac1_0_lcssa97=+($42|0)*1.0e9;$mantSize_3_lcssa98=9;$p_4_lcssa99=$p_5;label=14;break;case 13:if(($mantSize_2|0)>0){$frac1_0_lcssa97=0.0;$mantSize_3_lcssa98=$mantSize_2;$p_4_lcssa99=$25;label=14;break}else{$frac2_0_lcssa=0.0;$frac1_0_lcssa96=0.0;label=22;break};case 14:$p_676=$p_4_lcssa99;$mantSize_477=$mantSize_3_lcssa98;$frac2_078=0;label=18;break;case 15:$33=HEAP8[$p_483]|0;$34=$p_483+1|0;if($33<<24>>24==46){label=16;break}else{$c_0_in=$33;$p_5=$34;label=17;break};case 16:$c_0_in=HEAP8[$34]|0;$p_5=$p_483+2|0;label=17;break;case 17:$42=($frac1_085*10&-1)-48+($c_0_in<<24>>24)|0;$43=$mantSize_384-1|0;if(($43|0)>9){$p_483=$p_5;$mantSize_384=$43;$frac1_085=$42;label=15;break}else{label=12;break};case 18:$46=HEAP8[$p_676]|0;$47=$p_676+1|0;if($46<<24>>24==46){label=19;break}else{$c_1_in=$46;$p_7=$47;label=20;break};case 19:$c_1_in=HEAP8[$47]|0;$p_7=$p_676+2|0;label=20;break;case 20:$55=($frac2_078*10&-1)-48+($c_1_in<<24>>24)|0;$56=$mantSize_477-1|0;if(($56|0)>0){$p_676=$p_7;$mantSize_477=$56;$frac2_078=$55;label=18;break}else{label=21;break};case 21:$frac2_0_lcssa=+($55|0);$frac1_0_lcssa96=$frac1_0_lcssa97;label=22;break;case 22:$59=$frac1_0_lcssa96+$frac2_0_lcssa;$60=HEAP8[$p_3]|0;if(($60<<24>>24|0)==69|($60<<24>>24|0)==101){label=23;break}else{$exp_1=0;$p_10=$p_3;$expSign_1=0;label=28;break};case 23:$62=$p_3+1|0;$63=HEAP8[$62]|0;if(($63<<24>>24|0)==45){label=24;break}else if(($63<<24>>24|0)==43){label=25;break}else{$p_9_ph=$62;$expSign_0_ph=0;label=26;break};case 24:$p_9_ph=$p_3+2|0;$expSign_0_ph=1;label=26;break;case 25:$p_9_ph=$p_3+2|0;$expSign_0_ph=0;label=26;break;case 26:if(((HEAP8[$p_9_ph]|0)-48|0)>>>0<10){$p_970=$p_9_ph;$exp_071=0;label=27;break}else{$exp_1=0;$p_10=$p_9_ph;$expSign_1=$expSign_0_ph;label=28;break};case 27:$74=($exp_071*10&-1)-48+(HEAP8[$p_970]|0)|0;$75=$p_970+1|0;if(((HEAP8[$75]|0)-48|0)>>>0<10){$p_970=$75;$exp_071=$74;label=27;break}else{$exp_1=$74;$p_10=$75;$expSign_1=$expSign_0_ph;label=28;break};case 28:$exp_2=$fracExp_0+(($expSign_1|0)==0?$exp_1:-$exp_1|0)|0;$exp_3=($exp_2|0)<0?-$exp_2|0:$exp_2;if(($exp_3|0)>511){label=29;break}else{label=30;break};case 29:HEAP32[(___errno_location()|0)>>2]=34;$dblExp_064=1.0;$d_065=112;$exp_566=511;label=31;break;case 30:if(($exp_3|0)==0){$dblExp_0_lcssa=1.0;label=34;break}else{$dblExp_064=1.0;$d_065=112;$exp_566=$exp_3;label=31;break};case 31:if(($exp_566&1|0)==0){$dblExp_1=$dblExp_064;label=33;break}else{label=32;break};case 32:$dblExp_1=$dblExp_064*+HEAPF64[$d_065>>3];label=33;break;case 33:$91=$exp_566>>1;if(($91|0)==0){$dblExp_0_lcssa=$dblExp_1;label=34;break}else{$dblExp_064=$dblExp_1;$d_065=$d_065+8|0;$exp_566=$91;label=31;break};case 34:if(($exp_2|0)>-1){label=36;break}else{label=35;break};case 35:$p_11=$p_10;$fraction_0=$59/$dblExp_0_lcssa;label=37;break;case 36:$p_11=$p_10;$fraction_0=$59*$dblExp_0_lcssa;label=37;break;case 37:if(($endPtr|0)==0){label=39;break}else{label=38;break};case 38:HEAP32[$endPtr>>2]=$p_11;label=39;break;case 39:if(($sign_0|0)==0){$_0=$fraction_0;label=41;break}else{label=40;break};case 40:$_0=-0.0-$fraction_0;label=41;break;case 41:return+$_0}return 0.0}function _strtold($nptr,$endptr){$nptr=$nptr|0;$endptr=$endptr|0;return+(+_strtod($nptr,$endptr))}function _strtof($nptr,$endptr){$nptr=$nptr|0;$endptr=$endptr|0;return+(+_strtod($nptr,$endptr))}function _strtod_l($nptr,$endptr,$loc){$nptr=$nptr|0;$endptr=$endptr|0;$loc=$loc|0;return+(+_strtod($nptr,$endptr))}function _strtold_l($nptr,$endptr,$loc){$nptr=$nptr|0;$endptr=$endptr|0;$loc=$loc|0;return+(+_strtold($nptr,$endptr))}function _atof($str){$str=$str|0;return+(+_strtod($str,0))}function __err($eval,$fmt,varrp){$eval=$eval|0;$fmt=$fmt|0;varrp=varrp|0;var $ap=0,$2=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+16|0;$ap=__stackBase__|0;$2=$ap;HEAP32[$2>>2]=varrp;HEAP32[$2+4>>2]=0;__verr($eval,$fmt,$ap|0)}function __errx($eval,$fmt,varrp){$eval=$eval|0;$fmt=$fmt|0;varrp=varrp|0;var $ap=0,$2=0,__stackBase__=0;__stackBase__=STACKTOP;STACKTOP=STACKTOP+16|0;$ap=__stackBase__|0;$2=$ap;HEAP32[$2>>2]=varrp;HEAP32[$2+4>>2]=0;__verrx($eval,$fmt,$ap|0)}function __verr($eval,$fmt,$ap){$eval=$eval|0;$fmt=$fmt|0;$ap=$ap|0;var $2=0,$4=0,$13=0,$14=0,label=0;label=1;while(1)switch(label|0){case 1:$2=HEAP32[(___errno_location()|0)>>2]|0;$4=HEAP32[___progname>>2]|0;_fprintf(HEAP32[_stderr>>2]|0,1080,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=$4,tempInt)|0)|0;if(($fmt|0)==0){label=3;break}else{label=2;break};case 2:_vfprintf(HEAP32[_stderr>>2]|0,$fmt|0,$ap|0)|0;_fwrite(1040,2,1,HEAP32[_stderr>>2]|0)|0;label=3;break;case 3:$13=HEAP32[_stderr>>2]|0;$14=_strerror($2|0)|0;_fprintf($13|0,880,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=$14,tempInt)|0)|0;_exit($eval|0)}}function __verrx($eval,$fmt,$ap){$eval=$eval|0;$fmt=$fmt|0;$ap=$ap|0;var $2=0,label=0;label=1;while(1)switch(label|0){case 1:$2=HEAP32[___progname>>2]|0;_fprintf(HEAP32[_stderr>>2]|0,984,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=$2,tempInt)|0)|0;if(($fmt|0)==0){label=3;break}else{label=2;break};case 2:_vfprintf(HEAP32[_stderr>>2]|0,$fmt|0,$ap|0)|0;label=3;break;case 3:_fputc(10,HEAP32[_stderr>>2]|0)|0;_exit($eval|0)}}function _strlen(ptr){ptr=ptr|0;var curr=0;curr=ptr;while(HEAP8[curr]|0){curr=curr+1|0}return curr-ptr|0}function _memset(ptr,value,num){ptr=ptr|0;value=value|0;num=num|0;var stop=0,value4=0,stop4=0,unaligned=0;stop=ptr+num|0;if((num|0)>=20){value=value&255;unaligned=ptr&3;value4=value|value<<8|value<<16|value<<24;stop4=stop&~3;if(unaligned){unaligned=ptr+4-unaligned|0;while((ptr|0)<(unaligned|0)){HEAP8[ptr]=value;ptr=ptr+1|0}}while((ptr|0)<(stop4|0)){HEAP32[ptr>>2]=value4;ptr=ptr+4|0}}while((ptr|0)<(stop|0)){HEAP8[ptr]=value;ptr=ptr+1|0}}function _memcpy(dest,src,num){dest=dest|0;src=src|0;num=num|0;var ret=0;ret=dest|0;if((dest&3)==(src&3)){while(dest&3){if((num|0)==0)return ret|0;HEAP8[dest]=HEAP8[src]|0;dest=dest+1|0;src=src+1|0;num=num-1|0}while((num|0)>=4){HEAP32[dest>>2]=HEAP32[src>>2];dest=dest+4|0;src=src+4|0;num=num-4|0}}while((num|0)>0){HEAP8[dest]=HEAP8[src]|0;dest=dest+1|0;src=src+1|0;num=num-1|0}return ret|0}function dynCall_vi(index,a1){index=index|0;a1=a1|0;FUNCTION_TABLE_vi[index&63](a1|0)}function dynCall_vii(index,a1,a2){index=index|0;a1=a1|0;a2=a2|0;FUNCTION_TABLE_vii[index&63](a1|0,a2|0)}function dynCall_ii(index,a1){index=index|0;a1=a1|0;return FUNCTION_TABLE_ii[index&63](a1|0)|0}function dynCall_viii(index,a1,a2,a3){index=index|0;a1=a1|0;a2=a2|0;a3=a3|0;FUNCTION_TABLE_viii[index&63](a1|0,a2|0,a3|0)}function dynCall_v(index){index=index|0;FUNCTION_TABLE_v[index&63]()}function dynCall_iii(index,a1,a2){index=index|0;a1=a1|0;a2=a2|0;return FUNCTION_TABLE_iii[index&63](a1|0,a2|0)|0}function b0(p0){p0=p0|0;abort(0)}function b1(p0,p1){p0=p0|0;p1=p1|0;abort(1)}function b2(p0){p0=p0|0;abort(2);return 0}function b3(p0,p1,p2){p0=p0|0;p1=p1|0;p2=p2|0;abort(3)}function b4(){abort(4)}function b5(p0,p1){p0=p0|0;p1=p1|0;abort(5);return 0}
// EMSCRIPTEN_END_FUNCS
  var FUNCTION_TABLE_vi = [b0,b0,__ZNSt20bad_array_new_lengthC2Ev,b0,b0,b0,__ZNSt20bad_array_new_lengthD0Ev,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,__ZNSt9bad_allocD2Ev,b0,b0,b0,b0
  ,b0,__ZNSt9exceptionD1Ev,b0,__ZNSt9bad_allocC2Ev,b0,__ZNSt9bad_allocD0Ev,b0,b0,b0,b0,b0,b0,b0,__ZNSt9exceptionD0Ev,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0];
  var FUNCTION_TABLE_vii = [b1,b1,b1,b1,b1,b1,b1,b1,__warn,b1,b1
  ,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1
  ,b1,b1,b1,b1,b1,b1,b1,__vwarn,b1,b1,b1,__warnx,b1,b1,b1,__vwarnx,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1];
  var FUNCTION_TABLE_ii = [b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,__ZNKSt9bad_alloc4whatEv,b2,b2,b2,__ZNKSt9exception4whatEv,b2,__ZNKSt20bad_array_new_length4whatEv,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2];
  var FUNCTION_TABLE_viii = [b3,b3,b3,b3,__verrx,b3,b3,b3,b3,b3,__verr
  ,b3,__err,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,b3,b3,b3,b3,b3,b3,__errx,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3];
  var FUNCTION_TABLE_v = [b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4];
  var FUNCTION_TABLE_iii = [b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5];
  return { _test_string: _test_string, _strlen: _strlen, _free: _free, _realloc: _realloc, _memset: _memset, _encode_string: _encode_string, _malloc: _malloc, _memcpy: _memcpy, _decode_string: _decode_string, _calloc: _calloc, _get_length: _get_length, stackAlloc: stackAlloc, stackSave: stackSave, stackRestore: stackRestore, setThrew: setThrew, setTempRet0: setTempRet0, setTempRet1: setTempRet1, setTempRet2: setTempRet2, setTempRet3: setTempRet3, setTempRet4: setTempRet4, setTempRet5: setTempRet5, setTempRet6: setTempRet6, setTempRet7: setTempRet7, setTempRet8: setTempRet8, setTempRet9: setTempRet9, dynCall_vi: dynCall_vi, dynCall_vii: dynCall_vii, dynCall_ii: dynCall_ii, dynCall_viii: dynCall_viii, dynCall_v: dynCall_v, dynCall_iii: dynCall_iii };
})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_ii": invoke_ii, "invoke_viii": invoke_viii, "invoke_v": invoke_v, "invoke_iii": invoke_iii, "_strncmp": _strncmp, "_llvm_va_end": _llvm_va_end, "_sysconf": _sysconf, "___cxa_throw": ___cxa_throw, "___gxx_personality_v0": ___gxx_personality_v0, "_abort": _abort, "_fprintf": _fprintf, "_llvm_eh_exception": _llvm_eh_exception, "___cxa_free_exception": ___cxa_free_exception, "___buildEnvironment": ___buildEnvironment, "__reallyNegative": __reallyNegative, "_strchr": _strchr, "_fputc": _fputc, "_puts": _puts, "___setErrNo": ___setErrNo, "_fwrite": _fwrite, "_send": _send, "_write": _write, "_fputs": _fputs, "_exit": _exit, "___cxa_find_matching_catch": ___cxa_find_matching_catch, "___cxa_allocate_exception": ___cxa_allocate_exception, "_isspace": _isspace, "_ceilf": _ceilf, "___cxa_is_number_type": ___cxa_is_number_type, "___resumeException": ___resumeException, "__formatString": __formatString, "___cxa_does_inherit": ___cxa_does_inherit, "_ceil": _ceil, "_vfprintf": _vfprintf, "___cxa_begin_catch": ___cxa_begin_catch, "_getenv": _getenv, "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv, "_pwrite": _pwrite, "_perror": _perror, "___cxa_call_unexpected": ___cxa_call_unexpected, "_sbrk": _sbrk, "_strerror_r": _strerror_r, "___errno_location": ___errno_location, "_strerror": _strerror, "_time": _time, "__exit": __exit, "___cxa_end_catch": ___cxa_end_catch, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "NaN": NaN, "Infinity": Infinity, "_stderr": _stderr, "__ZTVN10__cxxabiv120__si_class_type_infoE": __ZTVN10__cxxabiv120__si_class_type_infoE, "__ZTVN10__cxxabiv117__class_type_infoE": __ZTVN10__cxxabiv117__class_type_infoE, "___progname": ___progname }, buffer);
var _test_string = Module["_test_string"] = asm["_test_string"];
var _strlen = Module["_strlen"] = asm["_strlen"];
var _free = Module["_free"] = asm["_free"];
var _realloc = Module["_realloc"] = asm["_realloc"];
var _memset = Module["_memset"] = asm["_memset"];
var _encode_string = Module["_encode_string"] = asm["_encode_string"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _decode_string = Module["_decode_string"] = asm["_decode_string"];
var _calloc = Module["_calloc"] = asm["_calloc"];
var _get_length = Module["_get_length"] = asm["_get_length"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };
// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;
// === Auto-generated postamble setup entry stuff ===
Module['callMain'] = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(!Module['preRun'] || Module['preRun'].length == 0, 'cannot call main when preRun functions remain to be called');
  args = args || [];
  ensureInitRuntime();
  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);
  var ret;
  var initialStackTop = STACKTOP;
  try {
    ret = Module['_main'](argc, argv, 0);
  }
  catch(e) {
    if (e.name == 'ExitStatus') {
      return e.status;
    } else if (e == 'SimulateInfiniteLoop') {
      Module['noExitRuntime'] = true;
    } else {
      throw e;
    }
  } finally {
    STACKTOP = initialStackTop;
  }
  return ret;
}
function run(args) {
  args = args || Module['arguments'];
  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return 0;
  }
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    var toRun = Module['preRun'];
    Module['preRun'] = [];
    for (var i = toRun.length-1; i >= 0; i--) {
      toRun[i]();
    }
    if (runDependencies > 0) {
      // a preRun added a dependency, run will be called later
      return 0;
    }
  }
  function doRun() {
    ensureInitRuntime();
    preMain();
    var ret = 0;
    calledRun = true;
    if (Module['_main'] && shouldRunNow) {
      ret = Module['callMain'](args);
      if (!Module['noExitRuntime']) {
        exitRuntime();
      }
    }
    if (Module['postRun']) {
      if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
      while (Module['postRun'].length > 0) {
        Module['postRun'].pop()();
      }
    }
    return ret;
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
    return 0;
  } else {
    return doRun();
  }
}
Module['run'] = Module.run = run;
// {{PRE_RUN_ADDITIONS}}
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}
run();
// {{POST_RUN_ADDITIONS}}
  // {{MODULE_ADDITIONS}}
