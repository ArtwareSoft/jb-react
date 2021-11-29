jbInit(`devtools${decodeURIComponent('\u2022')}logsPanel`,{ projects: ['studio'], baseUrl: 'http://localhost:8082'})
    .then(() => jb.chromeDebugger.initPanel('logs', self))