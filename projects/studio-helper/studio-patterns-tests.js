const extractedCtrl1 = group({
    controls: text('hello')
})

jb.component('studio-suggested-styles.text', { 
    impl: dataTest({
      calculate: pipeline(
        studio.suggestedStyles(() => extractedCtrl1,'text'),
        '%control%',property('$'),join(',')
      ),
      expectedResult: equals('text,group')
    })
})
  