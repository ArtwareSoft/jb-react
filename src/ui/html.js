jb.ns('html')

jb.component('html', {
  type: 'control',
  description: 'rich text',
  category: 'control:100,common:80',
  params: [
    {id: 'title', as: 'string', mandatory: true, templateValue: 'html', dynamic: true},
    {id: 'html', as: 'ref', mandatory: true, templateValue: '<p>html here</p>', dynamic: true},
    {id: 'style', type: 'html.style', defaultValue: html.plain(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('html.plain', {
  type: 'html.style',
  impl: customStyle({
    template: (cmp,{html},h) => h('div',{$html: html, jb_external: true } ),
    features: [
      watchAndCalcModelProp('html'),
      () => ({ studioFeatures :{$: 'feature.contentEditable', param: 'html' } })
    ]
  })
})

jb.component('html.inIframe', {
  type: 'html.style',
  params: [
    {id: 'width', as: 'string', defaultValue: '100%'},
    {id: 'height', as: 'string', defaultValue: '100%'}
  ],
  impl: customStyle({
    template: (cmp,{width,height},h) => h('iframe', {
        sandbox: 'allow-same-origin allow-forms allow-scripts',
        frameborder: 0, width, height,
        src: 'javascript: document.write(parent.contentForIframe)'
    }),
    features: [
      interactiveProp('html', '%$$model/html%'),
      interactive(({},{cmp}) => window.contentForIframe = cmp.html)
    ]
  })
})
