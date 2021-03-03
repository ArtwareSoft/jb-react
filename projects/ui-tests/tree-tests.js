jb.component('uiTest.tree', {
  impl: uiTest({
    control: tree({
      nodeModel: tree.jsonReadOnly('%$personWithAddress%', 'personWithAddress'),
      features: [tree.selection(), tree.keyboardSelection()]
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

jb.component('uiTest.treeDD.betweenBranches', {
  impl: uiFrontEndTest({
    control: tree({
      nodeModel: tree.json('%$personWithChildren%', 'personWithChildren'),
      features: [tree.selection(), tree.dragAndDrop(), tree.keyboardSelection()]
    }),
    action: move('%$personWithChildren/children[1]%','%$personWithChildren/friends[0]%'),
    expectedResult: equals(
      pipeline(
        list('%$personWithChildren/children%', '%$personWithChildren/friends%'),
        '%name%',
        join(',')
      ),
      'Bart,Maggie,Lisa,Barnie'
    )
  })
})

jb.component('uiTest.treeDD.sameArray', {
  impl: uiFrontEndTest({
    control: tree({
      nodeModel: tree.json('%$personWithChildren%', 'personWithChildren'),
      features: [
        tree.selection(), tree.dragAndDrop(), tree.keyboardSelection(),
        tree.expandPath('personWithChildren~children')
      ]
    }),
    action: runActions(
      uiAction.click('[title="Bart"]'),
      uiAction.keyboardEvent({ selector: '[interactive]', type: 'keydown', keyCode: 40, ctrl: 'ctrl' }),
    ),
    expectedResult: contains(['Lisa','Bart','Maggie'])
  })
})

jb.component('uiTest.treeDDAndBack', {
  impl: uiFrontEndTest({
    control: tree({
      nodeModel: tree.json('%$personWithChildren%', 'personWithChildren'),
      features: [tree.selection(), tree.dragAndDrop(), tree.keyboardSelection()]
    }),
    action: runActions(
      move('%$personWithChildren/children[1]%','%$personWithChildren/friends[1]%'),
      move('%$personWithChildren/friends[1]%','%$personWithChildren/children[1]%'),
    ),
    expectedResult: equals(
      pipeline(
        list('%$personWithChildren/children%', '%$personWithChildren/friends%'),
        '%name%',
        join(',')
      ),
      'Bart,Lisa,Maggie,Barnie'
    )
  })
})

jb.component('uiTest.treeDDTwice', {
  impl: uiFrontEndTest({
    control: tree({
      nodeModel: tree.json('%$personWithChildren%', 'personWithChildren'),
      features: [tree.selection(), tree.dragAndDrop(), tree.keyboardSelection()]
    }),
    action: runActions(
      move('%$personWithChildren/children[1]%','%$personWithChildren/friends[1]%'),
      move('%$personWithChildren/children[1]%','%$personWithChildren/friends[1]%'),
    ),
    expectedResult: equals(
      pipeline(
        list('%$personWithChildren/children%', '%$personWithChildren/friends%'),
        '%name%',
        join(',')
      ),
      'Bart,Barnie,Maggie,Lisa'
    )
  })
})

jb.component('uiTest.treeDDAfterLast', {
  impl: uiFrontEndTest({
    control: tree({
      nodeModel: tree.json('%$personWithChildren%', 'Homer'),
      features: [tree.selection(), tree.dragAndDrop(), tree.keyboardSelection()]
    }),
    action: move('%$personWithChildren/children[1]%','%$personWithChildren/friends[1]%'),
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

jb.component('uiTest.treeDD.boundedSelection', {
  impl: uiFrontEndTest({
    control: group({ controls: 
      tree({
        nodeModel: tree.json('%$personWithChildren%', 'personWithChildren'),
        features: [
          tree.selection('%$selected%'), tree.dragAndDrop(), tree.keyboardSelection(),
          tree.expandPath('personWithChildren~children')
        ]
      }),
      features: variable({name: 'selected', watchable: true, value: 'personWithChildren~children~1'})
    }),
    action: uiAction.keyboardEvent({ selector: '[interactive]', type: 'keydown', keyCode: 40, ctrl: 'ctrl' }),
    expectedResult: contains(['Bart','Maggie','selected','Lisa'])
  })
})

jb.component('uiTest.treeVisualDD', {
  impl: uiTest({
    control: tree({
      nodeModel: tree.json('%$personWithChildren%', 'personWithChildren'),
      features: [
        tree.selection(),
        tree.dragAndDrop(),
        tree.keyboardSelection({autoFocus: true}),
        tree.expandPath(['personWithChildren~children', 'personWithChildren~friends'])
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
            tree.expandPath(['personWithChildren~children', 'personWithChildren~friends'])
          ]
        }),
        tree({
          nodeModel: tree.json('%$personWithChildren%', 'personWithChildren'),
          style: tree.expandBox({showIcon: false, noHead: true}),
          features: [
            tree.selection({}),
            tree.dragAndDrop(),
            tree.keyboardSelection({}),
            tree.expandPath(['personWithChildren~children', 'personWithChildren~friends'])
          ]
        }),
        tree({
          nodeModel: tree.json('%$personWithChildren%', 'personWithChildren'),
          style: tree.plain(true, true),
          features: [
            tree.selection({}),
            tree.dragAndDrop(),
            tree.keyboardSelection({}),
            tree.expandPath(['personWithChildren~children', 'personWithChildren~friends'])
          ]
        }),
        tree({
          nodeModel: tree.json('%$personWithChildren%', 'personWithChildren'),
          style: tree.plain(false, true),
          features: [
            tree.selection({}),
            tree.dragAndDrop(),
            tree.keyboardSelection({}),
            tree.expandPath(['personWithChildren~children', 'personWithChildren~friends'])
          ]
        })
      ]
    }),
    expectedResult: true
  })
})

jb.component('uiTest.tableTree.expandPath', {
  impl: uiTest({
    control: tableTree({
      treeModel: tree.jsonReadOnly('%$personWithChildren%', ''),
      leafFields: text({text: '%val%', title: 'name'}),
      commonFields: text({text: '%path%', title: 'path'}),
      chapterHeadline: text({text: suffix('~', '%path%')}),
      style: tableTree.plain(),
      features: [id('tableTree'), tableTree.expandPath('~friends~0'), tableTree.resizer()]
    }),
    expectedResult: contains(['name', 'path', 'Homer', 'friends', 'Barnie', '~friends~0~name'])
  })
})

jb.component('uiTest.tableTree.DD', {
  impl: uiFrontEndTest({
    control: tableTree({
      treeModel: tree.json('%$personWithChildren%', 'personWithChildren'),
      chapterHeadline: text({
        text: If(
          matchRegex('[0-9]*', suffix('~', '%path%')),
          '%val/name%',
          suffix('~', '%path%')
        )
      }),
      style: tableTree.plain({}),
      features: [
        id('tableTree'),
        tableTree.expandPath('personWithChildren~children'),
        tableTree.dragAndDrop(),
        watchRef({ref: '%$personWithChildren/children%', strongRefresh1: true})
      ]
    }),
    action: runActions(
      ctx => jb.db.move(ctx.exp('%$personWithChildren/children[2]%', 'ref'), ctx.exp('%$personWithChildren/children[0]%', 'ref'),ctx),
      ctx => jb.db.move(ctx.exp('%$personWithChildren/children[2]%', 'ref'), ctx.exp('%$personWithChildren/children[0]%', 'ref'),ctx),
    ),
    expectedResult: contains(['Lisa','Maggie','Bart']),
  })
})

jb.component('uiTest.tableTreeRefresh1', {
  impl: uiFrontEndTest({
    control: tableTree({
      treeModel: tree.jsonReadOnly('%$personWithChildren%', ''),
      leafFields: text({text: '%val%', title: 'name'}),
      commonFields: text({text: '%path%', title: 'path'}),
      chapterHeadline: text({text: suffix('~', '%path%')}),
      style: tableTree.plain(),
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
  impl: uiFrontEndTest({
    control: tableTree({
      treeModel: tree.jsonReadOnly(()=>({
          a: { a1: 'val' },
          b: { b1: 'val' },
        }), ''),
      leafFields: text({text: '%val%', title: 'name'}),
      commonFields: text({text: '%path%', title: 'path'}),
      chapterHeadline: text({text: suffix('~', '%path%')}),
      style: tableTree.plain(),
      features: [
        tableTree.expandPath('%$globals/expanded%'),
        watchRef({ref: '%$globals/expanded%', strongRefresh: true})
      ]
    }),
    runBefore: writeValue('%$globals/expanded%', '~a'),
    action: writeValue('%$globals/expanded%', ''),
    expectedResult: not(contains('~a~a1'))
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
      features: tableTree.expandPath(['~a','~b'])
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
        features: field.titleCtrl(button({title: 'my %title()%', style: button.href()}))
      }),
      chapterHeadline: text({text: suffix('~', '%path%')})
    }),
    expectedResult: contains(['my name', 'path', 'Homer'])
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

