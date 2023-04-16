jb.dsl('location')

component('city' , {
  type: 'settlement',
  params: [
    { id: 'name', as: 'string'}
  ]
})

component('village' , {
  type: 'settlement',
  params: [
    { id: 'name', as: 'string'}
  ]
})

component('state', {
  type: 'state',
  params: [
    {id: 'capital', type: 'settlement'},
    {id: 'cities', type: 'settlement[]'}
  ],
  impl: ({params}) => params
})

component('israel', {
  impl: state(jerusalem(), [eilat(), city('Tel Aviv')])
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
    {id: 'checkNameOverride'}
  ],
  impl: village()
})

component('location.control', {
  type: 'control<>',
  params: [
    {id: 'state', type: 'state<location>'}
  ],
  impl: group({
    controls: [
      text({text: '%$state/capital/name%', style: header.h2()}),
      itemlist({items: '%$state/cities%', controls: text('%name%')})
    ]
  })
})

