
jb.component('tgpTextEditor.init', {
  type: 'feature',
  impl: features(
    tgpTextEditor.enrichUserEvent(),
    frontEnd.method('replaceRange',({data},{cmp}) => {
        const {text, from, to} = data
        const _from = jb.tgpTextEditor.lineColToOffset(cmp.base.value,from)
        const _to = jb.tgpTextEditor.lineColToOffset(cmp.base.value,to)
        cmp.base.value = cmp.base.value.slice(0,_from) + text + cmp.base.value.slice(_to)
    }),
    frontEnd.method('setSelectionRange',({data},{cmp}) => {
        const from = data.from || data
        const to = data.to || from
        const _from = jb.tgpTextEditor.lineColToOffset(cmp.base.value,from)
        const _to = to && jb.tgpTextEditor.lineColToOffset(cmp.base.value,to) || _from
        cmp.base.setSelectionRange(_from,_to)
    }),
    method('onChangeSelection', (ctx,{cmp, ev, $model}) => {
        jb.tgpTextEditor.updatePosVariables(ev)
    }),
    feature.userEventProps('ctrlKey,altKey'),
  
    frontEnd.init(({},{cmp}) => {
        //const data_ref = ctx.vars.$model.databind()
        //jb.val(data_ref) // calc text
        cmp.tgpTextEditor = {
            replaceRange: (text, from, to) => {
                const _from = jb.tgpTextEditor.lineColToOffset(cmp.base.value,from)
                const _to = jb.tgpTextEditor.lineColToOffset(cmp.base.value,to)
                cmp.base.value = cmp.base.value.slice(0,_from) + text + cmp.base.value.slice(_to)
            },
            setSelectionRange: (from, to) => {
                const _from = jb.tgpTextEditor.lineColToOffset(cmp.base.value,from)
                const _to = to && jb.tgpTextEditor.lineColToOffset(cmp.base.value,to) || _from
                cmp.base.setSelectionRange(_from,_to)
            },
        }
    })
    )
})

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
        return text.split('\n').slice(0,line).reduce((sum,line)=> sum+line.length+1,0) + col
    },
    offsetToLineCol(text,offset) {
        return { line: (text.slice(0,offset).match(/\n/g) || []).length || 0,
            col: offset - text.slice(0,offset).lastIndexOf('\n') }
    },
    pathOfPosition(ref,_pos) {
        const offset = !Number(_pos) ? jb.tgpTextEditor.lineColToOffset(ref.text, _pos) : _pos
        const charBefore = jb.tgpTextEditor.pathOfOffset(offset-1,ref.locationMap)
        const found = (jb.path(charBefore,'0') || '').match(/~!open-by-value/) ? charBefore : jb.tgpTextEditor.pathOfOffset(offset,ref.locationMap)
        if (found)
            return {path: found[0], offset: offset - found[1].offset_from}
    },
    pathOfOffset(offset,locationMap) {
        const entries = jb.entries(locationMap).filter(e=> e[1].offset_from <= offset && offset < e[1].offset_to)
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
        const semanticPath = jb.tgpTextEditor.pathOfPosition({text, locationMap}, locationMap.cursor.offset_from )
        return { semanticPath, path: semanticPath && semanticPath.path.split('~!')[0] }
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
          jb.logError('tgpTextEditor - can not find end of component', { compId, linesFromComp })
          return {}
        }
        const compSrc = linesFromComp.slice(0,compLastLine+1).join('\n')
        return {compId, compSrc, componentHeaderIndex, compLastLine}
    },
    formatComponent(fileContent, pos) {
        const {compId, compSrc, componentHeaderIndex, compLastLine} = jb.tgpTextEditor.closestComp(fileContent, pos)
        if (!compId) return {}
        if (jb.utils.eval(compSrc,jb.frame) === Symbol.for('parseError'))
            return []
        return {text: jb.utils.prettyPrintComp(compId,jb.comps[compId],{comps: jb.comps}) + '\n',
            from: {line: componentHeaderIndex, col: 0}, to: {line: componentHeaderIndex+compLastLine+1, col: 0} }
    },

    calcActiveEditorPath(editorEvent) {
        const {line,col} = editorEvent.selectionStart
        const lines = editorEvent.text.split('\n')
        const closestComp = lines.slice(0,line+1).reverse().findIndex(line => line.match(/^jb.component\(/))
        if (closestComp == -1) return { // TODO: snippet

        }
        const componentHeaderIndex = line - closestComp
        const compId = (lines[componentHeaderIndex].match(/'([^']+)'/)||['',''])[1]
        const linesFromComp = lines.slice(componentHeaderIndex)
        const compLastLine = linesFromComp.findIndex(line => line.match(/^}\)\s*$/))
        const actualText = lines.slice(componentHeaderIndex,componentHeaderIndex+compLastLine+1).join('\n')
        return { compId, ...jb.tgpTextEditor.getPathOfPos(compId, {line: line-componentHeaderIndex,col}, actualText) }
    },
    updatePosVariables(editorEvent) {
        const { compId, path, semanticPath } = jb.tgpTextEditor.calcActiveEditorPath(editorEvent)
        //vscodeNS.commands.executeCommand('setContext', 'jbart.inComponent', !!(compId || path))
        const fixedPath = path || compId && `${compId}~impl`
        if (fixedPath) {
            const ctx = new jb.core.jbCtx({},{vars: {headlessWidget: true, fromTgpTextEditor: true}})
            jb.db.writeValue(ctx.exp('%$studio/jbEditor/selected%','ref'), fixedPath ,ctx)
            semanticPath && jb.db.writeValue(ctx.exp('%$studio/semanticPath%','ref'), semanticPath.path ,ctx)

            const circuitOptions = jb.tgp.circuitOptions(fixedPath.split('~')[0])
            if (circuitOptions && circuitOptions[0])
                jb.db.writeValue(ctx.exp('%$studio/circuit%','ref'), circuitOptions[0] ,ctx)
            const profilePath = (fixedPath.match(/^[^~]+~impl/) || [])[0]
            if (profilePath)
                jb.db.writeValue(ctx.exp('%$studio/profile_path%','ref'), profilePath ,ctx)
        }
    },
    componentTextInEditor(fileContent, compId) {
        const lines = fileContent.split('\n').map(x=>x.replace(/[\s]*$/,''))
        const lineOfComp = lines.findIndex(line=> line.indexOf(`jb.component('${compId}'`) == 0)
        if (lineOfComp == -1) return {}
        const linesFromComp = lines.slice(lineOfComp)
        const compLastLine = linesFromComp.findIndex(line => line.match(/^}\)\s*$/))
        const nextjbComponent = lines.slice(lineOfComp+1).findIndex(line => line.match(/^jb.component/))
        if (nextjbComponent != -1 && nextjbComponent < compLastLine)
          return jb.logError('can not find end of component', {compId, linesFromComp})
        return { lineOfComp, content: linesFromComp.slice(0,compLastLine+1).join('\n') }
    },
    deltaFileContent(fileContent, {compId,comp}) {
        const { lineOfComp, content} = jb.vscode.componentTextInEditor(fileContent,compId)
        const newCompContent = comp ? jb.utils.prettyPrintComp(compId,comp,{comps: jb.comps}) : ''
        const justCreatedComp = !content.length && comp[jb.core.location][1] == 'new'
        if (justCreatedComp) {
          comp[jb.core.location][1] == lines.length
          return { range: {start: { line: lines.length, character: 0}, end: {line: lines.length, character: 0} } , newText: '\n\n' + newCompContent }
        }
        const {common, oldText, newText} = calcDiff(content, newCompContent)
        const commonStartSplit = common.split('\n')
        // using vscode terminology
        const start = {line: lineOfComp + commonStartSplit.length - 1, character: commonStartSplit.slice(-1)[0].length }
        const end = { line: start.line + oldText.split('\n').length -1, 
          character : (oldText.split('\n').length-1 ? 0 : start.character) + oldText.split('\n').pop().length }
        return { range: {start, end} , newText }
      
        // the diff is continuous, so we cut the common parts at the begining and end 
        function calcDiff(oldText,newText)  {
          let i=0;j=0;
          while(newText[i] == oldText[i] && i < newText.length) i++
          const common = oldText.slice(0,i)
          oldText = oldText.slice(i); newText = newText.slice(i);
          while(newText[newText.length-j] == oldText[oldText.length-j] && j < newText.length) j++ // calc backwards from the end
          return {firstDiff: i, common, oldText: oldText.slice(0,-j+1), newText: newText.slice(0,-j+1)}
        }
    },
    async applyEdits(editorEvent, edits) {
    },
   // commands
    async formatComponent(editorEvent) {
        const { compId, needsFormat } = jb.tgpTextEditor.calcActiveEditorPath(editorEvent)
        if (needsFormat) {
            try {
                const oldLocation = jb.comps[compId][jb.core.location]
                jb.frame.eval(jb.tgpTextEditor.componentTextInEditor(editorEvent.text,compId).content || '')
                jb.comps[compId][jb.core.location] = oldLocation
            } catch (e) {
                return jb.logError('can not parse profile', {e, compId})
            }
            const comp = jb.comps[compId]
            const edits = [jb.tgpTextEditor.deltaFileContent(editorEvent.text, {compId,comp})].filter(x=>x)
            jb.tgpTextEditor.applyEdits(editorEvent, edits)
        }
    },
    onEnter(editorEvent) {
        const { semanticPath, needsFormat } = jb.tgpTextEditor.calcActiveEditorPath(editorEvent)
        if (needsFormat)
            jb.tgpTextEditor.formatComponent(editorEvent)
        else if (semanticPath) {
            let path = semanticPath.path.split('~!')[0]
            const semanticPart = semanticPath.path.split('~!')[1]
            const menu = menuType(path,semanticPart)
            jb.exec({$: 'tgpEditor.openQuickPickMenu', menu: {$: `tgpTextEditor.${menu}`, path, semanticPart }, path })
        }

        function menuType(path,semanticPart) {
            if (jb.tgp.paramDef(path).options)
                return 'selectEnum'
            const profile = jb.tgp.valOfPath(path)
            const params = jb.path(jb.comps[(profile||{}).$],'params') || []
            const firstParamIsArray = params.length == 1 && (params[0] && params[0].type||'').indexOf('[]') != -1
            
            const editMenu = ['value','value-text','prop'].indexOf(semanticPart) != -1 
                || !firstParamIsArray && semanticPart.match(/-by-value|obj-separator-|profile|-sugar/)

            return editMenu ? 'editMenu' : 'selectPT'
        }
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

jb.component('tgpTextEditor.enrichUserEvent', {
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
                selectionStart: jb.tgpTextEditor.offsetToLineCol(elem.value,elem.selectionStart)
            }
        })
    )
})
  

jb.component('tgpTextEditor.openQuickPickMenu', {
    type: 'action',
    params: [
      {id: 'menu', type: 'menu.option', dynamic: true, mandatory: true},
      {id: 'path', as: 'string', mandatory: true},
      {id: 'editorEvent', mandatory: true},
    ],
    impl: menu.openContextMenu({menu: '%$menu%', features: []})
})