

jb.component('sampleComp.ctrlWithPipeline', {
  impl: group({
    controls: text(pipeline(list('hello','%$var1%'), join(' '))),
    features: [
      variable('var1','world'),
      variable('xx','xx')
    ]
  })
})

jb.component('FETest.workspace.IDE', {
  impl: uiFrontEndTest({
    renderDOM: true,
    timeout: 5000,
    runBefore: workspace.openDoc('/projects/tests/ui-tests.js'),
    control: workspace.IDE(),
    expectedResult: true
  })
})