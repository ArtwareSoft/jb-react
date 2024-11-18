const fs = require('fs');
const JBART_DIR = __dirname + '/../';

async function build() {
    const fetch = (await import('node-fetch')).default;
    ['projects','plugins','src'].forEach( async path => {
        const response = await fetch(`http://localhost:8082/projects/tests/tests.html?op=fileSymbols&path=${path}&exclude=pack-|jb-loader`)
        const body = await response.text()
        fs.writeFileSync(`${JBART_DIR}dist/symbols/${path}.json`,body)
    })
}

build()
