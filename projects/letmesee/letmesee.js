
jb.component('letmesee.main', {
  type: 'control', 
  impl :{$: 'group', 
    style :{$: 'card.card', width: 486, shadow: '2' }, 
    controls: [
      {$: 'group', 
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
      }
    ]
  }, 
  controls: [
    {$: 'label', 
      title: 'my label', 
      style :{$: 'text.span' }
    }
  ]
})


jb.component('letmesee.card', {
  type: 'control', 
  impl :{$: 'group', 
    controls: [
      {$: 'itemlist', 
        title: 'items', 
        items: '%$room-eng/items/item%', 
        controls: [
          {$: 'group', 
            title: 'card', 
            style :{$: 'card.card', width: 512, shadow: '3' }, 
            controls: [
              {$: 'group', 
                title: 'image', 
                style :{$: 'card.media-group' }, 
                controls: [
                  {$: 'image', 
                    url: '%Image%', 
                    imageWidth: '%imageWidth%', 
                    imageHeight: '%imageHeight%', 
                    units: 'px', 
                    style :{$: 'image.default' }
                  }
                ]
              }, 
              {$: 'itemlist', 
                title: 'paragraphs', 
                items: '%paragraph%', 
                controls: [
                  {$: 'label', 
                    title: '%type%', 
                    style :{$: 'label.card-title', 
                      template: (cmp,state,h) => h('span',{},state.title), 
                      features :{$: 'label.bind-text' }
                    }, 
                    features: []
                  }, 
                  {$: 'inner-html', 
                    style :{$: 'inner-html.unsafe' }, 
                    title: 'html', 
                    html: '%html%'
                  }
                ], 
                style :{$: 'itemlist.ul-li' }, 
                itemVariable: 'item'
              }
            ]
          }
        ], 
        style :{$: 'itemlist.ul-li' }, 
        itemVariable: 'item'
      }
    ]
  }
})