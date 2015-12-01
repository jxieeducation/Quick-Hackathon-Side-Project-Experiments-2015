import sys
from kazoo.client import KazooClient
from kazoo.client import KazooState
import logging
logging.basicConfig()

zk = KazooClient(hosts='127.0.0.1:2181')
zk.start()

from kazoo.exceptions import ConnectionLossException
from kazoo.exceptions import NoAuthException

def my_callback(async_obj):
    try:
        children = async_obj.get()
        print(children)
    except (ConnectionLossException, NoAuthException):
        sys.exit(1)

# Both these statements return immediately, the second sets a callback
# that will be run when get_children_async has its return value
async_obj = zk.get_children_async("/zk-demo")
async_obj.rawlink(my_callback)

