using('workspace-core')

extension('test', 'completion', {
	initExtension() {
		return { uniqueNameCounter: 0 } 
	},
	fixToUniqueName(code) {
    jb.test.uniqueNameCounter++
    const cmpId = 'CmpltnTst'+jb.test.uniqueNameCounter
    return code.replace(/component\('x',/,`component('${cmpId}',`)
  },
  initCompletionText({ctx,compText,filePath,dsl,remoteSuggestions}) {
    const testId = ctx.vars.testID
    jb.workspace.initJbWorkspaceAsHost()
    const fullText = compText.match(/^component\(/) ? compText : `component('x', {\n  impl: ${compText}\n})`
    const parts = jb.test.fixToUniqueName(fullText).split('__')
    const offset = parts[0].length
    const code = parts.join('')
    jb.tgpTextEditor.host.initDoc(filePath, code)
    const pluginId = jb.pathToPluginId(filePath)
    const tgpModel = jb.langService.tgpModels[filePath] = new jb.langService.tgpModelForLangService(jb.tgp.tgpModelData({plugin: pluginId}))
    const plugin = tgpModel.plugins[pluginId]
    plugin.files.push(filePath)
    if (dsl) {
      plugin.dslOfFiles = plugin.dslOfFiles || []
      plugin.dslOfFiles.push([filePath,dsl])
    }
    const ctxForTest = ctx.setVars({forceLocalSuggestions: !remoteSuggestions})
    const inCompPos = jb.tgpTextEditor.offsetToLineCol(code,offset)
    jb.tgpTextEditor.host.selectRange(inCompPos)
    const offsets = parts.reduce((acc,part) => [...acc, acc.pop()+part.length] , [0] ).slice(1,-1)

    return {testId, tgpModel, ctxForTest, code, inCompPos, offsets}
  },
})

component('completionOptionsTest', {
  type: 'test',
  params: [
    {id: 'compText', as: 'string', description: 'use __ for completion points'},
    {id: 'expectedSelections', as: 'array', description: 'label a selection that should exist in the menu. one for each point'},
    {id: 'filePath', as: 'string', defaultValue: '/plugins/ui/common/ui-common-tests.js'},
    {id: 'dsl', as: 'string'}
  ],
  impl: dataTest({
    calculate: async (ctx,{},{compText,filePath,dsl})=> {
      const {ctxForTest, code, offsets} = jb.test.initCompletionText({ctx,compText,filePath,dsl})
      const offsetsPos = offsets.map(offset=>jb.tgpTextEditor.offsetToLineCol(code,offset))
      const acc = []
      await offsetsPos.reduce(async (pr, inCompPos) => {
        await pr
        jb.tgpTextEditor.host.selectRange(inCompPos)
        const options = (await jb.langService.completionItems(ctxForTest)).items.map(x=>x.label)
        acc.push({options})
      }, Promise.resolve())
      return acc
    },
    expectedResult: ({data},{},{expectedSelections}) => {
      const errors = data.reduce((errors,{options},i) => {
        if (jb.path(options,'0') == 'reformat')
          return ['bad format']
        if (!options)
            return [`no options at index ${i}`]
        const res = options.includes(expectedSelections[i]) ? '' : ` ${expectedSelections[i]} not found at index ${i}`
        return [...errors,res]
      }, []).filter(x=>x).join(', ')
      return errors.match(/^-*$/) ? true : { testFailure: errors }
    },
    includeTestRes: true
  })
})
  
component('completionActionTest', {
  type: 'test',
  params: [
    {id: 'compText', as: 'string', description: 'use __ for completion point'},
    {id: 'completionToActivate', as: 'string', dynamic: true, description: 'label of completion to activate', byName: true},
    {id: 'expectedEdit', description: '{ range: , newText:}'},
    {id: 'expectedTextAtSelection', description: '{ start: , end: }'},
    {id: 'expectedCursorPos', description: 'e.g. 1,12'},
    {id: 'filePath', as: 'string', defaultValue: '/plugins/ui/common/ui-common-tests.js'},
    {id: 'dsl', as: 'string'},
    {id: 'remoteSuggestions', as: 'boolean', type: 'boolean'}
  ],
  impl: dataTest({
    calculate: async (ctx,{}, {compText,completionToActivate, filePath, dsl, remoteSuggestions }) => {
        const {ctxForTest} = jb.test.initCompletionText({ctx,compText,filePath,dsl,remoteSuggestions})
        const {items} = await jb.langService.completionItems(ctxForTest)
        if (items.find(x=>x.label == 'reformat'))
            return { testFailure: `bad comp format` }

        const toActivate = completionToActivate(ctx.setData(items))
        const item = items.find(x=>x.label == toActivate)
        if (!item) 
          return { items: items.map(x=>x.label), toActivate }

        await jb.tgpTextEditor.applyCompChange(item.edit ? item : jb.langService.editAndCursorOfCompletionItem(item), {ctx})
        //jb.tgpTextEditor.applyCompChange(item,{ctx})
        await jb.delay(1) // wait for cursor change
        const {cursorLine, cursorCol } = jb.tgpTextEditor.host.compTextAndCursor()
        const actualCursorPos = [cursorLine, cursorCol].join(',')
        const actualEdit = jb.tgpTextEditor.lastEditForTester
        //console.log(actualEdit)
        return {items: items.map(x=>x.label), item: item.label, actualEdit, actualCursorPos, toActivate}
    },
    expectedResult: ({data},{},{expectedEdit, expectedTextAtSelection, expectedCursorPos}) => {
      const {item,actualEdit,actualCursorPos, toActivate } = data
      if (!item)
        return { testFailure: `completion not found - ${toActivate}` }

      const editsSuccess = Object.keys(jb.utils.objectDiff(actualEdit.edit,expectedEdit)).length == 0
      const selectionSuccess  = expectedTextAtSelection == null || jb.tgpTextEditor.host.getTextAtSelection() == expectedTextAtSelection
      const cursorPosSuccess = !expectedCursorPos || expectedCursorPos == actualCursorPos

      const testFailure = (editsSuccess ? '' : 'wrong expected edit') + 
          (selectionSuccess ? '' : `wrong expected selection "${expectedTextAtSelection}" instead of "${jb.tgpTextEditor.host.getTextAtSelection}"`) +
          (cursorPosSuccess ? '' : `wrong cursor pos ${actualCursorPos} instead of ${expectedCursorPos}`)

      return { testFailure }
    },
    includeTestRes: true
  })
})

component('fixEditedCompTest', {
  type: 'test',
  params: [
    {id: 'compText', as: 'string', description: 'use __ for completion point'},
    {id: 'expectedFixedComp', as: 'string'},
    {id: 'filePath', as: 'string', defaultValue: '/plugins/ui/common/ui-common-tests.js'},
    {id: 'dsl', as: 'string'}
  ],
  impl: async (ctx,compText,expectedFixedComp,filePath,dsl) => {
      const {tgpModel, testId} = jb.test.initCompletionText({ctx,compText,filePath,dsl})
      const compsProps = jb.langService.calcCompPropsSync(jb.tgpTextEditor.host.compTextAndCursor(), tgpModel)
      const formattedText = compsProps.formattedText
      const success = formattedText == expectedFixedComp
      const reason = !success && formattedText
      return { id: testId, title: testId, success, reason }
    }
})

component('langService.dummyCompProps', {
  type: 'data<>',
  params: [
    {id: 'compText', as: 'string', mandatory: true, description: 'use __ for completion point'},
    {id: 'dsl', as: 'string'},
    {id: 'filePath', as: 'string', defaultValue: '/plugins/common/common-tests.js'},
    {id: 'includeCircuitOptions', as: 'boolean', type: 'boolean<>'}
  ],
  impl: (ctx,_compText,dsl,_filePath, includeCircuitOptions) => {
    const {tgpModel} = jb.test.initCompletionText({ctx,compText: _compText,filePath: _filePath,dsl})
    if (includeCircuitOptions)
      return jb.langService.calcCompProps(ctx,{includeCircuitOptions})
    const { compText, inCompOffset, shortId, cursorCol, cursorLine, compLine, filePath, lineText } 
      = jb.langService.calcCompPropsSync(jb.tgpTextEditor.host.compTextAndCursor(), tgpModel)
    return { compText, inCompOffset, shortId, cursorCol, cursorLine, compLine, filePath, lineText}
  }
})

component('tgp.pathChangeTest', {
  type: 'test',
  params: [
    {id: 'path', as: 'string'},
    {id: 'action', type: 'action', dynamic: true},
    {id: 'expectedPathAfter', as: 'string'},
    {id: 'cleanUp', type: 'action', dynamic: true}
  ],
  impl: (ctx,path,action,expectedPathAfter,cleanUp)=> {
    //st.initTests();

    const testId = ctx.vars.testID;
    const failure = (part,reason) => ({ id: testId, title: testId + '- ' + part, success:false, reason: reason });
    const success = _ => ({ id: testId, title: testId, success: true });

    const pathRef = jb.tgp.ref(path);
    action();
    
    const res_path = pathRef.path().join('~');
    if (res_path != expectedPathAfter)
      var res = { id: testId, title: testId, success: false , reason: res_path + ' instead of ' + expectedPathAfter }
    else
      var res = { id: testId, title: testId, success: true };
    cleanUp();

    return res;
  }
})
