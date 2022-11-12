jb.dsl('loc')

jb.component('city' ,{
  type: 'city',
  params: [
    { id: 'name', as: 'string'}
  ]
})

jb.component('state', {
  type: 'state',
  params: [
    {id: 'capital', type: 'city'},
    {id: 'moreCities', type: 'city[]'}
  ],
  impl: ({params}) => params
})

jb.component('israel', {
  impl: state(city('Jerusalem'), [city('Eilat'), city('Tel Aviv')])
})

// jb.component('loc.control', {
//   type: 'control<>',
//   params: [
//     {id: 'state', type: 'state'}
//   ],
//   impl: group({
//     controls: [
//       text({text: '%$state/capital/name%', style: header.h2()}),
//       itemlist({items: '%$state/cities%', controls: text('%name%')})
//     ]
//   })
// })

