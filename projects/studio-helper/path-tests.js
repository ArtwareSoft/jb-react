jbLoadModules(['jb-core']).then(loadedModules => { var jb = loadedModules['jb-core'].jb;

jb.component('path-test.single-control', {
	impl :{$: 'jb-path-test', 
	 	$vars: { tst: 10 },
		controlWithMark: {$: 'group', 
			controls :{$: 'label', title: 'hello' } 
		},
		staticPath : 'controls',
		expectedDynamicCounter: 1,
		probeCheck : '%$tst% == 10'
	}
})

jb.component('path-test.pt-by-example', {
	 impl :{$: 'jb-path-test', 
	 	$vars: { tst: 10 },
		controlWithMark: {$: 'group', 
			controls :{$: 'itemlist', 
				items :{$list: [1,2]},
				controls :{$: 'label', title: 'hello', $mark: true } 
			}
		},
		staticPath : 'controls~controls',
		expectedDynamicCounter: 2,
		probeCheck : '%$tst% == 10'
	}
})

jb.component('path-test.using-global', {
	 impl :{$: 'jb-path-test', 
	 	$vars: { tst: 10 },
		controlWithMark: {$: 'group', 
			controls :{$: 'test.inner-label', $mark: true } 
		},
		staticPath : 'controls',
		expectedDynamicCounter: 1,
		probeCheck : '%$tst% == 10'
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

jb.component('path-test.inner-in-template', {
	 impl :{$: 'jb-path-test', 
	 	$vars: { tst: 10 },
		controlWithMark: {$: 'group', 
			controls :{$: 'test.inner-label-template',
				ctrl :{$: 'label', title: 'hello', $mark: true } 
			} 
		},
		staticPath : 'controls~ctrl',
		expectedDynamicCounter: 1,
		probeCheck : '%$tst% == 10'
	}
})

jb.component('path-test.pipeline-sugar', {
	 impl :{$: 'jb-path-test', 
	 	$vars: { tst: 10 },
		controlWithMark: {$: 'group', 
			controls :{$: 'label', title: {$pipeline: ['$mark:hello'] } } 
		},
		staticPath : 'controls~title~$pipeline~0',
		expectedDynamicCounter: 0,
		probeCheck : '%$tst% == 10'
	}
})

jb.component('path-test.pipeline-no-sugar', {
	 impl :{$: 'jb-path-test', 
	 	$vars: { tst: 10 },
		controlWithMark: {$: 'group', 
			controls :{$: 'label', title :{$: 'pipeline', items: ['$mark:hello'] } } 
		},
		staticPath : 'controls~title~items~0',
		expectedDynamicCounter: 0,
		probeCheck : '%$tst% == 10'
	}
})

jb.component('path-test.pipeline-one-elem', {
	 impl :{$: 'jb-path-test', 
	 	$vars: { tst: 10 },
		controlWithMark: {$: 'group', 
			controls :{$: 'label', title :{$: 'pipeline', items: '$mark:hello' } } 
		},
		staticPath : 'controls~title~items',
		expectedDynamicCounter: 0,
		probeCheck : '%$tst% == 10'
	}
})

jb.component('path-test.actions-sugar', {
	 impl :{$: 'jb-path-test', 
	 	$vars: { tst: 10 },
		controlWithMark: {$: 'group', 
			controls :{$: 'button', title : 'hello', action: [ {$: 'goto-url', url: 'google', $mark: true }] } 
		},
		staticPath : 'controls~action~0',
		expectedDynamicCounter: 0,
		probeCheck : '%$tst% == 10'
	}
})

jb.component('path-test.filter-no-sugar', {
	 impl :{$: 'jb-path-test', 
	 	$vars: { tst: 10 },
		controlWithMark: {$: 'group', 
			controls :{$: 'label', title : {$:'pipeline', items: ['hello', {$: 'filter', filter :'$mark:%% == "hello"'}] }} 
		},
		staticPath : 'controls~title~items~1~filter',
		expectedDynamicCounter: 0,
		probeCheck : '%$tst% == 10'
	}
})

// jb.component('path-test.asIs', {
// // 	 impl :{$: 'jb-path-test', 
// 	 	$vars: { tst: 10 },
// 		controlWithMark: {$: 'group', 
// 			controls :{$: 'label', title :{ $asIs: '$mark:hello'} },
// 		},
// 		staticPath : 'controls~title~$asIs',
// 		expectedDynamicCounter: 0,
// 		probeCheck : '%$tst% == ""'
// 	}
// })




})