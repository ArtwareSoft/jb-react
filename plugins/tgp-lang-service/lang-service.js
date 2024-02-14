using('tgp,tgp-text-editor,tgp-model-data')

extension('langService', 'impl', {
    $phase: 40,
    initExtension() {
        return {
            compsCache: {},
            tgpModels: {},
        }
    },
    async calcCompProps(ctx) {
        const {forceLocalSuggestions, forceRemoteCompProps} = ctx.vars
        const docProps = { forceLocalSuggestions, ...jb.tgpTextEditor.host.compTextAndCursor() }
        const packagePath = docProps.packagePath = docProps.filePath
        if (jb.langService.tgpModels[packagePath] && !forceRemoteCompProps)
            return jb.langService.calcCompPropsSync(docProps, jb.langService.tgpModels[packagePath])
        const tgpModelData = forceLocalSuggestions ? jb.tgp.tgpModelData({filePath: packagePath}) 
            : await new jb.core.jbCtx().setData(packagePath).run({$: 'remote.tgpModelData'})
        docProps.filePath = tgpModelData.filePath
        return jb.langService.calcCompPropsSync(docProps, new jb.langService.tgpModelForLangService(tgpModelData))
    },
    calcCompPropsSync(docProps, tgpModel) {
        const { compText, shortId, inCompOffset, compLine, inExtension, filePath, forceLocalSuggestions } = docProps
        if (inExtension) return docProps

        const plugin = jb.loader.pluginOfFilePath(filePath)
        const fileDsl = tgpModel.fileDsl(filePath)
        const tgpModelErrors = tgpModel.errors ? {tgpModelErrors: tgpModel.errors} : {}

        const code = '{\n' + compText.split('\n').slice(1).join('\n').slice(0, -1)
        const cursorPos = jb.tgpTextEditor.offsetToLineCol(compText, inCompOffset)
        const {compId, comp, err} = jb.tgpTextEditor.evalProfileDef(shortId, code, plugin, fileDsl, tgpModel, {cursorPos, forceLocalSuggestions})
        if (err)
            return jb.logError('calcCompProps evalProfileDef', { compId, compText, shortId, plugin })
        if (!compId)
            return { error: 'can not determine compId', shortId, plugin }

        const { text, actionMap, startOffset } = jb.utils.prettyPrintWithPositions(comp, { initialPath: compId, tgpModel })
        const path = actionMap.filter(e => e.from <= inCompOffset && inCompOffset < e.to || (e.from == e.to && e.from == inCompOffset))
            .map(e => e.action.split('!').pop())[0] || compId

        const compProps = (code != text) ? { path, formattedText: text, reformatEdits: jb.tgpTextEditor.deltaFileContent(code, text, compLine) }
            : { time: new Date().getTime(), text, path, actionMap, startOffset, plugin, tgpModel, compId, comp }
        return { ...docProps, ...compProps, ...tgpModelErrors }
    },

    async provideCompletionItems(compProps, ctx) {
        const { actionMap, inCompOffset, tgpModel } = compProps
        const actions = actionMap.filter(e => e.from <= inCompOffset && inCompOffset < e.to || (e.from == e.to && e.from == inCompOffset))
            .map(e => e.action).filter(e => e.indexOf('edit!') != 0 && e.indexOf('begin!') != 0 && e.indexOf('end!') != 0)
        if (actions.length == 0) return []
        const priorities = ['addProp']
        const sortedActions = jb.utils.unique(actions).map(action=>action.split('!')).sort((a1,a2) => priorities.indexOf(a2[0]) - priorities.indexOf(a1[0]))
        const res = sortedActions.reduce((acc, action) => {
            const [op, path] = action
            const paramDef = tgpModel.paramDef(path)
            const toAdd = (op == 'setPT' && paramDef && paramDef.options) ? jb.langService.enumCompletions(path,compProps)
                : op == 'setPT' ? [...jb.langService.wrapWithArray(path, compProps), ...jb.langService.newPTCompletions(path, 'set', compProps)]
                : op == 'insertPT' ? jb.langService.newPTCompletions(path, 'insert', compProps)
                : op == 'appendPT' ? jb.langService.newPTCompletions(path, 'append', compProps)
                : op == 'prependPT' ? jb.langService.newPTCompletions(path, 'prepend', compProps)
                : op == 'addProp' ? jb.langService.paramCompletions(path, compProps) : []
            return [...acc, ...toAdd]
        }, [])
        if (actions[0] && actions[0].indexOf('insideText') == 0)
            return await jb.langService.dataCompletions(compProps, actions[0].split('!').pop(), ctx)

        return res
    },
    newPTCompletions(path, opKind, compProps) { // opKind: set,insert,append,prepend
        const tgpModel = compProps.tgpModel
        const options = compProps.tgpModel.PTsOfPath(path).filter(x => !x.match(/^dataResource\./)).map(compName => {
            const comp = jb.utils.getCompById(compName,{tgpModel})
            return {
                label: compName.split('>').pop(), kind: 2, compName, opKind, path, compProps,
                detail: [comp.description, compName.indexOf('>') != -1 && compName.split('>')[0] + '>'].filter(x => x).join(' '),
                extend(ctx) { return setPTOp(this.path, this.opKind, this.compName, ctx) },
            }
        })
        const propStr = `${path.split('~').pop()}: `
        const propTitle = {
            label: propStr + tgpModel.paramTypes(path).join(', '), kind: 19, path, extend: () => { },
            detail: jb.path(compProps.tgpModel.paramDef(path), 'description')
        }
        return [propTitle, ...options]

        function setPTOp(path, opKind, compName, ctx) {
            const index = opKind == 'append' ? -1 : opKind == 'insert' ? (+path.split('~').pop() + 1) : opKind == 'prepend' && 0
            const basePath = opKind == 'insert' ? path.split('~').slice(0, -1).join('~') : path
            const basedOnVal = opKind == 'set' && tgpModel.valOfPath(path)
            const toAdd = jb.tgp.newProfile(tgpModel.getCompById(compName), compName, {basedOnVal})
            const result = opKind == 'set' ? jb.langService.setOp(path, toAdd, ctx) : addArrayItemOp(basePath, { toAdd, index, ctx })
            return result
        }

        function addArrayItemOp(path, { toAdd, index, srcCtx } = {}) {
            const val = tgpModel.valOfPath(path)
            toAdd = toAdd === undefined ? { $: 'TBD' } : toAdd
            if (Array.isArray(val)) {
                if (index === undefined || index == -1)
                    return { path, op: { $push: [toAdd] }, srcCtx, resultPath: `${path}~${val.length}` }
                else
                    return { path, op: { $splice: [[index, 0, toAdd]] }, srcCtx, resultPath: `${path}~${index}` }
            } else if (!val) {
                return { ...jb.langService.setOp(path, jb.asArray(toAdd), srcCtx), resultPath: `${path}~0` }
            } else {
                if (index === undefined || index == -1)
                    return { ...jb.langService.setOp(path, [val, toAdd], srcCtx), resultPath: `${path}~1` }
                else
                    return { ...jb.langService.setOp(path, [toAdd, val], srcCtx), resultPath: `${path}~0` }
            }
        }
    },
    enumCompletions(path, compProps) {
        return compProps.tgpModel.paramDef(path).options.split(',').map(label => ({
            label, kind: 19, path, compProps, op: { $set: label } }))
    },
    paramCompletions(path, compProps) {
        const tgpModel = compProps.tgpModel
        const params = tgpModel.paramsOfPath(path).filter(p => tgpModel.valOfPath(path + '~' + p.id) === undefined)
            .sort((p2, p1) => (p1.mandatory ? 1 : 0) - (p2.mandatory ? 1 : 0))
        return params.map(param => ({
            label: param.id, path, kind: 4, id: param.id, compProps, detail: [param.as, param.type, param.description].filter(x => x).join(' '),
            extend(ctx) { return addPropertyOp(`${this.path}~${this.id}`, ctx) },
        }))

        function addPropertyOp(path, srcCtx) {
            const param = tgpModel.paramDef(path)
            if (!param)
                return jb.logError(`no param def for path ${path}`, { srcCtx })
            const paramType = tgpModel.paramType(path)
            const result = param.templateValue ? JSON.parse(JSON.stringify(param.templateValue))
                : paramType.indexOf('data') != -1 ? '' : { $: 'TBD' }
    
            return jb.langService.setOp(path, result, srcCtx)
        }
    },
    wrapWithArray(path, compProps) {
        const tgpModel = compProps.tgpModel
        return [path].filter(x => x).map(path => tgpModel.canWrapWithArray(path) ? {
            label: `wrap with array`, kind: 18, compProps, path, extend(ctx) { return { ...wrapWithArrayOp(this.path, ctx), whereToLand: 'end' } },
        } : null).filter(x => x).slice(0, 1)

        function wrapWithArrayOp(path, srcCtx) {
            const toAdd = tgpModel.valOfPath(path)
            if (toAdd != null && !Array.isArray(toAdd))
                return { ...jb.langService.setOp(path, [toAdd], srcCtx) }
        }
    },

    async dataCompletions(compProps, path, ctx) {
        const { actionMap, inCompOffset, text, startOffset, filePath, compLine } = compProps
        const item = actionMap.filter(e => e.from <= inCompOffset && inCompOffset < e.to || (e.from == e.to && e.from == inCompOffset))
            .find(e => e.action.indexOf('insideText!') == 0)
        const value = text.slice(item.from - startOffset - 1, item.to - startOffset - 1)
        const selectionStart = inCompOffset - item.from + 1
        const input = { value, selectionStart }
        const { line, col } = jb.tgpTextEditor.offsetToLineCol(text, item.from - startOffset - 1)

        const suggestions = await ctx.setData(input).setVars({ filePath, probePath: path }).run(
            {$: 'langServer.remoteProbe', sourceCode: {$: 'probeServer', filePath: '%$filePath%'}, probePath: '%$probePath%', expressionOnly: true })
        return (jb.path(suggestions, '0.options') || []).map(option => {
            const { pos, toPaste, tail, text } = option
            const primiteVal = option.valueType != 'object'
            const suffix = primiteVal ? '%' : '/'
            const newText = toPaste + suffix
            const startInInput = pos - tail.length
            const overlap = calcOverlap(newText, input.value.slice(startInInput))
            const suffixExists = input.value.substr(startInInput + overlap)[0] == suffix
            const newVal = input.value.substr(0, startInInput) + newText + input.value.substr(startInInput + overlap + (suffixExists ? 1 : 0))
            const cursorPos = { line: line + compLine, col: col + startInInput + toPaste.length + (suffix == '%' ? 2 : 1) }
            return { label: text, path, kind: primiteVal ? 12 : 13, cursorPos, compProps,  op: { $set: newVal } }
        })

        function calcOverlap(s1, s2) {
            for (i = 0; i < s1.length; i++)
                if (s1[i] != s2[i]) return i
            return s1.length
        }
    },

    setOp(path, value, srcCtx) {
        return { op: { $set: value }, path, srcCtx }
    },

    tgpModelForLangService: class tgpModelForLangService {
        constructor(tgpModel) {
            Object.assign(this,tgpModel)
            this.ptsOfTypeCache = {}
            this.currentComp = {}
        }
        valOfPath(path, silent){ 
            const res = jb.path(this.getCompById(path.split('~')[0], silent),path.split('~').slice(1))
            return res && res[jb.macro.isMacro] ? res() : res
        }
        compName(prof) { return jb.utils.compName(prof, {tgpModel: this}) }
        compNameOfPath(path) {
          if (path.indexOf('~') == -1)
            return 'jbComponent'
          if (path.match(/~\$vars$/)) 
              return
          const prof = this.valOfPath(path)
          return this.compName(prof) || this.compName(prof,{ parentParam: this.paramDef(path) })
        }
        paramDef(path) {
          if (!jb.tgp.parentPath(path))
              return this.getCompById(path)
          if (!isNaN(Number(path.split('~').pop()))) // array elements
              path = jb.tgp.parentPath(path)
          const comp = this.compOfPath(jb.tgp.parentPath(path))
          const paramName = path.split('~').pop()
          return jb.utils.compParams(comp).find(p=>p.id==paramName)
        }
        compOfPath(path) { return this.getCompById(this.compNameOfPath(path)) }
        paramsOfPath(path) { return jb.utils.compParams(this.compOfPath(path)) }
        getCompById(id, silent) { 
            return this.currentComp.compId == id ? this.currentComp.comp : jb.utils.getCompById(id, {tgpModel: this, silent}) 
        }
        PTsOfType(type) {
            if (this.ptsOfTypeCache[type])
                return this.ptsOfTypeCache[type]
            const comps = this.comps
            const single = /([^\[]*)(\[\])?/
            const types = [...(type||'').replace(/<>|\[\]/g,'').split(',').map(x=>x.match(single)[1]),'any']
                .flatMap(x=> x=='data' ? ['data','aggregator','boolean'] : [x])
            const res = types.flatMap(t=> jb.entries(comps).filter(c=> !c[1].hidden && jb.tgp.isCompObjOfType(c[1],t)).map(c=>c[0]) )
            res.sort((c1,c2) => this.markOfComp(c2) - this.markOfComp(c1))
            return (this.ptsOfTypeCache[type] = res)
        }
        markOfComp(id) {
            return +(((this.getCompById(id).category||'').match(/common:([0-9]+)/)||[0,0])[1])
        }
        PTsOfPath(path) {
            const typeAdpter = this.valOfPath(`${jb.tgp.parentPath(path)}~fromType`,true)
            if (typeAdpter)
                return this.PTsOfType(typeAdpter)
            const types = this.paramTypes(path)
            if (types.length == 1)
                return this.PTsOfType(types[0])
            const pts = jb.utils.unique(types.flatMap(t=>this.PTsOfType(t)))
            pts.sort((c1,c2) => this.markOfComp(c2) - this.markOfComp(c1))
            return pts
        }
        paramTypes(path) { 
            return (jb.path(this.paramDef(path),'$symbolDslType') || '').split(',')
                .map(t=>t.split('[')[0])
                .map(t=> t == '$asParent' ? this.paramType(jb.tgp.parentPath(path)) : t)
        }
        paramType(path) { return this.paramDef(path) ? this.paramTypes(path)[0] : ''}
        enumOptions(path) { 
            return ((this.paramDef(path) || {}).options ||'').split(',').map(x=> ({code: x.split(':')[0],text: x.split(':')[0]}))
        }
        canWrapWithArray(path) {
            const type = this.paramDef(path) ? (this.paramDef(path).type || '') : ''
            const val = this.valOfPath(path)
            const parentVal = this.valOfPath(jb.tgp.parentPath(path))
            return type.includes('[') && !Array.isArray(val) && !Array.isArray(parentVal)
        }
        pluginOfFilePath(filePath) {
            return Object.values(this.plugins).filter(p=>p.files.includes(filePath)).map(p=>p.id)[0]
        }
        fileDsl(filePath) {
            const plugin = this.pluginOfFilePath(filePath)
            return plugin && (((this.plugins[plugin].dslOfFiles || []).find(e=>e[0]==filePath) || [])[1] || plugin.dsl)
        }
    }
})

extension('langService', 'api', {
    async completionItems(ctx) {
        const compProps = await jb.langService.calcCompProps(ctx)
        const { actionMap, reformatEdits, compLine, error, cursorPos } = compProps
        if (reformatEdits) {
            const item = {
                kind: 4, id: 'reformat', insertText: '', label: 'reformat', sortText: '0001',
                command: { command: 'jbart.applyCompChange', arguments: [{ edit: reformatEdits, cursorPos }] },
            }
            return [item]
        } else if (actionMap) {
            const items = await jb.langService.provideCompletionItems(compProps, ctx)
            items.forEach((item, i) => Object.assign(item, {
                compLine, insertText: '', sortText: ('0000' + i).slice(-4), command: { command: 'jbart.applyCompChange', 
                arguments: [item] 
            },
            }))
            jb.log('completion completion items', { items, ...compProps, ctx })
            return items
        } else if (error) {
            jb.logError('completion provideCompletionItems', compProps)
        }
    },
    async compId(ctx) {
        const compProps = await jb.langService.calcCompProps(ctx)
        const { path, tgpModel } = compProps
        return path && tgpModel.compNameOfPath(path)
    },
    async compReferences(ctx) {
        const target = ctx.data
        const paths = Object.values(jb.comps).flatMap(comp=>scanForPath(comp,jb.path(comp,[jb.core.CT,'fullId']) || ''))
        return paths.map(path=>jb.tgpTextEditor.filePosOfPath(path))

        function scanForPath(profile,path) {
            if (!profile || jb.utils.isPrimitiveValue(profile) || typeof profile == 'function') return []
            return [ 
                ...(jb.path(profile,[jb.core.CT,'comp',jb.core.CT,'fullId']) == target ? [path] : []),
                ...Object.keys(profile).flatMap(k=>scanForPath(profile[k],`${path}~${k}`))
            ]
        }
    },
    async definition(ctx) {
        const compProps = await jb.langService.calcCompProps(ctx)
        const { actionMap, reformatEdits, inExtension, error, path, tgpModel, lineText } = compProps
        const allSemantics = actionMap.filter(e => e.action && e.action.endsWith(path)).map(x => x.action.split('!')[0])
        if (reformatEdits) {
            return // maybe should return error
        } else if (inExtension || allSemantics.includes('function')) {
            return funcLocation()
        } else if (path) {
            const cmpId = tgpModel.compNameOfPath(path)
            return jb.path(tgpModel.comps,[cmpId,'location']) || funcLocation()
        } else if (error) {
            jb.logError('langService definition', compProps)
        }

        async function funcLocation() {
            const [, lib, func] = lineText.match(/jb\.([a-zA-Z_0-9]+)\.([a-zA-Z_0-9]+)/) || ['', '', '']
            if (lib && jb.path(jb, [lib, '__extensions'])) {
                // TODO: pass extensions in tgpModel
                const loc = Object.values(jb[lib].__extensions).filter(ext => ext.funcs.includes(func)).map(ext => ext.location)[0]
                const lineOfExt = (+loc.line) || 0
                const fileContent = await jbHost.codePackageFromJson().fetchFile(loc.path)
                const lines = ('' + fileContent).split('\n').slice(lineOfExt)
                const funcHeader = new RegExp(`[^\.]${func}\\s*:|[^\.]${func}\\s*\\(`) //[^{]+{)`)
                const lineOfFunc = lines.findIndex(l => l.match(funcHeader))
                return { ...loc, line: lineOfExt + lineOfFunc }
            }
        }
    },

    async moveInArrayEdits(diff,ctx) {
        const compProps = await jb.langService.calcCompProps(ctx)
        const { reformatEdits, compId, compLine, actionMap, text, path, comp, tgpModel } = compProps
        if (!reformatEdits && actionMap) {
            const rev = path.split('~').slice(1).reverse()
            const indexOfElem = rev.findIndex(x => x.match(/^[0-9]+$/))
            if (indexOfElem != -1) {
                const path = rev.slice(indexOfElem).reverse()
                const arrayPath = path.slice(0, -1)
                const fromIndex = +path.slice(-1)[0]
                const toIndex = fromIndex + diff
                const valToMove = jb.path(comp,path)
                const op = {$splice: [[fromIndex,1],[toIndex,0,valToMove]] }

                const opOnComp = {}
                jb.path(opOnComp,arrayPath,op) // create opOnComp as nested object
                const newComp = jb.immutable.update(comp,opOnComp)
                const newRes = jb.utils.prettyPrintWithPositions(newComp, { initialPath: compId, tgpModel })
                const edit = jb.tgpTextEditor.deltaFileContent(text, newRes.text , compLine)
                jb.log('tgpTextEditor moveInArray', { op, edit, ...compProps })

                const origPath = compProps.path.split('~')
                const index = origPath.length - indexOfElem
                const to = [...origPath.slice(0,index-1),toIndex,...origPath.slice(index)].join('~')

                return { edit, cursorPos: calcNewPos(to, newRes) }
            }
        }
        return { error: 'moveInArray - array elem was not found', ...compProps }

        function calcNewPos(path, prettyPrintData) {
            const { line, col } = jb.tgpTextEditor.getPosOfPath(path, 'begin',{prettyPrintData})
            if (!line && !col)
                return jb.logError('moveInArray can not find path', { path })
            return { line: line + compLine, col }
        }
    }
})

extension('tgpTextEditor', 'commands', {
    async applyCompChange(item) {
//        if (item.id == 'reformat') return
        const host = jb.tgpTextEditor.host
        await host.saveDoc()
        const editAndCursor = item.edit ? item : calcEditAndGotoPos(item)
        const { edit, cursorPos } = editAndCursor
        try {
            await host.applyEdit(edit)
            await host.saveDoc()
            if (cursorPos) {
                await host.selectRange(cursorPos)
                if (cursorPos.TBD) {
                    await host.execCommand('editor.action.triggerSuggest')
                }
            }
        } catch (e) {
            jb.vscode.log(`applyCompChange exception`)
            jb.logException(e, 'completion apply comp change', { item })
        }

        function calcEditAndGotoPos(item) {
            const { text, compId, comp, compLine, tgpModel } = item.compProps
            const itemProps = item.extend ? { ...item, ...item.extend() } : item
            const { op, path, resultPath, whereToLand } = itemProps
    
            const opOnComp = {}
            jb.path(opOnComp,path.split('~').slice(1),op) // create op as nested object
            const newComp = jb.immutable.update(comp,opOnComp)
            const newRes = jb.utils.prettyPrintWithPositions(newComp, { initialPath: compId, tgpModel })
            const edit = jb.tgpTextEditor.deltaFileContent(text, newRes.text , compLine)
    
            const cursorPos = itemProps.cursorPos || calcNewPos(newRes)
            return { edit, cursorPos }
    
            function calcNewPos(prettyPrintData) {
                const TBD = item.compName == 'TBD' || jb.path(itemProps, 'op.$set.$') == 'TBD'
                const _whereToLand = TBD ? 'begin' : (whereToLand || 'edit')
                const { line, col } = jb.tgpTextEditor.getPosOfPath(resultPath || path, _whereToLand, {prettyPrintData})
                return { TBD, line: line + compLine, col }
            }
        }
    }
})

jb.defComponents('completionItems,definition,compId,compReferences,calcCompProps'
.split(','), f => component(`langService.${f}`, {
  autoGen: true,
  impl: ctx => jb.langService[f](ctx)
})
)

component('langService.moveInArrayEdits', {
    params: [
        { id: 'diff', as: 'number', defaultValue: '%%' }
    ],
    impl: (ctx,diff) => jb.langService.moveInArrayEdits(diff,ctx)
})
