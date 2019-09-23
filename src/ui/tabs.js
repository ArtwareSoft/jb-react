jb.component('tabs', { /* tabs */
  type: 'control',
  category: 'group:80',
  params: [
    {id: 'tabs', type: 'control[]', mandatory: true, flattenArray: true, dynamic: true},
    {id: 'style', type: 'tabs.style', dynamic: true, defaultValue: tabs.simple()},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx =>
    jb.ui.ctrl(ctx)
})

jb.component('group.init-tabs', { /* group.initTabs */
  type: 'feature',
  category: 'group:0',
  params: [
    {id: 'keyboardSupport', as: 'boolean', type: 'boolean'},
    {id: 'autoFocus', as: 'boolean', type: 'boolean'}
  ],
  impl: ctx => ({
    init: cmp => {
			cmp.tabs = ctx.vars.$model.tabs();
      cmp.titles = cmp.tabs.map(tab=>tab && tab.field.title(ctx));
			cmp.state.shown = 0;

      cmp.show = index =>
        jb.ui.setState(cmp,{shown: index},null,ctx);

      cmp.next = diff =>
        cmp.setState({shown: (cmp.state.index + diff + cmp.ctrls.length) % cmp.ctrls.length});
    },
  })
})

