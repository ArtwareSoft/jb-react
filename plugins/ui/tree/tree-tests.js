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

component('UiTreeTest.tree', {
  impl: uiTest({
    control: tree({ nodeModel: tree.jsonReadOnly('%$personWithAddress%', 'personWithAddress'), features: [tree.selection(), tree.keyboardSelection()] }),
    expectedResult: contains('address')
  })
})

component('UiTreeTest.treeRightClick', {
  impl: uiTest({
    control: tree({
      nodeModel: tree.jsonReadOnly('%$personWithAddress%', 'personWithAddress'),
      features: [
        tree.selection({ onRightClick: openDialog('hello', { features: nearLauncherPosition() }) }),
        tree.keyboardSelection()
      ]
    }),
    expectedResult: contains('address')
  })
})

component('UiTreeTest.treeDD.betweenBranches', {
  impl: uiTest({
    control: tree({
      nodeModel: tree.json('%$personWithChildren%', 'personWithChildren'),
      features: [
        tree.selection(),
        tree.dragAndDrop(),
        tree.keyboardSelection()
      ]
    }),
    expectedResult: equals({
      item1: pipeline(
        list('%$personWithChildren/children%','%$personWithChildren/friends%'),
        '%name%',
        join(',')
      ),
      item2: 'Bart,Maggie,Lisa,Barnie'
    }),
    uiAction: action(move('%$personWithChildren/children[1]%', '%$personWithChildren/friends[0]%'))
  })
})

component('UiTreeTest.treeDD.sameArray', {
  impl: uiTest({
    control: tree({
      nodeModel: tree.json('%$personWithChildren%', 'personWithChildren'),
      features: [
        tree.selection(),
        tree.dragAndDrop(),
        tree.keyboardSelection()
      ]
    }),
    expectedResult: equals(pipeline('%$personWithChildren/children/name%', join(',')), 'Bart,Maggie,Lisa'),
    uiAction: action(move('%$personWithChildren/children[1]%', '%$personWithChildren/children[2]%'))
  })
})

component('UiTreeTest.treeDD.boundedSelection', {
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
    emulateFrontEnd: true
  })
})

component('UiTreeTest.treeDDAndBack', {
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
    emulateFrontEnd: true
  })
})

component('UiTreeTest.treeDDTwice', {
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
    emulateFrontEnd: true
  })
})

component('UiTreeTest.treeDDAfterLast', {
  impl: uiTest({
    control: tree({ nodeModel: tree.json('%$personWithChildren%', 'Homer'), features: [tree.selection(), tree.dragAndDrop(), tree.keyboardSelection()] }),
    expectedResult: equals({
      item1: pipeline(list('%$personWithChildren/children%','%$personWithChildren/friends%'), '%name%', join()),
      item2: 'Bart,Maggie,Barnie,Lisa'
    }),
    uiAction: action(move('%$personWithChildren/children[1]%', '%$personWithChildren/friends[1]%')),
    emulateFrontEnd: true
  })
})

component('UiTreeTest.treeVisualDD', {
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

component('UiTreeTest.treeUnexpandRefresh', {
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
    emulateFrontEnd: true
  })
})

component('UiTreeTest.treeExpandRefresh', {
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
    emulateFrontEnd: true
  })
})

component('UiTreeTest.treeStyles', {
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



