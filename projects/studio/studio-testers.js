
jb.component('suggestions-test', {
  type: 'test',
  params: [
    { id: 'expression', as: 'string' },
    { id: 'selectionStart', as: 'number', defaultValue: -1 },
    { id: 'path', as: 'string', defaultValue: 'suggestions-test.default-probe~impl~title' },
    { id: 'expectedResult', type: 'boolean', dynamic: true, as: 'boolean' },
  ],
  impl :{$: 'data-test', 
    calculate: ctx => {
      var params = ctx.componentContext.params;
      var selectionStart = params.selectionStart == -1 ? params.expression.length : params.selectionStart;

      var circuit = params.path.split('~')[0];
      var probeRes = new jb.studio.Probe(new jb.jbCtx(ctx,{ profile: { $: circuit }, comp: circuit, path: '', data: null }))
        .runCircuit(params.path);
      return probeRes.then(res=>{
        var probeCtx = res.result[0] && res.result[0].in;
        var obj = new jb.studio.suggestions({ value: params.expression, selectionStart: selectionStart })
          .extendWithOptions(probeCtx,probeCtx.path);
        return JSON.stringify(JSON.stringify(obj.options.map(x=>x.text)));
      })
    },
    expectedResult :{$call: 'expectedResult' }
  },
})

jb.component('jb-editor-children-test', {
  type: 'test',
  params: [
    { id: 'path', as: 'string' },
    { id: 'childrenType', as: 'string', type: ',jb-editor' },
    { id: 'expectedResult', type: 'boolean', dynamic: true, as: 'boolean' }
  ],
  impl :{$: 'data-test', 
    calculate: ctx => {
      var params = ctx.componentContext.params;
      var mdl = new jb.studio.jbEditorTree('');
      var titles = mdl.children(params.path)
        .map(path=>
          mdl.title(path,true));
      return JSON.stringify(titles);
    },
    expectedResult :{$call: 'expectedResult' }
  },
})

jb.component('studio-probe-test', {
  type: 'test',
  params: [
    { id: 'circuit', type: 'control', dynamic: true },
    { id: 'probePath', as: 'string' },
    { id: 'expectedVisits', as: 'number', defaultValue : -1 },
  ],
  impl: (ctx,circuit,probePath,expectedVisits)=> {

    var testId = ctx.vars.testID;
    var failure = reason => ({ id: testId, title: testId, success:false, reason: reason });
    var success = _ => ({ id: testId, title: testId, success: true });

    var full_path = testId + '~impl~' + probePath;
    var probeRes = new jb.studio.Probe(new jb.jbCtx(ctx,{ profile: circuit.profile, comp: testId, path: '' } ))
      .runCircuit(full_path);
    return probeRes.then(res=>{
          try {
            if (res.result.visits != expectedVisits && expectedVisits != -1)
              return failure(`expected visits error actual/expected: ${res.result.visits}/${expectedVisits}`);
            if (!res.result[0])
                return failure('no probe results at path ' + probePath);
          } catch(e) {
            jb.logException(e,'jb-path-test');
            return failure('exception');
          }
          return success();
    })
  }
})

jb.component('path-change-test', {
  type: 'test',
  params: [
    { id: 'path', as: 'string' },
    { id: 'action', type: 'action', dynamic: true },
    { id: 'expectedPathAfter', as: 'string' },
    { id: 'cleanUp', type: 'action', dynamic: true  },
  ],
  impl: (ctx,path,action,expectedPathAfter,cleanUp)=> {
    var testId = ctx.vars.testID;
    var failure = (part,reason) => ({ id: testId, title: testId + '- ' + part, success:false, reason: reason });
    var success = _ => ({ id: testId, title: testId, success: true });

    var pathRef = jb.studio.refOfPath(path);
    action();
    pathRef.handler.refresh(pathRef);
    if (pathRef.$jb_path.join('~') != expectedPathAfter)
      var res = { id: testId, title: testId, success: false , reason: pathRef.$jb_path.join('~') + ' instead of ' + expectedPathAfter }
    else
      var res = { id: testId, title: testId, success: true };
    cleanUp();

    return res;
  }
})
