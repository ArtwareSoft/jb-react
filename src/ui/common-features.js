jb.component('group.wait', {
  type: 'feature', category: 'group:70',
  params: [ 
    { id: 'for', essential: true, dynamic: true },
    { id: 'loadingControl', type: 'control', defaultValue: { $:'label', title: 'loading ...'} , dynamic: true },
    { id: 'error', type: 'control', defaultValue: { $:'label', title: 'error: %$error%', css: '{color: red; font-weight: bold}'} , dynamic: true },
    { id: 'resource', as: 'string' },    
  ],
  impl: (context,waitFor,loading,error,resource) => ({
      beforeInit: cmp => {
        cmp.ctrlEmitter = jb.rx.Observable.from(waitFor()).take(1)
            .do(data => {
              if (resource) 
                jb.resources[resource] = data;
            })
            .map(data=>
              context.vars.$model.controls(cmp.ctx.setData(data)))
            .catch(e=> 
                jb.rx.Observable.of([error(context.setVars({error:e}))]));

        cmp.state.ctrls = [loading(context)].map(c=>c.reactComp());

        cmp.delayed = cmp.ctrlEmitter.toPromise().then(_=>
          cmp.jbEmitter.filter(x=>
            x=='after-update').take(1).toPromise());
      },
      jbEmitter: true,
  })
})

jb.component('watch-ref', {
  type: 'feature', category: 'group:70',
  params: [ 
    { id: 'ref', essential: true, as: 'ref', ref: true },
    { id: 'strongRefresh', as: 'boolean', description: 'redraw groups and itemlists' },
    { id: 'includeChildren', as: 'boolean', description: 'watch childern change as well' },
  ],
  impl: (ctx,ref,strongRefresh,includeChildren) => ({
      init: cmp => 
        jb.ui.watchRef(ctx,cmp,ref,strongRefresh,includeChildren)
  })
})

jb.component('watch-observable', {
  type: 'feature', category: 'group:70',
  params: [ 
    { id: 'toWatch', essential: true },
    { id: 'strongRefresh', as: 'boolean', description: 'redraw groups and itemlists' },
  ],
  impl: (ctx,toWatch,strongRefresh) => ({
      init: cmp => {
        if (!toWatch.subscribe)
          return jb.logError('watch-observable: non obsevable parameter');
        var virtualRef = { $jb_observable: cmp => 
          toWatch 
        };
        jb.ui.watchRef(ctx,cmp,virtualRef,strongRefresh,false)
      }
  })
})


jb.component('group.data', {
  type: 'feature', category: 'group:100',
  params: [
    { id: 'data', essential: true, dynamic: true, as: 'ref' },
    { id: 'itemVariable', as: 'string' },
    { id: 'watch', as: 'boolean' },
    { id: 'strongRefresh', as: 'boolean', description: 'redraw groups and itemlists' },
    { id: 'includeChildren', as: 'boolean', description: 'watch childern change as well' },
  ],
  impl: (ctx, data_ref, itemVariable,watch,strongRefresh,includeChildren) => ({
      init: cmp => {
        if (watch)
          jb.ui.watchRef(ctx,cmp,data_ref(),strongRefresh,includeChildren)
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
  type: 'feature', category: 'group:80',
  params: [
    { id: 'name', as: 'string', essential: true },
    { id: 'value', dynamic: true },
    { id: 'mutable', as: 'boolean' },    
  ],
  impl: (context, name, value,mutable) => ({
      destroy: cmp => {
        if (mutable)
          delete jb.resources[name + ':' + cmp.resourceId]
      },
      extendCtxOnce: (ctx,cmp) => {
        if (!mutable) {
          return ctx.setVars(jb.obj(name, value()))
        } else {
          cmp.resourceId = cmp.resourceId || cmp.ctx.id; // use the first ctx id
          var full_name = name + ':' + cmp.resourceId;
          jb.resources[full_name] = value(ctx.setData(cmp));
          return ctx.setVars(jb.obj(name, jb.objectProperty(jb.resources,full_name,'ref',true)));
        }
      }
  })
})

jb.component('features', {
  type: 'feature',
  params: [
    { id: 'features', type: 'feature[]', flattenArray: true, dynamic: true },
  ],
  impl: (ctx,features) => 
    features()
})


jb.component('feature.init', {
  type: 'feature',
  params: [
    { id: 'action', type: 'action[]', essential: true, dynamic: true }
  ],
  impl: (ctx,action) => ({init: cmp => 
      action(cmp.ctx)
  })
})

jb.component('feature.after-load', {
  type: 'feature',
  params: [
    { id: 'action', type: 'action[]', essential: true, dynamic: true }
  ],
  impl: function(context) { return  { 
    afterViewInit: cmp => jb.delay(1).then(() => context.params.action(cmp.ctx))
  }}
})

jb.component('feature.if', {
  type: 'feature',
  params: [
    { id: 'showCondition', essential: true, dynamic: true },
  ],
  impl: (ctx, condition,watch,strongRefresh) => ({
    templateModifier: (vdom,cmp,state) => 
        jb.toboolean(condition()) ? vdom : jb.ui.h('div',{style: {display: 'none'}}) // can not be empty string
  })
})

jb.component('hidden', {
  type: 'feature', category: 'feature:85',
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
  type: 'feature', category: 'feature:75',
  params: [
    { id: 'cssClass', as: 'string', essential: true, dynamic: true },
    { id: 'condition', type: 'boolean', essential: true, dynamic: true },
  ],
  impl: (ctx,cssClass,cond) => ({
    templateModifier: (vdom,cmp,state) => {
      vdom.attributes = vdom.attributes || {};
      if (vdom.attributes == null) debugger;
      vdom.attributes.class = [vdom.attributes.class || '', cond(cmp.ctx) ? cssClass() : ''].join(' ');
      return vdom;
    }
  })
})

jb.component('feature.hover-title', {
  type: 'feature',
  params: [
    { id: 'title', as: 'string', dynamic: true },
  ],
  impl: (ctx, title) => ({
    templateModifier: (vdom,cmp,state) => {
      vdom.attributes.title = title()
      return vdom;
    }
  })
})

jb.component('feature.keyboard-shortcut', {
  type: 'feature',
  params: [
    { id: 'key', as: 'string', description: 'e.g. Alt+C' },
    { id: 'action', type: 'action', dynamic: true }
  ],
  impl: (context,key,action) => ({
      afterViewInit: cmp =>
        jb.rx.Observable.fromEvent(cmp.base.ownerDocument, 'keydown')
            .takeUntil( cmp.destroyed )
            .subscribe(event=>{
              var keyCode = key.split('+').pop().charCodeAt(0);
              if (key == 'Delete') keyCode = 46;

              var helper = (key.match('([A-Za-z]*)+') || ['',''])[1];
              if (helper == 'Ctrl' && !event.ctrlKey) return
              if (helper == 'Alt' && !event.altKey) return
              if (event.keyCode == keyCode)
                action();
            })
      })
})

jb.component('feature.onHover', {
  type: 'feature', category: 'feature:60',
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
  type: 'feature', category: 'feature:60',
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
  type: 'feature', category: 'feature:60',
  params: [
    { id: 'action', type: 'action[]', essential: true, dynamic: true }
  ],
  impl :{$: 'feature.onKey', code: 13, action :{$call: 'action'}}
})

jb.component('feature.onEsc', {
  type: 'feature', category: 'feature:60',
  params: [
    { id: 'action', type: 'action[]', essential: true, dynamic: true }
  ],
  impl :{$: 'feature.onKey', code: 27, action :{$call: 'action'}}
})

jb.component('feature.onDelete', {
  type: 'feature', category: 'feature:60',
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
          jb.ui.focus(elem,'group.auto-focus-on-first-input',ctx); 
        }
  })
})
