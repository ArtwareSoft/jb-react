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
      group({
        title: '',
        layout: layout.vertical(),
        style: group.tabs(),
        controls: [
          group({
            title: 'Files (js and css)',
            controls: [
              itemlist({
                title: '',
                items: '%jsFiles%',
                controls: [
                  editableText({
                    title: 'file',
                    databind: '%%',
                    style: editableText.mdcNoLabel('580'),
                    features: css('background-color: transparent;')
                  }),
                  button({
                    title: 'delete',
                    action: removeFromArray({array: '%$projectSettings/jsFiles%', itemToRemove: '%%'}),
                    style: button.x('21'),
                    features: [
                      itemlist.shownOnlyOnItemHover(),
                      css.margin({top: '20', right: '', left: ''}),
                      css('z-index: 1000')
                    ]
                  })
                ],
                style: itemlist.ulLi(),
                features: [
                  watchRef({
                    ref: '%$projectSettings/jsFiles%',
                    includeChildren: 'structure',
                    allowSelfRefresh: true
                  }),
                  itemlist.dragAndDrop()
                ]
              }),
              button({
                title: 'add file',
                action: addToArray('%$projectSettings/jsFiles%', 'file.js'),
                style: button.mdc(),
                raised: '',
                features: [css.width('200'), css.margin('10')]
              })
            ],
            features: [css.padding({bottom: '10'})]
          }),
          group({
            title: 'Libs',
            controls: [
              group({
                title: 'chips',
                layout: layout.flex({wrap: 'wrap'}),
                controls: [
                  dynamicControls({
                    controlItems: '%$studio/libsAsArray%',
                    genericControl: group({
                      title: 'chip',
                      layout: layout.flex({wrap: 'wrap', spacing: '0'}),
                      controls: [
                        button({title: '%% ', style: button.mdcChipAction(), raised: 'false'}),
                        button({
                          title: 'delete',
                          style: button.x(),
                          features: [
                            css('color: black; z-index: 1000;margin-left: -30px'),
                            itemlist.shownOnlyOnItemHover()
                          ]
                        })
                      ],
                      features: [
                        css('color: black; z-index: 1000'),
                        feature.onEvent({
                          event: 'click',
                          action: removeFromArray({array: '%$studio/libsAsArray%', itemToRemove: '%%'})
                        }),
                        css.class('jb-item')
                      ]
                    })
                  })
                ],
                features: watchRef({
                  ref: '%$studio/libsAsArray%',
                  includeChildren: 'yes',
                  allowSelfRefresh: true,
                  strongRefresh: false
                })
              }),
              group({
                title: 'add lib',
                layout: layout.horizontal('20'),
                controls: [
                  picklist({
                    title: '',
                    databind: '%$studio/libToAdd%',
                    options: picklist.options(keys(ctx => jb.frame.jb_modules)),
                    features: [css.width('460'), picklist.onChange(addToArray('%$studio/libsAsArray%', '%%'))]
                  }),
                  button({
                    title: '+',
                    style: button.mdIcon('Plus'),
                    raised: '',
                    features: [feature.hoverTitle('add lib'), css.margin('5')]
                  })
                ]
              })
            ]
          })
        ],
        features: [
          group.data('%$projectSettings%'),
          css.width('600'),
          feature.init(
            writeValue('%$studio/libsAsArray%', split({text: '%$projectSettings/libs%'}))
          )
        ]
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
    jsFiles: ['file23.js', 'file.js', 'file.js']
  }
})

jb.component('dataResource.studio', {
  watchableData: {
    libToAdd: 'inner-html',
    libsAsArray: ['common', 'ui-common', 'material', 'dragula', 'md-icons']
  }
})
