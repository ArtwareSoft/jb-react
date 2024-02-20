
component('llm.tutorialBuilder', {
  type: 'control<>',
  params: [
    {id: 'tutorialData'}
  ],
  impl: group({
    controls: [
      text('%title%', { style: header.h2() }),
      table({
        items: '%training%',
        controls: [
          text('%prompt%', 'prompt', {
            style: text.codemirror({ height: '80', lineWrapping: true, lineNumbers: true, formatText: false, mode: 'javascript' }),
            features: css.width('1000', { minMax: 'max' })
          }),
          text('%completion%', 'completion', { style: text.span() })
        ],
        features: css('>table>tbody>tr>td{ vertical-align: top }')
      })
    ],
    features: group.data('%$tutorialData%')
  })
})

component('llm.enrichTrainingItem', {
  params: [
    {id: 'item', defaultValue: '%%'}
  ],
  impl: pipeline(
    '%$item%',
    obj(prop('isCode', contains('component', { allText: '%prompt%' })))
  )
})
