
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
        if (!paramDef) debugger
        
        let res = []
        if (paramDef.options) {
            res = jb.tgp.selectEnumCompletions(path, ctx)        
        } else if (jb.tgp.firstParamIsArray(path)) {
            res = jb.tgp.newPTCompletions(path, arrayIndex, ctx)
        } else if (allSemantics.reduce((acc,s) => acc || s.match(/-by-value|obj-separator-|-sugar|-profile/), false )) {
            res = jb.tgp.paramCompletions(path, ctx)
            const textStart = semanticPath.allPaths.find(x=>x[0].match('~!value-text-start$'))
            if (textStart)
                res = [...res,...jb.tgp.newPTCompletions(textStart[0].split('~!')[0], arrayIndex, ctx)]
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
            const comp = jb.comps[compName]
            return {
                kind: 2,
                compName,
                label: compName,
                detail: comp.description,
                extend: () => jb.tgp.setPTOp(path,arrayIndex,compName, ctx),
            }
        })
        return options
    },
	writeValueOfPathOp: (path,value,srcCtx) => {
        return {op: { $set: value} , path,srcCtx, resultSemantics : ['value-text', 'profile']}
    },
	addPropertyOp(path,srcCtx) {
		// if (jb.tgp.paramType(path) == 'data')
		// 	return jb.tgp.writeValueOfPath(path,'')
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
        const params = jb.path(jb.comps[(profile||{}).$],'params') || []
        const firstParamIsArray = jb.tgp.firstParamIsArray(_path)
		let path = firstParamIsArray ? `${_path}~${params[0].id}` : _path
		let index = null
        if (Array.isArray(profile)) {
            index = arrayIndex != null ? arrayIndex : profile.length
        } else if (firstParamIsArray || arrayIndex != null) {
			const ar = profile[params[0].id]
			const lastIndex = Array.isArray(ar) ? ar.length : 1
			index = ar == null ? 0 : arrayIndex != null ? arrayIndex : lastIndex
		}
        const toAdd = jb.tgp.newProfile(jb.tgp.getComp(compName),compName,path)
        const result = index != null ? jb.tgp.addArrayItemOp(path,{toAdd, index,srcCtx}) : jb.tgp.writeValueOfPathOp(path,toAdd,srcCtx)
        result.resultSemantics = ['open-profile','open-by-value','open-sugar']
        result.resultOffset = 1
        return result
	},
    // wrapperOp(path,compId, srcCtx) {
    //     const comp = jb.tgp.getComp(compId)
    //     const compositeParam = jb.utils.compParams(comp).filter(p=>p.composite)[0]
    //     if (compositeParam) {
    //         const singleOrArray = compositeParam.type.indexOf('[') == -1 ? jb.tgp.valOfPath(path) : [jb.tgp.valOfPath(path)]
    //         const result = { $: compId, [compositeParam.id]: singleOrArray}
    //         return jb.tgp.writeValueOfPathOp(path,result,srcCtx)
    //     }
    // },
    wrapWithArrayOp(path,srcCtx) {
        const toAdd = jb.tgp.valOfPath(path)
        if (toAdd != null && !Array.isArray(toAdd))
            return { ...jb.tgp.writeValueOfPathOp(path,[toAdd],srcCtx), resultPath: `${path}~1` }
    }
})

jb.extension('tgpTextEditor', 'completion', {
    $phase: 40,
    initExtension() { return { cache: {}, host: null } },
    calcActiveEditorPath() {
        const line = jb.tgpTextEditor.host.cursorLine()
        const lines = jb.tgpTextEditor.host.docText().split('\n')
        const closestComp = lines.slice(0,line+1).reverse().findIndex(line => line.match(/^jb.component\(/))
        if (closestComp == -1) return {}
        const componentHeaderIndex = line - closestComp
        const compId = (lines[componentHeaderIndex].match(/'([^']+)'/)||['',''])[1]
        const inCompPos = {line: line-componentHeaderIndex, col : jb.tgpTextEditor.host.cursorCol() }
        const {fixedComp, needsFormat}  = jb.tgpTextEditor.cache[compId] || calcCompVars()
        if (needsFormat)
            return { compId, needsFormat: true }
        jb.tgpTextEditor.cache[compId] = {fixedComp }
        return { compId, ...jb.tgpTextEditor.getPathOfPos(fixedComp, compId, inCompPos) }

        function calcCompVars() {
            const linesFromComp = lines.slice(componentHeaderIndex)
            const compLastLine = linesFromComp.findIndex(line => line.match(/^}\)\s*$/))
            const actualText = lines.slice(componentHeaderIndex,componentHeaderIndex+compLastLine+1).join('\n')
            const {fixedComp, originalComp } = jb.tgpTextEditor.fixEditedComp(actualText,inCompPos)
            if (originalComp && actualText != jb.utils.prettyPrintComp(compId,originalComp))
                return { needsFormat: true }
            return {fixedComp}
        }
    },
    provideCompletionItems(ctx) {
        const { semanticPath, needsFormat } = jb.tgpTextEditor.calcActiveEditorPath()
        if (needsFormat)
            jb.tgpTextEditor.host.applyEdits(jb.tgpTextEditor.formatComponent())
        else if (semanticPath) {
            const items = jb.tgp.provideCompletionItems(semanticPath,ctx)
            items.forEach((item,i) => Object.assign(item, {
                insertText: '',
                sortText: ('0000'+i).slice(-4),
                command: { command: 'jbart.applyEditAndGotoPath', title: 'apply edit and goto path', arguments: [item,ctx] }
            }))
            console.log('provide',semanticPath, items)
            return items;
        }
    },
    async applyEditAndGotoPath(item,ctx) {
        if (!item.extend) debugger
        try {
            const {path, op, resultPath, resultSemantics, resultOffset} = item.extend(), operation = {}
            const compId = path.split('~')[0]
            const innerPath = path.split('~').slice(1)
            jb.path(operation,innerPath,op)

            const fileContent = jb.tgpTextEditor.host.docText()
            const { compLine, compText} = jb.tgpTextEditor.fileContentToCompText(fileContent,compId)
            const inCompPos = {line: jb.tgpTextEditor.host.cursorLine()-compLine, col : jb.tgpTextEditor.host.cursorCol() }
            const { fixedComp } = jb.tgpTextEditor.fixEditedComp(compText,inCompPos)
            const comp = jb.immutable.update(fixedComp,operation)
            const edit = jb.tgpTextEditor.deltaFileContent(fileContent, {compId,comp})
            await jb.tgpTextEditor.host.applyEdits(edit)
            const fileContentAfter = jb.tgpTextEditor.host.docText()
            const newCompText = jb.tgpTextEditor.fileContentToCompText(fileContentAfter,compId).compText.replace(/^jb\.component/,'')
            jb.tgpTextEditor.setStrValue(newCompText, jb.tgp.ref(compId), ctx) // todo - block self refresh
//            jb.tgpTextEditor.host.applyEdits(jb.tgpTextEditor.formatComponent())
            const cursorPos = await jb.tgpTextEditor.gotoPath(resultPath || path, resultSemantics, resultOffset)
            if (cursorPos)
                await jb.tgpTextEditor.selectNextEditPosition(edit.newText,cursorPos)
            return { edit } // used by tests
        } catch (e) {
            jb.logException(e,'apply and goto')
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
        if (docText.slice(offset,offset+4) == 'TBD(') {
            jb.tgpTextEditor.host.applyEdits({newText: '', range: jb.tgpTextEditor.host.getSelectionRange() })
            jb.tgpTextEditor.host.execCommand('editor.action.triggerSuggest')
            return
        }
        try {
            const lookAt = docText.slice(offset,offset+newText.length)
            let found = lookAt.match(/'([^']*)'/) , from = null, to = null // select next string
            if (found) {
                from = offset + found.index + 1;
                to = offset + found.index + found[1].length + 1
            } 
            if (!from) return
            jb.tgpTextEditor.host.selectRange(jb.tgpTextEditor.offsetToLineCol(docText,from), jb.tgpTextEditor.offsetToLineCol(docText,to))
        } catch (e) {
            debugger
        }
    }
})