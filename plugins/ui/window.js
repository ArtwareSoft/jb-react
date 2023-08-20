component('winUtils.gotoUrl', {
  type: 'action',
  description: 'navigate/open a new web page, change href location',
  params: [
    {id: 'url', as: 'string', mandatory: true},
    {id: 'target', type: 'enum', values: ['new tab', 'self'], defaultValue: 'new tab', as: 'string'}
  ],
  impl: (ctx,url,target) => {
		var _target = (target == 'new tab') ? '_blank' : '_self';
		if (ctx.probe) return
    if (globalThis.window)
      window.open(url,_target)

    if (globalThis.vscodeNS)
      vscodeNS.env.openExternal(url)
	}
})

