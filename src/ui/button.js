jb.ns('button')

jb.component('button', { /* button */
  type: 'control,clickable',
  category: 'control:100,common:100',
  params: [
    {id: 'title', as: 'ref', mandatory: true, defaultTValue: 'click me', dynamic: true},
    {id: 'action', type: 'action', mandatory: true, dynamic: true},
    {
      id: 'style',
      type: 'button.style',
      defaultValue: button.mdlRaised(),
      dynamic: true
    },
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx =>
    jb.ui.ctrl(ctx,{
      beforeInit: cmp => {
        cmp.state.title = jb.val(ctx.params.title());
        cmp.refresh = _ =>
          cmp.setState({title: jb.val(ctx.params.title(cmp.ctx))});

        cmp.clicked = ev => {
          if (ev && ev.ctrlKey && cmp.ctrlAction)
            cmp.ctrlAction()
          else if (ev && ev.altKey && cmp.altAction)
            cmp.altAction()
          else
            cmp.action();
        }
      },
      afterViewInit: cmp =>
          cmp.action = jb.ui.wrapWithLauchingElement(ctx.params.action, ctx, cmp.base)
    })
})

jb.component('ctrl-action', { /* ctrlAction */
  type: 'feature',
  category: 'button:70',
  description: 'action to perform on control+click',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: (ctx,action) => ({
      afterViewInit: cmp =>
        cmp.ctrlAction = jb.ui.wrapWithLauchingElement(ctx.params.action, ctx, cmp.base)
  })
})

jb.component('alt-action', { /* altAction */
  type: 'feature',
  category: 'button:70',
  description: 'action to perform on alt+click',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: (ctx,action) => ({
      afterViewInit: cmp =>
        cmp.altAction = jb.ui.wrapWithLauchingElement(ctx.params.action, ctx, cmp.base)
  })
})

jb.component('button-disabled', { /* buttonDisabled */
  type: 'feature',
  category: 'button:70',
  description: 'define condition when button is enabled',
  params: [
    {id: 'enabledCondition', type: 'boolean', mandatory: true, dynamic: true}
  ],
  impl: (ctx,cond) => ({
      init: cmp =>
        cmp.state.isEnabled = ctx2 => cond(ctx.extendVars(ctx2))
  })
})

jb.component('icon-with-action', { /* iconWithAction */
  type: 'control,clickable',
  category: 'control:30',
  params: [
    {id: 'icon', as: 'string', mandatory: true},
    {id: 'title', as: 'string'},
    {id: 'action', type: 'action', mandatory: true, dynamic: true},
    {
      id: 'style',
      type: 'icon-with-action.style',
      dynamic: true,
      defaultValue: button.mdlIcon()
    },
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx =>
    jb.ui.ctrl(ctx, {
			init: cmp=>  {
					cmp.icon = ctx.params.icon;
					cmp.state.title = ctx.params.title;
			},
      afterViewInit: cmp =>
          cmp.clicked = jb.ui.wrapWithLauchingElement(ctx.params.action, ctx, cmp.base)
    })
})
