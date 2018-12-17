const {app, protocol, BrowserWindow} = require('electron')
const remote = require('electron').remote;
const fs = require('fs')

console.log(process.argv);

function getProcessArgument(argName) { // should remain at the beginning
  for (var i = 0; i < process.argv.length; i++) {
    var arg = process.argv[i];
    if (arg.indexOf('-' + argName + ':') == 0)
      return arg.substring(arg.indexOf(':') + 1).replace(/'/g,'');  // replacing ' to prevent sql injection;
    if (arg == '-' + argName) return true;
  }
  return '';
}

// define projects not under /jbart/projects directory
function externalSites(filename) {
  try { return JSON.parse(fs.readFileSync(filename)) } catch (e) {}
}

var win = null;

app.on('ready', _ => {
  // Create the browser window.
  win = new BrowserWindow({width: 1400, height: 800, webPreferences: { nodeIntegration: true }});
  win.electron = true;
  win.jbartBase = __dirname.replace(/\\jb-electron$/,'');
  var sites = externalSites(`${win.jbartBase}/sites.json`) || {};
  console.log(`sites from: ${win.jbartBase}/sites.json`,sites);

  protocol.interceptFileProtocol('file',(req,callback) => {
    var path = req.url;
    if (path.indexOf('C:/project/') != -1) {
        var project_with_params = path.split('/')[5];
        var project = project_with_params.split('?')[0];
        path= `C:/projects/${project}/${project}.html`
    }
    Object.getOwnPropertyNames(sites).forEach(site=>
      path=path.replace(`C:/projects/${site}-`,`${sites[site]}/`));
    ['src','css','node_modules','dist','projects'].forEach(dir=>path=path.replace(`C:/${dir}`,`${win.jbartBase}/${dir}`));
    path = path.replace(/!st!/,'').split('file:///').pop();
    callback(path);
  })

  // and load the index.html of the app.
  var project = getProcessArgument('project');
  var path = getProcessArgument('path');
  console.log(project,'#',path);
  if (path)
    win.loadURL(`file://${win.jbartBase}/${path}`)
  else if (project) {
    console.log('project', project,projectFolder(project));
//    win.jbProjectFolder = projectFolder(project);
//    console.log(win.jbProjectFolder);
    win.loadURL(`file://C:/project/studio/${project}`)
  }

  function projectFolder(project) {
      var site = Object.getOwnPropertyNames(sites).filter(site=>project.indexOf(site+'-') != -1)[0];
      if (site)
          return `${sites[site]}/${project.substring(site.length+1)}`;
      return `${win.jbartBase}/projects/${project}`;
  }
  win.jb_projectFolder = projectFolder;
  win.on('closed', () => { win = null })
})
