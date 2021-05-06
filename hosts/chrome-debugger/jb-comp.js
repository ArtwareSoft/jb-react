jb_codeLoaderServer(`devtools${decodeURIComponent('\u2022')}compPanel`,{ projects: ['studio'], baseUrl: 'http://localhost:8082'})
    .then(() => jb.chromeDebugger.initPanel('comp', self))
