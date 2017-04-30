jb.component('tabs', {
	type: 'control', category: 'group:80',
	params: [
		{ id: 'tabs', type: 'control[]', essential: true, flattenArray: true, dynamic: true },
		{ id: 'style', type: 'tabs.style', dynamic: true, defaultValue: { $: 'tabs.simple' } },
		{ id: 'features', type: 'feature[]', dynamic: true },
	],
  impl: ctx =>  
    jb.ui.ctrl(ctx)
})

jb.component('group.init-tabs', {
  type: 'feature', category: 'group:0',
  params: [
    { id: 'keyboardSupport', as: 'boolean' },
    { id: 'autoFocus', as: 'boolean' }
  ],
  impl: ctx => ({
    onkeydown: ctx.params.keyboardSupport,
    init: cmp => {
      cmp.state.shown = 0;
      cmp.expand_title = index => 
        index == cmp.state.shown ? 'collapse' : 'expand';

      cmp.show = index => 
        cmp.setState({shown: index});

      cmp.next = diff =>
        cmp.setState({shown: (cmp.state.index + diff + cmp.ctrls.length) % cmp.ctrls.length});

      if (ctx.params.keyboardSupport) {
        keydown.filter(e=> e.keyCode == 33 || e.keyCode == 34) // pageUp/Down
            .subscribe(e=>
              cmp.next(e.keyCode == 33 ? -1 : 1))
      }
    },
  })
})

jb.component('tabs.simple', {
  type: 'tabs.style',
  params: [
    { id: 'width', as : 'number' },
  ],
  impl2 :{$: 'style-by-control', __innerImplementation: true,
    modelVar: 'tabsModel',
    control :{$: 'group', controls: [
      { $: 'itemlist',
        watchItems: false, 
        items: '%$tabsModel/tabs%',
        style :{ $: 'layout.horizontal' },
        controls :{$: 'button', 
          title: ctx => ctx.data.title(), 
          style :{$: 'button.mdl-flat-ripple' }, 
          features: [
            {$: 'css.width', width: '%$width%' }, 
            {$: 'css', css: '{text-align: left}' }
          ]
        },
        features :{$: 'itemlist.selection', 
          onSelection :{$: 'write-value', 
            value: ctx => 
              ctx.exp('%$tabsModel/tabs%').indexOf(ctx.exp('%%')), 
            to: '%$tabsModel/shown%' 
          } 
        }
      },
      { $: 'group', 
        features :{$: 'group.data', data: '%$tabsModel/shown%', watch: 'innerVars/tabsModel'} , 
         controls: ctx => 
              ctx.exp('%$tabsModel/tabs%')[ctx.exp('%%')], 
      }
    ]}
  }
})


      { $: 'itemlist', items: '%$people%', 
        controls :{$: 'label', title: '%$item.name%' }, 
        features: [
            { $: 'itemlist.selection', databind: '%$globals/selectedPerson%', autoSelectFirst: true }, 
            { $: 'itemlist.keyboard-selection', autoFocus: true },
        ],
      },
      { $: 'group', 
        features :{$: 'group.data', data: '%$globals/selectedPerson%', watch: 'globals'} , 
         controls: [
            {$: 'label' , title: '%name% selected' },
          ]
        }
    ]
  } ,


jb.component('tabs.simple', {
	type: 'tabs.style',
  	impl :{$: 'custom-style',
    template: (cmp,state,h) => h('div',{ class: 'jb-tabs'}, [
          h('div',{ class: 'tab-titles'}, state.ctrls.map(ctrl=> h(''))
        ]
        state.ctrls.map((ctrl,index)=> jb.ui.item(cmp,ctrl,h('div',{ class: 'accordion-section' },[
          h('div',{ class: 'header', onclick: _=> cmp.show(index) },[
            h('div',{ class: 'title'}, ctrl.title()),
            h('button',{ class: 'mdl-button mdl-button--icon', title: cmp.expand_title(ctrl) }, 
              h('i',{ class: 'material-icons'}, state.shown == index ? 'keyboard_arrow_down' : 'keyboard_arrow_right')
            )
          ])].concat(state.shown == ctrl ? [h(ctrl)] : [])))        
    )),

      template: `<div class="jb-tab">
          <div class="tab-titles">
            <button *ngFor="let title of titles; let i = index" class="mdl-button mdl-js-button mdl-js-ripple-effect" (click)="selectedTab = i" [ngClass]="{'selected': i==selectedTab}">{{title}}</button>
          </div>
          <div *jbComp="selectedTabContent()"></div>
        </div>`,
	     css: `.selected { border-bottom: 1px solid black } button { background: none }`,
	    features :{$: 'tabs.init-tabs'},
  	}
})

