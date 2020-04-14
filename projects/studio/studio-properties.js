jb.component('studio.openProperties', {
  type: 'action',
  params: [
    {id: 'focus', type: 'boolean', as: 'boolean'},
    {id: 'innerPath', as: 'string'},
  ],
  impl: runActions(
    Var('path', studio.currentProfilePath()),
    action.if(
        studio.compName('%$path%'),
        openDialog({
          style: dialog.studioFloating({id: 'studio-properties', width: '500'}),
          content: studio.properties({path: '%$path%', innerPath: '%$innerPath%', focus: '%$focus%'}),
          title: pipeline(
            {
                '$': 'object',
                title: studio.shortTitle('%$path%'),
                comp: studio.compName('%$path%')
              },
            If(equals('%comp%', '%title%'), '%comp%', '%comp% %title%'),
            'Properties of %%'
          ),
          features: [
            feature.keyboardShortcut('Ctrl+Left', studio.openControlTree()),
            dialogFeature.resizer()
          ]
        })
      )
  )
})


jb.component('studio.properties', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'},
    {id: 'innerPath', as: 'string'},
    {id: 'focus', as: 'boolean'}
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
        chapterHeadline: text({
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
          css(
            `>tbody>tr>td.headline { vertical-align: inherit; margin-bottom: 7px; }
            >tbody>tr>td>span>i { margin-bottom: 8px }`
          ),
          studio.watchPath({
            path: '%$path%',
            includeChildren: 'structure',
            allowSelfRefresh: true
          }),
          tableTree.expandPath(studio.lastEdit()),
          tableTree.expandPath('%$innerPath%')
        ]
      }),
      group({
        title: '',
        layout: layout.flex({justifyContent: 'flex-end', alignItems: 'flex-end', spacing: '7'}),
        controls: [
          button({
            title: 'new feature',
            action: studio.openNewProfileDialog({path: '%$path%~features', type: 'feature'}),
            style: button.href(),
            features: [
              feature.if(studio.isOfType('%$path%~features', 'feature')),
              css.margin({top: '20', left: '5'})
            ]
          }),
          button({
            title: 'new icon',
            action: studio.getOrCreateCompInArray('%$path%~features', 'feature.icon'),
            style: button.mdcIcon(undefined, '24'),
            features: feature.icon({icon: 'Creation', type: 'mdi', size: '16'})
          }),
          button({
            title: 'new css',
            action: studio.getOrCreateCompInArray('%$path%~features', 'css'),
            style: button.mdcIcon(undefined, '24'),
            features: feature.icon({icon: 'LanguageCss3', type: 'mdi', size: '16'})
          }),
          button({
            title: 'size, padding & margin',
            action: studio.openSizesEditor('%$path%'),
            style: button.mdcIcon(undefined, '24'),
            features: feature.icon({icon: 'business', type: 'mdc', size: '16'})
          })
        ]
      })
    ],
    features: feature.byCondition(
      or('%$focus%', studio.lastEdit()),
      group.autoFocusOnFirstInput()
    )
  })
})

jb.component('studio.propField', {
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
            inGroup(list('feature.icon','icon'),studio.compName(studio.parentPath('%$path%'))),
            equals('icon',pipeline(studio.paramDef('%$path%'), '%id%'))
          ),
          studio.pickIcon('%$path%')
        ),
        controlWithCondition(
          inGroup(
            split({text: 'width,height,top,left,right,bottom,spacing,blurRadius,spreadRadius,horizontal,vertical,radius'}),
            pipeline(studio.paramDef('%$path%'), '%id%')
          ),
          studio.propertyNumbericCss('%$path%')
        ),
        controlWithCondition(
          inGroup(
            split({text: 'opacity'}),
            pipeline(studio.paramDef('%$path%'), '%id%')
          ),
          studio.propertyNumbericZeroToOne('%$path%')
        ),
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
          or(
            '%$expanded%',
            isEmpty('%$val%'),
            not(studio.isOfType('%$path%', 'data,boolean'))
          ),
          studio.pickProfile('%$path%')
        ),
        studio.propertyScript('%$path%')
      ],
      features: [
        group.firstSucceeding(),
        studio.watchPath({path: '%$path%', includeChildren: 'yes', recalcVars: true}),
        variable({name: 'paramDef', value: studio.paramDef('%$path%')}),
        variable({name: 'val', value: studio.val('%$path%')})
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

jb.component('studio.propertyToolbar', {
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

jb.component('studio.propertyToolbarFeature', {
  type: 'feature',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: features(
    field.toolbar(studio.propertyToolbar('%$path%')),
    studio.disabledSupport('%$path%')
  )
})

jb.component('studio.propertyScript', {
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

jb.component('studio.propertyNumbericCss', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: editableNumber({
    databind: studio.ref('%$path%'),
    style: editableNumber.slider(),
    max: 20,
    features: css('~ .text-input {width: 40px} ~ .slider-input { width: 100% }')
  })
})

jb.component('studio.propertyNumbericZeroToOne', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: editableNumber({
    databind: studio.ref('%$path%'),
    style: editableNumber.slider(),
    step: 0.1,
    max: 1,
    features: css('~ .text-input {width: 40px} ~ .slider-input { width: 100% }')
  })
})

jb.component('studio.propertyBoolean', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: editableBoolean({
    databind: studio.ref('%$path%'),
    style: editableBoolean.mdcSlideToggle(),
    features: css('{flex-direction: row;     display: flex;} ~ label {padding-left: 10px }')
  })
})

jb.component('studio.propertyEnum', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: picklist({
    databind: studio.ref('%$path%'),
    options: studio.enumOptions('%$path%'),
    style: picklist.nativeMdLookOpen(),
    features: [
      css.width({width: '100', minMax: 'min'}),
      css('~ input {font-size: 1.2rem; border-bottom-color: black }')
    ]
  })
})

jb.component('studio.jbFloatingInputRich', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    controls: studio.propField('%$path%'),
    features: css('{padding: 20px}')
  })
})

