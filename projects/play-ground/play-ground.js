jb.resource('people',[
  { "name": "Homer Simpson" ,age: 42 , male: true},
  { "name": "Marge Simpson" ,age: 38 , male: false},
  { "name": "Bart Simpson"  ,age: 12 , male: true}
]);

jb.component('play-ground.main', {
  type: 'control', 
  impl :{$: 'group', 
    title: 'ert', 
    controls: [
      {$: 'label', 
        title :{$: 'is-of-type', type: 'string', obj: '123' }, 
        style :{$: 'label.p' }
      }, 
      {$: 'button', 
        title :{
          $pipeline: [
            ctx=>window.jb, 
            '%comps%', 
            {$: 'property-names', obj: '%%' }
          ]
        }, 
        action: [{$: 'action.switch', cases: [] }], 
        style :{$: 'button.mdl-raised' }
      }, 
      {$: 'picklist', 
        title: 'name', 
        databind: '%$name%', 
        options :{$: 'picklist.options', options: '%$people/name%' }, 
        style :{$: 'picklist.native-md-look' }, 
        features :{$: 'css.width', width: '200' }
      }, 
      {$: 'editable-number', 
        databind: '%$num%', 
        style :{$: 'editable-number.slider' }, 
        max: 100, 
        displayString: '%$Value%%$Symbol%', 
        dataString: '%$Value%%$Symbol%', 
        autoScale: true, 
        step: 1
      }, 
      {$: 'tabs', 
        tabs: [
          {$: 'label', 
            title: 'a', 
            style :{$: 'label.span' }
          }, 
          {$: 'label', 
            title: 'b', 
            style :{$: 'label.span' }
          }
        ], 
        style :{$: 'tabs.simple' }
      }, 
      {$: 'group', 
        style :{$: 'layout.vertical' }
      }
    ], 
    features: [
      {$: 'var', name: 'male', value: true, mutable: true }, 
      {$: 'var', name: 'name', value: true, mutable: true }, 
      {$: 'var', name: 'num', mutable: true }
    ]
  }, 
  controls: [
    {$: 'label', 
      title: 'my label', 
      style :{$: 'label.span' }
    }
  ], 
  title: 'aa'
})



jb.component('play-ground.t', {
  type: 'control', 
  impl :{$: 'group', 
    title: 't', 
    style :{$: 'layout.vertical', spacing: 3 }, 
    controls: [
      {$: 'button', 
        title: 'click me2', 
        style :{$: 'button.mdl-raised' }
      }, 
      {$: 'button', 
        title: 'click me1311', 
        style :{$: 'custom-style', 
          template: (cmp,state,h) => h('button',{class: 'mdl-button mdl-button--raised mdl-js-button mdl-js-ripple-effect', onclick: ev => cmp.clicked(ev)},state.title), 
          css: '{ color: red }', 
          features :{$: 'mdl-style.init-dynamic' }
        }
      }, 
      {$: 'button', 
        title: 'click me3', 
        style :{$: 'button.mdl-raised' }
      }, 
      {$: 'group', 
        style :{$: 'layout.vertical' }, 
        controls: [
          {$: 'label', 
            title: 'my label', 
            style :{$: 'label.span' }
          }
        ]
      }
    ]
  }, 
  features :{$: 'css.height' }
})

jb.component('play-ground.invalid-ref', {
  type: 'control', 
  impl :{$: 'group', 
    title: 'invalid-ref', 
    style :{$: 'layout.horizontal', spacing: '86' }, 
    controls: [
      {$: 'button', 
        title: 'delete parent', 
        action :{$: 'write-value', 
          item: '0', 
          array: '%$people%', 
          index: '0', 
          to: '%$Customer/contact%'
        }, 
        style :{$: 'button.mdl-raised' }
      }, 
      {$: 'label', 
        title: '%$Customer/contact/name%', 
        style :{$: 'label.span' }
      }
    ], 
    features :{$: 'var', 
      name: 'Customer', 
      value :{$: 'object', 
        contact :{$: 'object', name: 'Homer' }
      }, 
      mutable: true
    }
  }
})

jb.component('play-ground.more-items', {
  type: 'control', 
  impl :{$: 'group', 
    title: 'more-items', 
    controls: [
      {$: 'itemlist', 
        items :{
          $pipeline: [
            {$: 'range', from: 1, to: '20' }, 
            {$: 'itemlist-container.filter' }
          ]
        }, 
        controls :{$: 'label', title: '%%' }, 
        style :{$: 'itemlist.ul-li' }, 
        itemVariable: 'item', 
        features :{$: 'watch-ref', ref: '%$itemlistCntrData%', includeChildren: true }
      }, 
      {$: 'itemlist-container.more-items-button', 
        maxItemsRef: '%$itemlistCntrData/maxItems%', 
        title: 'show %$delta% more ... (%$itemlistCntrData/countAfterFilter%/%$itemlistCntrData/countBeforeFilter%)', 
        delta: '3', 
        style :{$: 'button.href' }
      }
    ], 
    features :{$: 'group.itemlist-container', itemsToAdd: '2', id: '', maxItems: '10' }
  }
})

jb.component('play-ground.cards', {
  type: 'control', 
  impl :{$: 'group', 
    title: 'cards', 
    style :{$: 'group.div', groupClass: 'mdl-card mdl-shadow--2dp' }, 
    controls: [
      {$: 'group', 
        title: 'image', 
        style :{$: 'group.div', groupClass: 'mdl-card__media' }, 
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
        style :{$: 'label.card-supporting-text', 
          template: (cmp,state,h) => h('span',{},state.title), 
          features :{$: 'label.bind-title' }
        }
      }, 
      {$: 'group', 
        title: 'actions', 
        style :{$: 'group.div', groupClass: 'mdl-card__actions mdl-card--border' }, 
        controls: [
          {$: 'button', 
            title: 'Get Started', 
            style :{$: 'button.mdl-card-flat', 
              template: (cmp,state,h) => h('a',{class:'mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect', onclick: ev=>cmp.clicked(ev)},state.title), 
              css: '{ text-transform: none }', 
              features :{$: 'mdl-style.init-dynamic' }
            }, 
            features :{$: 'css.class', class: '' }
          }
        ]
      }, 
      {$: 'group', 
        title: 'menu', 
        style :{$: 'group.div', groupClass: 'mdl-card__menu' }, 
        controls: [
          {$: 'icon-with-action', 
            icon: 'share', 
            style :{$: 'button.mdl-round-icon' }, 
            features :{$: 'css.color', color: 'white' }
          }
        ]
      }
    ], 
    features :{$: 'css.width', width: '512' }
  }
})