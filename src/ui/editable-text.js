jb.ns('editableText')
jb.ns('dialog')

jb.component('editableText', {
  type: 'control',
  category: 'input:100,common:80',
  params: [
    {id: 'title', as: 'string', dynamic: true},
    {id: 'databind', as: 'ref', mandaroy: true, dynamic: true},
    {id: 'updateOnBlur', as: 'boolean', type: 'boolean'},
    {id: 'style', type: 'editable-text.style', defaultValue: editableText.mdcInput(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('editableText.xButton', {
  type: 'feature',
  impl: features(
    defHandler('cleanValue', writeValue('%$$model/databind%', '')),
    templateModifier(
        ({},{vdom,databind}) =>
      jb.ui.h('div', {},[vdom,
          ...(databind ? [jb.ui.h('button', { class: 'delete', onclick: 'cleanValue' } ,'×')]  : [])]
    )
      ),
    css(
        `>.delete {
          margin-left: -16px;
          float: right;
          cursor: pointer; font: 20px sans-serif;
          border: none; background: transparent; color: #000;
          text-shadow: 0 1px 0 #fff; opacity: .1;
      }
      { display : flex }
      >.delete:hover { opacity: .5 }`
      )
  )
})

jb.component('editableText.helperPopup', {
  type: 'feature',
  params: [
    {id: 'control', type: 'control', dynamic: true, mandatory: true},
    {id: 'popupId', as: 'string', mandatory: true},
    {id: 'popupStyle', type: 'dialog.style', dynamic: true, defaultValue: dialog.popup()},
    {id: 'showHelper', as: 'boolean', dynamic: true, defaultValue: notEmpty('%value%'), description: 'show/hide helper according to input content', type: 'boolean'},
    {id: 'autoOpen', as: 'boolean', type: 'boolean'},
    {id: 'onEnter', type: 'action', dynamic: true},
    {id: 'onEsc', type: 'action', dynamic: true}
  ],
  impl: ctx =>({
    onkeyup: true,
    afterViewInit: cmp => {
      const input = jb.ui.findIncludeSelf(cmp.base,'input')[0];
      if (!input) return;
      const {pipe,filter,subscribe,delay} = jb.callbag

      cmp.openPopup = jb.ui.wrapWithLauchingElement( ctx2 =>
            ctx2.run( openDialog({
              id: ctx.params.popupId,
              style: _ctx => ctx.params.popupStyle(_ctx),
              content: _ctx => ctx.params.control(_ctx),
              features: [
                dialogFeature.maxZIndexOnClick(),
                dialogFeature.uniqueDialog(ctx.params.popupId),
              ]
            }))
          ,cmp.ctx, cmp.base);

      cmp.popup = _ => jb.ui.dialogs.dialogs.filter(d=>d.id == ctx.params.popupId)[0];
      cmp.closePopup = _ => cmp.popup() && cmp.popup().close();
      cmp.refreshSuggestionPopupOpenClose = _ => {
          const showHelper = ctx.params.showHelper(cmp.ctx.setData(input))
          jb.log('helper-popup', ['refreshSuggestionPopupOpenClose', showHelper,input.value,cmp.ctx,cmp,ctx] );
          if (!showHelper) {
            jb.log('helper-popup', ['close popup', showHelper,input.value,cmp.ctx,cmp,ctx])
            cmp.closePopup();
          } else if (!cmp.popup()) {
            jb.log('helper-popup', ['open popup', showHelper,input.value,cmp.ctx,cmp,ctx])
            cmp.openPopup(cmp.ctx)
          }
      }

      cmp.selectionKeySource = true
      cmp.input = input;
      const keyup = cmp.keyup = pipe(cmp.onkeyup,delay(1)) // delay to have input updated

      cmp.onkeydown = jb.ui.upDownEnterEscObs(cmp)
      pipe(cmp.onkeydown,filter(e=> e.keyCode == 13),subscribe(_=>{
        const showHelper = ctx.params.showHelper(cmp.ctx.setData(input))
        jb.log('helper-popup', ['onEnter', showHelper, input.value,cmp.ctx,cmp,ctx])
        if (!showHelper)
          ctx.params.onEnter(cmp.ctx)
      }))
      jb.subscribe(keyup,e=>e.keyCode == 27 && ctx.params.onEsc(cmp.ctx))
      jb.subscribe(keyup,e=> [13,27,37,38,40].indexOf(e.keyCode) == -1 && cmp.refreshSuggestionPopupOpenClose())
      jb.subscribe(keyup,e=>e.keyCode == 27 && cmp.closePopup())

      if (ctx.params.autoOpen)
        cmp.refreshSuggestionPopupOpenClose()
    },
    destroy: cmp => cmp.closePopup(),
  })
})
