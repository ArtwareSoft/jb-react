const copyFiles = require('copyfiles');

'helloWorld,itemlists,d3Demo,styleGallery,todomvc,htmlParsing,puppeteerDemo'
    .split(',').forEach(p=>copyFiles([`projects/${p}/*`,`../projects/jbart-template/${p}`],{up: 2, flat: true, verbose: true},e=>console.log(e)))