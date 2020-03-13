const extractedCtrl1 = group({
    controls: text('hello')
})

jb.component('studio-test.drag-target-text', { 
  type: 'control',
  impl: text('paste here')
})

jb.component('studio-suggested-styles.text', { 
    impl: dataTest({
      vars: [
        Var('extractedCtrl',() => extractedCtrl1),
        Var('targetPath', 'studio-test.drag-target-text~impl'),
      ],
      calculate: pipeline(
        studio.suggestedStyles('%$extractedCtrl%','%$targetPath%'),
        '%control%',property('$'),join(',')
      ),
      expectedResult: equals('text,group')
    })
})

jb.component('studio.test-select-style', { 
  impl: uiTest({
    vars: [
      Var('extractedCtrl',() => extractedCtrl1),
      Var('targetPath', 'studio-test.drag-target-text~impl'),
    ],
    control: ctx => ctx.run(studio.selectStyle('%$extractedCtrl%','%$targetPath%')),
    expectedResult: contains['hello','hello']
  })
})
