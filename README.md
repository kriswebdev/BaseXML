BaseXML - for XML1.0+
=====================

What does it do?
----------------

BaseXML encodes and decodes BINARY DATA for use WITHIN AN XML 1.0 (or above) document.

It has a constant overhead of **20%** (+/- 6 bytes), which is less than Base64's 33% overhead.

The encoded data is [Binary-Safe](http://en.wikipedia.org/wiki/Binary-safe#Binary-safe_file_read_and_write) (BS).

BaseXML doesn't include a decoding checksum but you could easily use one if you need it.

Requirements
------------

Your XML 1.0 (or above) document must use the default UTF-8 content-type, i.e.:
    <?xml version="1.0" encoding="UTF-8" ?>

Your XML parser must respect the XML 1.0 norm (support of the set of UTF-8 characters defined in the norm and not remove characters like tabs or spaces).


Implementations
---------------

<table>
  <tr>
    <th>Implementation name</th><th>Usage</th><th>Supported input/output modes</th><th>Behind-the-scene Technology</th>
  </tr>
  <tr>
    <td><b>BaseXML BS for XML1.0 for C</b></td><td>For C scripts or to get an executable</td><td>FILES</td><td>C functions</td>
  </tr>
  <tr>
    <td><b>BaseXML BS for XML1.0 for Python</b></td><td>For Python scripts</td><td>PYTHON STRINGS</td><td>Python module written in C</td>
  </tr>
</table>


Installation
------------

<table>
  <tr>
    <th>Implementation name</th><th>Install steps</th><th>Usage steps</th>
  </tr>
  <tr>
    <td><b>BaseXML BS for XML1.0 for C</b></td>
    <td>Get the C file. Compile it with GCC (<i>gcc -O3 basexml10.c -o basexml10.exe</i>) or Visual Studio if you want an executable.</td>
    <td>
    From the command line:<br>
    basexml10&nbsp;-e&nbsp;&lt;FileIn&gt;&nbsp;[&lt;FileOut&gt;]<br>
    basexml10&nbsp;-d&nbsp;&lt;FileIn&gt;&nbsp;[&lt;FileOut&gt;]<br>
    Or from a C file:<br>
    static&nbsp;int&nbsp;basexml(&nbsp;"e",&nbsp;char&nbsp;*infilename,&nbsp;char&nbsp;*outfilename&nbsp;);<br>
    static&nbsp;int&nbsp;basexml(&nbsp;"d",&nbsp;char&nbsp;*infilename,&nbsp;char&nbsp;*outfilename&nbsp;);
    </td>
  </tr>
  <tr>
    <td><b>BaseXML BS for XML1.0 for Python</b></td>
    <td>Get the full source folder and run <i>setup.py install</i> from a command line. You need Visual Studio (tested with 2008) or GCC.</td>
    <td>
    From a python *.py file:<br>str&nbsp;=&nbsp;"hello world"<br>
    import basexml<br>
    enc&nbsp;=&nbsp;basexml.encode_string(str)<br>
    dec&nbsp;=&nbsp;basexml.decode_string(enc)</td>
  </tr>
</table>

Author and Licence
------------------

BaseXML algorithm and implementations have been developed by KrisWebDev. The applicable license is MIT license or LGPL license depending on implementations (see source files).
