""" pyspark --driver-memory 10g """
from pyspark.sql import SQLContext

sqlContext = SQLContext(sc)
df = sqlContext.jsonFile("file:///home/jason/Desktop/Quick-Hackathon-Side-Project-Experiments-2015/appstore-data-analysis/android_reviews.dump")