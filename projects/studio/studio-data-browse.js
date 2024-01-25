component('studio.watchableOrPassive', {
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => path.match(/~watchable/) ? 'Watchable' : 'Passive'
})

component('studio.copyDataResourceToComp', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'},
    {id: 'name', as: 'string'}
  ],
  impl: writeValue({
    to: tgp.profileAsText('%$path%'),
    value: (ctx,vars,{name}) => jb.utils.prettyPrint(new jb.core.jbCtx().exp('%$'+name+'%'))
  })
})

component('studio.openResource', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'},
    {id: 'name', as: 'string'}
  ],
  impl: runActions(
    studio.copyDataResourceToComp('%$path%', '%$name%'),
    openDialog({
      title: pipeline(studio.watchableOrPassive('%$path%'), 'Edit %$name% (%%)'),
      content: editableText({ databind: tgp.profileAsText('%$path%'), style: editableText.studioCodemirrorTgp() }),
      style: dialog.editSourceStyle('editDataResource', 600),
      features: [
        css('.jb-dialog-content-parent {overflow-y: hidden}'),
        dialogFeature.resizer(true)
      ]
    })
  )
})

component('studio.newDataSource', {
  type: 'control',
  impl: group({
    title: '',
    layout: layout.vertical('23'),
    style: group.div(),
    controls: [
      editableText('name', '%$dialogData/name%', {
        style: editableText.mdcInput(),
        features: [
        validation(matchRegex('^[a-zA-Z_0-9]+$'), 'invalid name'),
        css.margin({ left: '10' })
      ]
      }),
      picklist('type', '%$dialogData/type%', {
        options: picklist.optionsByComma('text,array,card,collection'),
        style: picklist.mdcRadio(),
        features: [
        feature.initValue('%$dialogData/type%', 'collection'),
        css.margin({ left: '10' })
      ]
      }),
      group({
        title: '',
        layout: layout.horizontal('65'),
        controls: [
          editableBoolean('%$dialogData/watchable%', editableBoolean.mdcCheckBox(), { title: 'watchable' }),
          editableBoolean('%$newFile%', editableBoolean.mdcCheckBox(), { title: 'new file' })
        ],
        features: css.margin('8', '14')
      }),
      picklist('file', '%$dialogData/file%', {
        options: picklist.options(sourceEditor.filesOfProject()),
        style: picklist.mdcSelect('250'),
        features: [
        hidden(not('%$newFile%')),
        watchRef('%$newFile%')
      ]
      })
    ],
    features: [
      css.padding('14', '11'),
      css.width('451'),
      css.height('300'),
      variable('dialogData', firstSucceeding('%$dialogData%', obj(prop('file', pipeline(sourceEditor.filesOfProject(), first()))))),
      watchable('newFile')
    ]
  })
})

component('studio.openNewDataSource', {
  type: 'action',
  impl: openDialog('New Data Source', studio.newDataSource(), {
    style: dialog.dialogOkCancel(),
    onOK: runActions(
    Var('watchableOrPassive', If('%$dialogData/watchable%', 'watchable', 'passive')),
    Var('name', tgp.titleToId('%$dialogData/name%')),
    If({
      condition: not('%$dialogData/file%'),
      then: runActions(
        writeValue('%$dialogData/file%', '%$dialogData/name%.js'),
        studio.createProjectFile('%$dialogData/name%.js')
      )
    }),
    studio.newComp({
      compName: 'dataResource.%$name%',
      compContent: obj(
        prop({
          title: '%$watchableOrPassive%Data',
          val: data.switch(
            data.case('%$dialogData/type%==text', ''),
            data.case('%$dialogData/type%==array', '[]'),
            data.case('%$dialogData/type%==card', asIs({title: '', description: '', image: ''})),
            data.case('%$dialogData/type%==collection', asIs([{title: '', description: '', image: ''}]))
          ),
          type: ''
        })
      ),
      file: '%$dialogData/file%'
    }),
    studio.openResource('dataResource.%$name%~%$watchableOrPassive%Data', '%$name%')
  ),
    features: [dialogFeature.autoFocusOnFirstInput(), dialogFeature.maxZIndexOnClick(), dialogFeature.dragTitle()]
  })
})

component('studio.dataResourceMenu', {
  type: 'menu.option',
  impl: menu.menu('Data', {
    options: [
    menu.endWithSeparator(
      dynamicControls({
        controlItems: ctx => jb.studio.projectCompsAsEntries()
          .filter(e=>e[1].watchableData !== undefined || e[1].passiveData !== undefined)
            .map(e=> {
              const watchableOrPassive = e[1].watchableData !== undefined ? 'watchable' : 'passive'
              const upper = watchableOrPassive.charAt(0).toUpperCase() + watchableOrPassive.slice(1)
              const name = jb.db.removeDataResourcePrefix(e[0])
              return {
                name,
                title: `${name} (${upper})`,
                path: `${e[0]}~${watchableOrPassive}Data`
              }
            }
            ),
        genericControl: menu.action('%$controlItem/title%', studio.openResource('%$controlItem/path%', '%$controlItem/name%'))
      })
    ),
    menu.action('New ...', studio.openNewDataSource())
  ]
  })
})



