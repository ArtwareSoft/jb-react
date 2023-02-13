jb.component('zuiTest.basic', {
  impl: uiTest({control: zui.control(), expectedResult: contains('cmp-id')})
})

jb.component('zuiTest.multiStage', {
  impl: uiTest({
    control: group({
      controls: [
        text('2'),
        zui.multiStage({items: '%$phones%', stages: [threejsCircles()]})
      ]
    }),
    expectedResult: contains('cmp-id')
  })
})

jb.component('zuiTest.multiLayer', {
  impl: uiTest({
    control: group({
      controls: [
        text('2'),
        zui.multiLayer({items: pipeline('%$phones%',slice(0, 10)), layers: [summaryLabel(), circles()]})
      ]
    }),
    expectedResult: contains('cmp-id')
  })
})

jb.component('zuiTest.summaryLabel', {
  impl: uiTest({
    control: group({
      controls: [
        group({
          style: propertySheet.titlesLeft(),
          controls: [
            text('%$zuiCtx/props/DIM%', 'DIM'),
            text('%$zuiCtx/props/zoom%', 'zoom'),
            text('%$zuiCtx/props/strLen%', 'strLen'),
            text('%$zuiCtx/props/center[0]% , %$zuiCtx/props/center[1]%', 'center'),
            text('%$zuiCtx/props/boxSize[0]% , %$zuiCtx/props/boxSize[1]%', 'boxSize'),
            text('%$zuiCtx/props/circleSize%', 'circleSize px'),
            text('%$zuiCtx/props/textSquareInPixels%', 'textSquare px')
          ],
          features: id('propSheet')
        }),
        zui.multiLayer({
          boardSize: 256,
          initialZoom: 4,
          initialCenter: '158,135',
          items: pipeline('%$phones%', slice(0, 10000)),
          layers: [summaryLabel(), circles()],
          onChange: refreshControlById('propSheet')
        })
      ],
      features: variable('zuiCtx', obj())
    }),
    expectedResult: contains('cmp-id')
  })
})

jb.component('zuiTest.itemlist', {
  impl: uiTest({
    control: group({
      controls: [
        group({
          style: propertySheet.titlesLeft(),
          controls: [
            text('%$zuiCtx/props/DIM%', 'DIM'),
            text('%$zuiCtx/props/zoom%', 'zoom'),
            text('%$zuiCtx/props/strLen%', 'strLen'),
            text('%$zuiCtx/props/center[0]% , %$zuiCtx/props/center[1]%', 'center'),
            text('%$zuiCtx/props/boxSize[0]% , %$zuiCtx/props/boxSize[1]%', 'boxSize'),
            text('%$zuiCtx/props/circleSize%', 'circleSize px'),
            text('%$zuiCtx/props/textSquareInPixels%', 'textSquare px')
          ],
          features: id('propSheet')
        }),
        zui.itemlist({
          itemView: group({
            controls: [
              text('my text')
            ]
          }),
          boardSize: 256,
          initialZoom: 256,
          items: pipeline('%$phones%', slice(0, 10000)),
          onChange: refreshControlById('propSheet')
        })
      ],
      features: variable('zuiCtx', obj())
    }),
    expectedResult: contains('cmp-id')
  })
})