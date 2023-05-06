
component('zuiTest.gallery', {
  impl: uiTest({
    control: group({
      layout: layout.flex({direction: 'row', wrap: 'wrap'}),
      controls: [
        zui.itemlist({
          itemView: group(
            [
              image({
                url: 'https://imgcy.trivago.com/c_limit,d_dummy.jpeg,f_auto,h_256,q_auto,w_256%image%.webp',
                build: imageBuild('projects/zuiDemo/build/gallery0')
              }),
              fixedText(text('xy')),
              //fixedText(text('imageDebug'))  
            ]
          ),
          boardSize: 4,
          initialZoom: 3,
          center: '2,2',
          items: pipeline('%$hotels/0/gallery%', obj(prop('image', '%%'))),
          itemProps: [xyByIndex()]
        })
      ],
      features: [
        variable('zuiCtx', obj())
      ]
    }),
    expectedResult: contains('-')
  })
})

component('zuiTest.itemlist', {
  impl: uiTest({
    control: group({
      layout: layout.flex({direction: 'row', wrap: 'wrap'}),
      controls: [
        zui.itemlist({
          itemView: group(
            [
              growingText(byName('name')),
              group(
                [
                  firstToFit(
                    [
                      fixedText({prop: byName('price'), length: 8}),
                      fixedText({
                        prop: byName('price'),
                        length: 4,
                        backgroundColorByProp: true
                      }),
                      circle(byName('price'))
                    ]
                  ),
                  fixedText({prop: byName('rating'), length: 4})
                ],
                horizontal()
              ),
              image({
                url: 'https://imgcy.trivago.com/c_limit,d_dummy.jpeg,f_auto,h_256,q_auto,w_256%image%.webp',
                build: imageBuild('projects/zuiDemo/build/top')
              }),
              fixedText(text('x', ' ')),
              fixedText(text('x', ' '))
            ]
          ),
          boardSize: 64,
          initialZoom: 3.821267725000016,
          center: '1.3130639001816125,0.9833333333333321',
          items: pipeline('%$hotels%'),
          itemProps: [
            numeric({
              att: 'price',
              prefix: '$',
              features: [
                priorty(1),
                colorScale(green())
              ]
            }),
            numeric({att: 'rating', features: [priorty(2), colorScale(red())]}),
            text({att: 'name', features: priorty(3)}),
            geo('lat', preferedAxis('y')),
            geo('long', preferedAxis('x'))
          ],
          onChange: refreshControlById('itemPreview')
        }),
        zui.visualItemPreview()
      ],
      features: [
        variable('zuiCtx', obj())
      ]
    }),
    expectedResult: contains('-')
  })
})

component('zuiTest.nested', {
  impl: uiTest({
    control: group({
      layout: layout.flex({direction: 'row', wrap: 'wrap'}),
      controls: [
        zui.itemlist({
          itemView: group(
            [
              circle(byName('price')),
              growingText(byName('name')),
              zui.gridView({
                items: pipeline('%$hotels/0/gallery%', obj(prop('image', '%%'))),
                itemView: group(
                  [
                    image({
                      url: 'https://imgcy.trivago.com/c_limit,d_dummy.jpeg,f_auto,h_256,q_auto,w_256%image%.webp',
                      build: imageBuild('projects/zuiDemo/build/gallery0')
                    }),
                    fixedText(text('xy')),
                    fixedText(text('imageDebug'))
                  ]
                ),
                itemProps: xyByIndex()
              })
            ]
          ),
          boardSize: 64,
          initialZoom: 3.821267725000016,
          center: '1.3130639001816125,0.9833333333333321',
          items: pipeline('%$hotels%'),
          itemProps: [
            numeric({
              att: 'price',
              prefix: '$',
              features: [
                priorty(1),
                colorScale(green())
              ]
            }),
            numeric({att: 'rating', features: [priorty(2), colorScale(red())]}),
            text({att: 'name', features: priorty(3)}),
            geo('lat', preferedAxis('y')),
            geo('long', preferedAxis('x'))
          ],
          onChange: refreshControlById('itemPreview')
        }),
        zui.visualItemPreview()
      ],
      features: [
        variable('zuiCtx', obj())
      ]
    }),
    expectedResult: contains('-')
  })
})
              // firstToFit(
              //   [
              //     zui.gridView({
              //       items: '%gallery%',
              //       DIM: '4',
              //       itemView: image('https://imgcy.trivago.com/c_limit,d_dummy.jpeg,f_auto,h_256,q_auto,w_256%%.webp'),
              //       itemProps: [geo(), TBD()]
              //     }),
              //     image('../hotels/images/256-256%image%.webp')
              //   ]
              // ),

component('hotels', { passiveData:
  [
      {
          "name": "Sheraton Tel Aviv",
          "price": 603,
          "rating": "8.1",
          "type": "Hotel",
          "lat": 32.08148956298828,
          "long": 34.768218994140625,
          "distanceLabel": "right by the beach",
          "imagesCount": 195,
          "image": "/itemimages/32/20/322036_v3",
          "gallery": ["/uploadimages/11/88/11884520","/partnerimages/14/33/1433844342","/partnerimages/14/33/1433844384","/partnerimages/14/33/1433844340","/partnerimages/14/33/1433844390","/partnerimages/14/33/1433844364","/partnerimages/14/33/1433844362","/partnerimages/14/33/1433844346","/partnerimages/66/63/66637386","/partnerimages/13/16/1316611754","/partnerimages/13/16/1316611750","/partnerimages/66/63/66637398","/partnerimages/66/63/66637396","/partnerimages/33/74/337480938","/partnerimages/13/16/1316611676","/partnerimages/33/74/337480936"],
      },
      {
          "name": "Lighthouse Tel Aviv By Brown",
          "price": 163,
          "rating": "7.9",
          "type": "Hotel",
          "lat": 32.07344055175781,
          "long": 34.76831817626953,
          "distanceLabel": "0.2 miles away from the beach",
          "imagesCount": 99,
          "image": "/itemimages/31/43/3143319_v6",
          "gallery": ["/uploadimages/11/88/11884520","/partnerimages/14/33/1433844342","/partnerimages/14/33/1433844384","/partnerimages/14/33/1433844340","/partnerimages/14/33/1433844390","/partnerimages/14/33/1433844364","/partnerimages/14/33/1433844362","/partnerimages/14/33/1433844346","/partnerimages/66/63/66637386","/partnerimages/13/16/1316611754","/partnerimages/13/16/1316611750","/partnerimages/66/63/66637398","/partnerimages/66/63/66637396","/partnerimages/33/74/337480938","/partnerimages/13/16/1316611676","/partnerimages/33/74/337480936"],
      },
]})

// component('zuiTest.build', {
//   impl: dataTest({runBefore: buildPartition('zuiTest.itemlist')})
// })