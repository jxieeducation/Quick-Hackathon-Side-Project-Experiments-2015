chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.create({'url': chrome.extension.getURL('window.html')}, function(tab) {
  		dumpBookmarks();
	});  
});