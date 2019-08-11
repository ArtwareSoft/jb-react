(function() {
  const {pipeline, pipe, join, list, writeValue, contains, equals, and, not, or, assign, prop, assignWithIndex, object, obj, $if, count, notEmpty, isEmpty,
    notEquals, isOfType, inGroup} = jb.macros
  const {css, group,editableBoolean,label,hidden,watchRef,feature_if,id,uiAction_click, editableBoolean_expandCollapse, control_firstSucceeding, controlWithCondition,
    layout_horizontal,field_initValue, css_width} = jb.macros
  const {studio_nonControlChildren, studio_propName, studio_paramType, studio_paramDef, studio_val, studio_compName, studio_isNew, 
    studio_watchPath, studio_pickProfile, studio_isOfType } = jb.macros  

jb.component('studio.open-properties', {
  type: 'action',
  params: [{ id: 'focus', type: 'boolean', as: 'boolean' }],
  impl :{$: 'open-dialog',
    style :{$: 'dialog.studio-floating', id: 'studio-properties', width: '500' },
    content :{$: 'studio.properties',
      path :{$: 'studio.currentProfilePath' }
    },
    title :{
      $pipeline: [
        {$: 'object',
          title :{$: 'studio.short-title',
            path :{$: 'studio.currentProfilePath' }
          },
          comp :{$: 'studio.comp-name',
            path :{$: 'studio.currentProfilePath' }
          }
        },
        'Properties of %comp% %title%'
      ]
    },
    features: [
      {
        $if: '%$focus%',
        then :{$: 'dialog-feature.auto-focus-on-first-input' }
      },
      {$: 'dialog-feature.keyboard-shortcut',
        shortcut: 'Ctrl+Left',
        action :{$: 'studio.open-control-tree' }
      },
      {$: 'dialog-feature.resizer' }, 
    ]
  }
})

jb.component('studio.focus-on-first-property', {
  type: 'action',
  params: [{ id: 'delay', as: 'number', defaultValue: 100 }],
  impl: (ctx,delay) => {
    jb.delay(delay).then ( _=> {
    var elem =  Array.from(document.querySelectorAll('[dialogid="studio-properties"] input,textarea,select'))
      .filter(e => e.getAttribute('type') != 'checkbox')[0];
    elem && jb.ui.focus(elem,'studio.focus-on-first-property',ctx);
    })
  }
})

jb.component('studio.open-source-dialog', {
	type: 'action',
	impl :{$: 'open-dialog',
			modal: true,
			title: 'Source',
        	style :{$: 'dialog.dialog-ok-cancel' },
			content :{$: 'text',
				text :{$: 'studio.comp-source'},
				style:{$: 'text.codemirror'}
			},
		}
})

jb.component('studio.properties', {
  type: 'control', 
  params: [{ id: 'path', as: 'string' }], 
  impl :{$: 'group', 
    controls: [
      {$: 'group', 
        title: 'accordion', 
        style :{$: 'group.studio-properties-accordion' }, 
        controls: [
          {$: 'group', 
            remark: 'properties', 
            title :{
              $pipeline: [
                {$: 'count', 
                  items :{$: 'studio.non-control-children', path: '%$path%' }
                }, 
                'Properties (%%)'
              ], 
            }, 
            style :{$: 'custom-style', 
              template: (cmp,state,h) => h('table',{}, state.ctrls.map(ctrl=>
      h('tr',{ class: 'property' },[
          h('td',{ class: 'property-title', title: ctrl.title}, ctrl.title),
          h('td',{ class: 'property-ctrl'},h(ctrl)),
          h('td',{ class: 'property-toolbar'}, h(ctrl.jbComp.toolbar) ),
      ])
    )), 
              css: `
      { width: 100% }
      >.property>.property-title { width: 90px; padding-right: 5px; padding-top: 5px;  font-weight: bold;}
      >.property>td { vertical-align: top; }
    `, 
              features :{$: 'group.init-group' }
            }, 
            controls: [
              {$: 'dynamic-controls', 
                controlItems :{$: 'studio.non-control-children', path: '%$path%' }, 
                genericControl :{$: 'studio.property-field', path: '%$controlItem%' }
              }
            ]
          }, 
          {$: 'group', 
            remark: 'features', 
            title :{
              $pipeline: [
                {$: 'count', 
                  items :{$: 'studio.val', path: '%$path%~features' }
                }, 
                'Features (%%)'
              ]
            }, 
            controls :{$: 'studio.property-array', path: '%$path%~features' }
          }
        ], 
        features: [
          {$: 'group.dynamic-titles' }, 
          {$: 'studio.watch-path', path: '%$path%~features' }, 
          {$: 'hidden', 
            showCondition :{$: 'studio.has-param', remark: 'not a control', path: '%$path%', param: 'features' }
          }
        ]
      }, 
      {$: 'button', 
        title: 'new feature', 
        action :{$: 'studio.open-new-profile-dialog', 
          path: '%$path%~features', 
          type: 'feature', 
          onClose :{ $runActions: [ctx => ctx.vars.PropertiesDialog.openFeatureSection()] }
        }, 
        style :{$: 'button.href' }, 
        features :{$: 'css.margin', top: '20', left: '5' }
      }
    ], 
    features :{$: 'var', 
      name: 'PropertiesDialog', 
      value :{$: 'object' }, 
      mutable: false
    }
  }
})

jb.component('studio.properties-in-tgp',{
  type: 'control',
  params: [ {id: 'path', as: 'string' } ],
  impl :{$: 'group',
    style :{$: 'property-sheet.studio-properties-in-tgp'},
    controls :{$: 'dynamic-controls',
        controlItems :{$: 'studio.non-control-children', path: '%$path%', includeFeatures: true },
        genericControl :{$: 'studio.property-field', path: '%$controlItem%' }
    },
    features:{$: 'group.auto-focus-on-first-input'}
  }
})

jb.component('studio.property-field', {
  type: 'control', 
  params: [{ id: 'path', as: 'string' }], 
  impl: group({
    title: studio_propName('%$path%'), 
    controls: control_firstSucceeding({
      $vars: {
        paramType: studio_paramType('%$path%'), 
        paramDef: studio_paramDef('%$path%'),
        fieldValue: studio_val('%$path%'),
        hasPrimitiveValue: isOfType('string,number,boolean,undefined',studio_val('%$path%')),
      }, 
      controls: [
          controlWithCondition(
            and(
              studio_isOfType('%$path%','data,boolean'),
              not('%$hasPrimitiveValue%')
            ),
            {$: 'studio.property-script', path: '%$path%' }
          ),
          controlWithCondition(
            and(
              studio_isOfType('%$path%','action'),
              isOfType('array','%$fieldValue%')
            ),
            {$: 'studio.property-script', path: '%$path%' }
          ),
          controlWithCondition('%$paramDef/options%',{$: 'studio.property-enum', path: '%$path%' }),
          controlWithCondition('%$paramDef/as%==\"number\"', {$: 'studio.property-slider', path: '%$path%' }),
          controlWithCondition(
            and(
              '%$paramDef/as%==\"boolean\"',
              or(
                inGroup(list('true,false'),'%$fieldValue%'),
                isEmpty('%$fieldValue%')
              ),
              not('%$paramDef/dynamic%')
            ),
            {$: 'studio.property-boolean', path: '%$path%' }
          ),
          controlWithCondition(
            and(
              studio_isOfType('%$path%','data'),
              '%$hasPrimitiveValue%',
            ),
            {$: 'studio.property-primitive', path: '%$path%' }
          ),
          {$: 'studio.property-tgp-old', path: '%$path%' }
        ], 
//        features: {$: 'studio.watch-path', path: '%$path%', includeChildren: true }
      }),
      features: [
        {$: 'studio.property-toolbar-feature', path: '%$path%' }, 
      ]
    })
})

jb.component('studio.property-script', {
  type: 'control',
  params: [
    { id: 'path', as: 'string' }
  ],
  impl :{$: 'group',
    controls :{$: 'button',
        title :{$: 'studio.data-script-summary', path: '%$path%' },
        action :{$: 'studio.open-jb-editor',path: '%$path%' } ,
        style :{$: 'button.studio-script'}
    },
    features: {$: 'studio.watch-path', path: '%$path%', includeChildren: true }
  }
})

// jb.component('studio.property-js-script', {
//   type: 'control',
//   params: [
//     { id: 'path', as: 'string' }
//   ],
//   impl :{$: 'group',
//     controls :{$: 'button',
//         title :{$: 'studio.js-script-summary', path: '%$path%' },
//         action :{$: 'studio.open-js-editor',path: '%$path%' } ,
//         style :{$: 'button.studio-script'}
//     }
//   }
// })

jb.component('studio.data-script-summary', {
  type: 'data',
  params: [
    { id: 'path', as: 'string' }
  ],
  impl: (ctx,path) => 
    jb.prettyPrint(jb.studio.valOfPath(path))
})

jb.component('studio.property-boolean', {
  type: 'control',
  params: [{ id: 'path', as: 'string' }],
  impl :{$: 'editable-boolean',
    databind :{$: 'studio.ref', path: '%$path%' },
    style :{$: 'editable-boolean.mdl-slide-toggle' },
    features: {$: 'studio.watch-path', path: '%$path%', includeChildren: true }  
  }
})

jb.component('studio.property-enum', {
  type: 'control',
  params: [{ id: 'path', as: 'string' }],
  impl :{$: 'picklist',
    databind :{$: 'studio.ref', path: '%$path%' },
    options :{$: 'studio.enum-options', path: '%$path%' },
    style :{$: 'picklist.native-md-look' },
    features: {$: 'studio.watch-path', path: '%$path%', includeChildren: true }
  }
})

jb.component('studio.property-slider', {
  type: 'control',
  params: [{ id: 'path', as: 'string' }],
  impl :{$: 'editable-number',
    $vars: {
      paramDef :{$: 'studio.param-def', path: '%$path%' }
    },
    databind :{$: 'studio.ref', path: '%$path%' },
    style :{$: 'editable-number.slider', width: '120' },
    min :{ $firstSucceeding: ['%$paramDef/min%', 0] },
    max :{ $firstSucceeding: ['%$paramDef/max%', 100] },
    step :{ $firstSucceeding: ['%$paramDef/step%', 1] },
    features :[{$: 'css',
      width: '212',
      css: `>input-slider { width: 110px; }
>.input-text { width: 20px; padding-right: 15px; margin-top: 2px; }`
    },
    {$: 'studio.watch-path', path: '%$path%', includeChildren: true }
  ]
  }
})

jb.component('studio.property-tgp', {
  type: 'control',
  params: [{ id: 'path', as: 'string' }],
  impl :{$: 'inline-controls', 
  controls: [
    {$: 'studio.pick-profile', path: '%$path%' }, 
    {$: 'label', title: 'aa'},
    {$: 'studio.properties-in-tgp', path: '%$path%' }
  ],
  features: {$: 'studio.watch-path', path: '%$path%', includeChildren: true }
 }
})

jb.component('studio.property-tgp-old', {
  type: 'control',
  params: [{ id: 'path', as: 'string' }],
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
              hidden({$: 'studio.properties-expanded-relevant' ,path: '%$path%'}),
              css('{ position: absolute; margin-left: -20px; margin-top: 5px }'),
            ]
          }),
          group({
            controls: studio_pickProfile('%$path%'),
            features: css_width(150)
          })
        ],
        features: [
          css('{ position: relative }'),
          studio_watchPath('%$path%'),
        ]
      }),
      group({
        title: 'inner',
        controls: {$: 'studio.properties-in-tgp', path: '%$path%' },
        features: [
          studio_watchPath('%$path%'),
          watchRef('%$userExpanded%'),
          feature_if('%$userExpanded%'),
          css('{ margin-top: 9px; margin-left: -83px; margin-bottom: 4px;}')
        ]
      })
    ],
    features: [
      {$: 'var', name: 'userExpanded', value : false, mutable: true },
    ]
  })
})

jb.component('studio.properties-expanded-relevant', {
	type: 'boolean',
	params: [{ id: 'path', as: 'string', mandatory: true }],
	impl: and(
      notEmpty(studio_nonControlChildren('%$path%')),
      notEmpty(studio_val('%$path%')),
      notEquals(studio_compName('%$path%'),'custom-style')
  )
})

jb.component('studio.property-tgp-in-array', {
  type: 'control', 
  params: [{ id: 'path', as: 'string' }], 
  impl :{$: 'group', 
    controls: [
      {$: 'group', 
        style :{$: 'layout.flex', align: 'space-between' }, 
        controls: [
          {$: 'editable-boolean', 
            databind: '%$expanded%', 
            style :{$: 'editable-boolean.expand-collapse' }, 
            features: [{$: 'css.padding', top: '4' }]
          }, 
          {$: 'label', 
            title :{$: 'pipeline', 
              items: [
                {$: 'studio.comp-name', path: '%$path%' }, 
                {$: 'suffix', separator: '.', text: '%%' }
              ]
            }, 
            style :{$: 'label.p' }, 
            features: [
              {$: 'css.width', width: '100' }, 
              {$: 'css.class', class: 'drag-handle' }, 
              {$: 'css', css: '{font-weight: bold}' }
            ]
          }, 
          {$: 'label', 
            title :{$: 'studio.summary', path: '%$path%' }, 
            style :{$: 'label.p' }, 
            features: [
              {$: 'css.width', width: '335' }, 
              {$: 'studio.watch-path', path: '%$path%', includeChildren: true }
            ]
          }, 
          {$: 'studio.property-toolbar', 
            features :{$: 'css', css: '{ position: absolute; left: 20px }' }, 
            path: '%$path%'
          }
        ], 
        features: [{$: 'studio.disabled-support', path: '%$path%' }]
      }, 
      {$: 'group', 
        controls :{$: 'studio.properties-in-tgp', path: '%$path%' }, 
        features: [
          {$: 'feature.if', showCondition: '%$expanded%' }, 
          {$: 'watch-ref', ref: '%$expanded%' }, 
          {$: 'css', css: '{ margin-left: 10px; margin-bottom: 4px;}' }, 
          {$: 'studio.disabled-support', path: '%$path%' }
        ]
      }
    ], 
    features: [
      {$: 'css.margin', left: '-100' }, 
      {$: 'var', 
        name: 'expanded', 
        value :{$: 'studio.is-new', path: '%$path%' }, 
        mutable: true
      }, 
      {$: 'studio.watch-path', path: '%$path%', includeChildren: true }
    ]
  }
})

jb.component('studio.property-array', {
  type: 'control',
  params: [{ id: 'path', as: 'string' }],
  impl :{$: 'group',
    style :{$: 'layout.vertical', spacing: '7' },
    controls: [
      {$: 'group',
        title: 'items',
        controls: [
          {$: 'itemlist',
            items :{$: 'studio.as-array-children', path: '%$path%' },
            controls :{$: 'group',
              style :{$: 'property-sheet.studio-plain' },
              controls :{$: 'studio.property-tgp-in-array', path: '%$arrayItem%' }
            },
            itemVariable: 'arrayItem',
            features: [
              {$: 'studio.watch-path', path: '%$path%', },
              {$: 'itemlist.divider' },
              {$: 'itemlist.drag-and-drop' }
            ]
          }
        ],
        features: {$: 'studio.watch-path', path: '%$path%', includeChildren: true }
      },
      // {$: 'button',
      //   title: 'new feature',
      //   action :{$: 'studio.open-new-profile-dialog', type: 'feature', path: '%$path%' },
      //   style :{$: 'button.href' },
      //   features :{$: 'css.margin', top: '20', left: '20' }
      // }
    ],
  }
})


jb.component('studio.tgp-path-options',{
	type: 'picklist.options',
	params: [
		{ id: 'path', as: 'string' },
	],
	impl: (context,path) =>
		[{code:'',text:''}]
			.concat(jb.studio.PTsOfPath(path).map(op=> ({ code: op, text: op})))
})

})()