
jb.component('suggestionsTest', {
  type: 'test',
  params: [
    {id: 'expression', as: 'string'},
    {id: 'selectionStart', as: 'number', defaultValue: -1},
    {id: 'path', as: 'string', defaultValue: 'suggestionsTest.defaultProbe~impl~text'},
    {id: 'expectedResult', type: 'boolean', dynamic: true, as: 'boolean'},
    {id: 'forceLocal', as: 'boolean', defaultValue: true, type: 'boolean'}
  ],
  impl: dataTest({
    calculate: pipe(
      suggestions.calcFromRemote({
        probePath: '%$path%',
        input: obj(
          prop('value', '%$expression%'),
          prop('selectionStart', ({},{},{expression, selectionStart}) => selectionStart == -1 ? expression.length : selectionStart)
        ),
        forceLocal: '%$forceLocal%'
      }),
      log('suggestions test', obj(prop('result', '%%'))),
      '%options/text%',
      join(',')
    ),
    expectedResult: call('expectedResult'),
    runBefore: remote.copyPassiveData('people', jbm.wProbe())
  })
})

jb.component('jbEditorChildrenTest', {
  type: 'test',
  params: [
    {id: 'path', as: 'string'},
    {id: 'childrenType', as: 'string', type: ',jb-editor'},
    {id: 'expectedResult', type: 'boolean', dynamic: true, as: 'boolean'}
  ],
  impl: dataTest({
    calculate: ctx => {
      const params = ctx.cmpCtx.params
      const mdl = new jb.studio.jbEditorTree('')
      const titles = mdl.children(params.path).map(path=>mdl.title(path,true))
      const texts = titles.flatMap(x=> typeof x == 'string' ? x : x.querySelectorAll('[$text]').map(el=>el.$text))
      return JSON.stringify(texts)
    },
    expectedResult: call('expectedResult')
  })
})

jb.component('studioProbeTest', {
  type: 'test',
  params: [
    {id: 'circuit', type: 'control', dynamic: true},
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

    const full_path = testId + '~impl~circuit~' + probePath;
    jb.cbLogByPath = {}
    const res1 = await new jb.probe.Probe(new jb.core.jbCtx(ctx,{ profile: circuit.profile, forcePath: testId+ '~impl~circuit', path: '' } ))
      .runCircuit(full_path)
    const res = await (jb.cbLogByPath[res1.probePath] || res1)
    jb.cbLogByPath = null
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

jb.component('pathChangeTest', {
  type: 'test',
  params: [
    {id: 'path', as: 'string'},
    {id: 'action', type: 'action', dynamic: true},
    {id: 'expectedPathAfter', as: 'string'},
    {id: 'cleanUp', type: 'action', dynamic: true}
  ],
  impl: (ctx,path,action,expectedPathAfter,cleanUp)=> {
    //st.initTests();

    const testId = ctx.vars.testID;
    const failure = (part,reason) => ({ id: testId, title: testId + '- ' + part, success:false, reason: reason });
    const success = _ => ({ id: testId, title: testId, success: true });

    const pathRef = jb.tgp.ref(path);
    action();
    
    const res_path = pathRef.path().join('~');
    if (res_path != expectedPathAfter)
      var res = { id: testId, title: testId, success: false , reason: res_path + ' instead of ' + expectedPathAfter }
    else
      var res = { id: testId, title: testId, success: true };
    cleanUp();

    return res;
  }
})