component('dbTest.VarBug', {
  impl: dataTest({
    calculate: pipeline(
      Var('children', '%$personWithChildren/children%'),
      Var('children2', '%$personWithChildren/children%'),
      '%$children[0]/name% %$children2[1]/name%'
    ),
    expectedResult: equals('Bart Lisa')
  })
})

component('arTest', { watchableData: { ar: ['0'] }})
component('dbTest.restoreArrayIdsBug', {
  impl: dataTest('%$arTest/result%', equals('0'), {
    runBefore: ctx => {
      const ar_ref = ctx.run('%$arTest/ar%',{as: 'ref'})
      const refWithBug = jb.db.refHandler(ar_ref).refOfPath(['arTest','ar','0'])
      jb.db.splice(ar_ref,[[1,0,'1']],ctx)
      const v = jb.val(refWithBug)
      jb.db.writeValue(ctx.exp('%$arTest/result%','ref'),v,ctx)
   }
  })
})