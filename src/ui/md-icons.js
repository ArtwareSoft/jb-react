jb.component('button.mdIcon', {
    type: 'button.style,icon-with-action.style',
    params: [
      {id: 'icon', as: 'string', defaultValue: 'Yoga'},
      {id: 'raisedIcon', as: 'string'}
    ],
    impl: customStyle({
      template: (cmp,{title,icon,raised,raisedIcon},h) => 
          h('div',{$html: `<svg height="24" width="24"><path d="${jb.path(jb.frame,['MDIcons',icon])}"/></svg>`}),
      css: '{width: 24px; height: 24px}'
    })
})