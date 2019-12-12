jb.component('feature.light', {
  type: 'feature',
  description: 'creates vdom with no comp and no lifecycle',
  impl: () => ({ light: true })
})

jb.component('group.wait', { /* group.wait */
  type: 'feature',
  category: 'group:70',
  description: 'wait for asynch data before showing the control',
  params: [
    {id: 'for', mandatory: true, dynamic: true},
    {
      id: 'loadingControl',
      type: 'control',
      defaultValue: label('loading ...'),
      dynamic: true
    },
    {
      id: 'error',
      type: 'control',
      defaultValue: label('error: %$error%'),
      dynamic: true
    },
    {id: 'varName', as: 'string'}
  ],
  impl: (ctx,waitFor,loading,error,varName) => ({
      beforeInit : cmp => cmp.state.ctrls = [loading(ctx)],

      afterViewInit: cmp => {
        Promise.resolve(waitFor())
          .then(data => {
              cmp.ctx = varName ? cmp.ctx.setData(data).setVars(jb.obj(varName,data)) : cmp.ctx.setData(data);
              cmp.refresh()
          })
          .catch(e=> {
            cmp.setState( { ctrls: [error(ctx.setVars({error:e}))] })
        })
    },
  })
})

jb.component('watch-ref', { /* watchRef */
  type: 'feature',
  category: 'watch:100',
  description: 'subscribes to data changes to refresh component',
  params: [
    {
      id: 'ref',
      mandatory: true,
      as: 'ref',
      dynamic: true,
      description: 'reference to data'
    },
    {
      id: 'includeChildren',
      as: 'string',
      options: 'yes,no,structure',
      defaultValue: 'no',
      description: 'watch childern change as well'
    },
   {
      id: 'allowSelfRefresh',
      as: 'boolean',
      description: 'allow refresh originated from the components or its children',
      type: 'boolean'
    },
    {
      id: 'strongRefresh',
      as: 'boolean',
      description: 'rebuild the component, including all features and variables',
      type: 'boolean'
    },
    {
      id: 'delay',
      as: 'number',
      description: 'delay in activation, can be used to set priority'
    },
   ],
  impl: (ctx,ref) => ({
      beforeInit: cmp =>
        cmp.watchRefOn = true,
      init: cmp =>
        jb.ui.watchRef(cmp.ctx,cmp,ref(cmp.ctx),ctx.params)
  })
})

jb.component('watch-observable', { /* watchObservable */
  type: 'feature',
  category: 'watch',
  description: 'subscribes to a custom rx.observable to refresh component',
  params: [
    {id: 'toWatch', mandatory: true}
  ],
  impl: (ctx,toWatch) => ({
      init: cmp => {
        if (!toWatch.subscribe)
          return jb.logError('watch-observable: non obsevable parameter', ctx);
        var virtualRef = { $jb_observable: cmp =>
          toWatch
        };
        jb.ui.watchRef(ctx,cmp,virtualRef)
      }
  })
})

jb.component('group.data', { /* group.data */
  type: 'feature',
  category: 'general:100,watch:80',
  params: [
    {id: 'data', mandatory: true, dynamic: true, as: 'ref'},
    {
      id: 'itemVariable',
      as: 'string',
      description: 'optional. define data as a local variable'
    },
    {id: 'watch', as: 'boolean', type: 'boolean'},
    {
      id: 'includeChildren',
      as: 'string',
      options: 'yes,no,structure',
      defaultValue: 'no',
      description: 'watch childern change as well'
    }
  ],
  impl: (ctx, data_ref, itemVariable,watch,includeChildren) => ({
      init: cmp => {
        if (watch)
          jb.ui.watchRef(ctx,cmp,data_ref(),{includeChildren})
      },
      extendCtxOnce: ctx => {
          var val = data_ref();
          var res = ctx.setData(val);
          if (itemVariable)
            res = res.setVars(jb.obj(itemVariable,val));
          return res;
      },
  })
})

jb.component('html-attribute', { /* htmlAttribute */
  type: 'feature',
  description: 'set attribute to html element and give it value',
  params: [
    {id: 'attribute', mandatory: true, as: 'string'},
    {id: 'value', mandatory: true, as: 'string'}
  ],
  impl: (ctx,attribute,value) => ({
    templateModifier: vdom => {
        vdom.attributes = vdom.attributes || {};
        vdom.attributes[attribute] = value
        return vdom;
      }
  })
})

jb.component('id', { /* id */
  type: 'feature',
  description: 'adds id to html element',
  params: [
    {id: 'id', mandatory: true, as: 'string'}
  ],
  impl: htmlAttribute('id','%$id%')
})

jb.component('feature.hover-title', { /* feature.hoverTitle */
  type: 'feature',
  description: 'set element title, usually shown by browser on hover',
  params: [
    {id: 'title', as: 'string', dynamic: true}
  ],
  impl: (ctx, title) => ({
    templateModifier: (vdom,cmp,state) => {
      vdom.attributes = vdom.attributes || {};
      vdom.attributes.title = title(cmp.ctx.setData(state.title))
      return vdom;
    }
  })
})

jb.component('variable', { /* variable */
  type: 'feature',
  category: 'general:90',
  description: 'define a variable. watchable or passive, local or global',
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'value', dynamic: true, defaultValue: '', mandatory: true},
    {
      id: 'watchable',
      as: 'boolean',
      type: 'boolean',
      description: 'E.g., selected item variable'
    },
    {
      id: 'globalId',
      as: 'string',
      description: 'If specified, the var will be defined as global with this id'
    }
  ],
  impl: (context, name, value, watchable, globalId,type) => ({
      extendCtxOnce: (ctx,cmp) => {
        if (!watchable)
          return ctx.setVars({[name]: jb.val(value(ctx)) })

        cmp.resourceId = cmp.resourceId || cmp.ctx.id; // use the first ctx id
        const fullName = globalId || (name + ':' + cmp.resourceId);
        jb.log('var',['new-watchable',ctx,fullName])
        jb.resource(fullName, value(ctx));
        const refToResource = jb.mainWatchableHandler.refOfPath([fullName]);
        return ctx.setVars(jb.obj(name, refToResource));
      }
  })
})

jb.component('calculated-var', { /* calculatedVar */
  type: 'feature',
  category: 'general:60',
  description: 'defines a local variable that watches other variables with auto recalc',
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'value', dynamic: true, defaultValue: '', mandatory: true},
    {
      id: 'globalId',
      as: 'string',
      description: 'If specified, the var will be defined as global with this id'
    },
    {
      id: 'watchRefs',
      as: 'array',
      dynamic: true,
      mandatory: true,
      defaultValue: [],
      description: 'variable to watch. needs to be in array'
    }
  ],
  impl: (context, name, value,globalId, watchRefs) => ({
      destroy: cmp => {
        jb.writeValue(jb.mainWatchableHandler.refOfPath([name + ':' + cmp.resourceId]),null,context)
      },
      extendCtxOnce: (ctx,cmp) => {
        cmp.resourceId = cmp.resourceId || cmp.ctx.id; // use the first ctx id
        const fullName = globalId || (name + ':' + cmp.resourceId);
        jb.log('calculated var',['new-resource',ctx,fullName])
        jb.resource(fullName, jb.val(value(ctx)));
        const refToResource = jb.mainWatchableHandler.refOfPath([fullName]);
        (watchRefs(cmp.ctx)||[]).map(x=>jb.asRef(x)).filter(x=>x).forEach(ref=>
            jb.ui.refObservable(ref,cmp,{includeChildren: 'yes', srcCtx: context}).subscribe(e=>
              jb.writeValue(refToResource,value(cmp.ctx),context))
          )
        return ctx.setVars(jb.obj(name, refToResource));
      }
  })
})

jb.component('feature.init', { /* feature.init */
  type: 'feature',
  category: 'lifecycle',
  params: [
    {id: 'action', type: 'action[]', mandatory: true, dynamic: true}
  ],
  impl: (ctx,action) => ({ init: cmp => action(cmp.ctx) })
})

jb.component('feature.after-load', { /* feature.afterLoad */
  type: 'feature',
  description: 'init, onload',
  category: 'lifecycle',
  params: [
    {id: 'action', type: 'action[]', mandatory: true, dynamic: true}
  ],
  impl: ctx => ({ afterViewInit: cmp => jb.delay(1).then(_ => ctx.params.action(cmp.ctx)) })
})

jb.component('feature.if', { /* feature.if */
  type: 'feature',
  category: 'feature:85',
  description: 'adds/remove element to dom by condition. keywords: hidden/show',
  params: [
    {id: 'showCondition', mandatory: true, dynamic: true}
  ],
  impl: (ctx, condition,watch) => ({
    templateModifier: (vdom,cmp,state) =>
        jb.toboolean(condition(cmp.ctx)) ? vdom : jb.ui.h('span',{style: {display: 'none'}})
  })
})

jb.component('hidden', { /* hidden */
  type: 'feature',
  category: 'feature:85',
  description: 'display:none on element. keywords: show',
  params: [
    {id: 'showCondition', type: 'boolean', mandatory: true, dynamic: true}
  ],
  impl: (ctx,showCondition) => ({
    templateModifier: (vdom,cmp,state) => {
      if (!jb.toboolean(showCondition(cmp.ctx)))
        jb.path(vdom,['attributes','style','display'],'none')
      return vdom;
    }
  })
})

jb.component('conditional-class', { /* conditionalClass */
  type: 'feature',
  description: 'toggle class by condition',
  params: [
    {id: 'cssClass', as: 'string', mandatory: true, dynamic: true},
    {id: 'condition', type: 'boolean', mandatory: true, dynamic: true}
  ],
  impl: (ctx,cssClass,cond) => ({
    templateModifier: (vdom,cmp,state) => {
      if (cond())
        jb.ui.addClassToVdom(vdom,cssClass())
    }
  })
})

jb.component('feature.keyboard-shortcut', { /* feature.keyboardShortcut */
  type: 'feature',
  category: 'events',
  description: 'listen to events at the document level even when the component is not active',
  params: [
    {id: 'key', as: 'string', description: 'e.g. Alt+C'},
    {id: 'action', type: 'action', dynamic: true}
  ],
  impl: (ctx,key,action) => ({
      afterViewInit: cmp =>
        jb.rx.Observable.fromEvent(cmp.base.ownerDocument, 'keydown')
            .takeUntil( cmp.destroyed )
            .subscribe(event=>{
              var keyStr = key.split('+').slice(1).join('+');
              var keyCode = keyStr.charCodeAt(0);
              if (key == 'Delete') keyCode = 46;

              var helper = (key.match('([A-Za-z]*)+') || ['',''])[1];
              if (helper == 'Ctrl' && !event.ctrlKey) return
              if (helper == 'Alt' && !event.altKey) return
              if (event.keyCode == keyCode || (event.key && event.key == keyStr))
                action();
            })
      })
})

jb.component('feature.onEvent', { /* feature.onEvent */
  type: 'feature',
  category: 'events',
  params: [
    {
      id: 'event',
      as: 'string',
      mandatory: true,
      options: 'load,blur,change,focus,keydown,keypress,keyup,click,dblclick,mousedown,mousemove,mouseup,mouseout,mouseover'
    },
    {id: 'action', type: 'action[]', mandatory: true, dynamic: true},
    {
      id: 'debounceTime',
      as: 'number',
      defaultValue: 0,
      description: 'used for mouse events such as mousemove'
    }
  ],
  impl: (ctx,event,action,debounceTime) => ({
      [`on${event}`]: true,
      afterViewInit: cmp => {
        if (event == 'load') {
          jb.delay(1).then(() => jb.ui.wrapWithLauchingElement(action, cmp.ctx, cmp.base)())
        } else {
          (debounceTime ? cmp[`on${event}`].debounceTime(debounceTime) : cmp[`on${event}`])
            .subscribe(event=>
                  jb.ui.wrapWithLauchingElement(action, cmp.ctx.setVars({event}), cmp.base)())
        }
      }
  })
})

jb.component('feature.onHover', { /* feature.onHover */
  type: 'feature',
  category: 'events',
  params: [
    {id: 'action', type: 'action[]', mandatory: true, dynamic: true}
  ],
  impl: (ctx,action) => ({
      onmouseenter: true,
      afterViewInit: cmp=>
        cmp.onmouseenter.debounceTime(500).subscribe(()=>
              jb.ui.wrapWithLauchingElement(action, cmp.ctx, cmp.base)())
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

jb.component('feature.onKey', { /* feature.onKey */
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
      afterViewInit: cmp =>
        cmp.onkeydown.subscribe(e=> {
          if (!jb.ui.checkKey(e,key)) return
          ctx.params.doNotWrapWithLauchingElement ? action(cmp.ctx) :
            jb.ui.wrapWithLauchingElement(action, cmp.ctx, cmp.base)()
        })
  })
})

jb.component('feature.onEnter', { /* feature.onEnter */
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

jb.component('feature.onEsc', { /* feature.onEsc */
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

jb.component('refresh-control-by-id', { /* refreshControlById */
  type: 'action',
  params: [
    {id: 'id', as: 'string', mandatory: true}
  ],
  impl: (ctx,id) => {
    const base = ctx.vars.elemToTest || typeof document !== 'undefined' && document
    const elem = base && base.querySelector('#'+id)
    if (!elem)
      jb.logError('refresh-control-by-id can not find elem for #'+id, ctx)
    const comp = elem && elem._component
    if (!comp)
      jb.logError('refresh-control-by-id can not get comp for elem', ctx)
    if (comp && comp.refresh)
      comp.refresh(ctx)
  }
})


jb.component('group.auto-focus-on-first-input', { /* group.autoFocusOnFirstInput */
  type: 'feature',
  impl: ctx => ({
      afterViewInit: cmp => {
          var elem = Array.from(cmp.base.querySelectorAll('input,textarea,select'))
            .filter(e => e.getAttribute('type') != 'checkbox')[0];
          elem && jb.ui.focus(elem,'group.auto-focus-on-first-input',ctx);
        }
  })
})

jb.component('focus-on-first-element', { /* focusOnFirstElement */
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

