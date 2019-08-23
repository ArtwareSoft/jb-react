
jb.component('studio.format-css', { /* studio_formatCss */
  params: [
    {id: 'css', as: 'string'}
  ],
  impl: (ctx,css) => {
    return css
      .replace(/{\s*/g,'{ ')
      .replace(/;\s*/g,';\n')
      .replace(/}[^$]/mg,'}\n\n')
      .replace(/^\s*/mg,'')
  }
})

jb.component('studio.open-style-menu', { /* studio_openStyleMenu */
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: menu_openContextMenu({
    menu: menu_menu({
      options: [
        menu_action({
          title: 'Clone as local style',
          action: [
            studio_makeLocal('%$path%'),
            {$: 'studio.open-style-editor', path: '%$styleSource/innerPath%', $recursive: true},
            studio_openProperties()
          ],
          icon: 'build',
          showCondition: "%$styleSource/type% == 'global'"
        }),
        menu_action({
          title: 'Extract style as a reusable component',
          action: {$: 'studio.open-make-global-style', path: '%$path%'},
          icon: 'build',
          showCondition: "%$styleSource/type% == 'inner'"
        }),
        menu_action({
          title: 'Format css',
          action: writeValue(
            studio_profileAsText('%$styleSource/path%~css'),
            studio_formatCss(studio_profileAsText('%$styleSource/path%~css'))
          )
        })
      ]
    })
  })
})

jb.component('studio.style-editor', { /* studio_styleEditor */
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    controls: [
      tabs({
        tabs: [
          group({
            title: 'css',
            style: layout_vertical(3),
            controls: [
              editableText({
                title: 'css',
                databind: studio_profileAsStringByref('%$path%~css'),
                style: editableText_codemirror({
                  cm_settings: '',
                  enableFullScreen: false,
                  height: '300',
                  mode: 'css',
                  debounceTime: '2000',
                  onCtrlEnter: studio_refreshPreview()
                })
              }),
              label({title: 'jsx', style: label_htmlTag('h5')}),
              editableText({
                title: 'template',
                databind: pipeline(studio_templateAsJsx('%$path%~template'), studio_pretty('%%')),
                style: editableText_codemirror({cm_settings: '', height: '200', mode: 'jsx', onCtrlEnter: studio_refreshPreview()})
              })
            ]
          }),
          group({
            title: 'js',
            controls: [
              editableText({
                title: 'template',
                databind: studio_profileAsText('%$path%~template'),
                style: editableText_codemirror({
                  cm_settings: '',
                  height: '400',
                  mode: 'javascript',
                  onCtrlEnter: studio_refreshPreview()
                })
              }),
              button({
                title: 'load from jsx/html',
                action: openDialog({
                  style: dialog_dialogOkCancel('OK', 'Cancel'),
                  content: group({
                    controls: [
                      editableText({
                        title: 'jsx',
                        databind: '%$jsx%',
                        style: editableText_codemirror({enableFullScreen: true, debounceTime: 300})
                      })
                    ]
                  }),
                  title: 'Paste html / jsx',
                  onOK: writeValue(studio_ref('%$path%~template'), studio_jsxToH('%$jsx%')),
                  features: [variable({name: 'jsx', value: 'paste your jsx here', mutable: 'true'})]
                }),
                style: button_mdlRaised()
              })
            ]
          }),
          group({
            title: 'Inteliscript editor',
            style: layout_vertical(),
            controls: [
              studio_jbEditor('%$path%')
            ]
          })
        ],
        style: tabs_simple()
      })
    ]
  })
})

jb.component('studio.style-source', { /* studio_styleSource */
  params: [
    {id: 'path', as: 'string'}
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

jb.component('studio.open-style-editor', { /* studio_openStyleEditor */
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: openDialog({
    vars: [Var('styleSource', studio_styleSource('%$path%'))],
    style: dialog_studioFloating({id: 'style editor', width: '800'}),
    content: studio_styleEditor('%$path%'),
    menu: button({
      title: 'style menu',
      action: studio_openStyleMenu('%$path%'),
      style: button_mdlIcon('menu'),
      features: css('button { background: transparent }')
    }),
    title: 'Style Editor - %$styleSource/path%',
    features: dialogFeature_resizer()
  })
})

jb.component('studio.style-editor-options', { /* studio_styleEditorOptions */ 
  type: 'menu.option',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: menu_endWithSeparator({
    vars: [Var('compName', studio_compName('%$path%'))],
    options: [
      menu_action({
        title: 'Style editor',
        action: runActions(studio_makeLocal('%$path%'), studio_openStyleEditor('%$path%')),
        showCondition: endsWith('~style', '%$path%')
      }),
      menu_action({
        title: 'Style editor of %$compName%',
        action: studio_openStyleEditor('%$compName%~impl'),
        showCondition: and(endsWith('~style', '%$path%'), notEmpty('%$compName%'))
      })
    ]
  })
})
