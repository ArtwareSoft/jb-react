(function() { var st = jb.studio;

st.modifyOperationsEm = new jb.rx.Subject();
st.pathChangesEm = new jb.rx.Subject();

st.notifyModification = function(path,before,ctx,ngPath) {
	var comp = path.split('~')[0];
	st.modifyOperationsEm.next({ comp: comp, before: before, after: compAsStr(comp), path: path, ctx: ctx, jbart: findjBartToLook(path), ngPath: ngPath });
}

st.message = function(message,error) {
	$('.studio-message').text(message); // add animation
	$('.studio-message').css('background', error ? 'red' : '#327DC8');
	$('.studio-message').css('animation','');
	jb.delay(1).then(()=>
		$('.studio-message').css('animation','slide_from_top 5s ease')
	)
}

st.jbart_base = function() {
	return jb.studio.previewjb || jb;
}

st.findjBartToLook = function(path) {
	var id = path.split('~')[0];
	if (st.jbart_base().comps[id])
		return st.jbart_base();
	if (jb.comps[id])
		return jb;
}

st.getComp = function(id) {
	return st.jbart_base().comps[id] || jb.comps[id];
}

st.compAsStr = function(id) {
	return st.prettyPrintComp(id,getComp(id))
}

st.compAsStrFromPath = function(path) {
	return st.compAsStr(path.split('~')[0])
}

st.evalProfile = function(prof_str) {
	try {
		return eval('('+prof_str+')')
	} catch (e) {
		jb.logException(e,'eval profile:'+prof_str);
	}
}

// ********* Components ************

jb.component('studio.message', {
	type: 'action',
	params: [ { id: 'message', as: 'string' } ],
	impl: (ctx,message) => 
		st.message(message)
})

jb.component('studio.redraw-studio', {
	type: 'action',
	impl: () => 
    	st.redrawStudio && st.redrawStudio()
})

jb.component('studio.goto-path', {
	type: 'action',
	params: [ 
		{ id: 'path', as: 'string' },
	],
	impl :{$runActions: [ 
		{$: 'closeContainingPopup' },
		{$: 'write-value', to: '%$studio/profile_path%', value: '%$path%' }, 
		{$if :{$: 'studio.is-of-type', type: 'control', path: '%$path%'},
			then: {$runActions: [ 
				{$: 'studio.open-properties'},
				{$: 'studio.open-control-tree'} 
			]},
			else :{$: 'studio.open-jb-editor', path: '%$path%' }
		}
	]}
})

jb.component('studio.project-source',{
	params: [ 
		{ id: 'project', as: 'string', defaultValue: '%$studio/project%' } 
	],
	impl: (context,project) => {
		if (!project) return;
		var comps = jb.entries(st.jbart_base().comps).map(x=>x[0]).filter(x=>x.indexOf(project) == 0);
		return comps.map(comp=>compAsStr(comp)).join('\n\n')
	}
})

jb.component('studio.comp-source',{
	params: [ 
		{ id: 'comp', as: 'string', defaultValue: { $: 'studio.currentProfilePath' } } 
	],
	impl: (context,comp) => 
		st.compAsStr(comp.split('~')[0])
})

jb.component('studio.onNextModifiedPath', {
	type: 'action',
	params: [
		{ id: 'action', type: 'action', dynamic: true, essential: true }
	],
	impl: (ctx,action) =>  
		st.modifyOperationsEm.take(1).delay(1)
            .subscribe(e =>
            	action(ctx.setVars({ modifiedPath: e.args.modifiedPath }))
            )
})

jb.component('studio.bindto-modifyOperations', {
  type: 'feature',
  params: [
    { id: 'path', essential: true, as: 'string' },
    { id: 'data', as: 'ref' }
  ],
  impl: (context, path,data_ref) => ({
      init: cmp =>  
        st.modifyOperationsEm
          .takeUntil( cmp.destroyed )
          .filter(e=>
            e.path == path)
          .subscribe(e=>
              jb.writeValue(data_ref,true)
          ),
      jbEmitter: true,
    })
})

jb.component('studio.dynamic-options-watch-new-comp', {
  type: 'feature',
  impl :{$: 'picklist.dynamic-options', 
        recalcEm: () => 
          st.modifyOperationsEm.filter(e => 
            e.newComp)
  }
})


})();
