var file = sc.textFile("hdfs://127.0.0.1:9000/5000-8.txt")
file.first()
val linesWithSpark = file.filter(line => line.contains("Da")).count()

----------------------
import java.lang.Math
import java.lang.Math

val wordCounts = file.flatMap(line => line.split(" ")).map(word => (word, 1)).reduceByKey((a, b) => a + b)
wordCounts.collect()

wordCounts.cache()
wordCounts.count()
wordCounts.count()

