fs = require('fs');
http = require('http');
child = require('child_process');
const fetch = require('node-fetch');

file_type_handlers = {};

_iswin = /^win/.test(process.platform);

let settings = { 
  port: 8083, open_source_cmd_vsCode: 'code -r -g', http_dir: './', exclude: 'node_modules|\.git', verbose: getProcessArgument('verbose'),
  OPENAI_TEST_API_KEY: process.env.OPENAI_TEST_API_KEY
}

try {
  Object.assign(settings,JSON.parse(fs.readFileSync('./jbart.json')))
  if (settings.verbose) console.log('settings',settings)
} catch(e) {}

// define projects not under /jbart/projects directory
let repos = {}
try { repos = JSON.parse(fs.readFileSync(`./repos.json`)) } catch (e) {}

const projectstDir = settings.devHost ? 'projects' : './'
const rootName = process.cwd().split('/').pop().split('\\').pop()
const jbReactDir = fs.existsSync('node_modules/jb-react/') ? 'node_modules/jb-react/' : './'

function projectDirectory(project) {
    const repo = Object.keys(repos).filter(repo=>project.indexOf(repo+'-') != -1)[0]
    const res = repo ? `${repos[repo]}/${project.substring(repo.length+1)}` : `${settings.http_dir}${projectstDir}/${rootName == project ? '' : project}`;
    return res
}

function unRepo(path) {
  return Object.keys(repos).reduce((res,k) => res.indexOf(repos[k]) == 0 ? `/${k}${res.split(repos[k]).pop()}` : res, path)
}

function calcFullPath(path) {
  if (Object.keys(repos).indexOf(path.split('/')[0]) != -1) {
    const repo = path.split('/')[0]
    return [repos[repo], ...path.split('/').slice(1)].join('/')
  }
  if (Object.keys(repos).indexOf(path.split('/')[1]) != -1 && path.split('/')[0] == '.') {
    const repo = path.split('/')[1]
    return [repos[repo], ...path.split('/').slice(2)].join('/')
  }

  const project_match = path.match(/^projects\/([^/]*)(.*)/);
  if (project_match)
    return projectDirectory(project_match[1]) + project_match[2]
  if (!settings.devHost) {
    const bin_match = path.match(/^bin\/(.*)/);
    if (bin_match)
        return `${jbReactDir}bin/${bin_match[1]}`
    const dist_match = path.match(/^dist\/(.*)/);
    if (dist_match)
        return `${jbReactDir}dist/${dist_match[1]}`
  }
  return settings.http_dir + path;
}

// Http server
function serve(req, res) {
   try {
    const url_parts = req.url.split('#')[0].split('?');
    const path = url_parts[0].substring(1); //, query= url_parts[1] && url_parts[1].split('#')[0];
//    console.log(req.url,path);
    const base = path.split('/')[0] || '';
    const file_type = path.split('.').pop();
    const op = getURLParam(req,'op');

    res.setHeader("Access-Control-Allow-Origin", "*");

    if (op && op_get_handlers[op] && req.method == 'GET') {
      return op_get_handlers[op](req,res,path);
    } else if (path.indexOf('studio') == 0 && base_get_handlers[base] && path.indexOf('.html') != -1) {
      return base_get_handlers[base](req,res,path);
    } else if (base_get_handlers[base] && path.indexOf('.html') == -1) {
      return base_get_handlers[base](req,res,path);
    } else if (op && op_post_handlers[op] && req.method == 'POST') {
      let body = '';
      req.on('data', data => {
        body += '' + data;
      });
      req.on('end', () => 
        op_post_handlers[op](req, res,body,path)
      )
    } else if (file_type && file_type_handlers[file_type]) {
      return file_type_handlers[file_type](req,res,path);
    } else {
      endWithFailure(res,'no handler for the request ' + req.url);
    }
   } catch(e) {
      console.log(e)
  }
}

// static file handlers
supported_ext =  ['js','gif','png','jpg','webp','html','xml','css','xtml','txt','json','bmp','woff','jsx','prj','woff2','ttf','map','ico','svg','wasm'];
for(i=0;i<supported_ext.length;i++)
  file_type_handlers[supported_ext[i]] = function(req, res,path) { serveFile(req,res,path); };

function serveFile(req,res,path,_try = 0) {
//  console.log(path,full_path)
  const full_path = calcFullPath(path).replace(/![^!]+!/,'')
  const extension = path.split('.').pop()
  if (settings.verbose) console.log('reading file ',full_path)

  fs.stat(_path(full_path), (err, stat) => {
    if (err) {
      res.statusCode = 500
      return endWithFailure(res,'file status code 500 ' + full_path + ' ' + err)
    } else {
      res.setHeader('Cache-Control','max-age: 0, must-revalidate,no-cache')
      const etag = stat.size + '-' + Date.parse(stat.mtime)
      res.setHeader('Last-Modified', stat.mtime)

      if (extension == 'json') res.setHeader('Content-Type', 'application/json;charset=utf8')
      if (extension == 'css') res.setHeader('Content-Type', 'text/css')
      if (extension == 'xml') res.setHeader('Content-Type', 'application/xml;charset=utf8')
      if (extension == 'js') res.setHeader('Content-Type', 'application/javascript;charset=utf8')
      if (extension == 'woff') res.setHeader('Content-Type', 'application/x-font-woff')
      if (extension == 'woff2') res.setHeader('Content-Type', 'application/x-font-woff2')
      if (extension == 'ttf') res.setHeader('Content-Type', 'application/x-font-ttf')
      if (extension == 'svg') res.setHeader('Content-Type', 'image/svg+xml')
      
      if (req.headers['if-none-match'] === etag) {
        console.log(`return 304 for ${full_path}`)
        res.statusCode = 304
        res.end()
      } else {
        console.log('serving content',full_path,req.headers['if-none-match'],etag)
        fs.readFile(_path(full_path), (err, content) => {
          if (content == '')
            console.log(`suspecious empty content for ${full_path}, try ${_try}`)

          if (err) {
            if (err.errno === 34)
              res.statusCode = 404
            else
              res.statusCode = 500
            return endWithFailure(res,'Can not read file ' + full_path + ' ' + err)
          } else {
            res.setHeader('Content-Length', Buffer.byteLength(content, 'utf8'))
            res.setHeader('ETag', etag)
            res.statusCode = 200
            res.end(content)
          }
        })
      }
    }
  })
}

//   fs.readFile(_path(full_path), function (err, content) {
//     //console.log('concurrent_reads',concurrent_reads)
//     if (content == '')
//       console.log(`suspecious empty content for ${full_path}, try ${_try}`)
//     if (err) {
//       if (err.errno === 34)
//         res.statusCode = 404;
//       else
//         res.statusCode = 500;
//       return endWithFailure(res,'Can not read file ' + full_path + ' ' + err);
//     } else {
//       if (content == '' && _try < 4) {
//         console.log(`suspecious empty content for ${full_path}, try ${_try}`)
//         return serveFile(req,res,path,_try+1)
//       }
//   });
// }

const op_post_handlers = {
    saveComp: function(req, res,body,path) {
        let clientReq;
        try {
          clientReq = JSON.parse(body);
        } catch(e) {}
        if (!clientReq)
           return endWithFailure(res,'Can not parse json request');
        //if (!clientReq.original) return endWithFailure(res,'missing original in request');
        if (!clientReq.toSave) return endWithFailure(res,'missing toSave in request');

        const project = getURLParam(req,'project');
        const force = getURLParam(req,'force') == 'true';
        if (!project) 
          return endWithFailure(res,'missing project param in url');
        const comp = getURLParam(req,'comp');
        if (!comp) 
          return endWithFailure(res,'missing comp param in url');
        try {
          endWithSuccess(res,saveComp(clientReq.toSave,clientReq.original,comp,project,force,projectDirectory(project),getURLParam(req,'destFileName')))
        } catch (e) {
          endWithFailure(res,e)
        }
    },
    saveFile: function(req, res,body) {
        let clientReq;
        try {
          clientReq = JSON.parse(body);
        } catch(e) {}
        if (!clientReq)
           return endWithFailure(res,'Can not parse json request');
        const path = calcFullPath(clientReq.Path) // settings.http_dir + _path(clientReq.Path)
        fs.writeFile(path || '', clientReq.Contents || '' , function (err) {
          if (err)
            endWithFailure(res,'Can not write to file ' + path);
          else
            endWithSuccess(res,'File saved to ' + path);
        })
    },
    jb: (req,res,body) => {
      const args = JSON.parse(body)
      const command = `node --inspect-brk=7001 ../hosts/node/jb.js ${args.map(arg=> 
        (arg.indexOf("'") != -1 ? `"${arg.replace(/"/g,`\\"`).replace(/`/g,"\\`").replace(/\$/g,'\\$')}"` : `'${arg}'`)).join(' ')}`
      writeToCmdLog('./temp/lastCmd', command)

      const sourceCode = args.filter(x=>x.match(/^-sourceCode/)).map(x=>encodeURIComponent(x.slice('-sourceCode:'.length)))[0]
      const runCtx = args.filter(x=>x.match(/^-runCtx/)).map(x=>encodeURIComponent(x.slice('-runCtx:'.length)))[0]
      const runCtxUrl = `http://localhost:${settings.port}/hosts/tests/runCtx.html?sourceCode=${sourceCode}&runCtx=${runCtx}`
      writeToCmdLog('./temp/runCtxUrl', runCtxUrl)

      //${baseUrl}/tests.html?
      res.setHeader('Content-Type', 'application/json; charset=utf8') // '--inspect-brk', 
      const srvr = child.spawn('node',['./jb.js', ...args],{cwd: 'hosts/node'})
      let res_str = ''
      srvr.stdout.on('data', data => { res.write(data); res_str += data })
      srvr.stdout.on('end', data => {
        res.end(data)
        writeToCmdLog('./temp/lastCmdRes', res_str+(data || ''))
      })
      //srvr.on('exit', onExit)
      srvr.on('error', (e) => res.end(JSON.stringify({command, error: `${''+e}`})))  
    },    
    createProject: function(req, res,body,path) {
      let clientReq;
      try {
        clientReq = JSON.parse(body);
        if (!clientReq)
           return endWithFailure(res,'Can not parse json request');
        const projDir = clientReq.baseDir || projectDirectory(clientReq.project)
        const dirExists = fs.existsSync(projDir)
        if (!clientReq.override && dirExists)
          return endWithFailure(res,'Project already exists');
        if (!dirExists)
            fs.mkdirSync(projDir)

        fs.mkdirSync(projDir);
        Object.keys(clientReq.files).forEach(f=>
          fs.writeFileSync(projDir+ '/' + f,clientReq.files[f])
        )
      } catch(e) {
        return endWithFailure(res,e)
      }
      endWithSuccess(res,'Project Created');
    },
    createDirectoryWithFiles: function(req, res,body,path) {
      let clientReq;
      try {
        clientReq = JSON.parse(body);
        if (!clientReq)
           return endWithFailure(res,'Can not parse json request');
        const baseDir = clientReq.baseDir;
        if (baseDir != './') {
          if (fs.existsSync(baseDir))
            return endWithFailure(res,`directory ${baseDir} already exists`);
          fs.mkdirSync(baseDir);
        } else {
          if (fs.existsSync(`./${rootName}.html`))
            return endWithFailure(res,`${rootName}.html already exists`);
        }
        Object.keys(clientReq.files).forEach(f=>
          fs.writeFileSync(baseDir+ '/' + f,clientReq.files[f])
        )
        endWithSuccess(res,`directory ${baseDir} created with ${Object.keys(clientReq.files).legnth} files`);
      } catch(e) {
        return endWithFailure(res,e)
      }
    }
};

const base_get_handlers = {
  'studio-bin': (req,res) =>
    file_type_handlers.html(req,res,`${jbReactDir}bin/studio/studio-bin.html`),
  notebook: (req,res) => 
    file_type_handlers.html(req,res,`projects/studio/studio.html`),
  studio: (req,res) => 
    file_type_handlers.html(req,res,`projects/studio/studio.html`),
  project(req,res) {
    const project_with_params = req.url.split('/')[2];
    const project = project_with_params.split('?')[0];
    // if (external_projects[project])
    //   return file_type_handlers.html(req,res, external_projects[project] + `/${project}/${project}.html`);
    const path = `${projectDirectory(project)}/${project}.html`
    const htmlFileName = fs.existsSync(path) ? path : `${projectDirectory(project)}/index.html`
    return file_type_handlers.html(req,res,htmlFileName);
  }
}

const op_get_handlers = {
    createNodeWorker: (req,res,path) => {
      const args = JSON.parse(getURLParam(req,'args'))
      const command = `node --inspect-brk ../hosts/node/node-worker.js ${args.map(arg=> 
        (arg.indexOf("'") != -1 ? `"${arg.replace(/"/g,`\\"`).replace(/\$/g,'\\$')}"` : `'${arg}'`)).join(' ')}`
      res.setHeader('Content-Type', 'application/json; charset=utf8')
      writeToCmdLog('./temp/lastNodeWorker', command)
      const nodeWorker = child.spawn('node',['./node-worker.js', ...args],{cwd: 'hosts/node'})
      nodeWorker.stdout.on('data', data => res.end(data))
      nodeWorker.on('exit', (code,ev) => res.end(JSON.stringify({command, exit: `exit ${''+code} ${''+ev}}`})))
      nodeWorker.on('error', (e) => res.end(JSON.stringify({command, error: `${''+e}`})))
    },    
    // jbGet: (req,res,path) => {
    //   const args = JSON.parse(getURLParam(req,'args'))
    //   const command = `node --inspect-brk ../hosts/node/jb.js ${args.map(arg=> 
    //     (arg.indexOf("'") != -1 ? `"${arg.replace(/"/g,`\\"`).replace(/\$/g,'\\$')}"` : `'${arg}'`)).join(' ')}`
    //   res.setHeader('Content-Type', 'application/json; charset=utf8')
    //   const srvr = child.spawn('node',['./jb.js', ...args],{cwd: 'hosts/node'})
    //   srvr.stdout.on('data', data => res.write(data))
    //   srvr.stdout.on('end', data => res.end(data))
    //   //srvr.on('exit', onExit)
    //   srvr.on('error', (e) => res.end(JSON.stringify({command, error: `${''+e}`})))  
    // },
    runCmd: function(req,res,path) {
      if (!settings.allowCmd) return endWithFailure(res,'no permission to run cmd. allowCmd in jbart.json');

      const cmd = getURLParam(req,'cmd');
      if (!cmd) return endWithFailure(res,'missing cmd param in url');
      let cwd = getURLParam(req,'dir');
      if (!cwd) return endWithFailure(res,'missing dir param in url');
      cwd += '/';

      child.exec(cmd,cwd ? { cwd } : {},function (error, stdout, stderr) {
        if (error) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({type:'error', desc:'Can not run cmd', cmd: cmd, stdout, stderr, exitcode: error }));
        } else {
          const out = {
            type: 'success',
            outfiles: {}, stdout,stderr
          };
          (getURLParam(req,'outfiles') || '').split(',').forEach(function(outfile) {
              let content = '';
              try { content = '' + fs.readFileSync(outfile); } catch(e) {}
              out.outfiles[outfile] = content;
          });
          res.setHeader('Content-Type', 'application/json; charset=utf8');
          res.end(JSON.stringify(out));
        }
      });
    },
    settings: (req,res) => {
      res.setHeader('Content-Type', 'application/json;charset=utf8');
      res.end(JSON.stringify(Object.assign({rootName},settings)))
    },
    rootName: (req,res) => {
      res.setHeader('Content-Type', 'application/text;charset=utf8');
      res.end(rootName);
    },
    rootExists: (req,res) => {
      res.setHeader('Content-Type', 'application/text;charset=utf8');
      res.end('' + fs.existsSync(`./${rootName}.html`));
    },
    ls: function(req,res) {
      const path = getURLParam(req,'path');
      const full_path = calcFullPath(path)
      res.setHeader('Content-Type', 'application/json; charset=utf8');
      res.end(JSON.stringify({entries: fs.readdirSync(full_path)}));
    },
    getFile: function(req,res) {
      const path = getURLParam(req,'path');
      const full_path = calcFullPath(path)
      fs.readFile(_path(full_path), function (err, content) {
        if (err) {
          if (err.errno === 34)
            res.statusCode = 404;
          else
            res.statusCode = 500;
          return endWithFailure(res,'Can not read file ' + full_path + ' ' + err);
        } else {
          res.setHeader('Content-Length', Buffer.byteLength(content, 'utf8'));
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/text;charset=utf8');
          res.end(content);
        }
      });
    },
    fileSymbols: function(req,res) {
      const path = getURLParam(req,'path')
      const include = getURLParam(req,'include') && new RegExp(getURLParam(req,'include'))
      const exclude = getURLParam(req,'exclude') && new RegExp(getURLParam(req,'exclude'))
      res.setHeader('Content-Type', 'application/json;charset=utf8')
      try {
        res.end(JSON.stringify(getFilesInDir(calcFullPath(path)).filter(f=>f.match(/\.js$/)).map(path => fileContent(path))))
      } catch (e) {
        res.end('[]')
      }

      function getFilesInDir(dirPath) {
        return fs.readdirSync(dirPath).sort((x,y) => x == y ? 0 : x < y ? -1 : 1).reduce( (acc, file) => {
          const path = `${dirPath}/${file}`
          if (include && !include.test(path) || exclude && exclude.test(path)) return acc
          return fs.statSync(path).isDirectory() ? [...acc, ...getFilesInDir(path)] : [...acc, path]
        }, [])
      }
      function fileContent(_path) {
        const content = fs.readFileSync(_path,'utf-8')
        const path = unRepo(_path)
        return { 
          path : path.match(/^\./) ? path.slice(1) : path,
          dsl: unique(content.split('\n').map(l=>(l.match(/^(jb.)?dsl\('([^']+)/) || ['',''])[2]).filter(x=>x).map(x=>x.split('.')[0]))[0],
          pluginDsl: unique(content.split('\n').map(l=>(l.match(/^(jb.)?pluginDsl\('([^']+)/) || ['',''])[2]).filter(x=>x).map(x=>x.split('.')[0]))[0],
          ns: unique(content.split('\n').map(l=>(l.match(/^(jb.)?component\('([^']+)/) || ['',''])[2]).filter(x=>x).map(x=>x.split('.')[0])),
          libs: unique(content.split('\n').map(l=>(l.match(/^(jb.)?extension\('([^']+)/) || ['',''])[2]).filter(x=>x).map(x=>x.split('.')[0])),
          using: unique(content.split('\n').map(l=>(l.match(/^(jb.)?using\('([^']+)/) || ['',''])[2]).filter(x=>x).flatMap(x=>x.split(',').map(x=>x.trim()))),
        }
      }
      function unique(list) {
        const ret = {}
        list.forEach(x=>ret[x]=true)
        return Object.keys(ret)
      }
    },
    download: function(req,res,path) {
      res.writeHead(200, {'Content-Type': 'application/csv', 'Content-disposition': 'attachment; filename=' + path });
      res.end(getURLParam(req,'data'));
    },
    projects: function(req,res,path) {
      const projects = fs.readdirSync(projectstDir)
        .filter(dir=>fs.statSync(projectstDir + '/' + dir).isDirectory())
        .filter(dir=>!dir.match(new RegExp(settings.exclude)))
        .concat(fs.existsSync(`./${rootName}.html`) ? [rootName] : [])
      res.end(JSON.stringify({projects}));
    },
    gotoSource: function(req,res) {
      const path = getURLParam(req,'path')
      const repo = getURLParam(req,'repo')
      if (path)
        return gotoFile(path.split(':')[0],path.split(':')[1])

      const comp = getURLParam(req,'comp')
      const extraBaseDir = repo ? `../${repo}/plugins` : 'projects'
      const files = walk(extraBaseDir).concat(walk('plugins'))
      files.filter(x=>x.match(/\.(ts|js)$/))
        .forEach(srcPath=>{
                const source = ('' + fs.readFileSync(srcPath)).split('\n');
                source.map((line,lineNum)=> {
                  if (line.indexOf(`component('${comp}'`) != -1 || line.indexOf(`/* ${comp} */`) != -1) {
                    gotoFile(srcPath,lineNum)
                  }
                })
        })
      function gotoFile(srcPath,lineNum) {
        const cmd = settings.open_source_cmd + srcPath+':'+ ((+lineNum)+1);
        console.log(cmd);
        child.exec(cmd,{});
        endWithSuccess(res,'open editor cmd: ' + cmd);
      }
    },
    fetch: function(req, res) {
      try {
        const param = getURLParam(req,'req')
        const fetchReq = JSON.parse(param);
        if (!fetchReq)
           return endWithFailure(fetchReq,'Can not parse fetchReq');
        return fetch(fetchReq.url,fetchReq)
          .then(res=> res.text())
          .then(result=> res.end(result))
          .catch(e => endWithFailure(res, param + '. ' + e.message ))
      } catch(e) {
        return endWithFailure(res,e)
      }
    },
};


process.on('uncaughtException', function(err) {
 console.log(err);
});


// *************** utils ***********

const _path = path => path.replace(/[\\\/]/g,'/');

function getURLParam(req,name) {
  try {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(req.url)||[,""])[1].replace(/\+/g, '%20'))||null;
  } catch(e) {}
}

// function getURLParams(req) {
//     return decodeURIComponent(req.url).split('?').pop().split('&').map(x=>x.split('=')[0]).filter(x=>x && x!='op')
// }

function endWithFailure(res,desc) {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({type:'error', desc:desc }));
  console.log(desc);
}
function endWithSuccess(res, message) {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({type:'success', message: message}));
}

function now() {
  const date = new Date();
  return pad(date.getDate()) + '/' + pad(date.getMonth()+1) + '/' + date.getFullYear() + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds())
}
function pad(i) { return i<10?'0'+i:i; }

function walk(dir) {
    const list = fs.readdirSync(dir);
    let results = [];
    list.forEach( file => {
        const full_path = dir + '/' + file;
        const stat = fs.statSync(full_path);
        if (stat && stat.isDirectory())
          results = results.concat(walk(full_path))
        else
          results.push(full_path)
    })
    return results;
}

function saveComp(toSave,original,comp,project,force,projectDir,destFileName) {
    let projDir = projectDir;

    if (comp.indexOf('studio.') == 0 && project == 'studio-helper')
      projDir = 'projects/studio';

    if (!original) { // new comp
      const srcPath = `${projectDirectory(project)}/${destFileName || (project+'.js')}`;
      try {
        const current = '' + fs.readFileSync(srcPath);
        const toStore = current + '\n\n' + toSave;
        let cleanNL = toStore.replace(/\r/g,'');
        if (_iswin)
          cleanNL = cleanNL.replace(/\n/g,'\r\n');
        fs.writeFileSync(srcPath,cleanNL);
        return `component ${comp} added to ${srcPath}`;
      } catch (e) {
        throw `can not store component ${comp} in path ${srcPath}`
      }
    }

    let comp_found = '';
//        console.log(original);
    const files = fs.readdirSync(projDir)
      .filter(x=>x.match(/\.js$/) || x.match(/\.ts$/))
    for(let i=0;i<files.length && !comp_found;i++) {
        const srcFile = files[i]
        const srcPath = projDir+'/'+srcFile
        const source = ('' + fs.readFileSync(srcPath)).replace(/\r/g,'').split('\n');
        const toFind = original.replace(/\r/g,'').split('\n');
        //toFind[0] = toFind[0].slice(0,toFind[0].indexOf('{')+1)
        const replaceWith = toSave.replace(/\r/g,'').split('\n');
        const found = findSection(source,toFind,srcFile);
        if (found) {
          //console.log('splice',source,found.index,found.length,replaceWith);
          source.splice(found.index,found.length, ...replaceWith);
          const newContent = source.join(_iswin ? '\r\n' : '\n');
          fs.writeFileSync(srcPath,newContent);
          comp_found = `component ${comp} saved to ${srcPath} at ${JSON.stringify(found)}`;
        }
    }

    if (comp_found)
      return comp_found
    else {
      fs.appendFileSync(projDir+'/'+project+'.js', '\n' + toSave + '\n') 
      return `component ${comp} added to ${project}.js`
    }

    function findSection(source,toFind,srcFile) {
      const compShortHead = toFind[0].split(',')[0]
      const index = source.findIndex(line => line.indexOf(compShortHead) == 0);
      // if (index == -1)
      //   index = source.indexOf(toFind[0].replace('jb_','jb.'));
      if (index != -1 && force) {// ignore content - just look for the end
        for(end_index=index+1;end_index<source.length;end_index++) {
          if ((source[end_index]||'').match(/jb\.component\(/m)) {
            throw `${comp} found, but its closing "})" was not found at the begining of the line`;
          }
          else if ((source[end_index]||'').match(/^}\)$/m))
            return { index: index, length: end_index - index +1}
        }
      } else if (index != -1 && compareArrays(source.slice(index,index+toFind.length),toFind)) {
          return { index: index, length: toFind.length }
      } else if (index == -1) {
        return false;
      } else {
        // calc error message
        const src = source.slice(index,index+toFind.length);
        console.log('origin not found at file ' + srcFile);
        src.forEach(l=>console.log(l));
        toFind.forEach((line,index) => {
          if (line != src[index])
            console.log(index + '-' +line + '#versus source#' + src[index]);
        })

        throw `${comp} found with a different source, use "force save" to save`;
      }
    }
    function compareArrays(arr1,arr2) {
      return arr1.join('\n') == arr2.join('\n')
    }
}

function getProcessArgument(argName) {
  for (let i = 0; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg.indexOf('-' + argName + ':') == 0) 
      return arg.substring(arg.indexOf(':') + 1).replace(/'/g,'');
    if (arg == '-' + argName) return true;
  }
  return '';
}

function writeToCmdLog(fn,content) {
  let newContent = content
  try {
    if (new Date().getTime() - fs.statSync(fn).mtime < 1000)
    newContent = fs.readFileSync(fn) + '\n' + content
  } catch (e) {}
  fs.writeFileSync(fn,newContent)
  fs.chmodSync(fn, '755')
}

http.createServer(serve).listen(settings.port)
http.createServer(serve).listen(settings.ports.nodeContainer)

if (process.cwd().indexOf('jb-react') != -1)
  console.log(`hello-world url: http://localhost:${settings.port}/project/studio/helloWorld`)
else
  console.log(`studio url: http://localhost:${settings.port}/studio-bin`)

console.log(`nodeContainer url: http://localhost:${settings.ports.nodeContainer}/?op=createNodeWorker&clientUri=mukki`)