#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""

AUTO TRANSPOSER

PURPOSE          : Auto Transposer is C code generator for simple
                   encoding/decoding algorithms based on bits
				   condition and transposition.

AUTHOR           :  KrisWebDev

LICENSE          :  Open source under the MIT License

USAGE            :
- This script was just intended to construct BaseXML code in
  au automatic way. You may or may not use it at your own risks.
  It is provided as is, without documentation and without support.
- Usage is simple, just change the:
      inpstr.append("0000EFGH IJKLM00P QRST**** ********")
      outstr.append("0010PEFG 01HIJKLM 0010QRST ********")
  by whatever you want the bit transposition to be and you MAY
  have a running C converter code (just the "core" algorithm
  script indeed).

"""

# This codes the C code condition
def code_condition( target_space, reference_space = None, do_not = False, begin="if (", end=") {" ):

	target = target_space.replace (" ", "")
	if reference_space:
		reference_cond = reference_space.replace (" ", "")
		
	mask = 0
	cond = 0
	left_cond = ""
	right_cond = ""
	
	for target_ind, target_char in enumerate(target):
		if target_char == "1" and reference_cond[target_ind] != "*":
			mask |= 0x1 << (len(target)-1-target_ind)
			cond |= 0x1 << (len(target)-1-target_ind)
			if reference_space: left_cond  += reference_cond[target_ind]
			right_cond += target_char
		elif target_char == "0" and reference_cond[target_ind] != "*":
			mask |= 0x1 << (len(target)-1-target_ind)
			if reference_space: left_cond  += reference_cond[target_ind]
			right_cond += target_char

	if cond == 0:
		if do_not:
			ret  = tabs[0:-1]+begin+" input & 0x%08x"%mask+" "+end
		else:
			ret  = tabs[0:-1]+begin+" !( input & 0x%08x"%mask+" ) "+end
	else:
		if do_not:
			ret  = tabs[0:-1]+begin+" !( ( input & 0x%08x"%mask+" ) == 0x%08x"%cond+" ) "+end
		else:
			ret  = tabs[0:-1]+begin+" ( input & 0x%08x"%mask+" ) == 0x%08x"%cond+" "+end
	
	if do_not:
		symb = "!="
	else:
		symb = "=="
	
	retlen = len(ret)
	
	if reference_space is not None:
		ret+= " // "+left_cond+" "+symb+" "+right_cond
	else:
		ret+=" // "+symb+" "+target_space
	
	
	if len(right_cond) == 0:
		return ""
	else:
		return ret+"\n"


# This codes the C enconder/decoder algorithm
def code_coder( inpstr, outstr, decode = False ):
	inp = inpstr.replace (" ", "")
	out = outstr.replace (" ", "")

	start = -1
	inlen = len(inp)

	shift = 0
	hexfilter = 0x00000000

	code = ""

	encoder_code = ""
	decoder_code = ""
	
	# Code condition first
	encoder_code = code_condition(inpstr, reference);
	decoder_code = code_condition(outstr, reference);
	
	# Use readable padding form
	# ("0x%08x"%hexfilter)
	# OR for unlimited form
	# hex(hexfilter)

	# 0/1's

	hexstart = 0
	for out_ind, out_char in enumerate(out):
		if out_char == "1":
			hexstart |= 0x1 << (len(out)-1-out_ind)

	unhexstart = 0
	for in_ind, in_char in enumerate(inp):
		if in_char == "1":
			unhexstart |= 0x1 << (len(inp)-1-in_ind)

			
	encoder_code += tabs+"    output  = "+("0x%08x"%hexstart)+"; // "+outstr+"\n"
	if unhexstart != 0:
		decoder_code += tabs+"    output  = "+("0x%08x"%unhexstart)+"; // "+outstr+"\n"

	in_ind = 0
	in_max = len(inp)-1
	out_ind = 0
	out_max = len(out)-1

	# Letters

	while out_ind <= out_max:
		out_char = out[out_ind]
		# print '<< LOOP OUT ', out_ind, '[', out_char, ']'
		if start == -1:
			hexfilter = 0x00000000 # no!
			in_ind=0 # no!
		while in_ind <= in_max:
			# print '>> LOOP IN ', in_ind
			in_char = inp[in_ind]
			if start == -1 and out_char==in_char and out_char!="0" and out_char!="1" and out_char!="*": # starting point found
				# print '>  MATCH out',out_char,':',out_ind,' in',in_char,':',in_ind,''
				start=in_ind
				shift=out_ind-in_ind
				hexfilter |= 0x1 << (len(out)-1-in_ind)
				in_ind+=1
				break
			elif start != -1 and out_char==in_char and not (out_char=="0" or out_char=="1" or out_char=="*"): #continuation or end of string
					hexfilter |= 0x1 << (len(out)-1-in_ind)
					if in_ind == in_max or out_ind == out_max or out_char=="0" or out_char=="1": # end of string => write code
						# print 'Code EOS for [', start, in_ind, ']'
						shift_code = ""
						unshift_code = ""
						unhexfilter = hexfilter
						if shift > 9:
							shift_code   = " >> "+str(shift)
							unshift_code = " << "+str(shift)
							unhexfilter = hexfilter >> shift
						elif shift < -9:
							shift_code   = " << "+str(-shift)
							unshift_code = " >> "+str(shift)
							unhexfilter = hexfilter << -shift
						elif shift > 0:
							shift_code   = " >>  "+str(shift)
							unshift_code = " <<  "+str(shift)
							unhexfilter = hexfilter >> shift
						elif shift < 0:
							shift_code   = " <<  "+str(-shift)
							unshift_code = " >>  "+str(-shift)
							unhexfilter = hexfilter << -shift
						encoder_code += tabs+"    output |= (input & " +  ("0x%08x"%hexfilter  ) + ")" + shift_code + "; // "+ inp[start:in_ind+1]+"\n"
						decoder_code += tabs+"    output |= (input & " +  ("0x%08x"%unhexfilter) + ")" + unshift_code + "; // "+ inp[start:in_ind+1]+"\n"
						start=-1
						break
					else:
						# print 'continuation'
						in_ind+=1
						break
			elif start != -1 and (out_char!=in_char or out_char=="0" or out_char=="1" or out_char=="*"): #abort continuation => write code
				# print 'Code for [', start, in_ind-1, ']'
				shift_code = ""
				unshift_code = ""
				unhexfilter = hexfilter
				if shift > 9:
					shift_code   = " >> "+str(shift)
					unshift_code = " << "+str(shift)
					unhexfilter = hexfilter >> shift
				elif shift < -9:
					shift_code   = " << "+str(-shift)
					unshift_code = " >> "+str(-shift)
					unhexfilter = hexfilter << -shift
				elif shift > 0:
					shift_code   = " >>  "+str(shift)
					unshift_code = " <<  "+str(shift)
					unhexfilter = hexfilter >> shift
				elif shift < 0:
					shift_code   = " <<  "+str(-shift)
					unshift_code = " >>  "+str(-shift)
					unhexfilter = hexfilter << -shift
				encoder_code += tabs+"    output |= (input & " +  ("0x%08x"%hexfilter  ) + ")" + shift_code + "; // "+ inp[start:in_ind+0]+"\n"
				decoder_code += tabs+"    output |= (input & " +  ("0x%08x"%unhexfilter) + ")" + unshift_code + "; // "+ inp[start:in_ind+0]+"\n"
				start=-1
				in_ind=0 # look back for this character's position
				out_ind-=1 # look back for this character's position
				break
			in_ind+=1
		out_ind+=1
	if decode:
		return decoder_code
	else:
		return encoder_code
		


inpstr = []
outstr = []
names  = []

tabs = "\t\t\t"

reference =   "ABCDEFGH IJKLMNOP QRST**** ********"

# CODERS
# Just choose what you want to convert to what
# And in the right order (more specific to catch-all, even tho it's not optimized)

# Case ILLEGAL<>_BOTH I3
#   Special encode 2 illegal among < >
names.append("// Case ILLEGAL<>_BOTH I3")
print tabs[0:-1]+names[-1]
#              ABCDEFGH IJKLMNOP QRST
inpstr.append("ABCDEF01 111L0011 11S0**** ********")
outstr.append("001110LS 01ABCDEF 01000000 ********")
#outstr = "001110LS 01ABCDEF 01****** 00000000" indeed
print (code_coder ( inpstr[-1] , outstr[-1] ))[0:-1]
print tabs[0:-1]+"} else "


# Case ILLEGAL<>_LEFT I1
#   Special encode 1 illegal among < >
#   D1 = E1 where 0GHIJKLM only is illegal (ie = 0011 11X0) (GHIJK M=001111 0)
#   01ABCDEF & 0NOPQRST & ill symbol to encode
names.append("// Case ILLEGAL<>_LEFT I1")
print tabs[0:-1]+names[-1]
inpstr.append("ABCDEF01 111L0NOP QRST**** ********")
outstr.append("001100LT 01ABCDEF 01NOPQRS ********")
print (code_coder ( inpstr[-1] , outstr[-1] ))[0:-1]
print tabs[0:-1]+"} else "


# Case ILLEGAL<>_RIGHT I2
#   Special encode 1 illegal among < >
#   D2 = E1 where 0NOPQRST only is illegal (ie = 0011 11X0) (NOPQR T=001111 0)
#   01ABCDEF & 0GHIJKLM & ill symbol to encode
names.append("// Case ILLEGAL<>_RIGHT I2")
print tabs[0:-1]+names[-1]
inpstr.append("ABCDEFGH IJKLM011 11S0**** ********")
outstr.append("001101SM 01ABCDEF 01GHIJKL ********")
print (code_coder ( inpstr[-1] , outstr[-1] ))[0:-1]
print tabs[0:-1]+"} else "


print code_condition("******00 ******** ******** ********",
                     "ABCDEFGH IJKLMNOP QRST**** ********", True, "if (", " && ")
print code_condition("******** *****00* ******** ********",
                     "ABCDEFGH IJKLMNOP QRST**** ********", True, "")

#tabs = "\t\t\t"
					 
# GH != 00 && NO != 00:
names.append("// Case STANDARD E1")
print tabs[0:-1]+names[-1]
inpstr.append("ABCDEFGH IJKLMNOP QRST**** ********")
outstr.append("01ABCDEF 0GHIJKLM 0NOPQRST ********")
print (code_coder ( inpstr[-1] , outstr[-1] ))[0:-1]
#print "\t\t}"

#tabs = "\t\t"
print tabs[0:-1]+"} else "

# Case CONTROL_CHARS_LEFT_CANONICAL E5
#   ABCD == 0000 and GH==00
names.append("// Case CONTROL_CHARS_LEFT_CANONICAL E5 : ABCD==0000 and GH==00")
print tabs[0:-1]+names[-1]
inpstr.append("0000EF00 IJKLMNOP QRST**** ********")
outstr.append("0010EFIJ 0010KLMN 01OPQRST ********")
print (code_coder ( inpstr[-1] , outstr[-1] ))[0:-1]
print tabs[0:-1]+"} else "


# Case CONTROL_CHARS_RIGHT_CANONICAL E6
#   ABCD == 0000 and NO==00
names.append("// Case CONTROL_CHARS_RIGHT_CANONICAL E6 : ABCD==0000 and NO==00")
print tabs[0:-1]+names[-1]
inpstr.append("0000EFGH IJKLM00P QRST**** ********")
outstr.append("0010PEFG 01HIJKLM 0010QRST ********")
print (code_coder ( inpstr[-1] , outstr[-1] ))[0:-1]
print tabs[0:-1]+"} else "


# GH==00 && NO==00
names.append("// Case CONTROL_CHARS_BOTH E2")
print tabs[0:-1]+names[-1]
inpstr.append("ABCDEF00 IJKLM00P QRST**** ********")
outstr.append("0010ABCD 01EFIJKL 01MPQRST ********")
print (code_coder ( inpstr[-1] , outstr[-1] ))[0:-1]
print tabs[0:-1]+"} else "


# GH==00
names.append("// Case CONTROL_CHARS_LEFT E3")
print tabs[0:-1]+names[-1]
inpstr.append("ABCDEF00 IJKLMNOP QRST**** ********")
outstr.append("0NOPQRST 110ABCDE 10MFIJKL ********")
print (code_coder ( inpstr[-1] , outstr[-1] ))[0:-1]
print tabs[0:-1]+"} else "

# NO == 00
names.append("// Case CONTROL_CHARS_RIGHT E4")
print tabs[0:-1]+names[-1]
inpstr.append("ABCDEFGH IJKLM00P QRST**** ********")
outstr.append("110ABCDE 10FPQRST 0GHIJKLM ********")
print (code_coder ( inpstr[-1] , outstr[-1] ))[0:-1]
print tabs[0:-1]+"} else "



# Termination
names.append("// Short Termination sequence T1 (REMOVE FROM SCRIPT - HANDLE ELSEWHERE)")
print tabs[0:-1]+names[-1]
inpstr.append("ABCDEFGH IJKLMNOP QRST**** ********")
outstr.append("00111111 0011**** 00111111 ********")
#outstr = "001110LS 01ABCDEF 01****** 00000000" indeed
print (code_coder ( inpstr[-1] , outstr[-1] ))[0:-1]


# Termination:
# 0011.1111 0011.[len(restricted)] 0011.1111


# DECODERS

print "\n"*3

print "// DECODERS"
 
print "\n"*3

for key, name in enumerate(names):
	print tabs[0:-1]+("} else " if key > 0 else "")
	print tabs[0:-1]+name+" DECODE"
	print (code_coder(inpstr[key], outstr[key], True))[0:-1]
print tabs+"}"

