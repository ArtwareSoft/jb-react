jb.component('card.box290', {
  type: 'card.style',
  impl: group({
    layout: layout.flex('column'),
    style: group.htmlTag('article'),
    controls: [
      image({
        url: '%image%',
        width: 290,
        height: 161,
        position: image.position('50%', '50%'),
        features: [feature.if('%image%'), css.height(161), css.padding(2.40625), css.margin(39)]
      }),
      text({
        text: '%title%',
        features: [
          css('font: 16px proxima-n-w01-reg, sans-serif; font-weight:700;'),
          css('margin: 24px;'),
          feature.byCondition('%image%', css.lineClamp('2')),
          css.height(17.7656),
          css.padding(0),
          css.margin(0)
        ]
      }),
      html({
        title: 'full text',
        html: '%content%',
        features: [
          css.lineClamp('6'),
          css('font: 16px questrial, sans-serif;'),
          css('margin: 24px;'),
          feature.if(not('%image%'))
        ]
      })
    ],
    features: [css.width('292'), css.height('268'), css('background-color:rgb(195, 255, 91);')]
  })
})

jb.component('card.image454', { /* singlecard.image454 */
    type: 'card.style',
    impl: group({
      layout: layout.flex({direction: 'column'}),
      style: group.htmlTag('article'),
      controls: [
        group({
          controls: [
            image({
              url: '%image%',
              width: 454, height: 454,
              position: image.position('50%'),
              features: feature.if('%image%')
            }),
            text({
              text: '%title%',
              title: 'title overlay',
              features: [
                css('position: absolute; bottom: 60px; left:30px; width: calc(100% - 48px)'),
                css('font: normal normal normal 30px/37px questrial,sans-serif; color: white'),
                css.lineClamp('2')
              ]
            }),
            group({
              title: 'text overlay',
              controls: [
                card.properties()
              ],
              features: [
                css('height: 100%; width: 100%; position: absolute; top: 0; left: 0; display: inline-block;'),
                css('padding: 30px 28px; color: white')
              ]
            })
          ],
          features: css('position: relative')
        })
      ],
      features: [css.width('454'), css.height('454')]
    })
})

jb.component('card.flat940', { /* singlecard.flat940 */
  type: 'card.style',
  impl: group({
    title: '',
    layout: layout.flex({}),
    style: group.htmlTag('article'),
    controls: [
      image({
        url: '%image%',
        width: 469, height: 314,
        features: feature.if('%image%')
      }),
      group({
        layout: layout.vertical('18'),
        controls: [
          card.properties(),
          text({
            text: '%title%',
            title: 'title',
            style: text.htmlTag('div'),
            features: [
              css('font: 28px questrial,sans-serif;overflow-wrap: break-word;'),
              css('.item-hover ~ { color: rgb(95, 138, 22) }'),
              css.lineClamp('2')
            ]
          }),
          html({
            title: 'content',
            html: '%content%',
            features: [
              css('font-family: proxima-n-w01-reg, sans-serif'),
              css(
                'box-orient: vertical; display: -webkit-box; opacity: .8;  word-break: break-word'
              ),
              css.lineClamp('6')
            ]
          })
        ],
        features: css('padding: 40px 48px 37px; overflow: hidden;')
      })
    ],
    features: [css.width('940'), css.border('5'), feature.classOnHover()]
  })
})

jb.component('card.full940', { /* singlecard.full940 */
  type: 'card.style',
  impl: group({
    title: '',
    layout: layout.vertical('30'),
    style: group.htmlTag('article'),
    controls: [
      card.properties(),
      text({
        text: '%title%',
        title: 'title',
        style: text.htmlTag('div'),
        features: [
          css('font: 40px worksans-semibold, \"work sans\", sans-serif;'),
          css('.item-hover ~ { color: rgb(95, 138, 22) }'),
          css.margin('27')
        ]
      }),
      image({
        url: '%image%',
        width: 469, height: 314,
        features: feature.if('%image%')
      }),
      html({title: 'content', html: '%content%', features: []})
    ],
    features: [
      css.width('740'),
      css.border('2'),
      feature.classOnHover(),
      css.padding({top: '60', left: '60', right: '60', bottom: '60'})
    ]
  })
})
