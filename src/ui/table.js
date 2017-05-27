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
    { id: 'field', as: 'string', essential: true },
    { id: 'class', as: 'string' },
  ],
  impl: (ctx,title,property,_class) => ({
    title: title,
    fieldData: row => row[property],
    class: _class,
    ctx: ctx
  })
})

jb.component('field.calculated', {
  type: 'table-field',
  params: [
    { id: 'title', as: 'string', essential: true },
    { id: 'formula', as: 'string' , dynamic: true, essential: true, description: 'relative to item' },
    { id: 'class', as: 'string' },
  ],
  impl: (ctx,title,formula,_class) => ({
    title: title,
    fieldData: row => 
      formula(ctx.setData(row)),
    class: _class,
    ctx: ctx
  })
})

jb.component('field.control', {
  type: 'table-field',
  params: [
    { id: 'title', as: 'string', essential: true },
    { id: 'control', type: 'control' , dynamic: true, essential: true },
  ],
  impl: (ctx,title,control) => ({
    title: title,
    control: row => control(ctx.setData(row)).reactComp(),
    ctx: ctx
  })
})

jb.component('table.init', {
  type: 'feature',
  impl: ctx => ({
      beforeInit: cmp => {
        cmp.items = cmp.state.items = jb.toarray(jb.val(ctx.vars.$model.items(cmp.ctx)));
        cmp.fields = ctx.vars.$model.fields();

        cmp.initWatchByRef = refToWatch =>
            jb.ui.refObservable(refToWatch,cmp)
              .subscribe(e=>
                jb.ui.setState(cmp,{items: cmp.items = jb.toarray(jb.val(ctx.vars.$model.items(cmp.ctx)))},e));
        if (ctx.vars.$model.watchItems)
          cmp.initWatchByRef(ctx.vars.$model.items(cmp.ctx))
      },
  })
})

jb.component('table.with-headers', {
  type: 'table.style',
  impl :{$: 'custom-style',
    template: (cmp,state,h) => h('table',{},[
        h('thead',{},h('tr',{},cmp.fields.map(f=>h('th',{'jb-ctx': f.ctx.id },f.title)) )),
        h('tbody',{class: 'jb-drag-parent'},
            state.items.map(item=> jb.ui.item(cmp,h('tr',{ 'jb-ctx': jb.ui.preserveCtx(cmp.ctx.setData(item))},cmp.fields.map(f=>
              h('td', { 'jb-ctx': f.ctx.id, class: f.class }, f.control ? h(f.control(item)) : f.fieldData(item))))
              ,item))
        )]),
    features:{$: 'table.init'},
    css: '{border-spacing: 0}'
  }
})

