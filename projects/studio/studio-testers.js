
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
      var probeRes = new jb.studio.Probe(new jb.jbCtx(ctx,{ profile: { $: circuit }, comp: circuit, path: '', data: null }),true)
        .runCircuit(params.path);
      return probeRes.then(res=>{
        var probeCtx = res.finalResult[0] && res.finalResult[0].in;
        var obj = new jb.studio.suggestions({ value: params.expression, selectionStart: selectionStart })
          .extendWithOptions(probeCtx,probeCtx.path);
        return JSON.stringify(JSON.stringify(obj.options.map(x=>x.text)));
      })
    },
    expectedResult :{$call: 'expectedResult' }
  },
})

jb.component('studio-tree-children-test', {
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

jb.component('jb-path-test', {
  type: 'test',
  params: [
    { id: 'controlWithMark', type: 'control', dynamic: true },
    { id: 'staticPath', as: 'string' },
    { id: 'expectedDynamicCounter', as: 'number' },
    { id: 'probeCheck', type: 'boolean', dynamic: true, as: 'boolean' }
  ],
  impl: (ctx,control,staticPath,expectedDynamicCounter,probeCheck)=> {

    var testId = ctx.vars.testID;
    var failure = (part,reason) => ({ id: testId, title: testId + '- ' + part, success:false, reason: reason });
    var success = _ => ({ id: testId, title: testId, success: true });

    var full_path = testId + '~impl~' + staticPath;
    var probeRes = new jb.studio.Probe(new jb.jbCtx(ctx,{ profile: control.profile, comp: testId, path: '' } ),true)
      .runCircuit(full_path);
    return probeRes.then(res=>{
          try {
            var match = Array.from(res.element.querySelectorAll('[jb-ctx]'))
            .filter(e=> {
              var ctx2 = jb.ctxDictionary[e.getAttribute('jb-ctx')];
              return ctx2.path == full_path || (ctx2.componentContext && ctx2.componentContext.callerPath == full_path)
            })
            if (match.length != expectedDynamicCounter)
              return failure('dynamic counter', 'jb-path error: ' + staticPath + ' found ' + (match || []).length +' times. expecting ' + expectedDynamicCounter + ' occurrences');
            if (!res.finalResult[0] || !probeCheck(res.finalResult[0].in) )
                return failure('probe');
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
