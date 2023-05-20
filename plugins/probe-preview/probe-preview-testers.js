component('remoteSuggestionsTest', {
  type: 'test',
  params: [
    {id: 'expression', as: 'string'},
    {id: 'selectionStart', as: 'number', defaultValue: -1},
    {id: 'path', as: 'string', defaultValue: 'suggestionsTest.defaultProbe~impl~text'},
    {id: 'expectedResult', type: 'boolean', dynamic: true, as: 'boolean'},
  ],
  impl: dataTest({
    timeout: 1000,
    calculate: pipe(
      suggestions.calcFromProbePreview({
        probePath: '%$path%',
        input: obj(
          prop('value', '%$expression%'),
          prop('selectionStart', ({},{},{expression, selectionStart}) => selectionStart == -1 ? expression.length : selectionStart)
        )
      }),
      log('suggestions test', obj(prop('result', '%%'))),
      '%options/text%',
      join(',')
    ),
    expectedResult: call('expectedResult'),
    runBefore: remote.copyPassiveData('people', probePreviewWorker())
  }),
  require :{ $: 'suggestionsTest.defaultProbe'}
})