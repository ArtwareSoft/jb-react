jb.dsl('location')

jb.component('city' , {
  type: 'settlement',
  params: [
    { id: 'name', as: 'string'}
  ]
})

jb.component('village' , {
  type: 'settlement',
  params: [
    { id: 'name', as: 'string'}
  ]
})

jb.component('state', {
  type: 'state',
  params: [
    {id: 'capital', type: 'settlement'},
    {id: 'cities', type: 'settlement[]'}
  ],
  impl: ({params}) => params
})

jb.component('israel', {
  impl: state(jerusalem(), [eilat(), city('Tel Aviv')])
})

jb.component('jerusalem', {
  impl: city('Jerusalem')
})

jb.component('eilat', {
  impl: city('Eilat')
})

jb.component('nokdim', {
  impl: village('Nokdim')
})

jb.component('location.control', {
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

