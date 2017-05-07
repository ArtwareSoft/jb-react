jb.component('group.wait', {
  type: 'feature', category: 'group:70',
  params: [ 
    { id: 'for', essential: true, dynamic: true },
    { id: 'loadingControl', type: 'control', defaultValue: { $:'label', title: 'loading ...'} , dynamic: true },
    { id: 'error', type: 'control', defaultValue: { $:'label', title: 'error: %$error%', css: '{color: red; font-weight: bold}'} , dynamic: true },
  ],
  impl: (context,waitFor,loading,error) => ({
      beforeInit: cmp => {
        cmp.ctrlEmitter = jb.rx.Observable.from(waitFor()).take(1)
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
    { id: 'ref', essential: true, as: 'ref' },
    { id: 'strongRefresh', as: 'boolean' },
  ],
  impl: (ctx,ref,strongRefresh) => ({
      init: cmp => {
          if (strongRefresh && cmp.initWatchByRef) { // itemlist or group
              cmp.initWatchByRef(ref)
          } else {
            jb.ui.refObservable(ref,cmp).subscribe(e=>
                cmp.forceUpdate())
          }
      }
  })
})

jb.component('group.data', {
  type: 'feature', category: 'group:100',
  params: [
    { id: 'data', essential: true, dynamic: true, as: 'ref' },
    { id: 'itemVariable', as: 'string' },
    { id: 'watch', as: 'boolean' },
    { id: 'strongRefresh', as: 'boolean' },
  ],
  impl: (context, data_ref, itemVariable,watch,strongRefresh) => ({
      init: cmp => {
        if (watch && strongRefresh && cmp.initWatchByRef)
              cmp.initWatchByRef(data_ref())
        else if (watch)
          jb.ui.refObservable(data_ref(),cmp).subscribe(e=>
                cmp.forceUpdate())
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
  impl: (context,id) => ({
    templateModifier: (vdom,cmp,state) => {
        vdom.attributes.id = id
        return vdom;
      }
  })
})

jb.component('var', {
  type: 'feature', category: 'group:60',
  params: [
    { id: 'name', as: 'string', essential: true },
    { id: 'value', dynamic: true },
  ],
  impl: (context, name, value) => ({
      extendCtxOnce: (ctx,cmp) => {
        return ctx.setVars(jb.obj(name, value));
      }
  })
})

jb.component('inner-resource', {
  type: 'feature', category: 'group:10',
  params: [
    { id: 'name', as: 'string', essential: true },
    { id: 'value', dynamic: true },
    { id: 'asRef', as: 'boolean', defaultValue: true },
  ],
  impl: (context, name, value, asRef) => ({
      destroyed: cmp => {
        if (jb.resources[cmp.resourceId])
          delete jb.resources[cmp.resourceId];
      },
      extendCtxOnce: (ctx,cmp) => {
        if (!cmp.resourceId)
          cmp.resourceId = cmp.ctx.id; // use the first ctx id
        cmp.resource = jb.resources[cmp.resourceId] = jb.resources[cmp.resourceId] || {};
        cmp.resource[name] = value(ctx.setData(cmp));
        var ref = jb.objectProperty(cmp.resource,name,'ref',true);
        return ctx.setVars(jb.obj(name, asRef ? ref : cmp.resource[name]));
      }
  })
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

jb.component('hidden', {
  type: 'feature', category: 'feature:85',
  params: [
    { id: 'showCondition', type: 'boolean', essential: true, dynamic: true },
  ],
  impl: (context,showCondition) => ({
    templateModifier: (vdom,cmp,state) => 
      showCondition(cmp.ctx) ? vdom : jb.ui.h('span')
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

jb.component('feature.onEnter', {
  type: 'feature', category: 'feature:60',
  params: [
    { id: 'action', type: 'action[]', essential: true, dynamic: true }
  ],
  impl: ctx => ({ 
      onkeydown: true,
      afterViewInit: cmp=> {
        cmp.base.setAttribute('tabIndex','0');
        cmp.onkeydown.filter(e=> e.keyCode == 13).subscribe(()=>
              jb.ui.wrapWithLauchingElement(ctx.params.action, cmp.ctx, cmp.base)())
      }
  })
})

jb.component('group.auto-focus-on-first-input', {
  type: 'feature',
  impl: context => ({ 
      afterViewInit: cmp => {
          var elem = Array.from(cmp.base.querySelectorAll('input,textarea,select'))
            .filter(e => e.getAttribute('type') != 'checkbox')[0];
          jb.ui.focus(elem,'auto-focus-on-first-input'); 
        }
  })
})
