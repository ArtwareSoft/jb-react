jb.ns('animation-demo')

jb.component('animation-demo.main', { /* animationDemo.main */
  type: 'control',
  impl: group({
    controls: [
      button({
        title: 'click to animate',
        action: animation.start(
          animation.movement(
            animation.fixedPos('0', '500'),
            animation({
              direction: 'alternate',
              loop: true,
              easing: animation.inOutEasing('Cubic', 'InOut')
            })
          )
        )
      })
    ]
  })
})

jb.component('animation-demo.itemlist', { /* animationDemo.itemlist */
  type: 'control',
  impl: group({
    controls: [
      button({
        title: 'stagger',
        action: animation.start(
          [
            animation.moveTo({
              X: animation.stagger({val: animation.stagerIncrease('30'), from: 'center'})
            })
          ],
          '.jb-item'
        )
      }),
      itemlist({
        items: range(),
        controls: [
          label({title: '%%', features: []})
        ]
      })
    ],
    features: [css.width('50'), css.height('100')]
  })
})
