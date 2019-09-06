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
  impl: group.htmlTag(
    'div'
  )
})

jb.component('group.section', { /* group.section */
  impl: group.htmlTag(
    'section'
  )
})

jb.component('first-succeeding.style', { /* firstSucceeding.style */
  type: 'first-succeeding.style',
  impl: customStyle({
    template: (cmp,state,h) => {
      var ctrl = state.ctrls.filter(x=>x)[0];
      return ctrl && h(ctrl)
    },
    features: group.initGroup()
  })
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

jb.component('group.expandable', { /* group.expandable */
  type: 'group.style',
  impl: customStyle({
    template: (cmp,state,h) => h('section',{ class: 'jb-group'},[
        h('div',{ class: 'header'},[
          h('div',{ class: 'title'}, state.title),
          h('button',{ class: 'mdl-button mdl-button--icon', onclick: _=> cmp.toggle(), title: cmp.expand_title() },
            h('i',{ class: 'material-icons'}, state.show ? 'keyboard_arrow_down' : 'keyboard_arrow_right')
          )
        ])
      ].concat(state.show ? state.ctrls.map(ctrl=> h('div',{ },h(ctrl))): [])
    ),
    css: `>.header { display: flex; flex-direction: row; }
        >.header>button:hover { background: none }
        >.header>button { margin-left: auto }
        >.header.title { margin: 5px }`,
    features: [group.initGroup(), group.initExpandable()]
  })
})

jb.component('group.init-expandable', { /* group.initExpandable */
  type: 'feature',
  category: 'group:0',
  impl: ctx => ({
        init: cmp => {
            cmp.state.show = true;
            cmp.expand_title = () => cmp.show ? 'collapse' : 'expand';
            cmp.toggle = function () { cmp.show = !cmp.show; };
        },
  })
})

jb.component('group.accordion', { /* group.accordion */
  type: 'group.style',
  impl: customStyle({
    template: (cmp,state,h) => h('section',{ class: 'jb-group'},
        state.ctrls.map((ctrl,index)=> jb.ui.item(cmp,h('div',{ class: 'accordion-section' },[
          h('div',{ class: 'header', onclick: _=> cmp.show(index) },[
            h('div',{ class: 'title'}, ctrl.title),
            h('button',{ class: 'mdl-button mdl-button--icon', title: cmp.expand_title(ctrl) },
              h('i',{ class: 'material-icons'}, state.shown == index ? 'keyboard_arrow_down' : 'keyboard_arrow_right')
            )
          ])].concat(state.shown == index ? [h(ctrl)] : [])),ctrl.ctx.data)
    )),
    css: `>.accordion-section>.header { display: flex; flex-direction: row; }
        >.accordion-section>.header>button:hover { background: none }
        >.accordion-section>.header>button { margin-left: auto }
        >.accordion-section>.header>.title { margin: 5px }`,
    features: [group.initGroup(), group.initAccordion()]
  })
})

jb.component('group.init-accordion', { /* group.initAccordion */
  type: 'feature',
  category: 'group:0',
  params: [
    {id: 'keyboardSupport', as: 'boolean', type: 'boolean'},
    {id: 'autoFocus', as: 'boolean', type: 'boolean'}
  ],
  impl: ctx => ({
    onkeydown: ctx.params.keyboardSupport,
    init: cmp => {
      cmp.state.shown = 0;
      cmp.expand_title = index =>
        index == cmp.state.shown ? 'collapse' : 'expand';

      cmp.show = index =>
        cmp.setState({shown: index});

      cmp.flip = index => {
        if (cmp.state.shown == index)
          cmp.setState({shown: (cmp.state.shown + 1) % cmp.state.ctrls.length})
        else
          cmp.setState({shown: index})
      }

      cmp.next = diff =>
        cmp.setState({shown: (cmp.state.shown + diff + cmp.state.ctrls.length) % cmp.state.ctrls.length});
    },
    afterViewInit: cmp => {
      if (ctx.params.keyboardSupport) {
        cmp.onkeydown.filter(e=> e.keyCode == 33 || e.keyCode == 34) // pageUp/Down
            .subscribe(e=>
              cmp.next(e.keyCode == 33 ? -1 : 1))
      }
    }
  })
})

jb.component('tabs.simple', { /* tabs.simple */
  type: 'group.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div',{}, [
			  h('div',{class: 'tabs-header'}, cmp.titles.map((title,index)=>
					h('button',{class:'mdl-button mdl-js-button mdl-js-ripple-effect' + (index == state.shown ? ' selected-tab': ''),
						onclick: ev=>cmp.show(index)},title))),
				h('div',{class: 'tabs-content'}, h(jb.ui.renderable(cmp.tabs[state.shown]) )) ,
				]),
    css: `>.tabs-header>.selected-tab { border-bottom: 2px solid #66afe9 }
		`,
    features: [group.initTabs(), mdlStyle.initDynamic('.mdl-js-button')]
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
          style: layout.horizontal(),
          controls: dynamicControls({
            controlItems: '%$tabsModel/controls%',
            genericControl: button({
              title: '%$tab/jb_title%',
              action: runActions(
                writeValue('%$selectedTab/ctrl%', '%$tab%'),
                refreshControlById(ctx=> 'tab_' + ctx.componentContext.id)
              ),
              style: button.mdlFlatRipple(),
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

