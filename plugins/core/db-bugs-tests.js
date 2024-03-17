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

component('dbTest.loosingRefAfterMovingParentItem', {
  impl: dataTest({
    calculate: '',
    expectedResult: equals(pipeline('%$personWithChildren/children/name%', slice(0, 2), join()), 'newVal1,newVal0'),
    runBefore: ctx => {
      const ref0 = ctx.exp('%$personWithChildren/children[0]%','ref')
      const ref1 = ctx.exp('%$personWithChildren/children[1]%','ref')
      const refInner0 = ctx.setData(ref0).exp('%name%','ref')
      const refInner1 = ctx.setData(ref1).exp('%name%','ref')
      jb.db.move(ref0, ref1,ctx)
      jb.db.writeValue(refInner0,'newVal0',ctx)
      jb.db.writeValue(refInner1,'newVal1',ctx)
    }
  })
})
