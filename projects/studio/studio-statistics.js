
component('studio.gotoReferencesOptions', {
  type: 'menu.option',
  params: [
    {id: 'path', as: 'string'},
    {id: 'refs', as: 'array'}
  ],
  impl: menu.dynamicOptions('%$refs%', If({
    condition: '%refs/length% > 1',
    then: menu('%id% (%refs/length%)', {
      options: menu.dynamicOptions('%$menuData/refs%', option('%%', studio.openComponentInJbEditor('%%', '%$path%')))
    }),
    Else: option({
      vars: [
        Var('compName', split('~', { text: '%refs[0]%', part: 'first' }))
      ],
      title: '%$compName%',
      action: studio.openComponentInJbEditor('%refs[0]%', '%$path%')
    })
  }))
})

component('studio.gotoReferencesButton', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: controlWithCondition({
    vars: [
      Var('refs', tgp.references('%$path%')),
      Var('noOfReferences', ctx => ctx.vars.refs.reduce((total,refsInObj)=>total+refsInObj.refs.length,0))
    ],
    condition: '%$refs/length%',
    control: button('%$noOfReferences% references', menu.openContextMenu(
      menu({
        options: studio.gotoReferencesOptions('%$path%', { refs: '%$refs%' })
      })
    ))
  })
})

component('studio.gotoReferencesMenu', {
  type: 'menu.option',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: If({
    vars: [
      Var('refs', tgp.references('%$path%')),
      Var('noOfReferences', ctx => ctx.vars.refs.reduce((total,refsInObj)=>total+refsInObj.refs.length,0))
    ],
    condition: '%$noOfReferences% > 0',
    then: menu('%$noOfReferences% references for %$path%', {
      options: studio.gotoReferencesOptions('%$path%', { refs: '%$refs%' })
    }),
    Else: option('no references for %$path%')
  })
})

component('studio.componentsList', {
  type: 'control',
  impl: group({
    controls: [
      tableTree({
        treeModel: tree.jsonReadOnly(studio.cmpsOfProjectByFiles(), ''),
        leafFields: [
          text(pipeline(tgp.componentStatistics('%val%'), '%size%'), 'size', {
            features: [
              field.columnWidth('80')
            ]
          }),
          button({
            title: pipeline(tgp.componentStatistics('%val%'), '%refCount%.', split('.')),
            action: menu.openContextMenu(
              menu({
                options: [
                  studio.gotoReferencesOptions('%val%', { refs: tgp.references('%val%') })
                ]
              })
            ),
            style: button.href(),
            features: [
              field.title('refs'),
              field.columnWidth('40')
            ]
          }),
          button({
            title: 'delete',
            action: openDialog({
              vars: [
                Var('compId', pipeline('%path%', split('~', { part: 'last' })))
              ],
              title: 'delete %$compId%',
              content: group(),
              style: dialog.dialogOkCancel(),
              onOK: runActions(
                tgp.delete('%$compId%'),
                ctx => delete jb.studio.comps[ctx.vars.compId],
                refreshControlById('component-list')
              ),
              features: [
                css('z-index: 6000 !important'),
                nearLauncherPosition()
              ]
            }),
            style: button.x(),
            features: [
              field.columnWidth('20'),
              itemlist.shownOnlyOnItemHover(),
              field.columnWidth('40')
            ]
          })
        ],
        chapterHeadline: text(pipeline('%path%', split('~', { part: 'last' })), ''),
        style: tableTree.plain(false, '130', { expColWidth: '10' })
      })
    ],
    features: [
      css.padding('4', { right: '5' }),
      css.height('400', 'auto', { minMax: '' }),
      id('component-list')
    ]
  })
})

component('studio.cmpsOfProjectByFiles', {
  type: 'data',
  impl: dynamicObject(() => st.projectFiles(), '%%', {
    value: pipeline(
      Var('file', '%%'),
      () => st.projectCompsAsEntries(),
      filter(
        equals({
          item1: pipeline(
            ({data}) => jb.studio.previewjb.comps[data].$location.path,
            split('/', { part: 'last' })
          ),
          item2: '%$file%'
        })
      ),
      '%[0]%',
      aggregate(dynamicObject('%%', '%%', { value: '%%' }))
    )
  })
})