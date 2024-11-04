dsl('zui')

component('zui.gridView', {
  type: 'view',
  params: [
    {id: 'items', as: 'array', dynamic: true, mandatory: true},
    {id: 'DIM', as: 'number', defaultValue: 256},
    {id: 'itemView', type: 'view', mandatory: true, dynamic: true},
    {id: 'itemProps', type: 'itemProp[]', dynamic: true},
    {id: 'features', type: 'view_feature[]', dynamic: true}
  ]
})
  
