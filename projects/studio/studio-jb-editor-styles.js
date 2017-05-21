jb.component('dialog.studio-jb-editor-popup', {
  type: 'dialog.style',
  impl: {$: 'custom-style',
      template: (cmp,state,h) => h('div',{ class: 'jb-dialog jb-popup' },[
        h('button',{class: 'dialog-close', onclick: _=> cmp.dialogClose() },'×'),
        h(state.contentComp),
      ]),
      css: `{ background: #fff; position: absolute }
        >.dialog-close {
            position: absolute; 
            cursor: pointer; 
            right: 0;
            font: 21px sans-serif; 
            border: none; 
            background: transparent; 
            color: #000; 
            text-shadow: 0 1px 0 #fff; 
            font-weight: 700; 
            opacity: .2;
        }
        >.dialog-close:hover { opacity: .5 }
        `,
      features: [
        { $: 'dialog-feature.max-zIndex-on-click' },
        { $: 'dialog-feature.close-when-clicking-outside' },
        { $: 'dialog-feature.near-launcher-position' },
        { $: 'dialog-feature.unique-dialog', id: 'studio-jb-editor-popup' },
        {$: 'css.box-shadow', 
          blurRadius: 5, 
          spreadRadius: 0, 
          shadowColor: '#000000', 
          opacity: 0.75, 
          horizontal: 0, 
          vertical: 0, 
        }
   ]
  }
})

jb.component('dialog.studio-suggestions-popup',{
  type: 'dialog.style',
  impl: {$: 'custom-style',
      template: (cmp,state,h) => h('div',{ class: 'jb-dialog jb-popup' },[
        h(state.contentComp),
      ]),
      css: `{ background: #fff; position: absolute; padding: 3px 5px }`,
      features: [
        { $: 'dialog-feature.max-zIndex-on-click' },
        { $: 'dialog-feature.close-when-clicking-outside' },
        { $: 'dialog-feature.css-class-on-launching-element' },
        { $: 'dialog-feature.near-launcher-position' },
//        { $: 'studio.fix-suggestions-margin' } ,
        { $: 'dialog-feature.unique-dialog', id: 'studio-suggestions-popup' },
        { $: 'css.box-shadow', 
          blurRadius: 5, 
          spreadRadius: 0, 
          shadowColor: '#000000', 
          opacity: 0.75, 
          horizontal: 0, 
          vertical: 0, 
        }
   ]
  }
})
