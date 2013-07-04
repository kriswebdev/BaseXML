BaseXML - for XML1.0
====================

<pre>
VERSION          :  V1.0 BINARY SAFE FOR XML 1.0

AUTHOR           :  KrisWebDev

LINK             :  https://github.com/kriswebdev/BaseXML
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

</pre>

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
