// requires nodejs - used by studio electron & jb-studio-server

op_get_handlers = {};
base_get_handlers = {};
op_post_handlers = {};
file_type_handlers = {};

_iswin = /^win/.test(process.platform);

var settings = JSON.parse(fs.readFileSync('jbart.json'));
// define projects not under /jbart/projects directory
var sites = externalSites() || {};
function externalSites() {
  try { return JSON.parse(fs.readFileSync('sites.json')) } catch (e) {}
}

function projectFolder(project) {
    var site = Object.getOwnPropertyNames(sites).filter(site=>project.indexOf(site+'-') != -1)[0];
    var res = site ? `${sites[site]}/${project.substring(site.length+1)}` : `${settings.http_dir}projects/${project}`;
    return res;
}

// Http server
function serve(req, res) {
   try {
    var url_parts = req.url.split('#')[0].split('?');
    var path = url_parts[0].substring(1); //, query= url_parts[1] && url_parts[1].split('#')[0];
//    console.log(req.url,path);
    var base = path.split('/')[0] || '';
    var file_type = path.split('.').pop();
    var op = getURLParam(req,'op');

    res.setHeader("Access-Control-Allow-Origin", "*");

    if (op && op_get_handlers[op] && req.method == 'GET') {
      return op_get_handlers[op](req,res,path);
    } else if (base_get_handlers[base] && path.indexOf('.html') == -1) {
      return base_get_handlers[base](req,res,path);
    } else if (op && op_post_handlers[op] && req.method == 'POST') {
      var body = '';
      req.on('data', function (data) {
        body += '' + data;
      });
      req.on('end', function () {
        return op_post_handlers[op](req, res,body,path);
      });
    } else if (file_type && file_type_handlers[file_type]) {
      return file_type_handlers[file_type](req,res,path);
    } else {
      endWithFailure(res,'no handler for the request ' + req.url);
    }
   } catch(e) {
      var st = e.stack || '';
      console.log(e)
  }
}

// static file handlers
supported_ext =  ['js','gif','png','jpg','html','xml','css','xtml','txt','json','bmp','woff','jsx','prj','woff2','map','ico'];
for(i=0;i<supported_ext.length;i++)
  file_type_handlers[supported_ext[i]] = function(req, res,path) { serveFile(req,res,path); };

function serveFile(req,res,path) {
  var project = path.match(/^projects\/([^/]*)(.*)/);
  // if (project && external_projects[project[1]])
  //   var full_path = settings.http_dir + external_projects[project[1]] + '/' + project[1] + project[2];
  // else
  var full_path = project ? projectFolder(project[1]) + project[2] : settings.http_dir + path;
//  console.log(path,full_path);
  full_path = full_path.replace(/!st!/,'')

  var extension = path.split('.').pop();

  fs.readFile(_path(full_path), function (err, content) {
    if (err) {
      if (err.errno === 34)
        res.statusCode = 404;
      else
        res.statusCode = 500;
      return endWithFailure(res,'Can not read file ' + full_path + ' ' + err);
    } else {
      fs.stat(_path(full_path), function (err, stat) {
        if (err) {
          res.statusCode = 500;
          return endWithFailure(res,'file status code 500 ' + full_path + ' ' + err);
        } else {
          var etag = stat.size + '-' + Date.parse(stat.mtime);
          res.setHeader('Last-Modified', stat.mtime);

          if (extension == 'json') res.setHeader('Content-Type', 'application/json;charset=utf8');
          if (extension == 'css') res.setHeader('Content-Type', 'text/css');
          if (extension == 'xml') res.setHeader('Content-Type', 'application/xml;charset=utf8');
          if (extension == 'js') res.setHeader('Content-Type', 'application/javascript;charset=utf8');
          if (extension == 'woff') res.setHeader('Content-Type', 'application/x-font-woff');
          if (extension == 'woff2') res.setHeader('Content-Type', 'application/x-font-woff2');

          if (req.headers['if-none-match'] === etag) {
            res.statusCode = 304;
            res.end();
          } else {
            res.setHeader('Content-Length', content.length);
            res.setHeader('ETag', etag);
            res.statusCode = 200;
            res.end(content);
          }
        }
      })
    }
  });
}

extend(op_post_handlers, {
    'saveComp': function(req, res,body,path) {
        var clientReq;
        try {
          clientReq = JSON.parse(body);
        } catch(e) {}
        if (!clientReq)
           return endWithFailure(res,'Can not parse json request');
        //if (!clientReq.original) return endWithFailure(res,'missing original in request');
        if (!clientReq.toSave) return endWithFailure(res,'missing toSave in request');

        var project = getURLParam(req,'project');
        var force = getURLParam(req,'force') == 'true';
        if (!project) return endWithFailure(res,'missing project param in url');
        var comp = getURLParam(req,'comp');
        if (!comp) return endWithFailure(res,'missing comp param in url');
        try {
          endWithSuccess(res,saveComp(clientReq.toSave,clientReq.original,comp,project,force,projectFolder(project),getURLParam(req,'destFileName')))
        } catch (e) {
          endWithFailure(res,e)
        }
    },
    'saveFile': function(req, res,body,path) {
        var clientReq;
        try {
          clientReq = JSON.parse(body);
        } catch(e) {}
        if (!clientReq)
           return endWithFailure(res,'Can not parse json request');
        fs.writeFile(clientReq.Path || '', clientReq.Contents || '' , function (err) {
          if (err)
            endWithFailure(res,'Can not write to file ' + clientReq.Path);
          else
            endWithSuccess(res,'File saved to ' + clientReq.Path);
        });
    },
    createProject: function(req, res,body,path) {
      var clientReq;
      try {
        clientReq = JSON.parse(body);
        if (!clientReq)
           return endWithFailure(res,'Can not parse json request');
        var projDir = 'projects/' + clientReq.project;
        fs.mkdirSync(projDir);
        (clientReq.files || []).forEach(f=>
          fs.writeFileSync(projDir+ '/' + f.fileName,f.content)
        )
      } catch(e) {
        endWithFailure(res,e)
      }
      endWithSuccess(res,'Project Created');
    }
});

extend(base_get_handlers, {
  'project': function(req,res,path) {
      var project_with_params = req.url.split('/')[2];
      var project = project_with_params.split('?')[0];
      // if (external_projects[project])
      //   return file_type_handlers.html(req,res, external_projects[project] + `/${project}/${project}.html`);
      return file_type_handlers.html(req,res,`projects/${project}/${project}.html`);
  }
});

extend(op_get_handlers, {
    'runCmd': function(req,res,path) {
      if (!settings.allowCmd) return endWithFailure(res,'no permission to run cmd. allowCmd in jbart.json');

      var cmd = getURLParam(req,'cmd');
      if (!cmd) return endWithFailure(res,'missing cmd param in url');
      var cwd = getURLParam(req,'dir');
      if (!cwd) return endWithFailure(res,'missing dir param in url');
      cwd += '/';

      child.exec(cmd,cwd ? { cwd: cwd } : {},function (error, stdout, stderr) {
        if (error) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({type:'error', desc:'Can not run cmd', cmd: cmd, stdout: stdout, stderr: stderr, exitcode: error }));
        } else {
          var out = {
            type: 'success',
            outfiles: {},
            stdout: stdout, stderr: stderr
          };
          (getURLParam(req,'outfiles') || '').split(',').forEach(function(outfile) {
              var content = '';
              try { content = '' + fs.readFileSync(outfile); } catch(e) {}
              out.outfiles[outfile] = content;
          });
          res.setHeader('Content-Type', 'application/json; charset=utf8');
          res.end(JSON.stringify(out));
        }
      });
    },
    'ls': function(req,res) {
      var path = getURLParam(req,'path');
      var full_path = settings.http_dir + path;
      res.setHeader('Content-Type', 'application/json; charset=utf8');
      res.end(JSON.stringify({entries: fs.readdirSync(full_path)}));
    },
    'getFile': function(req,res) {
      var path = getURLParam(req,'path');
      var full_path = settings.http_dir + path;
      fs.readFile(_path(full_path), function (err, content) {
        if (err) {
          if (err.errno === 34)
            res.statusCode = 404;
          else
            res.statusCode = 500;
          return endWithFailure(res,'Can not read file ' + full_path + ' ' + err);
        } else {
          res.setHeader('Content-Length', content.length);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/text;charset=utf8');
          res.end(content);
        }
      });
    },
    'download': function(req,res,path) {
      res.writeHead(200, {'Content-Type': 'application/csv', 'Content-disposition': 'attachment; filename=' + path });
      var content = getURLParam(req,'data');
      res.end(content);
    },
    'projects': function(req,res,path) {
      res.end(JSON.stringify({projects: fs.readdirSync('projects')}));
    },
    'gotoSource': function(req,res,path) {
      var comp = getURLParam(req,'comp');
      var files = walk('projects').concat(walk('src'));
      files.filter(x=>x.match(/\.(ts|js)$/))
        .forEach(srcPath=>{
                var source = ('' + fs.readFileSync(srcPath)).split('\n');
                source.map((line,no)=> {
                  if (line.indexOf(`component('${comp}'`) != -1) {
                    var cmd = settings.open_source_cmd + srcPath+':'+(no+1);
                    console.log(cmd);
                    child.exec(cmd,{});
                    endWithSuccess(res,'open editor cmd: ' + cmd);
                  }
                })
        })
    }
});


process.on('uncaughtException', function(err) {
 console.log(err);
});


// *************** utils ***********

function _path(path) { return path.replace(/[\\\/]/g,'/'); }

function getURLParam(req,name) {
  try {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(req.url)||[,""])[1].replace(/\+/g, '%20'))||null;
  } catch(e) {}
}

function endWithFailure(res,desc) {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({type:'error', desc:desc }));
  console.log(desc);
}
function endWithSuccess(res, message) {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({type:'success', message: message}));
}

function extend(object,ext) {
  for(i in ext)
    if (ext.hasOwnProperty(i))
      object[i] = ext[i];
}

function now() {
  var t = new Date();
  return pad(date.getDate()) + '/' + pad(date.getMonth()+1) + '/' + date.getFullYear() + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds())
}
function pad(i) { return i<10?'0'+i:i; }

function walk(dir) {
    var list = fs.readdirSync(dir);
    var results = [];
    list.forEach( file => {
        var full_path = dir + '/' + file;
        var stat = fs.statSync(full_path);
        if (stat && stat.isDirectory())
          results = results.concat(walk(full_path))
        else
          results.push(full_path)
    })
    return results;
}

// reused - functions

function saveComp(toSave,original,comp,project,force,projectDir,destFileName) {
    var projDir = projectDir;

    if (comp.indexOf('studio.') == 0 && project == 'studio-helper')
      projDir = 'projects/studio';

    if (!original) { // new comp
      var srcPath = `${projectFolder(project)}/${destFileName || (project+'.js')}`;
      try {
        var current = '' + fs.readFileSync(srcPath);
        var toStore =  current + '\n\n' + toSave;
        var cleanNL = toStore.replace(/\r/g,'');
        if (_iswin)
          cleanNL = cleanNL.replace(/\n/g,'\r\n');
        fs.writeFileSync(srcPath,cleanNL);
        return `component ${comp} added to ${srcPath}`;
      } catch (e) {
        throw `can not store component ${comp} in path ${srcPath}`
      }
    }

    var comp_found = '';
//        console.log(original);
    fs.readdirSync(projDir)
      .filter(x=>x.match(/\.js$/) || x.match(/\.ts$/))
      .forEach(srcFile=> {
          var srcPath = projDir+'/'+srcFile;
          var source = ('' + fs.readFileSync(srcPath)).replace(/\r/g,'').split('\n');
          var toFind = original.replace(/\r/g,'').split('\n');
          var replaceWith = toSave.replace(/\r/g,'').split('\n');
          var found = findSection(source,toFind,srcFile);
          if (found) {
            //console.log('splice',source,found.index,found.length,replaceWith);
            source.splice.apply(source, [found.index+1, found.length-1].concat(replaceWith.slice(1)));
            var newContent = source.join(_iswin ? '\r\n' : '\n');
            fs.writeFileSync(srcPath,newContent);
            comp_found = `component ${comp} saved to ${srcPath} at ${JSON.stringify(found)}`;
          }
      })

    if (comp_found)
      return comp_found
    else
      throw `Can not find component ${comp} in project`;

    function findSection(source,toFind,srcFile) {
      var index = source.indexOf(toFind[0]);
      // if (index == -1)
      //   index = source.indexOf(toFind[0].replace('jb_','jb.'));
      if (index != -1 && force) {// ignore content - just look for the end
        for(end_index=index;end_index<source.length;end_index++)
          if ((source[end_index]||'').match(/^}\)$/m))
            return { index: index, length: end_index - index +1}
      } else if (index != -1 && compareArrays(source.slice(index,index+toFind.length),toFind)) {
          return { index: index, length: toFind.length }
      } else if (index == -1) {
        return false;
      } else {
        // calc error message
        var err = '';
        var src = source.slice(index,index+toFind.length);
        console.log('origin not found at file ' + srcFile);
        src.forEach(l=>console.log(l));
        toFind.forEach((line,index) => {
          if (line != src[index])
            console.log(index + '-' +line + '#versus source#' + src[index]);
        })

        throw `${comp} found with a different source, use "force save" to save. ${err}`;
      }
    }
    function compareArrays(arr1,arr2) {
      return arr1.join('\n') == arr2.join('\n')
    }
}
