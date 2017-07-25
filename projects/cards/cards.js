
jb.component('cards.main', {
  type: 'control',
  impl :{$: 'group', controls: [ {$: 'button', title: 'my button'}] }
})

jb.component('cards.wide', {
  type: 'control', 
  impl :{$: 'group', 
    title: 'cards', 
    style :{$: 'card.card', width: 512, shadow: '3' }, 
    controls: [
      {$: 'group', 
        title: 'image', 
        style :{$: 'card.media-group' }, 
        controls: [
          {$: 'image', 
            url: '//getmdl.io/assets/demos/welcome_card.jpg', 
            imageHeight: '176', 
            units: 'px', 
            style :{$: 'image.default' }
          }
        ], 
        features :{$: 'css.color', color: '', background: '#422196' }
      }, 
      {$: 'label', 
        title: 'Welcome', 
        style :{$: 'label.card-title', 
          template: (cmp,state,h) => h('span',{},state.title), 
          features :{$: 'label.bind-title' }
        }, 
        features: [
          {$: 'css', css: '{ color: #fff }' }, 
          {$: 'css.margin', top: '-55' }
        ]
      }, 
      {$: 'label', 
        title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.     Mauris sagittis pellentesque lacus eleifend lacinia...', 
        style :{$: 'label.card-supporting-text' }
      }, 
      {$: 'group', 
        title: 'actions', 
        style :{$: 'card.actions-group' }, 
        controls: [
          {$: 'button', 
            title: 'Get Started', 
            style :{$: 'button.mdl-card-flat' }
          }
        ]
      }, 
      {$: 'group', 
        title: 'menu', 
        style :{$: 'card.menu' }, 
        controls: [
          {$: 'icon-with-action', 
            icon: 'share', 
            style :{$: 'button.mdl-round-icon' }, 
            features :{$: 'css.color', color: 'white' }
          }
        ]
      }
    ]
  }
})