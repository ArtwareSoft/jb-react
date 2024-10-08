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
  impl: writeValue(sourceEditor.profileAsText('%$path%'), (ctx,vars,{name}) => jb.utils.prettyPrint(new jb.core.jbCtx().exp('%$'+name+'%')))
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
      content: editableText({ databind: sourceEditor.profileAsText('%$path%'), style: editableText.studioCodemirrorTgp() }),
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
        controls: [
          editableBoolean('%$dialogData/watchable%', editableBoolean.mdcCheckBox(), { title: 'watchable' }),
          editableBoolean('%$newFile%', editableBoolean.mdcCheckBox(), { title: 'new file' })
        ],
        title: '',
        layout: layout.horizontal('65'),
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
    title: '',
    layout: layout.vertical('23'),
    style: group.div(),
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
      If(not('%$dialogData/file%'), runActions(
        writeValue('%$dialogData/file%', '%$dialogData/name%.js'),
        studio.createProjectFile('%$dialogData/name%.js')
      )),
      studio.newComp('dataResource.%$name%', {
        compContent: obj(
          prop({
            name: '%$watchableOrPassive%Data',
            val: Switch(Case('%$dialogData/type%==text', ''), Case('%$dialogData/type%==array', '[]'))
          })
        ),
        file: '%$dialogData/file%'
      }),
      studio.openResource('dataResource.%$name%~%$watchableOrPassive%Data', '%$name%')
    ),
    features: [autoFocusOnFirstInput(), maxZIndexOnClick(), dragTitle()]
  })
})

component('studio.dataResourceMenu', {
  type: 'menu.option',
  impl: menu('Data', {
    options: [
      menu.endWithSeparator(
        typeAdapter('control<>', dynamicControls({
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
          genericControl: option('%$controlItem/title%', studio.openResource('%$controlItem/path%', '%$controlItem/name%'))
        }))
      ),
      option('New ...', studio.openNewDataSource())
    ]
  })
})



