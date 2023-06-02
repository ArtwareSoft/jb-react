extension('ui', 'field', {
  initExtension: () => ({field_id_counter : 0 }),
  writeFieldData(ctx,cmp,value,oneWay) {
    if (jb.val(ctx.vars.$model.databind(cmp.ctx)) == value) return
    jb.db.writeValue(ctx.vars.$model.databind(cmp.ctx),value,ctx)
    jb.ui.checkValidationError(cmp,value,ctx)
    cmp.hasBEMethod('onValueChange') && cmp.runBEMethod('onValueChange',value,ctx.vars)
    !oneWay && cmp.refresh({},{srcCtx: ctx.cmpCtx})
  },
  checkValidationError(cmp,val,ctx) {
    const err = validationError()
    if (cmp.state.error != err) {
      jb.log('field validation set error state',{cmp,err})
      cmp.refresh({valid: !err, error:err}, {srcCtx: ctx.cmpCtx})
    }
  
    function validationError() {
      if (!cmp.validations) return
      const ctx = cmp.ctx.setData(val)
      const err = (cmp.validations || [])
        .filter(validator=>!validator.validCondition(ctx))
        .map(validator=>validator.errorMessage(ctx))[0]
      if (ctx.exp('%$formContainer%'))
        ctx.run(writeValue('%$formContainer/err%',err))
      return err
    }
  },
  checkFormValidation(elem) {
    jb.ui.find(elem,'[jb-ctx]').map(el=>el._component).filter(cmp => cmp && cmp.validations).forEach(cmp => 
      jb.ui.checkValidationError(cmp,jb.val(cmp.ctx.vars.$model.databind(cmp.ctx)), cmp.ctx))
  },
  fieldTitle(cmp,fieldOrCtrl,h) {
    let field = fieldOrCtrl.field && fieldOrCtrl.field() || fieldOrCtrl
    field = typeof field === 'function' ? field() : field
    if (field.titleCtrl) {
      const ctx = cmp.ctx.setData(field).setVars({input: cmp.ctx.data})
      const jbComp = field.titleCtrl(ctx);
      return jbComp && h(jbComp,{'jb-ctx': jb.ui.preserveCtx(ctx) })
    }
    return field.title(cmp.ctx)
  },
  preserveFieldCtxWithItem(field,item) {
    const ctx = jb.ctxDictionary[field.ctxId]
    return ctx && jb.ui.preserveCtx(ctx.setData(item))
  }
})

component('field.databind', {
  type: 'feature',
  category: 'field:0',
  params: [
    {id: 'debounceTime', as: 'number', defaultValue: 0},
    {id: 'oneWay', as: 'boolean', type: 'boolean'}
  ],
  impl: features(
    If(
      '%$oneWay%',
      calcProp({id: 'databind', value: '%$$model/databind()%', defaultValue: ''}),
      watchAndCalcModelProp({prop: 'databind', allowSelfRefresh: true, defaultValue: ''})
    ),
    calcProp('title'),
    calcProp('fieldId', () => jb.ui.field_id_counter++),
    method('writeFieldValue', (ctx,{cmp},{oneWay}) => jb.ui.writeFieldData(ctx,cmp,ctx.data,oneWay)),
    method('onblurHandler', (ctx,{cmp, ev},{oneWay}) => jb.ui.writeFieldData(ctx,cmp,ev.value,oneWay)),
    method('onchangeHandler', (ctx,{$model, cmp, ev},{oneWay}) => !$model.updateOnBlur && jb.ui.writeFieldData(ctx,cmp,ev.value,oneWay)),
    method('onkeyupHandler', (ctx,{$model, cmp, ev},{oneWay}) => !$model.updateOnBlur && jb.ui.writeFieldData(ctx,cmp,ev.value,oneWay)),
    method('onkeydownHandler', (ctx,{$model, cmp, ev},{oneWay}) => !$model.updateOnBlur && jb.ui.writeFieldData(ctx,cmp,ev.value,oneWay)),
    feature.byCondition('%$$dialog%', feature.initValue('%$$dialog/hasFields%', true))
  )
})

component('field.onChange', {
  type: 'feature',
  category: 'field:100',
  description: 'on picklist selection, text or boolean value change',
  params: [
    {id: 'action', type: 'action', dynamic: true}
  ],
  impl: followUp.onDataChange({ref: '%$$model/databind%', action: call('action') })
})

component('field.databindText', {
  type: 'feature',
  category: 'field:0',
  params: [
    {id: 'debounceTime', as: 'number', defaultValue: 0},
    {id: 'oneWay', type: 'boolean', as: 'boolean', defaultValue: true}
  ],
  impl: field.databind('%$debounceTime%', '%$oneWay%')
})

// jb.component('field.keyboardShortcut', {
//   type: 'feature',
//   category: 'events',
//   description: 'listen to events at the document level even when the component is not active',
//   params: [
//     {id: 'key', as: 'string', description: 'e.g. Alt+C'},
//     {id: 'action', type: 'action', dynamic: true}
//   ],
//   frontEnd.init((ctx,{cmp},{key,action}) => {
//         const elem = cmp.base.querySelector('input') || cmp.base
//         if (elem.tabIndex === undefined) elem.tabIndex = -1
//         jb.utils.subscribe(jb.ui.fromEvent(cmp,'keydown',elem),event=>{
//               const keyStr = key.split('+').slice(1).join('+');
//               const keyCode = keyStr.charCodeAt(0);
//               if (key == 'Delete') keyCode = 46;

//               const helper = (key.match('([A-Za-z]*)+') || ['',''])[1];
//               if (helper == 'Ctrl' && !event.ctrlKey) return
//               if (helper == 'Alt' && !event.altKey) return
//               if (event.keyCode == keyCode || (event.key && event.key == keyStr))
//                 action();
//         })
//     }
//   )
// })

// ***** validation

component('validation', {
  type: 'feature',
  category: 'validation:100',
  params: [
    {id: 'validCondition', mandatory: true, as: 'boolean', dynamic: true, type: 'boolean'},
    {id: 'errorMessage', mandatory: true, as: 'string', dynamic: true}
  ],
  impl: (ctx,validCondition,errorMessage) => ({validations: {validCondition, errorMessage }})
})

component('field.title', {
  description: 'used to set table title in button and label',
  type: 'feature',
  category: 'table:80',
  params: [
    {id: 'title', as: 'string', dynamic: true, mandatory: true}
  ],
  impl: (ctx,title) => ({
      enrichField: field => field.title = ctx => title(ctx)
  })
})

component('field.titleCtrl', {
  description: 'title as control, buttons are usefull',
  type: 'feature',
  category: 'table:80',
  params: [
    {id: 'titleCtrl', type: 'control', mandatory: true, dynamic: true, templateValue: button({title: '%title%', style: button.href()})}
  ],
  impl: (ctx,titleCtrl) => ({
      enrichField: field => field.titleCtrl = ctx => titleCtrl(ctx)
  })
})

component('field.columnWidth', {
  description: 'used in itemlist fields',
  type: 'feature',
  category: 'table:80',
  params: [
    {id: 'width', as: 'number', mandatory: true}
  ],
  impl: (ctx,width) => ({
      enrichField: field => field.width = width
  })
})