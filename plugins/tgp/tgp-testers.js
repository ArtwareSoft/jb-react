using('workspace')

extension('test', 'completion', {
	initExtension() {
		return { uniqueNameCounter: 0 } 
	},
	fixToUniqueName(code) {
    jb.test.uniqueNameCounter++
    const cmpId = 'CmpltnTst'+jb.test.uniqueNameCounter
    return code.replace(/component\('x',/,`component('${cmpId}',`)
  }
})

component('mixedMigrationTest', {
  type: 'test',
  params: [
    {id: 'cmpId', as: 'string' },
    {id: 'expectedResult', type: 'boolean', dynamic: true},
  ],
  impl: (ctx,cmpId,expectedResult)=> {
      const testId = ctx.vars.testID
      //const [code,cmpId] = fixCode(cmpId)
      //jb.tgpTextEditor.evalProfileDef(code, {})
      const newProfCode = jb.utils.prettyPrintComp(cmpId,jb.comps[cmpId], { mixed: true })
      const [mixedCode,newCmpId] = fixCode(newProfCode.replace(cmpId,'x'))
      jb.tgpTextEditor.evalProfileDef(mixedCode, { mixed: true})
      const newProfCode2 = jb.utils.prettyPrintComp(newCmpId,jb.comps[newCmpId], { mixed: true })
      const matchExpected = expectedResult(ctx.setData(newProfCode))
      const sameCode = matchExpected && newProfCode2.replace(newCmpId,'x') == newProfCode.replace(cmpId,'x')
      const reason = (!matchExpected && 'expectedResult does not match') || (!sameCode && 'code does not match')
      return { id: testId, title: testId, success: sameCode && matchExpected, reason }

      function fixCode(code) {
        jb.test.uniqueNameCounter++
        const cmpId = 'CmpltnTst'+jb.test.uniqueNameCounter
        return [code.replace(/component\('x',/,`component('${cmpId}',`), cmpId ]
      } 
  }
})

component('tgp.completionOptionsTest', {
  type: 'test',
  params: [
    {id: 'compText', as: 'string', description: 'use __ for completion points'},
    {id: 'expectedSelections', as: 'array', description: 'label a selection that should exist in the menu. one for each point'},
    {id: 'filePath', as: 'string', defaultValue: 'projects/jb-react/plugins/common/jb-common-tests.js'},
    {id: 'dsl', as: 'string'}
  ],
  impl: async (ctx,compText,expectedSelections,filePath,dsl)=> {
      const testId = ctx.vars.testID
      jb.workspace.initJbWorkspaceAsHost()
      const parts = jb.test.fixToUniqueName(compText).split('__')
      const dslLine = dsl ? `dsl('${dsl}')\n` : ''
      const offsets = parts.reduce((acc,part) => [...acc, acc.pop()+part.length] , [0] ).slice(1,-1)
        .map(x=>x+dslLine.length)
      const code = parts.join('')
      jb.tgpTextEditor.host.initDoc(filePath, dslLine+code)
      const ctxForTest = ctx.setVars({forceLocalSuggestions: true})
      
      const result = await offsets.map(offset=>jb.tgpTextEditor.offsetToLineCol(dslLine+code,offset))
        .reduce(async (errors, inCompPos,i) => {
          const _errors = await errors
          jb.tgpTextEditor.host.selectRange(inCompPos)
          const options = await jb.tgpTextEditor.provideCompletionItems(jb.tgpTextEditor.host.compTextAndCursor(), ctxForTest)
          if (jb.path(options,'0.id') == 'reformat')
            return `bad format`
          if (!options)
              return `no options at index ${i}`
          const res = options.map(x=>x.label).includes(expectedSelections[i]) ? '' : ` ${expectedSelections[i]} not found at index ${i}`
          return _errors + res
      }, '')

      return { id: testId, title: testId, success: result.match(/^-*$/), reason: result }
  }
})
  
component('tgp.completionActionTest', {
  type: 'test',
  params: [
    {id: 'compText', as: 'string', description: 'use __ for completion point'},
    {id: 'completionToActivate', as: 'string', description: 'label of completion to activate'},
    {id: 'expectedEdit', description: '{ range: , newText:}'},
    {id: 'expectedTextAtSelection', description: '{ start: , end: }'},
    {id: 'expectedCursorPos', description: 'e.g. 1,12'},
    {id: 'dsl', as: 'string'}
  ],
  impl: dataTest(
    async (ctx,{}, {compText,completionToActivate, expectedEdit, expectedTextAtSelection, expectedCursorPos,dsl }) => {
            jb.workspace.initJbWorkspaceAsHost()
            const parts = jb.test.fixToUniqueName(compText).split('__')
            const dslLine = dsl ? `dsl('${dsl}')\n` : ''
            const offset = parts[0].length +dslLine.length
            const code = parts.join('')
            jb.utils.resolveLoadedProfiles()
            jb.tgpTextEditor.host.initDoc('someDir/plugins/common/jb-common-tests.js', dslLine+code)
            const ctxForTest = ctx.setVars({forceLocalSuggestions: true})

            const inCompPos = jb.tgpTextEditor.offsetToLineCol(dslLine+code,offset)
            jb.tgpTextEditor.host.selectRange(inCompPos)
            const { reformatEdits } = jb.tgpTextEditor.calcActiveEditorPath(jb.tgpTextEditor.host.compTextAndCursor())
            if (reformatEdits)
                return { testFailure: `bad comp format` }
            const items = await jb.tgpTextEditor.provideCompletionItems(jb.tgpTextEditor.host.compTextAndCursor(), ctxForTest)
            const item = items.find(x=>x.label == completionToActivate)
            if (!item)
                return { testFailure: `completion not found - ${completionToActivate}` }
    
            await jb.tgpTextEditor.applyCompChange(item,ctx)
            await jb.delay(1) // wait for cursor change
            const {cursorLine, cursorCol } = jb.tgpTextEditor.host.compTextAndCursor()
            const actualCursorPos = [cursorLine, cursorCol].join(',')
            const actualEdit = jb.tgpTextEditor.lastEditForTester
            console.log(jb.utils.prettyPrint(actualEdit.edit))
            const editsSuccess = Object.keys(jb.utils.objectDiff(actualEdit.edit,expectedEdit)).length == 0
            const selectionSuccess  = expectedTextAtSelection == null || jb.tgpTextEditor.host.getTextAtSelection() == expectedTextAtSelection
            const cursorPosSuccess = !expectedCursorPos || expectedCursorPos == actualCursorPos
    
            const testFailure = (editsSuccess ? '' : 'wrong expected edit') + 
                (selectionSuccess ? '' : `wrong expected selection "${expectedTextAtSelection}" instead of "${jb.tgpTextEditor.host.getTextAtSelection}"`) +
                (cursorPosSuccess ? '' : `wrong cursor pos ${actualCursorPos} instead of ${expectedCursorPos}`)
    
            return { testFailure }        
        },
    not('%testFailure%')
  )
})

component('tgp.fixEditedCompTest', {
  type: 'test',
  params: [
    {id: 'compText', as: 'string', description: 'use __ for completion point'},
    {id: 'expectedFixedComp', as: 'string'},
    {id: 'dsl', as: 'string'}
  ],
  impl: async (ctx,compText,expectedFixedComp,dsl) => {
      jb.workspace.initJbWorkspaceAsHost()
      const parts = jb.test.fixToUniqueName(compText).split('__')
      const dslLine = dsl ? `dsl('${dsl}')\n` : ''
      const offset = parts[0].length +dslLine.length
      const code = parts.join('')
      jb.utils.resolveLoadedProfiles()
      jb.tgpTextEditor.host.initDoc('someDir/plugins/common/jb-common-tests.js', dslLine+code)

      const inCompPos = jb.tgpTextEditor.offsetToLineCol(dslLine+code,offset)
      jb.tgpTextEditor.host.selectRange(inCompPos)
      const { formattedText, fixedCompText } = await jb.tgpTextEditor.calcActiveEditorPath(jb.tgpTextEditor.host.compTextAndCursor())
      const testId = ctx.vars.testID;
      const success = formattedText == expectedFixedComp || fixedCompText == expectedFixedComp
      const reason = !success && formattedText
      return { id: testId, title: testId, success, reason }
    }
})

component('tgp.dummyDocProps', {
  params: [
    {id: 'compText', as: 'string', mandatory: true, description: 'use __ for completion point'},
    {id: 'dsl', as: 'string'},
    {id: 'filePath', as: 'string', defaultValue: 'projects/jb-react/plugins/common/jb-common-tests.js'},
  ],
  impl: (ctx,_compText,dsl,_filePath) => {
    jb.workspace.initJbWorkspaceAsHost()
    const parts = jb.test.fixToUniqueName(_compText).split('__')
    const dslLine = dsl ? `dsl('${dsl}')\n` : ''
    const offset = parts[0].length +dslLine.length
    const code = parts.join('')
    jb.utils.resolveLoadedProfiles()
    jb.tgpTextEditor.host.initDoc(_filePath, dslLine+code)

    const _inCompPos = jb.tgpTextEditor.offsetToLineCol(dslLine+code,offset)
    jb.tgpTextEditor.host.selectRange(_inCompPos)
    const { compText, inCompPos, shortId, cursorCol, cursorLine, compLine, filePath } = jb.tgpTextEditor.calcActiveEditorPath(jb.tgpTextEditor.host.compTextAndCursor())
    return { compText, inCompPos, shortId, cursorCol, cursorLine, compLine, filePath}
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
