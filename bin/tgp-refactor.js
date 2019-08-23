jb = require('../dist/jbart-core.js')
const fs = require('fs');
require('../src/loader/jb-loader.js');

const JBART_DIR = '../';
const modulesToLoad = 'common,ui-common,ui-tree,codemirror-styles,testers,pretty-print,studio,studio-tests,parsing,object-encoder'

const filesOfModules = modules => modules.split(',').map(m=>{
    if (m == 'studio')
        return resources[m].map(file => 'projects/studio/studio-' + file + '.js')
    else if (m == 'studio-tests')
        return resources[m].map(file => 'projects/studio-helper/studio-' + file + '-tests.js')
    else return resources[m] 
}).flat()

// const jbReactFiles = filesOfModules('common,ui-common,ui-tree,pretty-print')
//     .filter(x=>!x.match(/.css$/)).filter(x=>!x.match(/material/));;
//const studioFiles = resources.studio.map(x=>'projects/studio/studio-' + x + '.js');
const testsFiles = ['data','ui','parsing','object-encoder'].map(x=>`projects/ui-tests/${x}-tests.js`)
const stduioBase = ['utils','path','tgp-model'].map(x=>'projects/studio/studio-' + x + '.js');

const location = Symbol('location')
jb.traceComponentFile = function(comp) {
    const line = new Error().stack.split(/\r|\n/)[3]
    comp[location] = line.match(/\\([^:]+):([^:]+):[^:]+$/).slice(1,3)
}
filesOfModules(modulesToLoad).concat(testsFiles).filter(x=>!x.match(/material/)).filter(x=>!x.match(/.css$/))
    .map(fn=> {
//'studio.path-hyperlink'        console.log(fn)
        require(JBART_DIR+fn)
    })

// jbReactFiles.map(fn=>require(JBART_DIR+fn))
// stduioBase.map(fn=>require(JBART_DIR+fn))
//tests.map(fn=>require(JBART_DIR+fn))

const content = jb.entries(jb.comps) // .filter(e=> typeof e[1].impl === 'object')
//    .slice(1,50)
    .filter(e=> ! e[1][location][0].match(/[^-]menu.js/)) 
    .filter(e=> e[1][location][0].match(/studio-properties.js/))
    
//        e[0] === 'studio.open-script-history')
    .filter(e=> e[0].indexOf('studio.') == 0) // || e[0].indexOf('dialog') == 0 || e[0].indexOf('menu') == 0)
    .forEach(e=>
        swapComp(e[0],e[1]))
    
//     .map(e=>// [e[0], ...e[1][location], 
//         jb.prettyPrintComp(e[0],e[1],{macro:true, depth: 1, initialPath: e[0]})))
//     .join('\n\n')
// console.log(content)
//fs.writeFileSync('x.txt',content)

function swapComp(id,comp) {
    console.log(id)
    const fn = '../' + comp[location][0]
    const content = ('' + fs.readFileSync(fn))//.replace(/\r/g,'')
    const lines = content.split('\n').map(x=>x.replace(/[\s]*$/,''))
    const lineOfComp = lines.reduce((acc,line,i) => acc != -1 ? acc : line.indexOf(`jb.component('${id}'`) == 0 ? i : -1, -1);
    if (lineOfComp == -1) {
        console.log('error can not find ' + id + ' in ' + fn)
        return;
    }
    const linesFromComp = lines.slice(lineOfComp)
    const compLastLine = linesFromComp.indexOf('})')
    if (compLastLine != -1) {
        const linesOfComp = linesFromComp.slice(0,compLastLine+1)
        if (linesOfComp.slice(2).reduce((found,line) => found || line.match(/jb.component/), false)) {
            console.log('error',[fn,comp,linesOfComp])
            return; // component found inside
        }
        const newComp = jb.prettyPrintComp(id,comp,{macro:true, depth: 1, initialPath: id}).split('\n')
        lines.splice(lineOfComp,compLastLine+1,...newComp)
//        console.log(newComp)
        fs.writeFileSync(fn,lines.join('\n'))
    }
}
