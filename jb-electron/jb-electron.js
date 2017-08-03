const {app, protocol, BrowserWindow} = require('electron')
const remote = require('electron').remote;

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

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 1280, height: 800, webPreferences: { nodeIntegration: true }});
  win.electron = true;
  win.jbartBase = __dirname.replace(/\\jb-electron$/,'');

  protocol.interceptFileProtocol('file',(req,callback) => {
    var path = req.url;
    if (path.indexOf('C:/project/') != -1) {
        var project_with_params = path.split('/')[5];
        var project = project_with_params.split('?')[0];
        path= `C:/projects/${project}/${project}.html`
    }
    ['src','css','node_modules','dist','projects'].forEach(dir=>path=path.replace(`C:/${dir}`,`${win.jbartBase}/${dir}`));
    path = path.replace(/!st!/,'').split('file:///').pop();
    console.log(req,path);
    callback(path);
  })
  // and load the index.html of the app.
  var project = getProcessArgument('project');
  var path = getProcessArgument('path');
  if (path)
    win.loadURL(`file://${win.jbartBase}/${path}`)
  else if (project)
    win.loadURL(`file://C:/project/studio/${project}`)

  // Open the DevTools.
  //win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})
