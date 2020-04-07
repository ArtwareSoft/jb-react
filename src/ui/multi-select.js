jb.ns('multiSelect')

jb.component('multiSelect', {
    type: 'control',
    description: 'select list of options, check multiple',
    category: 'input:80',
    params: [
      {id: 'title', as: 'string', dynamic: true},
      {id: 'databind', as: 'ref', mandaroy: true, dynamic: true },
      {id: 'choiceRef', as: 'multiSelect.choiceRef', mandaroy: true, dynamic: true, defaultValue: multiSelect.commaSeparatedCodes() },
      {id: 'options', type: 'picklist.options', dynamic: true, mandatory: true },
      {id: 'promote', type: 'picklist.promote', dynamic: true},
      {id: 'style', type: 'multiSelect.style', defaultValue: picklist.native(), dynamic: true},
      {id: 'features', type: 'feature[]', dynamic: true}
    ],
    impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('multiSelect.commaSeparatedCodes', {
    type: 'multiSelect.choiceRef',
    impl: ctx => ({
        init(databind) { this.ref = databind},
        asArray() { return jb.val(this.ref).split(',') },
        has(code) { return jb.val(this.ref).split(',').indexOf(code) != -1 },
        add(code) { if (!this.has(code)) jb.writeValue(this.ref,jb.val(this.ref) + ',' + code,ctx) },
        remove(code) { 
            jb.writeValue(this.ref, this.asArray().filter(x=>x != code).join(','),ctx)
        },
        splice(fromIndex,noOfItemsToRemove,...itemsToAdd) { 
            const ar = this.asArray()
            ar.splice(fromIndex,noOfItemsToRemove,...itemsToAdd)
            jb.writeValue(this.ref, ar.join(','),ctx)
        },
        asBooleanRef(code) { 
            return val => val === undefined ? this.has(code) : val === true ? this.add(code) : this.remove(code) 
        }
    })
})

jb.component('multiSelect.ArrayOfCodes', {
    type: 'multiSelect.choiceRef',
    impl: ctx => ({
        init(databind) { this.ref = databind},
        asArray() { return jb.val(this.ref) },
        has(code) { return jb.val(this.ref).indexOf(code) != -1 },
        add(code) { if (!this.has(code)) jb.push(this.ref, code,ctx) },
        remove(code) { 
            const index = jb.val(this.ref).indexOf(code)
            index != -1 && jb.splice(this.ref,[[index,1]],ctx)
        },
        splice(fromIndex,noOfItemsToRemove,...itemsToAdd) { 
            jb.splice(array,[[fromIndex,noOfItemsToRemove,...itemsToAdd]],ctx)
        },
        asBooleanRef(code) { 
            return val => val === undefined ? this.has(code) : val === true ? this.add(code) : this.remove(code) 
        }
    })
})

jb.component('multiSelect.choiceList', {
    type: 'multiSelect.style',
    params: [
      {id: 'choiceStyle', type: 'editable-boolean.style', dynamic: true, defaultValue: editableBoolean.checkboxWithTitle()},
      {id: 'itemlistStyle', type: 'itemlist.style', dynamic: true, defaultValue: itemlist.ulLi()},
    ],
    impl: styleByControl(
      itemlist({
        items: '%$multiSelectModel/options%',
        controls: editableBoolean({
            title: '%text%', 
            databind: (ctx,{multiSelectModel}) => multiSelectModel.choiceRef.asBooleanRef(ctx.data.code), 
            style: call('choiceStyle')
        }),
        style: call('itemlistStyle'),
      }),
      'multiSelectModel'
    )
})

jb.component('multiSelect.chipList', {
    type: 'multiSelect.style',
    impl: styleByControl(group({
        layout: layout.horizontal(),
        controls: [
          group({
            title: 'chips',
            layout: layout.flex({wrap: 'wrap'}),
            controls: dynamicControls({
                controlItems: '%$multiSelectModel/choiceRef/asArray%',
                genericControl: group({
                  title: 'chip',
                  layout: layout.flex({wrap: 'wrap', spacing: '0'}),
                  controls: [
                    button({
                        title: '%text% ', 
                        style: button.mdcChipAction(),
                        action: (ctx,{multiSelectModel}) => multiSelectModel.choiceRef.remove(ctx.data.code)
                    }),
                    button({
                      title: 'delete',
                      style: button.x(),
                      features: [
                        css('color: black; z-index: 1000;margin-left: -30px'),
                        itemlist.shownOnlyOnItemHover()
                      ]
                    })
                  ],
                  features: [
                    css('color: black; z-index: 1000'),
                    css.class('jb-item')
                  ]
                })
            }),
            features: watchRef({
              ref: '%$multiSelectModel/databind%',
              includeChildren: 'yes',
              allowSelfRefresh: true,
              strongRefresh: false
            })
          }),
          group({
            title: 'add',
            layout: layout.horizontal('20'),
            controls: [
              picklist({
                options: picklist.options('%$multiSelectModel/options%'),
                features: [
                  picklist.onChange(
                    (ctx,{multiSelectModel}) => multiSelectModel.choiceRef.add(ctx.data.code)
                  ),
                  css.margin('6')
                ]
              })
            ],
            features: css.margin({left: '10'})
          })
        ],
    }), 'multiSelectModel')
})

jb.component('multiSelect.itemlist', {
    type: 'multiSelect.style',
    params: [
      {id: 'chipStyle', type: 'button.style', dynamic: true, defaultValue: button.mdcChipAction()},
      {id: 'itemlistStyle', type: 'itemlist.style', dynamic: true, defaultValue: itemlist.ulLi()},
    ],    
    type: 'multiSelect.style',
    impl: styleByControl(group({
        layout: layout.horizontal(),
        controls: [
            itemlist({
                items: '%$multiSelectModel/choiceRef/asArray%',
                style: call('itemlistStyle'),
                controls: group({controls: [
                    button({
                        title: '%text% ', 
                        style: call('chipStyle'),
                        action: (ctx,{multiSelectModel}) => multiSelectModel.choiceRef.remove(ctx.data.code)
                    }),
                    button({
                      title: 'delete',
                      style: button.x(),
                      features: [
                        css('color: black; z-index: 1000;margin-left: -30px'),
                        itemlist.shownOnlyOnItemHover()
                      ]
                    })
                ]}),
                features: watchRef({
                    ref: '%$multiSelectModel/databind%',
                    includeChildren: 'yes',
                    allowSelfRefresh: true,
                    strongRefresh: false
                })
            }),
            group({
                title: 'add',
                layout: layout.horizontal('20'),
                controls: picklist({
                        options: picklist.options('%$multiSelectModel/options%'),
                        features: [
                            picklist.onChange(
                                (ctx,{multiSelectModel}) => multiSelectModel.choiceRef.add(ctx.data.code)
                            ),
                            css.margin('6')
                        ]
                    }),
                features: css.margin({left: '10'})
            })
        ],
    }), 'multiSelectModel')
})
