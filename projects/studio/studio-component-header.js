jb.component('jbComponent', {
  type: 'any',
  params: [
    {id: 'type', as: 'string', mandatory: true},
    {id: 'category', as: 'string'},
    {id: 'description', as: 'string'},
    {id: 'params', type: 'jbParam[]', defaultValue: [{id: '', as: ''}]},
    {id: 'impl', type: '*', dynamicType: '%type%', mandatory: true},
  ],
  impl: ctx => ctx.params
})

jb.component('jbParam', {
  type: 'jbParam',
  singleInType: true,
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'type', as: 'string'},
    {id: 'description', as: 'string'},
    {id: 'as', as: 'string', options: 'string,number,boolean,ref,single,array'},
    {id: 'dynamic', type: 'boolean', as: 'boolean', defaultValue: true},
    {id: 'mandatory', type: 'boolean', as: 'boolean', defaultValue: true},
    {id: 'composite', type: 'boolean', as: 'boolean', defaultValue: true},
    {id: 'singleInType', type: 'boolean', as: 'boolean', defaultValue: true},
    {id: 'defaultValue', dynamicType: '%type%'}
  ],
  impl: ctx => ctx.params
})

