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
            x=='after-update').take(1)
          .toPromise());
      },
      jbEmitter: true,
  })
})
