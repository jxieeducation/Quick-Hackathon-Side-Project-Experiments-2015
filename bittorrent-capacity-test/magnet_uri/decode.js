var magnet = require('/usr/lib/node_modules/magnet-uri')

// "Leaves of Grass" by Walt Whitman
var uri = 'magnet:?xt=urn:btih:d2474e86c95b19b8bcfdb92bc12c9d44667cfa36&dn=Leaves+of+Grass+by+Walt+Whitman.epub&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Ftracker.publicbt.com%3A80&tr=udp%3A%2F%2Ftracker.istole.it%3A6969&tr=udp%3A%2F%2Ftracker.ccc.de%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337'

var parsed = magnet.decode(uri)
console.log(parsed)
console.log(parsed.dn) // "Leaves of Grass by Walt Whitman.epub"
console.log(parsed.infoHash) // "d2474e86c95b19b8bcfdb92bc12c9d44667cfa36"
