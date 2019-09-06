jb.component('card.card', { /* card.card */
  type: 'group.style',
  params: [
    {id: 'width', as: 'number', defaultValue: 320},
    {id: 'shadow', as: 'string', options: '2,3,4,6,8,16', defaultValue: '2'}
  ],
  impl: customStyle({
    template: (cmp,state,h) => h('div',{ class: `mdl-card mdl-shadow--${cmp.shadow}dp` },
        state.ctrls.map(ctrl=> jb.ui.item(cmp,h(ctrl,{class: cmp.itemClass}),ctrl.ctx.data))),
    css: '{ width: %$width%px }',
    features: group.initGroup()
  })
})

jb.component('card.media-group', { /* card.mediaGroup */
  type: 'group.style',
  impl: group.div(

  )
})

jb.component('card.actions-group', { /* card.actionsGroup */
  type: 'group.style',
  impl: group.div(

  )
})

jb.component('card.menu', { /* card.menu */
  type: 'group.style',
  impl: group.div(
    
  )
})
