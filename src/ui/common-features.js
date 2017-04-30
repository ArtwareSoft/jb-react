jb.component('group.wait', {
  type: 'feature', category: 'group:70',
  params: [ 
    { id: 'for', essential: true, dynamic: true },
    { id: 'loadingControl', type: 'control', defaultValue: { $:'label', title: 'loading ...'} , dynamic: true },
    { id: 'error', type: 'control', defaultValue: { $:'label', title: 'error: %$error%', css: '{color: red; font-weight: bold}'} , dynamic: true },
  ],
  impl: (context,waitFor,loading,error) => ({
      beforeInit: cmp => {
        var waitForEmitter = jb.rx.Observable.from(waitFor()).take(1)
            .map(data=>
              context.vars.$model.controls(cmp.ctx.setData(data)))
            .catch(e=> 
                jb.rx.Observable.of([error(context.setVars({error:e}))]));

        cmp.ctrlEmitter = jb.rx.Observable.of([loading(context)])
            .concat(waitForEmitter);

        cmp.delayed = waitForEmitter.toPromise().then(_=>
          cmp.jbEmitter.filter(x=>
            x=='after-update').take(1).toPromise());
      },
      jbEmitter: true,
  })
})

jb.ui.updateCmp = function(ctx,cmp,changeObs) {
    if (ctx.vars.$model.controls) {
        cmp.ctrlEmitter = changeObs.map(_=> {
            cmp.refreshCtx();
            return context.vars.$model.controls(cmp.ctx);
        })
    } else {
      changeObs.subscribe(e=>
          cmp.forceUpdate())
    }
}

jb.component('watch-resource', {
  type: 'feature', category: 'group:70',
  params: [ 
    { id: 'resource', essential: true, as: 'array' },
  ],
  impl: (ctx,resource) => ({
      beforeInit: cmp => 
        jb.ui.updateCmp(ctx,cmp,jb.ui.resourceChange.takeUntil(cmp.destroyed)
          .filter(e => resource[0] == '*' || e.path && resource.indexOf(e.path[0]) != -1))
    })
})

jb.component('watch-ref', {
  type: 'feature', category: 'group:70',
  params: [ 
    { id: 'ref', essential: true, as: 'ref' },
  ],
  impl: (ctx,ref) => ({
      beforeInit: cmp => 
        jb.ui.updateCmp(ctx,cmp,jb.ui.refObservable(ref,cmp))
  })
})

jb.component('group.data', {
  type: 'feature', category: 'group:100',
  params: [
    { id: 'data', essential: true, dynamic: true, as: 'ref' },
    { id: 'itemVariable', as: 'string' },
    { id: 'watch', as: 'string' }
  ],
  impl: (context, data_ref, itemVariable,watch) => ({
      beforeInit: cmp => {
        if (watch[0]) {
          cmp.ctrlEmitter = jb.ui.resourceChange.takeUntil(cmp.destroyed)
            .filter(e => watch[0] == '*' || e.path && watch.indexOf(e.path[0]) != -1)
            .startWith(1)
            .map(_=> {
                cmp.refreshCtx();
                return context.vars.$model.controls(cmp.ctx);
             });
        } 
      },
      extendCtx: ctx => {
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

jb.component('group.var', {
  type: 'feature', category: 'group:100',
  params: [
    { id: 'name', as: 'string', essential: true },
    { id: 'value' },
    { id: 'watch', as: 'boolean', defaultValue: true }
  ],
  impl: (context, name, value, watch) => ({
      beforeInit: cmp => {
        var ref = jb.objectProperty(cmp.resource,name,'ref',true);
        jb.writeValue(ref,value);
        cmp.state.ctrls = context.vars.$model.controls(cmp.ctx).map(c=>c.reactComp());

        if (watch)
          cmp.ctrlEmitter = jb.ui.refObservable(ref,cmp)
            .map(_=> {
                cmp.refreshCtx();
                return context.vars.$model.controls(cmp.ctx);
             });
      },
      destroyed: cmp => {
        if (jb.resources[cmp.resourceId])
          delete jb.resources[cmp.resourceId];
      },
      extendCtx: (ctx,cmp) => {
          cmp.resourceId = cmp.resourceId || cmp.ctx.id; // use the first ctx id
          cmp.resource = jb.ui.resources[cmp.resourceId] = jb.ui.resources[cmp.resourceId] || {};
          var ref = jb.objectProperty(cmp.resource,name,'ref',true);
          return ctx.setVars(jb.obj(name, ref));
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
      showCondition(cmp.ctx) ? vdom : 'span'
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
