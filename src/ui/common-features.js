jb.component('defHandler', {
  type: 'feature',
  description: 'define custom event handler',
  params: [
    {id: 'id', as: 'string', mandatory: true, description: 'to be used in html, e.g. onclick=\"clicked\" '},
    {id: 'action', type: 'action[]', mandatory: true, dynamic: true}
  ],
  impl: (ctx,id) => ({defHandler: {id, ctx}})
})

jb.component('watchAndCalcModelProp', {
  type: 'feature',
  description: 'Use a model property in the rendering and watch its changes (refresh on change)',
  params: [
    {id: 'prop', as: 'string', mandatory: true},
    {id: 'transformValue', dynamic: true, defaultValue: '%%'},
    {id: 'allowSelfRefresh', as: 'boolean', description: 'allow refresh originated from the components or its children'},
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

jb.component('interactiveProp', {
  type: 'feature',
  description: 'define a variable for the interactive comp',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'value', mandatory: true, dynamic: true}
  ],
  impl: (ctx,id) => ({interactiveProp: {id: id.replace(/-/g,'_'), ctx }})
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
  params: [
    {id: 'action', type: 'action[]', mandatory: true, dynamic: true},
    {id: 'phase', as: 'number', defaultValue: 10, description: 'init funcs from different features can use each other, phase defines the calculation order'}
  ],
  impl: (ctx,action,phase) => ({ init: { action, phase }})
})

jb.component('feature.destroy', {
  type: 'feature',
  category: 'lifecycle',
  params: [
    {id: 'action', type: 'action[]', mandatory: true, dynamic: true},
  ],
  impl: ctx => ({ destroy: cmp => ctx.params.action(cmp.ctx) })
})

jb.component('feature.beforeInit', {
  type: 'feature',
  category: 'lifecycle',
  params: [
    {id: 'action', type: 'action[]', mandatory: true, dynamic: true}
  ],
  impl: feature.init('%$action%',5)
})

jb.component('feature.afterLoad', {
  type: 'feature',
  description: 'init, onload, defines the interactive part of the component',
  category: 'lifecycle',
  params: [
    {id: 'action', type: 'action[]', mandatory: true, dynamic: true}
  ],
  impl: ctx => ({ afterViewInit: cmp => ctx.params.action(cmp.ctx) })
})
jb.component('interactive', jb.comps['feature.afterLoad'])

jb.component('templateModifier', {
  type: 'feature',
  description: 'change the html template',
  params: [
    {id: 'value', mandatory: true, dynamic: true}
  ],
  impl: (ctx,value) => ({ templateModifier: (vdom,cmp) => value(ctx.setVars({cmp,vdom, ...cmp.renderProps})) })
})

jb.component('features', {
  type: 'feature',
  description: 'list of features, auto flattens',
  params: [
    {id: 'features', type: 'feature[]', as: 'array', composite: true}
  ],
  impl: (ctx,features) => features.flatMap(x=> Array.isArray(x) ? x: [x])
})

jb.component('watchRef', {
  type: 'feature',
  category: 'watch:100',
  description: 'subscribes to data changes to refresh component',
  params: [
    {id: 'ref', mandatory: true, as: 'ref', dynamic: true, description: 'reference to data'},
    {id: 'includeChildren', as: 'string', options: 'yes,no,structure', defaultValue: 'no', description: 'watch childern change as well'},
    {id: 'allowSelfRefresh', as: 'boolean', description: 'allow refresh originated from the components or its children'},
    {id: 'strongRefresh', as: 'boolean', description: 'rebuild the component and reinit wait for data'},
    {id: 'cssOnly', as: 'boolean', description: 'refresh only css features'},
    {id: 'phase', as: 'number', description: 'controls the order of updates on the same event. default is 0'}
  ],
  impl: ctx => ({ watchRef: {refF: ctx.params.ref, ...ctx.params}})
})

jb.component('watchObservable', {
  type: 'feature',
  category: 'watch',
  description: 'subscribes to a custom observable to refresh component',
  params: [
    {id: 'toWatch', mandatory: true},
    {id: 'debounceTime', as: 'number', description: 'in mSec'}
  ],
  impl: interactive(
    (ctx,{cmp},{toWatch, debounceTime}) => jb.callbag.pipe(toWatch,
      jb.callbag.takeUntil(cmp.destroyed),
      debounceTime && jb.callbag.debounceTime(debounceTime),
      jb.callbag.subscribe(()=>cmp.refresh(null, {srcCtx: ctx}))
    )
  )
})

jb.component('feature.onDataChange', {
  type: 'feature',
  category: 'watch',
  description: 'watch observable data reference, subscribe and run action',
  params: [
    {id: 'ref', mandatory: true, as: 'ref', dynamic: true, description: 'reference to data'},
    {id: 'includeChildren', as: 'string', options: 'yes,no,structure', defaultValue: 'no', description: 'watch childern change as well'},
    {id: 'action', type: 'action', dynamic: true, description: 'run on change'}
  ],
  impl: interactive((ctx,{cmp},{ref,includeChildren,action}) => 
      jb.subscribe(jb.ui.refObservable(ref(),cmp,{includeChildren, srcCtx: ctx}), () => action(ctx.setVar('cmp',cmp))))
})

jb.component('group.data', {
  type: 'feature',
  category: 'general:100,watch:80',
  params: [
    {id: 'data', mandatory: true, dynamic: true, as: 'ref'},
    {id: 'itemVariable', as: 'string', description: 'optional. define data as a local variable'},
    {id: 'watch', as: 'boolean', type: 'boolean'},
    {id: 'includeChildren', as: 'string', options: 'yes,no,structure', defaultValue: 'no', description: 'watch childern change as well'}
  ],
  impl: (ctx, refF, itemVariable,watch,includeChildren) => ({
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
  impl: (ctx,attribute,value) => ({
    templateModifier: (vdom,cmp) => {
        vdom.attributes = vdom.attributes || {};
        vdom.attributes[attribute] = value(cmp.ctx)
        return vdom;
      }
  })
})

jb.component('id', {
  type: 'feature',
  description: 'adds id to html element',
  params: [
    {id: 'id', mandatory: true, as: 'string', dynamic: true}
  ],
  impl: htmlAttribute(
    'id',
    (ctx,{},{id}) => id(ctx)
  )
})

jb.component('feature.hoverTitle', {
  type: 'feature',
  description: 'set element title, usually shown by browser on hover',
  params: [
    {id: 'title', as: 'string', mandatory: true}
  ],
  impl: htmlAttribute(
    'title',
    '%$title%'
  )
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
      const fullName = name + ':' + cmp.cmpId;
      cmp.ctx.run(writeValue(`%$${fullName}%`,null))
    },
    extendCtx: (ctx,cmp) => {
      if (!watchable)
        return ctx.setVar(name,jb.val(value(ctx)))

      const fullName = name + ':' + cmp.cmpId;
      if (fullName == 'items') debugger
      jb.log('var',['new-watchable',ctx,fullName])
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
  impl: (ctx, name, value, watchRefs) => ({
      destroy: cmp => {
        const fullName = name + ':' + cmp.cmpId;
        cmp.ctx.run(writeValue(`%$${fullName}%`,null))
      },
      extendCtx: (_ctx,cmp) => {
        const fullName = name + ':' + cmp.cmpId;
        jb.log('calculated var',['new-resource',ctx,fullName])
        jb.resource(fullName, jb.val(value(_ctx)));
        const ref = _ctx.exp(`%$${fullName}%`,'ref')
        return _ctx.setVar(name, ref);
      },
      afterViewInit: cmp => {
        const fullName = name + ':' + cmp.cmpId;
        const refToResource = cmp.ctx.exp(`%$${fullName}%`,'ref');
        (watchRefs(cmp.ctx)||[]).map(x=>jb.asRef(x)).filter(x=>x).forEach(ref=>
          jb.subscribe(jb.ui.refObservable(ref,cmp,{srcCtx: ctx}),
            e=> jb.writeValue(refToResource,value(cmp.ctx),ctx))
        )
      }
  })
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
      if (!jb.toboolean(showCondition(cmp.ctx)))
        jb.path(vdom,['attributes','style','display'],'none')
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

jb.component('feature.keyboardShortcut', {
  type: 'feature',
  category: 'events',
  description: 'listen to events at the document level even when the component is not active',
  params: [
    {id: 'key', as: 'string', description: 'e.g. Alt+C'},
    {id: 'action', type: 'action', dynamic: true}
  ],
  impl: (ctx,key,action) => ({
      afterViewInit: cmp => {
        jb.subscribe(jb.ui.fromEvent(cmp,'keydown',cmp.base.ownerDocument), event=>{
              const keyStr = key.split('+').slice(1).join('+');
              const keyCode = keyStr.charCodeAt(0);
              if (key == 'Delete') keyCode = 46;

              const helper = (key.match('([A-Za-z]*)+') || ['',''])[1];
              if (helper == 'Ctrl' && !event.ctrlKey) return
              if (helper == 'Alt' && !event.altKey) return
              if (event.keyCode == keyCode || (event.key && event.key == keyStr))
                action();
        })
    }})
})

jb.component('feature.onEvent', {
  type: 'feature',
  category: 'events',
  params: [
    {id: 'event', as: 'string', mandatory: true, options: 'load,blur,change,focus,keydown,keypress,keyup,click,dblclick,mousedown,mousemove,mouseup,mouseout,mouseover,scroll'},
    {id: 'action', type: 'action[]', mandatory: true, dynamic: true},
    {id: 'debounceTime', as: 'number', defaultValue: 0, description: 'used for mouse events such as mousemove'}
  ],
  impl: (ctx,event,action,debounceTime) => ({
      [`on${event}`]: true,
      afterViewInit: cmp => {
        if (event == 'load') {
          jb.delay(1).then(() => jb.ui.wrapWithLauchingElement(action, cmp.ctx, cmp.base)())
        } else {
          jb.subscribe(debounceTime ? cmp[`on${event}`].debounceTime(debounceTime) : cmp[`on${event}`],
            event=> jb.ui.wrapWithLauchingElement(action, cmp.ctx.setVars({event}), cmp.base)())
        }
      }
  })
})

jb.component('feature.onHover', {
  type: 'feature',
  description: 'on mouse enter',
  category: 'events',
  params: [
    {id: 'action', type: 'action[]', mandatory: true, dynamic: true},
    {id: 'onLeave', type: 'action[]', mandatory: true, dynamic: true},
    {id: 'debounceTime', as: 'number', defaultValue: 0}
  ],
  impl: (ctx,action,onLeave,_debounceTime) => ({
      onmouseenter: true, onmouseleave: true,
      afterViewInit: cmp => {
        const {pipe,debounceTime,subscribe} = jb.callbag

        pipe(cmp.onmouseenter, debounceTime(_debounceTime), subscribe(()=>
              jb.ui.wrapWithLauchingElement(action, cmp.ctx, cmp.base)()))
        pipe(cmp.onmouseleave,debounceTime(_debounceTime),subscribe(()=>
              jb.ui.wrapWithLauchingElement(onLeave, cmp.ctx, cmp.base)()))
      }
  })
})

jb.component('feature.classOnHover', {
  type: 'feature',
  description: 'set css class on mouse enter',
  category: 'events',
  params: [
    {id: 'class', type: 'string', defaultValue: 'item-hover', description: 'css class to add/remove on hover'}
  ],
  impl: (ctx,clz) => ({
    onmouseenter: true, onmouseleave: true,
    afterViewInit: cmp => {
      jb.subscribe(cmp.onmouseenter, ()=> jb.ui.addClass(cmp.base,clz))
      jb.subscribe(cmp.onmouseleave, ()=> jb.ui.removeClass(cmp.base,clz))
    }
  })
})

jb.ui.checkKey = function(e, key) {
	if (!key) return;
  const dict = { tab: 9, delete: 46, tab: 9, esc: 27, enter: 13, right: 39, left: 37, up: 38, down: 40}

  key = key.replace(/-/,'+');
  const keyWithoutPrefix = key.split('+').pop()
  let keyCode = dict[keyWithoutPrefix.toLowerCase()]
  if (+keyWithoutPrefix)
    keyCode = +keyWithoutPrefix
  if (keyWithoutPrefix.length == 1)
    keyCode = keyWithoutPrefix.charCodeAt(0);

	if (key.match(/^[Cc]trl/) && !e.ctrlKey) return;
	if (key.match(/^[Aa]lt/) && !e.altKey) return;
	return e.keyCode == keyCode
}

jb.component('feature.onKey', {
  type: 'feature',
  category: 'events',
  macroByValue: true,
  params: [
    {id: 'key', as: 'string', description: 'E.g., a,27,Enter,Esc,Ctrl+C or Alt+V'},
    {id: 'action', type: 'action', mandatory: true, dynamic: true},
    {id: 'doNotWrapWithLauchingElement', as: 'boolean', type: 'boolean'}
  ],
  impl: (ctx,key,action) => ({
      onkeydown: true,
      afterViewInit: cmp => jb.subscribe(cmp.onkeydown, e=> {
          if (!jb.ui.checkKey(e,key)) return
          ctx.params.doNotWrapWithLauchingElement ? action(cmp.ctx) :
            jb.ui.wrapWithLauchingElement(action, cmp.ctx, cmp.base)()
      })
  })
})

jb.component('feature.onEnter', {
  type: 'feature',
  category: 'events',
  params: [
    {id: 'action', type: 'action[]', mandatory: true, dynamic: true}
  ],
  impl: feature.onKey(
    'Enter',
    call('action')
  )
})

jb.component('feature.onEsc', {
  type: 'feature',
  category: 'events',
  params: [
    {id: 'action', type: 'action[]', mandatory: true, dynamic: true}
  ],
  impl: feature.onKey(
    'Esc',
    call('action')
  )
})

jb.component('refreshControlById', {
  type: 'action',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'strongRefresh', as: 'boolean', description: 'rebuild the component and reinit wait for data'},
    {id: 'cssOnly', as: 'boolean', description: 'refresh only css features'},
  ],
  impl: (ctx,id) => {
    const elem = jb.ui.document(ctx).querySelector('#'+id)
    if (!elem)
      return jb.logError('refreshControlById can not find elem for #'+id, ctx)
    return jb.ui.refreshElem(elem,null,{srcCtx: ctx, ...ctx.params})
  }
})

jb.component('group.autoFocusOnFirstInput', {
  type: 'feature',
  impl: ctx => ({
      afterViewInit: cmp => {
          const elem = Array.from(cmp.base.querySelectorAll('input,textarea,select'))
            .filter(e => e.getAttribute('type') != 'checkbox')[0];
          elem && jb.ui.focus(elem,'group.auto-focus-on-first-input',ctx);
        }
  })
})

jb.component('focusOnFirstElement', {
  type: 'action',
  params: [
    {id: 'selector', as: 'string', defaultValue: 'input'}
  ],
  impl: (ctx, selector) =>
      jb.delay(50).then(() => {
        const elem = document.querySelector(selector)
        elem && jb.ui.focus(elem,'focus-on-first-element',ctx)
    })
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
