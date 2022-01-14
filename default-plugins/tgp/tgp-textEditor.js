
jb.extension('tgpTextEditor', {
    getSinglePathChange(diff, currentVal) {
        return pathAndValueOfSingleChange(diff,'',currentVal)
    
        function pathAndValueOfSingleChange(obj, pathSoFar, currentVal) {
            if (currentVal === undefined || (typeof obj !== 'object' && obj !== undefined))
                return { innerPath: pathSoFar, innerValue: obj }
            const entries = jb.entries(obj)
            if (entries.length != 1 || Object.values(jb.path(entries,'0.1')||{})[0]== '__undefined') // if not single returns empty answer
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
            const {innerPath, innerValue} = jb.tgpTextEditor.getSinglePathChange(diff,currentVal) // one diff
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
        const res = text.split('\n').slice(0,line).reduce((sum,line)=> sum+line.length+1,0) + col
        if (isNaN(res)) debugger
        return res
    },
    offsetToLineCol(text,offset) {
        const cut = text.slice(0,offset)
        return { line: (cut.match(/\n/g) || []).length || 0,
            col: offset - (cut.indexOf('\n') == -1 ? 0 : (cut.lastIndexOf('\n') +1)) }
    },
    pathOfPosition(ref,pos) {
        const offset = !Number(pos) ? jb.tgpTextEditor.lineColToOffset(ref.text, pos) : pos
        const charBefore = jb.tgpTextEditor.pathOfOffset(offset-1,ref.locationMap)
        let res = jb.tgpTextEditor.pathOfOffset(offset,ref.locationMap)
        if ((jb.path(charBefore,'0') || '').match(/~!open-by-value/) || (jb.path(res,'0') || '').match(/~!prop/))
            res = charBefore
        return res && {path: res[0], offset: offset - res[1].offset_from}
    },
    pathOfOffset(offset,locationMap) {
        const entries = jb.entries(locationMap).filter(e=> e[1].offset_from <= offset && offset <= e[1].offset_to).filter(x=>x[0] != 'cursor')
        return entries.sort((x,y) => (x[1].offset_to - x[1].offset_from) - (y[1].offset_to - y[1].offset_from) )[0] // smallest selection
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
        const pathWithOffset = _path ? {path: _path+'~!value',offset:1} : jb.tgpTextEditor.pathOfPosition(data_ref, editor.getCursorPos())
        editor.setValue(text)
        if (pathWithOffset) {
            const _pos = data_ref.locationMap[pathWithOffset.path]
            const pos = _pos && _pos.positions
            if (pos)
                editor.setSelectionRange({line: pos[0], col: pos[1] + (pathWithOffset.offset || 0)})
        }
        editor.focus && jb.delay(10).then(()=>editor.focus())
    },
    getSuggestions(semanticPath) {
        if (!semanticPath) return []
        const path = semanticPath.path.split('~!')[0]
        const semantic = semanticPath.path.split('~!').pop()
        const profile = jb.tgp.valOfPath(path)
        const prop = profile && typeof profile == 'object' && (semantic.match(/-by-value|-separator-|-profile/) || semantic == 'value')
        const options = prop ? jb.tgp.paramsOfPath(path).filter(p=>jb.tgp.valOfPath(path+'~'+p.id) == null)
            .map(p=> addProperty(p, path + '~' + p.id))
            : []
        return options

        function addProperty(prop,path) { return {
            label: prop.id,
            action: {$: 'tgp.addProperty', path }
        }}
    },
    getPosOfPath(path) {
        const compId = path.split('~')[0]
        const {map} = jb.utils.prettyPrintWithPositions(jb.comps[compId],{initialPath: compId, comps: jb.comps})
        return map[path]
    },
    getPathOfPos(compId,pos,actualText) {
        if (jb.utils.prettyPrintComp(compId,jb.comps[compId]) != actualText)
            return { needsFormat: true }
        const { text, map } = jb.utils.prettyPrintWithPositions(jb.comps[compId],{initialPath: compId, comps: jb.comps})
        map.cursor = [pos.line,pos.col,pos.line,pos.col]
        const locationMap = jb.tgpTextEditor.enrichMapWithOffsets(text, map)
        if (!locationMap.cursor.offset_from)
            return {}
        const semanticPath = jb.tgpTextEditor.pathOfPosition({text, locationMap}, locationMap.cursor.offset_from )
        return { semanticPath, path: semanticPath && semanticPath.path.split('~!')[0] }
    },
    getPathsOfPos(compId,pos,actualText) { // debug
        if (jb.utils.prettyPrintComp(compId,jb.comps[compId]) != actualText)
            return { needsFormat: true }
        const { text, map } = jb.utils.prettyPrintWithPositions(jb.comps[compId],{initialPath: compId, comps: jb.comps})
        map.cursor = [pos.line,pos.col,pos.line,pos.col]
        const locationMap = jb.tgpTextEditor.enrichMapWithOffsets(text, map)
        if (!locationMap.cursor.offset_from)
            return {}
        return jb.tgpTextEditor.pathsOfPosition({text, locationMap}, locationMap.cursor.offset_from )
    },
    pathsOfPosition(ref,pos) { // debug
        const offset = !Number(pos) ? jb.tgpTextEditor.lineColToOffset(ref.text, pos) : pos
        return {offset, relevant: jb.entries(ref.locationMap).filter(([path,r]) => r.offset_from -1 <= offset && offset <= r.offset_to)
            .map(([path,r]) => `${r.offset_from}-${r.offset_to} ${path}`) }
    },    
    posFromCM: pos => pos && ({line: pos.line, col: pos.ch}),
    cm_hint(cmEditor) {
        const cursor = cmEditor.getDoc().getCursor()
        return {
            from: cursor, to: cursor,
            list: jb.tgpTextEditor.getSuggestions(cmEditor.getValue(),posFromCM(cursor)).suggestions
        }
    }
})

jb.component('tgp.profileAsText', {
  type: 'data',
  params: [
    {id: 'path', as: 'string'},
    {id: 'oneWay', as: 'boolean', defaultValue: true, type: 'boolean'},
  ],
  impl: tgpTextEditor.watchableAsText(tgp.ref('%$path%'),'%$oneWay%')
})

jb.component('tgpTextEditor.watchableAsText', {
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
            const res = jb.utils.prettyPrintWithPositions(this.getVal() || '',{initialPath, comps: jb.comps})
            this.locationMap = jb.tgpTextEditor.enrichMapWithOffsets(res.text, res.map)
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
                jb.tgpTextEditor.setStrValue(value,this.getRef(),ctx)
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

jb.component('tgpTextEditor.withCursorPath', {
  type: 'action',
  params: [
    {id: 'action', type: 'action', dynamic: true, mandatory: true},
    {id: 'selector', as: 'string', defaultValue: '#editor'}
  ],
  impl: (ctx,action,selector) => {
        let editor = ctx.vars.editor
        if (!editor) {
            const elem = selector ? jb.ui.widgetBody(ctx).querySelector(selector) : jb.ui.widgetBody(ctx);
            editor = jb.path(elem,'_component.editor')
        }
        debugger
        if (editor && editor.getCursorPos)
            action(editor.ctx().setVars({
                cursorPath: jb.tgpTextEditor.pathOfPosition(editor.data_ref, editor.getCursorPos()).path,
                cursorCoord: editor.cursorCoords()
            }))
    }
})

jb.component('tgpTextEditor.isDirty', {
  impl: ctx => {
        try {
            return ctx.vars.editor().isDirty()
        } catch (e) {}
    }
})

// jb.component('text-editor.watch-source-changes', { /* tgpTextEditor.watchSourceChanges */
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

jb.component('tgpTextEditor.cursorPath', {
    params: [
        {id: 'watchableAsText', as: 'ref', mandatory: true, description: 'the same that was used for databind'},
        {id: 'cursorPos', dynamic: true, defaultValue: '%$ev/selectionStart%'},
    ],  
    impl: (ctx,ref,pos) => jb.path(jb.tgpTextEditor.pathOfPosition(ref, pos()),'path') || ''
})

  