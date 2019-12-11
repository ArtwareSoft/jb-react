jb.component('button.href', { /* button.href */
  type: 'button.style',
  impl: customStyle({
    template: (cmp,state,h) => h('a',{href: 'javascript:;', onclick: true }, state.title),
    css: '{color: grey}'
  })
})

jb.component('button.x', { /* button.x */
  type: 'button.style',
  params: [
    {id: 'size', as: 'number', defaultValue: '21'}
  ],
  impl: customStyle({
    template: (cmp,state,h) => h('button',{title: state.title, onclick: true },'×'),
    css: `{
            padding: 0;
            cursor: pointer;
            font: %$size%px sans-serif;
            border: none;
            background: transparent;
            color: rgba(0,0,0,0.2);
            text-shadow: 0 1px 0 #fff;
            font-weight: 700;
        }
        :hover { color: rgba(0,0,0,0.5) }`
  })
})

jb.component('button.native', {
  type: 'button.style',
  impl: customStyle({
    template: (cmp,state,h) => h('button',{title: state.title, onclick: true }),
  })
})

jb.component('button.mdl-raised', { /* button.mdlRaised */
  type: 'button.style',
  impl: customStyle({
    template: (cmp,state,h) => h('button',{class: 'mdl-button mdl-button--raised mdl-js-button mdl-js-ripple-effect', onclick: true},state.title),
    features: mdlStyle.initDynamic()
  })
})

jb.component('button.mdl-flat-ripple', { /* button.mdlFlatRipple */
  type: 'button.style',
  impl: customStyle({
    template: (cmp,state,h) => h('button',{class:'mdl-button mdl-js-button mdl-js-ripple-effect', onclick: true},state.title),
    css: '{ text-transform: none }',
    features: mdlStyle.initDynamic()
  })
})

jb.component('button.mdl-icon', { /* button.mdlIcon */
  type: 'button.style,icon-with-action.style',
  params: [
    {id: 'icon', as: 'string', default: 'code'}
  ],
  impl: customStyle({
    template: (cmp,state,h) => h('button',{
          class: 'mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect',
          title: state.title, tabIndex: -1, onclick:  true},
        h('i',{class: 'material-icons'},cmp.icon)
      ),
    css: `{ border-radius: 2px}
      >i {border-radius: 2px}`,
    features: mdlStyle.initDynamic()
  })
})

jb.component('button.mdl-round-icon', { /* button.mdlRoundIcon */
  type: 'button.style,icon-with-action.style',
  params: [
    {id: 'icon', as: 'string', default: 'code'}
  ],
  impl: customStyle({
    template: (cmp,state,h) => h('button',{
          class: 'mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect',
          title: state.title, tabIndex: -1, onclick: true},
        h('i',{class: 'material-icons'},cmp.icon)
      ),
    features: mdlStyle.initDynamic()
  })
})

jb.component('button.mdl-icon12-with-ripple', { /* button.mdlIcon12WithRipple */
  type: 'button.style,icon-with-action.style',
  params: [
    {id: 'icon', as: 'string', default: 'code'}
  ],
  impl: customStyle({
    template: (cmp,state,h) => h('button',{
          class: 'mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect',
          title: state.title, tabIndex: -1, onclick: true },
        h('i',{class: 'material-icons'},cmp.icon)
      ),
    css: '>.material-icons { font-size:12px;  }',
    features: mdlStyle.initDynamic()
  })
})

jb.component('button.mdl-icon12', { /* button.mdlIcon12 */
  type: 'button.style,icon-with-action.style',
  params: [
    {id: 'icon', as: 'string', default: 'code'}
  ],
  impl: customStyle({
    template: (cmp,state,h) => h('i',{class: 'material-icons', onclick: true},cmp.icon),
    css: '{ font-size:12px; cursor: pointer }'
  })
})

jb.component('button.mdl-card-flat', { /* button.mdlCardFlat */
  type: 'button.style',
  impl: customStyle({
    template: (cmp,state,h) => h('a',{class:'mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect', onclick: true},state.title),
    features: mdlStyle.initDynamic()
  })
})
