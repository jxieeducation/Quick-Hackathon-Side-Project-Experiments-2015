#!/usr/bin/env python
 
import platform
import socket
import time
from datetime import datetime

CARBON_SERVER = '0.0.0.0'
CARBON_PORT = 2003
DELAY = 1  # secs
metric = 'foo.foo.foo'


def get_load():
    return str(datetime.now().minute)

def send_msg(message):
    print 'sending message:\n%s' % message
    sock = socket.socket()
    sock.connect((CARBON_SERVER, CARBON_PORT))
    sock.sendall(message)
    sock.close()


if __name__ == '__main__':
    node = platform.node().replace('.', '-')
    while True:
        timestamp = int(time.time())
        message = '%s %s %d\n' % (metric, get_load(), timestamp)
        send_msg(message)
        time.sleep(DELAY)
