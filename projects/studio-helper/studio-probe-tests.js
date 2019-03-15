jb.resource('person',{ 
	name: "Homer Simpson", 
	male: true,
	isMale: 'yes', 
	age: 42 
 });
  
 jb.component('probe-test.single-control', {
	impl :{$: 'studio-probe-test',
		circuit: {$: 'group',
			controls :{$: 'label', title: 'hello' }
		},
		probePath : 'controls',
		expectedVisits: 1,
	}
})

jb.component('probe-test.pt-by-example', {
	 impl :{$: 'studio-probe-test',
		circuit: {$: 'group',
			controls :{$: 'itemlist',
				items :{$list: [1,2]},
				controls :{$: 'label', title: 'hello' }
			}
		},
		probePath : 'controls~controls',
		expectedVisits: 2, // itemlist with 2 elements
	}
})

jb.component('probe-test.using-global', {
	 impl :{$: 'studio-probe-test',
		circuit: {$: 'group',
			controls :{$: 'test.inner-label' }
		},
		probePath : 'controls',
		expectedVisits: 1,
	}
})

jb.component('test.inner-label', {
	type: 'control',
	impl :{$: 'label', title: 'hello' }
})

jb.component('test.inner-label-template', {
	type: 'control',
	params: [
		{ id: 'ctrl', type: 'control', dynamic: true }
	],
	impl :{$: 'group', controls :{ $call: 'ctrl'} }
})

jb.component('test.inner-label-template-static-param', {
	type: 'control',
	params: [
		{ id: 'param1', type: 'string' }
	],
	impl :{$: 'group', controls : [] }
})

jb.component('probe-test.static-inner-in-template', {
	 impl :{$: 'studio-probe-test',
		circuit: {$: 'group',
			controls :{$: 'test.inner-label-template-static-param', param1: 'hello'	}
		},
		probePath : 'controls~param1',
		expectedVisits: 1,
	}
})

jb.component('probe-test.inner-in-template', {
	 impl :{$: 'studio-probe-test',
		circuit: {$: 'group',
			controls :{$: 'test.inner-label-template',
				ctrl :{$: 'label', title: 'hello' }
			}
		},
		probePath : 'controls~ctrl~title',
		expectedVisits: 2,
	}
})

jb.component('probe-test.pipeline-sugar', {
	 impl :{$: 'studio-probe-test',
		circuit: {$: 'group',
			controls :{$: 'label', title: {$pipeline: ['hello'] } }
		},
		probePath : 'controls~title~$pipeline~0',
	}
})

jb.component('probe-test.pipeline-no-sugar', {
	 impl :{$: 'studio-probe-test',
		circuit: {$: 'group',
			controls :{$: 'label', title :{$: 'pipeline', items: ['hello'] } }
		},
		probePath : 'controls~title~items~0',
	}
})

jb.component('probe-test.pipeline-one-elem', {
	 impl :{$: 'studio-probe-test',
		circuit: {$: 'group',
			controls :{$: 'label', title :{$: 'pipeline', items: 'hello' } }
		},
		probePath : 'controls~title~items',
	}
})

jb.component('probe-test.actions-sugar', {
	 impl :{$: 'studio-probe-test',
		circuit: {$: 'group',
			controls :{$: 'button', title : 'hello', action: [ {$: 'goto-url', url: 'google' }] }
		},
		probePath : 'controls~action~0',
		expectedVisits: 1,
	}
})

jb.component('probe-test.inside-write-value', {
	 impl :{$: 'studio-probe-test',
		circuit: {$: 'button', action :{$: 'write-value', to: '%$person/name%', value: 'homer' } },
		probePath : 'action~to',
		expectedVisits: 1,
	}
})

jb.component('probe-test.inside-open-dialog', {
	 impl :{$: 'studio-probe-test',
		circuit: {$: 'button', action :{$: 'open-dialog', content :{$: 'label', title: 'hello'} } },
		probePath : 'action~content~title',
		expectedVisits: 2,
	}
})

jb.component('probe-test.inside-open-dialog-onOk', {
	 impl :{$: 'studio-probe-test',
		circuit: {$: 'button', action :{$: 'open-dialog', content :{$: 'label', title: 'hello'}, onOK:{$: 'write-value', to: '%$person/name%', value: 'homer' } } },
		probePath : 'action~onOK~value',
		expectedVisits: 1,
	}
})

jb.component('probe-test.inside-goto-url', {
	 impl :{$: 'studio-probe-test',
		circuit: {$: 'button', action :{$: 'goto-url', url: 'google' } },
		probePath : 'action~url',
		expectedVisits: 1,
	}
})

jb.component('test.action-with-side-effects', {
	type: 'action,has-side-effects',
	params: [
		{id: 'text', as: 'string'}
	],
	impl: _ => 0
})

jb.component('probe-test.inside-action-with-side-effects', {
	 impl :{$: 'studio-probe-test',
		circuit: {$: 'button', action :{$: 'test.action-with-side-effects', text: 'hello' } },
		probePath : 'action~text',
		expectedVisits: 0,
	}
})


jb.component('probe-test.filter-no-sugar', {
	 impl :{$: 'studio-probe-test',
		circuit: {$: 'group',
			controls :{$: 'label', title : {$:'pipeline', items: ['hello', {$: 'filter', filter :'%% == "hello"'}] }}
		},
		probePath : 'controls~title~items~1~filter',
	}
})

jb.component('test.label1', {
	type: 'control',
	impl :{$: 'label' }
})

jb.component('path-change-test.wrap', {
	 impl :{$: 'path-change-test',
	 	path: 'test.label1~impl',
	 	action :{$: 'studio.wrap-with-group', path: 'test.label1~impl' },
	 	expectedPathAfter: 'test.label1~impl~controls~0',
//	 	cleanUp: {$: 'studio.undo'}
	}
})

jb.component('test.pathSrc-comp', {
	params: [
		{ id: 'items', dynamic: true}
	],
	impl :{$: 'list', items: {$call: 'items'} }
})

jb.component('test.pathSrc-caller', {
	params: [
		{ id: 'items', dynamic: true}
	],
	impl :{$: 'test.pathSrc-comp', items: ['a', 'b'] }
})

jb.component('probe-test.pathSrc-through-$call', {
   impl :{$: 'data-test',
   calculate: ctx => {
   	 var probe1 = new jb.studio.Probe(new jb.jbCtx(ctx,{ profile: {$: 'test.pathSrc-caller'}, comp: 'test.pathSrc-caller', path: '' } ),true)
      .runCircuit('test.pathSrc-comp~impl~items~1');
    return probe1.then(res=>
    	''+res.result.visits)
   },
   expectedResult :{$: 'contains', text: '0' }
  }
})

jb.component('probe-test.pathSrc-through-$call-2', {
   impl :{$: 'data-test',
   calculate: ctx => {
   	 var probe1 = new jb.studio.Probe(new jb.jbCtx(ctx,{ profile: {$: 'test.pathSrc-caller'}, comp: 'test.pathSrc-caller', path: '' } ),true)
      .runCircuit('test.pathSrc-caller~impl~items~1');
    return probe1.then(res=>
    	''+res.result.visits)
   },
   expectedResult :{$: 'contains', text: '1' }
  }
})


// jb.component('path-change-test.insert-comp', {
// 	 impl :{$: 'path-change-test',
// 	 	path: 'test.group1~impl',
// 	 	action :{$: 'studio.insert-control', path: 'test.group1~impl', comp: 'label' },
// 	 	expectedPathAfter: 'test.group1~impl~controls',
// //	 	cleanUp: {$: 'studio.undo'}
// 	}
// })

// jb.component('probe-test.asIs', {
// // 	 impl :{$: 'studio-probe-test',
// // 		circuit: {$: 'group',
// 			controls :{$: 'label', title :{ $asIs: 'hello'} },
// 		},
// 		probePath : 'controls~title~$asIs',
// 		expectedVisits: 0,
// 		probeCheck : '%$tst% == ""'
// 	}
// })
