(function(){

// should be move to studio onScript change
// function writeValueToResource(path,value,jbToUse) {
//     if (path.match(/^[^~]+~(watchable|passive)Data/)) {
//         const dataPath = path.replace(/~(watchable|passive)Data/,'')
//             .replace(/~[0-9]+~/g,x => x.replace(/~/,'[').replace(/~/,']~'))
//             .replace(/~/g,'/')
//             .replace(/.*/,x=>`%$${x}%`)
//         (new jbToUse.jbCtx()).run(writeValue(dataPath,value))
//     }
// }

function getSinglePathChange(newVal, currentVal) {
    return pathAndValueOfSingleChange(jb.objectDiff(currentVal, newVal),'')
    
    function pathAndValueOfSingleChange(obj, pathSoFar) { 
        if (typeof obj !== 'object')
            return { innerPath: pathSoFar, innerValue: obj }
        const entries = jb.entries(obj)
        if (entries.length != 1) // if not single returns empty answer
            return {}
        return pathAndValueOfSingleChange(entries[0][1],pathSoFar+'~'+entries[0][0])
    }
}

function setStrValue(value, ref, targetFrame) {
    const notPrimitive = value.match(/^\s*[a-zA-Z0-9\._]*\(/) || value.match(/^\s*(\(|{|\[)/) || value.match(/^\s*ctx\s*=>/) || value.match(/^function/);
    const newVal = notPrimitive ? jb.evalStr(value,targetFrame) : value;
    if (newVal && typeof newVal === 'object') {
        const {innerPath, innerValue} = getSinglePathChange(newVal,jb.getVal(ref))
        if (innerPath)
            jb.getHandler(ref).refOfPath(innerPath).writeValue(innerValue)
        else
            ref.writeValue(newVal)
    }
}

jb.component('watchable-as-text', {
    type: 'data',
    params: [
      {id: 'ref', as: 'ref', dynamic: true},
      {id: 'targetFrame'}
    ],
    impl: (ctx,refF) => ({
        getRef() {
            return this.ref || (this.ref = refF())
        },
        getHandler() {
            return jb.getHandler(this.getRef())
        },
        getVal() {
            return jb.val(this.getRef())
        },
        prettyPrintWithPositions() {
            const initialPath = jb.refHandler(this.getRef()).pathOfRef(this.getRef()).join('~')
            const res = jb.prettyPrintWithPositions(this.getVal() || '',{initialPath})
            this.locationMap = res.map
            return res
        },
        $jb_val(value) { try {
            if (value === undefined) {
                const val = this.getVal();
                if (typeof val === 'function')
                    return val.toString();

                return this.prettyPrintWithPositions().text
            } else {
                setStrValue(value,this.getRef(), ctx.params.targetFrame)
                this.prettyPrintWithPositions()
            }
        } catch(e) {
            jb.logException(e,'watchable-obj-as-text-ref',ctx)
        }},

        $jb_observable(cmp) {
            return jb.ui.refObservable(this.getRef(),cmp,{includeChildren: 'yes'})
        }
    })
})
  
jb.evalStr = function(str,frame) {
    try {
      return (frame || jb.frame).eval('('+str+')')
    } catch (e) {
        jb.logException(e,'eval: '+str);
    }
}
  
jb.objectDiff = function(newObj, orig) {
    if (orig === newObj) return {}
    if (!jb.isObject(orig) || !jb.isObject(newObj)) return newObj
    const deletedValues = Object.keys(orig).reduce((acc, key) =>
        newObj.hasOwnProperty(key) ? acc : { ...acc, [key]: undefined }
    , {})
  
    return Object.keys(newObj).reduce((acc, key) => {
      if (!orig.hasOwnProperty(key)) return { ...acc, [key]: newObj[key] } // return added r key
      const difference = jb.objectDiff(newObj[key], orig[key])
      if (jb.isObject(difference) && jb.isEmpty(difference)) return acc // return no diff
      return { ...acc, [key]: difference } // return updated key
    }, deletedValues)
}

jb.textEditor = {
    pathOfPosition(locationMap,_pos) {
        const pos = Number(_pos) ? this.offsetToLineCol(_pos) : _pos
        const path = jb.entries(locationMap)
            .find(e=>e[1][0] == pos.line && e[1][1] <= pos.col && (e[1][0] < e[1][2] || pos.col <= e[1][3]))
        return path
    },
    lineColToOffset(text,{line,col}) {
        return text.split('\n').slice(0,line).reduce((sum,line)=> sum+line.length+1,0) + col
    },
    offsetToLineCol(text,offset) {
        return { line: (text.slice(0,offset).match(/\n/g) || []).length || 0, 
            col: offset - text.slice(0,offset).lastIndexOf('\n') }
    }
}

jb.component('text-editor.with-cursor-path', {
    type: 'action',
    params: [
      {id: 'action', type: 'action', dynamic: true, mandatory: true},
      {id: 'editorId', as: 'string', desscription: 'only needed if launched from button'},
    ],
    impl: (ctx,action,editorId) => {
      try {
          const base = ctx.vars.elemToTest || (typeof document !== 'undefined' && document)
          const elem = editorId && base && base.querySelector('#'+editorId) || jb.path(ctx.vars.$launchingElement,'el')
          const cmp = elem._component
          const editor = cmp.editor
          if (editor && editor.getCursorPos)
                action(ctx.setVars({cursorPath: jb.textEditor.pathOfPosition(cmp.state.databindRef.locationMap, editor.getCursorPos()) }))
        } catch(e) {}
    }
})
  
jb.component('text-editor.watch-source-changes', {
    type: 'feature',
    params: [
    ],
    impl: ctx => ({ init: cmp => {
      try {
        const data_ref = cmp.state.databindRef.getRef()
        jb.isWatchable(data_ref) && jb.ui.refObservable(data_ref,cmp,{watchScript: cmp.ctx, includeChildren: 'yes'})
            .subscribe(e => {
            const path = e.path
            const editor = cmp.editor
            const locations = cmp.state.databindRef.locationMap
            const loc = locations[path.concat('!value').join('~')]
            const newVal = jb.prettyPrint(e.newVal)
            editor.replaceRange(newVal, {line: loc[0], col:loc[1]}, {line: loc[2], col: loc[3]})
            const newEndPos = jb.prettyPrint.advanceLineCol({line: loc[0], col:loc[1]}, newVal)
            editor.markText({line: loc[0], col:loc[1]}, {line: newEndPos.line, col: newEndPos.col},{
                className: 'jb-highlight-comp-changed'
            })
            })
        } catch (e) {}
    }})
})

})()