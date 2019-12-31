jb.ns('image')

jb.component('image', { /* image */
  type: 'control,image',
  category: 'control:50,common:70',
  params: [
    {id: 'url', as: 'string', mandatory: true, templateValue: 'https://freesvg.org/img/UN-CONSTRUCTION-2.png'},
    {id: 'imageWidth', as: 'string'},
    {id: 'imageHeight', as: 'string'},
    {id: 'width', as: 'string'},
    {id: 'height', as: 'string'},
    {id: 'style', type: 'image.style', dynamic: true, defaultValue: image.default()},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx, {
    init: cmp => {
      ['imageWidth','imageHeight','width','height'].map(k=> cmp.state[k] = jb.ui.withUnits(ctx.params[k])) 
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

jb.component('image.background-image', { 
  type: 'image.style',
  params: [
      {id: 'backgroundPositionX', as: 'string', description: 'e.g. 50%, right 3px, left 25%'},
      {id: 'backgroundPositionY', as: 'string', description: 'e.g. 50%, bottom 3px, top 25%'},
  ],    
  impl: customStyle({
    template: (cmp,state,h) => h('div', { style: {
            'background-image': `url("${state.url}")`,
            ...(state.width ? {'min-width': jb.ui.withUnits(state.width)} : {}),
            ...(state.height ? {'min-height': jb.ui.withUnits(state.height)} : {}),
        }}),
      css: `
      { 
          background-size: cover; 
          {? background-position-x: %$backgroundPositionX%;?} 
          {? background-position-y: %$backgroundPositionY%; ?}
          background-repeat: no-repeat
      }`
  })
})