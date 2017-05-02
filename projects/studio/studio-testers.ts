import {jb} from 'jb-core';
import {Probe} from './studio-probe';
import {suggestions} from './studio-suggestions';
import {TgpModel} from './studio-tgp-model';

jb.component('suggestions-test', {
  type: 'test',
  params: [
    { id: 'expression', as: 'string' },
    { id: 'selectionStart', as: 'number', defaultValue: -1 },
    { id: 'path', as: 'string', defaultValue: 'suggestions-test.default-probe~title' },
    { id: 'expectedResult', type: 'boolean', dynamic: true, as: 'boolean' },
  ],
  impl :{$: 'data-test', 
    calculate: ctx => {
      var params = ctx.componentContext.params;
      var selectionStart = params.selectionStart == -1 ? params.expression.length : params.selectionStart;

      var circuit = params.path.split('~')[0];
      var probeRes = new Probe(jb.ctx(ctx,{ profile: { $: circuit }, comp: circuit, path: '', data: null }),true)
        .runCircuit(params.path);
      return probeRes.then(res=>{
        var probeCtx = res.finalResult[0] && res.finalResult[0].in;
        var obj = new suggestions({ value: params.expression, selectionStart: selectionStart })
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
      var mdl = new TgpModel('',params.childrenType);
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

    // var probProf = findProbeProfile(control.profile);
    // if (!probProf)
    //   return failure('no prob prof');
     // ********** dynamic counter
    var testId = ctx.vars.testID;
    var full_path = testId + '~' + staticPath;
    var probeRes = new Probe(jb.ctx(ctx,{ profile: control.profile, comp: testId, path: '' } ),true)
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
            return failure('exception');
          }
          return success();
    })

    function failure(part,reason) { return { id: testId, title: testId + '- ' + part, success:false, reason: reason } };
    function success() { return { id: testId, title: testId, success: true } };

  }

})

// function findProbeProfile(parent) {
//   if (parent.$mark)
//     return parent;
//   if (typeof parent == 'object')
//     return jb.entries(parent)
//     .map(e=>({
//       prop: e[0],
//       res: findProbeProfile(e[1])
//     }))
//     .map(e=>
//       (e.res == 'markInString') ? ({$parent: parent, $prop: e.prop}) : e.res)
//     .filter(x=>x)[0];

//   if (typeof parent == 'string' && parent.indexOf('$mark:') == 0)
//     return 'markInString';
// }

