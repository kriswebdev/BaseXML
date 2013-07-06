#!/usr/bin/env python
# -*- coding: utf-8 -*-
##=============================================================================
 #
 # Copyright (C) 2013, KrisWebDev
 #   With Portions Copyright (C) 2003, 2011 Alessandro Duca <alessandro.duca@gmail.com>
 #
 # This library is free software; you can redistribute it and/or
 # modify it under the terms of the GNU Lesser General Public
 # License as published by the Free Software Foundation; either
 # version 2.1 of the License, or (at your option) any later version.
 #
 # This library is distributed in the hope that it will be useful,
 # but WITHOUT ANY WARRANTY; without even the implied warranty of
 # MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 # Lesser General Public License for more details.
 #
 # You should have received a copy of the GNU Lesser General Public
 # License along with this library; if not, write to the Free Software
 # Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 #=============================================================================
 # 
##=============================================================================

from distutils.core import setup, Extension

setup(	
	name		 = "basexml",
	version		 = "1.0",
	author		 = "KrisWebDev",
	    url		 = "https://github.com/kriswebdev/BaseXML",
	license		 = "LGPL",
        platforms        = ["Unix", "Windows"],
	ext_modules	 = [Extension("basexml",["src/python-basexml10.c"],extra_compile_args=["-O3","-g","/O2"])],
        classifiers      = [
            "Programming Language :: Python",
            "Programming Language :: Python :: 2.5",
            "Programming Language :: Python :: 2.6",
            "Programming Language :: Python :: 2.7",
            "Programming Language :: C",
            "License :: OSI Approved :: GNU Library or Lesser General Public License (LGPL)",
            "Operating System :: Unix",
			"Operating System :: Microsoft :: Windows",
            "Development Status :: 5 - Production/Stable",
            "Environment :: Web Environment",
            "Intended Audience :: Developers",
            "Topic :: Software Development :: Libraries :: Python Modules",
            "Topic :: Text Processing :: Markup :: XML"
            ],
	description	 = "BaseXML Module for Python",
        long_description = """
BaseXML Encoding/Decoding for Python
---------------------------------

This a Python module that provides raw (C-level) BaseXML encoding/decoding.

This modules supports the encoding/decoding of strings, not yet files.

It is based on "BaseXML 1.0 for XML 1.0 BINARY SAFE" algorithm.
This algorithm encodes binary data for use in an XML 1.0 document.
It has a fixed 20% overhead (plus some termination bytes).

"""

	)
