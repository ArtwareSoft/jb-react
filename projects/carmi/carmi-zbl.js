function originalCarmi() {
    const { compile, root, arg0, setter, splice } = require("carmi");
    const todosByIdx = root.keyBy("idx");
    const anyTodoNotDone = todosByIdx.anyValues(todo => todo.get("done").not());
    const todosDisplayByIdx = todosByIdx.mapValues(todo =>
    todo.get("task").plus(todo.get("done").ternary(" - done", " - not done"))
    );
    const todosDisplay = root.map(todo => todosDisplayByIdx.get(todo.get("idx")));
    const model = {
    todosDisplay,
    anyTodoNotDone,
    setTodoDone: setter(arg0, "done"),
    spliceTodos: splice(),
    };

    const todos = todosModel([
    { idx: "1", done: false, task: "write a blog post about carmi" },
    { idx: "2", done: true, task: "publish to npm" },
    { idx: "3", done: false, task: "write a demo for carmi" },
    ]);
}

jb.resource('todos.sample1', [
    { idx: "1", done: false, task: "write a blog post about carmi" },
    { idx: "2", done: true, task: "publish to npm" },
    { idx: "3", done: false, task: "write a demo for carmi" },
])

jb.component('carmi.todos', {
    impl: {$: 'carmi-model', 
        sampleData: '%$todos.sample1%',
        vars: [
            {$: 'carmi.var', id: 'todoByIdx', exp :{$: 'keyBy', array: '%$roots%', key: '%idx%' } },
            {$: 'carmi.var', id: 'todosDisplayByIdx', exp :{$: 'mapValues', object: '%$todoByIdx%', itemVar: 'todo', 
                mapTo :{$: 'plus', items: [
                        '%task%',
                            {$: 'terinary', if: '%$todo/done%', then: ' - done', else: ' - not done' } 
                        ]
                }
            }}
        ],
        result: [
            {$: 'carmi.var', id: 'todosDisplay', exp :{$: 'map', array: '%$roots%', itemVar: 'todo', mapTo: {$: 'get', obj: '%$todoByIdx%', path: '%$item/idx%' }}},
            {$: 'carmi.var', id: 'anyTodoNotDone', exp :{$: 'anyValues', object: '%$todoByIdx%', condition: {$: 'not', of: '%done%' } }},
        ],
        setters: [
            {$: 'carmi.setter', id: 'setTodoDone', exp: {$: 'setter', arg0: {$: 'arg0'}, arg1: "done" }},
            {$: 'carmi.setter', id: 'spliceTodos', exp: {$: 'splice' }}
        ]
    }
})

jb.component('carmi.model-editor', {
    type: 'control',
    impl :{$: 'group' }
  })
  

  const { Expr, Token, Setter, Expression, SetterExpression, SpliceSetterExpression, TokenTypeData, SourceTag } = carmi.lang;
  const { wrap, compile, chain, root, and, ternary, or, arg0, arg1, setter, splice, withName } = carmi;
  
  function primitiveCtrl(ctx, exp) {
      return ctx.run({ $: 'button', title: exp, style :{$: 'button.href'} })
  }
  function groupCtrl(ctx, ctrls) {
      return ctx.run({$: 'group', controls: ctx2 => ctrls })
  }
  
  function runPipe(ctx, profiles, data) {
      const start = Array.isArray(data) ? data : typeof data == 'object' ? data : [data];
      const output = profiles.reduce((acc, prof, index) => { 
          const elem = step(prof, index, acc)
          acc.controls.push(elem.ctrl || primitiveCtrl(elem.ctx, elem.exp))
          acc.elem = elem
          return acc
      }, {output: data.output, controls: []});
      return output
  
      function step(profile, i, data) {
          const innerPath = 'pipe~';
          if (!profile || profile.$disabled) return data;
          if (jb.profileType(profile).indexOf('aggregator') != -1)
              return jb.run(new jb.jbCtx(ctx, { data, profile, path: innerPath+i }));
          if (!Array.isArray(data.output))
              return [];
          const res = data.output.map(item => {
              const ctx2 = new jb.jbCtx(ctx,{data: {output: item}, profile, path: innerPath+i});
              return Object.assign(jb.run(ctx2),{ctx: ctx2})
          })
          return res;
      }
  }
  
  if (jb.studio && jb.studio.probeResultCustomizers) {
       jb.studio.probeResultCustomizers.push( (ctx, res) => {
           if (res.out && typeof res.out.output !== 'undefined') 
              res.out = res.out.exp + ': ' + res.out.output 
      })
  }
  
  function chainExp(ctx, pipe_profiles) {
      return pipe_profiles.map(prof => ctx.run(prof).exp)
          .join('.')
  }
  
  jb.component('carmi.map', {
      type: 'carmi.chain-exp',
      params: [
          {id: 'pipe', type: 'carmi.chain-exp[]', ignore: true },
          {id: 'itemVar', as: 'string', defaultValue: 'val' },
      ],
      impl: (ctx, pipe, itemVar) => {
          const pipe_profiles = jb.toarray(ctx.profile.pipe);
          const input = ctx.data.output;
          const {output, controls} = runPipe(ctx, ctx.setVars(jb.obj(itemVar,input)), pipe_profiles, input);
          const controls = [
              ctx.run({$: 'label', title: `.map(${itemVar} => ${itemVar}.` }), 
              ...controls,
              ctx.run({$: 'label', title: `)` })
          ];
          const exp = `map(${itemVar} => ${itemVar}.${chainExp(ctx.setVars({itemVar}), pipe_profiles)})`;
          return {input, output, exp, ctrl: groupCtrl(controls)}
      },
  })
  
  jb.component('carmi.filter', {
      type: 'carmi.chain-exp,aggregator',
      params: [
          {id: 'condition', type: 'carmi.exp', dynamic: true, essential: true },
          {id: 'itemVar', as: 'string', defaultValue: 'val' },
      ],
      impl: (ctx, condition, itemVar) => {
          const input = ctx.data.output;
          let output = [];
          if (Array.isArray(input))
              output = input.filter(item => 
                  condition(ctx.setVars(jb.obj(itemVar,item)).setData(item)))
          else if (typeof input === 'object') {
              output = objFromEntries(jb.entries(input).filter(item => 
                  condition(ctx.setVars(jb.obj(itemVar,item[1])).setData(item[1]))))
          }
          const exp = `filter(${itemVar} => ${itemVar}.${condition.exp(ctx.setVars({itemVar}))})`;
          return {input, output, exp}
      },
  })
  
  
  jb.component('carmi.root', {
      type: 'carmi.exp',
      impl: ctx => ({
          output: ctx.vars.root,
          exp: 'root',
      })
  })
  
  jb.component('carmi.negate', {
      type: 'carmi.chain-exp',
      impl: (ctx) => {
          const input = ctx.data.output;
          const output = !input;
          return {
              input, output, exp: `not()`
          }
      }
  })
  
  jb.component('carmi.not', {
      type: 'carmi.exp',
      params: [
          { id: 'of', type: 'carmi.exp', essential: true },
      ],
      impl: (ctx, _of) => {
          const input = _of.output;
          const output = !input;
          return {
              input, output, exp: `not(${_of.exp})`
          }
      }
  })
  
  jb.component('carmi.equalsTo', {
      type: 'carmi.chain-exp',
      params: [
          { id: 'to', as: 'string', essential: true }
      ],
      impl: (ctx, to) => {
          const input = ctx.data.output;
          const output = input === to.output;
          return {
              input, output, exp: `equal(${to})`
          }
      }
  })
  
  jb.component('carmi.keys', {
      type: 'carmi.chain-exp,aggregator',
      impl: (ctx) => {
          const input = ctx.data.output;
          const output = Object.keys(input || {});
          return { input, output, exp: `keys()` }
      }
  })
  
  
  jb.component('carmi.get', {
      type: 'carmi.chain-exp',
      params: [
          {id: 'prop', as: 'string'}
      ],
      impl: (ctx, prop) => {
          const input = ctx.data.output;
          const output = input[prop];
          return { input, output, exp: `get('${prop}')` }
      }
  })
  
  jb.component('carmi.plus', {
      type: 'carmi.chain-exp',
      params: [
          {id: 'toAdd', as: 'string', essential: true}
      ],
      impl: (ctx, toAdd) => {
          const input = ctx.data && ctx.data.output;
          const _input = isNaN(Number(input)) ? input : Number(input)
          const _toAdd = isNaN(Number(toAdd)) ? toAdd : Number(toAdd)
          const output = _input + _toAdd;
          const exp = `plus(${typeof _toAdd === 'number' ? _toAdd : "'" + _toAdd + "'"})`
          const ctrl = primitiveCtrl(ctx, exp)
          return { input, output, exp, ctrl }
      }
  })
  
  jb.component('carmi.pipe', {
      type: 'carmi.exp',
      params: [
          { id: 'input', type: 'carmi.exp', defaultValue :{$: 'root'} },
          { id: 'pipe', type: 'carmi.chain-exp[]', dynamic: true },
          { id: 'itemVar', as: 'string', defaultValue: 'val' },
      ],
      impl: (ctx, input, pipe, itemVar) => {
          const pipe_profiles = jb.toarray(ctx.profile.pipe);
          const {output, controls} = runPipe(ctx, pipe_profiles, input)
          const exp = `${input.exp}.map(${itemVar} => ${itemVar}.${chainExp(ctx.setVars({itemVar}), pipe_profiles)})`
          const ctrl = [
              input.ctrl, 
              ctx.run({$: 'label', title: `.map(${itemVar} => ${itemVar}.` }), 
              ...controls,
              ctx.run({$: 'label', title: `)` })
          ];
      
          return {input: ctx.data, output, exp, ctrl: groupCtrl(controls) }
      }
  })
  
  jb.component('carmi.var', {
      type: 'carmi.var',
      params: [
          {id: 'id', type: 'string', essential: true },
          {id: 'exp', type: 'carmi.exp', essential: true },
      ],
      impl: (ctx, id, exp, carmi_exp) =>
          ({ id, exp: exp.exp })
  })
  
  jb.component('carmi.model', {
      type: 'carmi.model',
      params: [
          {id: 'id', type: 'string', essential: true },
          {id: 'vars', type: 'carmi.var[]', essential: true, defaultValue: [], dynamic: true },
          {id: 'setters', type: 'carmi.setter[]', defaultValue: [] },
          {id: 'schemaByExample' },
      ],
      impl: (ctx, id, varsF, setters, sample) => {
          let innerCtx = ctx.setData({}).setVars({ root: sample});
          const vars = varsF(innerCtx);
  
          // build carmi model
          const model = {
              set: setter(arg0)
          }
          vars.forEach(v => model[v.id] = eval(`(${v.exp})`));
          setters.forEach(v => model[v.id] = v.exp.ast);
  
          // const originalModel = { doubleNegated: root.keys(), set: setter(arg0) };
          // const negated = root.map(val => val.not());
          // const model2 = { doubleNegated: root.map(val => val.not()).map(val => val.not()), set: setter(arg0) };
          // const model3 = { doubleNegated: root.map(val => val.not()).map(val => val.not()), set: setter(arg0) };
  
          const compiler = 'naive';
          return carmi.compile(model, { compiler, debug: true }).then(sourceCode=> {
              const fixedCode = sourceCode.replace(/\$map_localhost:[0-9]*:[0-9]*:/g,'$map')
              const optCode = eval(fixedCode)
              const inst = optCode(sample, {});
              return {vars, model, inst};
          })
      }
  })
  