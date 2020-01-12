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
    template: (cmp,state,h) => h('button',{title: state.title, onclick: true },state.title),
  })
})

jb.component('button.mdc', {
  type: 'button.style',
  params: [
    {id: 'raised', as: 'boolean' }
  ],
  impl: customStyle({
    template: (cmp,{title,raised},h) => h('button',{class: 'mdc-button' + (raised ? ' mdc-button--raised': ''), onclick: true},[
      h('div',{class:'mdc-button__ripple'}),
      h('span',{class:'mdc-button__label'},title),
    ]),
    features: mdcStyle.initDynamic()
  })
})

jb.component('button.mdc-raised', {
  type: 'button.style',
  impl: button.mdc(true)
})

jb.component('button.mdc-flat', {
  type: 'button.style',
  impl: button.mdc(false) 
})

jb.component('button.mdc-icon', { /* button.mdcIcon */
  type: 'button.style,icon-with-action.style',
  params: [
    {id: 'icon', as: 'string', default: 'code'}
  ],
  impl: customStyle({
    template: (cmp,{title,icon},h) => h('button',{
          class: 'mdc-icon-button material-icons mdc-ripple-surface',
          title, tabIndex: -1, onclick:  true},icon),
    css: `{ border-radius: 2px; padding: 0; width: 24px; height: 24px;}`,
    features: mdcStyle.initDynamic()
  })
})

jb.component('button.mdc-icon12', { /* button.mdcIcon12 */
  type: 'button.style,icon-with-action.style',
  params: [
    {id: 'icon', as: 'string', default: 'code'}
  ],
  impl: customStyle({
    template: (cmp,{icon},h) => h('i',{class: 'material-icons', onclick: true},icon),
    css: '{ font-size:12px; cursor: pointer }'
  })
})

