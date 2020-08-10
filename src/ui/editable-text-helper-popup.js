jb.component('editableText.helperPopup', {
  type: 'feature',
  params: [
    {id: 'control', type: 'control', dynamic: true, mandatory: true},
    {id: 'popupId', as: 'string', defaultValue: 'helper' },
    {id: 'popupStyle', type: 'dialog.style', dynamic: true, defaultValue: dialog.popup()},
    {id: 'showHelper', as: 'boolean', dynamic: true, defaultValue: notEmpty('%value%'), description: 'show/hide helper according to input content', type: 'boolean'},
    {id: 'autoOpen', as: 'boolean', type: 'boolean'},
    {id: 'onEnter', type: 'action', dynamic: true},
    {id: 'onEsc', type: 'action', dynamic: true}
  ],
  impl: features(
    userStateProp({
      id: 'input',
      phase: 20, // after 'databind'
      value: ({},{$state,$props}) => $state.input || { value: $props.databind , selectionStart: 0}
    }),
    method('openPopup', openDialog({
        vars: Var('input', ctx => ctx.exp('%$$state/input%')),
        style: call('popupStyle'), content: call('control'),
        features: [
          dialogFeature.maxZIndexOnClick(),
          dialogFeature.uniqueDialog('%$popupId%'),
          group.data(ctx => ctx.exp('%$input%'))
        ]
    })),
    method('closePopup', dialog.closeDialogById('%$popupId%')),
    method('refresh', action.runBEMethod(If(runActionOnItem('%$$state/input%', call('showHelper')), 'openPopup','closePopup'))),
    frontEnd.enrichUserEvent(({},{cmp}) => {
        const input = jb.ui.findIncludeSelf(cmp.base,'input')[0];
        return { input: { value: input.value, selectionStart: input.selectionStart}}
    }),
    method('onEnter', runActions(dialog.closeDialogById('%$popupId%'), call('onEnter'))),
    method('onEsc', runActions(dialog.closeDialogById('%$popupId%'), call('onEsc'))),
    frontEnd.selectionKeySourceService(),
    frontEnd.flow('%$cmp/selectionKeySource%', rx.filter('%keyCode% == 13'), editableText.updateState(), 
        rx.filter('%$showHelper()%'), sink.BEMethod('onEnter')),
    frontEnd.prop('keyUp', rx.pipe(source.frontEndEvent('keyup'), rx.delay(1))),
    frontEnd.flow('%$cmp/keyUp%', rx.filter(not(inGroup(list(13,27,37,38,40),'%keyCode%'))), editableText.updateState(),
      sink.BEMethod('refresh')),
    frontEnd.flow('%$cmp/keyUp%', rx.filter('%keyCode% == 27'), editableText.updateState(), sink.BEMethod('onEsc')),

    backEnd.onDestroy(action.runBEMethod('closePopup')),
    followUp.action(action.if('%$autoOpen%', action.runBEMethod('openPopup')))
  )
})

jb.component('editableText.updateState', {
  type: 'rx',
  impl: rx.innerPipe(frontEnd.addUserEvent(), rx.map('%$ev/input%'), frontEnd.updateState('input','%%'))
})

//   ctx =>({
//     onkeyup: true,
//     afterViewInit: cmp => {
//       const input = jb.ui.findIncludeSelf(cmp.base,'input')[0];
//       if (!input) return;
//       const {pipe,filter,subscribe,delay} = jb.callbag

//       cmp.openPopup = jb.ui.wrapWithLauchingElement( ctx2 =>
//             ctx2.run( openDialog({
//               id: ctx.params.popupId,
//               style: _ctx => ctx.params.popupStyle(_ctx),
//               content: _ctx => ctx.params.control(_ctx),
//               features: [
//                 dialogFeature.maxZIndexOnClick(),
//                 dialogFeature.uniqueDialog(ctx.params.popupId),
//               ]
//             }))
//           ,cmp.ctx, cmp.base);

//       cmp.popup = _ => jb.ui.dialogs.dialogs.filter(d=>d.id == ctx.params.popupId)[0];
//       cmp.closePopup = _ => cmp.popup() && cmp.popup().close();
//       cmp.refreshSuggestionPopupOpenClose = _ => {
//           const showHelper = ctx.params.showHelper(cmp.ctx.setData(input))
//           jb.log('helper-popup', ['refreshSuggestionPopupOpenClose', showHelper,input.value,cmp.ctx,cmp,ctx] );
//           if (!showHelper) {
//             jb.log('helper-popup', ['close popup', showHelper,input.value,cmp.ctx,cmp,ctx])
//             cmp.closePopup();
//           } else if (!cmp.popup()) {
//             jb.log('helper-popup', ['open popup', showHelper,input.value,cmp.ctx,cmp,ctx])
//             cmp.openPopup(cmp.ctx)
//           }
//       }

//       cmp.input = input;
//       const keyup = cmp.keyup = pipe(cmp.onkeyup,delay(1)) // delay to have input updated

//       cmp.selectionKeySource = jb.ui.upDownEnterEscObs(cmp)
//       pipe(cmp.selectionKeySource,filter(e=> e.keyCode == 13),subscribe(_=>{
//         const showHelper = ctx.params.showHelper(cmp.ctx.setData(input))
//         jb.log('helper-popup', ['onEnter', showHelper, input.value,cmp.ctx,cmp,ctx])
//         if (!showHelper)
//           ctx.params.onEnter(cmp.ctx)
//       }))
//       jb.subscribe(keyup,e=>e.keyCode == 27 && ctx.params.onEsc(cmp.ctx))
//       jb.subscribe(keyup,e=> [13,27,37,38,40].indexOf(e.keyCode) == -1 && cmp.refreshSuggestionPopupOpenClose())
//       jb.subscribe(keyup,e=>e.keyCode == 27 && cmp.closePopup())

//       if (ctx.params.autoOpen)
//         cmp.refreshSuggestionPopupOpenClose()
//     },
//     destroy: cmp => cmp.closePopup(),
//   })
// })
