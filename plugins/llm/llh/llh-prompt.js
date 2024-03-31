dsl('llh')

component('llh.prompt', {
  type: 'data<>',
  params: [
    {id: 'features', type: 'prompt-feature[]'}
  ]
})

component('text', {
  type: 'prompt-feature',
  params: [
    {id: 'text', as: 'string', mandatory: true}
  ],
})

component('outputAsMD', {
  type: 'prompt-feature',
  impl: text('please provide the output in markdown format')
})

component('example', {
  type: 'prompt-feature',
  params: [
    {id: 'exampleId', as: 'string', mandatory: true}
  ],
})

component('file', {
  type: 'prompt-feature',
  params: [
    {id: 'path', as: 'string', mandatory: true}
  ],
})
