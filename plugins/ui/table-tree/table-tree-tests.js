using('ui-tests','ui-table-tree')

component('uiTest.tableTree.expandPath', {
  impl: uiTest({
    control: tableTree({
      treeModel: tree.jsonReadOnly('%$personWithChildren%', ''),
      leafFields: text('%val%', 'name'),
      commonFields: text('%path%', 'path'),
      chapterHeadline: text(suffix('~', '%path%')),
      style: tableTree.plain(),
      features: [
        id('tableTree'),
        tableTree.expandPath('~friends~0'),
        tableTree.resizer()
      ]
    }),
    expectedResult: contains('name','path','Homer','friends','Barnie','~friends~0~name')
  })
})

component('uiTest.tableTree.DD', {
  impl: uiTest({
    control: tableTree({
      treeModel: tree.json('%$personWithChildren%', 'personWithChildren'),
      chapterHeadline: text(If(matchRegex('[0-9]*', suffix('~', '%path%')), '%val/name%', suffix('~', '%path%'))),
      style: tableTree.plain(),
      features: [
        id('tableTree'),
        tableTree.expandPath('personWithChildren~children'),
        tableTree.dragAndDrop(),
        watchRef('%$personWithChildren/children%')
      ]
    }),
    expectedResult: contains('Lisa','Maggie','Bart'),
    uiAction: uiActions(
      ctx => jb.db.move(ctx.exp('%$personWithChildren/children[2]%', 'ref'), ctx.exp('%$personWithChildren/children[0]%', 'ref'),ctx),
      ctx => jb.db.move(ctx.exp('%$personWithChildren/children[2]%', 'ref'), ctx.exp('%$personWithChildren/children[0]%', 'ref'),ctx)
    ),
    useFrontEnd: true
  })
})

component('uiTest.tableTreeRefresh1', {
  impl: uiTest({
    control: tableTree({
      treeModel: tree.jsonReadOnly('%$personWithChildren%', ''),
      leafFields: text('%val%', 'name'),
      commonFields: text('%path%', 'path'),
      chapterHeadline: text(suffix('~', '%path%')),
      style: tableTree.plain(),
      features: [
        tableTree.expandPath('%$globals/expanded%'),
        watchRef('%$globals/expanded%', { strongRefresh: true })
      ]
    }),
    expectedResult: contains('name','path','Homer','friends','Barnie','~friends~0~name'),
    uiAction: writeValue('%$globals/expanded%', '~friends~0'),
    useFrontEnd: true
  })
})

// component('uiTest.tableTreeUnexpandRefresh.vdom', {
//   impl: uiTest({
//     control: tableTree({
//       treeModel: tree.jsonReadOnly(()=>({
//           a: { a1: 'val' },
//           b: { b1: 'val' },
//         }), ''),
//       leafFields: text({text: '%val%', title: 'name'}),
//       commonFields: text({text: '%path%', title: 'path'}),
//       chapterHeadline: text({text: suffix('~', '%path%')}),
//       style: tableTree.plain(),
//       features: [
//         tableTree.expandPath('%$globals/expanded%'),
//         watchRef({ref: '%$globals/expanded%', strongRefresh: true})
//       ]
//     }),
//     runBefore: writeValue('%$globals/expanded%', '~a'),
//     uiAction: writeValue('%$globals/expanded%', ''),
//     expectedResult: not(contains('~a~a1')),
//     useFrontEnd: true
//   })
// })

component('uiTest.tableTreeExpandMulitplePaths', {
  impl: uiTest({
    control: tableTree({
      treeModel: tree.jsonReadOnly({
        object: ()=>({
          a: { a1: 'val' },
          b: { b1: 'val' },
        }),
        rootPath: ''
      }),
      commonFields: text('%path%', 'path'),
      chapterHeadline: text(suffix('~', '%path%')),
      features: tableTree.expandPath(list('~a','~b'))
    }),
    expectedResult: contains('~a~a1','~b~b1')
  })
})

component('uiTest.tableTreeWithTitleCtrl', {
  impl: uiTest({
    control: tableTree({
      treeModel: tree.jsonReadOnly('%$personWithChildren%', ''),
      leafFields: text('%val%', 'name', { features: field.titleCtrl(button('my %title()%', { style: button.href() })) }),
      chapterHeadline: text(suffix('~', '%path%'))
    }),
    expectedResult: contains('my name','path','Homer')
  })
})

component('uiTest.tableTreeWithFilter', {
  impl: uiTest({
    control: tableTree({
      treeModel: tree.modelFilter(tree.jsonReadOnly('%$personWithChildren%', ''), endsWith('~name')),
      leafFields: text('%val%', 'name'),
      chapterHeadline: text(suffix('~', '%path%'))
    }),
    expectedResult: and(contains('name','Homer'), not(contains('friends')))
  })
})

