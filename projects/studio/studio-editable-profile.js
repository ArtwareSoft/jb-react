jb.component('studio.editable-profile', {
    type: 'control',
    params: [
      { id: 'path', as: 'string' },
      { id: 'fields', dynamic: true, defaultValue :{$: 'studio.non-control-children', path: '%$model/path%' }},
      { id: 'menu', type: 'editable-profile.menu', defaultValue :{$: 'editable-profile.basic-menu' }, mandatory: true , dynamic: true },
      { id: 'style', type: 'editable-profile.style', defaultValue :{$: 'editable-profile.two-level' }, mandatory: true , dynamic: true },
      { id: 'features', type: 'feature[]', dynamic: true },
    ],
    impl: ctx =>
      jb.ui.ctrl()
})

jb.component('editable-profile.init-flatten-properties', {
    type: 'feature', category: 'editable-profile:0',
    params: [
        {id: 'profileSelector', type: 'control', dynamic: true, defaultValue :{$: 'studio.pick-profile', path: '%$model/path%' }},
        {id: 'propertyField', type: 'control', dynamic: true, defaultValue :{$: 'studio.property-field', path: '%$path%' }},
    ],
    impl: ctx => ({
      init: cmp => {
        const st = jb.studio;
        const model = ctx.vars.$model;
        cmp.state.title = st.propName(model.path);
        cmp.state.profileSelector = ctx.params.profileSelector(ctx);

        cmp.calcCtrls = _ => ctx.vars.$model.fields(cmp.ctx)
            .map(path => ctx.params.propertyField(ctx.setVars({path})))
            .map(c=>jb.ui.renderable(c))
            .filter(x=>x)

        if (!cmp.state.ctrls)
          cmp.state.ctrls = cmp.calcCtrls()
        cmp.refresh = cmp.refresh || (_ => cmp.setState({ctrls: cmp.calcCtrls() }))
      }
    })
})
  
jb.component('editable-profile.flatten-properties', {
    type: 'editable-profile.style',
    impl :{$: 'custom-style',
      features :{$: 'editable-profile.init-flatten-properties' },
      template: (cmp,state,h) => h('table',{}, [
        h('tr',{ class: 'property' },[
            h('td',{ class: 'property-title', title: state.title}, state.title),
            h('td',{ class: 'property-ctrl'}, h(state.profileSelector)),
            h('td',{ class: 'property-toolbar'}, h(state.profileSelector.toolbar) ),
        ]), 
      ...state.ctrls.map(ctrl=>
        h('tr',{ class: 'property' },[
            h('td',{ class: 'property-title', title: ctrl.title}, ctrl.title),
            h('td',{ class: 'property-ctrl'},h(ctrl)),
            h('td',{ class: 'property-toolbar'}, h(ctrl.toolbar) ),
        ]))]
      ),
      css: `
        { width: 100% }
        >.property>.property-title { width: 90px; padding-right: 5px; padding-top: 5px }
        >.property>td { vertical-align: top; }
      `,
    }
  })
  

jb.component('editable-profile.codemirror', {
    type: 'editable-profile.style',
    params: [],
})

jb.component('editable-profile.one-line', {
    type: 'editable-profile.style',
    params: [
        {id: 'onClick', type: 'action', dynamic: true }
    ],
})