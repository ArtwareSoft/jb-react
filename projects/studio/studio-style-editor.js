jb.component('studio.open-style-editor', {
  type: 'action', 
  params: [{ id: 'path', as: 'string' }], 
  impl :{$: 'open-dialog', 
    $vars: {
      styleSource :{$: 'studio.style-source', path: '%$path%' }
    }, 
    style :{$: 'dialog.studio-floating', id: 'style editor' }, 
    content :{$: 'studio.style-editor', path: '%$path%' }, 
    menu :{$: 'button', 
      title: 'style menu', 
      action :{$: 'studio.open-style-menu', path: '%$path%' }, 
      style :{$: 'button.mdl-icon', icon: 'menu' }, 
      features :{$: 'css', css: 'button { background: transparent }' }
    }, 
    title: 'Style Editor - %$styleSource/path%'
  }
})

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
    style :{$: 'property-sheet.studio-properties', spacing: 3 }, 
    controls: [
      {$: 'editable-text', 
        title: 'css', 
        databind :{$: 'studio.profile-as-text', stringOnly: true, path: '%$path%~css' }, 
        style :{$: 'editable-text.codemirror', 
          cm_settings :{$: 'object', width: '400px' }, 
          height: '161', 
          mode: 'css', 
          onCtrlEnter :{$: 'studio.refresh-preview' }
        }, 
        features :{$: 'css.width', width: '600' }
      }, 
      {$: 'editable-text', 
        title: 'template-js', 
        databind :{$: 'studio.profile-as-text', 
          stringOnly: true, 
          path: '%$path%~template'
        }, 
        style :{$: 'editable-text.codemirror', 
          height: '130', 
          mode: 'htmlmixed', 
          onCtrlEnter :{$: 'studio.refresh-preview' }
        }
      }, 
      {$: 'editable-text', 
        title: 'template-jsx', 
        databind :{$: 'studio.template-as-jsx', 
          stringOnly: true, 
          path: '%$path%~template'
        }, 
        style :{$: 'editable-text.codemirror', 
          cm_settings: '', 
          height: '130', 
          mode: 'htmlmixed', 
          onCtrlEnter :{$: 'studio.refresh-preview' }
        }
      }
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

jb.component('studio.custom-style-make-local', {
  params: [
    { id: 'template', as: 'string'},
    { id: 'css', as: 'string'},
  ],
  impl: {$: 'object', template: '%$template%', css: '%$css%' }
})
