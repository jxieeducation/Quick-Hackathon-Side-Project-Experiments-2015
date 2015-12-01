from deepdist import DeepDist
from gensim.models.word2vec import Word2Vec
from pyspark import SparkContext

corpus = sc.textFile('t8').repartition(40).map(lambda s: s.split()) #note we need to repartition before the map
print "\n\npartitioning into %s partitions" % corpus._jrdd.splits().size() #_jrdd's partitions are lazily executed, meaning that we need to do an 'action (e.g. map, count' to activate it

c1, c2 = corpus.randomSplit((0.03, 0.97)) #let's split the corpus into 2 for the moment

def gradient(model, sentences):
    syn0, syn1 = model.syn0.copy(), model.syn1.copy()
    model.train(sentences)
    return {'syn0': model.syn0 - syn0, 'syn1': model.syn1 - syn1}

def descent(model, update):
    print "on master: we just updated the weights"
    model.syn0 += update['syn0']
    model.syn1 += update['syn1']

model = Word2Vec(c1.collect())
print model['night'] # this is the result w/ 3% of the training set
dd = DeepDist(model, '52.32.19.84:5000') # replace w/ cluster ip
dd.start_server()
dd.train(c2, gradient, descent)
print dd.model['night'] # i didn't do most_similar because I think gensim caches the result
