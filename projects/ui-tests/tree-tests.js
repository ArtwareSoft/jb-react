jb.component('ui-test.tree', { /* uiTest.tree */
    impl: uiTest({
      control: tree({
        nodeModel: tree.jsonReadOnly('%$personWithAddress%', 'personWithAddress'),
        features: [tree.selection({}), tree.keyboardSelection({})]
      }),
      expectedResult: contains(['address'])
    })
})
  
jb.component('ui-test.tree-rightClick', { /* uiTest.treeRightClick */
    impl: uiTest({
      control: tree({
        nodeModel: tree.jsonReadOnly('%$personWithAddress%', 'personWithAddress'),
        features: [
          tree.selection({
            onRightClick: openDialog({title: 'hello', features: dialogFeature.nearLauncherPosition({})})
          }),
          tree.keyboardSelection({})
        ]
      }),
      expectedResult: contains(['address'])
    })
})
  
jb.component('ui-test.tree-DD', { /* uiTest.treeDD */
    impl: uiTest({
      control: tree({
        nodeModel: tree.json('%$personWithChildren%', 'Homer'),
        features: [tree.selection({}), tree.dragAndDrop(), tree.keyboardSelection({})]
      }),
      action: ctx =>
        jb.move(ctx.exp('%$personWithChildren/children[1]%', 'ref'),
          ctx.exp('%$personWithChildren/friends[0]%', 'ref')),
      expectedResult: equals(
        pipeline(
          list('%$personWithChildren/children%', '%$personWithChildren/friends%'),
          '%name%',
          join({})
        ),
        'Bart,Maggie,Lisa,Barnie'
      )
    })
})
  
jb.component('ui-test.tree-DD-after-last', { /* uiTest.treeDDAfterLast */
    impl: uiTest({
        control: tree({
        nodeModel: tree.json('%$personWithChildren%', 'Homer'),
        features: [tree.selection({}), tree.dragAndDrop(), tree.keyboardSelection({})]
        }),
        action: ctx =>
        jb.move(ctx.exp('%$personWithChildren/children[1]%', 'ref'),
            ctx.exp('%$personWithChildren/friends[1]%', 'ref')),
        expectedResult: equals(
        pipeline(
            list('%$personWithChildren/children%', '%$personWithChildren/friends%'),
            '%name%',
            join({})
        ),
        'Bart,Maggie,Barnie,Lisa'
        )
    })
})
  