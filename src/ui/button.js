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
  impl: ctx => jb.ui.ctrl(ctx, ctx.run(features(
      watchAndCalcModelProp('title'),
      watchAndCalcModelProp('raised'),
      defHandler('onclickHandler', (ctx,{cmp, ev}) => {
        //const ev = event
        if (ev && ev.ctrlKey && cmp.ctrlAction)
          cmp.ctrlAction(cmp.ctx.setVar('event',ev))
        else if (ev && ev.altKey && cmp.altAction)
          cmp.altAction(cmp.ctx.setVar('event',ev))
        else
          cmp.action && cmp.action(cmp.ctx.setVar('event',ev))
      }),
      interactive( ({},{cmp}) => cmp.action = jb.ui.wrapWithLauchingElement(ctx.params.action, cmp.ctx, cmp.base)),
      ctx => ({studioFeatures :{$: 'feature.contentEditable', param: 'title' }}),
    )))
})

jb.component('ctrlAction', {
  type: 'feature',
  category: 'button:70',
  description: 'action to perform on control+click',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: interactive(
    (ctx,{cmp},{action}) => cmp.ctrlAction = jb.ui.wrapWithLauchingElement(action, ctx, cmp.base)
  )
})

jb.component('altAction', {
  type: 'feature',
  category: 'button:70',
  description: 'action to perform on alt+click',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: interactive(
    (ctx,{cmp},{action}) => cmp.altAction = jb.ui.wrapWithLauchingElement(action, ctx, cmp.base)
  )
})

jb.component('buttonDisabled', {
  type: 'feature',
  category: 'button:70',
  description: 'define condition when button is enabled',
  params: [
    {id: 'enabledCondition', type: 'boolean', mandatory: true, dynamic: true}
  ],
  impl: interactive(
    (ctx,{cmp},{enabledCondition}) => cmp.isEnabled = ctx2 => enabledCondition(ctx.extendVars(ctx2))
  )
})
