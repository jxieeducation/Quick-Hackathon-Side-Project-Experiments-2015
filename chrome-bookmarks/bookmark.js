document.addEventListener('DOMContentLoaded', function () {
  dumpBookmarks();
});

function dumpBookmarks() {
  var bookmarkTreeNodes = chrome.bookmarks.getTree(
    function(bookmarkTreeNodes) {
      $('#bookmarks').append(dumpTreeNodes(bookmarkTreeNodes));
    });
}

function dumpTreeNodes(bookmarkNodes) {
  var list = $('<ul>');
  var i;
  for (i = 0; i < bookmarkNodes.length; i++) {
    list.append(dumpNode(bookmarkNodes[i]));
  }
  return list;
}

function dumpNode(bookmarkNode) {
  if (bookmarkNode.children && bookmarkNode.children.length > 0)
  {
    console.log(bookmarkNode.title);
    var li = $('<li>' + bookmarkNode.title + '</li>');
    li.append(dumpTreeNodes(bookmarkNode.children));
    return li;
  }
  else 
  {
    return $('<li>' + bookmarkNode.url +'</li>');
  }
}
