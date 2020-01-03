jb.component('group.htmlTag', { /* group.htmlTag */
  type: 'group.style',
  params: [
    {
      id: 'htmlTag',
      as: 'string',
      defaultValue: 'section',
      options: 'div,ul,article,aside,details,figcaption,figure,footer,header,main,mark,nav,section,summary,label,form'
    },
    {id: 'groupClass', as: 'string'},
    {id: 'itemClass', as: 'string'}
  ],
  impl: customStyle({
    template: (cmp,state,h) => h(cmp.htmlTag,{ class: cmp.groupClass },
        state.ctrls.map(ctrl=> jb.ui.item(cmp,h(ctrl,{class: cmp.itemClass}),ctrl.ctx.data))),
    features: group.initGroup()
  })
})

jb.component('group.div', { /* group.div */
  type: 'group.style',
  impl: group.htmlTag('div')
})

jb.component('group.section', { /* group.section */
  type: 'group.style',
  impl: group.htmlTag('section')
})

jb.component('group.ul-li', { /* group.ulLi */
  type: 'group.style',
  impl: customStyle({
    template: (cmp,state,h) => h('ul',{ class: 'jb-itemlist'},
        state.ctrls.map(ctrl=> jb.ui.item(cmp,h('li', {class: 'jb-item'} ,h(ctrl)),ctrl.ctx.data))),
    css: `{ list-style: none; padding: 0; margin: 0;}
    >li { list-style: none; padding: 0; margin: 0;}`,
    features: group.initGroup()
  })
})

jb.component('group.tabs', { /* group.tabs */
  type: 'group.style',
  params: [
    {id: 'width', as: 'number'}
  ],
  impl: styleByControl(
    group({
      controls: [
        group({
          title: 'thumbs',
          layout: layout.horizontal(),
          controls: dynamicControls({
            controlItems: '%$tabsModel/controls%',
            genericControl: button({
              title: '%$tab/field/title%',
              action: runActions(
                writeValue('%$selectedTab/ctrl%', '%$tab%'),
                refreshControlById(ctx=> 'tab_' + ctx.componentContext.id)
              ),
              style: button.mdcFlat(),
              features: [css.width('%$width%'), css('{text-align: left}')]
            }),
            itemVariable: 'tab'
          }),
          features: group.initGroup()
        }),
        '%$selectedTab/ctrl%'
      ],
      features: [
        id(ctx=> 'tab_' + ctx.componentContext.id),
        variable({
          name: 'selectedTab',
          value: obj(prop('ctrl', '%$tabsModel/controls[0]%', 'single'))
        }),
        group.initGroup()
      ]
    }),
    'tabsModel'
  )
})

jb.component('group.accordion', {
  type: 'group.style',
  params: [
    {id: 'titleStyle', type: 'button.style', dynamic: true, defaultValue: button.mdcFlat() },
    {id: 'sectionStyle', type: 'group.style', dynamic: true, defaultValue: group.section()},
    {id: 'innerGroupStyle', type: 'group.style', dynamic: true, defaultValue: group.div()}
  ],
  impl: styleByControl(
    group({
      controls: dynamicControls({
          controlItems: '%$sectionsModel/controls%',
          genericControl: group({
            style: call('sectionStyle'),
            controls: [
              button({
                title: ({},{section}) => section.field().title(),
                style: call('titleStyle'),
                action: runActions(
                  writeValue('%$selectedTab/path%', '%$section/ctx/path%'),
                  refreshControlById(ctx=> 'accoridon_' + ctx.componentContext.id)
                )
              }),
              group({style: call('innerGroupStyle'), controls: ({},{section,selectedTab}) => section.ctx.path == selectedTab.path && section})
            ]
          }),
          itemVariable: 'section'
      }),
      features: [
        id(ctx=> 'accoridon_' + ctx.componentContext.id),
        variable({
          name: 'selectedTab',
          value: obj(prop('path','%$sectionsModel/controls[0]/ctx/path%'))
        }),
        group.initGroup()
      ]
    }),
    'sectionsModel'
  )
})

jb.component('group.sections', {
  type: 'group.style',
  params: [
    {id: 'titleStyle', type: 'label.style', dynamic: true, defaultValue: label.htmlTag('h3')},
    {id: 'sectionStyle', type: 'group.style', dynamic: true, defaultValue: group.section()},
    {id: 'innerGroupStyle', type: 'group.style', dynamic: true, defaultValue: group.div()}
  ],
  impl: styleByControl(
    group({
      controls: [
        dynamicControls({
          controlItems: '%$sectionsModel/controls%',
          genericControl: group({
            style: call('sectionStyle'),
            controls: [
              label({
                text: ({},{section}) => section.field().title(),
                style: call('titleStyle')
              }),
              group({style: call('innerGroupStyle'), controls: ({},{section}) => section})
            ]
          }),
          itemVariable: 'section'
        })
      ]
    }),
    'sectionsModel'
  )
})
