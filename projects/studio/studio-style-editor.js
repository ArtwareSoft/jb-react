

jb.component('studio.open-style-menu', {
  type: 'action',
  params: [
    { id: 'path', as: 'string' }
  ],
  impl :{$: 'menu.open-context-menu',
    menu :{$: 'menu.menu',
      options: [
        {$: 'menu.action',
          title: 'Clone as local style',
          icon: 'build',
          action : [
            {$: 'studio.make-local', path: '%$path%' },
            {$: 'studio.open-style-editor', path: '%$styleSource/innerPath%' },
            {$: 'studio.open-properties' },
          ],
          showCondition: "%$styleSource/type% == 'global'",
        },
        {$: 'menu.action',
          title: 'Extract style as a reusable component',
          icon: 'build',
          action :{$: 'studio.open-make-global-style', path: '%$path%' },
          showCondition: "%$styleSource/type% == 'inner'",
        },
        {$: 'menu.action',
          title: 'Format css',
          action :{$: 'write-value',
            to :{$: 'studio.profile-as-text',  path: '%$styleSource/path%~css', stringOnly: true },
            value :{$: 'studio.format-css',
              css:{$: 'studio.profile-as-text',  path: '%$styleSource/path%~css' }
            }
          }
        }
      ]
    }
  }
})

jb.component('studio.style-editor', {
  type: 'control', 
  params: [{ id: 'path', as: 'string' }], 
  impl :{$: 'group', 
    controls: [
      {$: 'tabs', 
        tabs: [
          {$: 'group', 
            title: 'css', 
            style :{$: 'layout.vertical', 
              vSpacing: 20, 
              hSpacing: 20, 
              titleWidth: 100, 
              spacing: 3
            }, 
            controls: [
              {$: 'editable-text', 
                title: 'css', 
                databind :{$: 'studio.profile-as-string-byref', 
                  stringOnly: true, 
                  path: '%$path%~css'
                }, 
                style :{$: 'editable-text.codemirror', 
                  cm_settings: '', 
                  enableFullScreen: false, 
                  height: '300', 
                  mode: 'css', 
                  debounceTime: '2000', 
                  onCtrlEnter :{$: 'studio.refresh-preview' }
                }
              }, 
              {$: 'label', 
                title: 'jsx', 
                style :{$: 'label.htmlTag', htmlTag: 'h5' }
              }, 
              {$: 'editable-text', 
                title: 'template', 
                databind :{
                  $pipeline: [
                    {$: 'studio.template-as-jsx', path: '%$path%~template' }, 
                    {$: 'studio.pretty', text: '%%' }
                  ]
                }, 
                style :{$: 'editable-text.codemirror', 
                  cm_settings: '', 
                  height: '200', 
                  mode: 'jsx', 
                  onCtrlEnter :{$: 'studio.refresh-preview' }
                }
              }
            ]
          }, 
          {$: 'group', 
            title: 'js', 
            controls: [
              {$: 'editable-text', 
                title: 'template', 
                databind :{$: 'studio.profile-as-text', 
                  stringOnly: true, 
                  path: '%$path%~template'
                }, 
                style :{$: 'editable-text.codemirror', 
                  cm_settings: '', 
                  height: '400', 
                  mode: 'javascript', 
                  onCtrlEnter :{$: 'studio.refresh-preview' }
                }
              }, 
              {$: 'button', 
                title: 'load from jsx/html', 
                action :{$: 'open-dialog', 
                  style :{$: 'dialog.dialog-ok-cancel', 
                    okLabel: 'OK', 
                    cancelLabel: 'Cancel'
                  }, 
                  content :{$: 'group', 
                    controls: [
                      {$: 'editable-text', 
                        title: 'jsx', 
                        databind: '%$jsx%', 
                        style :{$: 'editable-text.codemirror', 
                          enableFullScreen: true, 
                          debounceTime: 300
                        }
                      }
                    ]
                  }, 
                  title: 'Paste html / jsx', 
                  onOK :{$: 'write-value', 
                    to :{$: 'studio.ref', path: '%$path%~template' }, 
                    value :{$: 'studio.jsx-to-h', text: '%$jsx%' }
                  }, 
                  features: [
                    {$: 'variable', 
                      name: 'jsx', 
                      value: 'paste your jsx here', 
                      mutable: 'true'
                    }
                  ]
                }, 
                style :{$: 'button.mdl-raised' }
              }
            ]
          }, 
          {$: 'group', 
            title: 'Inteliscript editor', 
            style :{$: 'layout.vertical' }, 
            controls: [{$: 'studio.jb-editor', path: '%$path%' }]
          }
        ], 
        style :{$: 'tabs.simple' }
      }
    ]
  }
})

jb.component('studio.style-editor-options', {
	type: 'menu.option',
	params: [
		{ id: 'path', as: 'string'},
	],
    impl :{$: 'menu.end-with-separator',
		$vars: {
		  compName :{$: 'studio.comp-name', path: '%$path%' }
		},
	  options: [
			{$: 'menu.action',
			  title: 'Style editor',
			  action :{
				$runActions: [
				  {$: 'studio.make-local', path: '%$path%' },
				  {$: 'studio.open-style-editor', path: '%$path%' }
				]
			  },
			  showCondition :{$: 'ends-with', endsWith: '~style', text: '%$path%' }
			},
			{$: 'menu.action',
			  title: 'Style editor of %$compName%',
			  action :{$: 'studio.open-style-editor', path: '%$compName%~impl' },
			  showCondition :{
				$and: [
				  {$: 'ends-with', endsWith: '~style', text: '%$path%' },
				  {$: 'notEmpty', item: '%$compName%' }
				]
			  }
			},
		]
    }
})


jb.component('studio.style-source', {
  params: [
    { id: 'path', as: 'string' }
  ],
  impl: (ctx,path) => {
      var st = jb.studio;
      var style = st.valOfPath(path);
      var compName = jb.compName(style);
      if (compName == 'custom-style')
        return { type: 'inner', path: path, style : style }
      var comp = compName && st.getComp(compName);
      if (comp && jb.compName(comp.impl) == 'custom-style')
          return { type: 'global', path: compName, style: comp.impl, innerPath: path }
  }
})

jb.component('studio.format-css', {
  params: [
    { id: 'css', as: 'string' }
  ],
  impl: (ctx,css) => {
    return css
      .replace(/{\s*/g,'{ ')
      .replace(/;\s*/g,';\n')
      .replace(/}[^$]/mg,'}\n\n')
      .replace(/^\s*/mg,'')
  }
})

jb.component('studio.open-style-editor', {
  type: 'action',
  params: [{ id: 'path', as: 'string' }],
  impl :{$: 'open-dialog',
    $vars: {
      styleSource :{$: 'studio.style-source', path: '%$path%' }
    },
    style :{$: 'dialog.studio-floating', id: 'style editor', width: '800' },
    content :{$: 'studio.style-editor', path: '%$path%' },
    features: {$: 'dialog-feature.resizer'},
    menu :{$: 'button',
      title: 'style menu',
      action :{$: 'studio.open-style-menu', path: '%$path%' },
      style :{$: 'button.mdl-icon', icon: 'menu' },
      features :{$: 'css', css: 'button { background: transparent }' }
    },
    title: 'Style Editor - %$styleSource/path%'
  }
})
