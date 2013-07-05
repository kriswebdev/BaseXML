/*********************************************************************\

BaseXML - for XML1.0

VERSION          :  V1.0b BINARY SAFE FOR XML 1.0

AUTHOR           :  KrisWebDev

LINK             :  <<<<<GitHub release link>>>>>
                     KrisWebDev official version

LICENSE          :  Open source under the MIT License.
                     See the LICENCE section below.

USAGE            :  Compile and run as a command line to see the help.
					 To compile: gcc -O3 basexml11.c -o basexml11.exe
					 Download MinGW to compile on Windows.

DESCRIPTION      :  This software encodes and decodes binary data for
                     use WITHIN AN XML 1.0 document, with a minimum
					 overhead. It could also be used to encode binary
					 data in any format limited to UTF-8 characters.
				
OVERHEAD         :  20.0%
                     20 bits unencoded become 24 bits encoded
					 (to be compared to Base64's 33% overhead!)
				
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
#include <stdint.h>

#define DEBUG        0
#define debug_print(...) \
            do { if (DEBUG) fprintf(stderr, __VA_ARGS__); } while (0)

			
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
debug_print ("Debug info "BYTETOBINARYPATTERN"\n", BYTETOBINARY(!(in[0] & 0xf0)));
*/
/* /DEBUG INFORMATION */

// This could also be put in encodeblock and decodeblock but it may be faster "globally"
uint32_t input  = 0x00000000;
uint32_t output = 0x00000000;

static void encodeblock( unsigned char *in, unsigned char *out, int len ) // encode 1 block of 2*20=40 bits (5 bytes) into 2*24=48 bits (6 bytes)
{
	debug_print ("Bytes to encode (len): %i\n", len);

	debug_print ("ENCODEBLOCK 5 input bytes[0-4]: 0x%x 0x%x 0x%x 0x%x 0x%x\n", in[0], in[1], in[2], in[3], in[4]);

	int i = 0;
	int illegal_left = 0;
	int illegal_right = 0;
	do {
		// in each loop (2 loops except if termination), we encode 20bits to 24 bits
		// i == 1 && len = 1,2 => end of stream reached in the first 20 bits (ie after the 1st or 2nd stream byte), result will be a 20bit termination sequence followed by a 20bit feed sequence
		// i == 2 && len = 3,4 => end of stream reached in the last 20 bits  (ie after the 3rd or 4th stream byte), result will be a normal 20bit sequence followed by a 20bit termination sequence
		
		debug_print ("ENCODEBLOCK loop i=%i\n", i);
		
		if(i) // 2nd block of 20bits to encode
			input = in[2] << 28 |
					in[3] << 20 |
					in[4] << 12;
		else // 1st block of 20bits to encode
			input = in[0] << 24 |
					in[1] << 16 |
					(in[2] & 0xF0) << 8;
		
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
			

		debug_print ("ENCODEBLOCK(%i) input   32: "BYTETOBINARYPATTERN"\n", i, BYTETOBINARY(input));
		debug_print ("ENCODEBLOCK(%i) out<>   32: "BYTETOBINARYPATTERN"\n", i, BYTETOBINARY(output));
		
		

		
		
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
		
		debug_print ("ENCODEBLOCK(%i) outXML  32: "BYTETOBINARYPATTERN"\n", i, BYTETOBINARY(output));
		
		if(i) {
			out[3] = (unsigned char) (output >> 24);
			out[4] = (unsigned char) (output >> 16);
			out[5] = (unsigned char) (output >> 8);	
		} else {
			out[0] = (unsigned char) (output >> 24);
			out[1] = (unsigned char) (output >> 16);
			out[2] = (unsigned char) (output >> 8);
		}
					
	} while (++i != 2);

	debug_print ("ENCODEBLOCK output bytes[0-6]: 0x%x 0x%x 0x%x 0x%x 0x%x 0x%x\n\n", out[0], out[1], out[2], out[3], out[4], out[5]);

	// SHORT TERMINATION SEQUENCE
	// we could reduce output size by coding into out[3-4] if len <= 2, but the decoding performance may be (very few) impacted since we only check every 6 bits
	if(len != 0) { // add a terination sequence
		if(len > 0 && len < 5) { // else... you've messed up the code.
			out[6] = 0x3f;
			out[7] = 0x30 | ((len) & 0x0f); // code the length of the last unencoded 5-bytes sequence inside the termination sequence
			out[8] = 0x3f;
		}
	}
	
	/*
	debug_print ("\nENCODEBLOCK out[0]  8 : "BYTETOBINARYPATTERN"\n", BYTETOBINARY(out[0]));
	debug_print ("\nENCODEBLOCK out[1]  8 : "BYTETOBINARYPATTERN"\n", BYTETOBINARY(out[1]));
	debug_print ("\nENCODEBLOCK out[2]  8 : "BYTETOBINARYPATTERN"\n", BYTETOBINARY(out[2]));
	*/
	
}


/*
** decodeblock
**
** decode 2*24bits into 2*20bits
** decodeblock is quite permissive:
** - undecodable bytes will (probably) be converted to 0x00
** - there is no unicity between encoded data and decoded data
*/
static void decodeblock( unsigned char *in, unsigned char *out)
{   

	debug_print ("Decoding 6 bytes...\n");

	debug_print ("DECODEBLOCK input bytes[0-6]: 0x%x 0x%x 0x%x 0x%x 0x%x 0x%x\n", in[0], in[1], in[2], in[3], in[4], in[5]);
	
	int i = 0;
	do {

		debug_print ("DECODEBLOCK loop i=%i\n", i);
		
		if(i) // 2nd block of 20bits to encode
			input = in[3] << 24 |
					in[4] << 16 |
					in[5] << 8;
		else // 1st block of 20bits to encode
			input = in[0] << 24 |
					in[1] << 16 |
					in[2] << 8;
	
		output  = 0x00000000;
		
		debug_print ("DECODEBLOCK(%i) inXML   32: "BYTETOBINARYPATTERN"\n", i, BYTETOBINARY(input));
		
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
		
		debug_print ("DECODEBLOCK(%i) in<>    32: "BYTETOBINARYPATTERN"\n", i, BYTETOBINARY(input));
				

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
		
	debug_print ("DECODEBLOCK(%i) output  32: "BYTETOBINARYPATTERN"\n", i, BYTETOBINARY(output));
	
		if(i) {
			out[2] |= ((unsigned char) (output >> 28)) & 0x0F;
			out[3]  =  (unsigned char) (output >> 20);
			out[4]  =  (unsigned char) (output >> 12);	
		} else {
			out[0]  =  (unsigned char) (output >> 24);
			out[1]  =  (unsigned char) (output >> 16);
			out[2]  =  (unsigned char) (output >> 8);
		}
		
	} while (++i != 2);

	debug_print ("DECODEBLOCK output bytes[0-5]: 0x%x 0x%x 0x%x 0x%x 0x%x\n",   out[0], out[1], out[2], out[3], out[4]);
	
}


/*
** encode
**
** basexml encode a stream
*/
static int encode( FILE *infile, FILE *outfile )
{
    unsigned char in[5]  = {0x00, 0x00, 0x00, 0x00, 0x00}; // 5 bytes
	unsigned char out[9] = {0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00}; // map into 6 bytes once encoded (or 9 with a termination sequence)
    int i, len, blocksout = 0;
    int retcode = 0;
	int imax = 6;
		
    while( feof( infile ) == 0 ) { // beware, there may be a last try for getc uncasted == EOF <=> feof after getc : so that's handled :)
        len = 0;
		
        for( i = 0; i < 5; i++ ) { // Read file into in[0-4]
            in[i] = (unsigned char) getc( infile );

            if( !feof( infile ) ) {
                len++;
            }
            else { // end of file reached
				in[i] = (unsigned char) 0;
            }
        }
		if(ferror( infile )) { // Unexpected file I/O error
			perror( basexml_message( BASEXML_FILE_IO_ERROR ) );
	        retcode = BASEXML_FILE_IO_ERROR;
			break;
		}
        if( len > 0 ) {  // Encode 2*20bits (5 bytes) to 2*24bits (6 bytes)
            encodeblock( in, out, len );

			for( i = 0; i < 6; i++ ) { // Put the encoded bytes in the output stream.
                putc( (int)(out[i]), outfile );
			}
			if( out[6] ) { // encodeblock() added a termination sequence
				putc( (int)(out[6]), outfile );
				putc( (int)(out[7]), outfile );
				putc( (int)(out[8]), outfile );
				break;
			}
			
        } else break; // that's a perfect end of file reached
    }
	
	if( ferror( outfile ) ) { // let's handle that out of the stream loop to improve performance. who cares we can't write?
		perror( basexml_message( BASEXML_FILE_IO_ERROR ) );
		retcode = BASEXML_FILE_IO_ERROR;
	}
	
    return( retcode );
}

/*
** decode
**
** decode a basexml encoded stream
*/
static int decode( FILE *infile, FILE *outfile )
{
	int retcode = 0;
    unsigned char in[6]  = {0x00, 0x00, 0x00, 0x00, 0x00, 0x00};
	int innext[3]  = {0x00, 0x00, 0x00};
    unsigned char out[5] = {0x00, 0x00, 0x00, 0x00, 0x00};
		
    int v;
    int i = 0;
	int len = 5;

	innext[0] = getc( infile );
	innext[1] = getc( infile );
	innext[2] = getc( infile );

    while( innext[0] != EOF ) {
		in[0] = (unsigned char) innext[0];
		in[1] = (unsigned char) innext[1];
		in[2] = (unsigned char) innext[2];
		in[3] = (unsigned char) getc( infile );
		in[4] = (unsigned char) getc( infile );
		in[5] = (unsigned char) getc( infile );
		if(feof( infile )) { // Unexpected end of decoding stream (correctly encoded stream is a multiple of 6 bytes - or 3 with termination)
			perror( basexml_message( BASEXML_UNEXPECTED_END ) );
	        retcode = BASEXML_UNEXPECTED_END;
			break;
		} else if(ferror( infile )) { // Unexpected file I/O error
			perror( basexml_message( BASEXML_FILE_IO_ERROR ) );
	        retcode = BASEXML_FILE_IO_ERROR;
			break;
		}
		
		innext[0] = getc( infile );
		innext[1] = getc( infile );
		innext[2] = getc( infile );
		if( (innext[0] == 0x3f) && (innext[2] == 0x3f) ) { // Termination sequence after
			debug_print("Termination sequence now 0x%x 0x%x 0x%x",innext[0],innext[1],innext[2]);
			len = innext[1] & 0x07;
			if(feof( infile ) || len < 1 || len > 4) { // Termination sequence after without correct length in it: illegal.
				debug_print("in[] is %c %c %c %c %c %c %c\n",in[0],in[1],in[2],in[3],in[4],in[5]);
				debug_print("len is %i (0x%x)\n",len,len);
				debug_print("feof() is %i\n",feof(infile));
				perror( basexml_message( BASEXML_ILLEGAL_TERMINATION ) );
				retcode = BASEXML_ILLEGAL_TERMINATION;
			}
		}
		
		decodeblock( in, out );
		debug_print ("Saving len = %i characters\n\n", len);
		for( i = 0; i < len; i++ ) {
			putc( (int) out[i], outfile );
		}
		if(len != 5)
			break;
    }
	
	if( ferror( outfile ) ) { // let's handle that out of the stream loop to improve performance
		
		perror( basexml_message( BASEXML_FILE_IO_ERROR ) );
		retcode = BASEXML_FILE_IO_ERROR;
	}
	
    return( retcode );
}

/*
** basexml
**
** 'engine' that opens streams and calls encode/decode
*/

static int basexml( char opt, char *infilename, char *outfilename )
{
    FILE *infile;
    int retcode = BASEXML_FILE_ERROR;

    if( !infilename ) {
        infile = stdin;
    }
    else {
        infile = fopen( infilename, "rb" );
    }
    if( !infile ) {
        perror( infilename );
    }
    else {
        FILE *outfile;
        if( !outfilename ) {
            outfile = stdout;
        }
        else {
            outfile = fopen( outfilename, "wb" );
        }
        if( !outfile ) {
            perror( outfilename );
        }
        else {
            if( opt == 'e' ) {
                retcode = encode( infile, outfile );
            }
            else {
                retcode = decode( infile, outfile );
            }
			if( retcode == 0 ) {
	            if (ferror( infile ) != 0 || ferror( outfile ) != 0) {
                    perror( basexml_message( BASEXML_FILE_IO_ERROR ) );
	                retcode = BASEXML_FILE_IO_ERROR;
	            }
            }
            if( outfile != stdout ) {
                if( fclose( outfile ) != 0 ) {
                    perror( basexml_message( BASEXML_ERROR_OUT_CLOSE ) );
                    retcode = BASEXML_FILE_IO_ERROR;
                }
            }
        }
        if( infile != stdin ) {
			if( fclose( infile ) != 0 ) {
				perror( basexml_message( BASEXML_ERROR_OUT_CLOSE ) );
				retcode = BASEXML_FILE_IO_ERROR;
			}
        }
    }

    return( retcode );
}

/*
** showuse
**
** display usage information
*/
static void showuse( )
{
	printf( "\n" );
	printf( "  basexml11  (BaseXML for XML1.1)    KrisWebDev   06/2013\n" );
	printf( "  Usage:\n");
	printf( "    Encode:  basexml11 -e <FileIn> [<FileOut>]\n" );
	printf( "    Decode:  basexml11 -d <FileIn> [<FileOut>]\n" );
	printf( "  Purpose:   This program is a simple utility that encodes\n" );
	printf( "             and decodes files to BaseXML format.\n" );
	printf( "  Returns:   0 = Success.  Non-zero is an error code.\n" );
	printf( "  ErrCode:   1 = Bad Syntax, 2 = File Open, 3 = File I/O\n" );
}

#define THIS_OPT(ac, av) ((char)(ac > 1 ? av[1][0] == '-' ? av[1][1] : 0 : 0))

/*
** main
**
** parse and validate arguments and call basexml engine or help
*/
int main( int argc, char **argv )
{
    char opt = (char) 0;
    int retcode = 0;
    char *infilename = NULL, *outfilename = NULL;

    while( THIS_OPT( argc, argv ) != (char) 0 ) {
        switch( THIS_OPT(argc, argv) ) {
            case '?':
			case 'h':
            case 'e':
            case 'd':
                    opt = THIS_OPT(argc, argv);
                    break;
             default:
                    opt = (char) 0;
                    break;
        }
        argv++;
        argc--;
    }
    if( argc > 3 ) {
        fprintf(stderr, "%s\n", basexml_message( BASEXML_SYNTAX_TOOMANYARGS ) );
        opt = (char) 0;
    }
    switch( opt ) {
        case 'e':
        case 'd':
            infilename = argc > 1 ? argv[1] : NULL;
            outfilename = argc > 2 ? argv[2] : NULL;
            retcode = basexml( opt, infilename, outfilename );
            break;
        case 0:
			if( argv[1] == NULL ) {
				showuse();
			}
			else {
				retcode = BASEXML_SYNTAX_ERROR;
			}
			break;

    }
    if( retcode != 0 ) {
        fprintf(stderr, "%s\n", basexml_message( retcode ) );
    }

    return( retcode );
}
