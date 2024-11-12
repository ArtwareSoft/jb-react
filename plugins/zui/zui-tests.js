using('ui-testers')

component('points', { passiveData: [
      {"name": "Tel Aviv", x: 0, y : 0 },
      {"name": "Jerusalem", x: 1, y : 1 },
      {"name": "Eilat", x: 2, y : 2 },
      {"name": "Beer Sheva", x: 3, y : 3 },
]})

component('zuiTest.image', {
  impl: uiTest({
    control: zui.itemlist({
      items: '%$points%',
      itemsPositions: xyByProps(),
      boardSize: 10,
      itemView: image(imageOfText('%name%')),
      initialZoom: 3,
      center: '0,10'
    }),
    expectedResult: and(
      contains('[[0,0], [256,0], [512,0], [768,0]]'),
      contains('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA'),
      contains('value: [19]')
    ),
    uiAction: waitForNextUpdate(),
    emulateFrontEnd: true
  })
})

component('zuiTest.fixedText', {
  impl: uiTest({
    control: zui.itemlist({
      items: '%$points%',
      itemsPositions: xyByProps(),
      boardSize: 10,
      itemView: fixedText('%name%'),
      initialZoom: 3,
      center: '0,10'
    }),
    expectedResult: and(
      contains('size":[200,40]'),
      contains('pos":[0,80]'),
      contains('[13380,19200,8533,18517]'),
      contains('attribute vec4 _text;varying vec4 text')
    ),
    uiAction: waitForNextUpdate(),
    emulateFrontEnd: true
  })
})

component('zuiTest.growingText', {
  impl: uiTest({
    control: zui.itemlist({
      items: '%$points%',
      itemsPositions: xyByProps(),
      boardSize: 64,
      itemView: group(growingText('%name%'), circle(numeric('x'))),
      initialZoom: 8,
      center: '0,64',
      style: GPU('640', '640')
    }),
    expectedResult: and(
      contains('[768,0], [512,0], [256,0], [0,0]'),
      contains('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABAAAAAATCAYAA')
    ),
    uiAction: waitForText('data:image/png;base64,'),
    timeout: 1000,
    emulateFrontEnd: true
  })
})

component('zuiTest.circles', {
  impl: uiTest({
    control: zui.itemlist({
      items: '%$points%',
      itemsPositions: xyByProps(),
      boardSize: 10,
      itemView: circle(numeric('x'), greens()),
      initialZoom: 10,
      center: '5,5'
    }),
    expectedResult: and(
      contains('size":[17.8,17.8]'),
      //contains('pos":[91.1,91.1]'),
      contains('[[0,0,0],[0,0.3333333333333333,0],[0,0.6666666666666666,0],[0,1,0]]}'),
      contains('[[0,0],[1,1],[2,2],[3,3]]}]')
    )
  })
})

component('zuiTest.growingTextHotels', {
  doNotRunInTests: true,
  impl: uiTest({
    control: group({
      controls: zui.itemlist({
        items: pipeline('%$allHotels%', slice(0,100)),
        itemsPositions: xyByProps('lat', 'long'),
        boardSize: 64,
        itemView: group(growingText('%name%'), circle(numeric('price'))),
        initialZoom: 7,
        center: '32,30',
        style: GPU('640', '640')
      }),
      features: group.wait(pipe(fileContent('/projects/zuiDemo/hotels-data.json'), json.parse('%%')), {
        varName: 'allHotels'
      })
    }),
    expectedResult: and(
      contains('size":[200,40]'),
      contains('pos":[0,80]'),
      contains('[13380,19200,8533,18517]'),
      contains('attribute vec4 _text;varying vec4 text')
    ),
    uiAction: uiActions(waitForNextUpdate(), waitForNextUpdate()),
    emulateFrontEnd: true
  })
})

component('zuiTest.gallery', {
  doNotRunInTests: true,
  impl: uiTest({
    control: group({
      controls: [
        zui.itemlist({
          items: pipeline('%$hotels/0/gallery%', obj(prop('image', '%%'))),
          itemsPositions: xyByIndex(),
          boardSize: 4,
          itemView: group(
            image('https://imgcy.trivago.com/c_limit,d_dummy.jpeg,f_auto,h_256,q_auto,w_256%image%.webp', {
            }),
            fixedText('%xy%')
          ),
          initialZoom: 3,
          center: '2,2'
        })
      ],
      layout: layout.flex({ direction: 'row', wrap: 'wrap' }),
      features: [
        variable('zuiCtx', obj())
      ]
    }),
    expectedResult: contains('-')
  })
})

/*
component('zuiTest.hotels', {
  doNotRunInTests: true,
  impl: uiTest({
    control: group({
      controls: [
        zui.itemlist({
          items: '%$hotels%',
          prepareProps: [
            numeric('price', { prefix: '$', features: [priorty(1), colorScale(greens())] }),
            numeric('rating', { features: [priorty(2), colorScale(reds())] }),
            text('name', { features: priorty(3) }),
            geo('lat', preferedAxis('y')),
            geo('long', preferedAxis('x'))
          ],
          boardSize: 64,
          itemView: group(
            growingText(byName('name')),
            group({
              views: [
                firstToFit(
                  fixedText(byName('price'), { length: 8 }),
                  fixedText(byName('price'), { length: 4, backgroundColorByProp: true }),
                  circle(byName('price'))
                ),
                fixedText(byName('rating'), { length: 4 })
              ],
              layout: horizontal()
            }),
            image('https://imgcy.trivago.com/c_limit,d_dummy.jpeg,f_auto,h_256,q_auto,w_256%image%.webp', {
            })
          ),
          initialZoom: 64,
          center: '8,8',
          onChange: refreshControlById('itemPreview'),
          features: features(css.width(256, { minMax: 'max' }), css.height(256, { minMax: 'max' }))
        }),
        zui.visualItemPreview()
      ],
      layout: layout.flex({ direction: 'row', wrap: 'wrap' }),
      features: [
        variable('zuiCtx', obj())
      ]
    }),
    expectedResult: contains('-'),
    renderDOM: true
  })
})
*/

// component('zuiTest.nested', {
//   impl: uiTest({
//     control: group({
//       controls: [
//         zui.itemlist({
//           itemView: group(
//             circle(byName('price')),
//             growingText(byName('name')),
//             zui.gridView(pipeline('%$hotels/0/gallery%', obj(prop('image', '%%'))), {
//               itemView: group(
//                 image('https://imgcy.trivago.com/c_limit,d_dummy.jpeg,f_auto,h_256,q_auto,w_256%image%.webp', {
//                 }),
//                 fixedText(text('xy')),
//                 fixedText(text('imageDebug'))
//               ),
//               itemsPositions: xyByIndex()
//             })
//           ),
//           boardSize: 64,
//           initialZoom: 3.821267725000016,
//           center: '1.3130639001816125,0.9833333333333321',
//           items: pipeline('%$hotels%'),
//           prepareProps: [
//             numeric('price', { prefix: '$', features: [priorty(1), colorScale(greens())] }),
//             numeric('rating', { features: [priorty(2), colorScale(reds())] }),
//             text('name', { features: priorty(3) }),
//             geo('lat', { features: preferedAxis('y') }),
//             geo('long', { features: preferedAxis('x') })
//           ],
//           onChange: refreshControlById('itemPreview')
//         }),
//         zui.visualItemPreview()
//       ],
//       layout: layout.flex('row', { wrap: 'wrap' }),
//       features: [variable('zuiCtx', obj())]
//     }),
//     expectedResult: contains('-')
//   })
// })
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
      }
]})

// component('zuiTest.build', {
//   impl: dataTest({runBefore: buildPartition('zuiTest.itemlist')})
// })
