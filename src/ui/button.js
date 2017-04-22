jb.type('button.style')

jb.component('button', {
  type: 'control', category: 'control:100,common:100',
  params: [
    { id: 'title', as: 'string', dynamic: true, essential: true, defaultTValue: 'click me' },
    { id: 'action', type: 'action', essential: true, dynamic: true },
    { id: 'style', type: 'button.style', defaultValue: { $: 'button.mdl-raised' }, dynamic: true },
    { id: 'features', type: 'feature[]', dynamic: true },
    { id: '$click', type: 'boolean' }, // used by tests to simulate click
  ],
  impl: ctx => {
    if (ctx.params.$click) try { ctx.params.action() } catch (e) { jb.logException(e) } // for test debug
    return jb.ui.ctrl(ctx,{
      beforeInit: cmp =>
        cmp.state.title = ctx.params.title(),
      afterViewInit: cmp => {
        cmp.props.clicked = jb.ui.wrapWithLauchingElement(ctx.params.action, ctx, cmp.base);
      }
    })
  }
})
