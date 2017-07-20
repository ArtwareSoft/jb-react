(function() {
  var st = jb.studio;

jb.component('studio.edit-source', {
	type: 'action',
	params: [
		{ id: 'path', as: 'string', defaultValue: { $: 'studio.currentProfilePath' } }
	],
	impl: {
		$: 'open-dialog',
		title :{$: 'studio.short-title', path: '%$path%' },
		style :{$: 'dialog.studio-floating', id: 'edit-source', width: 600 },
		features :{$: 'css', css: '.jb-dialog-content-parent {overflow-y: hidden}'},
		content :{$: 'editable-text',
			databind :{$: 'studio.profile-as-text', path: '%$path%' },
			style :{$: 'editable-text.codemirror', mode: 'javascript'},
//			features: {$: 'studio.undo-support', path: '%$path%' },
		}
	}
})

jb.component('studio.string-property-ref', {
	type: 'data',
	params: [
		{ id: 'path', as: 'string' },
	],
	impl: (context,path) => ({
			$jb_val: value => {
				if (typeof value == 'undefined')
					return st.valOfPath(path);
				else
					st.writeValueOfPath(path, newVal);
			}
		})
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
    action :{$: 'studio.open-editor-editor',
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
    title :{
      $pipeline: [
        {$: 'split', path: '%$path%', separator: '~', part: 'first' },
        'Goto editor: %%'
      ]
    },
    action :{$: 'studio.open-editor-editor',
      path :{$: 'studio.comp-name', path: '%$path%' }
    },
    showCondition :{$: 'not-equals',
      item1 :{$: 'studio.comp-name', path: '%$path%' },
      item2 :{$: 'split', path: '%$path%', separator: '~', part: 'first' }
    }
  }
})

// jb.component('studio.goto-targets', {
// 	params: [
// 		{ id: 'path', as: 'string'},
// 	],
// 	impl: (ctx,path) =>
// 		jb.unique([st.compNameOfPath(path),path]
// 			.filter(x=>x)
// 			.map(x=>
// 				x.split('~')[0]))
// })

jb.component('studio.open-editor-editor', {
	type: 'action',
	params: [
		{ id: 'path', as: 'string'},
	],
	impl: (ctx,path) => {
		path && $.ajax(`/?op=gotoSource&comp=${path.split('~')[0]}`)
	}
})

})()
