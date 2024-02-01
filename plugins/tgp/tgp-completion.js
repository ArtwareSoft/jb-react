extension('tgp', 'completion', {
    initExtension() { return {
        wrapMetaData: {
                control: 'group',
                style: 'styleWithFeatures',
                data: ['pipeline', 'list', 'firstSucceeding'],
                boolean: ['and', 'or', 'not'],
                action: ['runActions', 'runActionOnItems', 'If'],
                feature: ['feature.byCondition']
            }
        }
    },
    async provideCompletionItems({ actionMap, inCompOffset, text, compLine, filePath, startOffset}, ctx) {
        const actions = actionMap.filter(e=>e.from<= inCompOffset && inCompOffset < e.to || (e.from == e.to && e.from == inCompOffset))
            .map(e=>e.action).filter(e=>e.indexOf('edit!') != 0 && e.indexOf('begin!') != 0 && e.indexOf('end!') != 0)
        if (actions.length == 0) return []
        const res = actions.reduce((acc, action)=>{
            const [op,path] = action.split('!')
            const paramDef = jb.tgp.paramDef(path)
            const toAdd = (op == 'setPT' && paramDef && paramDef.options) ? jb.tgp.selectEnumCompletions(path)
                : op == 'setPT' ? [...jb.tgp.wrapCompletions(path), ...jb.tgp.newPTCompletions(path,'set')]
                : op == 'insertPT' ? jb.tgp.newPTCompletions(path,'insert')
                : op == 'appendPT' ? jb.tgp.newPTCompletions(path,'append')
                : op == 'prependPT' ? jb.tgp.newPTCompletions(path,'prepend')
                : op == 'addProp' ? jb.tgp.paramCompletions(path) : []
            return [...acc,...toAdd]
        },[])
        if (actions[0] && actions[0].indexOf('insideText') == 0)
            return await jb.tgp.dataCompletions({ actionMap, inCompOffset, text, compLine, filePath, startOffset}, actions[0].split('!').pop(), ctx)

        return res 
    },
    wrapCompletions(path) {
        return [path].filter(x=>x).map(path=> jb.tgp.canWrapWithArray(path) ? {
                kind:18, 
                label: `wrap with array`,
                path,
                extend(ctx) { return { ...jb.tgp.wrapWithArrayOp(this.path,ctx), whereToLand: 'end'} },
            } : null).filter(x=>x).slice(0,1)
    },
    async dataCompletions({actionMap,inCompOffset,text,startOffset,filePath, compLine}, path , ctx) {
        const item = actionMap.filter(e=>e.from<= inCompOffset && inCompOffset < e.to || (e.from == e.to && e.from == inCompOffset))
            .find(e=>e.action.indexOf('insideText!') == 0)
        const value = text.slice(item.from-startOffset-1,item.to-startOffset-1)
        const selectionStart = inCompOffset-item.from+1
        const input = { value, selectionStart}
        const {line,col} = jb.tgpTextEditor.offsetToLineCol(text, item.from-startOffset-1)

        const suggestions = await ctx.setData(input).setVars({filePath,probePath:path}).run(
            probe.suggestionsByCmd({sourceCode: probe('%$filePath%'),
            probePath : '%$probePath%', expressionOnly: true }))
        return (jb.path(suggestions,'0.options') || []).map(option => {
            const { pos, toPaste, tail, text } = option
            const primiteVal = option.valueType != 'object'
            const suffix = primiteVal ? '%' : '/'
            const newText = toPaste + suffix
            const startInInput = pos - tail.length
            const overlap = calcOverlap(newText, input.value.slice(startInInput))
            const suffixExists = input.value.substr(startInInput + overlap)[0] == suffix
            const newVal = input.value.substr(0,startInInput) + newText + input.value.substr(startInInput + overlap + (suffixExists ? 1 : 0))
            const cursorPos = { line: line + compLine, col: col + startInInput + toPaste.length + (suffix == '%' ? 2 : 1) }
            return {
                path,
                kind: primiteVal ? 12 : 13, 
                label: text,
                cursorPos,
                newVal,
                extend(ctx) { return {...jb.tgp.writeValueOfPathOp(this.path, this.newVal,ctx) } },
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
    newPTCompletions(path, opKind) {
        const options = jb.tgp.PTsOfPath(path).filter(x=>!x.match(/^dataResource\./)).map(compName=>{
            const comp = jb.utils.getComp(compName)
            return {
                kind: 2,
                compName,
                opKind,
                label: compName.split('>').pop(),
                path,
                detail: [comp.description,compName.indexOf('>') != -1 && compName.split('>')[0] + '>'].filter(x=>x).join(' '),
                extend(ctx) { return jb.tgp.setPTOp(this.path,this.opKind,this.compName,ctx) },
            }
        })
        const propStr = `${path.split('~').pop()}: `
        const propTitle = { 
            path, kind: 19, label: propStr + jb.tgp.paramTypes(path).join(', '), extend: () => {},
            detail: jb.path(jb.tgp.paramDef(path),'description')
        }
        return [propTitle, ...options]
    },
	writeValueOfPathOp: (path,value,srcCtx) => {
        return {op: { $set: value} , path,srcCtx }
    },
	addPropertyOp(path,srcCtx) {
		const param = jb.tgp.paramDef(path)
        if (!param)
            return jb.logError(`no param def for path ${path}`,{srcCtx})
		const paramType = jb.tgp.paramType(path)
		const result = param.templateValue ? JSON.parse(JSON.stringify(param.templateValue))
			: paramType.indexOf('data') != -1 ? '' : {$: 'TBD'}
		
		return jb.tgp.writeValueOfPathOp(path,result,srcCtx)
	},
	addArrayItemOp(path,{toAdd, index, srcCtx} = {}) {
		const val = jb.tgp.valOfPath(path)
		toAdd = toAdd === undefined ? {$:'TBD'} : toAdd
		if (Array.isArray(val)) {
			if (index === undefined || index == -1)
				return {path, op: { $push: [toAdd] },srcCtx, resultPath: `${path}~${val.length}` }
			else
				return {path, op: { $splice: [[index,0,toAdd]] } ,srcCtx, resultPath: `${path}~${index}` }
		} else if (!val) {
			return { ...jb.tgp.writeValueOfPathOp(path,jb.asArray(toAdd),srcCtx), resultPath: `${path}~0` }
		} else {
            if (index === undefined || index == -1)
    			return { ...jb.tgp.writeValueOfPathOp(path,[val,toAdd],srcCtx), resultPath: `${path}~1` }
            else
                return { ...jb.tgp.writeValueOfPathOp(path,[toAdd,val],srcCtx), resultPath: `${path}~0` }
		}
	},
	setPTOp(path, opKind, compName,ctx) { // set,insert,append
        const index = opKind == 'append' ? -1 : opKind == 'insert' ? (+path.split('~').pop()+1) : opKind == 'prepend' && 0
        const basePath = opKind == 'insert' ? path.split('~').slice(0,-1).join('~') : path
        const toAdd = jb.tgp.newProfile(jb.tgp.getComp(compName),compName, opKind == 'set' && path)
        const result = opKind == 'set' ? jb.tgp.writeValueOfPathOp(path,toAdd,ctx) : jb.tgp.addArrayItemOp(basePath,{toAdd, index,ctx}) 
        return result
	},
    wrapWithArrayOp(path,srcCtx) {
        const toAdd = jb.tgp.valOfPath(path)
        if (toAdd != null && !Array.isArray(toAdd))
            return { ...jb.tgp.writeValueOfPathOp(path,[toAdd],srcCtx)}
    }
})

extension('tgpTextEditor', 'completion', {
    $phase: 40,
    initExtension() { 
        return { 
            cache: {}, 
            host: null,
        } 
    },
    pluginOfFilePath(_path, dsl) {
        const rep = (_path.match(/projects\/([^/]*)\/(plugins|projects)/) || [])[1]
        const path = (_path.match(/projects(.*)/)||[])[1] || _path
        const tests = path.match(/-(tests|testers).js$/) || path.match(/\/tests\//) ? '-tests': ''
        const _id = (path.match(/plugins\/([^\/]+)/) || ['',''])[1]
        const id = _id.match(/tests/) ? _id : _id + tests
        const plugin = jb.plugins[id] || {}
        return {...plugin, dsl: plugin.dsl || dsl}
    },  
    calcActiveEditorPath(docProps,{clearCache} = {}) {
        const {compText, shortId, inCompOffset, compLine, inExtension, filePath, dsl } = docProps
        if (inExtension) return docProps
        const plugin = jb.tgpTextEditor.pluginOfFilePath(filePath, dsl) 
        const compId = plugin.dsl && jb.path(jb.utils.getCompByShortIdAndDsl(shortId,plugin.dsl),[jb.core.CT,'fullId']) || shortId
        if (!jb.comps[compId]) {
            const evalRes = jb.tgpTextEditor.evalProfileDef(compText,{plugin})
            if (evalRes.err)
                return jb.logError('calcActiveEditorPath evalProfileDef', {...evalRes, compId, shortId , plugin })
            jb.comps[compId] = evalRes.res
        }
        if (!compId || !jb.comps[compId])
            return { error: 'can not determine compId', compId, shortId , plugin}
        if (clearCache)
            jb.tgpTextEditor.cache[compId] = null
        const compProps = jb.tgpTextEditor.cache[compId] || calcCompProps()
        jb.tgpTextEditor.cache[compId] = { ...docProps, ...compProps }
        return jb.tgpTextEditor.cache[compId]

        function calcCompProps() { // reformatEdits, compilationFailure, fixedComp
            jb.log('completion calcActiveEditorPath calComp props', {})
            const {text, actionMap, startOffset} = jb.utils.prettyPrintWithPositions(jb.comps[compId],{initialPath: compId})
            const path = actionMap.filter(e=>e.from<= inCompOffset && inCompOffset < e.to || (e.from == e.to && e.from == inCompOffset)).map(e=>e.action.split('!').pop())[0]
            const props = { time: new Date().getTime(), text, path, actionMap, startOffset, plugin, compId, comp : jb.comps[compId] }
            if (compText.split('\n').slice(1).join('\n').slice(0,-1) != (text||'').slice(2)) {
                let evaledComp = jb.tgpTextEditor.evalProfileDef(compText,{plugin}).res
                if (evaledComp) {
                    jb.comps[compId] = evaledComp
                    const formattedText = jb.utils.prettyPrintWithPositions(jb.comps[compId],{initialPath: compId}).text
                    if (formattedText == text) 
                        Object.assign(props, {formattedText, reformatEdits: jb.tgpTextEditor.deltaFileContent(compText, compId, compLine, formattedText)})
                    else
                        Object.assign(props, {scriptWasFoundDifferent: true, comp: evaledComp}) // new comp
                } else { // not compiles
                    const pos = jb.tgpTextEditor.offsetToLineCol(compText, inCompOffset)
                    const fixProps = jb.tgpTextEditor.fixEditedComp(compId, compText,pos,plugin)
                    // compilationFailure or fixedComp
                    Object.assign(props, { ...fixProps, comp : jb.comps[compId]})    
                }
            }
            return props
        }
    },
    async provideCompletionItems(docProps, ctx) {
        const props = jb.tgpTextEditor.calcActiveEditorPath(docProps, {clearCache: true})
        const { actionMap, reformatEdits, compLine, error } = props
        if (reformatEdits) {
            const item = { kind: 4, id: 'reformat', insertText: '',label: 'reformat', extend() { }, sortText: '0001',
                command: { command: 'jbart.applyCompChange' , arguments: [{
                    cursorPos: {line: docProps.cursorLine, col: docProps.cursorCol},
                    edit: reformatEdits
                }] },
            }
            return [item]
        } else if (actionMap) {
            const items = await jb.tgp.provideCompletionItems({...docProps,...props}, ctx)
            items.forEach((item,i) => Object.assign(item, {
                compLine,
                insertText: '',
                sortText: ('0000'+i).slice(-4),
                command: { command: 'jbart.applyCompChange' , 
                    arguments: [Object.assign({extendCode: item.extend.toString(), serverUri: jb.uri},item) ]
                }
            }))
            jb.log('completion completion items',{items, ...docProps, ...props, ctx})
            return items
        } else if (error) {
            jb.logError('completion provideCompletionItems', props)
        }
    },
    providePath(docProps,ctx) {
        const res = jb.tgpTextEditor.calcActiveEditorPath(docProps, {clearCache: true})
        if (res.reformatEdits)
            jb.logError('reformat edits',{docProps,ctx})
        return res.path ? res.path : {reformatEdits: res.reformatEdits, error: res.error }
    },
    async provideDefinition(docProps, ctx) {
        const props = jb.tgpTextEditor.calcActiveEditorPath(docProps, {clearCache: true})
        const { actionMap, reformatEdits, inExtension, error, path } = props
        const allSemantics = actionMap.filter(e=>e.action && e.action.endsWith(path)).map(x=>x.action.split('!')[0])
        if (reformatEdits) {
            return // maybe should return error
        } else if (inExtension || allSemantics.includes('function')) {
            return provideFuncLocation()
        } else if (path) {
            const comp = path && jb.tgp.compNameOfPath(path)
            return comp ? jb.utils.getComp(comp)[jb.core.CT].location : provideFuncLocation()
        } else if (error) {
            jb.logError('completion provideDefinition',props)
        }

        async function provideFuncLocation() {
            const {lineText, cursorCol } = docProps
            const [,lib,func] = lineText.match(/jb\.([a-zA-Z_0-9]+)\.([a-zA-Z_0-9]+)/) || ['','','']
            if (lib && jb.path(jb,[lib,'__extensions'])) {
                const loc = Object.values(jb[lib].__extensions).filter(ext=>ext.funcs.includes(func)).map(ext=>ext.location)[0]
                const lineOfExt = (+loc.line) || 0
                const fileContent = await jbHost.codePackageFromJson().fetchFile(loc.path)
                const lines = ('' + fileContent).split('\n').slice(lineOfExt)
                const funcHeader = new RegExp(`[^\.]${func}\\s*:|[^\.]${func}\\s*\\(`) //[^{]+{)`)
                const lineOfFunc = lines.findIndex(l=>l.match(funcHeader))
                return {...loc, line: lineOfExt + lineOfFunc}
            }
        }
    },
    calcEditAndGotoPos(docProps, item, ctx) { // Todo - make stateless
        const {compText, compLine,filePath, dsl} = docProps
        const itemProps = {...item, ...item.extend() }
        const {op, path, resultPath, whereToLand } = itemProps
        const compId = path.split('~')[0]
        jb.comps[compId] = jb.tgpTextEditor.evalProfileDef(compText,{plugin: jb.tgpTextEditor.pluginOfFilePath(filePath, dsl)}).res

        if (!jb.comps[compId])
            return jb.logError(`completion handleScriptChangeOnPreview - missing comp ${compId}`, {path, ctx})
            
        const handler = jb.watchableComps.startWatch()
        handler.makeWatchable(compId)
        handler.doOp(handler.refOfPath(path.split('~')), op, ctx)

        jb.tgpTextEditor.cache[compId] = Object.assign(jb.tgpTextEditor.cache[compId] || {}, 
            jb.utils.prettyPrintWithPositions(jb.comps[compId],{initialPath: compId}))
        const { text } = jb.tgpTextEditor.cache[compId]
        const edit = jb.tgpTextEditor.deltaFileContent(compText, compId, compLine, text)
        const cursorPos = itemProps.cursorPos || calcNewPos()
        return { edit, cursorPos }

        function calcNewPos() {
            const TBD = item.compName == 'TBD' || jb.path(itemProps,'op.$set.$') == 'TBD'
            const { line, col} = jb.tgpTextEditor.getPosOfPath(resultPath || path, TBD ? 'begin' : (whereToLand || 'edit'))
            return {TBD, line: line + compLine, col }
        }
    },
    async editsAndCursorPos({docProps,item},ctx) {
        item.extend = eval('x = function ' +item.extendCode)
        return jb.tgpTextEditor.calcEditAndGotoPos(docProps,item,ctx)
    },
    async applyCompChange(item,ctx) {
        if (item.id == 'reformat') return
        ctx = ctx || new jb.core.jbCtx({},{vars: {}, path: 'completion.applyCompChange'})
        await jb.tgpTextEditor.host.saveDoc()
        const { compText, compLine, filePath, dsl } = jb.tgpTextEditor.host.compTextAndCursor()
        const docProps = { compText, compLine, filePath, dsl } 
        const editAndCursor  = item.edit ? item 
            : item.serverUri == 'langServer' ? await remoteCalcEditAndPos() 
            : await jb.tgpTextEditor.calcEditAndGotoPos(docProps,item,ctx)
        const { edit, cursorPos } = editAndCursor
        try {
            await jb.tgpTextEditor.host.applyEdit(edit)
            await jb.tgpTextEditor.host.saveDoc()
            if (cursorPos) {
                await jb.tgpTextEditor.host.selectRange(cursorPos)
                if (cursorPos.TBD) {
                    await jb.tgpTextEditor.host.execCommand('editor.action.triggerSuggest')
                }
            }
        } catch (e) {
            jb.vscode.log(`applyCompChange exception`)
            jb.logException(e,'completion apply comp change',{item,ctx})
        }

        function remoteCalcEditAndPos() {
            return ctx.setData({docProps, item}).run(tgp.editsAndCursorPosByDocProps())
        }
    },
    async moveInArrayEdits(docPropsWithDiff,ctx) {
        const { diff } = docPropsWithDiff
        const props = await jb.tgpTextEditor.calcActiveEditorPath(docPropsWithDiff, {clearCache: true})
        const { reformatEdits, compId, compLine, actionMap, compText, path } = props        
        if (!reformatEdits && actionMap) {
            const rev = path.split('~').reverse()
            const indexOfElem = rev.findIndex(x=>x.match(/^[0-9]+$/))
            if (indexOfElem != -1) {
                const path = rev.slice(indexOfElem).reverse()
                const from = path.join('~')
                const to = [...path.slice(0,-1), (+path.slice(-1)[0])+diff].join('~')
                jb.tgp.moveFixDestination(from,to,ctx)
                const newText = jb.utils.prettyPrintWithPositions(jb.comps[compId],{initialPath: compId}).text
                const edit = jb.tgpTextEditor.deltaFileContent(compText, compId, compLine, newText)
                jb.log('tgpTextEditor moveInArray',{ from, to, newText, edit, ...props})
                return { edit, cursorPos: calcNewPos(to) }
            }
        }
        return { error : 'moveInArray - array elem was not found', ...props}

        function calcNewPos(path) {
            const { compLine } = jb.tgpTextEditor.cache[compId]
            const {line, col} = jb.tgpTextEditor.getPosOfPath(path, 'begin')
            if (!line && !col)
                return jb.logError('moveInArray can not find path', {path})
            return {line: line + compLine, col}
        }        
    }
})