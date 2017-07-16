
jb.component('letmesee.main', {
  type: 'control', 
  impl :{$: 'group', 
    title: '%$room/items/item/name%', 
    controls: [
      {$: 'itemlist', 
        items: '%$room/items/item%', 
        controls: [
          {$: 'label', 
            title: '%name%', 
            style :{$: 'label.span' }
          }
        ], 
        style :{$: 'itemlist.ul-li' }, 
        itemVariable: 'item'
      }
    ]
  }, 
  controls: [
    {$: 'label', 
      title: 'my label', 
      style :{$: 'label.span' }
    }
  ]
})
