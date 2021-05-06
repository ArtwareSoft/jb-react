jb.component('test.showTestInStudio', {
	type: 'control',
	params: [
	  {id: 'testId', as: 'string', defaultValue: 'uiTest.label'}
	],
	impl: (ctx,testId) => {
		const profile = jb.path(jb.comps[testId],'impl')
		const ctxForUi = jb.ui.extendWithServiceRegistry(ctx)
		if (profile.$ == 'dataTest') 
			return ctxForUi.run({ $: 'test.dataTestView' ,testId, testResult })
		if (profile.$ == 'uiTest') {
			const ctxWithVars = ctx.setVars(jb.objFromEntries((profile.vars||[]).map(v=>[v.name,ctx.run(v.val)])))
			const ctxToRun = jb.ui.extendWithServiceRegistry(new jb.core.jbCtx(ctxWithVars,{ profile, forcePath: testId+ '~impl', path: '' } ))
			return ctxForUi.run({ $: 'test.uiTestRunner', testId,ctxToRun,testResult })
		}

		async function testResult() {
			jb.test.singleTest = true
			const watchablesBefore = jb.db.watchableHandlers.map(h=>({resources: h.resources(), objToPath: new Map(h.objToPath)}))
			//const spyBefore = { logs: spy.logs, spyParam: spy.spyParam}
			const spyParam = jb.utils.unique([...spy.spyParam.split(','),'test']).join(',')
			jb.spy.initSpy({spyParam})
			jb.spy.clear()
			const res = await jb.test.runOneTest(testId,{doNotcleanBeforeRun: true})
			jb.db.watchableHandlers.forEach((h,i) =>{
				h.resources(watchablesBefore[i].resources)
				h.objToPath = watchablesBefore[i].objToPath
			})
			return res
		}
	},
	require: [{$: 'test.dataTestView'},{$: 'test.uiTestRunner'}]
})

jb.component('test.dataTestView', {
  type: 'control',
  params: [
    {id: 'testId', as: 'string', defaultValue: 'ui-test.label'},
    {id: 'testResult', dynamic: true}
  ],
  impl: group({
			controls: [
				  button({
					style: button.href(),
					vars: Var('color',If('%success%','--jb-success-fg','--jb-error-fg')),
					title: If('%success%','✓ %$testId%','⚠ %$testId%'),
					features: css.color('var(%$color%)'),
					action: vscode.gotoUrl('http://localhost:8082/projects/tests/tests.html?test=%$testId%&show&spy=test'),
				  }),
				  group({ 
					layout: layout.horizontal(20),
					controls: [
						controlWithCondition('%expectedResultCtx/data%', text('%expectedResultCtx/data%')),              
						controlWithCondition('%expectedResultCtx/data%', text(prettyPrint('%expectedResultCtx.profile.expectedResult%',true))),
						controlWithCondition('%html%', text({
							text: '%html%',
							style: text.codemirror({height: '200', mode: 'htmlmixed', formatText: true}),
							features: [codemirror.fold(), css('min-width: 1200px')]
						})),
					]
				}),
				text('%$result/duration% mSec {?, %$result/reason%?}'),
			],
			features: [
				group.data(() => jb.spy.logs.find(e=>e.logNames =='check test result')),
				group.wait({for: '%$testResult()%' , varName: 'result'})
			]
	})
})

jb.component('test.uiTestRunner', {
	type: 'control',
	params: [
	  {id: 'testId', as: 'string', defaultValue: 'ui-test.label'},
	  {id: 'ctxToRun'},
	  {id: 'testResult', dynamic: true}
	],
	impl: group({
		controls: [
			button({
				title: '%$testId%',
				action: ({},{},{testId}) => jb.test.runInStudio({$: 'studio.openComponentInJbEditor', path: `${testId}~impl~control` }),
				style: button.href(),
			}),
			group({controls: ({},{},{ctxToRun}) => ctxToRun.runInner(ctxToRun.profile.control,{type: 'control'}, 'control') }),
			group({
				controls: [
					button({
						style: button.href(),
						vars: Var('color',If('%success%','--jb-success-fg','--jb-error-fg')),
						title: If('%success%','✓ %$testId%','⚠ %$testId%'),
						features: css.color('var(%$color%)'),
						action: vscode.gotoUrl('http://localhost:8082/projects/tests/tests.html?test=%$testId%&show&spy=test'),
					}),
					controlWithCondition('%expectedResultCtx/data%', text('%expectedResultCtx/data%')),              
					controlWithCondition('%expectedResultCtx/data%', text(prettyPrint('%expectedResultCtx.profile.expectedResult%',true))),
					studio.eventTracker(()=>jb.spy)					
				],
				features: [
					group.data(() => jb.spy.logs.find(e=>e.logNames =='check test result') ),
				]
			})
		],
		features: [
			group.wait({for: async ({},{},{ctxToRun,testResult}) => {
				await jb.test.runInner('runBefore',ctxToRun) 
				return testResult()
			}, varName: 'result' }),
			// frontEnd.init( () => {
			// 	return jb.test.runInStudio(studio.waitForPreviewIframe())
			// 		.then(() => jb.test.runInner('runInPreview',ctxToRun))
			// 		.then(() => jb.test.runInStudio(ctxToRun.profile.runInStudio))
			// })
		]
	})
})
