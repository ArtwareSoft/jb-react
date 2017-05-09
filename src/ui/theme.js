jb.type('theme');

jb.component('group.theme', {
  type: 'feature',
  params: [
    { id: 'theme', type: 'theme' },
  ],
  impl: (context,theme) => ({
    extendCtx: (ctx,cmp) => 
      ctx.setVars(theme)
  })
})

jb.component('theme.material-design', {
  type: 'theme',
  impl: () => ({
  	'$theme.editable-text': 'editable-text.mdl-input'
  })
})
