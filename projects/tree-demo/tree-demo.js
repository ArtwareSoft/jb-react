component('personWithAddress', { /* personWithAddress */
  watchableData: {
    name: 'Homer Simpson',
    address: {city: 'Springfield', street: '742 Evergreen Terrace'}
  }
})

component('personWithChildren', { /* personWithChildren */
  watchableData: {
    name: 'Homer Simpson',
    children: [{name: 'Bart'}, {name: 'Lisa'}, {name: 'Maggie'}, {name: 'a'}, {name: 'b'}],
    friends: [{name: 'Barnie'}, {name: 'Morney'} ]
  }
})

component('treeDemo.main', { 
  impl: tree({
      nodeModel: tree.jsonReadOnly('%$personWithAddress%', 'personWithAddress'),
      features: [tree.selection({}), tree.keyboardSelection({})]
  }),
})

component('treeDemo.rightClick', { 
  impl: tree({
      nodeModel: tree.jsonReadOnly('%$personWithAddress%', 'personWithAddress'),
      features: [
        tree.selection({
          onRightClick: openDialog({title: 'hello', features: nearLauncherPosition({})})
        }),
        tree.keyboardSelection({})
      ]
    }),
})

component('treeDemo.dragAndDrop', { 
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

component('treeDemo.tableTree', {
  type: 'control',
  impl: group({
    controls: [
      tableTree({
        treeModel: tree.jsonReadOnly('%$personWithChildren%', ''),
        leafFields: text({
          title: 'name',
          text: '%val%',
          features: field.titleCtrl(
            button({
              title: '%title%',
              action: menu.openContextMenu({menu: menu({options: option('my %title%')})}),
              style: button.href()
            })
          )
        }),
        commonFields: text({title: 'path', text: '%path%'}),
        chapterHeadline: text({text: suffix('~', '%path%')}),
        style: tableTree.plain(),
        features: id('tableTree')
      })
    ],
    features: css('{width: 300px}')
  })
})
