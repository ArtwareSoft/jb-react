jb.type('button.style')

jb.component('button', {
  type: 'control', category: 'control:100,common:100',
  params: [
    { id: 'title', as: 'string', ref: true, essential: true, defaultTValue: 'click me' },
    { id: 'action', type: 'action', essential: true, dynamic: true },
    { id: 'style', type: 'button.style', defaultValue: { $: 'button.mdl-raised' }, dynamic: true },
    { id: 'features', type: 'feature[]', dynamic: true },
  ],
  impl: ctx =>
    jb.ui.ctrl(ctx,{
      beforeInit: cmp => {
        cmp.state.title = jb.val(ctx.params.title),
        cmp.clicked = ev => {
          if (ev && ev.ctrlKey && cmp.ctrlAction)
            cmp.ctrlAction()
          else
            cmp.action();
        }
      },
      afterViewInit: cmp => 
          cmp.action = jb.ui.wrapWithLauchingElement(ctx.params.action, ctx, cmp.base)
    })
})

jb.component('ctrl-action', {
  type: 'feature', category: 'button:70',
  description: 'action to perform on control+click',
  params: [ 
    { id: 'action', type: 'action', essential: true, dynamic: true },
  ],
  impl: (ctx,action) => ({
      afterViewInit: cmp => 
        cmp.ctrlAction = jb.ui.wrapWithLauchingElement(ctx.params.action, ctx, cmp.base)
  })
})

jb.component('button-disabled', {
  type: 'feature', category: 'button:70',
  description: 'define condition when button is enabled',
  params: [ 
    { id: 'enabledCondition', type: 'boolean', essential: true, dynamic: true },
  ],
  impl: (ctx,cond) => ({
      init: cmp => 
        cmp.isEnabled = ctx2 => cond(ctx.extendVars(ctx2))
  })
})
