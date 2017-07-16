
jb.component('letmesee.main', {
  type: 'control', 
  impl :{$: 'group', 
    title: '', 
    controls: [
      {$: 'itemlist', 
        items: '%$room-eng/items/paragraph%', 
        controls :{$: 'control.first-succeeding', 
          controls: [
            {$: 'control-with-condition', 
              condition: '%type% == "image"', 
              control :{$: 'image', 
                url: '%image%', 
                imageWidth: '%imageWidth%', 
                imageHeight: '%imageHeight%', 
                width: '', 
                height: '', 
                units: 'px'
              }
            }, 
            {$: 'control-with-condition', 
              condition: '%type% == "rich text"', 
              control :{$: 'inner-html', html: '%html%' }
            }
          ]
        }, 
        style :{$: 'itemlist.ul-li' }, 
        itemVariable: 'item'
      }
    ], 
    features :{$: 'css', css: '{? { direction: rtl } %$room/style/general/rtl% ?}' }
  }, 
  controls: [
    {$: 'label', 
      title: 'my label', 
      style :{$: 'label.span' }
    }
  ]
})
