jb.component('studio.open-context-viewer', {
	type: 'action',
	impl :{$: 'open-dialog',
		title: 'Context Viewer',
		style :{$: 'dialog.studio-floating', id: 'studio-context-viewer', width: 300 },
		content :{$: 'studio.context-viewer' },
	}
})


jb.component('studio.context-viewer', {
	type: 'control',
	impl :{$: 'studio.data-browse', obj: '%$studio/last_pick_selection%', title: 'context' }, 

})

