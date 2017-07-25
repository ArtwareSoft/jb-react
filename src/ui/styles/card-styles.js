jb.component('card.card', {
  type: 'group.style',
	params: [
    { id: 'width', as: 'number', defaultValue: 320 },
		{ id: 'shadow', as: 'string', options: '2,3,4,6,8,16', defaultValue: '2' }
	],
	impl :{$: 'custom-style',
    template: (cmp,state,h) => h('div',{ class: `mdl-card mdl-shadow--${cmp.shadow}dp` },
        state.ctrls.map(ctrl=> jb.ui.item(cmp,h(ctrl,{class: cmp.itemClass}),ctrl.ctx.data))),
    features :{$: 'group.init-group'},
		css: '{ width: %$width%px }'
  }
})

jb.component('card.media-group', {
  type: 'group.style',
  impl :{$:'group.div', groupClass: 'mdl-card__media' },
})

jb.component('card.actions-group', {
  type: 'group.style',
  impl :{$:'group.div', groupClass: 'mdl-card__actions mdl-card--border' },
})

jb.component('card.menu', {
  type: 'group.style',
  impl :{$:'group.div', groupClass: 'mdl-card__menu' },
})
