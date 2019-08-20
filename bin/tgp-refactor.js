jb = require('../dist/jbart-core.js')
const fs = require('fs');
require('../src/loader/jb-loader.js');

const JBART_DIR = '../';
const filesOfModules = modules => modules.split(',').map(m=>resources[m]).flat()

const jbReactFiles = filesOfModules('common,ui-common,ui-tree,pretty-print')
    .filter(x=>!x.match(/.css$/)).filter(x=>!x.match(/material/));;
const dataTests = ['src/testing/testers.js','projects/ui-tests/data-tests.js']
//const studioFiles = resources.studio.map(x=>'projects/studio/studio-' + x + '.js');
const stduioBase = ['utils','path','tgp-model'].map(x=>'projects/studio/studio-' + x + '.js');

const location = Symbol('location')
jb.traceComponentFile = function(comp) {
    const line = new Error().stack.split(/\r|\n/)[3]
    comp[location] = line.match(/\\([^:]+):([^:]+):[^:]+$/).slice(1,3)
}

jbReactFiles.map(fn=>require(JBART_DIR+fn))
stduioBase.map(fn=>require(JBART_DIR+fn))
dataTests.map(fn=>require(JBART_DIR+fn))

const content = (jb.entries(jb.comps).filter(e=> typeof e[1].impl === 'object')
//    .slice(1,50)
    .filter(e=>e[0] === 'data-test.vars-cases')
    .map(e=>// [e[0], ...e[1][location], 
        jb.prettyPrintComp(e[0],e[1],{macro:true, depth: 1, initialPath: e[0]})))
    .join('\n\n')
console.log(content)
//fs.writeFileSync('x.txt',content)
