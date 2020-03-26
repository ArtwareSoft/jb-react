
jb.component('studio.formatCss', {
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

jb.component('studio.openStyleMenu', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: menu.openContextMenu({
    menu: menu.menu({
      options: [
        menu.action({
          title: 'Clone as local style',
          action: [
            studio.makeLocal('%$path%'),
            studio.openStyleEditor('%$styleSource/innerPath%'),
            studio.openProperties(true)
          ],
          icon: icon('build'),
          showCondition: "%$styleSource/type% == 'global'"
        }),
        menu.action({
          title: 'Extract style as a reusable component',
          icon: icon('build'),
          showCondition: "%$styleSource/type% == 'inner'"
        }),
        menu.action({
          title: 'Format css',
          action: writeValue(
            studio.profileAsText('%$styleSource/path%~css'),
            studio.formatCss(studio.profileAsText('%$styleSource/path%~css'))
          )
        })
      ]
    })
  })
})

jb.component('studio.styleEditor', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group({
    controls: [
      group({
        style: group.tabs(),
        controls: [
          group({
            title: 'css',
            layout: layout.vertical(3),
            controls: [
              editableText({
                title: 'css',
                databind: studio.profileAsStringByref('%$path%~css'),
                style: editableText.codemirror({
                  cm_settings: '',
                  enableFullScreen: false,
                  height: '300',
                  mode: 'css',
                  debounceTime: '2000',
                  onCtrlEnter: studio.refreshPreview()
                })
              }),
              text({text: 'jsx', style: text.htmlTag('h5')}),
              editableText({
                title: 'template',
                databind: pipeline(studio.templateAsJsx('%$path%~template'), studio.pretty('%%')),
                style: editableText.codemirror({
                  cm_settings: '',
                  height: '200',
                  mode: 'jsx',
                  onCtrlEnter: studio.refreshPreview()
                })
              })
            ]
          }),
          group({
            title: 'js',
            controls: [
              editableText({
                title: 'template',
                databind: studio.profileAsText('%$path%~template'),
                style: editableText.codemirror({
                  cm_settings: '',
                  height: '400',
                  mode: 'javascript',
                  onCtrlEnter: studio.refreshPreview()
                })
              }),
              button({
                title: 'load from jsx/html',
                action: openDialog({
                  style: dialog.dialogOkCancel('OK', 'Cancel'),
                  content: group({
                    controls: [
                      editableText({
                        title: 'jsx',
                        databind: '%$jsx%',
                        style: editableText.codemirror({enableFullScreen: true, debounceTime: 300})
                      })
                    ]
                  }),
                  title: 'Paste html / jsx',
                  onOK: writeValue(studio.ref('%$path%~template'), studio.jsxToH('%$jsx%')),
                  features: [variable({name: 'jsx', value: 'paste your jsx here', watchable: 'true'})]
                }),
                style: button.mdc()
              })
            ]
          }),
          group({
            title: 'Inteliscript editor',
            layout: layout.vertical(),
            controls: [
              studio.jbEditor('%$path%')
            ]
          })
        ]
      })
    ]
  })
})

jb.component('studio.styleSource', {
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

jb.component('studio.openStyleEditor', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: openDialog({
    vars: [Var('styleSource', studio.styleSource('%$path%'))],
    style: dialog.studioFloating({id: 'style editor', width: '800'}),
    content: studio.styleEditor('%$path%'),
    menu: button({
      title: 'style menu',
      action: studio.openStyleMenu('%$path%'),
      style: button.mdcIcon('menu'),
      features: css('button { background: transparent }')
    }),
    title: 'Style Editor - %$styleSource/path%',
    features: dialogFeature.resizer()
  })
})

jb.component('studio.styleEditorOptions', {
  type: 'menu.option',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: menu.endWithSeparator({
    vars: [Var('compName', studio.compName('%$path%'))],
    options: [
      menu.action({
        title: 'Style editor',
        action: runActions(studio.makeLocal('%$path%'), studio.openStyleEditor('%$path%')),
        showCondition: endsWith('~style', '%$path%')
      }),
      menu.action({
        title: 'Style editor of %$compName%',
        action: studio.openStyleEditor('%$compName%~impl'),
        showCondition: and(endsWith('~style', '%$path%'), notEmpty('%$compName%'))
      })
    ]
  })
})
