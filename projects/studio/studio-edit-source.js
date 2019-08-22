(function() {
const st = jb.studio;

jb.component('studio.open-editor', {
  type: 'action',
  params: [
    { id: 'path', as: 'string'},
  ],
  impl: (ctx,path) => {
    path && fetch(`/?op=gotoSource&comp=${path.split('~')[0]}`)
  }
})

jb.component('studio.edit-source', {
  type: 'action', 
  params: [
    { id: 'path', as: 'string', defaultValue :{$: 'studio.currentProfilePath' } }
  ], 
  impl :{$: 'open-dialog', 
    style :{$: 'dialog.edit-source-style', id: 'edit-source', width: 600 }, 
    content :{$: 'editable-text', 
      databind:{$: 'studio.profile-as-text', path: '%$path%' },
      // '%$studio/ScriptInPopup%', 
      style :{$: 'editable-text.studio-codemirror-tgp' }
    }, 
    title :{$: 'studio.short-title', path: '%$path%' }, 
    features: [
//      {$:'dialog-feature.drag-title'},
      {$: 'css', css: '.jb-dialog-content-parent {overflow-y: hidden}' }, 
      {$: 'dialog-feature.resizer', "resize-inner-codemirror": 'true', resizeInnerCodemirror: true }, 
    ]
  }
})

jb.component('studio.edit-as-macro', {
  type: 'action', 
  params: [
    { id: 'path', as: 'string', defaultValue :{$: 'studio.currentProfilePath' } }
  ], 
  impl :{$: 'open-dialog', 
    style :{$: 'dialog.edit-source-style', id: 'edit-source', width: 600 }, 
    content :{$: 'editable-text', 
      databind:{$: 'studio.profile-as-macro-text', path: '%$path%' },
      // '%$studio/ScriptInPopup%', 
      style :{$: 'editable-text.studio-codemirror-tgp' }
    }, 
    title :{$: 'studio.short-title', path: '%$path%' }, 
    features: [
//      {$:'dialog-feature.drag-title'},
      {$: 'css', css: '.jb-dialog-content-parent {overflow-y: hidden}' }, 
      {$: 'dialog-feature.resizer', "resize-inner-codemirror": 'true', resizeInnerCodemirror: true }, 
    ]
  }
})

jb.component('studio.goto-editor-secondary', {
  type: 'action',
  params: [{ id: 'path', as: 'string' }],
  impl :{$: 'menu.action',
    $vars: { baseComp: {$: 'split', text: '%$path%', separator: '~', part: 'first' }},
    title :  'Goto editor: %$baseComp%',
    action :{$: 'studio.open-editor', path: '%$baseComp%' },
    showCondition :{$: 'not-equals',
      item1 :{$: 'studio.comp-name', path: '%$path%' },
      item2 : '%$baseComp%'
    }
  }
})

jb.component('studio.goto-editor-first', {
  type: 'action',
  params: [{ id: 'path', as: 'string' }],
  impl :{$: 'menu.action',
    title :{
      $pipeline: [{$: 'studio.comp-name', path: '%$path%' }, 'Goto editor: %%']
    },
    action :{$: 'studio.open-editor',
      path :{$: 'studio.comp-name', path: '%$path%' }
    },
    shortcut: 'Alt+E',
    showCondition :{$: 'notEmpty',
      item :{$: 'studio.comp-name', path: '%$path%' }
    }
  }
})

jb.component('studio.goto-editor-options', {
	type: 'menu.option',
	params: [
		{ id: 'path', as: 'string'},
	],
    impl :{$: 'menu.end-with-separator',
      options :[
        {$: 'studio.goto-editor-first', path: '%$path%'},
        {$: 'studio.goto-editor-secondary', path: '%$path%'},
      ]
    }
})

})()
