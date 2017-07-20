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
    controls: [
      {$: 'button', 
        title: 'click me1', 
        style :{$: 'button.mdl-raised' }
      }, 
      {$: 'button', 
        title: 'click me2', 
        style :{$: 'button.mdl-raised' }
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