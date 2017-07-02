jb.component('table', {
  type: 'control', category: 'group:80,common:70',
  params: [
    { id: 'title', as: 'string' },
    { id: 'items', as: 'array' , dynamic: true, essential: true, ref: true },
    { id: 'fields', type: 'table-field[]', essential: true, dynamic: true },
    { id: 'style', type: 'table.style', dynamic: true , defaultValue: { $: 'table.with-headers' } },
    { id: 'watchItems', as: 'boolean' },
    { id: 'features', type: 'feature[]', dynamic: true, flattenArray: true },
  ],
  impl: ctx => 
    jb.ui.ctrl(ctx)
})

jb.component('field', {
  type: 'table-field',
  params: [
    { id: 'title', as: 'string', essential: true },
    { id: 'data', as: 'string', essential: true, dynamic: true },
    { id: 'width', as: 'number' },
    { id: 'class', as: 'string' },
  ],
  impl: (ctx,title,data,width,_class) => ({
    title: title,
    fieldData: row => data(ctx.setData(row)),
    class: _class,
    width: width,
    ctxId: jb.ui.preserveCtx(ctx)
  })
})

jb.component('field.control', {
  type: 'table-field',
  params: [
    { id: 'title', as: 'string', essential: true },
    { id: 'control', type: 'control' , dynamic: true, essential: true, defaultValue: {$: 'label', title: ''} },
    { id: 'width', as: 'number' },
  ],
  impl: (ctx,title,control,width) => ({
    title: title,
    control: row => control(ctx.setData(row)).reactComp(),
    width: width,
    ctxId: jb.ui.preserveCtx(ctx)
  })
})

jb.component('table.init', {
  type: 'feature',
  impl: ctx => ({
      beforeInit: cmp => {
        cmp.state.items = calcItems();
        cmp.fields = ctx.vars.$model.fields();

        cmp.initWatchByRef = (refToWatch,includeChildren) =>
            jb.ui.refObservable(refToWatch,cmp,includeChildren)
              .subscribe(e=>
                jb.ui.setState(cmp,{items: calcItems()},e));
        if (ctx.vars.$model.watchItems)
          cmp.initWatchByRef(ctx.vars.$model.items(cmp.ctx))

        function calcItems() {
          cmp.items = jb.toarray(jb.val(ctx.vars.$model.items(cmp.ctx)));
          if (cmp.ctx.vars.itemlistCntr)
              cmp.ctx.vars.itemlistCntr.items = cmp.items;
          return cmp.items;
        }
      },
  })
})

