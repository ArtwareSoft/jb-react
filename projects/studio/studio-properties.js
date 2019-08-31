jb.component('studio.property-toolbar', { /* studio.propertyToolbar */
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: button({
    title: 'more...',
    action: {$: 'studio.open-property-menu', path: '%$path%', $recursive: true},
    style: studio.propertyToolbarStyle()
  })
})

jb.component('studio.property-toolbar-feature', { /* studio.propertyToolbarFeature */
  type: 'feature',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: list(
    field.toolbar(studio.propertyToolbar('%$path%')),
    studio.disabledSupport('%$path%')
  )
})


jb.component('studio.focus-on-first-property', { /* studio.focusOnFirstProperty */
  type: 'action',
  params: [
    {id: 'delay', as: 'number', defaultValue: 100}
  ],
  impl: (ctx,delay) => {
    jb.delay(delay).then ( _=> {
    var elem =  Array.from(document.querySelectorAll('[dialogid="studio-properties"] input,textarea,select'))
      .filter(e => e.getAttribute('type') != 'checkbox')[0];
    elem && jb.ui.focus(elem,'studio.focus-on-first-property',ctx);
    })
  }
})

jb.component('studio.open-source-dialog', { /* studio.openSourceDialog */
  type: 'action',
  impl: openDialog({
    style: dialog.dialogOkCancel(),
    content: {$: 'text', text: studio.compSource(), style: text.codemirror({})},
    title: 'Source',
    modal: true
  })
})

jb.component('studio.properties-in-tgp', { /* studio.propertiesInTgp */
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    style: propertySheet.studioPropertiesInTgp(),
    controls: dynamicControls({
      controlItems: studio.nonControlChildren('%$path%', true),
      genericControl: {$: 'studio.property-field', path: '%$controlItem%', $recursive: true}
    }),
    features: group.autoFocusOnFirstInput()
  })
})

jb.component('studio.property-script', { /* studio.propertyScript */
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    controls: button({
      title: (ctx,vars,{path}) => jb.prettyPrint(jb.studio.valOfPath(path)),
      action: {$: 'studio.open-jb-editor', path: '%$path%', $recursive: true},
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
    style: editableBoolean.mdlSlideToggle(),
    features: studio.watchPath({path: '%$path%', includeChildren: 'yes'})
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
    style: picklist.nativeMdLook(),
    features: studio.watchPath({path: '%$path%', includeChildren: 'yes'})
  })
})

jb.component('studio.property-slider', { /* studio.propertySlider */
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: editableNumber({
    vars: [Var('paramDef', studio.paramDef('%$path%'))],
    databind: studio.ref('%$path%'),
    style: editableNumber.slider(),
    min: firstSucceeding('%$paramDef/min%', 0),
    max: firstSucceeding('%$paramDef/max%', 100),
    step: firstSucceeding('%$paramDef/step%', 1),
    features: [
      css(
        ">input-slider { width: 110px; }\n>.input-text { width: 20px; padding-right: 15px; margin-top: 2px; }"
      ),
      studio.watchPath({path: '%$path%', includeChildren: 'yes'})
    ]
  })
})

jb.component('studio.property-tgp', { /* studio.propertyTgp */
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: inlineControls(
    studio.pickProfile('%$path%'),
    studio.propertiesInTgp('%$path%')
  )
})

jb.component('studio.properties-expanded-relevant', { /* studio.propertiesExpandedRelevant */
  type: 'boolean',
  params: [
    {id: 'path', as: 'string', mandatory: true}
  ],
  impl: and(
    notEmpty(studio.nonControlChildren('%$path%')),
    notEmpty(studio.val('%$path%')),
    notEquals(studio.compName('%$path%'), 'custom-style')
  )
})

jb.component('studio.property-tgp-old', { /* studio.propertyTgpOld */
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    controls: [
      group({
        title: 'header',
        style: layout.horizontal(0),
        controls: [
          editableBoolean({
            databind: '%$userExpanded%',
            style: editableBoolean.expandCollapse(),
            features: [
              field.initValue(studio.isNew('%$path%')),
              hidden(studio.propertiesExpandedRelevant('%$path%')),
              css('{ position: absolute; margin-left: -20px; margin-top: 5px }')
            ]
          }),
          group({controls: studio.pickProfile('%$path%'), features: css.width(150)})
        ],
        features: [css('{ position: relative }'), studio.watchPath('%$path%')]
      }),
      group({
        title: 'inner',
        controls: studio.propertiesInTgp('%$path%'),
        features: [
          studio.watchPath('%$path%'),
          watchRef('%$userExpanded%'),
          feature.if('%$userExpanded%'),
          css('{ margin-top: 9px; margin-left: -83px; margin-bottom: 4px;}')
        ]
      })
    ],
    features: [variable({name: 'userExpanded', value: false, watchable: true})]
  })
})

jb.component('studio.property-tgp-in-array', { /* studio.propertyTgpInArray */
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    controls: [
      group({
        style: layout.flex('space-between'),
        controls: [
          editableBoolean({
            databind: '%$expanded%',
            style: editableBoolean.expandCollapse(),
            features: [css.padding('4')]
          }),
          label({
            title: pipeline(studio.compName('%$path%'), suffix('.', '%%')),
            style: label.htmlTag('p'),
            features: [css.width('100'), css.class('drag-handle'), css('{font-weight: bold}')]
          }),
          label({
            title: studio.summary('%$path%'),
            style: label.htmlTag('p'),
            features: [css.width('335'), studio.watchPath({path: '%$path%', includeChildren: 'yes'})]
          }),
          studio.propertyToolbar('%$path%')
        ],
        features: [studio.disabledSupport('%$path%')]
      }),
      group({
        controls: studio.propertiesInTgp('%$path%'),
        features: [
          feature.if('%$expanded%'),
          watchRef('%$expanded%'),
          css('{ margin-left: 10px; margin-bottom: 4px;}'),
          studio.disabledSupport('%$path%')
        ]
      })
    ],
    features: [
      css.margin({left: '-100'}),
      variable({name: 'expanded', value: studio.isNew('%$path%'), watchable: true}),
      studio.watchPath({path: '%$path%', includeChildren: 'yes'})
    ]
  })
})

jb.component('studio.property-array', { /* studio.propertyArray */
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: itemlist({
    items: studio.asArrayChildren('%$path%'),
    controls: group({
      style: propertySheet.studioPlain(),
      controls: studio.propertyTgpInArray('%$arrayItem%')
    }),
    itemVariable: 'arrayItem',
    features: [
      studio.watchPath({path: '%$path%', includeChildren: 'structure', allowSelfRefresh: true}),
      itemlist.divider(),
      itemlist.dragAndDrop()
    ]
  })
})

jb.component('studio.property-field', { /* studio.propertyField */
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    title: studio.propName('%$path%'),
    controls: control.firstSucceeding({
      vars: [Var('paramDef', studio.paramDef('%$path%'))],
      controls: [
        controlWithCondition(
          and(
            studio.isOfType('%$path%', 'data,boolean'),
            not(isOfType('string,number,boolean,undefined', studio.val('%$path%')))
          ),
          studio.propertyScript('%$path%')
        ),
        controlWithCondition(
          and(studio.isOfType('%$path%', 'action'), isOfType('array', studio.val('%$path%'))),
          studio.propertyScript('%$path%')
        ),
        controlWithCondition('%$paramDef/options%', studio.propertyEnum('%$path%')),
        controlWithCondition('%$paramDef/as%==\"number\"', studio.propertySlider('%$path%')),
        controlWithCondition(
          and(
            '%$paramDef/as%==\"boolean\"',
            or(inGroup(list(true, false), studio.val('%$path%')), isEmpty(studio.val('%$path%'))),
            not('%$paramDef/dynamic%')
          ),
          studio.propertyBoolean('%$path%')
        ),
        controlWithCondition(studio.isOfType('%$path%', 'data,boolean'), studio.propertyPrimitive('%$path%')),
        studio.propertyTgpOld('%$path%')
      ],
      features: firstSucceeding.watchRefreshOnCtrlChange(studio.ref('%$path%'), true)
    }),
    features: [
      studio.propertyToolbarFeature('%$path%'),
      field.keyboardShortcut('Ctrl+I', {$: 'studio.open-jb-editor', path: '%$path%', $recursive: true})
    ]
  })
})

jb.component('studio.jb-floating-input-rich', { /* studio.jbFloatingInputRich */
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    controls: studio.propertyField('%$path%'),
    features: css('{padding: 20px}')
  })
})

jb.component('studio.properties', { /* studio.properties */
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    controls: [
      group({
        title: 'accordion',
        style: group.studioPropertiesAccordion(),
        controls: [
          group({
            remark: 'properties',
            title: pipeline(count(studio.nonControlChildren('%$path%')), 'Properties (%%)'),
            style: customStyle({
              template: (cmp,state,h) => h('table',{}, state.ctrls.map(ctrl=>
      h('tr',{ class: 'property' },[
          h('td',{ class: 'property-title', title: ctrl.title}, ctrl.title),
          h('td',{ class: 'property-ctrl'},h(ctrl)),
          h('td',{ class: 'property-toolbar'}, h(ctrl.jbComp.toolbar) ),
      ])
    )),
              css: "\n      { width: 100% }\n      >.property>.property-title { width: 90px; padding-right: 5px; padding-top: 5px;  font-weight: bold;}\n      >.property>td { vertical-align: top; }\n    ",
              features: group.initGroup()
            }),
            controls: [
              dynamicControls({
                controlItems: studio.nonControlChildren('%$path%'),
                genericControl: studio.propertyField('%$controlItem%')
              })
            ]
          }),
          group({
            remark: 'features',
            title: pipeline(count(studio.val('%$path%~features')), 'Features (%%)'),
            controls: studio.propertyArray('%$path%~features')
          })
        ],
        features: [
          group.dynamicTitles(),
          studio.watchPath({path: '%$path%~features', allowSelfRefresh: true}),
          hidden(
            remark('not a control'),
            studio.hasParam(remark('not a control'), '%$path%', 'features')
          )
        ]
      }),
      label({
        title: studio.profileAsMacroText('%$path%~features'),
        style: label.span(),
        features: [
          css.width('400'),
          css('{ white-space: nowrap; overflow: hidden; text-overflow: ellipsis}'),
          feature.hoverTitle('%%')
        ]
      }),
      button({
        title: 'new feature',
        action: studio.openNewProfileDialog({
          path: '%$path%~features',
          type: 'feature',
          onClose: runActions(ctx => ctx.vars.PropertiesDialog.openFeatureSection())
        }),
        style: button.href(),
        features: css.margin({top: '20', left: '5'})
      })
    ],
    features: variable({name: 'PropertiesDialog', value: {$: 'object'}, watchable: false})
  })
})

jb.component('studio.tgp-path-options', { /* studio.tgpPathOptions */
  type: 'picklist.options',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (context,path) =>
		[{code:'',text:''}]
			.concat(jb.studio.PTsOfPath(path).map(op=> ({ code: op, text: op})))
})

jb.component('studio.open-properties', { /* studio.openProperties */ 
  type: 'action',
  params: [
    {id: 'focus', type: 'boolean', as: 'boolean'}
  ],
  impl: openDialog({
    style: dialog.studioFloating({id: 'studio-properties', width: '500'}),
    content: studio.properties(studio.currentProfilePath()),
    title: pipeline(
      {
        $: 'object',
        title: studio.shortTitle(studio.currentProfilePath()),
        comp: studio.compName(studio.currentProfilePath())
      },
      'Properties of %comp% %title%'
    ),
    features: [
      {$if: '%$focus%', then: dialogFeature.autoFocusOnFirstInput()},
      dialogFeature.keyboardShortcut('Ctrl+Left', {$: 'studio.open-control-tree', $recursive: true}),
      dialogFeature.resizer()
    ]
  })
})

