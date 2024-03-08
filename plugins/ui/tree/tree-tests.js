using('ui-tests')

component('move', {
  dsl: 'test',
  type: 'ui-action',
  params: [
    {id: 'from', as: 'ref', mandatory: true},
    {id: 'to', as: 'ref', mandatory: true}
  ],
  impl: (ctx,from,_to) => jb.db.move(from,_to,ctx)
})

component('uiTest.tree', {
  impl: uiTest({
    control: tree({ nodeModel: tree.jsonReadOnly('%$personWithAddress%', 'personWithAddress'), features: [tree.selection(), tree.keyboardSelection()] }),
    expectedResult: contains('address')
  })
})

component('uiTest.treeRightClick', {
  impl: uiTest({
    control: tree({
      nodeModel: tree.jsonReadOnly('%$personWithAddress%', 'personWithAddress'),
      features: [
        tree.selection({ onRightClick: openDialog('hello', { features: dialogFeature.nearLauncherPosition() }) }),
        tree.keyboardSelection()
      ]
    }),
    expectedResult: contains('address')
  })
})

component('FETest.treeDD.betweenBranches', {
  impl: uiTest({
    control: tree({ nodeModel: tree.json('%$personWithChildren%', 'personWithChildren'), features: [tree.selection(), tree.dragAndDrop(), tree.keyboardSelection()] }),
    expectedResult: equals({
      item1: pipeline(list('%$personWithChildren/children%','%$personWithChildren/friends%'), '%name%', join(',')),
      item2: 'Bart,Maggie,Lisa,Barnie'
    }),
    uiAction: action(move('%$personWithChildren/children[1]%', '%$personWithChildren/friends[0]%'))
  })
})

// component('FETest.treeDD.sameArray', {
//   impl: uiTest({
//     control: tree({
//       nodeModel: tree.json('%$personWithChildren%', 'personWithChildren'),
//       features: [
//         tree.selection(),
//         tree.dragAndDrop(),
//         tree.keyboardSelection(),
//         tree.expandPath('personWithChildren~children')
//       ]
//     }),
//     expectedResult: contains('Lisa','Bart','Maggie'),
//     uiAction: uiActions(
//       click('[title="Bart"]'),
//       keyboardEvent('[interactive]', 'keydown', { keyCode: 40, ctrl: 'ctrl' })
//     ),
//     useFrontEnd: true
//   })
// })

component('FETest.treeDD.boundedSelection', {
  impl: uiTest({
    control: group({
      controls: tree({
        nodeModel: tree.json('%$personWithChildren%', 'personWithChildren'),
        features: [
          tree.selection('%$selected%'),
          tree.dragAndDrop(),
          tree.keyboardSelection(),
          tree.expandPath('personWithChildren~children')
        ]
      }),
      features: watchable('selected', 'personWithChildren~children~1')
    }),
    expectedResult: contains('Bart','Maggie','selected','Lisa'),
    uiAction: keyboardEvent('[interactive]', 'keydown', { keyCode: 40, ctrl: 'ctrl' }),
    useFrontEnd: true
  })
})

component('FETest.treeDDAndBack', {
  impl: uiTest({
    control: tree({ nodeModel: tree.json('%$personWithChildren%', 'personWithChildren'), features: [tree.selection(), tree.dragAndDrop(), tree.keyboardSelection()] }),
    expectedResult: equals({
      item1: pipeline(list('%$personWithChildren/children%','%$personWithChildren/friends%'), '%name%', join(',')),
      item2: 'Bart,Lisa,Maggie,Barnie'
    }),
    uiAction: action(runActions(
      move('%$personWithChildren/children[1]%', '%$personWithChildren/friends[1]%'),
      move('%$personWithChildren/friends[1]%', '%$personWithChildren/children[1]%')
    )),
    useFrontEnd: true
  })
})

component('FETest.treeDDTwice', {
  impl: uiTest({
    control: tree({ nodeModel: tree.json('%$personWithChildren%', 'personWithChildren'), features: [tree.selection(), tree.dragAndDrop(), tree.keyboardSelection()] }),
    expectedResult: equals({
      item1: pipeline(list('%$personWithChildren/children%','%$personWithChildren/friends%'), '%name%', join(',')),
      item2: 'Bart,Barnie,Maggie,Lisa'
    }),
    uiAction: action(runActions(
      move('%$personWithChildren/children[1]%', '%$personWithChildren/friends[1]%'),
      move('%$personWithChildren/children[1]%', '%$personWithChildren/friends[1]%')
    )),
    useFrontEnd: true
  })
})

component('FETest.treeDDAfterLast', {
  impl: uiTest({
    control: tree({ nodeModel: tree.json('%$personWithChildren%', 'Homer'), features: [tree.selection(), tree.dragAndDrop(), tree.keyboardSelection()] }),
    expectedResult: equals({
      item1: pipeline(list('%$personWithChildren/children%','%$personWithChildren/friends%'), '%name%', join()),
      item2: 'Bart,Maggie,Barnie,Lisa'
    }),
    uiAction: action(move('%$personWithChildren/children[1]%', '%$personWithChildren/friends[1]%')),
    useFrontEnd: true
  })
})

component('uiTest.treeVisualDD', {
  impl: uiTest({
    control: tree({
      nodeModel: tree.json('%$personWithChildren%', 'personWithChildren'),
      features: [
        tree.selection(),
        tree.dragAndDrop(),
        tree.keyboardSelection({ autoFocus: true }),
        tree.expandPath('personWithChildren~children')
      ]
    }),
    expectedResult: true
  })
})

component('uiTest.treeUnexpandRefresh', {
  impl: uiTest({
    control: tree({
      nodeModel: tree.jsonReadOnly({
        object: ()=>({
          a: { a1: 'val' },
          b: { b1: 'val' },
        }),
        rootPath: ''
      }),
      features: [
        tree.expandPath('%$globals/expanded%'),
        watchRef('%$globals/expanded%', { strongRefresh: true })
      ]
    }),
    expectedResult: contains('~a~a1'),
    runBefore: writeValue('%$globals/expanded%', '~a'),
    useFrontEnd: true
  })
})

component('uiTest.treeExpandRefresh', {
  impl: uiTest({
    control: tree({
      nodeModel: tree.jsonReadOnly({
        object: ()=>({
          a: { a1: 'val' },
          b: { b1: 'val' },
        }),
        rootPath: ''
      }),
      features: [
        tree.expandPath('%$globals/expanded%'),
        watchRef('%$globals/expanded%', { strongRefresh: true })
      ]
    }),
    expectedResult: not(contains('~a~a1')),
    runBefore: writeValue('%$globals/expanded%', '~a'),
    uiAction: writeValue('%$globals/expanded%', ''),
    useFrontEnd: true
  })
})

component('uiTest.treeStyles', {
  impl: uiTest({
    control: group({
      controls: [
        tree({
          nodeModel: tree.json('%$personWithChildren%', 'personWithChildren'),
          style: tree.expandBox({ showIcon: true }),
          features: [
            tree.selection(),
            tree.dragAndDrop(),
            tree.keyboardSelection(),
            tree.expandPath('personWithChildren~children')
          ]
        }),
        tree({
          nodeModel: tree.json('%$personWithChildren%', 'personWithChildren'),
          style: tree.expandBox({ showIcon: false }),
          features: [
            tree.selection(),
            tree.dragAndDrop(),
            tree.keyboardSelection(),
            tree.expandPath('personWithChildren~children')
          ]
        }),
        tree({
          nodeModel: tree.json('%$personWithChildren%', 'personWithChildren'),
          style: tree.plain({ showIcon: true }),
          features: [
            tree.selection(),
            tree.dragAndDrop(),
            tree.keyboardSelection(),
            tree.expandPath('personWithChildren~children')
          ]
        }),
        tree({
          nodeModel: tree.json('%$personWithChildren%', 'personWithChildren'),
          style: tree.plain({ showIcon: false }),
          features: [
            tree.selection(),
            tree.dragAndDrop(),
            tree.keyboardSelection(),
            tree.expandPath('personWithChildren~children')
          ]
        })
      ],
      layout: layout.vertical('30')
    }),
    expectedResult: true
  })
})



