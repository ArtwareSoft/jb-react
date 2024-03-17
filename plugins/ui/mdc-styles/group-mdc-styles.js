component('group.card', {
  type: 'feature',
  category: 'card:100',
  params: [
    {id: 'padding', as: 'string', defaultValue: 10},
    {id: 'width', as: 'string', defaultValue: 320},
    {id: 'outlined', as: 'boolean', type: 'boolean'}
  ],
  impl: features(
    css.class(({},{},{outlined}) => ['mdc-card', ...(outlined ? ['mdc-card--outlined']: [])].join(' ')),
    css(({},{},{padding,width}) => [jb.ui.propWithUnits('padding',padding), jb.ui.propWithUnits('width',width)].filter(x=>x).join(';'))
  )
})

component('group.chipSet', {
  type: 'feature',
  category: 'chip:100',
  params: [
    {id: 'spacing', as: 'string', defaultValue: 3}
  ],
  impl: features(css.class('mdc-chip-set'), mdcStyle.initDynamic())
})

component('group.tabs', {
  type: 'group-style',
  params: [
    {id: 'tabStyle', type: 'button-style', dynamic: true, defaultValue: button.mdcTab()},
    {id: 'barStyle', type: 'group-style', dynamic: true, defaultValue: group.mdcTabBar()},
    {id: 'barLayout', type: 'layout', dynamic: true},
    {id: 'innerGroupStyle', type: 'group-style', dynamic: true, defaultValue: group.div()},
    {id: 'selectedTabRef', as: 'ref', description: 'watchable numeric'}
  ],
  impl: styleByControl({
    control: group({
      controls: [
        group({
          controls: dynamicControls({
            controlItems: '%$tabsModel/controls%',
            genericControl: button('%$tab/field()/title%', writeValue('%$selectedTab%', '%$tabIndex%'), {
              style: call('tabStyle'),
              raised: '%$tabIndex% == %$selectedTab%',
              features: [
                htmlAttribute('tabName','%$tab/field()/title%'),
                ctx => ctx.cmpCtx.params.barStyle.profile.$ !== 'group.mdcTabBar' && {$: 'feature<>watchRef', ref: '%$selectedTab%'},
                ctx => ctx.run({ $: 'feature<>features', features: (ctx.vars.tab.icon || []).map(cmp=>cmp.ctx.profile).filter(x=>x) })
              ]
            }),
            itemVariable: 'tab',
            indexVariable: 'tabIndex'
          }),
          layout: '%$barLayout()%',
          style: call('barStyle')
        }),
        group('%$tabsModel/controls[{%$selectedTab%}]%', {
          style: call('innerGroupStyle'),
          features: watchRef('%$selectedTab%')
        })
      ],
      features: feature.byCondition({
        condition: '%$selectedTabRef%',
        then: ({}, {}, {selectedTabRef}) => ({ extendCtx: ctx => ctx.setVar('selectedTab',selectedTabRef ) }),
        else: watchable('selectedTab', 0)
      })
    }),
    modelVar: 'tabsModel'
  })
})

component('group.mdcTabBar', {
  type: 'group-style',
  impl: customStyle({
    template: (cmp,{ctrls},h) =>
      h('div',{class: 'mdc-tab-bar', role: 'tablist'},
        h('div',{class: 'mdc-tab-scroller'},
          h('div',{class: 'mdc-tab-scroller__scroll-area mdc-tab-scroller__scroll-area--scroll'},
            h('div',{class: 'mdc-tab-scroller__scroll-content'}, ctrls.map(ctrl=>h(ctrl)))))),
    features: [group.initGroup(), mdcStyle.initDynamic()]
  })
})

