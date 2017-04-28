/** @jsx jb.ui.h */

jb.component('button.href', {
  type: 'button.style',
    impl :{$: 'custom-style', 
        template: (cmp,state) => (<a href="javascript:;" onclick="{cmp.clicked()}">{state.title}</a>),
    }
})

jb.component('button.x', {
  type: 'button.style',
  params: [
    { id: 'size', as: 'number', defaultValue: '21'}
  ],
  impl :{$: 'custom-style', 
      template: (cmp,state) => (<button onclick="{cmp.clicked()}" title="title">&#215;</button>),
      css: `button {
            cursor: pointer; 
            font: %$size%px sans-serif; 
            border: none; 
            background: transparent; 
            color: #000; 
            text-shadow: 0 1px 0 #fff; 
            font-weight: 700; 
            opacity: .2;
        }
        button:hover { opacity: .5 }`
  }
})

