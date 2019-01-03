
//root.keys().filter(teamLeader => or(teamLeader.eq('oded'), teamLeader.eq('or')).not())

const keysProxies = {
    root: {$: 'carmi.pipe', 
        input :{$: 'carmi.root' }, 
        pipe: []
    }
}

const xx = new Proxy({}, { 
    get(target, propKey, receiver) {
        return function (...args) {
            debugger;
        }
    }
})

carmi_eval('root.map(val=>val.plus(5).plus(7))')
