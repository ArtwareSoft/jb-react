var _window = window.parent || window;
var elec_remote = _window.require('electron').remote;
var fs = elec_remote.require('fs');

//fs = require('electron').remote.require('fs')

jb.component('fs.readFile', {
  params: [
  	{ id: 'fileName', as: 'string', essential: true },
  	{ id: 'folder', as: 'string' },
  ],
  impl: (ctx,fileName,folder) =>
  	''+ fs.readFileSync((folder ? (folder +'/'): '') +fileName)
})
