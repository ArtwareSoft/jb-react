jb.ns('followUp,backEnd')

jb.component('method', {
  type: 'feature',
  description: 'define backend event handler',
  params: [
    {id: 'id', as: 'string', mandatory: true, description: 'to be used in html, e.g. onclick=\"myMethod\" '},
    {id: 'action', type: 'action[]', mandatory: true, dynamic: true}
  ],
  impl: (ctx,id) => ({method: {id, ctx}})
})

jb.component('feature.onEvent', {
  type: 'feature',
  category: 'events',
  params: [
    {id: 'event', as: 'string', mandatory: true, options: 'load,blur,change,focus,keydown,keypress,keyup,click,dblclick,mousedown,mousemove,mouseup,mouseout,mouseover,scroll'},
    {id: 'action', type: 'action[]', mandatory: true, dynamic: true}
  ],
  impl: (ctx,event) => ({eventHandler: {event, ctx}})
})

jb.component('watchAndCalcModelProp', {
  type: 'feature',
  description: 'Use a model property in the rendering and watch its changes (refresh on change)',
  params: [
    {id: 'prop', as: 'string', mandatory: true},
    {id: 'transformValue', dynamic: true, defaultValue: '%%'},
    {id: 'allowSelfRefresh', as: 'boolean', description: 'allow refresh originated from the components or its children', type: 'boolean'}
  ],
  impl: ctx => ({watchAndCalcModelProp: ctx.params})
})

jb.component('calcProp', {
  type: 'feature',
  description: 'define a variable to be used in the rendering calculation process',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'value', mandatory: true, dynamic: true, description: 'when empty value is taken from model'},
    {id: 'priority', as: 'number', defaultValue: 1, description: 'if same prop was defined elsewhere decides who will override. range 1-1000'},
    {id: 'phase', as: 'number', defaultValue: 10, description: 'props from different features can use each other, phase defines the calculation order'}
  ],
  impl: ctx => ({calcProp: {... ctx.params, index: jb.ui.propCounter++}})
})

jb.component('userStateProp', {
  type: 'feature',
  description: 'define a user state (e.g., selection) that is passed to the FE and back to the BE via refresh calls. The first calculation is done at the BE and then the FE can change it',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'value', mandatory: true, dynamic: true, description: 'when empty value is taken from model'},
    {id: 'priority', as: 'number', defaultValue: 1, description: 'if same prop was defined elsewhere decides who will override. range 1-1000'},
    {id: 'phase', as: 'number', defaultValue: 10, description: 'props from different features can use each other, phase defines the calculation order'}
  ],
  impl: ctx => ({calcProp: {... ctx.params, userStateProp: true, index: jb.ui.propCounter++}})
})

jb.component('calcProps', {
  type: 'feature',
  description: 'define variables to be used in the rendering calculation process',
  params: [
    {id: 'props', as: 'object', mandatory: true, description: 'props as object', dynamic: true},
    {id: 'phase', as: 'number', defaultValue: 10, description: 'props from different features can use each other, phase defines the calculation order'}
  ],
  impl: (ctx,propsF,phase) => ({
      calcProp: {id: '$props', value: ctx => propsF(ctx), phase, index: jb.ui.propCounter++ }
    })
})

jb.component('feature.init', {
  type: 'feature',
  category: 'lifecycle',
  description: 'activated before calc properties',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true},
    {id: 'phase', as: 'number', defaultValue: 10, description: 'init funcs from different features can use each other, phase defines the calculation order'}
  ],
  impl: (ctx,action,phase) => ({ init: { action, phase }})
})

jb.component('onDestroy', {
  type: 'feature',
  category: 'lifecycle',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: method('destroy', '%$action()%')
})

jb.component('templateModifier', {
  type: 'feature',
  description: 'change the html template',
  params: [
    {id: 'value', mandatory: true, dynamic: true}
  ],
  impl: (ctx,value) => ({ templateModifier: (vdom,cmp) => value(cmp.calcCtx.setVars({vdom, ...cmp.renderProps })) })
})

jb.component('frontEnd.var', {
  type: 'feature',
  description: 'calculate in the BE and pass to frontEnd',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'value', mandatory: true, dynamic: true}
  ],
  impl: ctx => ({ frontEndVar: ctx.params })
})

jb.component('features', {
  type: 'feature',
  description: 'list of features, auto flattens',
  params: [
    {id: 'features', type: 'feature[]', as: 'array', composite: true}
  ],
  impl: (ctx,features) => features.flatMap(x=> Array.isArray(x) ? x: [x])
})

jb.component('followUp.action', {
  type: 'feature',
  description: 'runs at the backend a tick after the vdom was returned',
  category: 'lifecycle',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: ctx => ({ followUp: { action: ctx2 => ctx.params.action(ctx2), srcCtx: ctx } })
})

jb.component('followUp.flow', {
  type: 'feature',
  description: 'rx flow at the backend after the vdom was sent',
  params: [
    {id: 'elems', type: 'rx[]', as: 'array', mandatory: true, dynamic: true, templateValue: []}
  ],
  impl: followUp.action(
    runActions(
      Var('followUpCmp', '%$cmp%'),
      Var('pipeToRun', rx.pipe('%$elems()%')),
      (ctx,{cmp,pipeToRun}) => {
        cmp.followUpStatus = cmp.followUpStatus || {}
        cmp.followUpStatus[ctx.cmpCtx.path] = pipeToRun
      },
      rx.pipe(
        source.callbag(() => jb.ui.BECmpsDestroyNotification),
        rx.filter(
          ({data},{followUpCmp}) => data.cmps.find(_cmp => _cmp.cmpId == followUpCmp.cmpId && _cmp.ver == followUpCmp.ver)
        ),
        rx.take(1),
        sink.action(({},{pipeToRun}) => pipeToRun.dispose())
      )
    )
  )
})

jb.component('watchRef', {
  type: 'feature',
  category: 'watch:100',
  description: 'subscribes to data changes to refresh component',
  params: [
    {id: 'ref', mandatory: true, as: 'ref', dynamic: true, description: 'reference to data'},
    {id: 'includeChildren', as: 'string', options: 'yes,no,structure', defaultValue: 'no', description: 'watch childern change as well'},
    {id: 'allowSelfRefresh', as: 'boolean', description: 'allow refresh originated from the components or its children', type: 'boolean'},
    {id: 'strongRefresh', as: 'boolean', description: 'rebuild the component and reinit wait for data', type: 'boolean'},
    {id: 'cssOnly', as: 'boolean', description: 'refresh only css features', type: 'boolean'},
    {id: 'phase', as: 'number', description: 'controls the order of updates on the same event. default is 0'}
  ],
  impl: ctx => ({ watchRef: {refF: ctx.params.ref, ...ctx.params}})
})

jb.component('followUp.watchObservable', {
  type: 'feature',
  category: 'watch',
  description: 'subscribes to a custom observable to refresh component',
  params: [
    {id: 'toWatch', mandatory: true, dynamic: true},
    {id: 'debounceTime', as: 'number', description: 'in mSec'}
  ],
  impl: followUp.flow(
    source.data(0),
    rx.var('cmp', '%$cmp%'),
    rx.flatMap('%$toWatch()%'),
    rx.debounceTime('%$debounceTime%'),
    sink.refreshCmp()
  )
})

jb.component('followUp.onDataChange', {
  type: 'feature',
  category: 'watch',
  description: 'watch observable data reference, subscribe and run action',
  params: [
    {id: 'ref', mandatory: true, as: 'ref', dynamic: true, description: 'reference to data'},
    {id: 'includeChildren', as: 'string', options: 'yes,no,structure', defaultValue: 'no', description: 'watch childern change as well'},
    {id: 'action', type: 'action', dynamic: true, description: 'run on change'}
  ],
  impl: followUp.flow(source.watchableData('%$ref()%', '%$includeChildren%'), sink.action(call('action')))
})

// jb.component('followUp.takeUntilCmpDestroyed', {
//     type: 'rx',
//     category: 'operator',
//     params: [
//       {id: 'cmp' }
//     ],
//     impl: rx.takeUntil(rx.pipe(
//           source.callbag(() => jb.ui.BECmpsDestroyNotification),
//           rx.filter( ({data},{},{cmp}) => data.cmps.find(_cmp => _cmp.cmpId == cmp.cmpId && _cmp.ver == cmp.ver)),
//           rx.take(1),
//           rx.log('uiComp backend takeUntil destroy', obj(prop('cmp','%$cmp%'))),
//     ))
// })

jb.component('group.data', {
  type: 'feature',
  category: 'general:100,watch:80',
  params: [
    {id: 'data', mandatory: true, dynamic: true, as: 'ref'},
    {id: 'itemVariable', as: 'string', description: 'optional. define data as a local variable'},
    {id: 'watch', as: 'boolean', type: 'boolean'},
    {id: 'includeChildren', as: 'string', options: 'yes,no,structure', defaultValue: 'no', description: 'watch childern change as well'}
  ],
  impl: ({}, refF, itemVariable,watch,includeChildren) => ({
      ...(watch ? {watchRef: { refF, includeChildren }} : {}),
      extendCtx: ctx => {
          const ref = refF()
          return ctx.setData(ref).setVar(itemVariable,ref)
      },
  })
})

jb.component('htmlAttribute', {
  type: 'feature',
  description: 'set attribute to html element and give it value',
  params: [
    {id: 'attribute', mandatory: true, as: 'string'},
    {id: 'value', mandatory: true, as: 'string', dynamic: true}
  ],
  impl: (ctx,id,value) => ({
    templateModifier: (vdom,cmp) => vdom.setAttribute(id.match(/^on[^-]/) ? `${id.slice(0,2)}-${id.slice(2)}` : id, value(cmp.ctx))
  })
})

jb.component('id', {
  type: 'feature',
  description: 'adds id to html element',
  params: [
    {id: 'id', mandatory: true, as: 'string', dynamic: true}
  ],
  impl: htmlAttribute('id', '%$id()%')
})

jb.component('feature.hoverTitle', {
  type: 'feature',
  description: 'set element title, usually shown by browser on hover',
  params: [
    {id: 'title', as: 'string', mandatory: true}
  ],
  impl: htmlAttribute('title', '%$title%')
})

jb.component('variable', {
  type: 'feature',
  category: 'general:90',
  description: 'define a variable. watchable or passive, local or global',
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'value', dynamic: true, defaultValue: '', mandatory: true},
    {id: 'watchable', as: 'boolean', type: 'boolean', description: 'E.g., selected item variable'}
  ],
  impl: ({}, name, value, watchable) => ({
    destroy: cmp => {
      if (!watchable) return
      const fullName = name + ':' + cmp.ctx.id;
      cmp.ctx.run(writeValue(`%$${fullName}%`,null))
    },
    extendCtx: (ctx,cmp) => {
      if (!watchable)
        return ctx.setVar(name,jb.val(value(ctx)))

      const fullName = name + ':' + cmp.ctx.id;
      if (fullName == 'items') debugger
      jb.log('create watchable var',{cmp,ctx,fullName})
      const refToResource = jb.mainWatchableHandler.refOfPath([fullName]);
      jb.writeValue(refToResource,value(ctx),ctx)
      return ctx.setVar(name, refToResource);
    }
  })
})

jb.component('calculatedVar', {
  type: 'feature',
  category: 'general:60',
  description: 'defines a local variable that watches other variables with auto recalc',
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'value', dynamic: true, defaultValue: '', mandatory: true},
    {id: 'watchRefs', as: 'array', dynamic: true, mandatory: true, defaultValue: [], description: 'variable to watch. needs to be in array'}
  ],
  impl: features(
    onDestroy(writeValue('%${%$name%}:{%$cmp/cmpId%}%', null)),
    followUp.flow(
      rx.merge((ctx,{},{watchRefs}) => watchRefs(ctx).map(ref=>ctx.setData(ref).run(source.watchableData('%%')) )),
      rx.log('check calculatedVar'),
      rx.map('%$value()%'),
      sink.data('%${%$name%}:{%$cmp/cmpId%}%')
    ),
    ctx => ({
      extendCtx: (_ctx,cmp) => {
        const {name,value} = ctx.cmpCtx.params
        const fullName = name + ':' + cmp.cmpId;
        jb.log('create watchable calculatedVar',{ctx,cmp,fullName})
        jb.resource(fullName, jb.val(value(_ctx)));
        const ref = _ctx.exp(`%$${fullName}%`,'ref')
        return _ctx.setVar(name, ref);
      }
    })
  )
})

jb.component('feature.if', {
  type: 'feature',
  category: 'feature:85',
  description: 'adds/remove element to dom by condition. keywords: hidden/show',
  params: [
    {id: 'showCondition', as: 'boolean', mandatory: true, dynamic: true, type: 'boolean'}
  ],
  impl: (ctx, condition) => ({
    templateModifier: (vdom,cmp) =>
      jb.toboolean(condition(cmp.ctx)) ? vdom : jb.ui.h('span',{style: {display: 'none'}})
  })
})

jb.component('hidden', {
  type: 'feature',
  category: 'feature:85',
  description: 'display:none on element. keywords: show',
  params: [
    {id: 'showCondition', type: 'boolean', mandatory: true, dynamic: true}
  ],
  impl: (ctx,showCondition) => ({
    templateModifier: (vdom,cmp) => {
      jb.path(vdom,['attributes','style','display'],jb.toboolean(showCondition(cmp.ctx)) ? 'inherit' : 'none')
      return vdom
    }
  })
})

jb.component('conditionalClass', {
  type: 'feature',
  description: 'toggle class by condition',
  params: [
    {id: 'cssClass', as: 'string', mandatory: true, dynamic: true},
    {id: 'condition', type: 'boolean', mandatory: true, dynamic: true}
  ],
  impl: (ctx,cssClass,cond) => ({
    templateModifier: (vdom,cmp) => {
      if (jb.toboolean(cond(cmp.ctx)))
        vdom.addClass(cssClass())
      return vdom
    }
  })
})

jb.component('refreshControlById', {
  type: 'action',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'strongRefresh', as: 'boolean', description: 'rebuild the component and reinit wait for data', type: 'boolean'},
    {id: 'cssOnly', as: 'boolean', description: 'refresh only css features', type: 'boolean'}
  ],
  impl: (ctx,id) => {
    const elem = jb.ui.widgetBody(ctx).querySelector('#'+id)
    if (!elem)
      return jb.logError('refreshControlById can not find elem for #'+id, {ctx})
    return jb.ui.refreshElem(elem,null,{srcCtx: ctx, ...ctx.params})
  }
})

jb.component('group.autoFocusOnFirstInput', {
  type: 'feature',
  impl: templateModifier(({},{vdom}) => {
    const elem = vdom.querySelectorAll('input,textarea,select').filter(e => e.getAttribute('type') != 'checkbox')[0]
    if (elem)
      elem.setAttribute('$focus','autoFocusOnFirstInput')
    return vdom
  })
})

jb.component('refreshIfNotWatchable', {
  type: 'action',
  params: [
    {id: 'data'}
  ],
  impl: (ctx, data) => !jb.isWatchable(data) && ctx.vars.cmp.refresh()
})

jb.component('feature.byCondition', {
  type: 'feature',
  description: 'conditional feature, define feature if then else condition',
  macroByValue: true,
  params: [
    {id: 'condition', type: 'boolean', as: 'boolean', mandatory: true},
    {id: 'then', type: 'feature', mandatory: true, dynamic: true, composite: true},
    {id: 'else', type: 'feature', dynamic: true}
  ],
  impl: (ctx,cond,_then,_else) =>	cond ? _then() : _else()
})

jb.component('feature.userEventProps', {
  type: 'feature',
  description: 'add data to the event sent from the front end',
  params: [
    {id: 'props', as: 'string', description: 'comma separated props to take from the original event e.g., altKey,ctrlKey'}
  ],
  impl: (ctx, prop) => ({userEventProps: prop })
})
