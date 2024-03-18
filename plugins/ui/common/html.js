component('html', {
  type: 'control',
  description: 'rich text',
  category: 'control:100,common:80',
  params: [
    {id: 'html', as: 'ref', mandatory: true, templateValue: '<p>html here</p>', dynamic: true, newLinesInCode: true},
    {id: 'title', as: 'string', dynamic: true},
    {id: 'style', type: 'html-style', defaultValue: html.plain(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

component('html.plain', {
  type: 'html-style',
  impl: customStyle({
    template: (cmp,{html},h) => h('div',{$html: (html||'').replace(/^(<[a-z0-9]*)/,'$1 jb_external="true"') } ),
    features: [
      watchAndCalcModelProp('html'),
      () => ({ studioFeatures :{$: 'feature<>feature.contentEditable', param: 'html' } })
    ]
  })
})

component('html.inIframe', {
  type: 'html-style',
  params: [
    {id: 'width', as: 'string', defaultValue: '100%'},
    {id: 'height', as: 'string', defaultValue: '100%'},
    {id: 'id', as: 'string', defaultValue: 'jbart-iframe'}
  ],
  impl: customStyle({
    template: (cmp,{width,height,id},h) => h('iframe', { id, 
        sandbox: 'allow-same-origin allow-forms allow-scripts',
        frameborder: 0, width, height,
        src: 'javascript: document.write(parent.contentForIframe)'
    }),
    features: [
      frontEnd.var('html', '%$$model/html()%'),
      frontEnd.init(({},{html}) => window.contentForIframe = html)
    ]
  })
})
