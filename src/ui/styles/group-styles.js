jb.ns('css')

jb.component('group.htmlTag', {
  type: 'group.style',
  params: [
    {id: 'htmlTag', as: 'string', defaultValue: 'section', options: 'div,ul,article,aside,details,figcaption,figure,footer,header,main,mark,nav,section,summary,label,form'},
    {id: 'groupClass', as: 'string'},
    {id: 'itemClass', as: 'string'}
  ],
  impl: customStyle({
    template: (cmp,{htmlTag,groupClass,itemClass,ctrls},h) => h(htmlTag,{ class: groupClass },
        ctrls.map(ctrl=> h(ctrl,{class: itemClass}))),
    features: group.initGroup()
  })
})

jb.component('group.div', {
  type: 'group.style',
  impl: group.htmlTag('div')
})

jb.component('group.section', {
  type: 'group.style',
  impl: group.htmlTag('section')
})

jb.component('group.ulLi', {
  type: 'group.style',
  impl: customStyle({
    template: (cmp,{ctrls},h) => h('ul#jb-itemlist',{},
        ctrls.map(ctrl=> h('li', {class: 'jb-item'} ,h(ctrl)))),
    css: `{ list-style: none; padding: 0; margin: 0;}
    >li { list-style: none; padding: 0; margin: 0;}`,
    features: group.initGroup()
  })
})

jb.component('group.card', {
  type: 'feature',
  category: 'card:100',
  params: [
    {id: 'padding', as: 'string', defaultValue: 10},
    {id: 'width', as: 'string', defaultValue: 320},
    {id: 'outlined', as: 'boolean', type: 'boolean'}
  ],
  impl: features(
    css.class(
        ({},{},{outlined}) => ['mdc-card', ...(outlined ? ['mdc-card--outlined']: [])].join(' ')
      ),
    css(
        ({},{},{padding,width}) => [jb.ui.propWithUnits('padding',padding), jb.ui.propWithUnits('width',width)].filter(x=>x).join(';')
      )
  )
})

jb.component('group.chipSet', {
  type: 'feature',
  category: 'chip:100',
  params: [
    {id: 'spacing', as: 'string', defaultValue: 3}
  ],
  impl: features(
    css.class('mdc-chip-set'),
    mdcStyle.initDynamic()
  )
})

jb.component('group.tabs', {
  type: 'group.style',
  params: [
    {id: 'tabStyle', type: 'button.style', dynamic: true, defaultValue: button.mdcTab()},
    {id: 'barStyle', type: 'group.style', dynamic: true, defaultValue: group.mdcTabBar()},
    {id: 'innerGroupStyle', type: 'group.style', dynamic: true, defaultValue: group.div()},
  ],
  impl: styleByControl(
    group({
      controls: [
        group({
          style: call('barStyle'),
          controls: dynamicControls({
            controlItems: '%$tabsModel/controls%',
            genericControl: button({
              title: '%$tab/field/title%',
              action: writeValue('%$selectedTab%', '%$tabIndex%'),
              style: call('tabStyle'),
              raised: '%$tabIndex% == %$selectedTab%',
              // watchRef breaks mdcTabBar animation
              features: [
                ctx => ctx.componentContext.params.barStyle.profile.$ !== 'group.mdcTabBar' && watchRef('%$selectedTab%'),
                ctx => ctx.run(features((ctx.vars.tab.icon || []).map(cmp=>cmp.ctx.profile).filter(x=>x)))
              ]
            }),
            itemVariable: 'tab',
            indexVariable: 'tabIndex'
          })
        }),
        group({
          style: call('innerGroupStyle'),
          controls: '%$tabsModel/controls[{%$selectedTab%}]%',
          features: watchRef('%$selectedTab%')
        })
      ],
      features: variable({name: 'selectedTab', value: 0, watchable: true}),
    }),
    'tabsModel'
  )
})

jb.component('group.mdcTabBar', {
  type: 'group.style',
  impl: customStyle({
    template: (cmp,{ctrls},h) => 
      h('div',{class: 'mdc-tab-bar', role: 'tablist'},
        h('div',{class: 'mdc-tab-scroller'},
          h('div',{class: 'mdc-tab-scroller__scroll-area mdc-tab-scroller__scroll-area--scroll'},
            h('div',{class: 'mdc-tab-scroller__scroll-content'}, ctrls.map(ctrl=>h(ctrl)))))),
    features: [group.initGroup(), mdcStyle.initDynamic()]
  })
})

jb.component('group.accordion', {
  type: 'group.style',
  params: [
    {id: 'titleStyle', type: 'button.style', dynamic: true, defaultValue: button.mdcHeader(true)},
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
              title: '%$section/field/title%',
              action: writeValue('%$selectedTab%', '%$sectionIndex%'),
              style: call('titleStyle'),
              raised: '%$sectionIndex% == %$selectedTab%',
              features: [
                css.width('%$width%'),
                css('{justify-content: left}'),
                watchRef('%$selectedTab%'),
                ctx => ctx.run(features((ctx.vars.section.icon || []).map(cmp=>cmp.ctx.profile).filter(x=>x)))
              ]
            }),
            group({
              style: call('innerGroupStyle'),
              controls: '%$sectionsModel/controls[{%$sectionIndex%}]%',
              features: [feature.if('%$sectionIndex% == %$selectedTab%'), watchRef('%$selectedTab%')]
            })
          ]
        }),
        itemVariable: 'section',
        indexVariable: 'sectionIndex'
      }),
      features: variable({name: 'selectedTab', value: 0, watchable: true})
    }),
    'sectionsModel'
  )
})

jb.component('group.sections', {
  type: 'group.style',
  params: [
    {id: 'titleStyle', type: 'text.style', dynamic: true, defaultValue: header.mdcHeaderWithIcon()},
    {id: 'sectionStyle', type: 'group.style', dynamic: true, defaultValue: group.div()},
    {id: 'innerGroupStyle', type: 'group.style', dynamic: true, defaultValue: group.div()}
  ],
  impl: styleByControl(
    group({
      controls: dynamicControls({
        controlItems: '%$sectionsModel/controls%',
        genericControl: group({
          style: call('sectionStyle'),
          controls: [
            text({text: '%$section/field/title%', 
              style: call('titleStyle'),
              features: ctx => ctx.run(features((ctx.vars.section.icon || []).map(cmp=>cmp.ctx.profile).filter(x=>x)))
            }),
            group({style: call('innerGroupStyle'), controls: '%$section%'})
          ]
        }),
        itemVariable: 'section'
      })
    }),
    'sectionsModel'
  )
})
