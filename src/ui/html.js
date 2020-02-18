jb.ns('html')

jb.component('html', { /* html */
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

jb.component('html.plain', { /* html.plain */
  type: 'html.style',
  impl: ctx => features(
        watchAndCalcModelProp('html'),
        () => ({
            template: (cmp,{html},h) => h('html',{$html: html, jb_external: true } ) ,
            studioFeatures :{$: 'feature.content-editable', param: 'html' },
        })
    )
})

jb.component('html.in-iframe', { /* html.inIframe */
  type: 'html.style',
  params: [
    {id: 'width', as: 'string', defaultValue: '100%'},
    {id: 'height', as: 'string', defaultValue: '100%'}
  ],
  impl: features(
    ctx => ({
            template: (cmp,{width,height},h) => h('iframe', {
                sandbox: 'allow-same-origin allow-forms allow-scripts',
                frameborder: 0, width, height,
                src: 'javascript: document.write(parent.contentForIframe)'
            })
        }),
    interactiveProp('html', '%$$model/html%'),
    interactive(({},{cmp}) => window.contentForIframe = cmp.html)
  )
})
