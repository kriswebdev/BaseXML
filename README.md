BaseXML - for XML1.0+
=====================

What does it do?
----------------

BaseXML encodes and decodes BINARY DATA for use WITHIN AN XML 1.0+ document.

It has a constant overhead of **20%** (+/- 6 bytes), which is less than Base64. The encoded data is [Binary-Safe](http://en.wikipedia.org/wiki/Binary-safe#Binary-safe_file_read_and_write) (BS).

BaseXML doesn't include a decoding checksum.

Requirements
------------

Your XML 1.0 (or above) document must use the default UTF-8 content-type, i.e.:
    <?xml version="1.0" encoding="UTF-8" ?>

Your XML parser must respect the XML 1.0 norm (support of the set of UTF-8 characters defined in the norm and not remove characters like tabs or spaces).


Implementations
---------------

<table>
  <tr>
    <th>Implementation name</th><th>Uage</th><th>Supported input/output modes</th><th>Behind-the-scene Technology</th>
  </tr>
  <tr>
    <td><b>BaseXML BS for XML1.0 for C</b></td><td>For C scripts</td><td>FILES</td><td>C functions</td>
  </tr>
  <tr>
    <td><b>BaseXML BS for XML1.0 for Python</b></td><td>For Python scripts</td><td>PYTHON STRINGS</td><td>Python module written in C</td>
  </tr>
</table>


Author and Licence
------------------

BaseXML algorithm and implementations have been developed by KrisWebDev. Implementations are under MIT or LGPL licenses depending on implementations (see source files).
