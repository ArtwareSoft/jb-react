(function() {
jb.ui.field_id_counter = jb.ui.field_id_counter || 0;

function databindField(cmp,ctx,debounceTime,oneWay) {
  debounceTime = debounceTime || 300
  if (debounceTime) {
    cmp.debouncer = new jb.rx.Subject();
    cmp.debouncer.takeUntil( cmp.destroyed )
      .distinctUntilChanged()
      .buffer(cmp.debouncer.debounceTime(debounceTime))
      .filter(buf=>buf.length)
      .map(buf=>buf.pop())
      .subscribe(val=>cmp.jbModel(val))
  }

  if (!ctx.vars.$model || !ctx.vars.$model.databind)
    return jb.logError('bind-field: No databind in model', ctx, ctx.vars.$model);

  cmp.jbModel = (val,source) => {
    if (source == 'keyup') {
      if (cmp.debouncer)
        return cmp.debouncer.next(val);
      return jb.delay(1).then(_=>cmp.jbModel(val)); // make sure the input is inside the value
    }

    if (val === undefined)
      return jb.val(cmp.state.databindRef);
    else { // write
        if (!oneWay)
          cmp.setState({model: val});
        jb.ui.checkValidationError(cmp);
        jb.writeValue(cmp.state.databindRef,val,ctx);
    }
  }

  cmp.refresh = _ => {
    const newRef = ctx.vars.$model.databind();
    if (jb.val(newRef) != jb.val(cmp.state.databindRef))
      cmp.databindRefChanged.next(newRef)
    cmp.setState({model: cmp.jbModel()});
    cmp.refreshMdl && cmp.refreshMdl();
    cmp.extendRefresh && cmp.extendRefresh();
  }

  cmp.state.title = ctx.vars.$model.title();
  cmp.state.fieldId = jb.ui.field_id_counter++;
  cmp.databindRefChangedSub = new jb.rx.Subject();
  cmp.databindRefChanged = cmp.databindRefChangedSub.do(ref=> {
    cmp.state.databindRef = ref
    cmp.state.model = cmp.jbModel()
  })
  cmp.databindRefChanged.subscribe(()=>{}) // first activation


  const srcCtx = cmp.ctxForPick || cmp.ctx;
  if (!oneWay)
      jb.ui.databindObservable(cmp, {
            srcCtx: ctx, onError: _ => cmp.setState({model: null}) })
      .filter(e=>!e || !e.srcCtx || e.srcCtx.path != srcCtx.path) // block self refresh
      .subscribe(e=> !cmp.watchRefOn && jb.ui.setState(cmp,null,e,ctx))

   cmp.databindRefChangedSub.next(ctx.vars.$model.databind());
}

jb.ui.checkValidationError = cmp => {
  const err = validationError(cmp);
  if (cmp.state.error != err) {
    jb.log('field',['setErrState',cmp,err])
    cmp.setState({valid: !err, error:err});
  }

  function validationError() {
    if (!cmp.validations) return;
    const ctx = cmp.ctx.setData(cmp.state.model);
    const err = (cmp.validations || [])
      .filter(validator=>!validator.validCondition(ctx))
      .map(validator=>validator.errorMessage(ctx))[0];
    if (ctx.exp('formContainer'))
      ctx.run(writeValue('%$formContainer/err%',err));
    return err;
  }
}

jb.ui.fieldTitle = function(cmp,ctrl,h) {
	const field = ctrl.field || ctrl
	if (field.titleCtrl) {
		const ctx = cmp.ctx.setData(field).setVars({input: cmp.ctx.data})
		const jbComp = field.titleCtrl(ctx);
		return jbComp && h(jbComp.reactComp(),{'jb-ctx': jb.ui.preserveCtx(ctx) })
	}
	return field.title(cmp.ctx)
}

jb.ui.preserveFieldCtxWithItem = (field,item) => {
	const ctx = jb.ctxDictionary[field.ctxId]
	return ctx && jb.ui.preserveCtx(ctx.setData(item))
}
  
jb.component('field.databind', { /* field.databind */
  type: 'feature',
  impl: ctx => ({
      beforeInit: cmp => databindField(cmp,ctx),
      templateModifier: (vdom,cmp,state) => {
        if (!vdom.attributes || !ctx.vars.$model.updateOnBlur) return;
        Object.assign(vdom.attributes, {
          onchange: undefined, onkeyup: undefined, onkeydown: undefined,
          onblur: e => cmp.jbModel(e.target.value),
        })
      }
  })
})

jb.component('field.databind-text', { /* field.databindText */
  type: 'feature',
  params: [
    {id: 'debounceTime', as: 'number', defaultValue: 0},
    {id: 'oneWay', type: 'boolean', as: 'boolean', defaultValue: true}
  ],
  impl: (ctx,debounceTime,oneWay) => ({
      beforeInit: cmp => databindField(cmp,ctx,debounceTime,oneWay),
      templateModifier: (vdom,cmp,state) => {
        if (!vdom.attributes || !ctx.vars.$model.updateOnBlur) return;
        const elemToChange = cmp.elemToInput ? cmp.elemToInput(vdom) : vdom
        Object.assign(elemToChange.attributes, {
          onchange: undefined, onkeyup: undefined, onkeydown: undefined,
          onblur: e => cmp.jbModel(e.target.value),
        })
      }
  })
})

jb.component('field.data', { /* field.data */
  type: 'data',
  impl: ctx =>
    ctx.vars.$model.databind()
})

jb.component('field.default', { /* field.default */
  type: 'feature',
  params: [
    {id: 'value', type: 'data'}
  ],
  impl: (ctx,defaultValue) => {
    var data_ref = ctx.vars.$model.databind();
    if (data_ref && jb.val(data_ref) == null)
      jb.writeValue(data_ref, jb.val(defaultValue), ctx)
  }
})

jb.component('field.init-value', { /* field.initValue */
  type: 'feature',
  params: [
    {id: 'value', type: 'data'}
  ],
  impl: (ctx,value) =>
    ctx.vars.$model.databind && jb.writeValue(ctx.vars.$model.databind(), jb.val(value), ctx)
})

jb.component('field.keyboard-shortcut', { /* field.keyboardShortcut */
  type: 'feature',
  category: 'events',
  description: 'listen to events at the document level even when the component is not active',
  params: [
    {id: 'key', as: 'string', description: 'e.g. Alt+C'},
    {id: 'action', type: 'action', dynamic: true}
  ],
  impl: (context,key,action) => ({
      afterViewInit: cmp => {
        const elem = cmp.base.querySelector('input') || cmp.base
        if (elem.tabIndex === undefined) elem.tabIndex = -1
        jb.rx.Observable.fromEvent(elem, 'keydown')
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
      }
  })
})

jb.component('field.subscribe', { /* field.subscribe */
  type: 'feature',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true},
    {id: 'includeFirst', type: 'boolean', as: 'boolean'}
  ],
  impl: (context,action,includeFirst) => ({
    init: cmp => {
      const includeFirstEm = includeFirst ? jb.rx.Observable.of({ref: cmp.state.databindRef}) : jb.rx.Observable.of();
      jb.ui.databindObservable(cmp,{srcCtx: context})
            .merge(includeFirstEm)
            .map(e=>jb.val(e.ref))
            .filter(x=>x)
            .subscribe(x=>
              action(context.setData(x)));
    }
  })
})

jb.component('field.on-change', jb.comps['field.subscribe'])

jb.component('field.toolbar', { /* field.toolbar */
  type: 'feature',
  params: [
    {id: 'toolbar', type: 'control', mandatory: true, dynamic: true}
  ],
  impl: (context,toolbar) => ({
    toolbar: toolbar().reactComp()
  })
})

// ***** validation

jb.component('validation', { /* validation */
  type: 'feature',
  category: 'validation:100',
  params: [
    {id: 'validCondition', mandatory: true, as: 'boolean', dynamic: true},
    {id: 'errorMessage', mandatory: true, as: 'string', dynamic: true}
  ],
  impl: (ctx,validCondition,errorMessage) => ({
      init: cmp =>
        cmp.validations = (cmp.validations || []).concat([ctx.params]),
      afterViewInit: cmp =>  { // for preview
          var _ctx = ctx.setData(cmp.state.model);
          validCondition(_ctx); errorMessage(_ctx);
      }
  })
})

jb.component('field.title', {
  description: 'used to set table title in button and label',
  type: 'feature',
  category: 'table:80',
  params: [
    {id: 'title', as: 'string', dynamic: true },
  ],
  impl: (ctx,title) => ({
      enrichField: field => field.title = ctx => title(ctx)
  })
})

jb.component('field.title-ctrl', {
  description: 'title as control, buttons are usefull',
  type: 'feature',
  category: 'table:80',
  params: [
    {id: 'titleCtrl', type: 'control', mandatory: true, dynamic: true, 
      templateValue: button({title: '%title%', style: button.href()}) 
    },
  ],
  impl: (ctx,titleCtrl) => ({
      enrichField: field => field.titleCtrl = ctx => titleCtrl(ctx)
  })
})

jb.component('field.column-width', {
  description: 'used in itemlist fields',
  type: 'feature',
  category: 'table:80',
  params: [
    {id: 'width', as: 'number', mandatory: true },
  ],
  impl: (ctx,width) => ({
      enrichField: field => field.width = width
  })
})


})()