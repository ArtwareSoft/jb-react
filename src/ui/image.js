jb.ns('image')

jb.component('image', { /* image */
  type: 'control,image',
  category: 'control:50',
  params: [
    {id: 'url', as: 'string', mandatory: true},
    {id: 'imageWidth', as: 'string'},
    {id: 'imageHeight', as: 'string'},
    {id: 'width', as: 'string'},
    {id: 'height', as: 'string'},
    {id: 'style', type: 'image.style', dynamic: true, defaultValue: image.default()},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx, {
    init: cmp => {
      ['imageWidth','imageHeight','width','height'].map(k=>
          cmp.state[k] = jb.ui.withUnits(ctx.params[k])) 
      cmp.state.url = ctx.params.url
  }})
})

jb.component('image.default', { /* image.default */
  type: 'image.style',
  impl: customStyle({
    template: (cmp,state,h) =>
      h('div',{ style: { width: state.width, height: state.height }}, 
        h('img', {src: state.url, style: {width: state.imageWidth, height: state.imageHeight}})),
  })
})
