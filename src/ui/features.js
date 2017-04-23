jb.component('group.wait', {
  type: 'feature', category: 'group:70',
  params: [ 
    { id: 'for', essential: true, dynamic: true },
    { id: 'loadingControl', type: 'control', defaultValue: { $:'label', title: 'loading ...'} , dynamic: true },
    { id: 'error', type: 'control', defaultValue: { $:'label', title: 'error: %$error%', css: '{color: red; font-weight: bold}'} , dynamic: true },
    { id: 'resource', as: 'string' },
    { id: 'mapToResource', dynamic: true, defaultValue: '%%' },
  ],
  impl: function(context,waitFor,loading,error) { 
    return {
      beforeInit: function(cmp) {
          cmp.jbGroupChildrenEm = jb_rx.observableFromCtx(context.setData(waitFor()))
            .flatMap(x=>{
                var data = context.params.mapToResource(x);
                jb.writeToResource(context.params.resource,data,context);
                return [context.vars.$model.controls(cmp.ctx.setData(data))];
              })
            .startWith([loading(context)])
            .catch(e=> 
              jb_rx.Observable.of([error(context.setVars({error:e}))]));
      },
      jbEmitter: true,
  }}
})

// bind data and watch the data to refresh the control
jb.component('group.data', {
  type: 'feature', category: 'group:100',
  params: [
    { id: 'data', essential: true, dynamic: true, as: 'ref' },
    { id: 'itemVariable', as: 'string' },
    { id: 'watch', type: 'boolean', as: 'boolean', defaultValue: true }
  ],
  impl: function(context, data_ref, itemVariable,watch) {
    return {
      beforeInit: function(cmp) {
          context.vars.$model.databind = data_ref;
          var dataEm = cmp.jbEmitter
              .filter(x => x == 'check')
              .map(()=> 
                jb.val(data_ref())) 
              .distinctUntilChanged(jb_compareArrays)
              .map(()=> {
                  var ctx2 = cmp.refreshCtx ? cmp.refreshCtx() : cmp.ctx;
                  return context.vars.$model.controls(ctx2)
              })

          cmp.jbGroupChildrenEm = watch ? dataEm : dataEm.take(1);
      },
      extendCtx: ctx => {
          var val = data_ref();
          var res = ctx.setData(val);
          if (itemVariable)
            res = res.setVars(jb.obj(itemVariable,val));
          return res;
      },
      jbEmitter: true,
  }}
})

jb.component('group.watch', {
  type: 'feature', category: 'group:80',
  params: [
    { id: 'data', essential: true, dynamic: true },
  ],
  impl: (context, data) => ({
      beforeInit: function(cmp) {
          cmp.jbWatchGroupChildrenEm = (cmp.jbWatchGroupChildrenEm || jb_rx.Observable.of())
              .merge(cmp.jbEmitter.filter(x => x == 'check')
                .map(()=> 
                  jb.val(data())) 
                .filter(x=>x != null)
                .distinctUntilChanged(jb_compareArrays)
                .map(val=> {
                    var ctx2 = (cmp.refreshCtx ? cmp.refreshCtx() : cmp.ctx);
                    return context.vars.$model.controls(ctx2)
                })
            )
      },
      jbEmitter: true,
  })
})

jb.component('group.auto-focus-on-first-input', {
  type: 'feature',
  impl: context => ({ 
      afterViewInit: cmp => {
          var elem = $(cmp.elementRef.nativeElement).find('input,textarea,select')
            .filter(function(x) { return $(this).attr('type') != 'checkbox'})
            .first();
          jb_ui.focus(elem,'auto-focus-on-first-input'); 
        }
  })
})

jb.component('feature.if', {
  type: 'feature',
  params: [
    { id: 'showCondition', as: 'boolean', essential: true, dynamic: true },
  ],
  impl: (context, condition) => ({
    init: cmp =>
      cmp.jbIf = condition,
    wrapWithngIf: true
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

jb.component('feature.ng-attach-object', {
  type: 'feature',
  params: [
    { id: 'data', as: 'single', dynamic: true }
  ],
  impl: (ctx,data) => 
    ({init: cmp => {
        var obj = data(cmp.ctx);
        if (cmp.constructor && cmp.constructor.prototype && obj) {
          jb.extend(cmp,obj);
          jb.extend(cmp.constructor.prototype,obj.constructor.prototype || {});
        }
    }})
})

jb.component('feature.onEnter', {
  type: 'feature', category: 'feature:60',
  params: [
    { id: 'action', type: 'action[]', essential: true, dynamic: true }
  ],
  impl: ctx => ({ 
      init: cmp=> {
        if (!cmp.keydown) {
          var elem = cmp.elementRef.nativeElement.firstChild;
          if (!elem) return;
          elem.setAttribute('tabIndex','0');
          cmp.keydown = jb_rx.Observable.fromEvent(elem, 'keydown')
              .takeUntil( cmp.destroyed );
        } 

        cmp.keydown.filter(e=> e.keyCode == 13)
            .subscribe(()=>
              jb_ui.wrapWithLauchingElement(ctx.params.action, cmp.ctx, cmp.elementRef)())
      },
      jbEmitter: true,
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

jb.component('feature.emitter',{
  type: 'feature',
  params: [
    { id: 'varName', as: 'string'},
  ],
  impl: function(context,varName) { return  { 
    extendCtx: (ctx,cmp) => 
      ctx.setVars(jb.obj(varName,cmp.jbEmitter)),
    jbEmitter: true,
  }}
})

jb.component('var',{
  type: 'feature', category: 'feature:90',
  params: [
    { id: 'name', as: 'string', essential: true },
    { id: 'value', dynamic: true, essential: true },
  ],
  impl: (context,name,value) => 
    jb.extend({}, name && {
      extendCtx: ctx =>
        ctx.setVars(jb.obj(name,value(ctx)))
    })
})

jb.component('hidden', {
  type: 'feature', category: 'feature:85',
  params: [
    { id: 'showCondition', type: 'boolean', essential: true, dynamic: true },
  ],
  impl: function(context,showCondition) { return {
      init: function(cmp) {
        cmp.jb_hidden = () =>
          !showCondition(cmp.ctx)
      },
      host: { '[hidden]': 'jb_hidden()'}
    }
  }
})

jb.component('feature.disable-change-detection', {
  type: 'feature',
  impl: _ => ({
    disableChangeDetection: true,
  })
})

jb.component('feature.dont-generate-change-detection-events', {
  type: 'feature',
  impl: ({
    beforeInit: cmp => 
      jb_native_delay(1).then(_=>
        cmp.changeDt.detach())
  })
})


jb.component('field.style-on-focus', {
  type: 'feature', category: 'feature:0',
  params: [
    { id: 'style', type: 'style', essential: true, dynamic: true },
  ],
  impl: ctx => ({
    extendComp: { jb_styleOnFocus: ctx.profile.style }
  })
})

jb.component('feature.keyboard-shortcut', {
  type: 'feature',
  params: [
    { id: 'key', as: 'string', description: 'e.g. Alt+C' },
    { id: 'action', type: 'action', dynamic: true }
  ],
  impl: (context,key,action) => 
    ({
      init: function(cmp) {
            var doc = cmp.elementRef.nativeElement.ownerDocument;
            $(doc).keydown(event => {
                var keyCode = key.split('+').pop().charCodeAt(0);
                if (key == 'Delete') keyCode = 46;

                var helper = (key.match('([A-Za-z]*)+') || ['',''])[1];
                if (helper == 'Ctrl' && !event.ctrlKey) return
                if (helper == 'Alt' && !event.altKey) return
                if (event.keyCode == keyCode)
                action();
            })
          }
    })
})
