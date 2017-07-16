
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
      }
    ]
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
              ]
            },
            style :{$: 'property-sheet.studio-properties' },
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
          {$: 'hidden',
            showCondition :{$: 'studio.has-param',
              remark: 'not a control',
              path: '%$path%',
              param: 'features'
            }
          }
        ]
      },
      {$: 'button',
        title: 'new feature',
        action :{$: 'studio.open-new-profile-dialog',
          path: '%$path%~features',
          type: 'feature',
          onClose: ctx =>
            ctx.vars.PropertiesDialog.openFeatureSection()
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
  impl :{$: 'control.first-succeeding', 
    $vars: {
      paramType :{$: 'studio.param-type', path: '%$path%' }, 
      paramDef :{$: 'studio.param-def', path: '%$path%' }
    }, 
    title :{$: 'studio.prop-name', path: '%$path%' }, 
    controls: [
      {$: 'control-with-condition', 
        condition :{
          $and: [
            {
              $not :{$: 'is-of-type', 
                type: 'string,number,boolean,undefined', 
                obj :{$: 'studio.val', path: '%$path%' }
              }
            }, 
            {$: 'studio.is-of-type', path: '%$path%', type: 'data,boolean' }
          ]
        }, 
        control :{$: 'studio.property-script', path: '%$path%' }
      }, 
      {$: 'control-with-condition', 
        condition :{
          $and: [
            {$: 'is-of-type', 
              type: 'array', 
              obj :{$: 'studio.val', path: '%$path%' }
            }, 
            {$: 'studio.is-of-type', path: '%$path%', type: 'action' }
          ]
        }, 
        control :{$: 'studio.property-script', path: '%$path%' }
      }, 
      {$: 'control-with-condition', 
        condition: '%$paramDef/options%', 
        control :{$: 'studio.property-enum', path: '%$path%' }
      }, 
      {$: 'control-with-condition', 
        condition: '%$paramDef/as%=="number"', 
        control :{$: 'studio.property-slider', path: '%$path%' }
      }, 
      {$: 'control-with-condition', 
        condition :{
          $and: [
            '%$paramDef/as%=="boolean"', 
            {$: 'in-group', 
              group :{ $list: ['true', 'false'] }, 
              item :{$: 'studio.val', path: '%$path%' }
            }
          ]
        }, 
        control :{$: 'studio.property-boolean', path: '%$path%' }
      }, 
      {$: 'control-with-condition', 
        condition :{$: 'studio.is-of-type', path: '%$path%', type: 'data,boolean' }, 
        control :{$: 'studio.property-primitive', path: '%$path%' }
      }, 
      {$: 'studio.property-tgp', path: '%$path%' }
    ], 
    features: [
      {$: 'studio.property-toolbar-feature', path: '%$path%' }, 
      {$: 'studio.watch-typeof-script', path: '%$path%' }
    ]
  }
})

// jb.component('studio.property-field2', {
// 	type: 'control',
// 	params: [
// 		{ id: 'path', as: 'string' },
// 	],
// 	impl: function(context,path) {
// 		var fieldPT = 'studio.property-label';

//     var st = jb.studio;
// 		var val = st.valOfPath(path);
// 		var valType = typeof val;
// 		var paramDef = st.paramDef(path);
// 		if (!paramDef)
// 			jb.logError('property-field: no param def for path '+path);
// 		if (valType == 'function')
// 			fieldPT = 'studio.property-javascript';
// 		else if (paramDef.as == 'number')
// 			fieldPT = 'studio.property-slider';
// 		else if (paramDef.options)
// 			fieldPT = 'studio.property-enum';
// 		else if ( ['data','boolean'].indexOf(paramDef.type || 'data') != -1) {
// 			if ( st.compNameOfPath(path) || valType == 'object')
// 				fieldPT = 'studio.property-script';
// 			else if (paramDef.type == 'boolean' && (valType == 'boolean' || val == null))
// 				fieldPT = 'studio.property-boolean';
// 			else
// 				fieldPT = 'studio.property-primitive';
// 		}
// 		else if ( (paramDef.type || '').indexOf('[]') != -1 && isNaN(Number(path.split('~').pop())))
// 			fieldPT = 'studio.property-script';
// 		else
// 			fieldPT = 'studio.property-tgp';

// 		return context.run({ $: fieldPT, path: path });
// 	}
// })

jb.component('studio.property-label',{
	type: 'control',
	params: [ {id: 'path', as: 'string' } ],
	impl :{$: 'label',
		title :{$: 'studio.prop-name', path: '%$path%' },
	}
});

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
    }
  }
})

jb.component('studio.data-script-summary', {
  type: 'data',
  params: [
    { id: 'path', as: 'string' }
  ],
  impl: (ctx,path) => {
    var st = jb.studio;
    return st.prettyPrint(st.valOfPath(path));
  	// var val = st.valOfPath(path);
  	// if (st.compNameOfPath(path))
  	// 	return st.compNameOfPath(path);
  	// if (Array.isArray(val))
  	// 	return st.prettyPrint(val);
  	// if (typeof val == 'function')
  	// 	return 'javascript';
  }
})

jb.component('studio.property-boolean', {
  type: 'control',
  params: [{ id: 'path', as: 'string' }],
  impl :{$: 'editable-boolean',
    databind :{$: 'studio.ref', path: '%$path%' },
    style :{$: 'editable-boolean.mdl-slide-toggle' },
    features: [
//      {$: 'studio.undo-support', path: '%$path%' },
//      {$: 'studio.property-toolbar-feature', path: '%$path%' },
      {$: 'css.width', width: '150' }
    ]
  }
})

jb.component('studio.property-enum', {
  type: 'control',
  params: [{ id: 'path', as: 'string' }],
  impl :{$: 'picklist',
    databind :{$: 'studio.ref', path: '%$path%' },
    options :{$: 'studio.enum-options', path: '%$path%' },
    style :{$: 'picklist.native-md-look' }
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
    features :{$: 'css',
      width: '212',
      css: `>input-slider { width: 110px; }
>.input-text { width: 20px; padding-right: 15px; margin-top: 2px; }`
    }
  }
})

jb.component('studio.property-tgp', {
  type: 'control',
  params: [{ id: 'path', as: 'string' }],
  impl :{$: 'group',
    // title :{$: 'studio.prop-name', path: '%$path%' },
    controls: [
      {$: 'group',
        title: 'header',
        style :{$: 'layout.horizontal', spacing: '0' },
        controls: [
          {$: 'editable-boolean',
            databind: '%$expanded%',
            style :{$: 'editable-boolean.expand-collapse' },
            features: [
              {$: 'studio.watch-path', path: '%$path%', includeChildren: true },
              {$: 'css',
                css: '{ position: absolute; margin-left: -20px; margin-top: 5px }'
              },
              {$: 'hidden',
                showCondition :{
                  $and: [
                    {
                      $notEmpty :{$: 'studio.non-control-children', path: '%$path%' }
                    },
                    {
                      $notEmpty :{$: 'studio.val', path: '%$path%' }
                    },
                    {$: 'not-equals',
                      item1 :{$: 'studio.comp-name', path: '%$path%' },
                      item2: 'custom-style'
                    }
                  ]
                }
              }
            ]
          },
          {$: 'group',
            controls: [{$: 'studio.pick-profile', path: '%$path%' }],
            features: [{$: 'css.width', width: '150' }]
          }
        ],
        features :{$: 'css', css: '{ position: relative }' }
      },
      {$: 'group',
        title: 'inner',
        controls :{$: 'studio.properties-in-tgp', path: '%$path%' },
        features: [
          {$: 'studio.watch-path', path: '%$path%' },
          {$: 'watch-ref', ref: '%$expanded%',  },
          {$: 'hidden',
            showCondition :{
              $and: [
                '%$expanded%',
                {
                  $notEmpty :{$: 'studio.non-control-children', path: '%$path%' }
                },
                {
                  $notEmpty :{$: 'studio.val', path: '%$path%' }
                },
                {$: 'not-equals',
                  item1 :{$: 'studio.comp-name', path: '%$path%' },
                  item2: 'custom-style'
                }
              ]
            }
          },
          {$: 'css',
            css: '{ margin-top: 9px; margin-left: -83px; margin-bottom: 4px;}'
          },
          {$: 'bind-refs',
            watchRef: '%$path%',
            updateRef: '%$expanded%',
            value :{
              $or: [
                '%$expanded%',
                {$: 'studio.is-new', path: '%$path%' }
              ]
            }
          }
        ]
      }
    ],
    features: [
//      {$: 'studio.property-toolbar-feature', path: '%$path%' },
      {$: 'var',
        name: 'expanded',
        value :{$: 'studio.is-new', path: '%$path%' },
        mutable: true
      }
    ]
  }
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
              {$: 'css.class', class: 'drag-handle' }
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
          {$: 'feature.if', showCondition: '%$expanded%'},
          {$: 'watch-ref', ref: '%$expanded%',  },
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
      {$: 'studio.watch-path',
        path: '%$path%',
//        includeChildren: 'true'
      }
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
        ]
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
