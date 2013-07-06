#!/usr/bin/env python
# -*- coding: utf-8 -*-

# Don't forget to run "setup.py install" before
# to import the Python module in your Python library.

import basexml

# Sample encoding / decoding

str = "hello binary world! \x00\x01\t\n<>&\r@!é"
print "Original data: ",str

str_enc = basexml.encode_string(str)
print "\nEncoded data: ",str_enc

str_dec = basexml.decode_string(str_enc)
print "\nDecoded data: ",str_dec

print "\nMatch: ","YES" if (str == str_dec) else "NO :("


