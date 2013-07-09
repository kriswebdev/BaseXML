
// Save last values
Module['input_ptr'] = 0;
Module['output_ptr'] = 0;

function encode(input_array) {
	var input_len = input_array.length;
	Module['input_ptr'] = Module._malloc(input_len);
	Module.HEAPU8.set(input_array, Module['input_ptr']);
	Module['output_ptr'] = Module.ccall('encode_string', 'pointer', ['pointer','number'], [Module['input_ptr'],input_len]);
	var output_len = Module.ccall('get_length','number');
	var output_array = Pointer_Uint8Arrayfy(Module['output_ptr'], output_len);
	//Module._free(Module['input_ptr']);  // Too risky. Manual choice.
	//Module._free(Module['output_ptr']); // Too risky. Manual choice.
	return output_array;
}
Module['encode'] = encode;

function decode(input_array) {
	var input_len = input_array.length;
	Module['input_ptr'] = Module._malloc(input_len);	
	Module.HEAPU8.set(input_array, Module['input_ptr']);
	Module['output_ptr'] = Module.ccall('decode_string', 'pointer', ['pointer','number'], [Module['input_ptr'],input_len]);
	var output_len = Module.ccall('get_length','number');
	var output_array = Pointer_Uint8Arrayfy(Module['output_ptr'], output_len);
	//Module._free(Module['input_ptr']);  // Too risky. Manual choice.
	//Module._free(Module['output_ptr']); // Too risky. Manual choice.
	return output_array;
}
Module['decode'] = decode;


// Helper to extract data from ASM.JS memory
function Pointer_Uint8Arrayfy(ptr, length) {
	return Module.HEAPU8.subarray(ptr, ptr + length); // Not NEW to avoid memory duplication (performance loss)... but risky.
}

function Pointer_new_Uint8Arrayfy(ptr, length) {
	var newtarr = new Uint8Array();
	return Module.HEAPU8.subarray(ptr, ptr + length); // Not NEW to avoid memory duplication (performance loss)... but risky.
}


Module['Pointer_Uint8Arrayfy'] = Pointer_Uint8Arrayfy;

// Helper for demo: converts a string to an Uint8Array (typed array)
function str2tarr(str) {
	var bufView = new Uint8Array(str.length);
	for (var i=0, strLen=str.length; i<strLen; i++) {
		bufView[i] = str.charCodeAt(i);
	}
	return bufView;
}
Module['str2tarr'] = str2tarr;

function hex_dump_tarr(tarr) { // Dump array for debugging
	var ret="HEX: ";
	for(var i=0; i<tarr.length; i++) {
		ret+="["+i+"]="+tarr[i].toString(16)+((i==tarr.length-1)?"":", ");
	}
	return ret;
}
Module['hex_dump_tarr'] = hex_dump_tarr;

  return Module;
})();

