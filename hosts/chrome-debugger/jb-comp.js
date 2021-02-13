jbModuleUrl = 'http://localhost:8082';
jbm_create(['studio-all'],`devtools${decodeURIComponent('\u25ba')}compPanel`)
    .then(jb=> {self.jb =jb; jb.chromeDebugger.initPanel('comp', self) })
