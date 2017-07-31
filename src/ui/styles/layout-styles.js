jb.component('layout.vertical', {
  type: 'group.style',
  params: [
    { id: 'spacing', as: 'number', defaultValue: 3 }
  ],
  impl :{$: 'custom-style',
    template: (cmp,state,h) => h('div',{},
        state.ctrls.map(ctrl=> jb.ui.item(cmp,h('div', {} ,h(ctrl)), ctrl.ctx.data) )),
    css: `>div { margin-bottom: %$spacing%px; display: block }
          >div:last-child { margin-bottom:0 }`,
    features :{$: 'group.init-group'}
  }
})

jb.component('layout.horizontal', {
  type: 'group.style',
  params: [,
    { id: 'spacing', as: 'number', defaultValue: 3 }
  ],
  impl :{$: 'custom-style',
    template: (cmp,state,h) => h('div',{},
        state.ctrls.map(ctrl=> jb.ui.item(cmp,h(ctrl),ctrl.ctx.data))),
    css: `{display: flex}
        >* { margin-right: %$spacing%px }
        >*:last-child { margin-right:0 }`,
    features :{$: 'group.init-group'}
  }
})

jb.component('layout.horizontal-fixed-split', {
  type: 'group.style',
  params: [,
    { id: 'leftWidth', as: 'number', defaultValue: 200, essential: true },
    { id: 'rightWidth', as: 'number', defaultValue: 200, essential: true },
    { id: 'spacing', as: 'number', defaultValue: 3 },
  ],
  impl :{$: 'custom-style',
    template: (cmp,state,h) => h('div',{},
        state.ctrls.map(ctrl=> jb.ui.item(cmp,h(ctrl),ctrl.ctx.data))),
    css: `{display: flex}
        >*:first-child { margin-right: %$spacing%px; flex: 0 0 %$leftWidth%px; width: %$leftWidth%px; }
        >*:last-child { margin-right:0; flex: 0 0 %$rightWidth%px; width: %$rightWidth%px; }`,
    features :{$: 'group.init-group'}
  }
})

jb.component('layout.horizontal-wrapped', {
  type: 'group.style',
  params: [,
    { id: 'spacing', as: 'number', defaultValue: 3 }
  ],
  impl :{$: 'custom-style',
    template: (cmp,state,h) => h('div',{},
        state.ctrls.map(ctrl=> jb.ui.item(cmp,h('span', {} ,h(ctrl)),ctrl.ctx.data) )),
    css: `{display: flex}
        >* { margin-right: %$spacing%px }
        >*:last-child { margin-right:0 }`,
    features :{$: 'group.init-group'}
  }
})

jb.component('layout.flex', {
  type: 'group.style',
  params: [
      { id: 'align', as: 'string', options: ',flex-start,flex-end,center,space-between,space-around' },
      { id: 'direction', as: 'string', options: ',row,row-reverse,column,column-reverse' },
      { id: 'wrap', as: 'string', options:',wrap' },
  ],
  impl :{$: 'custom-style',
    template: (cmp,state,h) => h('div',{},
        state.ctrls.map(ctrl=> jb.ui.item(cmp,h(ctrl),ctrl.ctx.data))),
    css: '{ display: flex; {?justify-content:%$align%;?} {?flex-direction:%$direction%;?} {?flex-wrap:%$wrap%;?} }',
    features :{$: 'group.init-group'}
  }
})

jb.component('flex-layout-container.align-main-axis', {
    type: 'feature',
    params: [
      { id: 'align', as: 'string', options: 'flex-start,flex-end,center,space-between,space-around', defaultValue: 'flex-start' }
    ],
    impl : (ctx,factor) => ({
      css: `{ justify-content: ${align} }`
    })
})

jb.component('flex-item.grow', {
    type: 'feature',
    params: [
      { id: 'factor', as: 'number', defaultValue: '1' }
    ],
    impl : (ctx,factor) => ({
      css: `{ flex-grow: ${factor} }`
    })
})

jb.component('flex-item.basis', {
    type: 'feature',
    params: [
      { id: 'factor', as: 'number', defaultValue: '1' }
    ],
    impl : (ctx,factor) => ({
      css: `{ flex-basis: ${factor} }`
    })
})

jb.component('flex-item.align-self', {
    type: 'feature',
    params: [
      { id: 'align', as: 'string', options: 'auto,flex-start,flex-end,center,baseline,stretch', defaultValue: 'auto' }
    ],
    impl : (ctx,align) => ({
      css: `{ align-self: ${align} }`
    })
})

// jb.component('flex-filler', {
//     type: 'control',
//     params: [
//         { id: 'title', as: 'string', defaultValue: 'flex filler' },
//         { id: 'basis', as: 'number', defaultValue: '1' },
//         { id: 'grow', as: 'number', defaultValue: '1' },
//         { id: 'shrink', as: 'number', defaultValue: '0' },
//     ],
//     impl: (ctx,title,basis,grow,shrink) => {
//       var css = [
//         `flex-basis: ${basis}`,
//         `flex-grow: ${grow}`,
//         `flex-shrink: ${shrink}`,
//       ].join('; ');

//       return jb_ui.Comp({ template: `<div style="${css}"></div>`},ctx)
//     }
// })


jb.component('responsive.only-for-phone', {
    type: 'feature',
    impl : () => ({
      cssClass: 'only-for-phone'
    })
})

jb.component('responsive.not-for-phone', {
    type: 'feature',
    impl : () => ({
      cssClass: 'not-for-phone'
    })
})
