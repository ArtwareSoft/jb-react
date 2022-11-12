jb.dsl('location')

jb.component('city' ,{
  type: 'city',
  params: [
    { id: 'name', as: 'string'}
  ]
})

jb.component('state', {
  type: 'state',
  params: [
    {id: 'capital', type: 'city'}
  ]
})

jb.component('israel', {
  impl: state(city('Jerusalem'))
})