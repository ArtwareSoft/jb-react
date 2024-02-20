using('ui')

component('llm.HtmlAndCssBuilder', {
  type: 'control<>',
  impl: group({
    controls: [
      group({
        controls: [
          editableText('json', '%$workspace.json%', {
            style: editableText.codemirror({ mode: 'javascript' })
          }),
          html('%$workspace/result/html%', {
            features: [
              css('%$workspace/result/css%'),
              watchRef('%$workspace/result%', 'yes')
            ]
          })
        ],
        layout: layout.horizontalFixedSplit()
      }),
      button('build', runActionOnItem(llm.HtmlAndCssForJson('%$json%'), writeValue('%$workspace/result%')))
    ],
    features: watchable('workspace', obj())
  })
})