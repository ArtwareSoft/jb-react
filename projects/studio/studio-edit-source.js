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
			features: {$: 'studio.undo-support', path: '%$path%' },
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

jb.component('studio.goto-sublime', {
	type: 'menu.option',
	params: [
		{ id: 'path', as: 'string'},
	],
    impl :{$: 'menu.dynamic-options', 
        items :{$: 'studio.goto-targets', path: '%$path%' }, 
        genericOption :{$: 'menu.action', 
          title: { $pipeline: [
            {$: 'split', separator: '~', part: 'first' },
            'Goto sublime: %%'
          ]}, 
          action :{$: 'studio.open-sublime-editor', path: '%%' } 
        }
      }, 
}) 

jb.component('studio.goto-targets', {
	params: [
		{ id: 'path', as: 'string'},
	],
	impl: (ctx,path) => 
		jb.unique([st.compNameOfPath(path),path]
			.filter(x=>x)
			.map(x=>
				x.split('~')[0]))
}) 

jb.component('studio.open-sublime-editor', {
	type: 'action',
	params: [
		{ id: 'path', as: 'string'},
	],
	impl: (ctx,path) => {
		path && $.ajax(`/?op=gotoSource&comp=${path.split('~')[0]}`)
	}
}) 

})()