jb.component('def-handler', { 
  type: 'feature',
  description: 'define custom event handler',
  params: [
    {id: 'id', as: 'string', mandatory: true, description: 'to be used in html, e.g. onclick="clicked" '},
    {id: 'action', type: 'action[]', mandatory: true, dynamic: true}
  ],
  impl: (ctx,id) => ({defHandler: {id, ctx}})
})

jb.component('calc-prop', { 
  type: 'feature',
  description: 'define a variable to be used in the rendering calculation process',
  params: [
    {id: 'id', as: 'string', mandatory: true },
    {id: 'value', mandatory: true, dynamic: true},
    {id: 'priority', as: 'number', defaultValue: 1, description: 'if same prop was defined elsewhere who will win. range 1-1000'},
    {id: 'phase', as: 'number', defaultValue: 10, description: 'props from different features can use each other, phase defines the calculation order'},
  ],
  impl: ctx => ({calcProp: {... ctx.params, index: jb.ui.propCounter++}})
})

jb.component('interactive-prop', { 
  type: 'feature',
  description: 'define a variable for the interactive comp',
  params: [
    {id: 'id', as: 'string', mandatory: true },
    {id: 'value', mandatory: true, dynamic: true},
  ],
  impl: (ctx,id) => ({interactiveProp: {id, ctx }})
})

jb.component('set-props', {
  type: 'feature',
  description: 'define variables to be used in the rendering calculation process',
  params: [
    {id: 'props', as: 'object', mandatory: true, description: 'props as object' },
    {id: 'phase', as: 'number', defaultValue: 10, description: 'props from different features can use each other, phase defines the calculation order'},
  ],
  impl: (ctx,props,phase) => Object.keys(props).map(id =>
    ({calcProp: {id, value: () => props[id], phase, index: jb.ui.propCounter++}}))
})

jb.component('feature.init', { /* feature.init */
  type: 'feature',
  category: 'lifecycle',
  params: [
    {id: 'action', type: 'action[]', mandatory: true, dynamic: true},
    {id: 'phase', as: 'number', defaultValue: 10, description: 'init funcs from different features can use each other, phase defines the calculation order'},
  ],
  impl: (ctx,action,phase) => ({ init: { action, phase }})
})

jb.component('feature.after-load', { /* feature.afterLoad */
  type: 'feature',
  description: 'init, onload, defines the interactive part of the component',
  category: 'lifecycle',
  params: [
    {id: 'action', type: 'action[]', mandatory: true, dynamic: true}
  ],
  impl: ctx => ({ afterViewInit: cmp => ctx.params.action(cmp.ctx) })
})
jb.component('interactive', jb.comps['feature.after-load'])

jb.component('features', {
  type: 'feature',
  description: 'list of features, auto flattens',
  params: [
    {id: 'features', type: 'feature[]', as: 'array', composite: true}
  ],
  impl: (ctx,features) => features.flatMap(x=>Array.isArray(x) ? x: [x])
})

jb.component('group.wait', { /* group.wait */
  type: 'feature',
  category: 'group:70',
  description: 'wait for asynch data before showing the control',
  params: [
    {id: 'for', mandatory: true, dynamic: true},
    {id: 'loadingControl', type: 'control', defaultValue: {$: 'text', text:'loading ...'}, dynamic: true},
    {id: 'error', type: 'control', defaultValue: {$: 'text', text:'error: %$error%' }, dynamic: true },
    {id: 'varName', as: 'string'}
  ],
  impl: features(
    calcProp({id: 'ctrls', 
      priority: ctx => jb.path(ctx.vars.$state,'dataArrived') ? 0: 10, // hijack the ctrls calculation
      value: (ctx,{cmp},{loadingControl,error}) => {
        const ctrl = cmp.state.error ? error() : loadingControl(ctx)
        return cmp.ctx.profile.$ == 'itemlist' ? [[ctrl]] : [ctrl]
      }
    }),
    interactive( (ctx,{cmp},{varName}) => !cmp.state.dataArrived && !cmp.state.error &&
      Promise.resolve(ctx.componentContext.params.for()).then(data =>
          cmp.refresh({ dataArrived: true }, {
            srcCtx: ctx.componentContext, 
            extendCtx: ctx => ctx.setVar(varName,data).setData(data) 
          }))
          .catch(e=> cmp.refresh({error: JSON.stringify(e)}))
    ))
})

jb.component('watch-ref', { /* watchRef */
  type: 'feature',
  category: 'watch:100',
  description: 'subscribes to data changes to refresh component',
  params: [
    { id: 'ref', mandatory: true, as: 'ref', dynamic: true, description: 'reference to data' },
    { id: 'includeChildren', as: 'string', options: 'yes,no,structure', defaultValue: 'no', description: 'watch childern change as well' },
    { id: 'allowSelfRefresh', as: 'boolean', description: 'allow refresh originated from the components or its children', type: 'boolean' },
    { id: 'strongRefresh', as: 'boolean', description: 'rebuild the component and reinit wait for data', type: 'boolean' },
   ],
  impl: ctx => ({ watchRef: {refF: ctx.params.ref, ...ctx.params}})
})

jb.component('watch-observable', { /* watchObservable */
  type: 'feature',
  category: 'watch',
  description: 'subscribes to a custom rx.observable to refresh component',
  params: [
    {id: 'toWatch', mandatory: true},
  ],
  impl: interactive((ctx,{cmp},{toWatch}) => 
    toWatch.takeUntil(cmp.destroyed).subscribe(()=>cmp.refresh(null,{srcCtx:ctx.componentContext})))
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
  impl: (ctx, refF, itemVariable,watch,includeChildren) => ({
      ...(watch ? {watchRef: { refF, includeChildren }} : {}),
      extendCtx: ctx => {
          const ref = refF()
          return ctx.setData(ref).setVar(itemVariable,ref)
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
    {id: 'title', as: 'string', mandatory: true}
  ],
  impl: htmlAttribute('title','%$title%')
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
  impl: ({}, name, value, watchable, globalId) => ({
      extendCtx: (ctx,cmp) => {
        if (!watchable)
          return ctx.setVar(name,jb.val(value(ctx)))

        const fullName = globalId || (name + ':' + cmp.cmpId);
        jb.log('var',['new-watchable',ctx,fullName])
        jb.resource(fullName, value(ctx));
        const refToResource = jb.mainWatchableHandler.refOfPath([fullName]);
        return ctx.setVar(name, refToResource);
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
  impl: (ctx, name, value,globalId, watchRefs) => ({
      destroy: cmp => {
        const fullName = globalId || (name + ':' + cmp.cmpId);
        cmp.ctx.run(writeValue(`%$${fullName}%`,null))
      },
      extendCtx: (_ctx,cmp) => {
        const fullName = globalId || (name + ':' + cmp.cmpId);
        jb.log('calculated var',['new-resource',ctx,fullName])
        jb.resource(fullName, jb.val(value(_ctx)));
        const ref = _ctx.exp(`%$${fullName}%`,'ref')
        return _ctx.setVar(name, ref);
      },
      afterViewInit: cmp => {
        const fullName = globalId || (name + ':' + cmp.cmpId);
        const refToResource = cmp.ctx.exp(`%$${fullName}%`,'ref');
        (watchRefs(cmp.ctx)||[]).map(x=>jb.asRef(x)).filter(x=>x).forEach(ref=>
          jb.ui.refObservable(ref,cmp,{srcCtx: ctx}).subscribe(e=>
            jb.writeValue(refToResource,value(cmp.ctx),ctx))
        )
      }
  })
})

jb.component('feature.if', { /* feature.if */
  type: 'feature',
  category: 'feature:85',
  description: 'adds/remove element to dom by condition. keywords: hidden/show',
  params: [
    {id: 'showCondition', mandatory: true, dynamic: true}
  ],
  impl: (ctx, condition) => ({
    templateModifier: (vdom,cmp) =>
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
      return vdom
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
    templateModifier: (vdom,cmp) => {
      if (jb.toboolean(cond(cmp.ctx)))
        jb.ui.addClassToVdom(vdom,cssClass())
      return vdom
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
              const keyStr = key.split('+').slice(1).join('+');
              const keyCode = keyStr.charCodeAt(0);
              if (key == 'Delete') keyCode = 46;

              const helper = (key.match('([A-Za-z]*)+') || ['',''])[1];
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
  description: 'on mouse enter',
  category: 'events',
  params: [
    {id: 'action', type: 'action[]', mandatory: true, dynamic: true, mandatory: true},
    {id: 'onLeave', type: 'action[]', mandatory: true, dynamic: true}
  ],
  impl: (ctx,action) => ({
      onmouseenter: true, onmouseleave: true,
      afterViewInit: cmp => {
        cmp.onmouseenter.debounceTime(500).subscribe(()=>
              jb.ui.wrapWithLauchingElement(action, cmp.ctx, cmp.base)())
        cmp.onmouseleave.debounceTime(500).subscribe(()=>
              jb.ui.wrapWithLauchingElement(ctx.params.onLeave, cmp.ctx, cmp.base)())
      }
  })
})

jb.component('feature.class-on-hover', {
  type: 'feature',
  description: 'set css class on mouse enter',
  category: 'events',
  params: [
    {id: 'class', type: 'string', defaultValue: 'item-hover', description: 'css class to add/remove on hover'}
  ],
  impl: (ctx,clz) => ({
    onmouseenter: true, onmouseleave: true,
    afterViewInit: cmp => {
      cmp.onmouseenter.subscribe(()=> jb.ui.addClass(cmp.base,clz))
      cmp.onmouseleave.subscribe(()=> jb.ui.removeClass(cmp.base,clz))
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
      afterViewInit: cmp => cmp.onkeydown.subscribe(e=> {
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
  impl: feature.onKey('Enter', call('action') )
})

jb.component('feature.onEsc', { /* feature.onEsc */
  type: 'feature',
  category: 'events',
  params: [
    {id: 'action', type: 'action[]', mandatory: true, dynamic: true}
  ],
  impl: feature.onKey('Esc', call('action'))
})

jb.component('refresh-control-by-id', { /* refreshControlById */
  type: 'action',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'strongRefresh', as: 'boolean', description: 'rebuild the component and promises', type: 'boolean' },
//    {id: 'recalcVars', as: 'boolean', description: 'recalculate feature variables', type: 'boolean' },
  ],
  impl: (ctx,id) => {
    const base = ctx.vars.elemToTest || typeof document !== 'undefined' && document
    const elem = base && base.querySelector('#'+id)
    if (!elem)
      return jb.logError('refresh-control-by-id can not find elem for #'+id, ctx)
    jb.ui.refreshElem(elem,null,{srcCtx: ctx})
  }
})

jb.component('group.auto-focus-on-first-input', { /* group.autoFocusOnFirstInput */
  type: 'feature',
  impl: ctx => ({
      afterViewInit: cmp => {
          const elem = Array.from(cmp.base.querySelectorAll('input,textarea,select'))
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

jb.component('feature.byCondition', { /* feature.byCondition */
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

jb.component('feature.editable-content', {
  type: 'feature',
  description: 'studio editing behavior',
  params: [
    {id: 'editableContentParam', as: 'string', description: 'name of param mapped to the content editable element' },
    {id: 'isHtml', as: 'boolean', description: 'allow rich text editing' },
  ],
  impl: (ctx,editableContentParam,isHtml) => ({
    afterViewInit: cmp => {
      const contentEditable = jb.studio.studioWindow.jb.ui.contentEditable
      if (contentEditable) {
        cmp.onblurHandler = ev => contentEditable.setScriptData(ev,cmp,editableContentParam,isHtml)
        if (!isHtml)
          cmp.onkeydownHandler = cmp.onkeypressHandler = ev => contentEditable.handleKeyEvent(ev,cmp,editableContentParam)
        cmp.onmousedownHandler = ev => contentEditable.openToolbar(ev,cmp.ctx.path,cmp.ctx.vars.item)
      }
    },
    templateModifier: (vdom,cmp) => {
      const contentEditable = jb.studio.studioWindow.jb.ui.contentEditable
      if (!contentEditable || editableContentParam && !contentEditable.refOfProp(cmp,editableContentParam)) return vdom
      const attsToInject = {contenteditable: 'true', onblur: true, onmousedown: true, onkeypress: true, onkeydown: true}
      // fix spacebar bug in button
      if (vdom.tag && vdom.tag.toLowerCase() == 'button' && vdom.children && vdom.children.length == 1 && typeof vdom.children[0] == 'string') {
        vdom.children[0] = jb.ui.h('span',attsToInject,vdom.children[0])
        return vdom
      } else if (vdom.tag && vdom.tag.toLowerCase() == 'button' && jb.ui.findInVdom(vdom,'mdc-button__label')) {
        const atts = jb.ui.findInVdom(vdom,'mdc-button__label').attributes
        Object.assign(atts,attsToInject,{style: [(atts.style || ''),'z-index: 100'].filter(x=>x).join(';') })
        return vdom
      }
      vdom.attributes = vdom.attributes || {};
      Object.assign(vdom.attributes,attsToInject)
      return vdom;
    }
  })
})
