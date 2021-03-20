var { button } = jb.ns('button')

jb.component('button', {
  type: 'control,clickable',
  category: 'control:100,common:100',
  params: [
    {id: 'title', as: 'ref', mandatory: true, templateValue: 'click me', dynamic: true},
    {id: 'action', type: 'action', mandatory: true, dynamic: true},
    {id: 'style', type: 'button.style', defaultValue: button.mdc(), dynamic: true},
    {id: 'raised', as: 'boolean', dynamic: true },
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('button.initAction', {
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
    () => ({studioFeatures :{$: 'feature.contentEditable', param: 'title' }}),
  )
})

jb.component('button.ctrlAction', {
  type: 'feature',
  category: 'button:70',
  description: 'action to perform on control+click',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: method('ctrlAction', (ctx,{},{action}) => action(ctx))
})

jb.component('button.altAction', {
  type: 'feature',
  category: 'button:70',
  description: 'action to perform on alt+click',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: method('altAction', (ctx,{},{action}) => action(ctx))
})

