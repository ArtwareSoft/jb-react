jb.component('test.showTestInStudio', {
	type: 'control',
	params: [
	  {id: 'testId', as: 'string', defaultValue: 'uiTest.label'}
	],
	impl: (ctx,testId) => {
		  const profile = jb.path(jb.comps[testId],'impl')
		  const ctxWithVars = ctx.setVars(jb.objFromEntries((profile.vars||[]).map(v=>[v.name,ctx.run(v.val)])))
		  const ctxToRun = jb.ui.extendWithServiceRegistry(new jb.jbCtx(ctxWithVars,{ profile, forcePath: testId+ '~impl', path: '' } ))
		  if (profile.$ == 'dataTest')
			  return ctxToRun.run(test.dataTestView(testId, () => jb.test.dataTestResult(ctxToRun)))
		  if (profile.$ == 'uiTest')
			  return ctxToRun.run(test.uiTestRunner(testId,() => ctxToRun))
	  }
})

jb.component('test.dataTestView', {
  type: 'control',
  params: [
    {id: 'testId', as: 'string', defaultValue: 'ui-test.label'},
    {id: 'testResult'}
  ],
  impl: group({
    controls: group({
      layout: layout.vertical('12'),
      controls: [
        button({
          title: '%$testId%',
          action: (ctx,{},{testId}) => jb.test.runInStudio({$: 'studio.openComponentInJbEditor', path: `${testId}~impl~calculate` }),
          style: button.href(),
          features: [
            css(pipeline(If('%success%', 'green', 'red'), 'color: %%')),
            ctrlAction(gotoUrl('http://www.google.com'))
          ]
        }),
        group({
          style: propertySheet.titlesLeft({}),
          controls: [
            text({
              text: '%value%',
              title: 'calculate',
              style: text.span(),
              features: css.width('300')
            }),
            editableText({databind: '%value%', style: editableText.textarea({})})
          ],
          features: css.width({width: '127', selector: ''})
        })
      ]
    }),
    features: group.wait('%$testResult%')
  })
})

jb.component('test.uiTestRunner', {
	type: 'control',
	params: [
	  {id: 'testId', as: 'string', defaultValue: 'ui-test.label'},
	  {id: 'ctxToRun'}
	],
	impl: group({
		controls: [
			button({
				title: '%$testId%',
				action: ({},{},{testId}) => jb.test.runInStudio({$: 'studio.openComponentInJbEditor', path: `${testId}~impl~control` }),
				style: button.href(),
			}),
			group({controls: ({},{},{ctxToRun}) => ctxToRun.runInner(ctxToRun.profile.control,{type: 'control'}, 'control') })
		],
		features: [
			group.wait({for: ({},{},{ctxToRun}) => jb.test.runInner('runBefore',ctxToRun) }),
			// frontEnd.init( () => {
			// 	return jb.test.runInStudio(studio.waitForPreviewIframe())
			// 		.then(() => jb.test.runInner('runInPreview',ctxToRun))
			// 		.then(() => jb.test.runInStudio(ctxToRun.profile.runInStudio))
			// })
		]
	})
})
