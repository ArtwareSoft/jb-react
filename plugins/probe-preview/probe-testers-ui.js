using('testing')

component('test.showTestInStudio', {
  type: 'control',
  params: [
    {id: 'testId', as: 'string', defaultValue: 'uiTest.label'}
  ],
  impl: (ctx,testId) => {
		const profile = jb.path(jb.comps[testId],'impl')
		const ctxForUi = jb.ui.extendWithServiceRegistry(ctx)
		if (profile.$ == 'dataTest')
			return ctxForUi.run({ $: 'test.dataTestView' ,testId, testResult })
		else if (profile.$ == 'uiFrontEndTest')
			return ctxForUi.run({ $: 'test.uiFrontEndTestView' ,testId, testResult })
		else if (profile.$ == 'uiTest') {
			const ctxWithVars = ctx.setVars(jb.objFromEntries((profile.vars||[]).map(v=>[v.name,ctx.run(v.val)])))
			const ctxToRun = jb.ui.extendWithServiceRegistry(new jb.core.jbCtx(ctxWithVars,{ profile, forcePath: testId+ '~impl', path: '' } ))
			return ctxForUi.run({ $: 'test.uiTestRunner', testId,ctxToRun,testResult })
		}

		async function testResult() {
      if (!jb.test) return
			jb.test.singleTest = true
			const watchablesBefore = jb.db.watchableHandlers.map(h=>({resources: h.resources(), objToPath: []}))
			//const spyBefore = { logs: spy.logs, spyParam: spy.spyParam}
			const spyParam = jb.utils.unique([...spy.spyParam.split(','),'test,uiTest,headless']).join(',')
			jb.spy.initSpy({spyParam})
			jb.spy.clear()
			const res = await jb.test.runSingleTest(testId,{doNotcleanBeforeRun: true, show: true})
			jb.db.watchableHandlers.forEach((h,i) =>{
				h.resources(watchablesBefore[i].resources)
				h.objToPath = watchablesBefore[i].objToPath
			})
			return res
		}
	},
  require: [test.dataTestView(), test.uiTestRunner()]
})

component('test.expectedResultProfile', {
  params: [
    {id: 'expectedResultCtx'}
  ],
  impl: (ctx,expectedResultCtx) => jb.utils.ctxStack(expectedResultCtx).pop().profile.expectedResult
})

component('test.successIndication', {
  type: 'control',
  params: [
    {id: 'testId', as: 'string'}
  ],
  impl: button({
    vars: [
      Var('color', If('%success%', '--jb-success-fg', '--jb-error-fg'))
    ],
    title: If('%success%', '✓ %$testId%', '⚠ %$testId%'),
    action: remote.action(winUtils.gotoUrl('/hosts/tests/tests.html?test=%$testId%&show&spy=test'), parent()),
    style: button.href(),
    features: css.color('var(%$color%)')
  })
})

component('test.FE_BE_interaction', {
  type: 'control',
  params: [
    {id: 'method', as: 'string', defaultValue: 'headlessIO'}
  ],
  impl: group({
    controls: [
      divider(),
      group({
        style: group.sectionExpandCollapse(text('FE <--> BE interaction')),
        controls: [
          text({
            text: ({},{},{method}) => method == 'headlessIO' ? jb.spy.headlessIO() : jb.spy.uiTestHeadlessIO(),
            style: text.codemirror({ enableFullScreen: true, height: '800', mode: 'javascript' }),
            features: [codemirror.fold(), codemirror.lineNumbers()]
          })
        ]
      }),
      divider()
    ]
  })
})

component('test.uiFrontEndTestView', {
  type: 'control',
  params: [
    {id: 'testId', as: 'string'},
    {id: 'testResult', dynamic: true}
  ],
  impl: group({
    controls: [
      test.successIndication('%$testId%'),
      group({
        layout: layout.horizontal(20),
        controls: [
          controlWithCondition({
            condition: '%expectedResultCtx/data%',
            control: text(prettyPrint(test.expectedResultProfile('%expectedResultCtx%'), true))
          }),
          controlWithCondition('%html%', text('%html%', {
            style: text.codemirror({ height: '200', formatText: true, mode: 'htmlmixed' }),
            features: [
              codemirror.fold(),
              css('min-width: 1200px')
            ]
          }))
        ]
      }),
      text('front end test %$result/duration% mSec {?, %$result/reason%?}'),
      test.FE_BE_interaction()
    ],
    features: [
      group.data(() => jb.spy.logs.find(e=>e.logNames =='check test result')),
      group.wait('%$testResult()%', { varName: 'result' })
    ]
  }),
  require: winUtils.gotoUrl()
})

component('test.dataTestView', {
  type: 'control',
  params: [
    {id: 'testId', as: 'string'},
    {id: 'testResult', dynamic: true}
  ],
  impl: group({
    controls: [
      test.successIndication('%$testId%'),
      group({
        layout: layout.horizontal(20),
        controls: [
          controlWithCondition({
            condition: '%expectedResultCtx/data%',
            control: text(prettyPrint(test.expectedResultProfile('%expectedResultCtx%'), true))
          }),
          controlWithCondition('%html%', text('%html%', {
            style: text.codemirror({ height: '200', formatText: true, mode: 'htmlmixed' }),
            features: [
              codemirror.fold(),
              css('min-width: 1200px')
            ]
          }))
        ]
      }),
      text('dataTest %$result/duration% mSec {?, %$result/reason%?}')
    ],
    features: [
      group.data(() => jb.spy.logs.find(e=>e.logNames =='check test result')),
      group.wait('%$testResult()%', { varName: 'result' })
    ]
  }),
  require: winUtils.gotoUrl()
})

component('test.uiTestRunner', {
  type: 'control',
  params: [
    {id: 'testId', as: 'string', defaultValue: 'ui-test.label'},
    {id: 'ctxToRun'},
    {id: 'testResult', dynamic: true}
  ],
  impl: group({
    controls: [
      test.successIndication('%$testId%'),
      button({
        title: 'play',
        action: ({},{},{ctxToRun}) => {
        debugger
        const elemToTest = document.querySelector('.elemToTest')
        elemToTest && ctx.setVars({elemToTest}).runInner(ctxToRun.profile.uiAction,{type: 'uiAction'}, 'uiAction')
      },
        style: button.href(),
        features: css.margin({ left: '10' })
      }),
      group({
        controls: [
          controlWithCondition({
            condition: '%expectedResultCtx/data%',
            control: text(prettyPrint(test.expectedResultProfile('%expectedResultCtx%'), true))
          })
        ],
        features: [
          group.data(() => jb.spy.logs.find(e=>e.logNames =='check test result'))
        ]
      }),
      divider(),
      group({
        controls: ({},{},{ctxToRun}) => ctxToRun.runInner(ctxToRun.profile.control,{type: 'control'}, 'control')
      }),
      test.FE_BE_interaction('uiTestHeadlessIO')
    ],
    features: [
      group.wait({
        for: ({},{},{ctxToRun,testResult}) =>
				Promise.resolve(jb.test.runInner('runBefore',ctxToRun)).then(() => testResult()),
        varName: 'result'
      })
    ]
  }),
  require: winUtils.gotoUrl()
})
