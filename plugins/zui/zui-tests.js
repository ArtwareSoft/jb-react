using('ui-testers')

component('points', { passiveData: [
      {"name": "Tel Aviv", x: 0, y : 0 },
      {"name": "Jerusalem", x: 1, y : 1 },
      {"name": "Eilat", x: 2, y : 2 },
      {"name": "Beer Sheva", x: 3, y : 3 },
]})

component('zuiTest.zoomingGridMode', {
  impl: zuiTest({
    control: itemlist({
      items: '%$points%',
      itemControl: circle(smoothGrowth({ growthFactor: 20 }), { features: valueColor('fill', green10()) }),
      itemsLayout: grid([10,10], { initialZoom: 10, center: [5,5] })
    }),
    expectedResult: contains(`glVar: 'fillColor'`)
  })
})

component('zuiTest.dynamicFlowMode', {
  impl: zuiTest({
    control: itemlist({
      items: '%$points%',
      itemControl: group(text('11111 1111', { features: minHeight(100) }), text('222222 222222222 22222222 222222222', { features: minHeight(100) })),
      itemsLayout: grid([10,10], { initialZoom: 10, center: [4,4] })
    }),
    expectedResult: contains(`glVar: 'fillColor'`)
  })
})

component('zuiTest.zoomingGridWithTextures', {
  impl: zuiTest({
    control: itemlist({
      items: '%$points%',
      itemControl: text('%name%'),
      itemsLayout: grid([4,4], { initialZoom: 4, center: [2,2] })
    }),
    expectedResult: contains(`glVar: 'fillColor'`)
  })
})

component('zuiTest.flowMode', {
  impl: zuiTest(group(text('Hello'), text('World'), circle(fixed([20,20]))), contains('titleTexture_0'))
})

component('zuiTest.fixedMode', {
  impl: zuiTest(text('click me'), 'size: [98,32]')
})

component('zuiTest.growingDiagnostics', {
  doNotRunInTests: true,
  impl: zuiTest({
    control: itemlist({
      items: '%$testData%',
      itemControl: text('%title%', { align: keepSize('right', 'top') }),
      itemsLayout: grid([8,8], xyByProps('urgency', 'likelihood'), { initialZoom: 3, center: [4,6] })
    }),
    testData: test.diagnostics()
  })
})

component('test.diagnostics', {
  impl: pipe(
    Var('diag', fileContent('/projects/zuiDemo/diagnostics.json'), { async: true }),
    Var('depAr', fileContent('/projects/zuiDemo/departments.json'), { async: true }),
    Var('dep', dynamicObject(json.parse('%$depAr%'), '%title%', { value: '%%' })),
    json.parse('%$diag%'),
    extendWithObj(property('%title%', '%$dep%'), '%%')
  )
})

// text('%title%', { align: keepSize('center', 'top') }),
// text('%department%', { align: keepSize('center', 'top') }),

// text('%description%'),
        // group(text('explanation'), text('%general_explanation%')),
        // group(text('symptoms'), text('%how_it_relates_to_the_symptoms%'))


// component('zuiTest.growingDiagnostics', {
//   doNotRunInTests: true,
//   impl: zuiTest({
//     control: group({
//       controls: zui.grid({
//         items: '%$diagnostics%',
//         itemsPositions: xyByProps('urgency', 'likelihood'),
//         boardSize: 8,
//         itemView: firstToFit(
//           allOrNone({
//             views: [
//               circle(enumarator('department')),
//               growingFlow(
//                 title('%title%', { align: keepSize('center', 'top') }),
//                 title('%department%', { align: keepSize('center', 'top') }),
//                 paragraph('%description%'),
//                 group(title('explanation'), paragraph('%general_explanation%')),
//                 group(title('symptoms'), paragraph('%how_it_relates_to_the_symptoms%'))
//               )
//             ],
//             layoutFeatures: minSize([100,150])
//           }),
//           group(
//             circle(enumarator('department')),
//             growingText('%title%'),
//             growingText('%department%', { minSize: [100,75] })
//           )
//         ),
//         initialZoom: 8,
//         center: '7,7',
//         style: GPU('100%', '100%', { fullScreen: true })
//       }),
//       features: group.wait({
//         for: pipe(
//           Var('diag', fileContent('/projects/zuiDemo/diagnostics.json'), { async: true }),
//           Var('depAr', fileContent('/projects/zuiDemo/departments.json'), { async: true }),
//           Var('dep', dynamicObject(json.parse('%$depAr%'), '%title%', { value: '%%' })),
//           json.parse('%$diag%'),
//           extendWithObj(property('%title%', '%$dep%'), '%%')
//         ),
//         varName: 'diagnostics'
//       })
//     }),
//     uiAction: waitForNextUpdate(),
//     emulateFrontEnd: true
//   })
// })

// component('zuiTest.allOrNone', {
//   impl: uiTest({
//     control: zui.grid({
//       items: '%$points%',
//       itemsPositions: xyByProps(),
//       boardSize: 10,
//       itemView: group(allOrNone(circle(numeric('x')), text('hello', 5), text('world', 5)), text('sec', 3)),
//       initialZoom: 6,
//       center: '1.5,9.4',
//       style: GPU('640', '640')
//     }),
//     expectedResult: notContains(`id: 'top~0'`),
//     uiAction: animationEvent(),
//     emulateFrontEnd: true
//   })
// })

// component('zuiTest.minSize', {
//   impl: uiTest({
//     control: zui.grid({
//       items: '%$points%',
//       itemsPositions: xyByProps(),
//       boardSize: 10,
//       itemView: firstToFit(
//         allOrNone(text('hello', 5), text('world', 5), { layoutFeatures: minSize(100) }),
//         circle(numeric('x'))
//       ),
//       initialZoom: 3,
//       center: '1.5,9.4'
//     }),
//     expectedResult: and(contains(`id: 'top~1'`), notContains("id: 'top~0~1'")),
//     uiAction: animationEvent(),
//     emulateFrontEnd: true
//   })
// })

// component('zuiTest.flow', {
//   impl: uiTest({
//     control: zui.grid({
//       items: '%$points%',
//       itemsPositions: xyByProps(),
//       boardSize: 10,
//       itemView: flow({
//         elements: [
//           group(title('%name%1'), paragraph('1111 %name% %name% %name% %name% %name% %name% %name%')),
//           group(
//             title('%name%2'),
//             paragraph('2222 %name% %name% %name% %name% %name% %name% %name% %name% %name% %name% %name% %name% %name% %name%')
//           )
//         ],
//         width: 200
//       }),
//       initialZoom: 1.3,
//       center: '1.5,9.4',
//       style: GPU('640', '640')
//     }),
//     expectedResult: contains('[200,492.30769230769226'),
//     uiAction: animationEvent(),
//     emulateFrontEnd: true
//   })
// })


// component('zuiTest.growingFlow', {
//   impl: uiTest({
//     control: zui.grid({
//       items: '%$points%',
//       itemsPositions: xyByProps(),
//       boardSize: 10,
//       itemView: growingFlow(
//         group(title('%name%1'), paragraph('1111 %name% %name% %name% %name% %name% %name% %name%')),
//         group(
//           title('%name%2'),
//           paragraph('2222 %name% %name% %name% %name% %name% %name% %name% %name% %name% %name% %name% %name% %name% %name%')
//         )
//       ),
//       initialZoom: 1.3,
//       center: '1.5,9.4',
//       style: GPU('400', '400')
//     }),
//     expectedResult: contains('elem0posSize','calcbedata1','elem1posSize'),
//     uiAction: uiActions(animationEvent(), zoomEvent(2)),
//     emulateFrontEnd: true
//   })
// })

// component('zuiTest.image', {
//   impl: uiTest({
//     control: zui.grid({
//       items: '%$points%',
//       itemsPositions: xyByProps(),
//       boardSize: 10,
//       itemView: image(imageOfText('%name%'), { align: keepSize() }),
//       initialZoom: 3,
//       center: '0,10'
//     }),
//     expectedResult: and(
//       contains('[[0,0], [256,0], [512,0], [768,0]]'),
//       contains('data:image/png;base64,iVBORw0KGgoAA'),
//       contains('[73,12], [31,12], [83,12]')
//     ),
//     uiAction: animationEvent(),
//     emulateFrontEnd: true
//   })
// })

// component('zuiTest.text', {
//   impl: uiTest({
//     control: zui.grid({
//       items: '%$points%',
//       itemsPositions: xyByProps(),
//       boardSize: 10,
//       itemView: text('%name%', 4),
//       initialZoom: 3,
//       center: '1.5,9.4'
//     }),
//     expectedResult: and(
//       contains('[[0,0], [24.8984375,0], [56.0234375,0], [82.703125,0]]'),
//       contains('[[24.8984375,15], [31.125,15], [26.6796875,15], [33.796875,15]]'),
//       contains('data:image/png;base64,iVBORw0')
//     ),
//     uiAction: animationEvent(),
//     emulateFrontEnd: true
//   })
// })

// component('zuiTest.text8', {
//   impl: uiTest({
//     control: zui.grid({
//       items: '%$points%',
//       itemsPositions: xyByProps(),
//       boardSize: 10,
//       itemView: text8('%name%'),
//       initialZoom: 3,
//       center: '0,10'
//     }),
//     expectedResult: and(
//       contains('size":[66.66666666666667,13.333333333333334]'),
//       contains('pos":[0,26.666666666666668]'),
//       contains('[13380,19200,8533,18517]'),
//       contains('attribute vec4 _text;varying vec4 text')
//     ),
//     uiAction: animationEvent(),
//     emulateFrontEnd: true
//   })
// })

// component('zuiTest.growingText', {
//   impl: uiTest({
//     control: zui.grid({
//       items: '%$points%',
//       itemsPositions: xyByProps(),
//       boardSize: 64,
//       itemView: group(circle(numeric('x')), growingText('%name%')),
//       initialZoom: 8,
//       center: '0,64',
//       style: GPU('640', '640')
//     }),
//     expectedResult: and(contains('[59.92613636363637,33.2]'), contains('data:image/png;base64,iVBORw0KGgoAAAANSUhEU')),
//     uiAction: animationEvent(),
//     emulateFrontEnd: true
//   })
// })

// component('zuiTest.growingText.changeView', {
//   impl: uiTest({
//     control: zui.grid({
//       items: '%$points%',
//       itemsPositions: xyByProps(),
//       boardSize: 64,
//       itemView: group(circle(numeric('x')), growingText('%name%')),
//       initialZoom: 8,
//       center: '0,64',
//       style: GPU('640', '640')
//     }),
//     expectedResult: contains('top~0~2','data:image/png;base64','calcbedata1','top~0~0','data:image/png;base64,'),
//     uiAction: uiActions(animationEvent(), zoomEvent(2)),
//     emulateFrontEnd: true
//   })
// })

// component('zuiTest.circles', {
//   impl: uiTest({
//     control: zui.grid({
//       items: '%$points%',
//       itemsPositions: xyByProps(),
//       boardSize: 10,
//       itemView: circle(numeric('x'), green10()),
//       initialZoom: 10,
//       center: '5,5'
//     }),
//     expectedResult: and(
//       contains('[0,0.3333333333333333,0]'),
//       contains('[[0,0],[1,1],[2,2],[3,3]]}]')
//     ),
//     uiAction: animationEvent(),
//     emulateFrontEnd: true
//   })
// })

// component('zuiTest.growingTextHotels', {
//   doNotRunInTests: true,
//   impl: uiTest({
//     control: group({
//       controls: zui.grid({
//         items: '%$allHotels%',
//         itemsPositions: xyByProps('lat', 'long'),
//         boardSize: 64,
//         itemView: group(circle(numeric('price')), growingText('%name%')),
//         initialZoom: 7,
//         center: '32,30',
//         style: GPU('640', '640')
//       }),
//       features: group.wait(pipe(fileContent('/projects/zuiDemo/hotels-data.json'), json.parse('%%')), {
//         varName: 'allHotels'
//       })
//     }),
//     uiAction: waitForNextUpdate(),
//     emulateFrontEnd: true
//   })
// })

// component('zuiTest.gallery', {
//   doNotRunInTests: true,
//   impl: uiTest({
//     control: group({
//       controls: [
//         zui.grid({
//           items: pipeline('%$hotels/0/gallery%', obj(prop('image', '%%'))),
//           itemsPositions: xyByIndex(),
//           boardSize: 4,
//           itemView: group(
//             image('https://imgcy.trivago.com/c_limit,d_dummy.jpeg,f_auto,h_256,q_auto,w_256%image%.webp', {
//             }),
//             text8('%xy%')
//           ),
//           initialZoom: 3,
//           center: '2,2'
//         })
//       ],
//       layout: layout.flex({ direction: 'row', wrap: 'wrap' }),
//       features: [
//         variable('zuiCtx', obj())
//       ]
//     }),
//     expectedResult: contains('-')
//   })
// })

/*
component('zuiTest.hotels', {
  doNotRunInTests: true,
  impl: uiTest({
    control: group({
      controls: [
        zui.grid({
          items: '%$hotels%',
          prepareProps: [
            numeric('price', { prefix: '$', features: [priorty(1), colorScale(green10())] }),
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
                  text8(byName('price'), { length: 8 }),
                  text8(byName('price'), { length: 4, backgroundColorByProp: true }),
                  circle(byName('price'))
                ),
                text8(byName('rating'), { length: 4 })
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
//         zui.grid({
//           itemView: group(
//             circle(byName('price')),
//             growingText(byName('name')),
//             zui.gridView(pipeline('%$hotels/0/gallery%', obj(prop('image', '%%'))), {
//               itemView: group(
//                 image('https://imgcy.trivago.com/c_limit,d_dummy.jpeg,f_auto,h_256,q_auto,w_256%image%.webp', {
//                 }),
//                 text8(text('xy')),
//                 text8(text('imageDebug'))
//               ),
//               itemsPositions: xyByIndex()
//             })
//           ),
//           boardSize: 64,
//           initialZoom: 3.821267725000016,
//           center: '1.3130639001816125,0.9833333333333321',
//           items: pipeline('%$hotels%'),
//           prepareProps: [
//             numeric('price', { prefix: '$', features: [priorty(1), colorScale(green10())] }),
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
