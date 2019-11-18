jb.ns('animation-demo')

jb.component('animation-demo.main', { /* animationDemo.main */
  type: 'control',
  impl: group({
    controls: [
      button({
        title: 'click to animate',
        action: animation.start({
          animation: animation.moveTo({X: animation.expression('100')}),
          direction: 'alternate'
        })
      })
    ]
  })
})

jb.component('animation-demo.itemlist', { /* animationDemo.itemlist */
  type: 'control',
  impl: group({
    controls: [
      group({
        style: layout.flex({alignItems: 'center', spacing: '30', justifyContent: ''}),
        controls: [
          button({
            title: 'rotate',
            action: animation.start({
              animation: [animation.rotate({rotate: animation.range('0', '360')})],
              target: '#numbers',
              direction: 'alternate',
              loop: false,
              duration: '2000'
            }),
            style: button.mdlRaised()
          }),
          button({
            title: 'stagger',
            action: animation.start({
              animation: [
                animation.moveTo({
                  X: animation.stagger({val: animation.stagerIncrease('30'), from: 'center'})
                }),
                animation.easing(animation.inOutEasing('Quad', 'In'))
              ],
              target: '.jb-item',
              direction: 'alternate',
              loop: true,
              duration: '200'
            })
          }),
          button({
            title: 'perspective',
            action: runActions(
              animation.start({
                  animation: [
                    animation.perspective(animation.expression('100')),
                    animation.rotate({rotateX: animation.range('0', '70')}),
                    animation.easing(animation.inOutEasing('Sine', 'InOut'))
                  ],
                  target: '#numbers',
                  direction: 'alternate',
                  duration: '1000'
                }),
              animation.start({
                  animation: [animation.perspective(animation.expression('100'))],
                  target: '#numbers',
                  direction: 'alternate',
                  duration: '1000'
                })
            )
          })
        ]
      }),
      itemlist({
        items: range(),
        controls: [
          label({title: '%%', features: []})
        ],
        features: [css.margin({left: '200'}), css.height('200'), css.width('50'), id('numbers')]
      })
    ],
    features: []
  })
})

jb.component('animation-demo.particle', { /* animationDemo.particle */
  type: 'control',
  impl: group({
    controls: [
      button({
        title: 'particle',
        action: openDialog({
          style: dialog.div(),
          content: label({
            title: '◯',
            features: feature.onEvent({
              event: 'load',
              action: runActions(
                animation.start({
                    animation: animation.moveTo({X: animation.expression('400')}),
                    direction: 'alternate',
                    duration: '2000'
                  }),
                dialog.closeContainingPopup()
              )
            })
          }),
          title: ''
        })
      })
    ]
  })
})
