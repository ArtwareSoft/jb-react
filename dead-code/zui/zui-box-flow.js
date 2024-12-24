dsl('zui')

component('zui.boxFlow', {
  type: 'view',
  params: [
    {id: 'items', as: 'array', dynamic: true, mandatory: true},
    {id: 'DIM', as: 'number', defaultValue: 256},
    {id: 'itemView', type: 'view', mandatory: true, dynamic: true},
    {id: 'itemProps', type: 'itemProp[]', dynamic: true},
  ]
})
  
