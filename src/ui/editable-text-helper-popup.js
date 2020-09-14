jb.component('editableText.picklistHelper', {
  type: 'feature',
  params: [
    {id: 'options', type: 'picklist.options', dynamic: true, mandatory: true},
    {id: 'picklistStyle', type: 'picklist.style', dynamic: true, defaultValue: picklist.labelList()},
    {id: 'showHelper', as: 'boolean', dynamic: true, defaultValue: notEmpty('%value%'), description: 'show/hide helper according to input content', type: 'boolean'},
    {id: 'autoOpen', as: 'boolean', type: 'boolean'},
    {id: 'onEnter', type: 'action', dynamic: true, defaultValue: writeValue('%$$model/databind%','%$selectedOption%')},
    {id: 'onEsc', type: 'action', dynamic: true},
    {id: 'popupId', as: 'string', defaultValue: 'editableTextHelper'}
  ],
  impl: features(
    variable({name: 'selectedOption', watchable: true}),
    variable({name: 'watchableInput', watchable: true, value: obj(prop('value','')) }),
    variable('helperCmp', '%$cmp%'),
    method('openPopup', openDialog({
        style: dialog.popup(), content: picklist({
          options: pipeline('%$watchableInput%',call('options')),
          databind: '%$selectedOption%',
          features: watchRef('%$watchableInput%'),
          style: call('picklistStyle')
        }),
        features: [
          dialogFeature.maxZIndexOnClick(),
          dialogFeature.uniqueDialog('%$popupId%'),
        ]
    })),
    method('closePopup', dialog.closeDialogById('%$popupId%')),
    method('refresh', runActions(
      writeValue('%$watchableInput%','%%'),
      If(call('showHelper'),
        If(not(dialog.isOpen('%$popupId%')), action.runBEMethod('openPopup')),
        action.runBEMethod('closePopup')
      )
    )),
    frontEnd.enrichUserEvent(({},{cmp}) => {
        const input = jb.ui.findIncludeSelf(cmp.base,'input,textarea')[0];
        return { input: { value: input.value, selectionStart: input.selectionStart}}
    }),
    method('onEnter', action.if(ctx => ctx.run(dialog.isOpen('%$popupId%')), runActions(call('onEnter'),dialog.closeDialogById('%$popupId%')))),
    method('onEsc', action.if(dialog.isOpen('%$popupId%'), runActions(call('onEsc'),dialog.closeDialogById('%$popupId%')))),
    feature.serviceRegistey(),
    frontEnd.selectionKeySourceService(),
    frontEnd.prop('keyUp', rx.pipe(source.frontEndEvent('keyup'), rx.delay(1))),
    frontEnd.flow('%$cmp/keyUp%', rx.log('editableTextHelper keyup'), rx.filter('%keyCode% == 13'), editableText.addUserEvent(), 
      sink.BEMethod('onEnter')),
    frontEnd.flow('%$cmp/keyUp%', rx.filter(not(inGroup(list(13,27,38,40),'%keyCode%'))), editableText.addUserEvent(),
      sink.BEMethod('refresh')),
    frontEnd.flow('%$cmp/keyUp%', rx.filter('%keyCode% == 27'), editableText.addUserEvent(), sink.BEMethod('onEsc')),

    onDestroy(action.runBEMethod('closePopup')),
    followUp.action(action.if('%$autoOpen%', runActions(
      writeValue('%$watchableInput%',obj(prop('value','%$helperCmp/renderProps/databind%'))), action.runBEMethod('openPopup'))))
  )
})

jb.component('editableText.setInputState', {
  type: 'action',
  params: [
    {id: 'newVal', as: 'string' },
    {id: 'assumedVal', description: 'contains value and selectionStart, the action is not performed if the not in this state'},
    {id: 'selectionStart', as: 'number'},
    {id: 'cmp', defaultValue: '%$cmp%'},
  ],
  impl: action.applyDeltaToCmp((ctx,{cmp},{newVal,selectionStart,assumedVal}) => {
    jb.log('dome set input create userRequest',{cmp,newVal,ctx})
    return {attributes: { $__input: JSON.stringify({ assumedVal: assumedVal, newVal,selectionStart })}}
  } ,'%$cmp/cmpId%')
})

jb.component('editableText.addUserEvent', {
  type: 'rx',
  impl: rx.innerPipe(frontEnd.addUserEvent(), rx.map('%$ev/input%'))
})

jb.component('editableText.helperPopup', {
  type: 'feature',
  params: [
    {id: 'control', type: 'control', dynamic: true, mandatory: true},
    {id: 'popupStyle', type: 'dialog.style', dynamic: true, defaultValue: dialog.popup()},
    {id: 'showHelper', as: 'boolean', dynamic: true, defaultValue: notEmpty('%value%'), description: 'show/hide helper according to input content', type: 'boolean'},
    {id: 'autoOpen', as: 'boolean', type: 'boolean'},
    {id: 'onEnter', type: 'action', dynamic: true},
    {id: 'onEsc', type: 'action', dynamic: true},
    {id: 'popupId', as: 'string', defaultValue: 'editableTextHelper' },
  ],
  impl: features(
    method('openPopup', openDialog({
      style: call('popupStyle'), content: call('control'),
      features: [
        dialogFeature.maxZIndexOnClick(),
        dialogFeature.uniqueDialog('%$popupId%'),
        group.data(firstSucceeding('%$ev/input%', obj(prop('value','%$helperCmp/renderProps/databind%')))),
      ]
    })),
    variable('helperCmp', '%$cmp%'),
    method('closePopup', dialog.closeDialogById('%$popupId%')),
    method('refresh', If(call('showHelper'),
      If(dialog.isOpen('%$popupId%'), touch('%$watchableInput%'), action.runBEMethod('openPopup')),
      action.runBEMethod('closePopup')
    )),
    frontEnd.enrichUserEvent(({},{cmp}) => {
        const input = jb.ui.findIncludeSelf(cmp.base,'input,textarea')[0];
        return { input: { value: input.value, selectionStart: input.selectionStart}}
    }),
    method('onEnter', action.if(dialog.isOpen('%$popupId%'), runActions(call('onEnter'),dialog.closeDialogById('%$popupId%')))),
    method('onEsc', action.if(dialog.isOpen('%$popupId%'), runActions(call('onEsc'),dialog.closeDialogById('%$popupId%')))),
    frontEnd.selectionKeySourceService(),
    frontEnd.prop('keyUp', rx.pipe(source.frontEndEvent('keyup'), rx.delay(1))),
    frontEnd.flow('%$cmp/keyUp%', rx.log('editableTextHelper keyup'), rx.filter('%keyCode% == 13'), 
      editableText.addUserEvent(), sink.BEMethod('onEnter')),
    frontEnd.flow('%$cmp/keyUp%', rx.filter(not(inGroup(list(13,27,38,40),'%keyCode%'))), editableText.addUserEvent(),
      sink.BEMethod('refresh')),
    frontEnd.flow('%$cmp/keyUp%', rx.filter('%keyCode% == 27'), editableText.addUserEvent(), sink.BEMethod('onEsc')),

    onDestroy(action.runBEMethod('closePopup')),
    followUp.action(action.if('%$autoOpen%', action.runBEMethod('openPopup')))
 )
})