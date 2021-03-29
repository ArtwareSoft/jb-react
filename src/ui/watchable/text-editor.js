// var { textEditor} = jb.ns('textEditor');

jb.extension('textEditor', {
    getSinglePathChange(diff, currentVal) {
        return pathAndValueOfSingleChange(diff,'',currentVal)
    
        function pathAndValueOfSingleChange(obj, pathSoFar, currentVal) {
            if (currentVal === undefined || (typeof obj !== 'object' && obj !== undefined))
                return { innerPath: pathSoFar, innerValue: obj }
            const entries = jb.entries(obj)
            if (entries.length != 1) // if not single returns empty answer
                return {}
            return pathAndValueOfSingleChange(entries[0][1],pathSoFar+'~'+entries[0][0],currentVal[entries[0][0]])
        }
    },
    setStrValue(value, ref, ctx) {
        const notPrimitive = value.match(/^\s*[a-zA-Z0-9\._]*\(/) || value.match(/^\s*(\(|{|\[)/) || value.match(/^\s*ctx\s*=>/) || value.match(/^function/);
        const newVal = notPrimitive ? jb.utils.eval(value,ref.handler.frame()) : value;
        if (newVal === Symbol.for('parseError'))
            return
        // I had a guess that ',' at the end of line means editing, YET, THIS GUESS DID NOT WORK WELL ...
        // if (typeof newVal === 'object' && value.match(/,\s*}/m))
        //     return
        const currentVal = jb.val(ref)
        if (newVal && typeof newVal === 'object' && typeof currentVal === 'object') {
            const diff = jb.utils.objectDiff(newVal,currentVal)
            if (Object.keys(diff).length == 0) return // no diffs
            const {innerPath, innerValue} = jb.textEditor.getSinglePathChange(diff,currentVal) // one diff
            if (innerPath) {
                const fullInnerPath = ref.handler.pathOfRef(ref).concat(innerPath.slice(1).split('~'))
                return jb.db.writeValue(ref.handler.refOfPath(fullInnerPath),innerValue,ctx)
            }
        }
        if (newVal !== undefined) { // many diffs
            currentVal && currentVal[jb.core.location] && typeof newVal == 'object' && (newVal[jb.core.location] = currentVal[jb.core.location])
            jb.db.writeValue(ref,newVal,ctx)
        }
    },
    lineColToOffset(text,{line,col}) {
        return text.split('\n').slice(0,line).reduce((sum,line)=> sum+line.length+1,0) + col
    },
    offsetToLineCol(text,offset) {
        return { line: (text.slice(0,offset).match(/\n/g) || []).length || 0,
            col: offset - text.slice(0,offset).lastIndexOf('\n') }
    },
    pathOfPosition(ref,_pos) {
        const offset = !Number(_pos) ? jb.textEditor.lineColToOffset(ref.text, _pos) : _pos
        const found = jb.entries(ref.locationMap).find(e=> e[1].offset_from <= offset && offset < e[1].offset_to)
        if (found)
            return {path: found[0], offset: offset - found[1].offset_from}
    },
    enrichMapWithOffsets(text,locationMap) {
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
    },
    refreshEditor(cmp,_path) {
        const editor = cmp.editor
        const data_ref = cmp.ctx.vars.$model.databind()
        const text = jb.tostring(data_ref)
        const pathWithOffset = _path ? {path: _path+'~!value',offset:1} : jb.textEditor.pathOfPosition(data_ref, editor.getCursorPos())
        editor.setValue(text)
        if (pathWithOffset) {
            const _pos = data_ref.locationMap[pathWithOffset.path]
            const pos = _pos && _pos.positions
            if (pos)
                editor.setSelectionRange({line: pos[0], col: pos[1] + (pathWithOffset.offset || 0)})
        }
        editor.focus && jb.delay(10).then(()=>editor.focus())
    },
    getSuggestions(fileContent, pos, jbToUse = jb) {
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
          return jb.logError('textEditor - can not find end of component', {compId, linesFromComp})
        const linesOfComp = linesFromComp.slice(0,compLastLine+1)
        const compSrc = linesOfComp.join('\n')
        if (jb.utils.eval(compSrc,jbToUse.frame) === Symbol.for('parseError'))
            return []
        const {text, map} = jb.utils.prettyPrintWithPositions(jbToUse.comps[compId],{initialPath: compId, comps: jbToUse.comps})
        const locationMap = jb.textEditor.enrichMapWithOffsets(text, map)
        const srcForImpl = '{\n'+compSrc.slice((/^  /m.exec(compSrc) || {}).index,-1)
        const cursorOffset = jb.textEditor.lineColToOffset(srcForImpl, {line: pos.line - componentHeaderIndex, col: pos.col})
        const path = jb.textEditor.pathOfPosition({text, locationMap}, cursorOffset)
        return { path, suggestions: new jbToUse.jbCtx().run(sourceEditor.suggestions(path.path)) }
    },
    getPosOfPath(path,jbToUse = jb) {
        const compId = path.split('~')[0]
        const {map} = jb.utils.prettyPrintWithPositions(jbToUse.comps[compId],{initialPath: compId, comps: jbToUse.comps})
        return map[path]
    },
    getPathOfPos(compId,pos,jbToUse = jb) {
        const { text, map } = jb.utils.prettyPrintWithPositions(jbToUse.comps[compId],{initialPath: compId, comps: jbToUse.comps})
        map.cursor = [pos.line,pos.col,pos.line,pos.col]
        const locationMap = jb.textEditor.enrichMapWithOffsets(text, map)
        const res = jb.textEditor.pathOfPosition({text, locationMap}, locationMap.cursor.offset_from )
        return res && res.path.split('~!')[0]
    },
    closestComp(fileContent, pos) {
        const lines = fileContent.split('\n')
        const closestComp = lines.slice(0,pos.line+1).reverse().findIndex(line => line.match(/^jb.component\(/))
        if (closestComp == -1) return {}
        const componentHeaderIndex = pos.line - closestComp
        const compId = (lines[componentHeaderIndex].match(/'([^']+)'/)||['',''])[1]
        const linesFromComp = lines.slice(componentHeaderIndex)
        const compLastLine = linesFromComp.findIndex(line => line.match(/^}\)\s*$/))
        const nextjbComponent = lines.slice(componentHeaderIndex+1).findIndex(line => line.match(/^jb.component/))
        if (nextjbComponent != -1 && nextjbComponent < compLastLine) {
          jb.logError('textEditor - can not find end of component', { compId, linesFromComp })
          return {}
        }
        const compSrc = linesFromComp.slice(0,compLastLine+1).join('\n')
        return {compId, compSrc, componentHeaderIndex, compLastLine}
    },
    formatComponent(fileContent, pos, jbToUse = jb) {
        const {compId, compSrc, componentHeaderIndex, compLastLine} = jb.textEditor.closestComp(fileContent, pos)
        if (!compId) return {}
        if (jb.utils.eval(compSrc,jbToUse.frame) === Symbol.for('parseError'))
            return []
        return {text: jb.utils.prettyPrintComp(compId,jbToUse.comps[compId],{comps: jbToUse.comps}) + '\n',
            from: {line: componentHeaderIndex, col: 0}, to: {line: componentHeaderIndex+compLastLine+1, col: 0} }
    },
    posFromCM: pos => pos && ({line: pos.line, col: pos.ch}),
    cm_hint(cmEditor) {
        const cursor = cmEditor.getDoc().getCursor()
        return {
            from: cursor, to: cursor,
            list: jb.textEditor.getSuggestions(cmEditor.getValue(),posFromCM(cursor)).suggestions
        }
    }    
})

jb.component('watchableAsText', {
  type: 'data',
  params: [
    {id: 'ref', as: 'ref', dynamic: true},
    {id: 'oneWay', as: 'boolean', defaultValue: true, type: 'boolean'}
  ],
  impl: (ctx,refF,oneWay) => ({
        oneWay,
        getRef() {
            return this.ref || (this.ref = refF())
        },
        handler: jb.db.simpleValueByRefHandler,
        getVal() {
            return jb.val(this.getRef())
        },
        prettyPrintWithPositions() {
            const ref = this.getRef()
            if (!ref) {
                jb.logError('no ref at watchableAsText',{ctx})
                this.text = ''
                this.locationMap = {}
                return
            }
            const initialPath = ref.handler.pathOfRef(ref).join('~')
            const res = jb.utils.prettyPrintWithPositions(this.getVal() || '',{initialPath, comps: ref.jbToUse && ref.jbToUse.comps})
            this.locationMap = jb.textEditor.enrichMapWithOffsets(res.text, res.map)
            this.text = res.text.replace(/\s*(\]|\})$/,'\n$1')
        },
        writeFullValue(newVal) {
            jb.db.writeValue(this.getRef(),newVal,ctx)
            this.prettyPrintWithPositions()
        },
        $jb_val(value) { try {
            if (value === undefined) {
                this.prettyPrintWithPositions()
                return this.text
            } else {
                jb.textEditor.setStrValue(value,this.getRef(),ctx)
                this.prettyPrintWithPositions() // refreshing location map
            }
        } catch(e) {
            jb.logException(e,'watchable-obj-as-text-ref',{ctx})
        }},

        $jb_observable(cmp) {
            return jb.watchable.refObservable(this.getRef(),{cmp, includeChildren: 'yes'})
        }
    })
})

// jb.component('textEditor.withCursorPath', {
//   type: 'action',
//   params: [
//     {id: 'action', type: 'action', dynamic: true, mandatory: true},
//     {id: 'selector', as: 'string', defaultValue: '#editor'}
//   ],
//   impl: (ctx,action,selector) => {
//         let editor = ctx.vars.editor
//         if (!editor) {
//             const elem = selector ? jb.ui.widgetBody(ctx).querySelector(selector) : jb.ui.widgetBody(ctx);
//             editor = jb.path(elem,'_component.editor')
//         }
//         if (editor && editor.getCursorPos)
//             action(editor.ctx().setVars({
//                 cursorPath: jb.textEditor.pathOfPosition(editor.data_ref, editor.getCursorPos()).path,
//                 cursorCoord: editor.cursorCoords()
//             }))
//     }
// })

jb.component('textEditor.isDirty', {
  impl: ctx => {
        try {
            return ctx.vars.editor().isDirty()
        } catch (e) {}
    }
})

// jb.component('text-editor.watch-source-changes', { /* textEditor.watchSourceChanges */
//   type: 'feature',
//   params: [

//   ],
//   impl: ctx => ({ init: cmp => {
//       try {
//         const text_ref = cmp.state.databindRef
//         const data_ref = text_ref.getRef()
//         jb.db.isWatchable(data_ref) && jb.watchable.refObservable(data_ref,{cmp,srcCtx: cmp.ctx, includeChildren: 'yes'})
//             .subscribe(e => {
//             const path = e.path
//             const editor = cmp.editor
//             const locations = cmp.state.databindRef.locationMap
//             const loc = locations[path.concat('!value').join('~')]
//             const newVal = jb.utils.prettyPrint(e.newVal)
//             editor.replaceRange(newVal, {line: loc[0], col:loc[1]}, {line: loc[2], col: loc[3]})
//             const newEndPos = jb.utils.advanceLineCol({line: loc[0], col:loc[1]}, newVal)
//             editor.markText({line: loc[0], col:loc[1]}, {line: newEndPos.line, col: newEndPos.col},{
//                 className: 'jb-highlight-comp-changed'
//             })
//             })
//         } catch (e) {}
//     }})
// })

jb.component('textEditor.cursorPath', {
    params: [
        {id: 'watchableAsText', as: 'ref', mandatory: true, description: 'the same that was used for databind'},
        {id: 'cursorPos', dynamic: true, defaultValue: '%$ev/selectionStart%'},
    ],  
    impl: (ctx,ref,pos) => jb.path(jb.textEditor.pathOfPosition(ref, pos()),'path') || ''
})

jb.component('textarea.initTextareaEditor', {
  type: 'feature',
  impl: features(
      textEditor.enrichUserEvent(),
      frontEnd.method('replaceRange',({data},{cmp}) => {
          const {text, from, to} = data
          const _from = jb.textEditor.lineColToOffset(cmp.base.value,from)
          const _to = jb.textEditor.lineColToOffset(cmp.base.value,to)
          cmp.base.value = cmp.base.value.slice(0,_from) + text + cmp.base.value.slice(_to)
      }),
      frontEnd.method('setSelectionRange',({data},{cmp}) => {
        const from = data.from || data
        const to = data.to || from
        const _from = jb.textEditor.lineColToOffset(cmp.base.value,from)
        const _to = to && jb.textEditor.lineColToOffset(cmp.base.value,to) || _from
        cmp.base.setSelectionRange(_from,_to)
      })
    )
})

jb.component('textEditor.enrichUserEvent', {
    type: 'feature',
    params: [
      {id: 'textEditorSelector', as: 'string', description: 'used for external buttons'}
    ],
    impl: features(
		frontEnd.var('textEditorSelector','%$textEditorSelector%'),
        frontEnd.enrichUserEvent((ctx,{cmp,textEditorSelector}) => {
            const elem = textEditorSelector ? jb.ui.widgetBody(ctx).querySelector(textEditorSelector) : cmp.base
            return elem && {
                outerHeight: jb.ui.outerHeight(elem), 
                outerWidth: jb.ui.outerWidth(elem), 
                clientRect: elem.getBoundingClientRect(),
                text: elem.value,
                selectionStart: jb.textEditor.offsetToLineCol(elem.value,elem.selectionStart)
            }
        })
    )
})
  

//   frontEnd.init((ctx,{cmp}) => {
//         const data_ref = ctx.vars.$model.databind()
//         jb.val(data_ref) // calc text
//         cmp.editor = {
//             ctx: () => cmp.ctx,
//             data_ref,
//             getCursorPos: () => offsetToLineCol(cmp.base.value,cmp.base.selectionStart),
//             cursorCoords: () => {},
//             markText: () => {},
//             replaceRange: (text, from, to) => {
//                 const _from = jb.textEditor.lineColToOffset(cmp.base.value,from)
//                 const _to = jb.textEditor.lineColToOffset(cmp.base.value,to)
//                 cmp.base.value = cmp.base.value.slice(0,_from) + text + cmp.base.value.slice(_to)
//             },
//             setSelectionRange: (from, to) => {
//                 const _from = jb.textEditor.lineColToOffset(cmp.base.value,from)
//                 const _to = to && jb.textEditor.lineColToOffset(cmp.base.value,to) || _from
//                 cmp.base.setSelectionRange(_from,_to)
//             },
//         }
//         if (cmp.ctx.vars.editorContainer)
//             cmp.ctx.vars.editorContainer.editorCmp = cmp
//     }
//   )
// })