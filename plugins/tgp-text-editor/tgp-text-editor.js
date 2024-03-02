using('pretty-print')

extension('tgpTextEditor', {
    initExtension() {
        return { visitedPaths: [], currentVisited : 0}
    },
    evalProfileDef(id, code, pluginId, fileDsl, tgpModel, { cursorPos, fixed, forceLocalSuggestions } = {}) {
        const plugin = jb.path(tgpModel, ['plugins', pluginId])
        const proxies = jb.path(plugin, 'proxies') ? jb.objFromEntries(plugin.proxies.map(id => jb.macro.registerProxy(id))) : jb.macro.proxies
        const context = { jb, ...proxies, dsl: x => jb.dsl(x), component: (...args) => jb.component(...args, { plugin, fileDsl }) }
        try {
            const f = eval(`(function(${Object.keys(context)}) {return ${code}\n})`)
            const res = f(...Object.values(context))
            if (!id) return { res }

            const comp = res
            const type = comp.type || ''
            const dsl = fileDsl || plugin.dsl || type.indexOf('<') != -1 && type.split(/<|>/)[1]
            comp.$dsl = dsl
            const compId = jb.utils.resolveSingleComp(comp, id, { tgpModel, dsl })
            comp.$location = jb.path(tgpModel,[compId,'$location'])
            comp.$comp = true
            //jb.comps[compId] = comp // really?!!
            if (forceLocalSuggestions && jb.plugins[pluginId]) {
                const compToRun = f(...Object.values(context))
                jb.comps[compId] = compToRun
                compToRun.$dsl = dsl
                compToRun.$plugin = pluginId
                jb.utils.resolveSingleComp(compToRun, id, {dsl})
                compToRun.$location = jb.path(jb.comps,[compId,'$location'])
            }
            return tgpModel.currentComp = { comp, compId }
        } catch (e) {
            if (fixed)
                return { compilationFailure: true, err: e }
            const newCode = cursorPos && fixCode()
            if (!newCode)
                return { compilationFailure: true, err: e }
            return jb.tgpTextEditor.evalProfileDef(id, newCode, pluginId, fileDsl, tgpModel, { cursorPos, fixed: true })
        }

        function fixCode() {
            const lines = code.split('\n')
            const { line, col } = cursorPos
            const currentLine = lines[line]
            const fixedLine = currentLine && fixLineAtCursor(currentLine, col)
            if (currentLine && fixedLine != currentLine)
                return lines.map((l, i) => i == line ? fixedLine : l).join('\n')
        }

        function fixLineAtCursor(line, pos) {
            const rest = line.slice(pos)
            const to = pos + (rest.match(/^[a-zA-Z0-9$_\.]+/) || [''])[0].length
            const from = pos - (line.slice(0, pos).match(/[a-zA-Z0-9$_\.]+$/) || [''])[0].length
            const word = line.slice(from, to)
            const noCommaNoParan = rest.match(/^[a-zA-Z0-9$_\.]*\s*$/)
            const func = rest.match(/^[a-zA-Z0-9$_\.]*\s*\(/)
            const replaceWith = noCommaNoParan ? 'TBD(),' : func ? isValidFunc(word) ? word : 'TBD' : 'TBD()'
            return line.slice(0, from) + replaceWith + line.slice(to)
        }
        function isValidFunc(f) {
            return f.trim() != '' && (jb.macro.proxies[f] || jb.frame[f])
        }
    },
    pathVisited(e) {
        const {visitedPaths} = jb.tgpTextEditor
        const idx = visitedPaths.findIndex(entry=>e.path == entry.path)
        if (visitedPaths.length && idx == visitedPaths.length -1) return
        if (idx != -1)
            visitedPaths.splice(idx,1)
        visitedPaths.push(e)
        jb.tgpTextEditor.currentVisited = 0
    },
    visitLastPath() {
        jb.tgpTextEditor.currentVisited++
        const {visitedPaths, currentVisited} = jb.tgpTextEditor
        const idx = visitedPaths.length-currentVisited-1
        if (idx > -1)
            jb.tgpTextEditor.host.gotoFilePos(visitedPaths[idx].filePos)
    },
    getSinglePathChange(diff, currentVal) {
        return pathAndValueOfSingleChange(diff, '', currentVal)

        function pathAndValueOfSingleChange(obj, pathSoFar, currentVal) {
            if (jb.utils.isPrimitiveValue(currentVal) || currentVal === undefined || (typeof obj !== 'object' && obj !== undefined))
                return { innerPath: pathSoFar, innerValue: obj }
            const entries = jb.entries(obj)
            if (entries.length != 1 || Object.values(jb.path(entries, '0.1') || {})[0] == '__undefined') // if not single key returns empty answer
                return {}
            return pathAndValueOfSingleChange(entries[0][1], pathSoFar + '~' + entries[0][0], currentVal[entries[0][0]])
        }
    },
    setStrValue(value, ref, ctx) {
        const notPrimitive = value.match(/^\s*[a-zA-Z0-9\._]*\(/) || value.match(/^\s*(\(|{|\[)/) || value.match(/^\s*ctx\s*=>/) || value.match(/^function/);
        const { res, err } = notPrimitive ? jb.tgpTextEditor.evalProfileDef('', value) : value
        if (err) return
        const newVal = notPrimitive ? res : value
        // I had a guess that ',' at the end of line means editing, YET, THIS GUESS DID NOT WORK WELL ...
        // if (typeof newVal === 'object' && value.match(/,\s*}/m))
        //     return
        const currentVal = jb.val(ref)
        if (newVal && typeof newVal === 'object' && typeof currentVal === 'object') {
            const diff = jb.utils.objectDiff(newVal, currentVal)
            if (Object.keys(diff).length == 0) return // no diffs
            const { innerPath, innerValue } = jb.tgpTextEditor.getSinglePathChange(diff, currentVal) // one diff
            if (innerPath) {
                const fullInnerPath = ref.handler.pathOfRef(ref).concat(innerPath.slice(1).split('~'))
                return jb.db.writeValue(ref.handler.refOfPath(fullInnerPath), innerValue, ctx)
            }
        }
        if (newVal !== undefined) { // many diffs
            currentVal && currentVal.$location && typeof newVal == 'object' && (newVal.$location = currentVal.$location)
            jb.db.writeValue(ref, newVal, ctx)
        }
    },
    lineColToOffset(text, { line, col }) {
        const res = text.split('\n').slice(0, line).reduce((sum, line) => sum + line.length + 1, 0) + col
        if (isNaN(res)) debugger
        return res
    },
    offsetToLineCol(text, offset) {
        const cut = text.slice(0, offset)
        return {
            line: (cut.match(/\n/g) || []).length || 0,
            col: offset - (cut.indexOf('\n') == -1 ? 0 : (cut.lastIndexOf('\n') + 1))
        }
    },
    // refreshEditor(cmp,_path) {
    //     const editor = cmp.editor
    //     const data_ref = cmp.ctx.vars.$model.databind()
    //     const text = jb.tostring(data_ref)
    //     const pathWithOffset = _path ? {path: _path+'~!value',offset:1} : jb.tgpTextEditor.pathOfPosition(data_ref, editor.getCursorPos())
    //     editor.setValue(text)
    //     if (pathWithOffset) {
    //         const _pos = data_ref.locationMap[pathWithOffset.path]
    //         const pos = _pos && _pos.positions
    //         if (pos)
    //             editor.setSelectionRange({line: pos[0], col: pos[1] + (pathWithOffset.offset || 0)})
    //     }
    //     editor.focus && jb.delay(10).then(()=>editor.focus())
    // },
    getPosOfPath(path, where = 'edit', { prettyPrintData } = {}) { // edit,begin,end,function
        const compId = path.split('~')[0]
        const { actionMap, text, startOffset } = prettyPrintData || jb.utils.prettyPrintWithPositions(jb.comps[compId], { initialPath: compId })
        const item = actionMap.find(e => e.action == `${where}!${path}`)
        if (!item) return { line: 0, col: 0 }
        return jb.tgpTextEditor.offsetToLineCol(text, item.from - startOffset)
    },
    filePosOfPath(tgpPath) {
        const compId = tgpPath.split('~')[0]
        const loc = jb.comps[compId].$location
        const path = jb.path(jb, 'studio.host') ? jb.studio.host.locationToPath(loc.path) : loc.path
        const compLine = (+loc.line) || 0
        const { line, col } = jb.tgpTextEditor.getPosOfPath(tgpPath, 'begin')
        return { path, line: line + compLine, col }
    },
    pathOfPosition(ref, pos) {
        if (pos == null) return ''
        const offset = !Number(pos) ? jb.tgpTextEditor.lineColToOffset(ref.text, pos) : pos
        return ref.actionMap.filter(e => e.from <= offset && offset < e.to || (e.from == e.to && e.from == offset)).map(e => e.action.split('!').pop())[0]
    },
    closestComp(docText, cursorLine, cursorCol, filePath) {
        const lines = docText.split('\n')
        const dsl = lines.map(l => (l.match(/^dsl\('([^']+)/) || ['', ''])[1]).filter(x => x)[0]
        const lineText = lines[cursorLine]
        const reversedLines = lines.slice(0, cursorLine + 1).reverse()
        const compLine = cursorLine - reversedLines.findIndex(line => line.match(/^(component|extension)\(/))
        if (compLine > cursorLine) return { notJbCode: true }
        if (lines[compLine].match(/^extension/)) return { inExtension: true, lineText, cursorCol }
        if (!lines[compLine])
            return { error: 'can not find comp', cursorLine, compLine, docText }

        const shortId = (lines[compLine].match(/'([^']+)'/) || ['', ''])[1]
        const linesFromComp = lines.slice(compLine)
        const compLastLine = linesFromComp.findIndex(line => line.match(/^}\)\s*$/))
        const nextjbComponent = lines.slice(compLine + 1).findIndex(line => line.match(/^component/))
        if (nextjbComponent != -1 && nextjbComponent < compLastLine) {
            jb.logError('workspace - can not find end of component', { shortId, linesFromComp })
            return {}
        }
        const compText = linesFromComp.slice(0, compLastLine + 1).join('\n')
        const inCompOffset = jb.tgpTextEditor.lineColToOffset(compText, { line: cursorLine - compLine, col: cursorCol })
        return { compText, compLine, inCompOffset, shortId, cursorLine, cursorCol, filePath, dsl, lineText }
    },
    deltaFileContent(compText, newCompText, compLine) {
        const { common, oldText, newText } = calcDiff(compText, newCompText || '')
        const commonStartSplit = common.split('\n')
        const start = { line: compLine + commonStartSplit.length - 1, col: commonStartSplit.slice(-1)[0].length }
        const end = {
            line: start.line + oldText.split('\n').length - 1,
            col: (oldText.split('\n').length - 1 ? 0 : start.col) + oldText.split('\n').pop().length
        }
        return { range: { start, end }, newText }

        // the diff is continuous, so we cut the common parts at the begining and end 
        function calcDiff(oldText, newText) {
            let i = 0; j = 0;
            while (newText[i] == oldText[i] && i < newText.length) i++
            const common = oldText.slice(0, i)
            oldText = oldText.slice(i); newText = newText.slice(i);
            while (newText[newText.length - j] == oldText[oldText.length - j] && j < oldText.length && j < newText.length) j++ // calc backwards from the end
            if (newText[newText.length - j] != oldText[oldText.length - j]) j--
            return { firstDiff: i, common, oldText: oldText.slice(0, -j), newText: newText.slice(0, -j) }
        }
    },
    posFromCM: pos => pos && ({ line: pos.line, col: pos.ch }),
})

component('tgpTextEditor.watchableAsText', {
    type: 'data',
    params: [
        { id: 'ref', as: 'ref', dynamic: true },
        { id: 'oneWay', as: 'boolean', defaultValue: true, type: 'boolean' }
    ],
    impl: (ctx, refF, oneWay) => ({
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
                jb.logError('no ref at watchableAsText', { ctx })
                this.text = ''
                this.actionMap = {}
                return
            }
            const initialPath = ref.handler.pathOfRef(ref).join('~')
            const { actionMap, text } = jb.utils.prettyPrintWithPositions(this.getVal() || '', { initialPath, comps: jb.comps })
            this.actionMap = actionMap
            this.text = text.replace(/\s*(\]|\})$/, '\n$1')
        },
        writeFullValue(newVal) {
            jb.db.writeValue(this.getRef(), newVal, ctx)
            this.prettyPrintWithPositions()
        },
        $jb_val(value) {
            try {
                if (value === undefined) {
                    this.prettyPrintWithPositions()
                    return this.text
                } else {
                    jb.tgpTextEditor.setStrValue(value, this.getRef(), ctx)
                    this.prettyPrintWithPositions() // refreshing location map
                }
            } catch (e) {
                jb.logException(e, 'watchable-obj-as-text-ref', { ctx })
            }
        },

        $jb_observable(cmp) {
            return jb.watchable.refObservable(this.getRef(), { cmp, includeChildren: 'yes' })
        }
    })
})

// component('tgpTextEditor.withCursorPath', {
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
//         debugger
//         if (editor && editor.getCursorPos)
//             action(editor.ctx().setVars({
//                 cursorPath: jb.tgpTextEditor.pathOfPosition(editor.data_ref, editor.getCursorPos()).path,
//                 cursorCoord: editor.cursorCoords()
//             }))
//     }
// })

// component('tgpTextEditor.isDirty', {
//   impl: ctx => {
//         try {
//             return ctx.vars.editor().isDirty()
//         } catch (e) {}
//     }
// })

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

component('tgpTextEditor.cursorPath', {
  params: [
    {id: 'watchableAsText', as: 'ref', mandatory: true, description: 'the same that was used for databind'},
    {id: 'cursorPos', dynamic: true, defaultValue: '%$ev/selectionStart%'}
  ],
  impl: (ctx, ref, pos) => jb.tgpTextEditor.pathOfPosition(ref, pos()) || ''
})

component('tgpTextEditor.currentFilePath', {
  impl: ctx => {
        const docProps = ctx.vars.docPropsForTests || jb.tgpTextEditor.host.compTextAndCursor()
        return docProps.filePath
    }
})

component('tgpTextEditor.gotoSource', {
    type: 'action',
    params: [
        { id: 'path', as: 'string' },
        { id: 'chromeDebugger', as: 'boolean', type: 'boolean' }
    ],
    impl: (ctx, path, chromeDebugger) => {
        const filePos = jb.tgpTextEditor.filePosOfPath(path)
        if (jb.frame.jbInvscode)
            jb.vscode['openEditor'](filePos)
        else if (chromeDebugger)
            jb.frame.parent.postMessage({
                runProfile: {
                    $: 'action<>chromeDebugger.openResource',
                    location: [jb.frame.location.origin + '/' + filePos.file, filePos.line, filePos.col]
                }
            })
        else
            jbHost.fetch(`/?op=gotoSource&path=${filePos.path}:${filePos.line}`)
    }
})

