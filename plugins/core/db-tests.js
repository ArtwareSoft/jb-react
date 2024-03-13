component('dbTest.writeValue', {
  impl: dataTest('%$person/age%', equals('20'), { runBefore: writeValue('%$person/age%', 20) })
})

component('dbTest.writeValueFalseBug', {
  impl: dataTest('%$person/male%', equals(false), { runBefore: writeValue('%$person/male%', false) })
})

component('dbTest.spliceDelete', {
  impl: dataTest(pipeline('%$personWithChildren/children/name%', join()), contains('Bart,Maggie'), {
    runBefore: splice('%$personWithChildren/children%', 1, { noOfItemsToRemove: 1 })
  })
})

component('dbTest.splice', {
  impl: dataTest(pipeline('%$personWithChildren/children/name%', join()), contains('Bart,Lisa2,Maggie2,Maggie'), {
    runBefore: splice('%$personWithChildren/children%', 1, {
      noOfItemsToRemove: 1,
      itemsToAdd: asIs([{name: 'Lisa2'}, {name: 'Maggie2'}])
    })
  })
})

component('dbTest.writeValueInner', {
  impl: dataTest('%$person/zz/age%', equals('20'), { runBefore: writeValue('%$person/zz/age%', 20) })
})

component('dbTest.writeValueWithLink', {
  impl: dataTest({
    calculate: '%$personWithChildren/children[0]/name%,%$person/linkToBart/name%',
    expectedResult: equals('Barty1,Barty1'),
    runBefore: runActions(
      writeValue('%$person/linkToBart%', '%$personWithChildren/children[0]%'),
      writeValue('%$personWithChildren/children[0]/name%', 'Barty1')
    )
  })
})

component('dbTest.writeValueViaLink', {
  impl: dataTest({
    calculate: '%$personWithChildren/children[0]/name%,%$person/linkToBart/name%',
    expectedResult: equals('Barty1,Barty1'),
    runBefore: runActions(
      writeValue('%$person/linkToBart%', '%$personWithChildren/children[0]%'),
      writeValue('%$person/linkToBart/name%', 'Barty1')
    )
  })
})

component('dbTest.writeValueWithArrayLink', {
  impl: dataTest({
    calculate: '%$personWithChildren/children[0]/name%,%$person/childrenLink[0]/name%',
    expectedResult: equals('Barty1,Barty1'),
    runBefore: runActions(
      writeValue('%$person/childrenLink%', '%$personWithChildren/children%'),
      writeValue('%$personWithChildren/children[0]/name%', 'Barty1')
    )
  })
})

component('dbTest.writeValueViaArrayLink', {
  impl: dataTest({
    calculate: '%$personWithChildren/children[0]/name%,%$person/childrenLink[0]/name%',
    expectedResult: equals('Barty1,Barty1'),
    runBefore: runActions(
      writeValue('%$person/childrenLink%', '%$personWithChildren/children%'),
      writeValue('%$person/childrenLink[0]/name%', 'Barty1')
    )
  })
})

component('dbTest.runActionOnItemsArrayRef', {
  impl: dataTest(pipeline('%$personWithChildren/children/name%', join(',')), equals('aBart,aLisa,aMaggie'), {
    runBefore: runActionOnItems('%$personWithChildren/children/name%', writeValue('%%', 'a%%'))
  })
})

component('dbTest.refApi', {
  impl: dataTest('', ctx =>
        ctx.exp('%$personWithChildren/friends[0]%','ref').path().join('/') == 'personWithChildren/friends/0' &&
        ctx.exp('%$person/name%') == 'Homer Simpson' &&
        ctx.exp('%$person/name%','ref').path().join('/') == 'person/name')
})

component('dbTest.refOfArrayItem', {
  impl: dataTest('', ctx =>
        ctx.exp('%$personWithChildren/children[1]%','ref').path().join('/') == 'personWithChildren/children/1')
})

component('dbTest.refOfStringArrayItemSplice', {
  impl: dataTest({
    vars: [Var('refs', obj())],
    calculate: '',
    expectedResult: equals('%$refs/valBefore%', '%$refs/valAfter%'),
    runBefore: ctx => {
      const refs = ctx.vars.refs
      refs.refOfc = ctx.exp('%$stringArray[2]%','ref')
      refs.valBefore = jb.val(refs.refOfc)
      ctx.run(splice({array: '%$stringArray%', fromIndex: 0, noOfItemsToRemove: 1}), 'action<>')
      refs.valAfter = jb.val(refs.refOfc)
    }
  })
})

component('dbTest.refOfStringArrayItemMove', {
  impl: dataTest({
    vars: [Var('refs', obj())],
    calculate: '',
    expectedResult: equals('%$refs/valBefore%', '%$refs/valAfter%'),
    runBefore: ctx => {
      const refs = ctx.vars.refs
      refs.refOfb = ctx.exp('%$stringArray[1]%','ref')
      refs.refOfc = ctx.exp('%$stringArray[2]%','ref')
      refs.valBefore = jb.val(refs.refOfc)
      jb.db.move(refs.refOfc, refs.refOfb, ctx)
      refs.valAfter = jb.val(refs.refOfc)
    }
  })
})

component('dbTest.refOfStringTreeMove', {
  impl: dataTest({
    vars: [Var('refs', obj())],
    calculate: '',
    expectedResult: equals('%$refs/valBefore%', '%$refs/valAfter%'),
    runBefore: ctx => {
      const refs = ctx.vars.refs
      refs.refOfb = ctx.exp('%$stringTree/node1[1]%','ref')
      refs.refOf2 = ctx.exp('%$stringTree/node2[2]%','ref')
      refs.valBefore = jb.val(refs.refOfb)
      jb.db.move(refs.refOfb, refs.refOf2, ctx)
      refs.valAfter = jb.val(refs.refOfb)
    }
  })
})

component('dbTest.moveDown.checkPaths', {
  impl: dataTest({
    vars: [Var('res', obj())],
    calculate: '',
    expectedResult: equals('%$res/paths%', '1,0'),
    runBefore: ctx => {
      const bart = ctx.exp('%$personWithChildren/children[0]%')
      const lisa = ctx.exp('%$personWithChildren/children[1]%')
      ctx.run(move('%$personWithChildren/children[0]%','%$personWithChildren/children[1]%'),'action<>')
      ctx.vars.res.paths = jb.db.asRef(bart).path()[2] + ',' + jb.db.asRef(lisa).path()[2]
    }
  })
})

component('dbTest.innerOfUndefinedVar', {
  impl: dataTest('%$unknown/a%', ({data}) => data === undefined, {
    runBefore: writeValue('%$unknown/a%', '7'),
    allowError: true
  })
})

component('dbTest.constRef', {
  impl: dataTest({
    vars: [
      Var('constA', () => ({a: 5}))
    ],
    calculate: '%$constA/a%',
    expectedResult: equals(7),
    runBefore: writeValue('%$constA/a%', '7')
  })
})

component('passiveVar', { 
  passiveData: 'hey'
})
component('dbTest.stringPassiveVar', {
  impl: dataTest('%$passiveVar%', equals('foo'), { runBefore: writeValue('%$passiveVar%', 'foo') })
})

