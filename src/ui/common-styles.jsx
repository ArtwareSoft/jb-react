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
