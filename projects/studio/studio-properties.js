jb.component('studio.properties', { /* studio.properties */
  type: 'control',
  params: [
    {id: 'path', as: 'string'},
    {id: 'focus', type: 'boolean', as: 'boolean'}
  ],
  impl: group({
    controls: [
      tableTree({
        treeModel: (ctx,{},{path}) => new jb.studio.PropertiesTree(path),
        commonFields: [
          group({
            controls: studio.propField('%path%', '%expanded%'),
            features: [field.columnWidth('300')]
          }),
          group({
            controls: studio.propertyToolbar('%path%'),
            features: [field.columnWidth('20'), css('{ text-align: right }')]
          })
        ],
        chapterHeadline: label({
          text: ({data}) => {
            const path = data.path
            const prop = path.split('~').pop()
            if (Array.isArray(jb.studio.valOfPath(path)))
              return `${prop} (${jb.studio.valOfPath(path).length})`
            if (isNaN(Number(prop)))
              return prop
            return Number(prop) + 1
          },
          features: [feature.hoverTitle(pipeline(studio.paramDef('%path%'), '%description%'))]
        }),
        style: tableTree.plain({hideHeaders: true, gapWidth: 100, noItemsCtrl: text('')}),
        features: [
          css(`>tbody>tr>td.headline { vertical-align: inherit; margin-bottom: 7px; }
            >tbody>tr>td>span>i { margin-bottom: 8px }`),
          studio.watchPath({
          path: '%$path%',
          includeChildren: 'structure',
          allowSelfRefresh: true
        })
      ]
      }),
      button({
        title: 'new feature',
        action: studio.openNewProfileDialog({path: '%$path%~features', type: 'feature'}),
        style: button.href(),
        features: [
          feature.if(studio.isOfType('%$path%~features', 'feature')),
          css.margin({top: '20', left: '5'})
        ]
      })
    ],
    features: feature.byCondition(
      or('%$focus%', studio.lastEdit()),
      group.autoFocusOnFirstInput()
    )
  })
})

jb.component('studio.prop-field', { /* studio.propField */
  type: 'control',
  params: [
    {id: 'path', as: 'string'},
    {id: 'expanded', as: 'boolean', type: 'boolean'}
  ],
  impl: group({
    title: studio.propName('%$path%'),
    controls: group({
      controls: [
        controlWithCondition(
          and(
            studio.isOfType('%$path%', 'data,boolean'),
            not(isOfType('string,number,boolean,undefined', '%$val%'))
          ),
          studio.propertyScript('%$path%')
        ),
        controlWithCondition(
          and(studio.isOfType('%$path%', 'action'), isOfType('array', '%$val%')),
          studio.propertyScript('%$path%')
        ),
        controlWithCondition('%$paramDef/options%', studio.propertyEnum('%$path%')),
        controlWithCondition(
          and(
            '%$paramDef/as%==\"boolean\"',
            or(inGroup(list(true, false), '%$val%'), isEmpty('%$val%')),
            not('%$paramDef/dynamic%')
          ),
          studio.propertyBoolean('%$path%')
        ),
        controlWithCondition(
          studio.isOfType('%$path%', 'data,boolean'),
          studio.propertyPrimitive('%$path%')
        ),
        controlWithCondition(
          or('%$expanded%', isEmpty('%$val%'), not(studio.isOfType('%$path%', 'data,boolean'))),
          studio.pickProfile('%$path%')
        ),
        studio.propertyScript('%$path%')
      ],
      features: [
        group.firstSucceeding(),
        studio.watchPath({ path: '%$path%', includeChildren: 'yes', recalcVars: true }),
        variable('paramDef', studio.paramDef('%$path%')),
        variable('val', studio.val('%$path%'))
      ]
    }),
    features: [
      studio.propertyToolbarFeature('%$path%'),
      field.keyboardShortcut('Ctrl+I', studio.openJbEditor('%$path%')),
      If(
        not(isOfType('string,number,boolean,undefined', studio.val('%$path%'))),
        studio.watchPath({
          path: '%$path%',
          includeChildren: 'structure',
          allowSelfRefresh: true
        })
      )
    ]
  })
})

jb.component('studio.property-toolbar', { /* studio.propertyToolbar */
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: button({
    title: 'more...',
    action: studio.openPropertyMenu('%$path%'),
    style: studio.propertyToolbarStyle()
  })
})

jb.component('studio.property-toolbar-feature', { /* studio.propertyToolbarFeature */
  type: 'feature',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: features(
    field.toolbar(studio.propertyToolbar('%$path%')),
    studio.disabledSupport('%$path%')
  )
})

jb.component('studio.property-script', { /* studio.propertyScript */
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    controls: button({
      title: prettyPrint(studio.val('%$path%'), true),
      action: studio.openJbEditor('%$path%'),
      style: button.studioScript()
    }),
    features: studio.watchPath({path: '%$path%', includeChildren: 'yes'})
  })
})

jb.component('studio.property-boolean', { /* studio.propertyBoolean */
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: editableBoolean({
    databind: studio.ref('%$path%'),
    style: editableBoolean.mdcSlideToggle(),
  })
})

jb.component('studio.property-enum', { /* studio.propertyEnum */
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: picklist({
    databind: studio.ref('%$path%'),
    options: studio.enumOptions('%$path%'),
    style: picklist.nativeMdLookOpen(),
    features: css.width({width: '100', minMax: 'min'})
  })
})

jb.component('studio.jb-floating-input-rich', { /* studio.jbFloatingInputRich */
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    controls: studio.propField('%$path%'),
    features: css('{padding: 20px}')
  })
})

jb.component('studio.open-properties', { /* studio.openProperties */
  type: 'action',
  params: [
    {id: 'focus', type: 'boolean', as: 'boolean'}
  ],
  impl: openDialog({
    style: dialog.studioFloating({id: 'studio-properties', width: '500'}),
    content: studio.properties(studio.currentProfilePath(),'%$focus%'),
    title: pipeline(
      {
          '$': 'object',
          title: studio.shortTitle(studio.currentProfilePath()),
          comp: studio.compName(studio.currentProfilePath())
        },
      'Properties of %comp% %title%'
    ),
    features: [
      feature.keyboardShortcut('Ctrl+Left', studio.openControlTree()),
      dialogFeature.resizer()
    ]
  })
})

