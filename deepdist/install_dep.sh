sudo pip install numpy flask gensim

wget http://ocw.mit.edu/ans7870/6/6.006/s08/lecturenotes/files/t8.shakespeare.txt
mv t8.shakespeare.txt t8
hadoop fs -put t8 /user/hadoop
