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
        treeModel: tree.nodeModel({
          rootPath: '',
          children: pipeline(
            Var('path', '%%'),
            keys(json.pathSelector('%$personWithChildren%', '%%')),
            '%$path%~%%'
          ),
          pathToItem: json.pathSelector('%$personWithChildren%', '%%'),
          maxDepth: 3
        }),
        leafFields: [text({title: 'name', text: '%name%', style: label.noWrappingTag()})],
        chapterHeadline: label('%$item/path%'),
        style: tableTree.plain()
      })
    ]
  })
})
