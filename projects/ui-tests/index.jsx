import { h, render, Component } from 'preact';
import { component, jbCtx } from 'core/jb-core.js';
//import { ctrl } from 'ui/jb-react.js';
var jb = { ctrl: ctrl, component: component};

/** @jsx h */

var x = (<div></div>);

jb.component('group', {
  type: 'control', category: 'group:100,common:90',
  params: [
    { id: 'title', as: 'string' , dynamic: true },
    { id: 'style', type: 'group.style', defaultValue: { $: 'group.section' }, essential: true , dynamic: true },
    { id: 'controls', type: 'control[]', essential: true, flattenArray: true, dynamic: true, composite: true },
    { id: 'features', type: 'feature[]', dynamic: true },
  ],
  impl: ctx =>
   	jb.ctrl(ctx, {
      beforeInit: cmp =>
        cmp.state.ctrls = ctx.params.controls()
      })
})

jb.component('group.section', {
  type: 'group.style',
  impl :{$: 'custom-style',
    template: (props,state) => (<section class="jb-group">
	    	{ state.ctrls.map(ctrl=> h(ctrl)) }
        </section>),
  }
})

jb.component('label', {
    type: 'control', category: 'control:100,common:80',
    params: [
        { id: 'title', as: 'string', essential: true, defaultValue: 'my label', dynamic: true },
        { id: 'style', type: 'label.style', defaultValue: { $: 'label.span' }, dynamic: true },
        { id: 'features', type: 'feature[]', dynamic: true },
    ],
    impl: ctx =>
        jb.ctrl(ctx.setVars({title: ctx.params.title() }))
})

jb.component('label.bind-title', {
  type: 'feature',
  impl: ctx => ({
  	init: cmp =>
  		cmp.setState({title: ctx.vars.$model.title(cmp.ctx)}),
    doCheck: cmp => 
      cmp.setState({title: ctx.vars.$model.title(cmp.ctx)})
  })
})

jb.component('label.span', {
    type: 'label.style',
    impl :{$: 'custom-style', 
        template: (props,state) =>
        	(<span>{state.title}</span>),
        features :{$: 'label.bind-title' }
    }
})

var label = new jbCtx().run({$:'label', title: 'hello world'});
var group = new jbCtx().run( {$: 'group',
	controls: [
		{$:'label', title: '1'},
		{$:'label', title: '2'},
		{$: 'group',
			controls: [
				{$:'label', title: '3.1'},
				{$:'label', title: '3.2'}
		]}		
	]}
);

render(h(group),document.getElementById('test'));

