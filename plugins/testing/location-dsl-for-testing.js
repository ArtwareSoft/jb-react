dsl('location')
extension('location', 'main', {
  typeRules: [ { same: ['data<location>','data<>']} ]
})

component('city', {
  type: 'settlement',
  params: [
    {id: 'name', as: 'string'}
  ]
})

component('village', {
  type: 'settlement',
  params: [
    {id: 'name', as: 'string'}
  ]
})

component('state', {
  type: 'state',
  params: [
    {id: 'capital', type: 'settlement'},
    {id: 'cities', type: 'settlement[]'}
  ]
})

component('israel', {
  impl: state(jerusalem(), { cities: [eilat(), city('Tel Aviv')] })
})

component('israel2', {
  impl: state()
})

component('jerusalem', {
  impl: city('Jerusalem')
})

component('eilat', {
  impl: city('Eilat')
})

component('nokdim', {
  impl: village('Nokdim')
})

component('pipeline', {
  params: [
    {id: 'checkNameOverride'},
    {id: 'state', type: 'state'},
  ],
  impl: village()
})

component('nameOfCity', {
  type: 'data<>',
  params: [
    {id: 'city', type: 'settlement'}
  ],
  impl: '%$city/name%'
})
