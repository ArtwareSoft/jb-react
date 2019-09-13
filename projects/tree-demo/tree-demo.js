jb.component('personWithAddress', { /* personWithAddress */
  watchableData: {
    name: 'Homer Simpson',
    address: {city: 'Springfield', street: '742 Evergreen Terrace'}
  }
})

jb.component('personWithChildren', { /* personWithChildren */
  watchableData: {
    name: 'Homer Simpson',
    children: [{name: 'Bart'}, {name: 'Lisa'}, {name: 'Maggie'}, {name: 'a'}, {name: 'b'}],
    friends: [{name: 'Barnie'}, {name: 'Morney'} ]
  }
})

jb.component('tree-demo.main', { 
  impl: tree({
      nodeModel: tree.jsonReadOnly('%$personWithAddress%', 'personWithAddress'),
      features: [tree.selection({}), tree.keyboardSelection({})]
  }),
})

jb.component('tree-demo.right-click', { 
  impl: tree({
      nodeModel: tree.jsonReadOnly('%$personWithAddress%', 'personWithAddress'),
      features: [
        tree.selection({
          onRightClick: openDialog({title: 'hello', features: dialogFeature.nearLauncherPosition({})})
        }),
        tree.keyboardSelection({})
      ]
    }),
})

jb.component('tree-demo.drag-and-drop-children', { 
  impl: tree({
      nodeModel: tree.json('%$personWithChildren%', 'personWithChildren'),
      features: [
        tree.selection({}), 
        tree.dragAndDrop(), 
        tree.keyboardSelection({}),
        watchRef({ref: '%$personWithChildren%', includeChildren: 'yes', allowSelfRefresh: true })
      ]
    }),
})


jb.component('tree-demo.table-tree', { /* treeDemo.tableTree */
  type: 'control',
  impl: group({
    controls: [
      tableTree({
        treeModel: tree.jsonReadOnly('%$personWithChildren%', ''),
        leafFields: [
          text({title: 'name1', text: 'leaf1%val%', style: label.noWrappingTag()}),
          text({title: 'name2', text: 'leaf2%val%', style: label.noWrappingTag()})
        ],
        commonFields: [text({title: 'name3', text: '%val/name%', style: label.noWrappingTag()})],
        chapterHeadline: label({title: suffix('~', '%path%')}),
        style: tableTree.plain()
      })
    ],
    features: css('{width: 300px}')
  })
})
