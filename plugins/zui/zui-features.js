dsl('zui')


component('backgroundColorByProp', {
  type: 'be_feature',
  params: [
    {id: 'prop', type: 'itemProp', mandatory: true},
    {id: 'colorScale', type: 'color_scale', defaultValue: greens()}
  ],
  impl: (ctx,prop,colorScale) => ({
    enrich(view) { view.backgroundColorByProp = { prop, colorScale} }
  })
})

component('borderTypeByProp', {
  type: 'be_feature',
  params: [
    {id: 'prop', type: 'itemProp', mandatory: true}
  ],
  impl: (ctx,prop) => ({
    enrich(view) { view.borderTypeByProp = prop}
  })
})