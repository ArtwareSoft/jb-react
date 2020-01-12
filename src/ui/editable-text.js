jb.ns('editableText')
jb.ns('dialog')

jb.component('editable-text', { /* editableText */
  type: 'control',
  category: 'input:100,common:80',
  params: [
    {id: 'title', as: 'string', dynamic: true},
    {id: 'databind', as: 'ref', mandaroy: true, dynamic: true},
    {id: 'updateOnBlur', as: 'boolean', type: 'boolean'},
    {
      id: 'style',
      type: 'editable-text.style',
      defaultValue: editableText.mdcInput(),
      dynamic: true
    },
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('editable-text.x-button', { /* editableText.xButton */
  type: 'feature',
  impl: ctx =>({
    afterViewInit: cmp => cmp.cleanValue = () => { cmp.jbModel(''); cmp.refresh() },
    templateModifier: (vdom,cmp,{model}) => 
      jb.ui.h('div', {},[vdom].concat(model ? [jb.ui.h('button', { class: 'delete', onclick: 'cleanValue' } ,'×')]  : []) ),
    css: `>.delete {
          margin-left: -16px;
          float: right;
          cursor: pointer; font: 20px sans-serif;
          border: none; background: transparent; color: #000;
          text-shadow: 0 1px 0 #fff; opacity: .1;
      }
      { display : flex }
      >.delete:hover { opacity: .5 }`
  })
})

jb.component('editable-text.helper-popup', { /* editableText.helperPopup */
  type: 'feature',
  params: [
    {id: 'control', type: 'control', dynamic: true, mandatory: true},
    {id: 'popupId', as: 'string', mandatory: true},
    {
      id: 'popupStyle',
      type: 'dialog.style',
      dynamic: true,
      defaultValue: dialog.popup()
    },
    {
      id: 'showHelper',
      as: 'boolean',
      dynamic: true,
      defaultValue: notEmpty('%value%'),
      description: 'show/hide helper according to input content',
      type: 'boolean'
    },
    {id: 'autoOpen', as: 'boolean', type: 'boolean'},
    {id: 'onEnter', type: 'action', dynamic: true},
    {id: 'onEsc', type: 'action', dynamic: true}
  ],
  impl: ctx =>({
    onkeyup: true,
    onkeydown: true, // used for arrows
    extendCtx: (ctx,cmp) => ctx.setVars({selectionKeySource: {}}),

    afterViewInit: cmp => {
      var input = jb.ui.findIncludeSelf(cmp.base,'input')[0];
      if (!input) return;

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

      cmp.ctx.vars.selectionKeySource.input = input;
      const keyup = cmp.ctx.vars.selectionKeySource.keyup = cmp.onkeyup.delay(1); // delay to have input updated
      cmp.ctx.vars.selectionKeySource.keydown = cmp.onkeydown;
      cmp.ctx.vars.selectionKeySource.cmp = cmp;

      jb.delay(500).then(_=>{
        cmp.onkeydown.filter(e=> e.keyCode == 13).subscribe(_=>{
          const showHelper = ctx.params.showHelper(cmp.ctx.setData(input))
          jb.log('helper-popup', ['onEnter', showHelper, input.value,cmp.ctx,cmp,ctx])
          if (!showHelper)
            ctx.params.onEnter(cmp.ctx)
        });
        cmp.onkeydown.filter(e=> e.keyCode == 27 ).subscribe(_=> ctx.params.onEsc(cmp.ctx));
      })

      keyup.filter(e=> [13,27,37,38,40].indexOf(e.keyCode) == -1)
        .subscribe(_=>cmp.refreshSuggestionPopupOpenClose())

      keyup.filter(e=>e.keyCode == 27) // ESC
          .subscribe(_=>cmp.closePopup())
      if (ctx.params.autoOpen)
        cmp.refreshSuggestionPopupOpenClose()
    },
    destroy: cmp =>
        cmp.closePopup(),
  })
})
