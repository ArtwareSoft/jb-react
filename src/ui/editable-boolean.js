jb.type('editable-boolean.style');

jb.component('editable-boolean',{
  type: 'control', category: 'input:20',
  params: [
    { id: 'databind', as: 'ref'},
    { id: 'style', type: 'editable-boolean.style', defaultValue: { $: 'editable-boolean.checkbox' }, dynamic: true },
    { id: 'title', as: 'string' , dynamic: true },
    { id: 'textForTrue', as: 'string', defaultValue: 'yes' },
    { id: 'textForFalse', as: 'string', defaultValue: 'no' },
    { id: 'features', type: 'feature[]', dynamic: true },
  ],
  impl: (ctx) => {
  	return jb_ui.ctrl(ctx).jbExtend({
  		init: function(cmp) {
        cmp.toggle = () =>
          cmp.jbModel(!cmp.jbModel());

  			cmp.text = () => {
          if (!cmp.jbModel) return '';
          return cmp.jbModel() ? ctx.params.textForTrue : ctx.params.textForFalse;
        }
  		}
  	});
  }
})

jb.component('editable-boolean.keyboard-support', {
  type: 'feature',
  impl: ctx => ({
      jbEmitter: true,
      init: cmp => {
        if (!cmp.keydown) {
          var elem = cmp.elementRef.nativeElement.firstChild;
          if (!elem) return;
          //elem.setAttribute('tabIndex','0');
          cmp.keydown = jb_rx.Observable.fromEvent(elem, 'keydown')
              .takeUntil( cmp.jbEmitter.filter(x=>x =='destroy') );
        }          
        cmp.keydown.filter(e=> 
            e.keyCode == 37 || e.keyCode == 39)
          .subscribe(x=> {
            cmp.toggle();
            cmp.refreshMdl && cmp.refreshMdl();
          })
      },
    })
})
