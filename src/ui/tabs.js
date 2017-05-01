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
        features :{$: 'group.data', data: '%$tabsModel/shown%', watch: true} , 
         controls: ctx => 
              ctx.exp('%$tabsModel/tabs%')[ctx.exp('%%')], 
      }
    ]}
  }
})
