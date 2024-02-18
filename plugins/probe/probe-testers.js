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
    {id: 'circuit', type: 'data,control', dynamic: true},
    {id: 'probePath', as: 'string'},
    {id: 'allowClosestPath', as: 'boolean', type: 'boolean'},
    {id: 'expectedVisits', as: 'number', defaultValue: -1},
    {id: 'expectedOutResult', type: 'boolean', dynamic: true, defaultValue: true},
    {id: 'expectedResult', type: 'boolean', dynamic: true, defaultValue: true}
  ],
  impl: async (ctx,circuit,probePath,allowClosestPath,expectedVisits,expectedOutResult,expectedResult)=> {
    //st.initTests()

    const testId = ctx.vars.testID;
    const failure = reason => ({ id: testId, title: testId, success:false, reason: reason });
    const success = _ => ({ id: testId, title: testId, success: true });

    const base_path = `test<>${testId}~impl~circuit`
    const full_path = `${base_path}~${probePath}`
    jb.cbLogByPath = {}
    const res1 = await new jb.probe.Probe(new jb.core.jbCtx(ctx,{ profile: circuit.profile, forcePath: base_path, path: '' } ))
      .runCircuit(full_path)
    const res = await (jb.cbLogByPath[res1.probePath] || res1)
    jb.cbLogByPath = null
    debugger
    try {
        if (expectedVisits == 0 && res.closestPath)
          return success();
        if (!allowClosestPath && res.closestPath)
          return failure('no probe results at path ' + probePath);
        if (res.result.visits != expectedVisits && expectedVisits != -1)
          return failure(`expected visits error actual/expected: ${res.result.visits}/${expectedVisits}`);
        if (!res.result[0])
            return failure('no probe results at path ' + probePath)
        const resData = res.callbagLog && res.result || res.result[0].out
        if (!expectedOutResult(ctx.setData(resData)))
            return failure('wrong out result ' + JSON.stringify(resData))
        if (!expectedResult(ctx.setData(res.result)))
            return failure('wrong result ' + JSON.stringify(res.result))
            
        return success();
    } catch(e) {
      jb.logException(e,'jb-path-test',{ctx})
      return failure('exception')
    }
  }
})
