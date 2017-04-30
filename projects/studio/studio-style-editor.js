jbLoadModules(['studio/studio-tgp-model']).then(loadedModules => { 
  var model = loadedModules['studio/studio-tgp-model'].model;

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
    style :{$: 'property-sheet.titles-above' }, 
    controls: [
      {$: 'editable-text', 
        title: 'css', 
        databind :{$: 'studio.profile-as-text', 
          stringOnly: true, 
          path: '%$styleSource/path%~css'
        }, 
        style :{$: 'editable-text.codemirror', 
          height: 300, 
          mode: 'css', 
          onCtrlEnter :{$: 'studio.refresh-preview' }
        }, 
        features :{$: 'studio.undo-support', path: '%styleSource/path%' }
      }, 
      {$: 'editable-text', 
        title: 'template', 
        databind :{$: 'studio.profile-as-text', 
          stringOnly: true, 
          path: '%$styleSource/path%~template'
        }, 
        style :{$: 'editable-text.codemirror', 
          height: '200', 
          mode: 'htmlmixed', 
          onCtrlEnter :{$: 'studio.refresh-preview' }
        }, 
        features :{$: 'studio.undo-support', path: '%$styleSource/path%' }
      }
    ]
  }
})

jb.component('studio.style-source', {
  params: [
    { id: 'path', as: 'string' }
  ], 
  impl: (ctx,path) =>
    model.getStyleComp(path) 
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

jb.component('studio.open-make-global-style', {
  type: 'action', 
  params: [
    { id: 'path', as: 'string' }
  ],
  impl :{$: 'open-dialog', 
    modal: true, 
    title: 'Style Name', 
    style :{$: 'dialog.dialog-ok-cancel', 
      features :{$: 'dialog-feature.autoFocusOnFirstInput' }
    }, 
    content :{$: 'editable-text', 
      databind: '%$dialogData/name%',
      features :{$: 'feature.onEnter', action :{$: 'closeContainingPopup'} }
    }, 
    onOK: ctx => {
        debugger;
        var path = ctx.componentContext.params.path;
        var id = ctx.exp('%$studio/project%.%$dialogData/name%'); 
        var profile = {
          type: model.paramDef(path).type,
          impl : model.val(path)
        }
        model.modify(model.newComp,id,{profile:profile},ctx);
        model.modify(model.writeValue,path,{value : {$: id}},ctx);
    }
  }
})

jb.component('studio.custom-style-make-local', {
  params: [
    { id: 'template', as: 'string'},
    { id: 'css', as: 'string'},
  ],
  impl: {$: 'object', template: '%$template%', css: '%$css%' }
})


})