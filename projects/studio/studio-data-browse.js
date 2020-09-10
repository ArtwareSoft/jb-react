jb.ns('sourceEditor')

jb.component('studio.watchableOrPassive', {
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => path.match(/~watchable/) ? 'Watchable' : 'Passive'
})

jb.component('studio.copyDataResourceToComp', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'},
    {id: 'name', as: 'string'}
  ],
  impl: writeValue(
    studio.profileAsText('%$path%'),
    (ctx,vars,{name}) => jb.prettyPrint(new jb.studio.previewjb.jbCtx().exp('%$'+name+'%'))
  )
})

jb.component('studio.openResource', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'},
    {id: 'name', as: 'string'}
  ],
  impl: runActions(
    studio.copyDataResourceToComp('%$path%', '%$name%'),
    openDialog({
        style: dialog.editSourceStyle({id: 'editDataResource', width: 600}),
        content: editableText({
          databind: studio.profileAsText('%$path%'),
          style: editableText.studioCodemirrorTgp(),
          // features: [
          //   frontEnd((ctx,{cmp}) => ctx.vars.$dialog.cmp.refresh = () => {
          //     ctx.run(studio.copyDataResourceToComp('%$path%','%$name%'))
          //     cmp.refresh && cmp.refresh(null,{srcCtx: ctx.componentContext})}
          //   )
          // ]
        }),
        title: pipeline(studio.watchableOrPassive('%$path%'), 'Edit %$name% (%%)'),
        features: [
          css('.jb-dialog-content-parent {overflow-y: hidden}'),
          dialogFeature.resizer(true)
        ]
      })
  )
})

jb.component('studio.newDataSource', {
  type: 'control',
  impl: group({
    title: '',
    layout: layout.vertical('23'),
    style: group.div(),
    controls: [
      editableText({
        title: 'name',
        databind: '%$dialogData/name%',
        style: editableText.mdcInput({}),
        features: [
          validation(matchRegex('^[a-zA-Z_0-9]+$'), 'invalid name'),
          css.margin({left: '10'})
        ]
      }),
      picklist({
        title: 'type',
        databind: '%$dialogData/type%',
        options: picklist.optionsByComma('text,array,card,collection'),
        style: picklist.mdcRadio(),
        features: [
          feature.init(
            action.if(
              not('%$dialogData/type%'),
              writeValue('%$dialogData/type%', 'collection')
            )
          ),
          css.margin({left: '10'})
        ]
      }),
      group({
        title: '',
        layout: layout.horizontal('65'),
        controls: [
          editableBoolean({
            databind: '%$dialogData/watchable%',
            style: editableBoolean.mdcCheckBox(),
            title: 'watchable',
          }),
          editableBoolean({
            databind: '%$newFile%',
            style: editableBoolean.mdcCheckBox(),
            title: 'new file',
          })
        ],
        features: css.margin({top: '8', left: '14'})
      }),
      picklist({
        title: 'file',
        databind: '%$dialogData/file%',
        options: picklist.options({options: sourceEditor.filesOfProject()}),
        style: picklist.mdcSelect('250'),
        features: [hidden(not('%$newFile%')), watchRef('%$newFile%')]
      })
    ],
    features: [
      css.padding({top: '14', left: '11'}),
      css.width('451'),
      css.height('300'),
      variable({
        name: 'dialogData',
        value: firstSucceeding(
          '%$dialogData%',
          obj(prop('file', pipeline(sourceEditor.filesOfProject(), first())))
        )
      }),
      variable({name: 'newFile', watchable: true})
    ]
  })
})

jb.component('studio.openNewDataSource', {
  type: 'action',
  impl: openDialog({
    style: dialog.dialogOkCancel(),
    content: studio.newDataSource(),
    title: 'New Data Source',
    onOK: runActions(
      Var('watchableOrPassive', If('%$dialogData/watchable%', 'watchable', 'passive')),
      Var('name', studio.macroName('%$dialogData/name%')),
      If(
          not('%$dialogData/file%'),
          runActions(
            writeValue('%$dialogData/file%', '%$dialogData/name%.js'),
            studio.createProjectFile('%$dialogData/name%.js')
          )
        ),
      studio.newComp({
          compName: 'dataResource.%$name%',
          compContent: obj(
            prop(
                '%$watchableOrPassive%Data',
                data.switch(
                  [
                    data.case('%$dialogData/type%==text', ''),
                    data.case('%$dialogData/type%==array', '[]'),
                    data.case(
                      '%$dialogData/type%==card',
                      asIs({title: '', description: '', image: ''})
                    ),
                    data.case(
                      '%$dialogData/type%==collection',
                      asIs([{title: '', description: '', image: ''}])
                    )
                  ]
                ),
                ''
              )
          ),
          file: '%$dialogData/file%'
        }),
      studio.openResource('dataResource.%$name%~%$watchableOrPassive%Data', '%$name%')
    ),
    modal: true,
    features: [
      dialogFeature.autoFocusOnFirstInput(),
      dialogFeature.maxZIndexOnClick(),
      dialogFeature.dragTitle()
    ]
  })
})

jb.component('studio.dataResourceMenu', {
  type: 'menu.option',
  impl: menu.menu({
    title: 'Data',
    options: [
      menu.endWithSeparator({
        options: dynamicControls({
          controlItems: ctx => jb.studio.projectCompsAsEntries()
          .filter(e=>e[1].watchableData !== undefined || e[1].passiveData !== undefined)
            .map(e=> {
              const watchableOrPassive = e[1].watchableData !== undefined ? 'watchable' : 'passive'
              const upper = watchableOrPassive.charAt(0).toUpperCase() + watchableOrPassive.slice(1)
              const name = jb.removeDataResourcePrefix(e[0])
              return {
                name,
                title: `${name} (${upper})`,
                path: `${e[0]}~${watchableOrPassive}Data`
              }
            }
            ),
          genericControl: menu.action({
            title: '%$controlItem/title%',
            action: studio.openResource('%$controlItem/path%', '%$controlItem/name%')
          })
        })
      }),
      menu.action('New ...', studio.openNewDataSource()),
    ]
  })
})



