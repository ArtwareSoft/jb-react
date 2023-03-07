
jb.extension('tgp', 'completion', {
    initExtension() { return {
        wrapMetaData: {
                control: 'group',
                style: 'styleWithFeatures',
                data: ['pipeline', 'list', 'firstSucceeding'],
                boolean: ['and', 'or', 'not'],
                action: ['runActions', 'runActionOnItems', 'action.if'],
                feature: ['feature.byCondition']
            }
        }
    },
    async provideCompletionItems({semanticPath, inCompPos, text, compLine}, ctx) {
        const path = semanticPath.path.split('~!')[0]
        const arrayIndex = jb.tgp.calcArrayIndex(semanticPath)
        const allSemantics = semanticPath.allPaths.map(x=>x[0]).filter(x=>x.indexOf(path+'~!') == 0).map(x=>x.split('~!').pop())
        const paramDef = jb.tgp.paramDef(path)
        if (!paramDef) {
            jb.logError('tgpTextEditor completion - can not find paramDef',{path, semanticPath, ctx})
            return []
        }
        
        let res = []
        const singleParamAsArray = jb.tgp.singleParamAsArray(path)
        if (paramDef.options) {
            res = jb.tgp.selectEnumCompletions(path)        
        } else if (singleParamAsArray) {
            res = jb.tgp.newPTCompletions(`${path}~${singleParamAsArray.id}`, arrayIndex)
        } else if (allSemantics.reduce((acc,s) => acc || s.match(/-by-value|obj-separator-|-profile/), false )) {
            res = jb.tgp.paramCompletions(path)
            const textStart = semanticPath.allPaths.find(x=>x[0].match(/~!value-text-start$/))
            if (textStart)
                res = [...res,...jb.tgp.newPTCompletions(textStart[0].split('~!')[0], arrayIndex)]
            const singleValueProfile = semanticPath.allPaths.find(x=>x[0].match(/~!profile/) && x[0].indexOf(path) == 0)
            if (singleValueProfile)
                res = [...res,...jb.tgp.newPTCompletions(singleValueProfile[0].split('~!')[0], arrayIndex)]
        } else if (arrayIndex != null || allSemantics.includes('prop') || allSemantics.includes('profile')) {
            res = jb.tgp.newPTCompletions(path, arrayIndex)
        } else if (allSemantics.includes('value-text') && jb.tgp.isOfType(path,'data')) {
            res = await jb.tgp.dataCompletions({semanticPath, inCompPos, text, compLine}, path, ctx)
        } else if (allSemantics.includes('value')) {
            res = jb.tgp.paramCompletions(path)
        }

        return [...jb.tgp.calcWrapWithCompletions(semanticPath, path), ...res]
    },
    calcWrapWithCompletions(semanticPath, path) {
        const innerPath = semanticPath.allPaths.map(x=>x[0]).filter(x=>x.match('~!value-text-start$')).map(x=>x.split('~!')[0])[0] 
        return [path,innerPath].filter(x=>x).map(path=> jb.tgp.canWrapWithArray(path) ? {
                kind:18, 
                label: `wrap with array`,
                path,
                extend(ctx) { return jb.tgp.wrapWithArrayOp(this.path,ctx) },
            } : null).filter(x=>x).slice(0,1)
    },
    calcArrayIndex(semanticPath) {
        const separatorIndex = (semanticPath.path.match(/separator-([0-9]+)$/) || ['',null])[1]
        const openArray = semanticPath.path.split('~!')[1].indexOf('open-array') == 0
        const closeArray = semanticPath.path.split('~!')[1].indexOf('close-array') == 0
        return openArray ? 0 : closeArray ? -1 : separatorIndex ? (+separatorIndex+1) : null
    },
    async dataCompletions({semanticPath, inCompPos, text, compLine}, path , ctx) {
        const cursor = jb.tgpTextEditor.lineColToOffset(text, inCompPos)
        const text_pos = jb.path(semanticPath.allPaths.filter(x=>x[0].match(/value-text$/)),'0.1')
        const { positions } = text_pos
        const input = { value: text.slice(text_pos.offset_from, text_pos.offset_to), selectionStart: cursor - text_pos.offset_from }

        const suggestions = await ctx.setData(input).run({$: 'probe.suggestionsByCmd', 
            probePath : path, expressionOnly: true })
        return (jb.path(suggestions,'0.options') || []).map(option => {
            const { pos, toPaste, tail, text } = option
            const primiteVal = typeof option.value != 'object'
            const suffix = primiteVal ? '%' : '/'
            const newText = toPaste + suffix
            const line = positions[0] + compLine
            const startInInput = pos - tail.length
            const overlap = calcOverlap(newText, input.value.slice(startInInput))
            const suffixExists = input.value.substr(startInInput + overlap)[0] == suffix
            const newVal = input.value.substr(0,startInInput) + newText + input.value.substr(startInInput + overlap + (suffixExists ? 1 : 0))
            const cursorPos = { line, col: positions[1] + startInInput + toPaste.length + (suffix == '%' ? 2 : 1) }
            return {
                path,
                kind: primiteVal ? 12 : 13, 
                label: text,
                cursorPos,
                newVal,
                extend(ctx) { return {...jb.tgp.writeValueOfPathOp(this.path, this.newVal,ctx), resultSemantics: 'value-text'} },
            }
        })

        function calcOverlap(s1,s2) {
            for(i=0;i<s1.length;i++)
              if (s1[i] != s2[i]) return i
            return s1.length
        }      
    },
    selectEnumCompletions(path) {
        return jb.tgp.paramDef(path).options.split(',').map(label=>({
            kind: 19,
            label,
            path,
            extend(ctx) { return jb.tgp.writeValueOfPathOp(this.path,this.label,ctx) },
        }))
    },
    paramCompletions(path) {
        const params = jb.tgp.paramsOfPath(path).filter(p=> jb.tgp.valOfPath(path+'~'+p.id) === undefined)
            .sort( (p2,p1) => (p1.mandatory ? 1 : 0) - (p2.mandatory ? 1 : 0))
        return params.map(param =>({
            kind: 4,
            id: param.id,
            label: param.id,
            detail: [param.as, param.type, param.description].filter(x=>x).join(' '),
            path,
            extend(ctx) { return jb.tgp.addPropertyOp(`${this.path}~${this.id}`,ctx)},
        }))
    },
    newPTCompletions(path, arrayIndex, ctx) {
        const options = jb.tgp.PTsOfPath(path).map(compName=>{
            const comp = jb.utils.getComp(compName)
            return {
                kind: 2,
                compName,
                arrayIndex,
                label: compName.split('>').pop(),
                path,
                detail: [comp.description,compName.indexOf('>') != -1 && compName.split('>')[0] + '>'].filter(x=>x).join(' '),
                extend(ctx) { return jb.tgp.setPTOp(this.path,this.arrayIndex,this.compName,ctx) },
            }
        })
        return options
    },
	writeValueOfPathOp: (path,value,srcCtx) => {
        return {op: { $set: value} , path,srcCtx, resultSemantics : ['value-text', 'profile']}
    },
	addPropertyOp(path,srcCtx) {
		const param = jb.tgp.paramDef(path)
		const paramType = jb.tgp.paramType(path)
		const result = param.templateValue ? JSON.parse(JSON.stringify(param.templateValue))
			: paramType.indexOf('data') != -1 ? '' : {$: 'TBD'}
		
		return jb.tgp.writeValueOfPathOp(path,result,srcCtx)
	},
	addArrayItemOp(path,{toAdd, index, srcCtx} = {}) {
		const val = jb.tgp.valOfPath(path)
		toAdd = toAdd === undefined ? {$:'TBD'} : toAdd
        const resultSemantics = ['value-text', 'profile']
		if (Array.isArray(val)) {
			if (index === undefined || index == -1)
				return {path, op: { $push: [toAdd] },srcCtx, resultSemantics, resultPath: `${path}~${val.length}` }
			else
				return {path, op: { $splice: [[index,0,toAdd]] } ,srcCtx, resultSemantics, resultPath: `${path}~${index}` }
		}
		else if (!val) {
			return { ...jb.tgp.writeValueOfPathOp(path,jb.asArray(toAdd),srcCtx), resultPath: `${path}~0` }
		} else {
			return { ...jb.tgp.writeValueOfPathOp(path,[val].concat(toAdd),srcCtx), resultPath: `${path}~0` }
		}
	},
	setPTOp(_path, _arrayIndex, compName,srcCtx) {
        const arrayIndex = _arrayIndex == -1 ? null : _arrayIndex
		const profile = jb.tgp.valOfPath(_path)
        const params = jb.tgp.paramsOfPath(_path)
        const singleParamAsArray = jb.tgp.singleParamAsArray(_path)
		let path = singleParamAsArray ? `${_path}~${params[0].id}` : _path
		let index = null
        if (Array.isArray(profile)) {
            index = arrayIndex != null ? arrayIndex : profile.length
        } else if (singleParamAsArray || arrayIndex != null) {
			const ar = profile[params[0].id]
			const lastIndex = Array.isArray(ar) ? ar.length : 1
			index = ar == null ? 0 : arrayIndex != null ? arrayIndex : lastIndex
		}
        const toAdd = jb.tgp.newProfile(jb.tgp.getComp(compName),compName,path)
        const result = index != null ? jb.tgp.addArrayItemOp(path,{toAdd, index,srcCtx}) : jb.tgp.writeValueOfPathOp(path,toAdd,srcCtx)
        result.resultSemantics = ['close-profile','close-by-value']
        return result
	},
    wrapWithArrayOp(path,srcCtx) {
        const toAdd = jb.tgp.valOfPath(path)
        if (toAdd != null && !Array.isArray(toAdd))
            return { ...jb.tgp.writeValueOfPathOp(path,[toAdd],srcCtx), resultSemantics: ['close-array'] }
    }
})

jb.extension('tgpTextEditor', 'completion', {
    $phase: 40,
    initExtension() { 
        return { 
            cache: {}, 
            host: null,
        } 
    },
    calcActiveEditorPath(docProps,{clearCache} = {}) {
        const {docText, cursorLine, cursorCol } = docProps
        const lines = docText.split('\n')
        const dsl = jb.tgpTextEditor.dsl(lines)
        const reversedLines = lines.slice(0,cursorLine+1).reverse()
        const compLine = cursorLine - reversedLines.findIndex(line => line.match(/^jb.(component|extension)\(/))
        if (compLine > cursorLine) return {}
        if (lines[compLine].match('^jb.extension')) return {
            inExtension: true
        }
        if (!lines[compLine])
            return { error: 'can not find comp', cursorLine, compLine, docText}
        const shortId = (lines[compLine].match(/'([^']+)'/)||['',''])[1]
        const compId = dsl && jb.path(jb.utils.getCompByShortIdAndDsl(shortId,dsl),[jb.core.CT,'fullId']) || shortId
        const inCompPos = {line: cursorLine-compLine, col: cursorCol }
        if (!jb.comps[compId]) // new comp
            calcCompProps()
        if (!compId || !jb.comps[compId])
            return { error: 'can not determine compId', compId, shortId , dsl}
        if (clearCache)
            jb.tgpTextEditor.cache[compId] = null
        const compProps = jb.tgpTextEditor.cache[compId] || calcCompProps()
        const { compilationFailure, reformatEdits, text, map } = compProps
        const extraDocProps = { docText, compLine, inCompPos, cursorLine, cursorCol }
        jb.tgpTextEditor.cache[compId] = { ...extraDocProps, ...compProps ,
            ...(compilationFailure || reformatEdits) ? {} : jb.tgpTextEditor.getPathOfPos(inCompPos, text, map) }
        return jb.tgpTextEditor.cache[compId]

        function calcCompProps() { // reformatEdits, compilationFailure, fixedComp
            jb.log('completion calcActiveEditorPath calComp props', {})
            const linesFromComp = lines.slice(compLine)
            const compLastLine = linesFromComp.findIndex(line => line.match(/^}\)\s*$/))
            const actualText = lines.slice(compLine+1,compLine+compLastLine+1).join('\n').slice(0,-1)
            const {text, map} = jb.utils.prettyPrintWithPositions(jb.comps[compId],{initialPath: compId})
            const props = { time: new Date().getTime(), text, map, dsl, compId, shortId, comp : jb.comps[compId] }
            if (actualText != (text||'').slice(2)) {
                const compText = lines.slice(compLine,compLine+compLastLine+1).join('\n')
                let actualComp = jb.tgpTextEditor.evalProfileDef(compText,dsl).res
                if (actualComp) {
                    jb.comps[compId] = actualComp
                    const formattedText = jb.utils.prettyPrintWithPositions(jb.comps[compId],{initialPath: compId}).text
                    if (formattedText == text) 
                        Object.assign(props, {formattedText, reformatEdits: jb.tgpTextEditor.deltaFileContent(docText, compId, formattedText)})
                    else
                        Object.assign(props, {scriptWasFoundDifferent: true, comp: actualComp}) // new comp
                } else { // not compiles
                    const fixProps = jb.tgpTextEditor.fixEditedComp(compId, compText,inCompPos,dsl)
                    // compilationFailure or fixedComp
                    Object.assign(props, { ...fixProps, comp : jb.comps[compId]})    
                }
            }
            return props
        }
    },
    async provideCompletionItems(docProps, ctx) {
        const props = jb.tgpTextEditor.calcActiveEditorPath(docProps, {clearCache: true})
        jb.log('completion calcActiveEditorPath',props)
        const { semanticPath, reformatEdits, compLine, error } = props
        const serverUri = jb.tgpTextEditor.host.serverUri
        if (reformatEdits) {
            const item = { kind: 4, id: 'reformat', label: 'reformat', extend() { }, sortText: '0001',
                command: { command: 'jbart.applyCompChange' , arguments: [{
                    cursorPos: {line: docProps.cursorLine, col: docProps.cursorCol},
                    edit: reformatEdits
                }] },
            }
            return [item]
        } else if (semanticPath) {
            const items = await jb.tgp.provideCompletionItems(props, ctx)
            items.forEach((item,i) => Object.assign(item, {
                compLine,
                insertText: '',
                sortText: ('0000'+i).slice(-4),
                command: { command: 'jbart.applyCompChange' , 
                    arguments: serverUri ? [Object.assign({serverUri, extendCode: item.extend.toString()},item) ] :  [item,ctx] 
                }
            }))
            jb.log('completion completion items',{items, ...docProps, ...props, ctx})
            return items
        } else if (error) {
            jb.logError('completion provideCompletionItems', props)
        }
    },
    async provideDefinition(docProps, ctx) {
        const props = jb.tgpTextEditor.calcActiveEditorPath(docProps, {clearCache: true})
        const { semanticPath, reformatEdits, inExtension, error } = props
        if (reformatEdits)
            jb.tgpTextEditor.host.applyEdit(reformatEdits)
        else if (semanticPath) {
            const path = semanticPath.allPaths.map(x=>x[0]).filter(x=>x.match('~!profile$')).map(x=>x.split('~!')[0])[0]
            const comp = path && jb.tgp.compNameOfPath(path)
            return comp ? jb.utils.getComp(comp)[jb.core.CT].location : provide_func_location()
        } else if (inExtension) {
            return provide_func_location()
        } else if (error) {
            jb.logError('completion provideDefinition',props)
        }

        async function provide_func_location() {
            const {docText, cursorLine } = docProps
            const textLine = docText.split('\n')[cursorLine]
            const [,lib,func] = textLine.match(/jb\.([a-zA-Z_0-9]+)\.([a-zA-Z_0-9]+)/) || ['','','']
            if (lib && jb.path(jb,[lib,'__extensions'])) {
                const loc = Object.values(jb[lib].__extensions).filter(ext=>ext.funcs.includes(func)).map(ext=>ext.location)[0]
                const lineOfExt = (+loc[1]) || 0
                const fileContent = await jbFetchFile(jbBaseUrl + loc[0])
                const lines = ('' + fileContent).split('\n').slice(lineOfExt)
                const funcHeader = new RegExp(`${func}\\s*:|${func}\\s*\\(`) //[^{]+{)`)
                const lineOfFunc = lines.findIndex(l=>l.match(funcHeader))
                return [loc[0], lineOfExt + lineOfFunc]
            }
        }
    },
    calcEditAndGotoPos(docText, item, ctx) {
        const itemProps = {...item, ...item.extend() }
        const {op, path, resultPath, resultSemantics, resultOffset} = itemProps
        const compId = path.split('~')[0]
        if (!jb.utils.getComp(compId))
            return jb.logError(`completion handleScriptChangeOnPreview - missing comp ${compId}`, {path, ctx})
        const handler = jb.watchableComps.startWatch()
        handler.makeWatchable(compId)
        handler.doOp(handler.refOfPath(path.split('~')), op, ctx)

        jb.tgpTextEditor.cache[compId] = Object.assign(jb.tgpTextEditor.cache[compId] || {}, 
            jb.utils.prettyPrintWithPositions(jb.comps[compId],{initialPath: compId}))
        const { text } = jb.tgpTextEditor.cache[compId]
        const edit = jb.tgpTextEditor.deltaFileContent(docText, compId, text)
        const cursorPos = itemProps.cursorPos || calcNewPos()
        return { edit, cursorPos }

        function calcNewPos() {
            const { compLine, text } = jb.tgpTextEditor.cache[compId]
            const pos = jb.tgpTextEditor.getPosOfPath(resultPath || path,resultSemantics)
            jb.log('completion calcNewPos',{resultSemantics, pos})
            if (!pos)
                return jb.logError('completion calcNewPos can not find path', {resultSemantics})
            const inCompPos = {line: pos[0],col: pos[1]}
            const offset = jb.tgpTextEditor.lineColToOffset(text, inCompPos)
            const TBD = (text.slice(offset,offset+4) == 'TBD(' || text.slice(offset-1,offset+1) == '()')
            const emptyStringOffset = text.slice(offset, offset+edit.newText.length).indexOf("''")
            if (emptyStringOffset != -1)
                Object.assign(inCompPos, jb.tgpTextEditor.offsetToLineCol(text,offset+emptyStringOffset+1))
            return {TBD, line: inCompPos.line + compLine, col: inCompPos.col + (resultOffset ? resultOffset : 0) }
        }
    },
    async applyCompChange(item,ctx) {
        if (item.id == 'reformat') return
        ctx = ctx || new jb.core.jbCtx({},{vars: {}, path: 'completion.applyCompChange'})
        const { docText } = jb.tgpTextEditor.host.docTextAndCursor()
        const { edit, cursorPos } = item.edit ? item : item.serverUri ? await remoteCalcEditAndPos() : await jb.tgpTextEditor.calcEditAndGotoPos(docText,item,ctx)       
        try {
            await jb.tgpTextEditor.host.applyEdit(edit)
            if (cursorPos) {
                jb.tgpTextEditor.host.selectRange(cursorPos)
                if (cursorPos.TBD) {
                    await jb.delay(1)
                    await jb.tgpTextEditor.host.execCommand('editor.action.triggerSuggest')
                }
            }
        } catch (e) {
            jb.logException(e,'completion apply comp change',{item,ctx})
        }

        function remoteCalcEditAndPos() {
            return ctx.setData({docText, item}).run(remote.data( ctx => { 
                const {docText, item} = ctx.data
                item.extend = eval('x = function ' +item.extendCode)
                return jb.tgpTextEditor.calcEditAndGotoPos(docText,item,ctx)
            }, jbm.byUri(()=> item.serverUri) ))
        }
    },
    restartLangServer() {
        jb.vscode && (jb.vscode.restartLangServer = true)
    },
    moveUp() { 
        debugger
    },
    moveDown() { 
        debugger
    },
    async moveInArray(docProps, diff) {
        const props = await jb.tgpTextEditor.calcActiveEditorPath(docProps)
        const { semanticPath, reformatEdits } = props
        if (reformatEdits)
            jb.tgpTextEditor.host.applyEdit(reformatEdits)
        else if (semanticPath) {
        }
    }
})