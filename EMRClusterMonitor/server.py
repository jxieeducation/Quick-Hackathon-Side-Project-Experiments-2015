from flask import Flask
from get_status import getStatus
from datetime import datetime
import json
app = Flask(__name__)
app.config['DEBUG'] = True

@app.route('/')
def dashboard():
	config = open('config.json')
	clusters = json.load(config)
	display = "Cluster statuses: <br><br>"
	for cluster in clusters: 
		startTime = datetime.now()
		display += cluster['name'] + ": "
		display += getStatus(cluster['ip'])
		display += " -- took " + str(datetime.now() - startTime) + "<br>"
	return str(display)

if __name__ == '__main__':
	app.run()
