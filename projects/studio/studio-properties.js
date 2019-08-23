jb.component('studio.property-toolbar', { /* studio_propertyToolbar */
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: button({
    title: 'more...',
    action: {$: 'studio.open-property-menu', path: '%$path%', $recursive: true},
    style: studio_propertyToolbarStyle()
  })
})

jb.component('studio.property-toolbar-feature', { /* studio_propertyToolbarFeature */
  type: 'feature',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: list(
    field_toolbar(studio_propertyToolbar('%$path%')),
    studio_disabledSupport('%$path%')
  )
})


jb.component('studio.focus-on-first-property', { /* studio_focusOnFirstProperty */
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

jb.component('studio.open-source-dialog', { /* studio_openSourceDialog */
  type: 'action',
  impl: openDialog({
    style: dialog_dialogOkCancel(),
    content: {$: 'text', text: studio_compSource(), style: text_codemirror({})},
    title: 'Source',
    modal: true
  })
})

jb.component('studio.properties-in-tgp', { /* studio_propertiesInTgp */
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    style: propertySheet_studioPropertiesInTgp(),
    controls: dynamicControls({
      controlItems: studio_nonControlChildren('%$path%', true),
      genericControl: {$: 'studio.property-field', path: '%$controlItem%', $recursive: true}
    }),
    features: group_autoFocusOnFirstInput()
  })
})

jb.component('studio.property-script', { /* studio_propertyScript */
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    controls: button({
      title: (ctx,vars,{path}) => jb.prettyPrint(jb.studio.valOfPath(path)),
      action: {$: 'studio.open-jb-editor', path: '%$path%', $recursive: true},
      style: button_studioScript()
    }),
    features: studio_watchPath({path: '%$path%', includeChildren: true})
  })
})

jb.component('studio.property-boolean', { /* studio_propertyBoolean */
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: editableBoolean({
    databind: studio_ref('%$path%'),
    style: editableBoolean_mdlSlideToggle(),
    features: studio_watchPath({path: '%$path%', includeChildren: true})
  })
})

jb.component('studio.property-enum', { /* studio_propertyEnum */
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: picklist({
    databind: studio_ref('%$path%'),
    options: studio_enumOptions('%$path%'),
    style: picklist_nativeMdLook(),
    features: studio_watchPath({path: '%$path%', includeChildren: true})
  })
})

jb.component('studio.property-slider', { /* studio_propertySlider */
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: editableNumber({
    vars: [Var('paramDef', studio_paramDef('%$path%'))],
    databind: studio_ref('%$path%'),
    style: editableNumber_slider(),
    min: firstSucceeding('%$paramDef/min%', 0),
    max: firstSucceeding('%$paramDef/max%', 100),
    step: firstSucceeding('%$paramDef/step%', 1),
    features: [
      css(
        ">input-slider { width: 110px; }\n>.input-text { width: 20px; padding-right: 15px; margin-top: 2px; }"
      ),
      studio_watchPath({path: '%$path%', includeChildren: true})
    ]
  })
})

jb.component('studio.property-tgp', { /* studio_propertyTgp */
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: inlineControls(
    studio_pickProfile('%$path%'),
    studio_propertiesInTgp('%$path%')
  )
})

jb.component('studio.properties-expanded-relevant', { /* studio_propertiesExpandedRelevant */
  type: 'boolean',
  params: [
    {id: 'path', as: 'string', mandatory: true}
  ],
  impl: and(
    notEmpty(studio_nonControlChildren('%$path%')),
    notEmpty(studio_val('%$path%')),
    notEquals(studio_compName('%$path%'), 'custom-style')
  )
})

jb.component('studio.property-tgp-old', { /* studio_propertyTgpOld */
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    controls: [
      group({
        title: 'header',
        style: layout_horizontal(0),
        controls: [
          editableBoolean({
            databind: '%$userExpanded%',
            style: editableBoolean_expandCollapse(),
            features: [
              field_initValue(studio_isNew('%$path%')),
              hidden(studio_propertiesExpandedRelevant('%$path%')),
              css('{ position: absolute; margin-left: -20px; margin-top: 5px }')
            ]
          }),
          group({controls: studio_pickProfile('%$path%'), features: css_width(150)})
        ],
        features: [css('{ position: relative }'), studio_watchPath('%$path%')]
      }),
      group({
        title: 'inner',
        controls: studio_propertiesInTgp('%$path%'),
        features: [
          studio_watchPath('%$path%'),
          watchRef('%$userExpanded%'),
          feature_if('%$userExpanded%'),
          css('{ margin-top: 9px; margin-left: -83px; margin-bottom: 4px;}')
        ]
      })
    ],
    features: [variable({name: 'userExpanded', value: false, mutable: true})]
  })
})

jb.component('studio.property-tgp-in-array', { /* studio_propertyTgpInArray */
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    controls: [
      group({
        style: layout_flex('space-between'),
        controls: [
          editableBoolean({
            databind: '%$expanded%',
            style: editableBoolean_expandCollapse(),
            features: [css_padding('4')]
          }),
          label({
            title: pipeline(studio_compName('%$path%'), suffix('.', '%%')),
            style: label_htmlTag('p'),
            features: [css_width('100'), css_class('drag-handle'), css('{font-weight: bold}')]
          }),
          label({
            title: studio_summary('%$path%'),
            style: label_htmlTag('p'),
            features: [css_width('335'), studio_watchPath({path: '%$path%', includeChildren: true})]
          }),
          studio_propertyToolbar('%$path%')
        ],
        features: [studio_disabledSupport('%$path%')]
      }),
      group({
        controls: studio_propertiesInTgp('%$path%'),
        features: [
          feature_if('%$expanded%'),
          watchRef('%$expanded%'),
          css('{ margin-left: 10px; margin-bottom: 4px;}'),
          studio_disabledSupport('%$path%')
        ]
      })
    ],
    features: [
      css_margin({left: '-100'}),
      variable({name: 'expanded', value: studio_isNew('%$path%'), mutable: true}),
      studio_watchPath({path: '%$path%', includeChildren: true})
    ]
  })
})

jb.component('studio.property-array', { /* studio_propertyArray */
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: itemlist({
    items: studio_asArrayChildren('%$path%'),
    controls: group({
      style: propertySheet_studioPlain(),
      controls: studio_propertyTgpInArray('%$arrayItem%')
    }),
    itemVariable: 'arrayItem',
    features: [
      studio_watchPath({path: '%$path%', includeChildren: true, allowSelfRefresh: true}),
      itemlist_divider(),
      itemlist_dragAndDrop()
    ]
  })
})

jb.component('studio.property-field', { /* studio_propertyField */
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    title: studio_propName('%$path%'),
    controls: control_firstSucceeding({
      vars: [Var('paramDef', studio_paramDef('%$path%'))],
      controls: [
        controlWithCondition(
          and(
            studio_isOfType('%$path%', 'data,boolean'),
            not(isOfType('string,number,boolean,undefined', studio_val('%$path%')))
          ),
          studio_propertyScript('%$path%')
        ),
        controlWithCondition(
          and(studio_isOfType('%$path%', 'action'), isOfType('array', studio_val('%$path%'))),
          studio_propertyScript('%$path%')
        ),
        controlWithCondition('%$paramDef/options%', studio_propertyEnum('%$path%')),
        controlWithCondition('%$paramDef/as%==\"number\"', studio_propertySlider('%$path%')),
        controlWithCondition(
          and(
            '%$paramDef/as%==\"boolean\"',
            or(inGroup(list(true, false), studio_val('%$path%')), isEmpty(studio_val('%$path%'))),
            not('%$paramDef/dynamic%')
          ),
          studio_propertyBoolean('%$path%')
        ),
        controlWithCondition(studio_isOfType('%$path%', 'data,boolean'), studio_propertyPrimitive('%$path%')),
        studio_propertyTgpOld('%$path%')
      ],
      features: firstSucceeding_watchRefreshOnCtrlChange(studio_ref('%$path%'), true)
    }),
    features: [
      studio_propertyToolbarFeature('%$path%'),
      field_keyboardShortcut('Ctrl+I', {$: 'studio.open-jb-editor', path: '%$path%', $recursive: true})
    ]
  })
})

jb.component('studio.jb-floating-input-rich', { /* studio_jbFloatingInputRich */
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    controls: studio_propertyField('%$path%'),
    features: css('{padding: 20px}')
  })
})

jb.component('studio.properties', { /* studio_properties */
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    controls: [
      group({
        title: 'accordion',
        style: group_studioPropertiesAccordion(),
        controls: [
          group({
            remark: 'properties',
            title: pipeline(count(studio_nonControlChildren('%$path%')), 'Properties (%%)'),
            style: customStyle({
              template: (cmp,state,h) => h('table',{}, state.ctrls.map(ctrl=>
      h('tr',{ class: 'property' },[
          h('td',{ class: 'property-title', title: ctrl.title}, ctrl.title),
          h('td',{ class: 'property-ctrl'},h(ctrl)),
          h('td',{ class: 'property-toolbar'}, h(ctrl.jbComp.toolbar) ),
      ])
    )),
              css: "\n      { width: 100% }\n      >.property>.property-title { width: 90px; padding-right: 5px; padding-top: 5px;  font-weight: bold;}\n      >.property>td { vertical-align: top; }\n    ",
              features: group_initGroup()
            }),
            controls: [
              dynamicControls({
                controlItems: studio_nonControlChildren('%$path%'),
                genericControl: studio_propertyField('%$controlItem%')
              })
            ]
          }),
          group({
            remark: 'features',
            title: pipeline(count(studio_val('%$path%~features')), 'Features (%%)'),
            controls: studio_propertyArray('%$path%~features')
          })
        ],
        features: [
          group.dynamicTitles(),
          studio.watchPath({path: '%$path%~features', allowSelfRefresh: true}),
          hidden(
            remark('not a control'),
            studio_hasParam(remark('not a control'), '%$path%', 'features')
          )
        ]
      }),
      label({
        title: studio_profileAsMacroText('%$path%~features'),
        style: label_span(),
        features: [
          css_width('400'),
          css('{ white-space: nowrap; overflow: hidden; text-overflow: ellipsis}'),
          feature_hoverTitle('%%')
        ]
      }),
      button({
        title: 'new feature',
        action: studio_openNewProfileDialog({
          path: '%$path%~features',
          type: 'feature',
          onClose: runActions(ctx => ctx.vars.PropertiesDialog.openFeatureSection())
        }),
        style: button_href(),
        features: css_margin({top: '20', left: '5'})
      })
    ],
    features: variable({name: 'PropertiesDialog', value: {$: 'object'}, mutable: false})
  })
})

jb.component('studio.tgp-path-options', { /* studio_tgpPathOptions */
  type: 'picklist.options',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (context,path) =>
		[{code:'',text:''}]
			.concat(jb.studio.PTsOfPath(path).map(op=> ({ code: op, text: op})))
})

jb.component('studio.open-properties', { /* studio_openProperties */ 
  type: 'action',
  params: [
    {id: 'focus', type: 'boolean', as: 'boolean'}
  ],
  impl: openDialog({
    style: dialog_studioFloating({id: 'studio-properties', width: '500'}),
    content: studio_properties(studio_currentProfilePath()),
    title: pipeline(
      {
        $: 'object',
        title: studio_shortTitle(studio_currentProfilePath()),
        comp: studio_compName(studio_currentProfilePath())
      },
      'Properties of %comp% %title%'
    ),
    features: [
      {$if: '%$focus%', then: dialogFeature_autoFocusOnFirstInput()},
      dialogFeature_keyboardShortcut('Ctrl+Left', {$: 'studio.open-control-tree', $recursive: true}),
      dialogFeature_resizer()
    ]
  })
})

