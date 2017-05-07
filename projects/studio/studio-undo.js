(function() {
var st = jb.studio;

class Undo {
	constructor() {
		this.history = [];
		this.index = 0;
		this.clipboard = null;
		st.scriptChange.subscribe(change=>{
			this.history.push(change);
			this.index = this.history.length;
		})
	}
	undo(ctx) {
		if (this.index > 0) {
			this.index--;
			var change = this.history[this.index];
			setComp(change.before,change.ctx.win().jbart);
//			jb_ui.apply(ctx);
		}
	}
	redo(ctx) {
		if (this.index < this.history.length) {
			var change = this.history[this.index];
			setComp(change.after,change.ctx.win().jbart);
			this.index++;
//			jb_ui.apply(ctx);
		}
	}
	copy(ctx,path) {
		this.clipboard = ctx.run({$:'studio.profile-as-text', path: path}, {as: 'string'});
	}
	paste(ctx,path) {
		if (this.clipboard != null) {
			var ref = ctx.run({$:'studio.profile-as-text', path: path});
			jb.writeValue(ref,this.clipboard)
		}
	}
}

var undo = new Undo();

jb.component('studio.undo', {
	impl: ctx => undo.undo(ctx)
})

jb.component('studio.redo', {
	impl: ctx => undo.redo(ctx)
})

jb.component('studio.copy', {
	params: [ {id: 'path', as: 'string' } ],
	impl: (ctx,path) => 
		undo.copy(ctx,path)
})

jb.component('studio.paste', {
	params: [ {id: 'path', as: 'string' } ],
	impl: (ctx,path) => 
		undo.paste(ctx,path)
})

jb.component('studio.undo-support', {
  type: 'feature',
  params: [
    { id: 'path', essential: true, as: 'string' },
  ],
  impl: (ctx,path) => 
  	({
  		// saving state on focus and setting the change on blur
  		// init1: cmp => {
  		// 	var before = st.compAsStrFromPath(path);
  		// 	if (cmp.codeMirror) {
  		// 		cmp.codeMirror.on('focus',()=>
  		// 			before = st.compAsStrFromPath(path)
  		// 		);
  		// 		cmp.codeMirror.on('blur',()=>{
  		// 			if (before != st.compAsStrFromPath(path))
				// 		st.notifyModification(path,before,ctx)
  		// 		});
  		// 	} else {
  		// 	$(cmp.base).findIncludeSelf('input')
  		// 		.focus(e=> {
  		// 			before = st.compAsStrFromPath(path)
  		// 		})
  		// 		.blur(e=> {
  		// 			if (before != st.compAsStrFromPath(path))
				// 		st.notifyModification(path,before,ctx)
  		// 		})
  		// 	}
  		// }
  })
})


function doSetComp(jbart_base,id,comp) {
	st.jbart_base().comps[id] = comp;
	st.pathFixer.fixSetCompPath(id);
}

function setComp(code,jbart_base) {
	var fixed = code.replace(/^jb.component\(/,'doSetComp(jbart_base,')
	try {
		return eval(`(${fixed})`)
	} catch (e) {
		jb.logException(e,'set comp:'+code);
	}
}

})()