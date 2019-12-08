jb.ns('group,layout,tabs')

jb.component('group', { /* group */
  type: 'control',
  category: 'group:100,common:90',
  params: [
    {id: 'title', as: 'string', dynamic: true},
    {id: 'layout', type: 'layout' },
    {
      id: 'style',
      type: 'group.style',
      defaultValue: group.div(),
      mandatory: true,
      dynamic: true
    },
    {
      id: 'controls',
      type: 'control[]',
      mandatory: true,
      flattenArray: true,
      dynamic: true,
      composite: true
    },
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx =>
    jb.ui.ctrl(ctx,ctx.params.layout)
})

jb.component('group.init-group', { /* group.initGroup */
  type: 'feature',
  category: 'group:0',
  impl: ctx => ({
    init: cmp => {
      cmp.calcCtrls = cmp.calcCtrls || (() => ctx.vars.$model.controls(cmp.ctx).filter(x=>x))
      if (!cmp.state.ctrls)
        cmp.state.ctrls = cmp.calcCtrls()
      cmp.refresh = cmp.refresh || (() => cmp.setState({ctrls: cmp.calcCtrls() }))
    }
  })
})

jb.component('inline-controls', { /* inlineControls */
  type: 'control',
  params: [
    {
      id: 'controls',
      type: 'control[]',
      mandatory: true,
      flattenArray: true,
      dynamic: true,
      composite: true
    }
  ],
  impl: ctx => ctx.params.controls().filter(x=>x)
})

jb.component('dynamic-controls', { /* dynamicControls */
  type: 'control',
  params: [
    {id: 'controlItems', type: 'data', as: 'array', mandatory: true, dynamic: true},
    {id: 'genericControl', type: 'control', mandatory: true, dynamic: true},
    {id: 'itemVariable', as: 'string', defaultValue: 'controlItem'}
  ],
  impl: (context,controlItems,genericControl,itemVariable) =>
    controlItems()
      .map(jb.ui.cachedMap(controlItem => jb.tosingle(genericControl(
        new jb.jbCtx(context,{data: controlItem, vars: jb.obj(itemVariable,controlItem)})))
      ))
})

jb.component('group.dynamic-titles', { /* group.dynamicTitles */
  type: 'feature',
  category: 'group:30',
  description: 'dynamic titles for sub controls',
  impl: ctx => ({
    componentWillUpdate: cmp =>
      (cmp.state.ctrls || []).forEach(ctrl=> ctrl.title = ctrl.field().title ? ctrl.field().title() : '')
  })
})

jb.component('control.first-succeeding', { /* control.firstSucceeding */
  type: 'control',
  category: 'common:30',
  params: [
    {
      id: 'controls',
      type: 'control[]',
      mandatory: true,
      flattenArray: true,
      dynamic: true,
      composite: true
    },
    {id: 'title', as: 'string', dynamic: true},
  {
      id: 'style',
      type: 'first-succeeding.style',
      defaultValue: firstSucceeding.style(),
      mandatory: true,
      dynamic: true
    },
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(new jb.jbCtx(ctx,{params: Object.assign({},ctx.params,{
      originalControls: ctx.profile.controls,
      controls: ctx2 => {
        try {
          for(let i=0;i<ctx.profile.controls.length;i++) {
            const res = ctx2.runInner(ctx.profile.controls[i],null,i)
            if (res) {
              res.firstSucceedingIndex = i;
              return [res]
            }
          }
          return []
        } catch(e) {
          return []
        }
      }
    })}))
})

jb.component('first-succeeding.watch-refresh-on-ctrl-change', { /* firstSucceeding.watchRefreshOnCtrlChange */
  type: 'feature',
  category: 'watch:30',
  description: 'relevant only for first-succeeding',
  params: [
    {
      id: 'ref',
      mandatory: true,
      as: 'ref',
      dynamic: true,
      description: 'reference to data'
    },
    {
      id: 'includeChildren',
      as: 'boolean',
      description: 'watch childern change as well',
      type: 'boolean'
    }
  ],
  impl: (ctx,refF,includeChildren) => ({
      init: cmp => {
        const ref = refF(cmp.ctx)
        ref && jb.ui.refObservable(ref,cmp,{includeChildren, srcCtx: ctx})
        .subscribe(e=>{
          if (ctx && ctx.profile && ctx.profile.$trace)
            console.log('ref change watched: ' + (ref && ref.path && ref.path().join('~')),e,cmp,ref,ctx);

          const originalControls = ctx.vars.$model.originalControls
          if (!originalControls) return
          for(let i=0;i<(originalControls ||[]).length;i++) {
            const res = cmp.ctx.runInner(originalControls[i],null,i)
            if (res) {
              if (cmp.state.ctrls[0].firstSucceedingIndex !== i) {
                res.firstSucceedingIndex = i
                jb.ui.setState(cmp,{ctrls: [jb.ui.renderable(res)]},e,ctx);
              }
              return
            }
          }
      })
    }
  })
})

jb.component('control-with-condition', { /* controlWithCondition */
  type: 'control',
  macroByValue: true,
  params: [
    {id: 'condition', type: 'boolean', dynamic: true, mandatory: true, as: 'boolean'},
    {id: 'control', type: 'control', mandatory: true, dynamic: true},
    {id: 'title', as: 'string'}
  ],
  impl: (ctx,condition,ctrl) =>
    condition() && ctrl(ctx)
})
