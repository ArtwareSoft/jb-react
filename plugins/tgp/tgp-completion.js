
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
            res = jb.tgp.selectEnumCompletions(path, ctx)        
        } else if (singleParamAsArray) {
            res = jb.tgp.newPTCompletions(`${path}~${singleParamAsArray.id}`, arrayIndex, ctx)
        } else if (allSemantics.reduce((acc,s) => acc || s.match(/-by-value|obj-separator-|-profile/), false )) {
            res = jb.tgp.paramCompletions(path, ctx)
            const textStart = semanticPath.allPaths.find(x=>x[0].match(/~!value-text-start$/))
            if (textStart)
                res = [...res,...jb.tgp.newPTCompletions(textStart[0].split('~!')[0], arrayIndex, ctx)]
            const singleValueProfile = semanticPath.allPaths.find(x=>x[0].match(/~!profile/) && x[0].indexOf(path) == 0)
            if (singleValueProfile)
                res = [...res,...jb.tgp.newPTCompletions(singleValueProfile[0].split('~!')[0], arrayIndex, ctx)]
        } else if (arrayIndex != null || allSemantics.includes('prop') || allSemantics.includes('profile')) {
            res = jb.tgp.newPTCompletions(path, arrayIndex, ctx)
        } else if (allSemantics.includes('value')) {
            res = jb.tgp.paramCompletions(path, ctx)
        }

        return [...jb.tgp.calcWrapWithCompletions(semanticPath, path, ctx), ...res]
    },
    calcWrapWithCompletions(semanticPath, path, ctx) {
        const innerPath = semanticPath.allPaths.map(x=>x[0]).filter(x=>x.match('~!value-text-start$')).map(x=>x.split('~!')[0])[0] 
        return [path,innerPath].filter(x=>x).map(path=> jb.tgp.canWrapWithArray(path) ? {
                kind:18, 
                label: `wrap with array`,
                extend: () => jb.tgp.wrapWithArrayOp(path,ctx),
            } : null).filter(x=>x).slice(0,1)
    },
    calcArrayIndex(semanticPath) {
        const separatorIndex = (semanticPath.path.match(/separator-([0-9]+)$/) || ['',null])[1]
        const openArray = semanticPath.path.split('~!')[1].indexOf('open-array') == 0
        const closeArray = semanticPath.path.split('~!')[1].indexOf('close-array') == 0
        return openArray ? 0 : closeArray ? -1 : separatorIndex ? (+separatorIndex+1) : null
    },
    selectEnumCompletions(path, ctx) {
        return jb.tgp.paramDef(path).options.split(',').map(label=>({
            kind: 19,
            label,
            extend: () => jb.tgp.writeValueOfPathOp(path,label,ctx),
        }))
    },
    paramCompletions(path, ctx) {
        const params = jb.tgp.paramsOfPath(path).filter(p=> jb.tgp.valOfPath(path+'~'+p.id) === undefined)
            .sort( (p2,p1) => (p1.mandatory ? 1 : 0) - (p2.mandatory ? 1 : 0))
        return params.map(param =>({
            kind: 4,
            id: param.id,
            label: param.id,
            detail: param.description,
            extend: () => jb.tgp.addPropertyOp(`${path}~${param.id}`,ctx),
        }))
    },
    newPTCompletions(path, arrayIndex, ctx) {
        const options = jb.tgp.PTsOfPath(path).map(compName=>{
            const comp = jb.utils.getComp(compName)
            return {
                kind: 2,
                compName,
                label: compName.split('>').pop(),
                detail: comp.description || compName.indexOf('>') != -1 && compName.split('>')[0] + '>',
                extend: () => jb.tgp.setPTOp(path,arrayIndex,compName, ctx),
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
        jb.tgpTextEditor.listenToCompChanges()
        return { 
            cache: {}, 
            host: null,
        } 
    },
    listenToCompChanges() {
        jb.utils.subscribe(jb.watchableComps.source, async ev => {
            try {
                if (!ev.srcCtx.vars.textEditorFollowUp) return
                const {path, resultPath, resultSemantics, resultOffset} = ev.srcCtx.vars.textEditorFollowUp
                const compId = path.split('~')[0]
                const fileContent = jb.tgpTextEditor.host.docText()
                const {compText} = jb.tgpTextEditor.fileContentToCompText(fileContent,compId)
                if (!compText) return
                const edit = jb.tgpTextEditor.deltaFileContent(fileContent, compId)
                await jb.tgpTextEditor.host.applyEdit(edit)
                const cursorPos = await jb.tgpTextEditor.gotoPath(resultPath || path, resultSemantics, resultOffset)
                if (cursorPos)
                    await jb.tgpTextEditor.selectNextEditPosition(edit.newText,cursorPos)
            } catch (e) {
                jb.logException(e,'tgpTextEditor watch comp change' ,{ev})
            }
        })
    },
    calcActiveEditorPath() {
        const line = jb.tgpTextEditor.host.cursorLine()
        const lines = jb.tgpTextEditor.host.docText().split('\n')
        const dsl = jb.tgpTextEditor.dsl(lines)
        const closestComp = lines.slice(0,line+1).reverse().findIndex(line => line.match(/^jb.component\(/))
        if (closestComp == -1) return {
            inExtension: lines.slice(0,line+1).some(line => line.match(/^jb.extension\(/))
        }
        const componentHeaderIndex = line - closestComp
        if (!lines[componentHeaderIndex])
            return jb.tgpTextEditor.lastActivePath || {}
        const compId = (lines[componentHeaderIndex].match(/'([^']+)'/)||['',''])[1]
        const inCompPos = {line: line-componentHeaderIndex, col : jb.tgpTextEditor.host.cursorCol() }
        const {fixedComp, needsFormat, compilationFailure} = jb.tgpTextEditor.cache[`${dsl}-${compId}`] || calcCompVars()
        if (compilationFailure) 
            return jb.tgpTextEditor.lastActivePath || {}
        if (needsFormat)
            return { dsl, compId, needsFormat: true }
        jb.tgpTextEditor.cache[`${dsl}-${compId}`] = {fixedComp }
        return jb.tgpTextEditor.lastActivePath = { dsl, compId, ...jb.tgpTextEditor.getPathOfPos(fixedComp, inCompPos) }

        function calcCompVars() {
            const linesFromComp = lines.slice(componentHeaderIndex)
            const compLastLine = linesFromComp.findIndex(line => line.match(/^}\)\s*$/))
            const actualText = lines.slice(componentHeaderIndex,componentHeaderIndex+compLastLine+1).join('\n')
            const {fixedComp, originalComp, compilationFailure } = jb.tgpTextEditor.fixEditedComp(actualText,inCompPos,dsl)
            if (compilationFailure) return {compilationFailure}
            if (originalComp && actualText != jb.utils.prettyPrintComp(compId,originalComp))
                return { needsFormat: true }
            return {fixedComp}
        }
    },
    provideCompletionItems(ctx) {
        const { semanticPath, needsFormat } = jb.tgpTextEditor.calcActiveEditorPath()
        if (needsFormat)
            jb.tgpTextEditor.host.applyEdit(jb.tgpTextEditor.formatComponent())
        else if (semanticPath) {
            const items = jb.tgp.provideCompletionItems(semanticPath,ctx)
            items.forEach((item,i) => Object.assign(item, {
                insertText: '',
                sortText: ('0000'+i).slice(-4),
                command: { command: 'jbart.applyCompChange', arguments: [item,ctx] }
            }))
            console.log('provide',semanticPath, items)
            return items
        }
    },
    async provideDefinition(ctx) {
        const { semanticPath, needsFormat, inExtension } = jb.tgpTextEditor.calcActiveEditorPath()
        if (needsFormat) {
            jb.tgpTextEditor.host.applyEdit(jb.tgpTextEditor.formatComponent())
            return
        } else if (semanticPath) {
            const path = semanticPath.allPaths.map(x=>x[0]).filter(x=>x.match('~!profile$')).map(x=>x.split('~!')[0])[0]
            const comp = path && jb.tgp.compNameOfPath(path)
            if (!comp) return
            const loc = jb.utils.getComp(comp)[jb.core.CT].location
            return locationInFile(loc)
            // const lineOfComp = (+loc[1]) || 0
            // const uri = vscodeNS.Uri.file(jbBaseUrl + loc[0]) // /home/shaiby/projects/jb-react
            // return new vscodeNS.Location(uri, new vscodeNS.Position(lineOfComp, 0))
        } else if (inExtension) {
            const line = jb.tgpTextEditor.host.docText().split('\n')[jb.tgpTextEditor.host.cursorLine()]
            const [,lib,func] = line.match(/jb\.([a-zA-Z_0-9]+)\.([a-zA-Z_0-9]+)/) || ['','','']
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
    async applyCompChange(item,ctx) {
        if (!item.extend) debugger
        try {
            const textEditorFollowUp = item.extend()
            const handler = jb.watchableComps.startWatch()
            const {path, op}  = textEditorFollowUp
            const compId = path.split('~')[0]
            if (!jb.utils.getComp(compId))
                return jb.logError(`handleScriptChangeOnPreview - missing comp ${compId}`, {path, ctx})
            handler.makeWatchable(compId)
            handler.doOp(handler.refOfPath(path.split('~')), op, ctx.setVar('textEditorFollowUp',textEditorFollowUp))
            jb.tgpTextEditor.cache = {}
        } catch (e) {
            jb.logException(e,'completion apply comp change',{item,ctx})
        }
    },
    async gotoPath(path,semantics, offset) {
        const compId = path.split('~')[0]
        const { compLine } = jb.tgpTextEditor.fileContentToCompText(jb.tgpTextEditor.host.docText(),compId)
        const pos = jb.tgpTextEditor.getPosOfPath(path,semantics)
        console.log('goto path',semantics, pos)
        if (!pos)
            return jb.logError('goto path can not find path', {semantics})
        const line = pos[0] + compLine
        const col = pos[1] + (offset ? offset : 0)
        const cursorPos = {line,col}
        jb.tgpTextEditor.host.selectRange(cursorPos)
        return cursorPos
    },
    async selectNextEditPosition(newText,cursorPos) {
        if (!cursorPos) debugger
        const docText = jb.tgpTextEditor.host.docText() 
        const offset = jb.tgpTextEditor.lineColToOffset(docText, cursorPos)
        if (docText.slice(offset,offset+4) == 'TBD(' || docText.slice(offset-1,offset+1) == '()') {
            jb.tgpTextEditor.host.execCommand('editor.action.triggerSuggest')
        } else {
            const emptyString = docText.slice(offset,offset+newText.length).indexOf("''")
            if (emptyString != -1)
                await jb.tgpTextEditor.host.selectRange(jb.tgpTextEditor.offsetToLineCol(docText,offset+emptyString+1))
        }
    },
    moveUp() { 
        debugger
    },
    moveDown() { 
        debugger
    },
    moveInArray(diff) {
        const { semanticPath, needsFormat } = jb.tgpTextEditor.calcActiveEditorPath()
        if (needsFormat)
            jb.tgpTextEditor.host.applyEdit(jb.tgpTextEditor.formatComponent())
        else if (semanticPath) {
        }
    }
})