jb.component('jbComponent', {
  type: 'any',
  params: [
    {id: 'type', as: 'string', mandatory: true},
    {id: 'category', as: 'string'},
    {id: 'description', as: 'string'},
    {id: 'params', type: 'jb-param[]'},
    {id: 'impl', type: '*', dynamicType: '%type%', mandatory: true},
    {id: 'testData', description: 'used as input in inteliscript'}
  ],
  impl: ctx => ctx.params
})

jb.component('jbParam', {
  type: 'jb-param',
  singleInType: true,
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'type', as: 'string'},
    {id: 'description', as: 'string'},
    {id: 'as', as: 'string', options: 'string,number,boolean,ref,single,array'},
    {id: 'dynamic', type: 'boolean', as: 'boolean'},
    {id: 'mandatory', type: 'boolean', as: 'boolean'},
    {id: 'composite', type: 'boolean', as: 'boolean'},
    {id: 'singleInType', type: 'boolean', as: 'boolean'},
    {id: 'defaultValue', dynamicType: '%type%'}
  ],
  impl: ctx => ctx.params
})

