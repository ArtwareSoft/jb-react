extension('markdown', {
  $requireLibs: ['/dist/mark.js'],
})

component('markdown', {
  type: 'control',
  category: 'control:20',
  description: 'md markdown viewer',
  params: [
    {id: 'markdown', as: 'string', mandatory: true, dynamic: true, newLinesInCode: true},
    {id: 'style', type: 'markdown-style', defaultValue: markdown.mark(), dynamic: true},
    {id: 'title', as: 'string', defaultValue: 'markdown', dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

component('markdown.mark', {
  type: 'markdown-style',
  impl: customStyle({
    template: ({},{html},h) => h('div', {jb_external: true}, h('div', {$html: html})),
    features: [
      calcProp('html', (ctx,{$model}) => jb.frame.marked && jb.frame.marked($model.markdown(ctx)) || '')
    ]
  })
})
