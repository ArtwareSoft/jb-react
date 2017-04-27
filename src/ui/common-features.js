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

jb.component('watch', {
  type: 'feature', category: 'group:70',
  params: [ 
    { id: 'resource', essential: true, as: 'array' },
  ],
  impl: (context,resource) => ({
      beforeInit: cmp => {
        jb.ui.resourceChange.takeUntil(cmp.destroyed)
          .filter(e => resource[0] == '*' || e.path && resource.indexOf(e.path[0]) != -1)
          .subscribe(e=>
              cmp.forceUpdate());
      }
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
