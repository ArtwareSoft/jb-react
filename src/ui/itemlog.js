jb.type('itemlog.style');

jb.component('itemlog', {
	type: 'control', category: 'group:50',
	params: [
		{ id: 'title', as: 'string' },
		{ id: 'items', as: 'observable' , dynamic: true, mandatory: true },
    { id: 'controls', type: 'control[]', mandatory: true, dynamic: true},
		{ id: 'style', type: 'itemlog.style', dynamic: true , defaultValue: { $: 'itemlog.div' } },
    { id: 'itemVariable', as: 'string', defaultValue: 'item' },
    { id: 'counter',as : 'ref'},
		{ id: 'features', type: 'feature[]', dynamic: true },
	],
	impl: ctx =>
    jb_ui.ctrl(ctx).jbExtend({
        beforeInit: cmp => {
          cmp.ctrls = [];
          ctx.params.items(ctx).subscribe(itemCtx=>  {
              var ctrl = ctx.params.controls(itemCtx.setVars(jb.obj(ctx.params.itemVariable,itemCtx.data)))[0];
              cmp.ctrls.unshift(ctrl);
              if (ctx.params.counter)
                jb.writeValue(ctx.params.counter,cmp.ctrls.length);
              jb_ui.apply(ctx);
          })
      }
    })
})

jb.component('itemlog.div', {
  type: 'group.style',
  impl :{$: 'customStyle',
    template: `<div class="jb-group jb-itemlog"><div jb-item *ngFor="let ctrl of ctrls">
        <div *jbComp="ctrl"></div>
      </div></div>`
  }
})
