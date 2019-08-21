jb.component('jb-component', {
  type: '*',
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

jb.component('studio.component-header', {
  type: 'control',
  params: [{ id: 'component', as: 'string' }],
  impl :{$: 'group',
    controls: [
      {$: 'label',
        title: '%$component%',
        style :{$: 'label.htmlTag', htmlTag: 'h5' }
      },
      {$: 'group',
        title: 'type',
        style :{$: 'layout.horizontal',
          vSpacing: 20,
          hSpacing: 20,
          titleWidth: 100,
          spacing: '20'
        },
        controls: [
          {$: 'editable-text',
            title: 'type',
            databind: '%type%',
            style :{$: 'editable-text.mdl-input', width: '100' }
          },
          {$: 'editable-text',
            title: 'category',
            databind: '%category%',
            style :{$: 'editable-text.mdl-input', width: '250' }
          }
        ]
      },
      {$: 'group',
        title: 'params',
        controls: [
          {$: 'table',
            items: '%params%',
            fields: [
              {$: 'field.control',
                title: '',
                control :{$: 'material-icon',
                  icon: 'home',
                  style :{$: 'icon.material' },
                  features :{$: 'itemlist.drag-handle' }
                },
                width: '60'
              },
              {$: 'field.control',
                title: 'id',
                control :{$: 'editable-text',
                  icon: 'person',
                  title: 'id',
                  databind :{$: 'studio.ref',
                    path :{
                      $pipeline: [
                        ctx => Number(ctx.vars.itemlistCntr.items.indexOf(ctx.data)).toString(),
                        '%$component%~params~%%~id'
                      ]
                    }
                  },
                  style :{$: 'editable-text.mdl-input-no-floating-label',
                    width: '101'
                  }
                }
              },
              {$: 'field.control',
                title: 'type',
                control :{$: 'editable-text',
                  icon: 'person',
                  title: 'type',
                  databind :{$: 'studio.ref',
                    path :{
                      $pipeline: [
                        ctx => Number(ctx.vars.itemlistCntr.items.indexOf(ctx.data)).toString(),
                        '%$component%~params~%%~type'
                      ]
                    }
                  },
                  style :{$: 'editable-text.mdl-input-no-floating-label',
                    width: '100'
                  }
                }
              },
              {$: 'field.control',
                title: 'as',
                control :{$: 'editable-text',
                  icon: 'person',
                  title: 'as',
                  databind: '%as%',
                  style :{$: 'editable-text.mdl-input-no-floating-label',
                    width: '100'
                  }
                }
              },
              {$: 'field.control',
                title: 'dynamic',
                control :{$: 'editable-boolean',
                  icon: 'person',
                  databind: '%dynamic%',
                  style :{$: 'editable-boolean.checkbox', width: '150' },
                  title: 'as',
                  textForTrue: 'yes',
                  textForFalse: 'no'
                }
              },
              {$: 'field.control',
                title: '',
                control :{$: 'button',
                  icon: 'delete',
                  title: 'delete',
                  action :{$: 'itemlist-container.delete', item: '%%' },
                  style :{$: 'button.x', size: '21' },
                  features :{$: 'itemlist.shown-only-on-item-hover' }
                },
                width: '60'
              }
            ],
            style :{$: 'table.mdl',
              classForTable: 'mdl-data-table mdl-shadow--2dp',
              classForTd: 'mdl-data-table__cell--non-numeric'
            },
            watchItems: 'true',
            features: [{$: 'itemlist.drag-and-drop' }]
          },
          {$: 'button',
            title: 'add',
            action :{$: 'itemlist-container.add' },
            style :{$: 'button.mdl-raised' }
          }
        ],
        features :{$: 'group.itemlist-container',
          defaultItem :{$: 'object' }
        }
      }
    ],
    features :{$: 'group.data',
      data :{$: 'studio.ref', path: '%$component%' }
    }
  }
})
