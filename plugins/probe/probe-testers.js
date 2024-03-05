component('suggestionsTest', {
  type: 'test',
  params: [
    {id: 'expression', as: 'string'},
    {id: 'selectionStart', as: 'number', defaultValue: -1},
    {id: 'path', as: 'string', defaultValue: 'control<>suggestionsTest.defaultProbe~impl~text'},
    {id: 'expectedResult', type: 'boolean', dynamic: true, as: 'boolean'}
  ],
  impl: dataTest({
    calculate: pipe(
      probe.suggestions({
        probePath: '%$path%',
        expressionOnly: false,
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
    timeout: 1000
  }),
  require: {$: 'control<>suggestionsTest.defaultProbe' }
})

component('probeTest', {
  type: 'test',
  params: [
    {id: 'circuit', type: 'data', moreTypes: 'control<>', dynamic: true},
    {id: 'probePath', as: 'string'},
    {id: 'allowClosestPath', as: 'boolean', type: 'boolean'},
    {id: 'expectedVisits', as: 'number', defaultValue: -1},
    {id: 'expectedOutResult', type: 'boolean', dynamic: true, defaultValue: true},
    {id: 'expectedResult', type: 'boolean', dynamic: true, defaultValue: true}
  ],
  impl: dataTest({
    calculate: async (ctx,{fullTestId}, {circuit,probePath})=> {
      const base_path = `${fullTestId}~impl~circuit`
      const full_path = `${base_path}~${probePath}`
      jb.cbLogByPath = {}
      const res1 = await new jb.probe.Probe(new jb.core.jbCtx(ctx,{ profile: circuit.profile, forcePath: base_path, path: '' } ))
        .runCircuit(full_path)
      return await (jb.cbLogByPath[res1.probePath] || res1)
    },
    expectedResult: (ctx,{},{allowClosestPath,expectedVisits,expectedOutResult,expectedResult,probePath}) => {
        jb.cbLogByPath = null
        const {closestPath, result, callbagLog, resultVisits} = ctx.data
        let error = ''
        try {
          if (expectedVisits == 0 && closestPath)
            error = ''
          else if (!allowClosestPath && closestPath)
            error = `no probe results at path ${probePath}`
          else if (resultVisits != expectedVisits && expectedVisits != -1)
            error = `expected visits error. actual: ${resultVisits} expected: ${expectedVisits}`
          else if (!result[0])
            error = `no probe results at path ${probePath}`
          const resData = callbagLog && result || jb.path(result,'0.out')
          if (!expectedOutResult(ctx.setData(resData)))
            error = `wrong out result ${JSON.stringify(resData)}`
          else if (!expectedResult(ctx.setData(result)))
            error = `wrong result`
        } catch(e) {
          jb.logException(e,'jb-path-test',{ctx})
          return failure('exception')
        }    
        return error ? { testFailure: error } : true
    },
    includeTestRes: true
  })
})
