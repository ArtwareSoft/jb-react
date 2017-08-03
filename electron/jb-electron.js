const {app, BrowserWindow} = require('electron')
const path = require('path')

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
  win = new BrowserWindow({width: 800, height: 600});
  win.electron = true;
  console.log(__dirname);
  win.jbartBase = __dirname.split('/').slice(0,-1).join('/');

  // and load the index.html of the app.
  var project = getProcessArgument('project');
  if (project)
    win.loadURL(`file://${win.jbartBase}/${project}/${project}.html`)

  // Open the DevTools.
  win.webContents.openDevTools()

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
