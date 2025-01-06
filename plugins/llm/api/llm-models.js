dsl('llm')

component('model', {
  type: 'model',
  params: [
    {id: 'name', as: 'string'},
    {id: 'cost', as: 'number', description: '$/M tokens'},
    {id: 'quality', as: 'number'},
    {id: 'speed', type: 'model_speed' },
    {id: 'maxContextLength', as: 'number', defaultValue: 4096},
    {id: 'reasoning', as: 'boolean', type: 'boolean<>'}
  ]
})

component('linear', {
  type: 'model_speed',
  params: [
    {id: 'icon', as: 'array', byName: true},
    {id: 'card', as: 'array', byName: true}
  ]
})

component('o1_preview', {
  type: 'model',
  impl: model('o1-preview', 60, {
    quality: 12,
    maxCards: 30,
    speed: linear({ icon: [460.15, 16751.08], card: [2929.47, 15580.36] }),
    reasoning: true
  })
})

component('gpt_35_turbo_0125', {
  type: 'model',
  impl: model('gpt-3.5-turbo-0125', 1.5, {
    quality: 3,
    maxCards: 30,
    speed: linear({ icon: [332.87, 958.31], card: [1194.16, 2265.72] })
  })
})

component('o1_mini', {
  type: 'model',
  impl: model('o1-mini', 20, { quality: 8, speed: 1, reasoning: true  })
})

component('gpt_4o', {
  type: 'model',
  impl: model('gpt-4o', 10, { quality: 6, speed: 20 })
})

component('gpt_4o_2024_08_06', {
  type: 'model',
  impl: model('gpt-4o-2024-08-06', 10, { quality: 6, speed: 10 })
})

component('gpt_35_turbo', {
  type: 'model',
  impl: model('gpt-3.5-turbo', 8, { quality: 4, speed: 50 })
})

