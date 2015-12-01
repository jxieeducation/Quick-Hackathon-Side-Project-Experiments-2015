#!/bin/bash
#
# paramter: 
# build - install the node dependency 
# run - start the server
# 
#

if [ "$1" = "build" ]
then
	npm install mongoose express
elif [ "$1" = "db" ]
then
	mongod --dbpath db/
elif [ "$1" = "run" ]
then 
	node server.js
fi
