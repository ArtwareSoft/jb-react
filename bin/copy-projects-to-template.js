const copyFiles = require('copyfiles');

'hello-world,itemlists,d3-demo,style-gallery,todomvc,html-parsing,puppeteer-demo'
    .split(',').forEach(p=>copyFiles([`projects/${p}/*`,`../projects/jbart-template/${p}`],{up: 2, flat: true, verbose: true},e=>console.log(e)))