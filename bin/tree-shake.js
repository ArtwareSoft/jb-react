const {getProcessArgument} = require('./utils.js')
const fs = require('fs'), vm = require('vm')
const fn = getProcessArgument('filename'), entry = getProcessArgument('entry')
if (!fn || !entry) {
    console.log('usage: tree-shake.js -filename:myfile -entry:myComp[,myComp2]')
    process.exit(1)
}
const program = fs.readFileSync(fn)
global.jb = {}
global.navigator = {
	userAgent: '',
	platform: ''
}
global.location = {
    origin: '',
    href: ''
}

global.document = {
	createRange: () => [],
    createElement: () => ({ setAttribute() {}, }),
    addEventListener: () => {}
}
global.window = {
	addEventListener: () => {},
	navigator: global.navigator
}

vm.runInThisContext(program, {filename: fn})
const _jb = global.spyViewerJb || global.jb
_jb.studio.previewjb = _jb

console.log(Object.keys(_jb.comps).slice(0,10))
    
const workQueue = _jb.objFromEntries(entry.split(',').map(x=>[x,true]))
const depenedent = {}
while (Object.keys(workQueue).length) {
    const prof = Object.keys(workQueue)[0]
    delete workQueue[prof]
    console.log(prof)
    depenedent[prof] = true
    if (!_jb.comps[prof]) {
        console.log(`missing comp ${prof}`)
    } else {
        calcRefs(_jb.comps[prof].impl).forEach(p=> {
            if (!depenedent[p]) workQueue[p] = true
        })
    }
}

const toRemove = Object.keys(_jb.comps).filter(x=>! depenedent[x])
const totalCharsToRemove = toRemove.reduce((sum,comp) => sum + _jb.prettyPrintComp(comp,_jb.comps[comp]).length , 0)

console.log(totalCharsToRemove)

function calcRefs(profile) {
    if (profile == null || typeof profile != 'object') return [];
    const res = Array.isArray(profile) ? profile.reduce((res,inner) => [...res, ...calcRefs(inner),profile.$], [])
        : Object.keys(profile).reduce((res,prop)=> [...res, ...calcRefs(profile[prop]),profile.$], [])
    return res.filter(x=>x)
}

