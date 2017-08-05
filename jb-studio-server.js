fs = require('fs');
vm = require('vm');
os = require('os');
http = require('http');
child = require('child_process');
url = require('url');
ns_url = require('url');
ns_querystring = require('querystring');

vm.runInThisContext(fs.readFileSync('projects/studio/studio-server.js'),'studio-server.js');

http.createServer(serve).listen(settings.port);
console.log('open studio with http://localhost:' + settings.port + '/project/studio/material-demo/');
