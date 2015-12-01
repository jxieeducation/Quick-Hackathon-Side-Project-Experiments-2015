import copy
import cPickle as pickle
from multiprocessing import Process
from rwlock import RWLock
import socket
import sys
from threading import Thread
import urllib2
import urlparse

"""Lightning-Fast Deep Learning on Spark
"""
class DeepDist:
    def __init__(self, model, master='127.0.0.1:5000', min_updates=0, max_updates=4096):
        """DeepDist - Distributed deep learning.
        :param model: provide a model that can be trained in parallel on the workers
        """
        self.model  = model
        self.lock   = RWLock()
        self.descent  = lambda model, gradient: model
        self.master   = master
        self.state    = 'serving'
        self.served   = 0
        self.received = 0
        #self.server   = None
        self.pmodel   = None
        self.min_updates = min_updates
        self.max_updates = max_updates

    def start_server(self):
        Thread(target=self.start).start()

    def start(self):
        from flask import Flask, request

        app = Flask(__name__)

        @app.route('/')
        def index():
            return 'DeepDist'

        @app.route('/model', methods=['GET', 'POST', 'PUT'])
        def model_flask():
            i = 0
            while (self.state != 'serving' or self.served >= self.max_updates) and (i < 1000):
                time.sleep(1)
                i += 1

            # pickle on first read
            pmodel = None
            self.lock.acquire_read()
            if not self.pmodel:
                self.lock.release()
                self.lock.acquire_write()
                if not self.pmodel:
                    self.pmodel = pickle.dumps(self.model, -1)
                self.served += 1
                pmodel = self.pmodel
                self.lock.release()
            else:
                self.served += 1
                pmodel = self.pmodel
                self.lock.release()
                print "model replica weights were updated via /model"
            return pmodel
    

        @app.route('/update', methods=['GET', 'POST', 'PUT'])
        def update_flask():
            gradient = pickle.loads(request.data)

            self.lock.acquire_write()
            if self.min_updates <= self.served:
                state = 'receiving'
            self.received += 1
            
            old_syn0, old_syn1 = self.model.syn0.copy(), self.model.syn1.copy()
            print "received gradient: " + str(gradient) 
            
            self.descent(self.model, gradient)
            
            if self.received >= self.served and self.min_updates <= self.received:
                self.received = 0
                self.served   = 0
                self.state    = 'serving'
                self.pmodel = None
            
            self.lock.release()
            print "server weights were updated by model replica"
            print "old weights: "
            print old_syn0[0:3, 0:3], old_syn1[0:3, 0:3] #printing just the first few weights
            print "new weights: "
            print self.model.syn0[0:3, 0:3], self.model.syn1[0:3, 0:3]
            return 'OK'
        
        print 'Listening to 0.0.0.0:5000...'
        app.run(host='0.0.0.0', debug=True, threaded=True, use_reloader=False)

    def train(self, rdd, gradient, descent):
        master = self.master
        print '\n*** Master: %s\n' % master

        self.descent = descent

        def mapPartitions(data):
            return [send_gradient(gradient(fetch_model(master=master), data), master=master)]
        
        return rdd.mapPartitions(mapPartitions).collect()

def fetch_model(master='localhost:5000'):
    request = urllib2.Request('http://%s/model' % master,
        headers={'Content-Type': 'application/deepdist'})
    return pickle.loads(urllib2.urlopen(request).read())

def send_gradient(gradient, master='localhost:5000'):
    if not gradient:
          return 'EMPTY'
    request = urllib2.Request('http://%s/update' % master, pickle.dumps(gradient, -1),
        headers={'Content-Type': 'application/deepdist'})
    return urllib2.urlopen(request).read()
