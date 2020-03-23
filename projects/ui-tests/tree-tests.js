jb.component('uiTest.tree', {
  impl: uiTest({
    control: tree({
      nodeModel: tree.jsonReadOnly('%$personWithAddress%', 'personWithAddress'),
      features: [tree.selection({}), tree.keyboardSelection({})]
    }),
    expectedResult: contains(['address'])
  })
})

jb.component('uiTest.treeRightClick', {
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

jb.component('uiTest.treeDD', {
  impl: uiTest({
    control: tree({
      nodeModel: tree.json('%$personWithChildren%', 'personWithChildren'),
      features: [tree.selection({}), tree.dragAndDrop(), tree.keyboardSelection({})]
    }),
    action: ctx => jb.move(ctx.exp('%$personWithChildren/children[1]%', 'ref'),
            ctx.exp('%$personWithChildren/friends[0]%', 'ref'),ctx),
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

jb.component('uiTest.treeDDAndBack', {
  impl: uiTest({
    control: tree({
      nodeModel: tree.json('%$personWithChildren%', 'personWithChildren'),
      features: [tree.selection({}), tree.dragAndDrop(), tree.keyboardSelection({})]
    }),
    action: runActions(
      ctx => jb.move(ctx.exp('%$personWithChildren/children[1]%', 'ref'),
          ctx.exp('%$personWithChildren/friends[1]%', 'ref'),ctx),
      delay(1),
      ctx => jb.move(ctx.exp('%$personWithChildren/friends[1]%', 'ref'),
          ctx.exp('%$personWithChildren/children[1]%', 'ref'),ctx)
    ),
    expectedResult: equals(
      pipeline(
        list('%$personWithChildren/children%', '%$personWithChildren/friends%'),
        '%name%',
        join({})
      ),
      'Bart,Lisa,Maggie,Barnie'
    )
  })
})

jb.component('uiTest.treeDDTwice', {
  impl: uiTest({
    control: tree({
      nodeModel: tree.json('%$personWithChildren%', 'personWithChildren'),
      features: [tree.selection({}), tree.dragAndDrop(), tree.keyboardSelection({})]
    }),
    action: runActions(
      ctx => jb.move(ctx.exp('%$personWithChildren/children[1]%', 'ref'),
          ctx.exp('%$personWithChildren/friends[1]%', 'ref'),ctx),
      delay(1),
      ctx => jb.move(ctx.exp('%$personWithChildren/children[1]%', 'ref'),
          ctx.exp('%$personWithChildren/friends[1]%', 'ref'),ctx)
    ),
    expectedResult: equals(
      pipeline(
        list('%$personWithChildren/children%', '%$personWithChildren/friends%'),
        '%name%',
        join({})
      ),
      'Bart,Barnie,Maggie,Lisa'
    )
  })
})

jb.component('uiTest.treeVisualDD', {
  impl: uiTest({
    control: tree({
      nodeModel: tree.json('%$personWithChildren%', 'personWithChildren'),
      features: [
        tree.selection({}),
        tree.dragAndDrop(),
        tree.keyboardSelection({}),
        feature.init(
          tree.expandPath(['personWithChildren~children', 'personWithChildren~friends'])
        )
      ]
    }),
    expectedResult: true
  })
})

jb.component('uiTest.treeStyles', {
  impl: uiTest({
    control: group({
      layout: layout.vertical('30'),
      controls: [
        tree({
          nodeModel: tree.json('%$personWithChildren%', 'personWithChildren'),
          style: tree.expandBox({showIcon: true, noHead: true}),
          features: [
            tree.selection({}),
            tree.dragAndDrop(),
            tree.keyboardSelection({}),
            feature.init(
              tree.expandPath(['personWithChildren~children', 'personWithChildren~friends'])
            )
          ]
        }),
        tree({
          nodeModel: tree.json('%$personWithChildren%', 'personWithChildren'),
          style: tree.expandBox({showIcon: false, noHead: true}),
          features: [
            tree.selection({}),
            tree.dragAndDrop(),
            tree.keyboardSelection({}),
            feature.init(
              tree.expandPath(['personWithChildren~children', 'personWithChildren~friends'])
            )
          ]
        }),
        tree({
          nodeModel: tree.json('%$personWithChildren%', 'personWithChildren'),
          style: tree.plain(true, true),
          features: [
            tree.selection({}),
            tree.dragAndDrop(),
            tree.keyboardSelection({}),
            feature.init(
              tree.expandPath(['personWithChildren~children', 'personWithChildren~friends'])
            )
          ]
        }),
        tree({
          nodeModel: tree.json('%$personWithChildren%', 'personWithChildren'),
          style: tree.plain(false, true),
          features: [
            tree.selection({}),
            tree.dragAndDrop(),
            tree.keyboardSelection({}),
            feature.init(
              tree.expandPath(['personWithChildren~children', 'personWithChildren~friends'])
            )
          ]
        })
      ]
    }),
    expectedResult: true
  })
})

jb.component('uiTest.treeDDAfterLast', {
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

jb.component('uiTest.tableTree.expandPath', {
  impl: uiTest({
    control: tableTree({
      treeModel: tree.jsonReadOnly('%$personWithChildren%', ''),
      leafFields: text({text: '%val%', title: 'name'}),
      commonFields: text({text: '%path%', title: 'path'}),
      chapterHeadline: text({text: suffix('~', '%path%')}),
      style: tableTree.plain({}),
      features: [id('tableTree'), tableTree.expandPath('~friends~0')]
    }),
    expectedResult: contains(['name', 'path', 'Homer', 'friends', 'Barnie', '~friends~0~name'])
  })
})

jb.component('uiTest.tableTreeRefresh1', {
  impl: uiTest({
    control: tableTree({
      treeModel: tree.jsonReadOnly('%$personWithChildren%', ''),
      leafFields: text({text: '%val%', title: 'name'}),
      commonFields: text({text: '%path%', title: 'path'}),
      chapterHeadline: text({text: suffix('~', '%path%')}),
      style: tableTree.plain({}),
      features: [
        tableTree.expandPath('%$globals/expanded%'),
        watchRef({ref: '%$globals/expanded%', strongRefresh: true})
      ]
    }),
    action: writeValue('%$globals/expanded%', '~friends~0'),
    expectedResult: contains(['name', 'path', 'Homer', 'friends', 'Barnie', '~friends~0~name'])
  })
})

jb.component('uiTest.tableTreeUnexpandRefresh', {
  impl: uiTest({
    control: tableTree({
      treeModel: tree.jsonReadOnly(()=>({
          a: { a1: 'val' },
          b: { b1: 'val' },
        }), ''),
      leafFields: text({text: '%val%', title: 'name'}),
      commonFields: text({text: '%path%', title: 'path'}),
      chapterHeadline: text({text: suffix('~', '%path%')}),
      style: tableTree.plain({}),
      features: [
        tableTree.expandPath('%$globals/expanded%'),
        watchRef({ref: '%$globals/expanded%', strongRefresh: true})
      ]
    }),
    runBefore: writeValue('%$globals/expanded%', '~a'),
    action: writeValue('%$globals/expanded%', ''),
    expectedResult: and(not(contains('undefined')), not(contains('~a~a1')))
  })
})

jb.component('uiTest.tableTreeExpandMulitplePaths', {
  impl: uiTest({
    control: tableTree({
      treeModel: tree.jsonReadOnly(()=>({
          a: { a1: 'val' },
          b: { b1: 'val' },
        }), ''),
      commonFields: text({text: '%path%', title: 'path'}),
      chapterHeadline: text({text: suffix('~', '%path%')}),
      features: tableTree.expandPath('~a,~b')
    }),
    expectedResult: contains(['~a~a1', '~b~b1'])
  })
})


jb.component('uiTest.tableTreeWithTitleCtrl', {
  impl: uiTest({
    control: tableTree({
      treeModel: tree.jsonReadOnly('%$personWithChildren%', ''),
      leafFields: text({
        text: '%val%',
        title: 'name',
        features: field.titleCtrl(button({title: 'my %title%', style: button.href()}))
      }),
      chapterHeadline: text({text: suffix('~', '%path%')})
    }),
    expectedResult: contains(['my name', 'path', 'Homer'])
  })
})

jb.component('uiTest.tableTreeRefreshBug', {
  impl: uiTest({
    control: tableTree({
      treeModel: tree.jsonReadOnly('%$personWithChildren%', ''),
      chapterHeadline: text({text: suffix('~', '%path%')})
    }),
    action: ctx => {
      const el = ctx.vars.elemToTest.querySelector('[path="~children"]')
      jb.ui.closestCmp(el).flip({target: el})
    },
    expectedResult: contains(['children', '>2<', 'friends'])
  })
})

jb.component('uiTest.tableTreeWithFilter', {
  impl: uiTest({
    control: tableTree({
      treeModel: tree.modelFilter(
        tree.jsonReadOnly('%$personWithChildren%', ''),
        endsWith('~name')
      ),
      leafFields: text({text: '%val%', title: 'name'}),
      chapterHeadline: text({text: suffix('~', '%path%')})
    }),
    expectedResult: and(contains(['name', 'Homer']), not(contains('friends')))
  })
})

