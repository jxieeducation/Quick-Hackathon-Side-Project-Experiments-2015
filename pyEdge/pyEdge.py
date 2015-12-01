import subprocess
from subprocess import Popen
import time
import os
FNULL = open(os.devnull, 'w')

light_status = "00"

def grip(close, duration):
	if close: 
		return call("01", "00", duration)
	else:
		return call("02", "00", duration)

def wrist(up, duration):
	if up:
		return call("04", "00", duration)
	else:
		return call("08", "00", duration)

def elbow(up, duration):
	if up:
		return call("10", "00", duration)
	else:
		return call("20", "00", duration)

def shoulder(up, duration):
	if up:
		return call("40", "00", duration)
	else:
		return call("80", "00", duration)

def body(left, duration):
	if left:
		return call("00", "01", duration)
	else:
		return call("00", "02", duration)	

def light(on):
	global light_status
	if on:
		light_status = "01"
	else:
		light_status = "00"
	call("00", "00", 0)

def call(first, second, sleep=1):
	Popen(["sudo", "./source", first, second, light_status], stdout=FNULL, stderr=subprocess.STDOUT)
	time.sleep(sleep)
	Popen(["sudo", "./source", "00", "00", light_status], stdout=FNULL, stderr=subprocess.STDOUT)
	return

