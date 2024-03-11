component('multiSelect.choiceList', {
  type: 'multiSelect-style',
  params: [
    {id: 'choiceStyle', type: 'editable-boolean-style', dynamic: true, defaultValue: editableBoolean.checkboxWithLabel()},
    {id: 'itemlistStyle', type: 'itemlist-style', dynamic: true, defaultValue: itemlist.ulLi()}
  ],
  impl: styleByControl({
    control: itemlist({
      items: '%$multiSelectModel/options%',
      controls: editableBoolean({
        databind: multiSelect.modelAsBooleanRef('%$multiSelectModel%', '%code%'),
        style: call('choiceStyle'),
        textForTrue: '%text%',
        textForFalse: '%text%'
      }),
      style: call('itemlistStyle'),
      features: watchRef('%$multiSelectModel/databind%', 'yes')
    }),
    modelVar: 'multiSelectModel'
  })
})

component('multiSelect.chips', {
  type: 'multiSelect-style',
  params: [
    {id: 'chipStyle', type: 'text-style', dynamic: true, defaultValue: text.chip()},
    {id: 'itemlistStyle', type: 'itemlist-style', dynamic: true, defaultValue: itemlist.horizontal()}
  ],
  impl: styleByControl({
    control: group({
      controls: [
        itemlist({
          items: '%$multiSelectModel/databind%',
          controls: group({
            controls: [
              text('%% ', { style: call('chipStyle'), features: itemlist.dragHandle() }),
              button('delete', removeFromArray('%$multiSelectModel/databind%', '%%'), {
                style: button.x(),
                features: [
                  css('z-index: 1000;margin-left: -25px'),
                  itemlist.shownOnlyOnItemHover()
                ]
              })
            ],
            layout: layout.flex({ wrap: 'wrap', spacing: '4' })
          }),
          style: call('itemlistStyle'),
          features: itemlist.dragAndDrop()
        }),
        picklist({
          options: typeAdapter('data<>', pipeline('%$multiSelectModel/options%', filter(not(inGroup('%$multiSelectModel/databind%', '%code%'))))),
          features: [
            picklist.onChange(addToArray('%$multiSelectModel/databind%', { toAdd: '%%' })),
            picklist.plusIcon()
          ]
        })
      ],
      layout: layout.horizontal(),
      features: watchRef('%$multiSelectModel/databind%', 'yes', { allowSelfRefresh: true, strongRefresh: false })
    }),
    modelVar: 'multiSelectModel'
  })
})
