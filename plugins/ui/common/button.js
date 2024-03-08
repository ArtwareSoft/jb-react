component('button', {
  type: 'control',
  category: 'control:100,common:100',
  params: [
    {id: 'title', as: 'ref', mandatory: true, templateValue: 'click me', dynamic: true},
    {id: 'action', type: 'action', mandatory: true, dynamic: true},
    {id: 'style', type: 'button-style', defaultValue: button.native(), dynamic: true},
    {id: 'raised', as: 'boolean', dynamic: true, type: 'boolean'},
    {id: 'disabledTillActionFinished', as: 'boolean', type: 'boolean'},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

component('button.initAction', {
  type: 'feature',
  category: 'button:0',
  impl: features(
    watchAndCalcModelProp('title'),
    watchAndCalcModelProp('raised'),
    method('onclickHandler', (ctx,{cmp, ev, $model}) => {
      if (jb.path(ev,'ev.ctrlKey'))
        cmp.runBEMethod('ctrlAction',ctx.data,ctx.vars)
      else if (jb.path(ev,'ev.alyKey'))
        cmp.runBEMethod('altAction',ctx.data,ctx.vars)
      else
        $model.action(ctx)
    }),
    feature.userEventProps('ctrlKey,altKey'),
    () => ({studioFeatures :{$: 'feature<>feature.contentEditable', param: 'title' }})
  )
})

component('button.initDisabled', {
  type: 'feature',
  category: 'button:0',
  impl: features(
    watchAndCalcModelProp('title'),
    watchAndCalcModelProp('raised'),
    frontEnd.method('disable', ({data},{el}) => { 
      const btn = jb.ui.findIncludeSelf(el,'button')[0]
      if (btn)
        data ? btn.setAttribute('disabled',data) : btn.removeAttribute('disabled')
    }),
    frontEnd.flow(
      source.event('click'),
      rx.do(action.runFEMethod('disable', true)),
      rx.mapPromise(action.runBEMethod('handleClick')),
      rx.do(action.runFEMethod('disable', false)),
      sink.action()
    ),
    method('handleClick', (ctx,{cmp, ev, $model}) => {
      if (jb.path(ev,'ev.ctrlKey'))
        cmp.runBEMethod('ctrlAction',ctx.data,ctx.vars)
      else if (jb.path(ev,'ev.alyKey'))
        cmp.runBEMethod('altAction',ctx.data,ctx.vars)
      else
        $model.action(ctx)
    }),
    feature.userEventProps('ctrlKey,altKey'),
    () => ({studioFeatures :{$: 'feature<>feature.contentEditable', param: 'title' }})
  )
})

component('button.ctrlAction', {
  type: 'feature',
  category: 'button:70',
  description: 'action to perform on control+click',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: method('ctrlAction', (ctx,{},{action}) => action(ctx))
})

component('button.altAction', {
  type: 'feature',
  category: 'button:70',
  description: 'action to perform on alt+click',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: method('altAction', (ctx,{},{action}) => action(ctx))
})

component('button.native', {
  type: 'button-style',
  impl: customStyle({
    template: (cmp,{title,raised},h) => h('button',{class: raised ? 'raised' : '', title, onclick: true },title),
    css: '.raised {font-weight: bold}',
    features: button.initAction()
  })
})

