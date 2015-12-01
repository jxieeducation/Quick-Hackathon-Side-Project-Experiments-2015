import urllib2

def analyzeHTML(html):
	is_running = "free"
	count = 0
	while """["<a href='""" in html:
		html = html[html.index("""["<a href='"""):]
		segment = html[:html.index("""</a>"]""")]
		html = html[10:]
		if "RUNNING" in segment:
			is_running = "running"
		count += 1
		if count == 10000:
			break
	return is_running

def getStatus(ip):
	url = "http://" + ip + ":9026/cluster"
	try: 
		req = urllib2.Request(url)
		response = urllib2.urlopen(req, timeout=3)
	except:
		return "offline"
	html = response.read()
	return analyzeHTML(html)
