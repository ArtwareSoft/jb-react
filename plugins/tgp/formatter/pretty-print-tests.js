using('ui-core,remote-widget,parsing,testing,core-tests')

component('PPrintTest.vars', {
  impl: dataTest(
    ctx => {
    try {
      const testToTest = 'coreTest.varsCases'
      const compTxt = jb.utils.prettyPrintComp(testToTest.replace(/varsCases/, 'varsCases2'), jb.comps['test<>'+testToTest])
      eval(compTxt)
      return ctx.run(coreTest.asArrayBug(),'test<>') // checks for error
        .then(({ success }) => success && compTxt)
    } catch (e) {
      return false
    }
  },
    contains(`Var('items', [{id: 1}, {id: 2}])`)
  )
})

component('PPrintTest.varsPath', {
  impl: PPPosOfPath(() => split(Var('a', 'b')), 'data<>', 'edit!~$vars~0~val', '27,27')
})

component('PPrintTest.prependInGroup', {
  impl: PPPosOfPath(() => group(text(''), text('')), 'control<>', 'prependPT!~controls', '6,11')
})

component('PPrintTest.prependSingleInArrayPath', {
  impl: PPPosOfPath(() => group(text('')), 'control<>', 'prependPT!~controls', '6,11')
})

component('PPrintTest.singleInArrayPath', {
  impl: PPPosOfPath(() => group(text('')), 'control<>', 'begin!~controls~text', '11,11')
})

component('PPrintTest.singleParamByNameComp', {
  params: [
    {id: 'p1', as: 'boolean', type: 'boolean<>', byName: true}
  ]
})

component('PPrintTest.singleParamByName', {
  impl: PPPosOfPath(() => pipeline(PPrintTest.singleParamByNameComp({p1: true})), 'data<>', 'begin!~source~p1', '48,48')
})

component('PPrintTest.secondParamAsArray', {
  impl: PPPosOfPath(() => pipeline(list(1,2), '%%'), 'data<>', 'begin!~items~0', '20,20')
})

component('PPrintTest.secondParamAsArrayWithVars', {
  impl: PPPosOfPath(() => pipeline(Var('a', 3), '%%', 'aa'), 'data<>', 'begin!~items~0', '28,28')
})

component('PPrintTest.secondParamAsArrayWithLongVars', {
  impl: PPPosOfPath({
    profile: () => pipeline(Var('a', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'), '%%', 'aaaaaaaaaaaaaaaaaaaaaadasdaaaaaaaaaaaaaaaaaaaaa'),
    expectedType: 'data<>',
    path: 'begin!~items~0',
    expectedPos: '82,82'
  })
})

component('PPrintTest.asyncVar', {
  impl: PPPosOfPath(() => pipeline(Var('a',3, {async: true})), 'data<>', 'begin!~$vars~0~async', '30,30')
})

component('PPrintTest.multiLineExample', {
  params: [
    {id: 'param1'}
  ],
  impl: group(
    text('hello'),
    group(text('-1-'), controlWithCondition('1==2', text('-1.5-')), text('-2-')),
    text('world')
  )
})

component('PPrintTest.multiLine.prepend', {
  impl: PPPosOfPath(() => jb.comps['control<>PPrintTest.multiLineExample'], 'control<>', 'prependPT!~impl~controls', '93,98')
})

component('PPrintTest.param', {
  impl: dataTest({
    calculate: () => jb.utils.prettyPrintComp('PPrintTest.multiLineExample',jb.comps['control<>PPrintTest.multiLineExample']),
    expectedResult: contains(`{id: 'param1'}`)
  })
})

component('PPrintTest.multiLine.implBegin', {
  impl: PPPosOfPath(() => jb.comps['control<>PPrintTest.multiLineExample'], 'control<>', 'begin!~impl', '87,87')
})

component('PPrintTest.multiLine.implEnd', {
  impl: PPPosOfPath(() => jb.comps['control<>PPrintTest.multiLineExample'], 'control<>', 'end!~impl', '216,216')
})

component('PPrintTest.dslNameOverideExample', {
  type: 'settlement<location>',
  impl: pipeline({ state: israel() })
})

component('PPrintTest.dslNameOveride', {
  impl: PPPosOfPath(() => jb.comps['settlement<location>PPrintTest.dslNameOverideExample'], 'settlement<location>', 'addProp!~impl~state', '113,113')
})

component('PPrintTest.remark.pipeline', {
  impl: dataTest({
    calculate: pipeline(
      () => jb.utils.prettyPrintWithPositions(pipeline(Var('x',1), 'a' , {'//': 'hello'}),{type: 'data<>', singleLine: true}),
      log('test'),
      '%text%'
    ),
    expectedResult: equals(`pipeline(Var('x', 1), 'a', { '//': 'hello' })`)
  })
})

component('PPrintTest.newLinesInCode', {
  impl: dataTest({
    calculate: () => jb.utils.prettyPrint(html(`<div>\n</div>`),{type: 'control<>'}),
    expectedResult: equals('html(`<div>\n</div>`)')
  })
})

component('PPrintTest.Positions.closeArray', {
  impl: PPPosOfPath({
    profile: () => text('hey', { features: [css.color('green'), css.color('green')] }), 
    expectedType: 'control<>',
    path: 'end!~features',
    expectedPos: '65,65'
  })
})

component('test.foldFunction', {
  impl: pipeline({
    source: () => jb.utils.prettyPrintWithPositions(frontEnd.var('itemPropsProfile', ({ }, { $model }) => 
      $model.itemProps.profile) , {type: 'feature<>', }),
    items: ['%text%']
  })
})

component('PPrintTest.posOfFoldFunctionBug', {
  impl: dataTest(() => jb.tgpTextEditor.getPosOfPath('data<>test.foldFunction~impl~items~0'), equals('%line%', 4))
})

component('PPrintTest.singleFunc', {
  impl: PPPosOfPath(() => frontEnd.init(({ }, { }) => 5), 'feature<>', 'function!~action', '14,29')
})

component('PPrintTest.primitiveArray', {
  impl: dataTest({
    calculate: () => jb.utils.prettyPrintWithPositions(list(1, 2, 3, 4), {type: 'data<>'}),
    expectedResult: equals('%text%', 'list(1,2,3,4)')
  })
})

component('PPrintTest.byValue.cutTailingUndefinedArgs', {
  impl: dataTest(() => jb.utils.prettyPrint(css.boxShadow({ inset: false }), {type: 'feature<>'}), notContains('undefined'))
})

component('PPrintTest.async', {
  impl: dataTest(() => jb.utils.prettyPrint({ async a() { 3 } }), and(not(contains('a:')), contains('async a() { 3 }')))
})

component('PPrintTest.asIs', {
  impl: dataTest(() => jb.utils.prettyPrint(asIs({remoteRun: { $: 'runCtx' }})), contains('$:'))
})

component('PPrintTest.asIsLarge', {
  impl: dataTest({
    calculate: () => jb.utils.prettyPrint(equals(asIs({ edit: { range: {start: {line: 3, col: 0}, end: {line: 3, col: 0}},
    newText: `component('dataTest.test.tst1', {\n  impl: dataTest(test.tst1(), equals(''))\n})` }, cursorPos: {line: 4, col: 0} })
  ), {type: 'data<>'}),
    expectedResult: equals(`equals(asIs({\n    edit: {\n      range: {start: {line: 3, col: 0}, end: {line: 3, col: 0}},\n      newText: \`component('dataTest.test.tst1', {\\n  impl: dataTest(test.tst1(), equals(''))\\n})\`\n    },\n    cursorPos: {line: 4, col: 0}\n}))`)
  })
})

// component('PPrintTest.tooLong', {
//   impl: dataTest({
//     calculate: () => jb.utils.prettyPrintComp('UiTreeTest.treeDD.sameArray',jb.comps['test<>UiTreeTest.treeDD.sameArray']),
//     expectedResult: contains('\n')
//   })
// })

component('PPrintTest.asyncInProfile', {
  impl: dataTest({
    calculate: () => jb.utils.prettyPrint(dataTest(async () => { 5 }), {type: 'test<>'}),
    expectedResult: and(not(contains('a:')), contains('async () => { 5 }'))
  })
})

component('PPrintTest.funcDefaults', {
  impl: dataTest({
    calculate: () => jb.utils.prettyPrint({ aB(c, { b } = {}) { 3 } }),
    expectedResult: and(not(contains('aB:')), contains('aB(c, { b } = {}) { 3 }')),
    runBefore: runActionOnItems(list(1,2,3), delay(), 'index')
  })
})

component('PPrintTest.typeAdapter.from', {
  impl: dataTest({
    calculate: prettyPrint(() => typeAdapter('state<location>', israel()), true),
    expectedResult: equals(`typeAdapter('state<location>', israel())`)
  })
})

component('PPrintTest.asIs', {
  impl: dataTest({
    calculate: prettyPrint(() => equals('hello', asIs({ line: 1, col: 47 })), {
      type: 'boolean<>'
    }),
    expectedResult: equals(`equals('hello', asIs({line: 1, col: 47}))`)
  })
})

component('PPrintTest.typeAdapter.to', {
  impl: dataTest(pipeline(typeAdapter('state<location>', israel()), '%capital/name%'), equals('Jerusalem'))
})
