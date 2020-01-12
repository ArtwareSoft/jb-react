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
        features: [tree.selection(), tree.dragAndDrop(), tree.keyboardSelection()]
      }),
      action: ctx => jb.move(ctx.exp('%$personWithChildren/children[1]%', 'ref'),
            ctx.exp('%$personWithChildren/friends[0]%', 'ref'),ctx),
      expectedResult: equals(
        pipeline(
          list('%$personWithChildren/children%', '%$personWithChildren/friends%'),
          '%name%',
          join()
        ),
        'Bart,Maggie,Lisa,Barnie'
      )
    })
})

jb.component('ui-test.tree-visual-DD', {
  impl: uiTest({
    control: tree({
      nodeModel: tree.json('%$personWithChildren%', 'personWithChildren'),
      features: [tree.selection(), tree.dragAndDrop(), tree.keyboardSelection(),
        feature.init(tree.expandPath(['personWithChildren~children','personWithChildren~friends']))
      ]
    }),
    expectedResult: true
  })
})

jb.component('ui-test.tree-styles', {
  impl: uiTest({
    control: group({
      layout: layout.vertical({spacing: '30'}),
      controls: [
        tree({
          style: tree.expandBox({showIcon: true, noHead: true}),
          nodeModel: tree.json('%$personWithChildren%', 'personWithChildren'),
          features: [tree.selection(), tree.dragAndDrop(), tree.keyboardSelection(),
            feature.init(tree.expandPath(['personWithChildren~children','personWithChildren~friends']))
          ]
        }),
        tree({
          style: tree.expandBox({showIcon: false, noHead: true}),
          nodeModel: tree.json('%$personWithChildren%', 'personWithChildren'),
          features: [tree.selection(), tree.dragAndDrop(), tree.keyboardSelection(),
            feature.init(tree.expandPath(['personWithChildren~children','personWithChildren~friends']))
          ]
        }),
        tree({
          style: tree.plain({showIcon: true, noHead: true}),
          nodeModel: tree.json('%$personWithChildren%', 'personWithChildren'),
          features: [tree.selection(), tree.dragAndDrop(), tree.keyboardSelection(),
            feature.init(tree.expandPath(['personWithChildren~children','personWithChildren~friends']))
          ]
        }),
        tree({
          style: tree.plain({showIcon: false, noHead: true}),
          nodeModel: tree.json('%$personWithChildren%', 'personWithChildren'),
          features: [tree.selection(), tree.dragAndDrop(), tree.keyboardSelection(),
            feature.init(tree.expandPath(['personWithChildren~children','personWithChildren~friends']))
          ]
        }),
      ]
    }),
    expectedResult: true
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
            ctx.exp('%$personWithChildren/friends[1]%', 'ref'),ctx),
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
  
jb.component('ui-test.table-tree-refresh1', {
  impl: uiTest({
      control: tableTree({
        treeModel: tree.jsonReadOnly('%$personWithChildren%', ''),
        leafFields: text({title: 'name', text: '%val%'}),
        commonFields: text({title: 'path', text: '%path%'}),
        chapterHeadline: label({text: suffix('~', '%path%')}),
        style: tableTree.plain(),
        features: id('tableTree')
    }),
    action: ctx => {
      const cmp = jb.ui.cmpOfSelector('#tableTree',ctx)
      Object.assign(cmp.state.expanded,{'~friends':true, '~friends~0': true })
      cmp.refresh()
    },
    expectedResult: contains(['name','path','Homer','friends','Barnie','~friends~0~name'])
  })
})

jb.component('ui-test.table-tree-refresh2', {
  impl: uiTest({
      control: tableTree({
        treeModel: tree.jsonReadOnly(()=>({
          a: { a1: 'val' },
          b: { b1: 'val' },
        }) , ''),
        leafFields: text({title: 'name', text: '%val%'}),
        commonFields: text({title: 'path', text: '%path%'}),
        chapterHeadline: label({text: suffix('~', '%path%')}),
        style: tableTree.plain(),
        features: id('tableTree')
    }),
    action: ctx => {
      const cmp = jb.ui.cmpOfSelector('#tableTree',ctx)
      Object.assign(cmp.state.expanded,{'~a':false })
      cmp.refresh()
    },
    expectedResult: not(contains(['undefined']))
  })
})

jb.component('ui-test.table-tree-with-title-ctrl', {
  impl: uiTest({
      control: tableTree({
        treeModel: tree.jsonReadOnly('%$personWithChildren%', ''),
        leafFields: text({
          title: 'name', 
          text: '%val%',
          features: field.titleCtrl(button({
              title: 'my %title%',
              style: button.href()
          }))        
        }),
        chapterHeadline: label({text: suffix('~', '%path%')}),
    }),
    expectedResult: contains(['my name','path','Homer'])
  })
})

jb.component('ui-test.table-tree-with-filter', {
  impl: uiTest({
      control: tableTree({
        treeModel: tree.modelFilter(tree.jsonReadOnly('%$personWithChildren%', ''), endsWith('~name')),
        leafFields: text({title: 'name', text: '%val%' }),
        chapterHeadline: label({text: suffix('~', '%path%')}),
    }),
    expectedResult: and(contains(['name','Homer']),not(contains('friends')))
  })
})

