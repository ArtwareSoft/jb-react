jb.component('group.wait', {
  type: 'feature', category: 'group:70',
	description: 'wait for asynch data before showing the control',
  params: [
    { id: 'for', essential: true, dynamic: true },
    { id: 'loadingControl', type: 'control', defaultValue: { $:'label', title: 'loading ...'} , dynamic: true },
    { id: 'error', type: 'control', defaultValue: { $:'label', title: 'error: %$error%', css: '{color: red; font-weight: bold}'} , dynamic: true },
    { id: 'varName', as: 'string' },
  ],
  impl: (context,waitFor,loading,error,varName) => ({
      beforeInit : cmp =>
        cmp.state.ctrls = [loading(context)].map(c=>c.reactComp()),

      afterViewInit: cmp => {
        jb.rx.Observable.from(waitFor()).takeUntil(cmp.destroyed).take(1)
          .catch(e=>
              cmp.setState( { ctrls: [error(context.setVars({error:e}))].map(c=>c.reactComp()) }) )
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
    { id: 'ref', essential: true, as: 'ref', description: 'reference to data' },
    { id: 'includeChildren', as: 'boolean', description: 'watch childern change as well' },
  ],
  impl: (ctx,ref,includeChildren) => ({
      init: cmp =>
        jb.ui.watchRef(ctx,cmp,ref,includeChildren)
  })
})

jb.component('watch-observable', {
  type: 'feature', category: 'watch',
	description: 'subscribes to a custom rx.observable to refresh component',
  params: [
    { id: 'toWatch', essential: true },
  ],
  impl: (ctx,toWatch) => ({
      init: cmp => {
        if (!toWatch.subscribe)
          return jb.logError('watch-observable: non obsevable parameter');
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
    { id: 'data', essential: true, dynamic: true, as: 'ref' },
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

jb.component('id', {
  type: 'feature',
	description: 'adds id to html element',
  params: [
    { id: 'id', essential: true, as: 'string' },
  ],
  impl: (ctx,id) => ({
    templateModifier: (vdom,cmp,state) => {
        vdom.attributes.id = id
        return vdom;
      }
  })
})

jb.component('var', {
  type: 'feature', category: 'general:90',
	description: 'defines a local variable',
  params: [
    { id: 'name', as: 'string', essential: true },
    { id: 'value', dynamic: true, defaultValue: '', essential: true },
    { id: 'mutable', as: 'boolean', description: 'E.g., selected item variable' },
  ],
  impl: (context, name, value, mutable) => ({
      destroy: cmp => {
        if (mutable)
          jb.writeValue(jb.valueByRefHandler.refOfPath([name + ':' + cmp.resourceId]),null,context)
      },
      extendCtxOnce: (ctx,cmp) => {
        if (!mutable) {
          return ctx.setVars(jb.obj(name, value(ctx)))
        } else {
          cmp.resourceId = cmp.resourceId || cmp.ctx.id; // use the first ctx id
          var refToResource = jb.valueByRefHandler.refOfPath([name + ':' + cmp.resourceId]);
          //jb.writeValue(refToResource,value(ctx.setData(cmp)),context);
          jb.writeValue(refToResource, jb.val(value(ctx)), context);
          return ctx.setVars(jb.obj(name, refToResource));
        }
      }
  })
})

jb.component('global-var', {
  type: 'feature', category: 'general:20',
  description: 'defines a global variable which is calculated only once',
  params: [
    { id: 'name', as: 'string', essential: true },
    { id: 'value', dynamic: true, essential: true },
  ],
  impl: (context, name, value) =>
    jb.consts && !jb.consts[name] && (jb.consts[name] = value())
})

jb.component('bind-refs', {
  type: 'feature', category: 'watch',
  description: 'automatically updates a mutual variable when other value is changing',
  params: [
    { id: 'watchRef', essential: true, as: 'ref' },
    { id: 'includeChildren', as: 'boolean', description: 'watch childern change as well' },
    { id: 'updateRef', essential: true, as: 'ref' },
    { id: 'value', essential: true, as: 'single', dynamic: true },
  ],
  impl: (ctx,ref,includeChildren,updateRef,value) => ({
      init: cmp =>
        jb.ui.refObservable(ref,cmp,{includeChildren:includeChildren}).subscribe(e=>
          jb.writeValue(updateRef,value(cmp.ctx),ctx))
  })
})

jb.component('calculated-var', {
  type: 'feature', category: 'general:60',
	description: 'defines a local variable that watches other variables with auto recalc',
  params: [
    { id: 'name', as: 'string', essential: true },
    { id: 'value', dynamic: true, defaultValue: '', essential: true },
    { id: 'watchRefs', as: 'array', dynamic: true, essential: true, defaultValue: [], description: 'variable to watch. needs to be in array' },
  ],
  impl: (context, name, value,watchRefs) => ({
      destroy: cmp => {
        jb.writeValue(jb.valueByRefHandler.refOfPath([name + ':' + cmp.resourceId]),null,context)
      },
      extendCtxOnce: (ctx,cmp) => {
          cmp.resourceId = cmp.resourceId || cmp.ctx.id; // use the first ctx id
          var refToResource = jb.valueByRefHandler.refOfPath([name + ':' + cmp.resourceId]);
          jb.writeValue(refToResource,value(cmp.ctx),context);
          (watchRefs(cmp.ctx)||[]).map(x=>jb.asRef(x)).filter(x=>x).forEach(ref=>
            jb.ui.refObservable(ref,cmp,{includeChildren:true}).subscribe(e=>
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
    { id: 'action', type: 'action[]', essential: true, dynamic: true }
  ],
  impl: (ctx,action) => ({ init: cmp =>
      action(cmp.ctx)
  })
})

jb.component('feature.after-load', {
  type: 'feature', category: 'lifecycle',
  params: [
    { id: 'action', type: 'action[]', essential: true, dynamic: true }
  ],
  impl: ctx => ({ afterViewInit: cmp =>
      jb.delay(1).then(_ => ctx.params.action(cmp.ctx))
    })
})

jb.component('feature.if', {
  type: 'feature', category: 'feature:85',
	description: 'adds element to dom by condition. no watch',
  params: [
    { id: 'showCondition', essential: true, dynamic: true },
  ],
  impl: (ctx, condition,watch) => ({
    templateModifier: (vdom,cmp,state) =>
        jb.toboolean(condition()) ? vdom : jb.ui.h('span',{style: {display: 'none'}})
  })
})

jb.component('hidden', {
  type: 'feature', category: 'feature:85',
	description: 'adds display:none to element by condition. no watch',
  params: [
    { id: 'showCondition', type: 'boolean', essential: true, dynamic: true },
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
    { id: 'cssClass', as: 'string', essential: true, dynamic: true },
    { id: 'condition', type: 'boolean', essential: true, dynamic: true },
  ],
  impl: (ctx,cssClass,cond) => ({
    templateModifier: (vdom,cmp,state) => {
      if (cond())
        jb.ui.addClassToVdom(vdom,cssClass())
    }
  })
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
      vdom.attributes.title = title()
      return vdom;
    }
  })
})

jb.component('feature.keyboard-shortcut', {
  type: 'feature', category: 'events',
	description: 'listen to events at the document level even when the component is not active',
  params: [
    { id: 'key', as: 'string', description: 'e.g. Alt+C' },
    { id: 'action', type: 'action', dynamic: true }
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

jb.component('feature.onHover', {
  type: 'feature', category: 'events',
  params: [
    { id: 'action', type: 'action[]', essential: true, dynamic: true }
  ],
  impl: (ctx,code) => ({
      onmouseenter: true,
      afterViewInit: cmp=>
        cmp.onmouseenter.debounceTime(500).subscribe(()=>
              jb.ui.wrapWithLauchingElement(ctx.params.action, cmp.ctx, cmp.base)())
  })
})

jb.component('feature.onKey', {
  type: 'feature', category: 'events',
  params: [
    { id: 'code', as: 'number' },
    { id: 'action', type: 'action[]', essential: true, dynamic: true }
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
    { id: 'action', type: 'action[]', essential: true, dynamic: true }
  ],
  impl :{$: 'feature.onKey', code: 13, action :{$call: 'action'}}
})

jb.component('feature.onEsc', {
  type: 'feature', category: 'events',
  params: [
    { id: 'action', type: 'action[]', essential: true, dynamic: true }
  ],
  impl :{$: 'feature.onKey', code: 27, action :{$call: 'action'}}
})

jb.component('feature.onDelete', {
  type: 'feature', category: 'events',
  params: [
    { id: 'action', type: 'action[]', essential: true, dynamic: true }
  ],
  impl :{$: 'feature.onKey', code: 46, action :{$call: 'action'}}
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
