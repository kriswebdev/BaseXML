/*********************************************************************\

BaseXML Javascript module - for XML1.0

VERSION          :  Version ASMJS-1.0 ALGO-1.0B BINARY SAFE FOR XML 1.0

AUTHOR           :  KrisWebDev

LINK             :  https://github.com/kriswebdev/BaseXML
                     KrisWebDev official version

LICENSE          :  Open source under the MIT License.
                     See the LICENCE section below.

COMPILATION      :  You dont need to compile it yourself, just use the
                      Javascript pre-built asm.js directly.
                    If you still want to compile asm.js , you need
					  Emsripten with all its dependencies
					  (https://github.com/kripken/emscripten).
					Then run:
					  emcc -O2 -s EXPORTED_FUNCTIONS="['_encode_string','_decode_string','_get_length','_free']" -s ASM_JS=1 asmjs-basexml10.c --pre-js src-pre-js.js --post-js src-post-js.js -o asmjs.js

USAGE            :  See the .html file for examples.
					ASM.JS code is compatible with all main browsers.
					Firefox will optimize the encoding/decoding process
					  by running it quite as fast as a C code.
					<script src='asmjs.js'></script>
					<script>
					   var source = ...; // Needs to be a UInt8array, see .html file for examples
					   var encoded = BaseXML.encode( source );
					   var decoded = BaseXML.decode( encoded );
					</script>

DESCRIPTION      :  This software encodes and decodes binary data for
                     use WITHIN AN XML 1.0 document, with a minimum
					 overhead. It could also be used to encode binary
					 data in any format limited to UTF-8 characters.
				
OVERHEAD         :  20.0%
                     20 bits unencoded become 24 bits encoded
					 (to be compared to Base64's 33% overhead!)
					 Termination overhead is between 0 to 6 bytes.
					 No compression is applied on source data.
				
REQUIREMENTS     :  Your XML parser MUST:
			    	  - Respect XML1.0 standard regarding allowed characters.
					(and not try to suppress leading or trailing spaces/tabs)
		        	If you can't meet this requirement, you are advised to
		             use more traditional and safer approaches like Base64.

NON-REQUIREMENTS :  Your XML file SHOULD:
				      - Declare UTF-8 encoding:
				        <?xml version="1.0" encoding="UTF-8" ?>
				        (dont' forget DOCTYPE or standalone,
						XML1.1 is fine too)
				    With this XML1.0 BINARY SAFE version, your parser
                     **DOESN'T NEED** to read and write XML files in
					 binary mode. Awesome!

DEPENDENCIES     :  None

ALGORITHM        :  BaseXML for XML1.0 and BaseXML for XML1.1 
					 algorithms have been developed by KrisWebDev,
					 the author of this script.
					Additional information can be found on the starting
                     discussion but the full algorithm itself is not
					 described except in this file's comments:
					 http://stackoverflow.com/a/17354584/2227298
                    BaseXML encodes binary data into UTF-8 compliant
					  characters, with the restrictions imposed by
					  XML also.
					The encoded data can be used within an XML tag
					 (ie. <TAG>Encoded content goes here</TAG>),
					 but cannot be used as a tag name nor a tag
					 property.
					BaseXML is binary safe. The following characters
					 are NEVER present in the encoded data:
					 \0 \r \n < > &
					Note that BaseXML for XML1.0  makes use of the 
					 TAB control character (allowed in XML) and of
					 UTF-8 characters coded on 2 bytes.
					 
----------------------------------------------------------------------
LICENSE
----------------------------------------------------------------------

Copyright (C) 2013, KrisWebDev
 With Portions Copyright (c) 2001 Bob Trower, Trantor Standard Systems Inc.
 
Permission is hereby granted, free of charge, to any person obtaining a
 copy of this software and associated documentation files (the 
 "Software"), to deal in the Software without restriction, including 
 without limitation the rights to use, copy, modify, merge, publish, 
 distribute, sublicense, and/or sell copies of the Software, and to 
 permit persons to whom the Software is furnished to do so, subject to
 the following conditions:

The above copyright notice and this permission notice shall be included
 in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS 
 OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF 
 MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
 IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY 
 CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, 
 TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
 SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Except as contained in this notice, the name(s) of the above copyright 
 holders shall not be used in advertising or otherwise to promote the 
 sale, use or other dealings in this Software without prior written 
 authorization.
 
 ----------------------------------------------------------------------
 
\******************************************************************* */


#include <stdio.h>
#include <stdlib.h>
#include <math.h>


#ifdef _MSC_VER
typedef __int32 int32_t;
typedef unsigned __int32 uint32_t;
typedef __int64 int64_t;
typedef unsigned __int64 uint64_t;
#else
#include <stdint.h>
#endif

			
/*
** returnable errors
**
** Error codes returned to the operating system.
**
*/
#define BASEXML_SYNTAX_ERROR        1
#define BASEXML_FILE_ERROR          2
#define BASEXML_FILE_IO_ERROR       3
#define BASEXML_ERROR_OUT_CLOSE     4
#define BASEXML_ILLEGAL_TERMINATION 5
#define BASEXML_SYNTAX_TOOMANYARGS  6
#define BASEXML_UNEXPECTED_END      7

/*
** basexml_message
**
** Gather text messages in one place.
**
*/
#define BASEXML_MAX_MESSAGES 8
const char *basexml_msgs[ BASEXML_MAX_MESSAGES ] = {
            "basexml:000:Invalid Message Code.",
            "basexml:001:Syntax Error -- check help (-h) for usage.",
            "basexml:002:File Error Opening/Creating Files.",
            "basexml:003:File I/O Error -- Note: output file not removed.",
            "basexml:004:Error on output file close.",
            "basexml:005:BaseXML illegal input - Illegal BaseXML termination sequence.",
            "basexml:006:Syntax: Too many arguments.",
			"basexml:007:BaseXML illegal input - Unexpected end of decoding stream."
};

#define basexml_message( ec ) ((ec > 0 && ec < BASEXML_MAX_MESSAGES ) ? basexml_msgs[ ec ] : basexml_msgs[ 0 ])

/*
** encodeblock
**
** encode 5 8-bit binary bytes as 2*3 8-bit characters
*/

/* DEBUG INFORMATION */
#define BYTETOBINARYPATTERN "%d%d%d%d %d%d%d%d   %d%d%d%d %d%d%d%d   %d%d%d%d %d%d%d%d   %d%d%d%d %d%d%d%d"
#define BYTETOBINARY(byte)  \
  (byte & 0x80000000 ? 1 : 0), \
  (byte & 0x40000000 ? 1 : 0), \
  (byte & 0x20000000 ? 1 : 0), \
  (byte & 0x10000000 ? 1 : 0), \
  (byte & 0x08000000 ? 1 : 0), \
  (byte & 0x04000000 ? 1 : 0), \
  (byte & 0x02000000 ? 1 : 0), \
  (byte & 0x01000000 ? 1 : 0), \
  (byte & 0x800000 ? 1 : 0), \
  (byte & 0x400000 ? 1 : 0), \
  (byte & 0x200000 ? 1 : 0), \
  (byte & 0x100000 ? 1 : 0), \
  (byte & 0x080000 ? 1 : 0), \
  (byte & 0x040000 ? 1 : 0), \
  (byte & 0x020000 ? 1 : 0), \
  (byte & 0x010000 ? 1 : 0), \
  (byte & 0x8000 ? 1 : 0), \
  (byte & 0x4000 ? 1 : 0), \
  (byte & 0x2000 ? 1 : 0), \
  (byte & 0x1000 ? 1 : 0), \
  (byte & 0x0800 ? 1 : 0), \
  (byte & 0x0400 ? 1 : 0), \
  (byte & 0x0200 ? 1 : 0), \
  (byte & 0x0100 ? 1 : 0), \
  (byte & 0x80 ? 1 : 0), \
  (byte & 0x40 ? 1 : 0), \
  (byte & 0x20 ? 1 : 0), \
  (byte & 0x10 ? 1 : 0), \
  (byte & 0x08 ? 1 : 0), \
  (byte & 0x04 ? 1 : 0), \
  (byte & 0x02 ? 1 : 0), \
  (byte & 0x01 ? 1 : 0) 

/*

*/
/* /DEBUG INFORMATION */

// This could also be put in encodeblock and decodeblock but it may be faster "globally"

/* Customized types		*/
typedef unsigned long uLong;
typedef unsigned int uInt;
typedef unsigned char Byte;
typedef int Bool;

/* "Global" variables */
uint32_t input = 0x00000000;
uint32_t output = 0x00000000;

/* Function definitions */
static void encodeblock( unsigned char *in, unsigned char *out, unsigned long len_in, unsigned long *len_out )
{

	unsigned long i;
	unsigned long i5 = 0; // input character position = i*5 on each 2 loops
	unsigned long j  = 0; // output character position
	unsigned long len_last  = 0; // output character position
	unsigned long i_ceil  = (unsigned long) ceil((float)len_in/2.5);
	int len_rest;


	/* DEBUG: printf("Encoding len_in=%lu bytes, i_ceil=%lu\n", len_in, i_ceil); */


	
	*len_out = 0;
	
	for( i = 0, i5 = 0, j = 0; i < i_ceil ; i++ ) {
		
		/* DEBUG: printf("ENCODEBLOCK loop i=%lu (i_ceil=%lu)\n", i, i_ceil); */

		/* DEBUG: printf("ENCODEBLOCK 5 input bytes[0-4] for 2 loops: 0x%x 0x%x 0x%x 0x%x 0x%x\n", in[i5+0], in[i5+1], in[i5+2], in[i5+3], in[i5+4]); */
		
		if(i+1 == i_ceil) { // don't encode inexisting bytes
			input = 0x00000000;
			if(i%2) { // 2nd block of 20bits to encode
				if (i5+2<len_in) input = in[i5+2] << 28;
				if (i5+3<len_in) input |= in[i5+3] << 20;
				if (i5+4<len_in) input |= in[i5+4] << 12;
				i5+=5;
			} else { // 1st block of 20bits to encode
				if (i5<len_in) input = in[i5] << 24;
				if (i5+1<len_in) input |= in[i5+1] << 16;
				if (i5+2<len_in) input |= (in[i5+2] & 0xF0) << 8;
			}
		} else {
			if(i%2) { // 2nd block of 20bits to encode
				input = in[i5+2] << 28 |
						in[i5+3] << 20 |
						in[i5+4] << 12;
				i5+=5;
			} else { // 1st block of 20bits to encode
				input = in[i5] << 24 |
						in[i5+1] << 16 |
						(in[i5+2] & 0xF0) << 8;
			}
		}	
		// input = ABCDEFGH IJKLMNOP QRST0000

		// Case ILLEGAL<>_BOTH I3
		if ( ( input & 0x03efd000 ) == 0x01e3c000 ) { // GHIJKMNOPQRT == 011110011110
				output  = 0x38404000; // 001110LS 01ABCDEF 01000000 ********
				output |= (input & 0x00100000) <<  5; // L
				output |= (input & 0x00002000) << 11; // S
				output |= (input & 0xfc000000) >> 10; // ABCDEF
		} else 
		// Case ILLEGAL<>_LEFT I1
		if ( ( input & 0x03e80000 ) == 0x01e00000 ) { // GHIJKM == 011110
				output  = 0x30404000; // 001100LT 01ABCDEF 01NOPQRS ********
				output |= (input & 0x00100000) <<  5; // L
				output |= (input & 0x00001000) << 12; // T
				output |= (input & 0xfc000000) >> 10; // ABCDEF
				output |= (input & 0x0007e000) >>  5; // NOPQRS
		} else 
		// Case ILLEGAL<>_RIGHT I2
		if ( ( input & 0x0007d000 ) == 0x0003c000 ) { // NOPQRT == 011110
				output  = 0x34404000; // 001101SM 01ABCDEF 01GHIJKL ********
				output |= (input & 0x00002000) << 12; // S
				output |= (input & 0x00080000) <<  5; // M
				output |= (input & 0xfc000000) >> 10; // ABCDEF
				output |= (input & 0x03f00000) >> 12; // GHIJKL
		} else 
		if ( input & 0x03000000  &&  // GH != 00

		 input & 0x00060000 ) { // NO != 00

		// Case STANDARD E1
				output  = 0x40000000; // 01ABCDEF 0GHIJKLM 0NOPQRST ********
				output |= (input & 0xfc000000) >>  2; // ABCDEF
				output |= (input & 0x03f80000) >>  3; // GHIJKLM
				output |= (input & 0x0007f000) >>  4; // NOPQRST
		} else 
		// Case CONTROL_CHARS_LEFT_CANONICAL E5 : ABCD==0000 and GH==00
		if ( !( input & 0xf3000000 ) ) { // ABCDGH == 000000
				output  = 0x20204000; // 0010EFIJ 0010KLMN 01OPQRST ********
				output |= (input & 0x0c000000); // EF
				output |= (input & 0x00c00000) <<  2; // IJ
				output |= (input & 0x003c0000) >>  2; // KLMN
				output |= (input & 0x0003f000) >>  4; // OPQRST
		} else 
		// Case CONTROL_CHARS_RIGHT_CANONICAL E6 : ABCD==0000 and NO==00
		if ( !( input & 0xf0060000 ) ) { // ABCDNO == 000000
				output  = 0x20402000; // 0010PEFG 01HIJKLM 0010QRST ********
				output |= (input & 0x00010000) << 11; // P
				output |= (input & 0x0e000000) >>  1; // EFG
				output |= (input & 0x01f80000) >>  3; // HIJKLM
				output |= (input & 0x0000f000) >>  4; // QRST
		} else 
		// Case CONTROL_CHARS_BOTH E2
		if ( !( input & 0x03060000 ) ) { // GHNO == 0000
				output  = 0x20404000; // 0010ABCD 01EFIJKL 01MPQRST ********
				output |= (input & 0xf0000000) >>  4; // ABCD
				output |= (input & 0x0c000000) >>  6; // EF
				output |= (input & 0x00f00000) >>  4; // IJKL
				output |= (input & 0x00080000) >>  6; // M
				output |= (input & 0x0001f000) >>  4; // PQRST
		} else 
		// Case CONTROL_CHARS_LEFT E3
		if ( !( input & 0x03000000 ) ) { // GH == 00
				output  = 0x00c08000; // 0NOPQRST 110ABCDE 10MFIJKL ********
				output |= (input & 0x0007f000) << 12; // NOPQRST
				output |= (input & 0xf8000000) >> 11; // ABCDE
				output |= (input & 0x00080000) >>  6; // M
				output |= (input & 0x04000000) >> 14; // F
				output |= (input & 0x00f00000) >> 12; // IJKL
		} else 
		// Case CONTROL_CHARS_RIGHT E4
		if ( !( input & 0x00060000 ) ) { // NO == 00
				output  = 0xc0800000; // 110ABCDE 10FPQRST 0GHIJKLM ********
				output |= (input & 0xf8000000) >>  3; // ABCDE
				output |= (input & 0x04000000) >>  5; // F
				output |= (input & 0x0001f000) <<  4; // PQRST
				output |= (input & 0x03f80000) >> 11; // GHIJKLM
		}
			

		/* DEBUG: printf("ENCODEBLOCK(%lu) input   32: "BYTETOBINARYPATTERN"\n", i, BYTETOBINARY(input)); */
		/* DEBUG: printf("ENCODEBLOCK(%lu) out<>   32: "BYTETOBINARYPATTERN"\n", i, BYTETOBINARY(output)); */
				
		// XML ENTITY UNALLOWED CHARS
		/*
			On "encoded" variable apply:
			convert & (0x26) to TAB (0x09)
		*/
		if ((output & 0xFF000000) == 0x26000000) {
			output &= 0x00FFFFFF; output |= 0x09000000;
		}
		if ((output & 0x00FF0000) == 0x00260000) {
			output &= 0xFF00FFFF; output |= 0x00090000;
		}
		if ((output & 0x0000FF00) == 0x00002600) {
			output &= 0xFFFF00FF; output |= 0x00000900;
		}
		
		/* DEBUG: printf("ENCODEBLOCK(%lu) outXML  32: "BYTETOBINARYPATTERN"\n", i, BYTETOBINARY(output)); */
		

		out[j] = (unsigned char) (output >> 24);
		out[j+1] = (unsigned char) (output >> 16);
		out[j+2] = (unsigned char) (output >> 8);	

		/* DEBUG: printf("ENCODEBLOCK output bytes[0-2]: 0x%x 0x%x 0x%x (j=%lu,+1,+1)\n\n", out[j], out[j+1], out[j+2], j); */
		
		j+=3;
					
	}


	// SHORT TERMINATION SEQUENCE
	// we could reduce output size by coding into out[3-4] if len <= 2
	
	len_rest = len_in%5;
	
	if(len_rest) { // add a terination sequence
		out[j] = 0x3f;
		out[j+1] = 0x30 | ((len_rest) & 0x0f); // code the length of the last unencoded 5-bytes sequence inside the termination sequence
		out[j+2] = 0x3f;
		/* DEBUG: printf("ENCODEBLOCK Termination sequence: 0x%x 0x%x 0x%x\n\n", out[j], out[j+1], out[j+2]); */
		j+=3;
	}
	
	*len_out = j;
		
}


/*
** decodeblock
**
** decode 2*24bits into 2*20bits
** decodeblock is quite permissive:
** - undecodable bytes will (probably) be converted to 0x00
** - there is no unicity between encoded data and decoded data
*/
static void decodeblock( unsigned char *in, unsigned char *out, unsigned long len_in, unsigned long *len_out)
{   
	
	unsigned long i;
	unsigned long i3 = 0; // input character position = i*3
	unsigned long j  = 0; // output character position
	unsigned long len_last  = 0; // output character position
	unsigned long i_ceil   = (unsigned long)ceil((float)len_in/6)*2;
	unsigned long i_floor  = (unsigned long)floor((float)len_in/6)*2;
	
	*len_out = 0;

	/* DEBUG: printf("Decoding %lu bytes...\n",len_in); */
	
	for( i = 0, i3 = 0; i < i_ceil ; i++, i3 += 3 ) {

		/* DEBUG: printf("DECODEBLOCK loop i=%lu, i3=%lu (i_ceil=%lu)\n", i, i3, i_ceil); */
				
		input = 0;
		if(i+1 == i_ceil || i+2 == i_ceil) {
			
			 // Termination sequence
			if( i3+2 < len_in ) {
				if( (in[i3] == 0x3f) && (in[i3+2] == 0x3f) ) {
					/* DEBUG: printf("Termination sequence now 0x%x 0x%x 0x%x\n", in[i3], in[i3+1], in[i3+2]); */
					len_last = in[i3+1] & 0x07;
					if(len_last < 1 || len_last > 4) { // Termination sequence after without correct length in it: illegal.
						/* DEBUG: printf("in[] is %c %c %c %c %c %c\n",in[i3],in[i3+1],in[i3+2],in[i3+3],in[i3+4],in[i3+5]); */
						/* DEBUG: printf("len_last is %lu\n",len_last); */
						perror( basexml_message( BASEXML_ILLEGAL_TERMINATION ) );
					} else {
						*len_out = j + len_last - (1-(i%2))*5;
						/* DEBUG: printf("\n\n*!! LEN_OUT = j (%lu) + len_last (%lu) - (1-(%lu))*5 = %lu\n",j,len_last,i%2,*len_out); */
					}
					break;
				} /*else  DEBUG: printf("DECODEBLOCK(%lu) Not a termination sequence\n",i); */
			} /*else  DEBUG */ printf("DECODEBLOCK(%lu) i3+2 < len_in",i);
			
			 // Full sequence
			if(i3<len_in)   input |= in[i3]   << 24;
			if(i3+1<len_in) input |= in[i3+1] << 16;
			if(i3+1<len_in) input |= in[i3+2] <<  8;
		} else {
		//printf("DECODEBLOCK(%lu) DEBUG INPUT BEFORE     : %x\n", i, input);
		//printf("DECODEBLOCK(%lu) DEBUG i3     : %lu\n", i, i3);
		//printf("DECODEBLOCK(%lu) DEBUG in[i3] in[i3+1] in[i3+2]     : %x %x %x\n", i, in[i3], in[i3+1], in[i3+2]);
		//printf("DECODEBLOCK(%lu) DEBUG NEXT WOULD BE in[i3+3] in[i3+4] in[i3+5]     : %x %x %x\n", i, in[i3+3], in[i3+4], in[i3+5]);
		//printf("DECODEBLOCK(%lu) DEBUG in[]     : %s\n", i, in);
		
			input |= in[i3] << 24 |
					in[i3+1] << 16 |
					in[i3+2] << 8;
					
		//printf("DECODEBLOCK(%lu) DEBUG INPUT AFTER     : %x\n", i, input);
		}
		

		output  = 0x00000000;
		
		/* DEBUG: printf("DECODEBLOCK(%lu) bytes     : %x\n", i, input); */
		/* DEBUG: printf("DECODEBLOCK(%lu) inXML   32: "BYTETOBINARYPATTERN"\n", i, BYTETOBINARY(input)); */
		
		// XML ENTITY UNALLOWED CHARS
		// Preliminary transform of \n\r\t to <>& in each encoded byte
		if((input & 0xFF000000) == 0x09000000) {
			input &= 0x00FFFFFF; input |= 0x26000000;
		}
		
		if((input & 0x00FF0000) == 0x00090000) {
			input &= 0xFF00FFFF; input |= 0x00260000;
		}
		
		if((input & 0x0000FF00) == 0x00000900) {
			input &= 0xFFFF00FF; input |= 0x00002600;
		}
		
		/* DEBUG: printf("DECODEBLOCK(%lu) in<>    32: "BYTETOBINARYPATTERN"\n", i, BYTETOBINARY(input)); */
				

		// Case ILLEGAL<>_BOTH I3 DECODE
		if ( ( input & 0xfcc0f000 ) == 0x38404000 ) { // ABCDEFIJQRST == 001110010100
			    output  = 0x01e3c000; // 001110LS 01ABCDEF 01000000 ********
			    output |= (input & 0x02000000) >>  5; // L
			    output |= (input & 0x01000000) >> 11; // S
			    output |= (input & 0x003f0000) << 10; // ABCDEF
		} else 
		// Case ILLEGAL<>_LEFT I1 DECODE
		if ( ( input & 0xfcc0c000 ) == 0x30404000 ) { // ABCDEFIJQR == 0011000101
			    output  = 0x01e00000; // 001100LT 01ABCDEF 01NOPQRS ********
			    output |= (input & 0x02000000) >>  5; // L
			    output |= (input & 0x01000000) >> 12; // T
			    output |= (input & 0x003f0000) << 10; // ABCDEF
			    output |= (input & 0x00003f00) <<  5; // NOPQRS
		} else 
		// Case ILLEGAL<>_RIGHT I2 DECODE
		if ( ( input & 0xfcc0c000 ) == 0x34404000 ) { // ABCDEFIJQR == 0011010101
			    output  = 0x0003c000; // 001101SM 01ABCDEF 01GHIJKL ********
			    output |= (input & 0x02000000) >> 12; // S
			    output |= (input & 0x01000000) >>  5; // M
			    output |= (input & 0x003f0000) << 10; // ABCDEF
			    output |= (input & 0x00003f00) << 12; // GHIJKL
		} else 
		// Case STANDARD E1 DECODE
		if ( ( input & 0xc0808000 ) == 0x40000000 ) { // ABIQ == 0100
			    output |= (input & 0x3f000000) <<  2; // ABCDEF
			    output |= (input & 0x007f0000) <<  3; // GHIJKLM
			    output |= (input & 0x00007f00) <<  4; // NOPQRST
		} else 
		// Case CONTROL_CHARS_LEFT_CANONICAL E5 : ABCD==0000 and GH==00 DECODE
		if ( ( input & 0xf0f0c000 ) == 0x20204000 ) { // ABCDIJKLQR == 0010001001
			    output |= (input & 0x0c000000); // EF
			    output |= (input & 0x03000000) >>  2; // IJ
			    output |= (input & 0x000f0000) <<  2; // KLMN
			    output |= (input & 0x00003f00) <<  4; // OPQRST
		} else 
		// Case CONTROL_CHARS_RIGHT_CANONICAL E6 : ABCD==0000 and NO==00 DECODE
		if ( ( input & 0xf0c0f000 ) == 0x20402000 ) { // ABCDIJQRST == 0010010010
			    output |= (input & 0x08000000) >> 11; // P
			    output |= (input & 0x07000000) <<  1; // EFG
			    output |= (input & 0x003f0000) <<  3; // HIJKLM
			    output |= (input & 0x00000f00) <<  4; // QRST
		} else 
		// Case CONTROL_CHARS_BOTH E2 DECODE
		if ( ( input & 0xf0c0c000 ) == 0x20404000 ) { // ABCDIJQR == 00100101
			    output |= (input & 0x0f000000) <<  4; // ABCD
			    output |= (input & 0x00300000) <<  6; // EF
			    output |= (input & 0x000f0000) <<  4; // IJKL
			    output |= (input & 0x00002000) <<  6; // M
			    output |= (input & 0x00001f00) <<  4; // PQRST
		} else 
		// Case CONTROL_CHARS_LEFT E3 DECODE
		if ( ( input & 0x80e0c000 ) == 0x00c08000 ) { // AIJKQR == 011010
			    output |= (input & 0x7f000000) >> 12; // NOPQRST
			    output |= (input & 0x001f0000) << 11; // ABCDE
			    output |= (input & 0x00002000) <<  6; // M
			    output |= (input & 0x00001000) << 14; // F
			    output |= (input & 0x00000f00) << 12; // IJKL
		} else 
		// Case CONTROL_CHARS_RIGHT E4 DECODE
		if ( ( input & 0xe0c08000 ) == 0xc0800000 ) { // ABCIJQ == 110100
			    output |= (input & 0x1f000000) <<  3; // ABCDE
			    output |= (input & 0x00200000) <<  5; // F
			    output |= (input & 0x001f0000) >>  4; // PQRST
			    output |= (input & 0x00007f00) << 11; // GHIJKLM
		} /*
		  else if( ( input & 0xfff0ff00 ) == 0x3f303f00 ) { // == 00111111 0011**** 00111111 ********

			// ERROR
			// BaseXML10BS termination sequence doesn't store encoded bytes.
			// That's the job of decode() to anticipate termination sequence and pass len to decodeblock().

		} */
		
	/* DEBUG: printf("DECODEBLOCK(%lu) output  32: "BYTETOBINARYPATTERN"\n", i, BYTETOBINARY(output)); */
	
		if(i%2) {
			out[j+2] |= ((unsigned char) (output >> 28)) & 0x0F;
			out[j+3]  =  (unsigned char) (output >> 20);
			out[j+4]  =  (unsigned char) (output >> 12);
			/* DEBUG: printf("DECODEBLOCK output bytes[0-4]: 0x%x 0x%x 0x%x 0x%x 0x%x (j=%lu[+0 - +4])\n",   out[j], out[j+1], out[j+2], out[j+3], out[j+4], j); */
			j += 5;
		} else {
			out[j]  =  (unsigned char) (output >> 24);
			out[j+1]  =  (unsigned char) (output >> 16);
			out[j+2]  =  (unsigned char) (output >> 8);	
			/* DEBUG: printf("DECODEBLOCK output bytes[0-1]: 0x%x 0x%x\n",   out[j], out[j+1]); */
		}

		
	}
	
	if(*len_out == 0)
		*len_out = j;
		
}



/*
** encode_string
**
** Encodes a Python binary string
**
*/

unsigned char* output_buffer;
unsigned long output_len = 0;

// output_len ?
unsigned char* encode_string(
		unsigned char* input_buffer, 
		unsigned long input_len
		)
{
	// printf("hello, world! ENCODE\n");

	output_buffer = (unsigned char *) malloc( input_len*6/5 + 12); // Termination sequence. Should be +6 but not future-proof.
	encodeblock(input_buffer, output_buffer, input_len, &output_len);
		
	return output_buffer;
	
}



/*
** decode_string
**
** Decodes a Python binary string
**
*/

unsigned char* decode_string(
		unsigned char* input_buffer, 
		unsigned long input_len
		)
{

	output_buffer = (unsigned char *) malloc( input_len*5/6 + 5 );
	decodeblock(input_buffer, output_buffer, input_len, &output_len);
	
	
	return output_buffer;
	
}


int get_length() {
	return output_len;
}

/* Don't forget to export free() too */