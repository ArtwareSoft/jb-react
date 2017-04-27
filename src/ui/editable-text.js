jb.type('editable-text.style');

jb.component('editable-text', {
  type: 'control', category: 'input:100,common:80',
  params: [
    { id: 'title', as: 'string' , dynamic: true },
    { id: 'databind', as: 'ref'},
    { id: 'updateOnBlur', as: 'boolean', type: 'boolean' },
    { id: 'style', type: 'editable-text.style', defaultValue: { $: 'editable-text.mdl-input' }, dynamic: true },
    { id: 'features', type: 'feature[]', dynamic: true },
  ],
  impl: ctx => 
    jb.ui.ctrl(ctx)
});

jb.component('editable-text.input', {
  type: 'editable-text.style',
  impl :{$: 'custom-style', 
      features :{$: 'field.databind' },
      template: (cmp,state) => 
      jb.ui.h('input', { 
        value: state.jbModel(), 
        onchange: e => state.jbModel(e.target.value), 
        onkeyup: e => state.jbModel(e.target.value,'keyup')  }),
    css: '{height: 16px}'
  }
})

jb.component('editable-text.textarea', {
	type: 'editable-text.style',
	impl :{$: 'customStyle', 
      features :{$: 'field.databind' },
      template: (cmp,state) => jb.ui.h('textarea', { 
        value: state.jbModel(), onchange: e => state.jbModel(e.target.value), onkeyup: e => state.jbModel(e.target.value,'keyup')  }),
	}
})

jb.component('editable-text.x-button', {
  type: 'feature',
  impl : ctx =>({
    templateModifier: (vdom,cmp,state) => 
      jb.ui.h('div', {},[vdom].concat(state.jbModel() ? [jb.ui.h('button', { class: 'delete', onclick: e => state.jbModel(null)} , '✗')]  : []) ),
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

jb.component('editable-text.helper-popup', {
  type: 'feature',
  params: [
    { id: 'control', type: 'control', dynamic: true, essential: true },
    { id: 'popupId', as: 'string', essential: true },
    { id: 'popupStyle', type: 'dialog.style', dynamic: true, defaultValue :{$: 'dialog.popup' } },
  ],
  impl : ctx =>({
    extendCtx: (ctx,cmp) => 
      ctx.setVars({selectionKeySource: {}}),
    afterViewInit: cmp => {
      var input = $(cmp.base).findIncludeSelf('input')[0];
      if (!input) return;

      cmp.openPopup = jb_ui.wrapWithLauchingElement( ctx2 =>
            ctx2.run( {$: 'openDialog',
              id: ctx.params.popupId,
              style: _ctx => ctx.params.popupStyle(_ctx),
              content: _ctx => ctx.params.control(_ctx),
            })
          , cmp.ctx, input );

      cmp.popup = _ =>
        jbart.jb_dialogs.dialogs.filter(d=>d.id == ctx.params.popupId)[0];
      cmp.closePopup = _ =>
        cmp.popup() && cmp.popup().close();


      var keydown = jb_rx.Observable.fromEvent(input, 'keydown')
              .takeUntil( cmp.destroyed );

      cmp.ctx.vars.selectionKeySource.keydown = keydown.filter(e=>  [13,27,37,38,39,40].indexOf(e.keyCode) != -1);

      keydown.filter(e=> [13,27,37,38,39,40].indexOf(e.keyCode) == -1)
        .delay(1).subscribe(_=>{
        if (input.value == '')
          cmp.closePopup();
        else if (!cmp.popup())
          cmp.openPopup()
      })

      keydown.filter(e=>e.keyCode == 27) // ESC
          .subscribe(_=>cmp.closePopup())
    },
    destroy: cmp => 
        cmp.closePopup(),
    jbEmitter: true,
  })
})
