(function() {
var _window = window.parent || window;
if (!_window || !_window.require) return;
var elec_remote = _window.require('electron').remote;
var fs = elec_remote.require('fs');

var fsCache = {}

function getFromCache(entry,time,dataFunc) {
  if (!fsCache[entry] || fsCache[entry].time < time)
    fsCache[entry] = { time: time, content: dataFunc() } ;
  return fsCache[entry].content;
}

function funcWrapper(func,directory,fileName) {
  try {
    return fileName && fs[func+'Sync']( (directory ? (directory +'/'): '') + fileName)
  } catch(e) { jb.logException(e) }
}

function lastModified(directory,fileName) {
  try {
    return funcWrapper('stat',directory,fileName).mtime.getTime()
  } catch (e) {
    return 0;
  }
}

//fs = require('electron').remote.require('fs')

jb.component('fs.readFile', {
  params: [
  	{ id: 'fileName', as: 'string', mandatory: true },
  	{ id: 'directory', as: 'string' },
  ],
  impl: (ctx,fileName,directory) =>
    getFromCache(directory+'/'+fileName,lastModified(directory,fileName),
      _=> {
        var x= funcWrapper('readFile',directory,fileName).toString('utf8');
      return x;
      })
})

jb.component('fs.stat', {
  params: [
  	{ id: 'fileName', as: 'string', mandatory: true },
  	{ id: 'directory', as: 'string' },
  ],
  impl: (ctx,fileName,directory) =>
    funcWrapper('stat',directory,fileName)
})

jb.component('fs.readdir', {
  params: [
  	{ id: 'directory', as: 'string', mandatory: true },
  ],
  impl: (ctx,directory) =>
    getFromCache(directory,lastModified(directory,''), _=>
      funcWrapper('readdir','',directory))
})

jb.component('fs.directoryContent', {
  description: 'returns all files content and properties',
  params: [
  	{ id: 'directory', as: 'string', mandatory: true },
    { id: 'filter', as: 'boolean', defaultValue: true, dynamic: true },
  ],
  impl: (ctx,directory) => {
    try {
      var entries = funcWrapper('readdir','',directory) || [];
      return entries;
    } catch(e) { jb.logException(e); return [] }
  }

})

})()
