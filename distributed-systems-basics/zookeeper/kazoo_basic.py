from kazoo.client import KazooClient
from kazoo.client import KazooState
import logging
logging.basicConfig()

zk = KazooClient(hosts='127.0.0.1:2181')
zk.start()


def my_listener(state):
    if state == KazooState.LOST:
    	print "lost connection"
    elif state == KazooState.SUSPENDED:
    	print "suspended connection"
    else:
    	print "connected / reconnected"
#note: there's a small delay
zk.add_listener(my_listener)

#creates a path if doesn't exist
zk.ensure_path("/my/favorite")
zk.ensure_path("/zk-demo")

if zk.exists("/zk-demo/watch-this"):
	data, stat = zk.get("/zk-demo/watch-this")
	print("Version: %s, data: %s" % (stat.version, data.decode("utf-8")))


# locking mechanisms
def acquire(self):
    """Acquire the mutex, blocking until it is obtained"""
    try:
        self.client.retry(self._inner_acquire)
        self.is_acquired = True
    except KazooException:
        # if we did ultimately fail, attempt to clean up
        self._best_effort_cleanup()
        self.cancelled = False
        raise

def _inner_acquire(self):
    self.wake_event.clear()

    # make sure our election parent node exists
    if not self.assured_path:
        self.client.ensure_path(self.path)

    node = None
    if self.create_tried:
        node = self._find_node()
    else:
        self.create_tried = True

    if not node:
        node = self.client.create(self.create_path, self.data,
            ephemeral=True, sequence=True)
        # strip off path to node
        node = node[len(self.path) + 1:]


