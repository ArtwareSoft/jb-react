jb.component('button.href', {
  type: 'button.style',
    impl :{$: 'custom-style', 
        template: (cmp,state,h) => h('a',{href: 'javascript:;', onclick: _ => cmp.clicked()}, state.title)
    }
})

jb.component('button.x', {
  type: 'button.style',
  params: [
    { id: 'size', as: 'number', defaultValue: '21'}
  ],
  impl :{$: 'custom-style', 
      template: (cmp,state,h) => h('button',{title: state.title, onclick: _ => cmp.clicked()},'×'),
      css: `{
            cursor: pointer; 
            font: %$size%px sans-serif; 
            border: none; 
            background: transparent; 
            color: #000; 
            text-shadow: 0 1px 0 #fff; 
            font-weight: 700; 
            opacity: .2;
        }
        :hover { opacity: .5 }`
  }
})

jb.component('button.mdl-raised', {
  type: 'button.style',
  impl :{$: 'custom-style', 
      template: (cmp,state,h) => h('button',{class: 'mdl-button mdl-button--raised mdl-js-button mdl-js-ripple-effect', onclick: _ => cmp.clicked()},state.title),
      features :{$: 'mdl-style.init-dynamic'},
  }
})

jb.component('button.mdl-flat-ripple', {
  type: 'button.style',
  impl :{$: 'custom-style', 
      template: (cmp,state,h) => h('button',{class:'mdl-button mdl-js-button mdl-js-ripple-effect', onclick: _=>cmp.clicked()},state.title),
      features :{$: 'mdl-style.init-dynamic'},
      css: '{ text-transform: none }'
  }
})

jb.component('button.mdl-icon', {
  type: 'button.style',
  params: [
    { id: 'icon', as: 'string', default: 'code' },
  ],
  impl :{$: 'custom-style',
      template: (cmp,state,h) => h('button',{
          class: 'mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect', 
          title: state.title, tabIndex: -1, 
          onclick: _=> cmp.clicked() }, 
        h('i',{class: 'material-icons'},cmp.icon)
      ),
      css: `{ border-radius: 2px} 
      >i {border-radius: 2px}`,
      features :{$: 'mdl-style.init-dynamic'},
  }
})

jb.component('button.mdl-icon-12', {
  type: 'button.style',
  params: [
    { id: 'icon', as: 'string', default: 'code' },
  ],
  impl :{$: 'custom-style', 
      template: (cmp,state,h) => h('button',{
          class: 'mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect', 
          title: state.title, tabIndex: -1, 
          onclick: _=> cmp.clicked() }, 
        h('i',{class: 'material-icons'},cmp.icon)
      ),
      css: `>.material-icons { font-size:12px;  }`,
      features:{$: 'mdl-style.init-dynamic'},
  }
})
