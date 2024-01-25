component('test.mixedTest.disabled', {
  impl: split(';', {
    disabled: true,
    text: pipeline('%%','dfssdaasdasdadasd','sdfsdfsd','dsfsdfsdfsd sdfsdf'),
    part: 'second'
  })
})

component('mixedTest.tst2Helper', {
  doNotRunInTests: true,
  impl: calcProp('toggleText', If('%$$model/databind()%', '%$$model/textForTrue()%', '%$$model/textForFalse()%'))
})

component('mixedTest.tst1Helper', {
  doNotRunInTests: true,
  impl: customStyle(({},{},h) => h('div.jb-dialogs'), {
    features: features(
    followUp.flow(
      source.subject(dialogs.changeEmitter()),
      rx.filter('%open%'),
      rx.var('dialogVdom', pipeline(dialog.buildComp('%dialog%'), '%renderVdomAndFollowUp()%')),
      rx.var('delta', obj(prop('children', obj(prop('toAppend', pipeline('%$dialogVdom%', ({data}) => jb.ui.stripVdom(data))))))),
      rx.log('open dialog', obj(prop('dialogId', '%dialog/id%'))),
      sink.applyDeltaToCmp('%$delta%', '%$followUpCmp/cmpId%')
    )
  )
  })
})

component('mixedTest.tst1', {
  impl: dataTest(typeAdapter('cmp-upgrade<upgrade>', reformat('mixedTest.tst1Helper')), equals('', ''))
})

// component('mixedTest.all', {
//   impl: dataTest(
//     pipeline(
//       () => Object.keys(jb.comps),
//       filter(not(startsWith('dataResource.'))),
//       slice(0, 100),
//       typeAdapter('cmp-upgrade<upgrade>', upgradeMixed()),
//       filter('%edit%'),
//       slice(0, 1)
//     ),
//     equals('','')
//   )
// })

component('mixedTest.createUpgradeScript', {
  doNotRunInTests: true,
  impl: dataTest(createUpgradeScript(reformat(), { slice: 100 }), equals('', ''), {
    timeout: 10000
  })
})


