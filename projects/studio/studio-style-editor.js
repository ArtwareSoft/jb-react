
component('studio.formatCss', {
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

component('studio.openStyleMenu', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: menu.openContextMenu(
    menu.menu({
      options: [
        menu.action({
          title: 'Clone as local style',
          action: [
            studio.calcMakeLocal('%$path%', true),
            studio.openStyleEditor('%$styleSource/innerPath%'),
            studio.openProperties(true)
          ],
          icon: icon('build'),
          showCondition: `%$styleSource/type% == 'global'`
        }),
        menu.action('Extract style as a reusable component', {
          icon: icon('build'),
          showCondition: `%$styleSource/type% == 'inner'`
        }),
        menu.action('Format css', writeValue({
          to: sourceEditor.profileAsText('%$styleSource/path%~css'),
          value: studio.formatCss(sourceEditor.profileAsText('%$styleSource/path%~css'))
        }))
      ]
    })
  )
})

component('studio.styleEditor', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: group(
    group({
      controls: [
        group({
          controls: [
            editableText('css', sourceEditor.profileAsText('%$path%~css'), {
              style: editableText.codemirror({ enableFullScreen: false, height: '300', mode: 'css', debounceTime: '2000', onCtrlEnter: studio.refreshPreview() })
            }),
            text('jsx', { style: text.htmlTag('h5') }),
            editableText('template', pipeline(studio.templateAsJsx('%$path%~template'), prettyPrint('%%')), {
              style: editableText.codemirror({ height: '200', mode: 'jsx', onCtrlEnter: studio.refreshPreview() })
            })
          ],
          title: 'css',
          layout: layout.vertical(3)
        }),
        group({
          controls: [
            editableText('template', sourceEditor.profileAsText('%$path%~template'), {
              style: editableText.codemirror({ height: '400', mode: 'javascript', onCtrlEnter: studio.refreshPreview() })
            }),
            button({
              title: 'load from jsx/html',
              action: openDialog({
                title: 'Paste html / jsx',
                content: group(
                  editableText('jsx', '%$jsx%', {
                    style: editableText.codemirror({ enableFullScreen: true, debounceTime: 300 })
                  })
                ),
                style: dialog.dialogOkCancel('OK', 'Cancel'),
                onOK: writeValue(tgp.ref('%$path%~template'), studio.jsxToH('%$jsx%')),
                features: [
                  variable('jsx', 'paste your jsx here')
                ]
              }),
              style: button.mdc()
            })
          ],
          title: 'js'
        }),
        group(studio.jbEditor('%$path%'), { title: 'Inteliscript editor', layout: layout.vertical() })
      ],
      style: group.tabs()
    })
  )
})

component('studio.styleSource', {
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx,path) => {
      var st = jb.studio;
      var style = st.valOfPath(path);
      var compName = jb.utils.compName(style);
      if (compName == 'custom-style')
        return { type: 'inner', path: path, style : style }
      var comp = compName && st.getComp(compName);
      if (comp && jb.utils.compName(comp.impl) == 'custom-style')
          return { type: 'global', path: compName, style: comp.impl, innerPath: path }
  }
})

component('studio.openStyleEditor', {
  type: 'action',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: openDialog({
    vars: [
      Var('styleSource', studio.styleSource('%$path%'))
    ],
    title: 'Style Editor - %$styleSource/path%',
    content: studio.styleEditor('%$path%'),
    style: dialog.studioFloating('style editor', '800'),
    menu: button('style menu', studio.openStyleMenu('%$path%'), {
      style: button.mdcIcon('menu'),
      features: css('button { background: transparent }')
    }),
    features: dialogFeature.resizer()
  })
})

component('studio.styleEditorOptions', {
  type: 'menu.option',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: menu.endWithSeparator({
    vars: [
      Var('compName', tgp.compName('%$path%'))
    ],
    options: menu.action({
      title: 'Style editor',
      action: runActions(studio.calcMakeLocal('%$path%', true), studio.openStyleEditor('%$path%')),
      showCondition: endsWith('~style', '%$path%')
    }),
    separator: menu.action('Style editor of %$compName%', studio.openStyleEditor('%$compName%~impl'), {
      showCondition: and(endsWith('~style', '%$path%'), notEmpty('%$compName%'))
    })
  })
})
