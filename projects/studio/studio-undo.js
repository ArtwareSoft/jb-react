(function() {
var st = jb.studio;

st.compsHistory = [];

jb.component('studio.undo', {
	impl: ctx => {
		if (st.undoIndex > 0) {
			st.undoIndex--;
			var change = st.compsHistory[st.undoIndex];
			st.previewjb.comps = st.compsHistory[st.undoIndex];
//			jb_ui.apply(ctx);
		}
	}
})

jb.component('studio.redo', {
	impl: ctx => {
		if (st.undoIndex < st.compsHistory.length) {
			var change = st.compsHistory[st.undoIndex];
			setComp(change.after,change.ctx.win().jbart);
			st.undoIndex++;
//			jb_ui.apply(ctx);
		}

	}
})

jb.component('studio.copy', {
	params: [ {id: 'path', as: 'string' } ],
	impl: (ctx,path) => 
		st.clipboard = st.valOfPath(path)
})

jb.component('studio.paste', {
	params: [ {id: 'path', as: 'string' } ],
	impl: (ctx,path) =>
		(st.clipboard != null) && jb.writeValue(ref,st.clipboard,ctx)
})

jb.component('studio.script-history', {
	type: 'data',
	impl: ctx => st.compsHistory
})

jb.component('studio.open-script-history', {
  type: 'action', 
  impl :{$: 'open-dialog', 
      content :{$: 'studio.script-history' }, 
      style :{$: 'dialog.studio-floating', 
        id: 'script-history', 
        width: '700', 
        height: '400'
      }, 
      title: 'Script History'
  }
}) 

jb.component('studio.script-history', {
  type: 'control', 
  impl :{$: 'group', 
    controls: [
      {$: 'table', 
        items :{$: 'studio.script-history' }, 
        fields: [
        ], 
        style :{$: 'table.with-headers' }
      }
    ], 
    features :{$: 'watch-observable', 
      toWatch: ctx => st.previewjb.ui.stateChangeEm.debounceTime(500), 
      strongRefresh: true
    }
  }
})


})()