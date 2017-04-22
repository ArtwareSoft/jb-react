jb.ui.field_id_counter = jb.ui.field_id_counter || 0;

jb.component('field.databind', {
  type: 'feature',
  impl: ctx => {
    if (!ctx.vars.$model || !ctx.vars.$model.databind)
      jb.logError('bind-field: No databind in model', ctx.vars.$model, ctx);
    return {
      init: function(cmp) {
            cmp.state.title = ctx.vars.$model.title();
            cmp.state.fieldId = jb.ui.field_id_counter++;
            cmp.state.jbModel = (val,source) => {
              if (val == undefined) 
                return jb.val(ctx.vars.$model.databind);
              else { // write
                if (cmp.inputEvents && source == 'keyup')
                  cmp.inputEvents.next(val);
                else if (!ctx.vars.$model.updateOnBlur || source != 'keyup') {
                  jb.ui.writeValue(ctx.vars.$model.databind,val,{source: cmp});
                  //jb_ui.apply(ctx);
                }
              }
          }
      }
  }}
})

jb.component('field.debounce-databind', {
  type: 'feature',
  description: 'debounce input content writing to databind',
  params: [
    { id: 'debounceTime', as: 'number', defaultValue: 500 },
  ],
  impl: (ctx,debounceTime) =>
    ({
      init: cmp => {
          cmp.inputEvents = cmp.inputEvents || new jb.rx.Subject();
          cmp.inputEvents.takeUntil( cmp.jbEmitter.filter(x=>x =='destroy') )
            .distinctUntilChanged()
            .debounceTime(debounceTime)
            .subscribe(val=>
              jb.ui.writeValue(ctx.vars.$model.databind,val)
          )
      },
      jbEmitter: true,
    })
})

jb.component('field.data', {
  type: 'data',
  impl: ctx =>
    ctx.vars.$model.databind
})

jb.component('field.default', {
  type: 'feature',
  params: [
    { id: 'value', type: 'data'},
  ],
  impl: function(context,defaultValue) {
    var data_ref = context.vars.$model.databind;
    if (data_ref && jb.val(data_ref) == null)
      jb.ui.writeValue(data_ref,defaultValue)
  }
})

jb.component('field.subscribe', {
  type: 'feature',
  params: [
    { id: 'action', type: 'action', essential: true, dynamic: true },
    { id: 'includeFirst', type: 'boolean', as: 'boolean'},
  ],
  impl: (context,action,includeFirst) => ({
    jbEmitter: true,
    init: cmp => {
      var data_ref = context.vars.$model && context.vars.$model.databind;
      if (!data_ref) return;
      var includeFirstEm = includeFirst ? jb.rx.Observable.of(jb.val(data_ref)) : jb.rx.Observable.of();
      jb_rx.refObservable(data_ref,cmp)
            .merge(includeFirstEm)
            .filter(x=>x)
            .subscribe(x=>
              action(context.setData(x)));
    }
  })
})

jb.component('field.toolbar', {
  type: 'feature',
  params: [
    { id: 'toolbar', type: 'control', essential: true, dynamic: true },
  ],
  impl: (context,toolbar) => ({
    extendComp: { jb_toolbar: toolbar() }
  })
})
