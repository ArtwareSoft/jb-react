jb.component('jb-component', {
  type: 'any',
  params: [
    { id: 'type', as: 'string', mandatory: true },
    { id: 'category', as: 'string'},
    { id: 'description', as: 'string'},
    { id: 'params', type: 'jb-param[]'},
    { id: 'impl', dynamicType: '%type%', mandatory: true  },
  ],
  impl: ctx => ctx.params
})

jb.component('jb-param', {
  type: 'jb-param', singleInType: true,
  params: [
    { id: 'id', as: 'string', mandatory: true },
    { id: 'type', as: 'string'},
    { id: 'description', as: 'string'},
    { id: 'as', as: 'string', options: 'string,number,boolean,ref,single,array'},
    { id: 'dynamic', type: 'boolean', as: 'boolean'},
    { id: 'mandatory', type: 'boolean', as: 'boolean'},
    { id: 'composite', type: 'boolean', as: 'boolean'},
    { id: 'singleInType', type: 'boolean', as: 'boolean'},
    { id: 'defaultValue', dynamicType: '%type%' },
  ],
  impl: ctx => ctx.params
})

jb.component('studio.component-header', { /* studio_componentHeader */ 
  type: 'control',
  params: [
    {id: 'component', as: 'string'}
  ],
  impl: group({
    controls: [
      label({title: '%$component%', style: label_htmlTag('h5')}),
      group({
        title: 'type',
        style: layout_horizontal('20'),
        controls: [
          editableText({title: 'type', databind: '%type%', style: editableText_mdlInput('100')}),
          editableText({title: 'category', databind: '%category%', style: editableText_mdlInput('250')})
        ]
      }),
      group({
        title: 'params',
        controls: [
          table({
            items: '%params%',
            fields: [
              field_control({
                title: '',
                control: materialIcon({icon: 'home', style: icon_material(), features: itemlist_dragHandle()}),
                width: '60'
              }),
              field_control({
                title: 'id',
                control: editableText({
                  title: 'id',
                  databind: studio_ref(
                    pipeline(
                      ctx => Number(ctx.vars.itemlistCntr.items.indexOf(ctx.data)).toString(),
                      '%$component%~params~%%~id'
                    )
                  ),
                  style: editableText_mdlInputNoFloatingLabel('101')
                })
              }),
              field_control({
                title: 'type',
                control: editableText({
                  title: 'type',
                  databind: studio_ref(
                    pipeline(
                      ctx => Number(ctx.vars.itemlistCntr.items.indexOf(ctx.data)).toString(),
                      '%$component%~params~%%~type'
                    )
                  ),
                  style: editableText_mdlInputNoFloatingLabel('100')
                })
              }),
              field_control({
                title: 'as',
                control: editableText({title: 'as', databind: '%as%', style: editableText_mdlInputNoFloatingLabel('100')})
              }),
              field_control({
                title: 'dynamic',
                control: editableBoolean({
                  databind: '%dynamic%',
                  style: editableBoolean_checkbox(),
                  title: 'as',
                  textForTrue: 'yes',
                  textForFalse: 'no'
                })
              }),
              field_control({
                title: '',
                control: button({
                  title: 'delete',
                  action: itemlistContainer_delete('%%'),
                  style: button_x('21'),
                  features: itemlist_shownOnlyOnItemHover()
                }),
                width: '60'
              })
            ],
            style: table_mdl('mdl-data-table mdl-shadow--2dp', 'mdl-data-table__cell--non-numeric'),
            watchItems: 'true',
            features: [itemlist_dragAndDrop()]
          }),
          button({title: 'add', action: itemlistContainer_add(), style: button_mdlRaised()})
        ],
        features: group_itemlistContainer({defaultItem: {$: 'object'}})
      })
    ],
    features: group_data({data: studio_ref('%$component%')})
  })
})
