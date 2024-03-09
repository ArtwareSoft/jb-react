component('probePreviewSuggestionsTest', {
  type: 'test',
  params: [
    {id: 'path', as: 'string'},
    {id: 'expression', as: 'string'},
    {id: 'circuitPath', as: 'string'},
    {id: 'selectionStart', as: 'number', defaultValue: -1},
    {id: 'expectedResult', type: 'boolean', dynamic: true, as: 'boolean'}
  ],
  impl: dataTest({
    calculate: pipe(
      suggestions.calcFromProbePreview('%$path%', {
        input: obj(
          prop('value', '%$expression%'),
          prop('selectionStart', ({},{},{expression, selectionStart}) => selectionStart == -1 ? expression.length : selectionStart)
        ),
        circuitPath: '%$circuitPath%'
      }),
      log('suggestions test', obj(prop('result', '%%'))),
      '%options/text%',
      join(',')
    ),
    expectedResult: call('expectedResult'),
    timeout: 3000
  })
})