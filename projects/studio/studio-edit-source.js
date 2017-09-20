(function() {
  var st = jb.studio;

jb.component('studio.edit-source', {
  type: 'action', 
  params: [
    {
      id: 'path', 
      as: 'string', 
      defaultValue :{$: 'studio.currentProfilePath' }
    }
  ], 
  impl :{$: 'open-dialog', 
    style :{$: 'dialog.dialog-ok-cancel', id: 'edit-source', width: 600, okLabel: 'OK', cancelLabel: 'Cancel' }, 
    content :{$: 'editable-text', 
      databind: '%$Script%', 
      style :{$: 'editable-text.codemirror', mode: 'javascript' }
    }, 
    title :{$: 'studio.short-title', path: '%$path%' }, 
    onOK :{$: 'write-value', 
      to :{$: 'studio.profile-as-text', path: '%$path%' }, 
      value: '%$Script%'
    }, 
    features: [
      {$: 'css', css: '.jb-dialog-content-parent {overflow-y: hidden}' }, 
      {$: 'dialog-feature.resizer', "resize-inner-codemirror": 'true', resizeInnerCodemirror: true }, 
      {$: 'var', 
        name: 'Script', 
        value : {$pipeline: [{$: 'studio.profile-as-text', path: '%$path%' }, '%% ']}, 
        mutable: 'true'
      }
    ]
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

jb.component('studio.open-editor', {
	type: 'action',
	params: [
		{ id: 'path', as: 'string'},
	],
	impl: (ctx,path) => {
		path && fetch(`/?op=gotoSource&comp=${path.split('~')[0]}`)
	}
})

})()
