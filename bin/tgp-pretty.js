jb = require('../src/core/jb-core.js')
const {getProcessArgument} = require('./utils.js')
const fs = require('fs');
require('../src/loader/jb-loader.js');

const JBART_DIR = '../';
const modulesToLoad = 'common,ui-common,ui-tree,codemirror-styles,testers,pretty-print,studio,studio-tests,parsing,object-encoder'

const filesOfModules = modules => modules.split(',').map(m=>{
    if (m == 'studio')
        return resources[m].map(file => file.match(/\//) ? file : 'projects/studio/studio-' + file + '.js')
    else if (m == 'studio-tests')
        return resources[m].map(file => 'projects/studio-helper/studio-' + file + '-tests.js')
    else return resources[m] 
}).flat()

const testsFiles = ['data','ui','parsing','object-encoder'].map(x=>`projects/ui-tests/${x}-tests.js`)

const location = Symbol('location')
jb.traceComponentFile = function(comp) {
    const line = new Error().stack.split(/\r|\n/)[3]
    comp[location] = line.match(/\\([^:]+):([^:]+):[^:]+$/).slice(1,3)
}
// load files
filesOfModules(modulesToLoad).concat(testsFiles).filter(x=>x).filter(x=>!x.match(/material/)).filter(x=>!x.match(/.css$/))
    .map(fn=> require(JBART_DIR+fn))

const filePattern = new RegExp(getProcessArgument('file') || '^nothing')
function run() {
    const entries = jb.entries(jb.comps) 
        .map(e=>({id:e[0], comp:e[1], file:e[1][location][0]}))
    entries.filter(({file}) => 
            filePattern.test(file) )
        .forEach( ({id,comp}) =>
            swapComp({id,comp}))
}

run()

        //    .filter(({file}) => !file.match(/[^-]menu.js/)) 
//    .filter(({file}) => file.match(/studio-[a-z]*.js/))
//    .filter(({id})=> id.indexOf('studio.') == 0) // || e[0].indexOf('dialog') == 0 || e[0].indexOf('menu') == 0)

//     .map(e=>// [e[0], ...e[1][location], 
//         jb.prettyPrintComp(e[0],e[1],{macro:true, depth: 1, initialPath: e[0]})))
//     .join('\n\n')
// console.log(content)
//fs.writeFileSync('x.txt',content)

function swapComp({id,comp,file}) {
    console.log(id)
    const fn = '../' + file
    const content = ('' + fs.readFileSync(fn))//.replace(/\r/g,'')
    const lines = content.split('\n').map(x=>x.replace(/[\s]*$/,''))
    const lineOfComp = lines.findIndex(line=> line.indexOf(`jb.component('${id}'`) == 0)
    if (lineOfComp == -1)
        return jb.logError(['can not find component', fn,id])

    const linesFromComp = lines.slice(lineOfComp)
    const compLastLine = linesFromComp.findIndex(line => line.match(/^})\s*$/))
    const nextjbComponent = linesFromComp.findIndex(line => line.match(/^jb.component$/))
    if (nextjbComponent != -1 && nextjbComponent < compLastLine)
      return jb.logError(['can not find end of component', fn,id, linesFromComp])
    const newComp = jb.prettyPrintComp(id,comp,{depth: 1, initialPath: id}).split('\n')
    lines.splice(lineOfComp,compLastLine+1,...newComp)
    console.log('replaced ' + id + ' at ' + file)
    fs.writeFileSync(fn,lines.join('\n'))
}
