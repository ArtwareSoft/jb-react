(function(){

function getSinglePathChange(newVal, currentVal) {
    return pathAndValueOfSingleChange(jb.objectDiff(newVal,currentVal),'')

    function pathAndValueOfSingleChange(obj, pathSoFar) {
        if (typeof obj !== 'object' && obj !== undefined)
            return { innerPath: pathSoFar, innerValue: obj }
        const entries = jb.entries(obj)
        if (entries.length != 1) // if not single returns empty answer
            return {}
        return pathAndValueOfSingleChange(entries[0][1],pathSoFar+'~'+entries[0][0])
    }
}

function setStrValue(value, ref, ctx) {
    const notPrimitive = value.match(/^\s*[a-zA-Z0-9\._]*\(/) || value.match(/^\s*(\(|{|\[)/) || value.match(/^\s*ctx\s*=>/) || value.match(/^function/);
    const newVal = notPrimitive ? jb.evalStr(value,ref.handler.frame()) : value;
    if (newVal === Symbol.for('parseError'))
        return
    // do not save in editing ',' at the end of line means editing
    if (typeof newVal === 'object' && value.match(/,\s*}/m))
        return
    const currentVal = jb.val(ref)
    if (newVal && typeof newVal === 'object' && typeof currentVal === 'object') {
        const {innerPath, innerValue} = getSinglePathChange(newVal,currentVal)
        if (innerPath) {
            const fullInnerPath = ref.handler.pathOfRef(ref).concat(innerPath.slice(1).split('~'))
            return jb.writeValue(ref.handler.refOfPath(fullInnerPath),innerValue,ctx)
        }
    }
    if (newVal !== undefined)
       jb.writeValue(ref,newVal,ctx)
}

jb.component('watchable-as-text', { /* watchableAsText */
  type: 'data',
  params: [
    {id: 'ref', as: 'ref', dynamic: true}
  ],
  impl: (ctx,refF) => ({
        oneWay: true,
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
            const ref = this.getRef()
            const initialPath = ref.handler.pathOfRef(ref).join('~')
            const res = jb.prettyPrintWithPositions(this.getVal() || '',{initialPath})
            this.locationMap = enrichMapWithOffsets(res.text, res.map)
            this.text = res.text
        },
        writeFullValue(newVal) {
            jb.writeValue(this.getRef(),newVal,ctx)
            this.prettyPrintWithPositions()
        },
        $jb_val(value) { try {
            if (value === undefined) {
                this.prettyPrintWithPositions()
                return this.text
            } else {
                setStrValue(value,this.getRef(),ctx)
                this.prettyPrintWithPositions() // refreshing location map
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
        return Symbol.for('parseError')
        //jb.logException(e,'eval: '+str);
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

jb.component('text-editor.with-cursor-path', { /* textEditor.withCursorPath */
  type: 'action',
  params: [
    {id: 'action', type: 'action', dynamic: true, mandatory: true},
    {id: 'selector', as: 'string', defaultValue: '#editor'}
  ],
  impl: (ctx,action,selector) => {
        let editor = ctx.vars.editor && ctx.vars.editor()
        if (!editor) {
            try {
                const elem = selector ? ctx.vars.elemToTest.querySelector(selector) : ctx.vars.elemToTest;
                editor = elem._component.ctx.vars.editor()
            } catch(e) {}
        }
        if (editor && editor.getCursorPos)
            action(editor.ctx().setVars({
                cursorPath: pathOfPosition(editor.data_ref, editor.getCursorPos()).path,
                cursorCoord: editor.cursorCoords(editor)
            }))
    }
})

jb.component('text-editor.is-dirty', { /* textEditor.isDirty */
  impl: ctx => {
        try {
            return ctx.vars.editor().isDirty()
        } catch (e) {}
    }
})

jb.component('text-editor.watch-source-changes', { /* textEditor.watchSourceChanges */
  type: 'feature',
  params: [

  ],
  impl: ctx => ({ init: cmp => {
      try {
        const text_ref = cmp.state.databindRef
        const data_ref = text_ref.getRef()
        jb.isWatchable(data_ref) && jb.ui.refObservable(data_ref,cmp,{srcCtx: cmp.ctx, includeChildren: 'yes'})
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

jb.component('text-editor.init', { /* textEditor.init */
  type: 'feature',
  params: [

  ],
  impl: ctx => ({
    extendCtxOnce: (ctx,cmp) => ctx.setVars({
        editor: () => cmp.editor,
        refreshEditor: path => refreshEditor(cmp,path)
      })
  })
})

jb.component('textarea.init-textarea-editor', { /* textarea.initTextareaEditor */
  type: 'feature',
  impl: ctx => ({
        beforeInit: cmp => {
          cmp.editor = {
            ctx: () => cmp.ctx,
            data_ref: cmp.state.databindRef,
            getCursorPos: () => offsetToLineCol(cmp.base.value,cmp.base.selectionStart),
            cursorCoords: () => {},
            markText: () => {},
            replaceRange: (text, from, to) => {
              const _from = lineColToOffset(cmp.base.value,from)
              const _to = lineColToOffset(cmp.base.value,to)
              cmp.base.value = cmp.base.value.slice(0,_from) + text + cmp.base.value.slice(_to)
            },
            setSelectionRange: (from, to) => {
              const _from = lineColToOffset(cmp.base.value,from)
              const _to = to && lineColToOffset(cmp.base.value,to) || _from
              cmp.base.setSelectionRange(_from,_to)
            },
          }
          if (cmp.ctx.vars.editorContainer)
            cmp.ctx.vars.editorContainer.editorCmp = cmp
        }
    })
})


jb.textEditor = {
    refreshEditor,
    getSuggestions,
    cm_hint
}

function pathOfPosition(ref,_pos) {
    const offset = !Number(_pos) ? lineColToOffset(ref.text, _pos) : _pos
    const found = jb.entries(ref.locationMap)
        .find(e=> e[1].offset_from <= offset && offset < e[1].offset_to)
    console.log('found',found && found[0],_pos)
    if (found)
        return {path: found[0], offset: offset - found[1].offset_from}
}

function lineColToOffset(text,{line,col}) {
    return text.split('\n').slice(0,line).reduce((sum,line)=> sum+line.length+1,0) + col
}

function enrichMapWithOffsets(text,locationMap) {
    const lines = text.split('\n')
    const accLines = []
    lines.reduce((acc,line) => {
        accLines.push(acc)
        return acc + line.length+1;
    }, 0)
    return Object.keys(locationMap).reduce((acc,k) => Object.assign(acc, {[k] : {
        positions: locationMap[k],
        offset_from: accLines[locationMap[k][0]] + locationMap[k][1],
        offset_to: accLines[locationMap[k][2]] + locationMap[k][3]
    }}), {})
}

function offsetToLineCol(text,offset) {
    return { line: (text.slice(0,offset).match(/\n/g) || []).length || 0,
        col: offset - text.slice(0,offset).lastIndexOf('\n') }
}

function refreshEditor(cmp,_path) {
    const editor = cmp.editor
    const text = jb.tostring(cmp.state.databindRef)
    const pathWithOffset = _path ? {path: _path+'~!value',offset:1} : this.pathOfPosition(cmp.state.databindRef, editor.getCursorPos())
    editor.setValue(text)
    if (pathWithOffset) {
        const _pos = cmp.state.databindRef.locationMap[pathWithOffset.path]
        const pos = _pos && _pos.positions
        if (pos)
            editor.setSelectionRange({line: pos[0], col: pos[1] + (pathWithOffset.offset || 0)})
    }
    editor.focus && jb.delay(10).then(()=>editor.focus())
}

function getSuggestions(fileContent, pos, jbToUse = jb) {
    const lines = fileContent.split('\n')
    const closestComp = lines.slice(0,pos.line+1).reverse().findIndex(line => line.match(/^jb.component\(/))
    if (closestComp == -1) return []
    const componentHeaderIndex = pos.line - closestComp
    const compId = (lines[componentHeaderIndex].match(/'([^']+)'/)||['',''])[1]
    if (!compId) return []
    const linesFromComp = lines.slice(componentHeaderIndex)
    const compLastLine = linesFromComp.findIndex(line => line.match(/^}\)\s*$/))
    const nextjbComponent = lines.slice(componentHeaderIndex+1).findIndex(line => line.match(/^jb.component/))
    if (nextjbComponent != -1 && nextjbComponent < compLastLine)
      return jb.logError(['can not find end of component', compId, linesFromComp])
    const linesOfComp = linesFromComp.slice(0,compLastLine+1)
    const compSrc = linesOfComp.join('\n')
    if (jb.evalStr(compSrc,jbToUse.frame) === Symbol.for('parseError'))
        return []
    const {text, map} = jb.prettyPrintWithPositions(jbToUse.comps[compId],{initialPath: compId, comps: jbToUse.comps})
    const locationMap = enrichMapWithOffsets(text, map)
    const srcForImpl = '{\n'+compSrc.slice((/^  /m.exec(compSrc) || {}).index)
    adjustOffsets(locationMap,srcForImpl,text)
    const path = pathOfPosition({text, locationMap}, {line: pos.line - componentHeaderIndex, col: pos.col})
    return new jbToUse.jbCtx().run(sourceEditor.suggestions(path.path))
}

function adjustOffsets(map,original,formatted) {
    const textAndSpaceOriginal = /([^\s]+)(\s+)/g
    const textAndSpaceFormated = /([^\s]+)(\s+)/g
    const offsetFixes = []
    while ((orig = textAndSpaceOriginal.exec(original)) != null && (form = textAndSpaceFormated.exec(formatted)) != null) {
        if (orig[1] != form[1])
            return jb.logError('adjustOffsets','different strings',orig,form)
        const delta = orig[2].length - form[2].length
        if (delta)
            offsetFixes.push({from: orig.index+orig[1].length,delta})
    }
    offsetFixes.reduce((acc,fix) => {
        acc += fix.delta
        return fix.accDelta = acc
    },0)

    Object.keys(map).forEach(k=>{
        const fix = offsetFixes.find(f=> map[k].offset_from >= f.from)
        if (fix) {
            map[k].offset_from += fix.accDelta;
            map[k].offset_to += fix.accDelta;
        }
    })

    function tokenize(str1,str2) {
        const str1Regex = /([^\s]+)(\s+)/g
        const str2Regex = /([^\s]+)(\s+)/g
        let token1 = null, token2 = null
        const res = { 1: [], 2: []}
        while ((token1 = str1Regex.exec(str1)) != null && (token2 = str2Regex.exec(str2)) != null) {
            token1.str = token1[1]; token1.ws = token1[2]; token2.str = token2[1]; token2.ws = token2[2]; 
            if (token1.str != token2.str && token1.str.indexOf(token2.str) == 0) {
                const sharedStr = token2.str
                if (sharedStr) {
                    res.tokens1.push({str: sharedStr, ws: '', index: token1.index})
                    res.tokens2.push(token2)
                    const nextTokens = tokenize(str1.slice(token1.index + sharedStr.length), 
                        str2.slice(token2.index + token2.str.length + token2.ws.length))
                    
                    res.tokens1 = res.tokens1.concat(nextTokens.tokens1.map(t=>t.index += token1.index + sharedStr.length))
                    res.tokens2 = res.tokens2.concat(nextTokens.tokens2.map(t=>t.index += token2.index + sharedStr.length))
                    return res
                } else {
                    return jb.logError('tokenize','different strings',token1,token2)
                }
            } else {
              res.tokens1.push(token1)
              res.tokens2.push(token2)
            }
        }
    }
}

const posFromCM = pos => pos && ({line: pos.line, col: pos.ch})
function cm_hint(cmEditor) {
    const cursor = cmEditor.getDoc().getCursor()
    return {
        from: cursor, to: cursor,
        list: jb.textEditor.getSuggestions(cmEditor.getValue(),posFromCM(cursor))
    }
}

})()