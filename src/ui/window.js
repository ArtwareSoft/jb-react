jb.component('goto-url', {
	type: 'action',
	description: 'navigate/open a new web page, change href location',
	params: [
		{ id: 'url', as:'string', mandatory: true },
		{ id: 'target', type:'enum', values: ['new tab','self'], defaultValue:'new tab', as:'string'}
	],
	impl: (ctx,url,target) => {
		var _target = (target == 'new tab') ? '_blank' : '_self';
		if (!ctx.probe)
			window.open(url,_target);
	}
})

jb.component('reset-wspy', {
	type: 'action',
	description: 'initalize logger',
	params: [
		{ id: 'param', as: 'string' },
	],
	impl: (ctx,param) => {
		const wspy = jb.frame.initwSpy && frame.initwSpy()
		if (wspy && wspy.enabled()) {
			wspy.resetParam(param)
			wspy.clear()
		}
	}
})
