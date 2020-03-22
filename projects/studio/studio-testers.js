(function(){
const st = jb.studio
function compsRef(val,opEvent) {
  if (typeof val == 'undefined')
    return jb.comps;
  else {
    jb.comps = val;
  }
}
compsRef.id = 'comps-test'

st.initTests = function() {
  st.compsRefHandler = st.compsRefHandler || jb.ui.extraWatchableHandler(compsRef);
}

jb.component('suggestionsTest', {
  type: 'test',
  params: [
    {id: 'expression', as: 'string'},
    {id: 'selectionStart', as: 'number', defaultValue: -1},
    {id: 'path', as: 'string', defaultValue: 'suggestionsTest.defaultProbe~impl~text'},
    {id: 'expectedResult', type: 'boolean', dynamic: true, as: 'boolean'}
  ],
  impl: dataTest({
    calculate: ctx => {
      const params = ctx.componentContext.params;
      const selectionStart = params.selectionStart == -1 ? params.expression.length : params.selectionStart;

      const circuit = params.path.split('~')[0];
      const probeRes = new jb.studio.Probe(new jb.jbCtx(ctx,{ profile: { $: circuit }, comp: circuit, path: '', data: null }))
        .runCircuit(params.path);
      return probeRes.then(res=>{
        const probeCtx = res.result[0] && res.result[0].in;
        const obj = new jb.studio.suggestions({ value: params.expression, selectionStart: selectionStart })
          .extendWithOptions(probeCtx.setVar('people-array',ctx.exp('%$people-array%')),probeCtx.path);
        return JSON.stringify(JSON.stringify(obj.options.map(x=>x.text)));
      })
    },
    expectedResult: call('expectedResult')
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
      const params = ctx.componentContext.params;
      const mdl = new jb.studio.jbEditorTree('');
      const titles = mdl.children(params.path).map(path=>mdl.title(path,true));
      return JSON.stringify(titles);
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
    {id: 'expectedVisits', as: 'number', defaultValue: -1}
  ],
  impl: (ctx,circuit,probePath,allowClosestPath,expectedVisits)=> {
    st.initTests();

    const testId = ctx.vars.testID;
    const failure = reason => ({ id: testId, title: testId, success:false, reason: reason });
    const success = _ => ({ id: testId, title: testId, success: true });

    const full_path = testId + '~impl~circuit~' + probePath;
    const probeRes = new jb.studio.Probe(new jb.jbCtx(ctx,{ profile: circuit.profile, forcePath: testId+ '~impl~circuit', path: '' } ))
      .runCircuit(full_path);
    return probeRes.then(res=>{
          try {
						if (expectedVisits == 0 && res.closestPath)
							return success();
            if (!allowClosestPath && res.closestPath)
              return failure('no probe results at path ' + probePath);
            if (res.result.visits != expectedVisits && expectedVisits != -1)
              return failure(`expected visits error actual/expected: ${res.result.visits}/${expectedVisits}`);
            if (!res.result[0])
                return failure('no probe results at path ' + probePath);
          } catch(e) {
            jb.logException(e,'jb-path-test',ctx);
            return failure('exception');
          }
          return success();
    })
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
    st.initTests();

    const testId = ctx.vars.testID;
    const failure = (part,reason) => ({ id: testId, title: testId + '- ' + part, success:false, reason: reason });
    const success = _ => ({ id: testId, title: testId, success: true });

    const pathRef = jb.studio.refOfPath(path);
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

})()