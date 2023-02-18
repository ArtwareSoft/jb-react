
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
    provideCompletionItems(semanticPath, ctx) {
        const path = semanticPath.path.split('~!')[0]
        const arrayIndex = jb.tgp.calcArrayIndex(semanticPath)
        const allSemantics = semanticPath.allPaths.map(x=>x[0]).filter(x=>x.indexOf(path+'~!') == 0).map(x=>x.split('~!').pop())
        const paramDef = jb.tgp.paramDef(path)
        if (!paramDef) {
            jb.logError('provideCompletionItems - can not find paramDef',{path, semanticPath, ctx})
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
            detail: param.description,
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
                detail: comp.description || compName.indexOf('>') != -1 && compName.split('>')[0] + '>',
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
        //jb.tgpTextEditor.listenToCompChanges()
        return { 
            cache: {}, 
            host: null,
        } 
    },
    // listenToCompChanges() {
    //     jb.utils.subscribe(jb.watchableComps.source, async ev => {
    //         try {
    //             if (!ev.srcCtx.vars.textEditorFollowUp) return
    //             const {path, resultPath, resultSemantics, resultOffset} = ev.srcCtx.vars.textEditorFollowUp
    //             const compId = path.split('~')[0]
    //             const {docText } = await jb.tgpTextEditor.host.docTextAndCursor()
    //             const {compText} = jb.tgpTextEditor.fileContentToCompText(docText,compId)
    //             if (!compText) return
    //             const edit = jb.tgpTextEditor.deltaFileContent(docText, compId)
    //             await jb.tgpTextEditor.host.applyEdit(edit)
    //             const cursorPos = await jb.tgpTextEditor.gotoPath(resultPath || path, resultSemantics, resultOffset)
    //             if (cursorPos)
    //                 await jb.tgpTextEditor.selectNextEditPosition(edit.newText,cursorPos)
    //         } catch (e) {
    //             jb.logException(e,'tgpTextEditor watch comp change' ,{ev})
    //         }
    //     })
    // },
    async calcActiveEditorPath() {
        const {docText, cursorLine, cursorCol } = await jb.tgpTextEditor.host.docTextAndCursor()
        const lines = docText.split('\n')
        const dsl = jb.tgpTextEditor.dsl(lines)
        const compLine = cursorLine - lines.slice(0,cursorLine+1).reverse().findIndex(line => line.match(/^jb.component\(/))
        if (compLine > cursorLine == -1) return {
            inExtension: lines.slice(0,cursorLine+1).some(line => line.match(/^jb.extension\(/))
        }
        if (!lines[compLine])
            return { error: 'can not find comp', cursorLine, compLine, docText}
        const shortId = (lines[compLine].match(/'([^']+)'/)||['',''])[1]
        const compId = dsl ? jb.path(jb.utils.getCompByShortIdAndDsl(shortId,dsl),[jb.core.CT,'fullId']) : shortId
        if (!compId)
            return { error: 'can not determine compId', shortId , dsl}
        const inCompPos = {line: cursorLine-compLine, col: cursorCol }
        const compProps = jb.tgpTextEditor.cache[compId] || calcCompProps()
        const { compilationFailure, needsFormat, text, map } = compProps
        const docProps = { docText, compLine, inCompPos }
        jb.tgpTextEditor.cache[compId] = { ...docProps, ...compProps ,
            ...(compilationFailure || needsFormat) ? {} : jb.tgpTextEditor.getPathOfPos(inCompPos, text, map) }
        return jb.tgpTextEditor.cache[compId]

        function calcCompProps() {
            const linesFromComp = lines.slice(compLine)
            const compLastLine = linesFromComp.findIndex(line => line.match(/^}\)\s*$/))
            const actualText = lines.slice(compLine+1,compLine+compLastLine+1).join('\n').slice(0,-1)
            const {text, map} = jb.utils.prettyPrintWithPositions(jb.comps[compId],{initialPath: compId})
            if (actualText == text.slice(2))
                return {comp : jb.comps[compId], text, map, dsl, compId, shortId} 
            // const {fixedComp, originalComp, compilationFailure } = jb.tgpTextEditor.fixEditedComp(actualText,inCompPos,dsl)
            // if (compilationFailure) return {compilationFailure}
            // if (originalComp && actualText.slice(actualText.indexOf('\n')) != text.slice(text.indexOf('\n'))) // jb.utils.prettyPrintComp(compId,originalComp))
            return { needsFormat: true, text, map, dsl, compId, shortId}
//            return {comp: fixedComp, text, map}
        }
    },
    async provideCompletionItems(ctx) {
        const props = await jb.tgpTextEditor.calcActiveEditorPath()
        jb.log('vscode calcActiveEditorPath',props)
        const { semanticPath, needsFormat, compLine } = props
        if (needsFormat)
            jb.tgpTextEditor.host.applyEdit(jb.tgpTextEditor.formatComponent(props))
        else if (semanticPath) {
            const items = jb.tgp.provideCompletionItems(semanticPath,ctx)
            items.forEach((item,i) => Object.assign(item, {
                compLine,
                insertText: '',
                sortText: ('0000'+i).slice(-4),
                command: { command: 'jbart.applyCompChange' , 
                    arguments: jb.tgpTextEditor.host.serverUri ? [Object.assign({serverUri},item) ] :  [item,ctx] 
                }
            }))
            //console.log('provide',semanticPath, items)
            return items
        }
    },
    async provideDefinition(ctx) {
        const props = await jb.tgpTextEditor.calcActiveEditorPath()
        const { semanticPath, needsFormat, inExtension } = props
        if (needsFormat)
            jb.tgpTextEditor.host.applyEdit(jb.tgpTextEditor.formatComponent(props))
        else if (semanticPath) {
            const path = semanticPath.allPaths.map(x=>x[0]).filter(x=>x.match('~!profile$')).map(x=>x.split('~!')[0])[0]
            const comp = path && jb.tgp.compNameOfPath(path)
            if (!comp) return
            const loc = jb.utils.getComp(comp)[jb.core.CT].location
            return locationInFile(loc)
            // const lineOfComp = (+loc[1]) || 0
            // const uri = vscodeNS.Uri.file(jbBaseUrl + loc[0]) // /home/shaiby/projects/jb-react
            // return new vscodeNS.Location(uri, new vscodeNS.Position(lineOfComp, 0))
        } else if (inExtension) {
            const {docText, cursorLine } = await jb.tgpTextEditor.host.docTextAndCursor()
            const textLine = docText.split('\n')[cursorLine]
            const [,lib,func] = textLine.match(/jb\.([a-zA-Z_0-9]+)\.([a-zA-Z_0-9]+)/) || ['','','']
            if (lib && jb.path(jb,[lib,'__extensions'])) {
                const loc = Object.values(jb[lib].__extensions).filter(ext=>ext.funcs.includes(func)).map(ext=>ext.location)[0]
                const lineOfExt = (+loc[1]) || 0
                const fileContent = await jbFetchFile(jbBaseUrl + loc[0])
                const lines = ('' + fileContent).split('\n').slice(lineOfExt)
                const funcHeader = new RegExp(`${func}\\s*:|(${func}\\s*\\([^{]+{)`)
                const lineOfFunc = lines.findIndex(l=>l.match(funcHeader))
                return locationInFile([loc[0], lineOfExt + lineOfFunc])
            }
        }
        function locationInFile(loc) {
            return loc && new vscodeNS.Location(vscodeNS.Uri.file(jbBaseUrl + loc[0]), new vscodeNS.Position((+loc[1]) || 0, 0))
        }
    },
    calcEditAndGotoPos(item, ctx) { // todo: maybe define as tgp comp
        const {op, path, resultPath, resultSemantics, resultOffset} = {...item, ...item.extend() }
        const compId = path.split('~')[0]
        if (!jb.utils.getComp(compId))
            return jb.logError(`handleScriptChangeOnPreview - missing comp ${compId}`, {path, ctx})
        const handler = jb.watchableComps.startWatch()
        handler.makeWatchable(compId)
        handler.doOp(handler.refOfPath(path.split('~')), op, ctx)

        jb.tgpTextEditor.cache[compId] = Object.assign(jb.tgpTextEditor.cache[compId] || {}, 
            jb.utils.prettyPrintWithPositions(jb.comps[compId],{initialPath: compId}))
        const {docText, text } = jb.tgpTextEditor.cache[compId]
        const edit = jb.tgpTextEditor.deltaFileContent(docText, compId, text)
        const cursorPos = calcNewPos()
        return { edit, cursorPos }

        function calcNewPos() {
            const { compLine, text } = jb.tgpTextEditor.cache[compId]
            const pos = jb.tgpTextEditor.getPosOfPath(resultPath || path,resultSemantics)
            jb.log('vscode calcNewPos',{resultSemantics, pos})
            if (!pos)
                return jb.logError('vscode calcNewPos can not find path', {resultSemantics})
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
        if (!item.extend) debugger
        const { edit, cursorPos } = item.serverUri ? await remoteCalcEditAndPos() : await jb.tgpTextEditor.calcEditAndGotoPos(item,ctx)       
        try {
            await jb.tgpTextEditor.host.applyEdit(edit)
            if (cursorPos) {
                await jb.tgpTextEditor.host.selectRange(cursorPos)
                if (cursorPos.TBD) {
                    await jb.delay(1)
                    await jb.tgpTextEditor.host.execCommand('editor.action.triggerSuggest')
                }
            }
            //jb.tgpTextEditor.cache = {}
        } catch (e) {
            jb.logException(e,'completion apply comp change',{item,ctx})
        }

        function remoteCalcEditAndPos() {
            return ctx.setData(item).run(remote.action( ctx => { 
                return jb.tgpTextEditor.calcEditAndGotoPos(ctx.data,ctx)
            }, jbm.byUri(()=> item.serverUri) ))
        }
    },
    // async selectNextEditPosition(cursorPos) {
    //     if (!cursorPos) debugger
    //     await jb.tgpTextEditor.host.selectRange(cursorPos)
    //     if (cursorPos.TBD)
    //         await jb.tgpTextEditor.host.execCommand('editor.action.triggerSuggest')
    // },
    moveUp() { 
        debugger
    },
    moveDown() { 
        debugger
    },
    async moveInArray(diff) {
        const props = await jb.tgpTextEditor.calcActiveEditorPath()
        const { semanticPath, needsFormat } = props
        if (needsFormat)
            jb.tgpTextEditor.host.applyEdit(jb.tgpTextEditor.formatComponent(props))
        else if (semanticPath) {
        }
    }
})