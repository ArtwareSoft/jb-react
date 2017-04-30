import {jb} from 'jb-core';
import * as jb_ui from 'jb-ui';
import {modifyOperationsEm,compAsStrFromPath,notifyModification} from './studio-utils';
import {pathFixer} from './studio-path';

class Undo {
	history = [];
	index = 0;
	clipboard = null;
	constructor() {
		modifyOperationsEm.subscribe(change=>{
			this.history.push(change);
			this.index = this.history.length;
		})
	}
	undo(ctx) {
		if (this.index > 0) {
			this.index--;
			var change = this.history[this.index];
			setComp(change.before,change.ctx.win().jbart);
			jb_ui.apply(ctx);
		}
	}
	redo(ctx) {
		if (this.index < this.history.length) {
			var change = this.history[this.index];
			setComp(change.after,change.ctx.win().jbart);
			this.index++;
			jb_ui.apply(ctx);
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
  		init: cmp => {
  			var before = compAsStrFromPath(path);
  			if (cmp.codeMirror) {
  				cmp.codeMirror.on('focus',()=>
  					before = compAsStrFromPath(path)
  				);
  				cmp.codeMirror.on('blur',()=>{
  					if (before != compAsStrFromPath(path))
						notifyModification(path,before,ctx)
  				});
  			} else {
  			$(cmp.elementRef.nativeElement).findIncludeSelf('input')
  				.focus(e=> {
  					before = compAsStrFromPath(path)
  				})
  				.blur(e=> {
  					if (before != compAsStrFromPath(path))
						notifyModification(path,before,ctx)
  				})
  			}
  		}
  })
})


function doSetComp(jbart_base,id,comp) {
	jbart_base.comps[id] = comp;
	pathFixer.fixSetCompPath(id);
}

function setComp(code,jbart_base) {
	var fixed = code.replace(/^jb.component\(/,'doSetComp(jbart_base,')
	try {
		return eval(`(${fixed})`)
	} catch (e) {
		jb.logException(e,'set comp:'+code);
	}
}
