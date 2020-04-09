jb.ns('multiSelect')

jb.component('multiSelect', {
    type: 'control',
    description: 'select list of options, check multiple',
    category: 'input:80',
    params: [
      {id: 'title', as: 'string', dynamic: true},
      {id: 'databind', as: 'ref', mandaroy: true, dynamic: true },
      {id: 'options', type: 'picklist.options', dynamic: true, mandatory: true },
      {id: 'promote', type: 'picklist.promote', dynamic: true},
      {id: 'style', type: 'multiSelect.style', defaultValue: picklist.native(), dynamic: true},
      {id: 'features', type: 'feature[]', dynamic: true}
    ],
    impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('multiSelect.modelAsBooleanRef',{
    params: [
        {id: 'multiSelectModel'},
        {id: 'code'},
    ],
    impl: (ctx,multiSelectModel,code) => {
        const ref = multiSelectModel.databind()
        return { $jb_val: val => val === undefined ? has() : val === true ? add() : remove() }

        function has() { return jb.val(ref).indexOf(code) != -1 }
        function add() { if (!has(code)) jb.push(ref, code,ctx) }
        function remove() { 
            const index = jb.val(ref).indexOf(code)
            index != -1 && jb.splice(ref,[[index,1]],ctx)
        }
    }
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
            textForTrue: '%text%',
            textForFalse: '%text%',
            databind: multiSelect.modelAsBooleanRef('%$multiSelectModel%','%code%'),
            style: call('choiceStyle')
        }),
        style: call('itemlistStyle'),
        features: watchRef({ref: '%$multiSelectModel/databind%', includeChildren: 'yes'})
      }),
      'multiSelectModel'
    )
})

jb.component('multiSelect.chips', {
    type: 'multiSelect.style',
    params: [
      {id: 'chipStyle', type: 'text.style', dynamic: true, defaultValue: text.chip()},
      {id: 'itemlistStyle', type: 'itemlist.style', dynamic: true, defaultValue: itemlist.horizontal()},
    ],
    type: 'multiSelect.style',
    impl: styleByControl(group({
        layout: layout.horizontal(),
        controls: [
            itemlist({
                items: '%$multiSelectModel/databind%',
                style: call('itemlistStyle'),
                controls: group({
                    layout: layout.flex({wrap: 'wrap', spacing: '4'}),
                    controls: [
                        text({
                            text: '%% ', 
                            style: call('chipStyle'),
                            features: itemlist.dragHandle()
                        }),
                        button({
                            title: 'delete',
                            style: button.x(),
                            action: removeFromArray('%$multiSelectModel/databind%','%%'),
                            features: [
                                css('color: black; z-index: 1000;margin-left: -25px'),
                                itemlist.shownOnlyOnItemHover()
                            ]
                        })
                ]}),
                features: itemlist.dragAndDrop()
            }),
            picklist({
                options: pipeline('%$multiSelectModel/options%',filter(not(inGroup('%$multiSelectModel/databind%','%code%')))),
                features: [
                    picklist.onChange(addToArray('%$multiSelectModel/databind%','%%')),
                    picklist.plusIcon(),
                ]
            }),
        ],
        features: watchRef({
            ref: '%$multiSelectModel/databind%', includeChildren: 'yes', allowSelfRefresh: true, strongRefresh: false
        })
    }), 'multiSelectModel')
})
