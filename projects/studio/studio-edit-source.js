(function() {
  var model = jb.studio.model;

jb.component('studio.edit-source', {
	type: 'action',
	params: [
		{ id: 'path', as: 'string', defaultValue: { $: 'studio.currentProfilePath' } }
	],
	impl: {
		$: 'open-dialog',
		title :{$: 'studio.short-title', path: '%$path%' },
		style :{$: 'dialog.studio-floating', id: 'edit source', width: 600 },
		features :{$: 'css', css: '.jb-dialog-content-parent {overflow-y: hidden}'},
		content :{$: 'editable-text', 
			databind :{$: 'studio.profile-as-text', path: '%$path%' },
			style :{$: 'editable-text.codemirror', mode: 'javascript'},
			features: {$: 'studio.undo-support', path: '%$path%' },
		}
	}
})

jb.component('studio.profile-as-text', {
	type: 'data',
	params: [
		{ id: 'path', as: 'string', dynamic: true },
	],
	impl: ctx => ({
			$jb_val: function(value) {
				var path = ctx.params.path();
				if (!path) return;
				if (typeof value == 'undefined') {
					var val = model.val(path);
					if (typeof val == 'string')
						return val;
					return jb.studio.prettyPrint(val);
				} else {
					var newVal = value.match(/^\s*({|\[)/) ? evalProfile(value) : value;
					if (newVal != null)
						model.modify(model.writeValue, path, { value: newVal },ctx);
				}
			}
		})
})

jb.component('studio.string-property-ref', {
	type: 'data',
	params: [
		{ id: 'path', as: 'string' },
	],
	impl: (context,path,stringOnly) => ({
			$jb_val: function(value) {
				if (typeof value == 'undefined') {
					return model.val(path);
				} else {
					model.modify(model.writeValue, path, { value: newVal },context);
				}
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
		[model.compName(path),path]
			.filter(x=>x)
			.map(x=>
				x.split('~')[0])
			.filter( jb.unique(x=>x) )
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