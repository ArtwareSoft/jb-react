jb.ns('button')

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
  impl: ctx => jb.ui.ctrl(ctx, features(
      watchAndCalcModelProp('title'),
      watchAndCalcModelProp('raised'),
      method('onclickHandler', (_ctx,{cmp, ev}) => {
        if (ev && ev.ctrlKey)
          cmp.runBEMethod('ctrlAction',_ctx.data,_ctx.vars)
        else if (ev && ev.altKey)
          cmp.runBEMethod('altAction',_ctx.data,_ctx.vars)
        else
          ctx.params.action(_ctx)
      }),
      feature.userEventProps('ctrlKey,altKey'),
      ctx => ({studioFeatures :{$: 'feature.contentEditable', param: 'title' }}),
    ))
})

jb.component('ctrlAction', {
  type: 'feature',
  category: 'button:70',
  description: 'action to perform on control+click',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: method('ctrlAction', (ctx,{},{action}) => action(ctx))
})

jb.component('altAction', {
  type: 'feature',
  category: 'button:70',
  description: 'action to perform on alt+click',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: method('altAction', (ctx,{},{action}) => action(ctx))
})

