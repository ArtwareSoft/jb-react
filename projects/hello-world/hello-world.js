jb.ns('helloWorld')

jb.component('dataResource.people', { /* dataResource.people */
  watchableData: [
    {
      name: 'Homer Simpson1',
      age: 42,
      male: false,
      children: [{name: 'Bart'}, {name: 'Lisa'}, {name: 'Maggie'}]
    },
    {
      name: 'Marge Simpson',
      age: 38,
      male: true,
      children: [{name: 'Bart'}, {name: 'Lisa'}, {name: 'Maggie'}]
    },
    {name: 'Bart Simpson', age: 12, male: false, children: []}
  ]
})

jb.component('dataResource.room', { /* dataResource.room */
  passiveData: ''
})

jb.component('helloWorld.main', {
  type: 'control',
  impl: group({
    layout: layout.vertical(),
    controls: [
      text({
        text: 'hello world',
        title: 'asdasdas',
        features: watchRef({allowSelfRefresh: false, strongRefresh: true})
      }),
      group({
        title: '',
        controls: [
          group({
            title: 'files (js and css)',
            controls: [
              itemlist({
                title: 'js and css files',
                items: '%jsFiles%',
                controls: [
                  materialIcon({
                    icon: 'file',
                    style: button.mdIcon('FileCodeOutline'),
                    features: [itemlist.dragHandle(), field.columnWidth(60)]
                  }),
                  editableText({
                    title: 'file name (js or css)',
                    databind: '%%',
                    style: editableText.mdcNoLabel('400')
                  }),
                  button({
                    title: 'delete',
                    action: removeFromArray({array: '%$projectSettings/jsFiles%', itemToRemove: '%%'}),
                    style: button.x('21'),
                    features: [itemlist.shownOnlyOnItemHover(), field.columnWidth(60)]
                  })
                ],
                style: table.mdc(),
                features: [
                  watchRef({
                    ref: '%$projectSettings/jsFiles%',
                    includeChildren: 'structure',
                    allowSelfRefresh: true
                  }),
                  itemlist.dragAndDrop()
                ]
              })
            ]
          }),
          button({
            title: 'add file',
            action: addToArray('%$projectSettings/jsFiles%', 'file.js'),
            style: button.mdIcon('NotePlusOutline'),
            raised: 'true',
            features: [css.width('200'), css.margin('10')]
          })
        ],
        features: group.data('%$projectSettings%')
      })
    ],
    features: css.width('600')
  })
})

jb.component('helloWorld.f1', {
  type: 'data',
  impl: pipeline(
    'dsdsds',
    'bbbb'
  ),
  testData: 'asdsaasd asdas'
})

jb.component('dataResource.projectSettings', {
  watchableData: {
    project: 'itemlists',
    libs: 'common,ui-common,material,dragula,md-icons',
    jsFiles: ['file.js', 'file.js', 'file.js']
  }
})
