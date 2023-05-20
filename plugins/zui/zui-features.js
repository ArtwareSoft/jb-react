dsl('zui')

component('priorty', {
  type: 'view_feature',
  params: [
    {id: 'priority', mandatory: true, as: 'number', description: 'scene enter order'}
  ],
  impl: (ctx,priority) => ({
    enrich(obj) { obj.priority = priority}
  })
})

component('backgroundColorByProp', {
  type: 'view_feature',
  params: [
    {id: 'prop', type: 'itemProp', mandatory: true},
    {id: 'colorScale', mandatory: true, type: 'color_scale', defaultValue: green() }
  ],
  impl: (ctx,prop,colorScale) => ({
    enrich(obj) { obj.backgroundColorByProp = { prop, colorScale} }
  })
})

component('borderTypeByProp', {
  type: 'view_feature',
  params: [
    {id: 'prop', type: 'itemProp', mandatory: true},
  ],
  impl: (ctx,prop) => ({
    enrich(obj) { obj.borderTypeByProp = prop}
  })
})