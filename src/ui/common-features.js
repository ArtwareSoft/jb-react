jb.component('group.wait', {
  type: 'feature', category: 'group:70',
	description: 'wait for asynch data before showing the control',
  params: [
    { id: 'for', mandatory: true, dynamic: true },
    { id: 'loadingControl', type: 'control', defaultValue: { $:'label', title: 'loading ...'} , dynamic: true },
    { id: 'error', type: 'control', defaultValue: { $:'label', title: 'error: %$error%', css: '{color: red; font-weight: bold}'} , dynamic: true },
    { id: 'varName', as: 'string' },
  ],
  impl: (context,waitFor,loading,error,varName) => ({
      beforeInit : cmp =>
        cmp.state.ctrls = [loading(context)].map(c=>c.reactComp()),

      afterViewInit: cmp => {
        jb.rx.Observable.from(waitFor()).takeUntil(cmp.destroyed).take(1)
          .catch(e=> {
              cmp.setState( { ctrls: [error(context.setVars({error:e}))].map(c=>c.reactComp()) }) 
              return []
          })
          .subscribe(data => {
              cmp.ctx = cmp.ctx.setData(data);
              if (varName)
                cmp.ctx = cmp.ctx.setVars(jb.obj(varName,data));
              // strong refresh
              cmp.setState({ctrls: []});
              jb.delay(1).then(
                _=>cmp.refresh())
            })
      },
  })
})

jb.component('watch-ref', {
  type: 'feature', category: 'watch:100',
	description: 'subscribes to data changes to refresh component',
  params: [
    { id: 'ref', mandatory: true, as: 'ref', dynamic: true, description: 'reference to data' },
    { id: 'includeChildren', as: 'boolean', description: 'watch childern change as well' },
    { id: 'delay', as: 'number', description: 'delay in activation, can be used to set priority' },
    { id: 'allowSelfRefresh', as: 'boolean', description: 'allow refresh originated from the components or its children' },
  ],
  impl: (ctx,ref,includeChildren,delay,allowSelfRefresh) => ({
      beforeInit: cmp => 
        cmp.watchRefOn = true,
      init: cmp =>
        jb.ui.watchRef(cmp.ctx,cmp,ref(cmp.ctx),includeChildren,delay,allowSelfRefresh)
  })
})

jb.component('watch-observable', {
  type: 'feature', category: 'watch',
	description: 'subscribes to a custom rx.observable to refresh component',
  params: [
    { id: 'toWatch', mandatory: true },
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

jb.component('group.data', {
  type: 'feature', category: 'general:100,watch:80',
  params: [
    { id: 'data', mandatory: true, dynamic: true, as: 'ref' },
    { id: 'itemVariable', as: 'string', description: 'optional. define data as a local variable' },
    { id: 'watch', as: 'boolean' },
    { id: 'includeChildren', as: 'boolean', description: 'watch childern change as well' },
  ],
  impl: (ctx, data_ref, itemVariable,watch,includeChildren) => ({
      init: cmp => {
        if (watch)
          jb.ui.watchRef(ctx,cmp,data_ref(),includeChildren)
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

jb.component('html-attribute', {
  type: 'feature',
	description: 'set attribute to html element and give it value',
  params: [
    { id: 'attribute', mandatory: true, as: 'string' },
    { id: 'value', mandatory: true, as: 'string' }
  ],
  impl: (ctx,attribute,value) => ({
    templateModifier: vdom => {
        vdom.attributes = vdom.attributes || {};
        vdom.attributes[attribute] = value
        return vdom;
      }
  })
})

jb.component('id', {
  type: 'feature',
	description: 'adds id to html element',
  params: [
    { id: 'id', mandatory: true, as: 'string' },
  ],
  impl :{$: 'html-attribute', attribute: 'id', value: '%$id%'} 
})

jb.component('feature.hover-title', {
  type: 'feature',
	description: 'set element title, usually shown by browser on hover',
  params: [
    { id: 'title', as: 'string', dynamic: true },
  ],
  impl: (ctx, title) => ({
    templateModifier: (vdom,cmp,state) => {
      vdom.attributes = vdom.attributes || {};
      vdom.attributes.title = title(cmp.ctx.setData(state.title))
      return vdom;
    }
  })
})

jb.component('variable', {
  type: 'feature', category: 'general:90',
	description: 'define a variable. mutable or const, local or global',
  params: [
    { id: 'name', as: 'string', mandatory: true },
    { id: 'value', dynamic: true, defaultValue: '', mandatory: true },
    { id: 'mutable', as: 'boolean', type: 'boolean', description: 'E.g., selected item variable' },
    { id: 'globalId', as: 'string', description: 'If specified, the var will be defined as global with this id' },
  ],
  impl: (context, name, value, mutable, globalId) => ({
      destroy: cmp => {
        const fullName = globalId || (name + ':' + cmp.resourceId);
        if (mutable) {
          jb.writeValue(jb.watchableValueByRef.refOfPath([fullName]),null,context)
          delete jb.watchableValueByRef.resources()[fullName]
        }
      },
      extendCtxOnce: (ctx,cmp) => {
        if (!mutable) {
          return ctx.setVars(jb.obj(name, value(ctx)))
        } else {
          cmp.resourceId = cmp.resourceId || cmp.ctx.id; // use the first ctx id
          const fullName = globalId || (name + ':' + cmp.resourceId);
          jb.log('var',['new-resource',ctx,fullName])
          jb.resource(fullName, jb.val(value(ctx)));
          //jb.watchableValueByRef.resourceReferred && jb.watchableValueByRef.resourceReferred(fullName);
          const refToResource = jb.watchableValueByRef.refOfPath([fullName]);
          //jb.writeValue(refToResource,value(ctx.setData(cmp)),context);
          //jb.writeValue(refToResource, jb.val(value(ctx)), context);
          return ctx.setVars(jb.obj(name, refToResource));
        }
      }
  })
})

// to delete soon
jb.component('var', jb.comps.variable)

jb.component('bind-refs', {
  type: 'feature', category: 'watch',
  description: 'automatically updates a mutual variable when other value is changing',
  params: [
    { id: 'watchRef', mandatory: true, as: 'ref' },
    { id: 'includeChildren', as: 'boolean', description: 'watch childern change as well' },
    { id: 'updateRef', mandatory: true, as: 'ref' },
    { id: 'value', mandatory: true, as: 'single', dynamic: true },
  ],
  impl: (ctx,ref,includeChildren,updateRef,value) => ({
    afterViewInit: cmp =>
        jb.ui.refObservable(ref,cmp,{includeChildren:includeChildren, watchScript: ctx}).subscribe(e=>
          jb.writeValue(updateRef,value(cmp.ctx),ctx))
  })
})

jb.component('calculated-var', {
  type: 'feature', category: 'general:60',
	description: 'defines a local variable that watches other variables with auto recalc',
  params: [
    { id: 'name', as: 'string', mandatory: true },
    { id: 'value', dynamic: true, defaultValue: '', mandatory: true },
    { id: 'globalId', as: 'string', description: 'If specified, the var will be defined as global with this id' },
    { id: 'watchRefs', as: 'array', dynamic: true, mandatory: true, defaultValue: [], description: 'variable to watch. needs to be in array' },
  ],
  impl: (context, name, value,globalId, watchRefs) => ({
      destroy: cmp => {
        jb.writeValue(jb.watchableValueByRef.refOfPath([name + ':' + cmp.resourceId]),null,context)
      },
      extendCtxOnce: (ctx,cmp) => {
        cmp.resourceId = cmp.resourceId || cmp.ctx.id; // use the first ctx id
        const fullName = globalId || (name + ':' + cmp.resourceId);
        jb.log('calculated var',['new-resource',ctx,fullName])
        jb.resource(fullName, jb.val(value(ctx)));
        const refToResource = jb.watchableValueByRef.refOfPath([fullName]);
        (watchRefs(cmp.ctx)||[]).map(x=>jb.asRef(x)).filter(x=>x).forEach(ref=>
            jb.ui.refObservable(ref,cmp,{includeChildren:true, watchScript: context}).subscribe(e=>
              jb.writeValue(refToResource,value(cmp.ctx),context))
          )
        return ctx.setVars(jb.obj(name, refToResource));
      }
  })
})

jb.component('features', {
  type: 'feature',
	description: 'list of features',
  params: [
    { id: 'features', type: 'feature[]', flattenArray: true, dynamic: true },
  ],
  impl: (ctx,features) =>
    features()
})


jb.component('feature.init', {
  type: 'feature', category: 'lifecycle',
  params: [
    { id: 'action', type: 'action[]', mandatory: true, dynamic: true }
  ],
  impl: (ctx,action) => ({ init: cmp =>
      action(cmp.ctx)
  })
})

jb.component('feature.after-load', {
  type: 'feature', category: 'lifecycle',
  params: [
    { id: 'action', type: 'action[]', mandatory: true, dynamic: true }
  ],
  impl: ctx => ({ afterViewInit: cmp =>
      jb.delay(1).then(_ => ctx.params.action(cmp.ctx))
    })
})

jb.component('feature.if', {
  type: 'feature', category: 'feature:85',
	description: 'adds element to dom by condition. no watch',
  params: [
    { id: 'showCondition', mandatory: true, dynamic: true },
  ],
  impl: (ctx, condition,watch) => ({
    templateModifier: (vdom,cmp,state) =>
        jb.toboolean(condition(cmp.ctx)) ? vdom : jb.ui.h('span',{style: {display: 'none'}})
  })
})

jb.component('hidden', {
  type: 'feature', category: 'feature:85',
	description: 'adds display:none to element by condition. no watch',
  params: [
    { id: 'showCondition', type: 'boolean', mandatory: true, dynamic: true },
  ],
  impl: (ctx,showCondition) => ({
    templateModifier: (vdom,cmp,state) => {
      if (!showCondition(cmp.ctx))
        jb.path(vdom,['attributes','style','display'],'none')
      return vdom;
    }
  })
})

jb.component('conditional-class', {
  type: 'feature',
	description: 'toggle class by condition',
  params: [
    { id: 'cssClass', as: 'string', mandatory: true, dynamic: true },
    { id: 'condition', type: 'boolean', mandatory: true, dynamic: true },
  ],
  impl: (ctx,cssClass,cond) => ({
    templateModifier: (vdom,cmp,state) => {
      if (cond())
        jb.ui.addClassToVdom(vdom,cssClass())
    }
  })
})

jb.component('feature.keyboard-shortcut', {
  type: 'feature', category: 'events',
	description: 'listen to events at the document level even when the component is not active',
  params: [
    { id: 'key', as: 'string', description: 'e.g. Alt+C' },
    { id: 'action', type: 'action', dynamic: true },
  ],
  impl: (context,key,action) => ({
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

jb.component('feature.onEvent', {
  type: 'feature', category: 'events',
  params: [
    { id: 'event', as: 'string', mandatory: true, options: 'blur,change,focus,keydown,keypress,keyup,click,dblclick,mousedown,mousemove,mouseup,mouseout,mouseover' },
    { id: 'action', type: 'action[]', mandatory: true, dynamic: true },
    { id: 'debounceTime', as: 'number', defaultValue: 0, description: 'used for mouse events such as mousemove' },
  ],
  impl: (ctx,event,action,debounceTime) => ({
      [`on${event}`]: true,
      afterViewInit: cmp=>
        (debounceTime ? cmp[`on${event}`].debounceTime(debounceTime) : cmp[`on${event}`])
          .subscribe(event=>
                jb.ui.wrapWithLauchingElement(action, cmp.ctx.setVars({event}), cmp.base)())
  })
})

jb.component('feature.onHover', {
  type: 'feature', category: 'events',
  params: [
    { id: 'action', type: 'action[]', mandatory: true, dynamic: true }
  ],
  impl: (ctx,action) => ({
      onmouseenter: true,
      afterViewInit: cmp=>
        cmp.onmouseenter.debounceTime(500).subscribe(()=>
              jb.ui.wrapWithLauchingElement(action, cmp.ctx, cmp.base)())
  })
})

jb.component('feature.onKey', {
  type: 'feature', category: 'events',
  params: [
    { id: 'code', as: 'number' },
    { id: 'action', type: 'action[]', mandatory: true, dynamic: true }
  ],
  impl: (ctx,code) => ({
      onkeydown: true,
      afterViewInit: cmp=> {
        cmp.base.setAttribute('tabIndex','0');
        cmp.onkeydown.filter(e=> e.keyCode == code).subscribe(()=>
              jb.ui.wrapWithLauchingElement(ctx.params.action, cmp.ctx, cmp.base)())
      }
  })
})

jb.component('feature.onEnter', {
  type: 'feature', category: 'events',
  params: [
    { id: 'action', type: 'action[]', mandatory: true, dynamic: true }
  ],
  impl :{$: 'feature.onKey', code: 13, action :{$call: 'action'}}
})

jb.component('feature.onEsc', {
  type: 'feature', category: 'events',
  params: [
    { id: 'action', type: 'action[]', mandatory: true, dynamic: true }
  ],
  impl :{$: 'feature.onKey', code: 27, action :{$call: 'action'}}
})

jb.component('feature.onDelete', {
  type: 'feature', category: 'events',
  params: [
    { id: 'action', type: 'action[]', mandatory: true, dynamic: true }
  ],
  impl :{$: 'feature.onKey', code: 46, action :{$call: 'action'}}
})

jb.component('refresh-control-by-id', {
  type: 'action',
  params: [
    { id: 'id', as: 'string', mandatory: true }
  ],
  impl : (ctx,id) => {
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


jb.component('group.auto-focus-on-first-input', {
  type: 'feature',
  impl: ctx => ({
      afterViewInit: cmp => {
          var elem = Array.from(cmp.base.querySelectorAll('input,textarea,select'))
            .filter(e => e.getAttribute('type') != 'checkbox')[0];
          elem && jb.ui.focus(elem,'group.auto-focus-on-first-input',ctx);
        }
  })
})

jb.component('focus-on-first-element', {
  type: 'action',
  params: [
    { id: 'selector', as: 'string', defaultValue: 'input' },
  ],
  impl: (ctx, selector) => 
      jb.delay(50).then(() => {
        const elem = document.querySelector(selector)
        elem && jb.ui.focus(elem,'focus-on-first-element',ctx)
    })
})

jb.component('focus-on-sibling', {
	type: 'action',
	params: [
	  {id: 'siblingSelector', as: 'string', mandatory: true},
	  {id: 'delay', as: 'number', defaultValue: 0}
	],
	impl: (ctx,siblingSelector,delay) => {
	  if (!ctx.vars.event) 
		  return jb.error('no event for action focus-on-sibling',ctx)
	  delayedFocus(ctx.vars.event.srcElement.parent,{delay,siblingSelector})

 	  function delayedFocus(parent, {delay = 0, selector}) {
		  jb.delay(delay).then(() => jb.ui.focus(parent.querySelector(selector), 'focus-on-sibling', ctx))
	  }
	}
})
