(function() {
jb.ui.field_id_counter = jb.ui.field_id_counter || 0;

jb.component('field.databind', { /* field.databind */
  type: 'feature',
  category: 'field:0',
  params: [
    {id: 'debounceTime', as: 'number', defaultValue: 0},
    {id: 'oneWay', type: 'boolean', as: 'boolean' },
  ],
  impl: features(
    If('%$oneWay%', calcProp('databind', '%$$model/databind%'), watchAndCalcModelProp('databind')),
    calcProp('title', '%$$model/title%'),
    calcProp('fieldId',() => jb.ui.field_id_counter++ ),
    defHandler('onblurHandler', (ctx,{cmp, ev},{oneWay}) => writeFieldData(ctx,cmp,ev.target.value,oneWay)),
    defHandler('onchangeHandler', (ctx,{$model, cmp, ev},{oneWay}) => !$model.updateOnBlur && writeFieldData(ctx,cmp,ev.target.value,oneWay)),
    defHandler('onkeyupHandler', (ctx,{$model, cmp, ev},{oneWay}) => !$model.updateOnBlur && writeFieldData(ctx,cmp,ev.target.value,oneWay)),
    defHandler('onkeydownHandler', (ctx,{$model, cmp, ev},{oneWay}) => !$model.updateOnBlur && writeFieldData(ctx,cmp,ev.target.value,oneWay)),
    interactiveProp('jbModel',(ctx,{cmp}) => value => {
      if (value == null)
        return ctx.exp('%$$mode/databind','number')
      else
        writeFieldData(ctx,cmp,{target:{value}},true)
    }),
  )
})

function writeFieldData(ctx,cmp,value,oneWay) {
//  const val = (typeof event != 'undefined' ? event : ev).target.value
  jb.ui.checkValidationError(cmp,value);
  jb.writeValue(ctx.vars.$model.databind(cmp.ctx),value,ctx);
  !oneWay && jb.ui.refreshElem(ev.target,null,{srcCtx: ctx.componentContext});
}

//     interactive((ctx,{cmp},{debounceTime,oneWay}) => {
//         if (debounceTime) {
//           cmp.debouncer = new jb.rx.Subject();
//           cmp.debouncer.takeUntil( cmp.destroyed )
//             .distinctUntilChanged()
//             .buffer(cmp.debouncer.debounceTime(debounceTime))
//             .filter(buf=>buf.length)
//             .map(buf=>buf.pop())
//             .subscribe(val=>cmp.jbModel(val))
//         }

//         if (!ctx.vars.$model || !ctx.vars.$model.databind)
//           return jb.logError('bind-field: No databind in model', ctx, ctx.vars.$model);

//         cmp.jbModel = val => {
//           if (event && event.type == 'keyup') {
//             if (cmp.debouncer)
//               return cmp.debouncer.next(val);
//             return jb.delay(1).then(_=>cmp.jbModel(val)); // make sure the input is inside the value
//           }
//           if (val === undefined)
//             return jb.val(ctx.vars.$model.databind(cmp.ctx));
//           else { // write
//               cmp.state.model = val;
//               jb.ui.checkValidationError(cmp,val);
//               jb.writeValue(ctx.vars.$model.databind(cmp.ctx),val,ctx);
//               if (!oneWay)
//                 cmp.refresh();
//           }
//         }
//         cmp.onblurHandler = () => cmp.jbModel(event.target.value)
//         if (!ctx.vars.$model.updateOnBlur)
//           cmp.onchangeHandler = cmp.onkeyupHandler = cmp.onkeydownHandler = cmp.onblurHandler

//         //databindRefChanged
//         cmp.databindRefChangedSub = new jb.rx.Subject();
//         cmp.databindRefChanged = cmp.databindRefChangedSub.do(ref=> {
//           cmp.state.databindRef = ref
//           cmp.state.model = cmp.jbModel()
//         })
//         cmp.databindRefChanged.subscribe(()=>{}) // first activation

//         const srcCtx = ctx.componentContext;
//         if (!oneWay)
//             jb.ui.databindObservable(cmp, {srcCtx, onError: _ => cmp.refresh({model: null},{srcCtx}) })
//             .filter(e=>!e || !e.srcCtx || e.srcCtx.path != srcCtx.path) // block self refresh
//             .subscribe(e=> !cmp.watchRefOn && cmp.refresh(null,{srcCtx}))

//         cmp.databindRefChangedSub.next(ctx.vars.$model.databind(ctx));
//       }
//     ))
// })

jb.ui.checkValidationError = (cmp,val) => {
  const err = validationError();
  if (cmp.state.error != err) {
    jb.log('field',['setErrState',cmp,err])
    cmp.refresh({valid: !err, error:err});
  }

  function validationError() {
    if (!cmp.validations) return;
    const ctx = cmp.ctx.setData(val);
    const err = (cmp.validations || [])
      .filter(validator=>!validator.validCondition(ctx))
      .map(validator=>validator.errorMessage(ctx))[0];
    if (ctx.exp('formContainer'))
      ctx.run(writeValue('%$formContainer/err%',err));
    return err;
  }
}

jb.ui.fieldTitle = function(cmp,fieldOrCtrl,h) {
  let field = fieldOrCtrl.field && fieldOrCtrl.field() || fieldOrCtrl
  field = typeof field === 'function' ? field() : field  
	if (field.titleCtrl) {
		const ctx = cmp.ctx.setData(field).setVars({input: cmp.ctx.data})
		const jbComp = field.titleCtrl(ctx);
		return jbComp && h(jbComp,{'jb-ctx': jb.ui.preserveCtx(ctx) })
	}
	return field.title(cmp.ctx)
}

jb.ui.preserveFieldCtxWithItem = (field,item) => {
	const ctx = jb.ctxDictionary[field.ctxId]
	return ctx && jb.ui.preserveCtx(ctx.setData(item))
}
  
jb.component('field.databind-text', { /* field.databindText */
  type: 'feature',
  category: 'field:0',
  params: [
    {id: 'debounceTime', as: 'number', defaultValue: 0},
    {id: 'oneWay', type: 'boolean', as: 'boolean', defaultValue: true},
  ],
  impl: field.databind('%$debounceTime%', '%$oneWay%')
})

// jb.component('field.data', { /* field.data */
//   type: 'data',
//   impl: ctx => ctx.vars.$model.databind()
// })

jb.component('field.keyboard-shortcut', { /* field.keyboardShortcut */
  type: 'feature',
  category: 'events',
  description: 'listen to events at the document level even when the component is not active',
  params: [
    {id: 'key', as: 'string', description: 'e.g. Alt+C'},
    {id: 'action', type: 'action', dynamic: true}
  ],
  impl: interactive( (ctx,{cmp},{key,action}) => {
        const elem = cmp.base.querySelector('input') || cmp.base
        if (elem.tabIndex === undefined) elem.tabIndex = -1
        jb.rx.Observable.fromEvent(elem, 'keydown')
            .takeUntil( cmp.destroyed )
            .subscribe(event=>{
              const keyStr = key.split('+').slice(1).join('+');
              const keyCode = keyStr.charCodeAt(0);
              if (key == 'Delete') keyCode = 46;

              const helper = (key.match('([A-Za-z]*)+') || ['',''])[1];
              if (helper == 'Ctrl' && !event.ctrlKey) return
              if (helper == 'Alt' && !event.altKey) return
              if (event.keyCode == keyCode || (event.key && event.key == keyStr))
                action();
        })
    })
})

jb.component('field.toolbar', { /* field.toolbar */
  type: 'feature',
  params: [
    {id: 'toolbar', type: 'control', mandatory: true, dynamic: true}
  ],
  impl: (ctx,toolbar) => ({ toolbar: toolbar() })
})

// ***** validation

jb.component('validation', { /* validation */
  type: 'feature',
  category: 'validation:100',
  params: [
    {id: 'validCondition', mandatory: true, as: 'boolean', dynamic: true},
    {id: 'errorMessage', mandatory: true, as: 'string', dynamic: true}
  ],
  impl: interactive((ctx,{cmp},{validCondition,errorMessage}) => {
          cmp.validations = (cmp.validations || []).concat([{validCondition,errorMessage}]);
          if (jb.ui.inPreview()) {
            const _ctx = ctx.setData(cmp.state.model);
            validCondition(_ctx)
            errorMessage(_ctx)
          }
      })
})

jb.component('field.title', {
  description: 'used to set table title in button and label',
  type: 'feature',
  category: 'table:80',
  params: [
    {id: 'title', as: 'string', dynamic: true, mandatory: true },
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