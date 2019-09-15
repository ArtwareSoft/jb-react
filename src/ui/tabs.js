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

jb.component('tabs.simple', { /* tabs.simple */
  type: 'group.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div',{}, [
			  h('div',{class: 'tabs-header'}, cmp.titles.map((title,index)=>
					h('button',{class:'mdl-button mdl-js-button mdl-js-ripple-effect' + (index == state.shown ? ' selected-tab': ''),
						onclick: ev=>cmp.show(index)},title))),
				h('div',{class: 'tabs-content'}, h(jb.ui.renderable(cmp.tabs[state.shown]) )) ,
				]),
    css: `>.tabs-header>.selected-tab { border-bottom: 2px solid #66afe9 }
		`,
    features: [group.initTabs(), mdlStyle.initDynamic('.mdl-js-button')]
  })
})
