jb.component('group', {
  type: 'control', category: 'group:100,common:90',
  params: [
    { id: 'title', as: 'string' , dynamic: true },
    { id: 'style', type: 'group.style', defaultValue: { $: 'layout.vertical' }, mandatory: true , dynamic: true },
    { id: 'controls', type: 'control[]', mandatory: true, flattenArray: true, dynamic: true, composite: true },
    { id: 'features', type: 'feature[]', dynamic: true },
  ],
  impl: ctx =>
    jb.ui.ctrl(ctx)
})

jb.component('group.init-group', {
  type: 'feature', category: 'group:0',
  impl: ctx => ({
    init: cmp => {
      cmp.calcCtrls = cmp.calcCtrls || (_ =>
        ctx.vars.$model.controls(cmp.ctx).map(c=>jb.ui.renderable(c)).filter(x=>x))
      if (!cmp.state.ctrls)
        cmp.state.ctrls = cmp.calcCtrls()
      cmp.refresh = cmp.refresh || (_ =>
          cmp.setState({ctrls: cmp.calcCtrls() }))

      if (cmp.ctrlEmitter)
        cmp.ctrlEmitter.subscribe(ctrls=>
              jb.ui.setState(cmp,{ctrls:ctrls.map(c=>jb.ui.renderable(c)).filter(x=>x)},null,ctx))
    }
  })
})

jb.component('inline-controls', {
  type: 'control',
  params: [
    { id: 'controls', type: 'control[]', mandatory: true, flattenArray: true, dynamic: true, composite: true },
  ],
  impl: ctx => ctx.params.controls().filter(x=>x)
})

jb.component('dynamic-controls', {
  type: 'control',
  params: [
    { id: 'controlItems', type: 'data', as: 'array', mandatory: true, dynamic: true },
    { id: 'genericControl', type: 'control', mandatory: true, dynamic: true },
    { id: 'itemVariable', as: 'string', defaultValue: 'controlItem'}
  ],
  impl: (context,controlItems,genericControl,itemVariable) =>
    controlItems()
      .map(jb.ui.cachedMap(controlItem => jb.tosingle(genericControl(
        new jb.jbCtx(context,{data: controlItem, vars: jb.obj(itemVariable,controlItem)})))
      ))
})

jb.component('group.dynamic-titles', {
  type: 'feature', category: 'group:30',
  description: 'dynamic titles for sub controls',
  impl: ctx => ({
    doCheck: cmp =>
      (cmp.state.ctrls || []).forEach(ctrl=>
        ctrl.title = ctrl.jbComp.jb_title ? ctrl.jbComp.jb_title() : '')
  })
})

jb.component('control.first-succeeding', {
  type: 'control', category: 'common:30',
  params: [
    { id: 'controls', type: 'control[]', mandatory: true, flattenArray: true, dynamic: true, composite: true },
    { id: 'title', as: 'string' , dynamic: true },
    { id: 'style', type: 'first-succeeding.style', defaultValue :{$: 'first-succeeding.style' }, mandatory: true , dynamic: true },
    { id: 'features', type: 'feature[]', dynamic: true },
  ],
  impl: ctx => jb.ui.ctrl(new jb.jbCtx(ctx,{params: Object.assign({},ctx.params,{
      originalControls: ctx.profile.controls,
      controls: ctx2 => {
        for(let i=0;i<ctx.profile.controls.length;i++) {
          const res = ctx2.runInner(ctx.profile.controls[i],null,i)
          res.firstSucceedingIndex = i;
          if (res)
            return [res]
        }
        return []
      }
    })}))
})

jb.component('first-succeeding.watch-refresh-on-ctrl-change', {
  type: 'feature', category: 'watch:30', description: 'relevant only for first-succeeding',
  params: [
    { id: 'ref', mandatory: true, as: 'ref', description: 'reference to data' },
    { id: 'includeChildren', as: 'boolean', description: 'watch childern change as well' },
  ],
  impl: (ctx,ref,includeChildren) => ({
      init: cmp =>
        ref && jb.ui.refObservable(ref,cmp,{includeChildren, watchScript: ctx})
        .subscribe(e=>{
          if (ctx && ctx.profile && ctx.profile.$trace)
            console.log('ref change watched: ' + (ref && ref.path && ref.path().join('~')),e,cmp,ref,ctx);
          
          const originalControls = ctx.vars.$model.originalControls
          for(let i=0;i<(originalControls ||[]).length;i++) {
            const res = cmp.ctx.runInner(originalControls[i],null,i)
            if (res) {
              if (cmp.state.ctrls[0].jbComp.firstSucceedingIndex !== i) {
                res.firstSucceedingIndex = i
                jb.ui.setState(cmp,{ctrls: [jb.ui.renderable(res)]},e,ctx);
              }
              return
            }
          }
      })
  })
})


jb.component('control-with-condition', {
  type: 'control',
  usageByValue: true,
  params: [
    { id: 'condition', type: 'boolean', mandatory: true, as: 'boolean' },
    { id: 'control', type: 'control', mandatory: true, dynamic: true },
    { id: 'title', as: 'string' },
  ],
  impl: (ctx,condition,ctrl) =>
    condition && ctrl(ctx)
})
