
jb.component('tgp.completionOptionsTest', {
  type: 'test',
  params: [
    {id: 'compText', as: 'string', description: 'use __ for completion points'},
    {id: 'expectedSelections', as: 'array', description: 'label a selection that should exist in the menu. one for each point'},
    {id: 'dsl', as: 'string'}
  ],
  impl: (ctx,compText,expectedSelections,dsl)=> {
        jb.workspace.initJbWorkspaceAsHost()
        const parts = compText.split('__')
        const dslLine = dsl ? `jb.dsl('${dsl}')\n` : ''
        const offsets = parts.reduce((acc,part) => [...acc, acc.pop()+part.length] , [0] ).slice(1,-1).map(x=>x+dslLine.length)
        const code = parts.join('')
        jb.tgpTextEditor.evalProfileDef(code,dsl)
        jb.tgpTextEditor.host.initDoc('dummy.js', dslLine+code)
        
        const result = offsets.map(offset=>jb.tgpTextEditor.offsetToLineCol(dslLine+code,offset)).map((inCompPos,i) => {
            jb.tgpTextEditor.host.selectRange(inCompPos)
            const options = jb.tgpTextEditor.provideCompletionItems(ctx)
            if (!options)
                return `no options at index ${i}`
            const res = options.map(x=>x.label).includes(expectedSelections[i])
            if (!res)
                return `${expectedSelections[i]} not found at index ${i}`
            return ''
        }).join('-')

        const testId = ctx.vars.testID;
        return { id: testId, title: testId, success: result.match(/^-*$/), reason: result }
    }
})
  
jb.component('tgp.completionActionTest', {
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
            const parts = compText.split('__')
            const dslLine = dsl ? `jb.dsl('${dsl}')\n` : ''
            const offset = parts[0].length +dslLine.length
            const code = parts.join('')
            jb.tgpTextEditor.evalProfileDef(code,dsl)
            jb.utils.resolveLoadedProfiles()
            jb.tgpTextEditor.host.initDoc('dummy.js', dslLine+code)

            const inCompPos = jb.tgpTextEditor.offsetToLineCol(dslLine+code,offset)
            jb.tgpTextEditor.host.selectRange(inCompPos)
            const { needsFormat } = jb.tgpTextEditor.calcActiveEditorPath()
            if (needsFormat)
                return { testFailure: `bad comp format` }
            const item = jb.tgpTextEditor.provideCompletionItems(ctx).find(x=>x.label == completionToActivate)
            if (!item)
                return { testFailure: `completion not found - ${completionToActivate}` }
    
            await jb.tgpTextEditor.applyCompChange(item,ctx)
            await jb.delay(1) // wait for cursor change
            const actualEdit = jb.tgpTextEditor.lastEdit
            console.log(jb.utils.prettyPrint(actualEdit.edit))
            const editsSuccess = Object.keys(jb.utils.objectDiff(actualEdit.edit,expectedEdit)).length == 0
            const selectionSuccess  = expectedTextAtSelection == null || jb.tgpTextEditor.host.getTextAtSelection() == expectedTextAtSelection
            const actualCursorPos = [jb.tgpTextEditor.host.cursorLine(),jb.tgpTextEditor.host.cursorCol()].join(',')
            const cursorPosSuccess = !expectedCursorPos || expectedCursorPos == actualCursorPos
    
            const testFailure = (editsSuccess ? '' : 'wrong expected edit') + 
                (selectionSuccess ? '' : `wrong expected selection "${expectedTextAtSelection}" instead of "${jb.tgpTextEditor.host.getTextAtSelection}"`) +
                (cursorPosSuccess ? '' : `wrong cursor pos ${actualCursorPos} instead of ${expectedCursorPos}`)
    
            return { testFailure }        
        },
    not('%testFailure%')
  )
})
