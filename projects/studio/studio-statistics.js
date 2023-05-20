
component('studio.gotoReferencesOptions', {
  type: 'menu.option',
  params: [
    {id: 'path', as: 'string'},
    {id: 'refs', as: 'array'}
  ],
  impl: menu.dynamicOptions(
    '%$refs%',
      If('%refs/length% > 1',
      menu.menu({
        title: '%id% (%refs/length%)',
        options: menu.dynamicOptions(
          '%$menuData/refs%',
          menu.action({
            title: '%%',
            action: studio.openComponentInJbEditor('%%', '%$path%')
          })
        )
      }),
      menu.action({
        vars: [Var('compName', split({separator: '~', text: '%refs[0]%', part: 'first'}))],
        title: '%$compName%',
        action: studio.openComponentInJbEditor('%refs[0]%', '%$path%')
      }))
  )
})

component('studio.gotoReferencesButton', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: controlWithCondition(
    Var('refs', tgp.references('%$path%')),
    Var(
        'noOfReferences',
        ctx => ctx.vars.refs.reduce((total,refsInObj)=>total+refsInObj.refs.length,0)
      ),
    '%$refs/length%',
    button({
      title: '%$noOfReferences% references',
      action: menu.openContextMenu({
        menu: menu.menu({options: studio.gotoReferencesOptions('%$path%', '%$refs%')})
      })
    })
  )
})

component('studio.gotoReferencesMenu', {
  type: 'menu.option',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: If({
    condition: '%$noOfReferences% > 0',
    vars: [
      Var('refs', tgp.references('%$path%')),
      Var('noOfReferences', ctx => ctx.vars.refs.reduce((total,refsInObj)=>total+refsInObj.refs.length,0))
    ],
    then: menu.menu({
      title: '%$noOfReferences% references for %$path%',
      options: studio.gotoReferencesOptions('%$path%', '%$refs%')
    }),
    Else: menu.action('no references for %$path%')
  })
})

component('studio.componentsList', {
  type: 'control',
  impl: group({
    controls: [
      tableTree({
        treeModel: tree.jsonReadOnly(studio.cmpsOfProjectByFiles(), ''),
        leafFields: [
          text({
            text: pipeline(tgp.componentStatistics('%val%'), '%size%'),
            title: 'size',
            features: [field.columnWidth('80')]
          }),
          button({
            title: pipeline(tgp.componentStatistics('%val%'), '%refCount%.', split('.')),
            action: menu.openContextMenu({
              menu: menu.menu({
                options: [studio.gotoReferencesOptions('%val%', tgp.references('%val%'))]
              })
            }),
            style: button.href(),
            features: [field.title('refs'), field.columnWidth('40')]
          }),
          button({
            title: 'delete',
            action: openDialog({
              vars: [Var('compId', pipeline('%path%', split({separator: '~', part: 'last'})))],
              style: dialog.dialogOkCancel(),
              content: group({}),
              title: 'delete %$compId%',
              onOK: runActions(
                tgp.delete('%$compId%'),
                ctx => delete jb.studio.comps[ctx.vars.compId],
                refreshControlById('component-list')
              ),
              features: [css('z-index: 6000 !important'), dialogFeature.nearLauncherPosition({})]
            }),
            style: button.x(),
            features: [
              field.columnWidth('20'),
              itemlist.shownOnlyOnItemHover(),
              field.columnWidth('40')
            ]
          })
        ],
        chapterHeadline: text({
          text: pipeline('%path%', split({separator: '~', part: 'last'})),
          title: ''
        }),
        style: tableTree.plain({hideHeaders: false, gapWidth: '130', expColWidth: '10'})
      })
    ],
    features: [
      css.padding({top: '4', right: '5'}),
      css.height({height: '400', overflow: 'auto', minMax: ''}),
      id('component-list')
    ]
  })
})

component('studio.cmpsOfProjectByFiles', {
  type: 'data',
  impl: dynamicObject({
    items: () => st.projectFiles(),
    propertyName: '%%',
    value: pipeline(
      Var('file', '%%'),
      () => st.projectCompsAsEntries(),
      filter(
          equals(
            pipeline(
              ({data}) => jb.studio.previewjb.comps[data][jb.core.CT].location[0],
              split({separator: '/', part: 'last'})
            ),
            '%$file%'
          )
        ),
      '%[0]%',
      aggregate(dynamicObject({items: '%%', propertyName: '%%', value: '%%'}))
    )
  })
})