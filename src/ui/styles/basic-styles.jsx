/** @jsx jb.ui.h */

jb.component('group.section', {
  type: 'group.style',
  impl :{$: 'custom-style',
    template: (props,state) => (<section class="jb-group">
	    	{ state.ctrls.map(ctrl=> jb.ui.h(ctrl)) }
        </section>),
    features:{$: 'group.init-group'}
  }
})

jb.component('label.span', {
    type: 'label.style',
    impl :{$: 'custom-style', 
        template: (props,state) =>
        	(<span>{state.title}</span>),
        features :{$: 'label.bind-title' }
    }
})

jb.component('button.href', {
  type: 'button.style',
    impl :{$: 'custom-style', 
        template: (props,state) => (<a href="javascript:;" onclick="{props.clicked()}">{state.title}</a>),
    }
})

jb.component('button.x', {
  type: 'button.style',
  params: [
    { id: 'size', as: 'number', defaultValue: '21'}
  ],
  impl :{$: 'custom-style', 
      template: (props,state) => (<button onclick="{props.clicked()}" title="title">&#215;</button>),
      css: `button {
            cursor: pointer; 
            font: %$size%px sans-serif; 
            border: none; 
            background: transparent; 
            color: #000; 
            text-shadow: 0 1px 0 #fff; 
            font-weight: 700; 
            opacity: .2;
        }
        button:hover { opacity: .5 }`
  }
})

