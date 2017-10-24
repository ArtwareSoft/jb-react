jb.component('open-dialog', {
	type: 'action',
	params: [
		{ id: 'id', as: 'string' },
		{ id: 'style', type: 'dialog.style', dynamic: true, defaultValue: { $:'dialog.default' } },
		{ id: 'content', type: 'control', dynamic: true, defaultValue :{$: 'group'}, forceDefaultCreation: true },
		{ id: 'menu', type: 'control', dynamic: true },
		{ id: 'title', as: 'renderable', dynamic: true  },
		{ id: 'onOK', type: 'action', dynamic: true },
		{ id: 'modal', type: 'boolean', as: 'boolean' },
		{ id: 'features', type: 'dialog-feature[]', dynamic: true }
	],
	impl: function(context,id) {
		var modal = context.params.modal;
		var dialog = {
			id: id,
      instanceId: context.id,
			modal: modal,
			em: new jb.rx.Subject(),
		};

		var ctx = context.setVars({
			$dialog: dialog,
			formContainer: { err: ''}
		});
		dialog.comp = jb.ui.ctrl(ctx,{
			beforeInit: cmp => {
				cmp.dialog = dialog;

				cmp.state.title = ctx.params.title(ctx);
				try {
					cmp.state.contentComp = ctx.params.content(cmp.ctx).reactComp();
					cmp.hasMenu = !!ctx.params.menu.profile;
					if (cmp.hasMenu)
						cmp.menuComp = ctx.params.menu(cmp.ctx).reactComp();
				} catch (e) {
					jb.logException(e,'dialog');
				}
				dialog.onOK = ctx2 =>
					context.params.onOK(cmp.ctx.extendVars(ctx2));
				cmp.dialogClose = args =>
					dialog.close(args);
				cmp.recalcTitle = (e,srcCtx) =>
					jb.ui.setState(cmp,{title: ctx.params.title(ctx)},e,srcCtx)
			},
			afterViewInit: cmp => {
				cmp.dialog.el = cmp.base;
				cmp.dialog.el.style.zIndex = 100;
			},
		}).reactComp();

		if (!context.probe)
			jb.ui.dialogs.addDialog(dialog,ctx);
		else
			jb.studio.probeResEl = jb.ui.render(jb.ui.h(dialog.comp), jb.studio.probeEl || document.createElement('div'), jb.studio.probeResEl);

		return dialog;
	}
})

jb.component('dialog.close-containing-popup', {
	type: 'action',
	params: [
		{ id: 'OK', type: 'boolean', as: 'boolean', defaultValue: true}
	],
	impl: (context,OK) =>
		context.vars.$dialog && context.vars.$dialog.close({OK:OK})
})

jb.component('dialog.default', {
	type: 'dialog.style',
	impl :{$: 'custom-style',
		template: (cmp,state,h) => h('div',{ class: 'jb-dialog jb-default-dialog'},[
			h('div',{class: 'dialog-title'},state.title),
			h('button',{class: 'dialog-close', onclick:
				_=> cmp.dialogClose() },'×'),
			h(state.contentComp),
		]),
		features:{$:'dialog-feature.drag-title'}
	}
})

jb.component('dialog.popup', {
  type: 'dialog.style',
  impl :{$: 'custom-style',
		template: (cmp,state,h) => h('div',{ class: 'jb-dialog jb-popup'},[
			h(state.contentComp),
		]),
      features: [
       { $: 'dialog-feature.max-zIndex-on-click' },
       { $: 'dialog-feature.close-when-clicking-outside' },
       { $: 'dialog-feature.css-class-on-launching-element' },
       { $: 'dialog-feature.near-launcher-position' }
      ],
      css: '{ position: absolute; background: white; box-shadow: 2px 2px 3px #d5d5d5; padding: 3px 0; border: 1px solid rgb(213, 213, 213) }'
  }
})


jb.component('dialog-feature.unique-dialog', {
	type: 'dialog-feature',
	params: [
		{ id: 'id', as: 'string' },
		{ id: 'remeberLastLocation', type: 'boolean', as: 'boolean' }
	],
	impl: function(context,id,remeberLastLocation) {
		if (!id) return;
		var dialog = context.vars.$dialog;
		dialog.id = id;
		dialog.em.filter(e=>
			e.type == 'new-dialog')
			.subscribe(e=> {
				if (e.dialog != dialog && e.dialog.id == id )
					dialog.close();
		})
	}
})

jb.component('dialog-feature.keyboard-shortcut', {
  type: 'dialog-feature',
  params: [
    { id: 'shortcut', as: 'string', description: 'Ctrl+C or Alt+V' },
    { id: 'action', type: 'action', dynamic: true },
  ],
  impl: (ctx,key,action) => ({
  	  onkeydown : true,
      afterViewInit: cmp=> {
		var dialog = ctx.vars.$dialog;
		dialog.applyShortcut = e=> {
			var key = ctx.params.shortcut;
			if (!key) return;
			if (key.indexOf('-') > 0)
				key = key.replace(/-/,'+');
            var keyCode = key.split('+').pop().charCodeAt(0);
            if (key == 'Delete') keyCode = 46;
            if (key.match(/\+[Uu]p$/)) keyCode = 38;
            if (key.match(/\+[Dd]own$/)) keyCode = 40;
            if (key.match(/\+Right$/)) keyCode = 39;
            if (key.match(/\+Left$/)) keyCode = 37;

            if (key.match(/^[Cc]trl/) && !e.ctrlKey) return;
            if (key.match(/^[Aa]lt/) && !e.altKey) return;
            if (e.keyCode == keyCode)
                return ctx.params.action();
		};

	    cmp.onkeydown.filter(e=> e.keyCode != 17 && e.keyCode != 18) // ctrl ot alt alone
   	  		.subscribe(e=>
   	  			dialog.applyShortcut(e))

	}})
})

jb.component('dialog-feature.near-launcher-position', {
	type: 'dialog-feature',
	params: [
		{ id: 'offsetLeft', as: 'number', defaultValue: 0 },
		{ id: 'offsetTop', as: 'number' , defaultValue: 0 },
		{ id: 'rightSide', as: 'boolean' },
	],
	impl: function(context,offsetLeft,offsetTop,rightSide) {
		return {
			afterViewInit: function(cmp) {
				offsetLeft = offsetLeft || 0; offsetTop = offsetTop || 0;
				if (!context.vars.$launchingElement)
					return console.log('no launcher for dialog');
				var control = context.vars.$launchingElement.el;
				var pos = jb.ui.offset(control);
				var jbDialog = jb.ui.findIncludeSelf(cmp.base,'.jb-dialog')[0];
				offsetLeft += rightSide ? jb.ui.outerWidth(control) : 0;
				var fixedPosition = fixDialogOverflow(control,jbDialog,offsetLeft,offsetTop);
        jbDialog.style.display = 'block';
        jbDialog.style.left = (fixedPosition ? fixedPosition.left : pos.left + offsetLeft) + 'px';
        jbDialog.style.top = (fixedPosition ? fixedPosition.top : pos.top + jb.ui.outerHeight(control) + offsetTop) + 'px';
			}
		}

		function fixDialogOverflow(control,dialog,offsetLeft,offsetTop) {
			var padding = 2,top,left,control_offset = jb.ui.offset(control), dialog_height = jb.ui.outerHeight(dialog), dialog_width = jb.ui.outerWidth(dialog);
			if (control_offset.top > dialog_height && control_offset.top + dialog_height + padding + (offsetTop||0) > window.innerHeight + window.pageYOffset)
				top = control_offset.top - dialog_height;
			if (control_offset.left > dialog_width && control_offset.left + dialog_width + padding + (offsetLeft||0) > window.innerWidth + window.pageXOffset)
				left = control_offset.left - dialog_width;
			if (top || left)
				return { top: top || control_offset.top , left: left || control_offset.left}
		}
	}
})

jb.component('dialog-feature.onClose', {
	type: 'dialog-feature',
	params: [
		{ id: 'action', type: 'action', dynamic: true}
	],
	impl: (ctx,action) =>
		ctx.vars.$dialog.em
			.filter(e => e.type == 'close')
			.take(1)
			.subscribe(e=>
				action(ctx.setData(e.OK)))
})

jb.component('dialog-feature.close-when-clicking-outside', {
	type: 'dialog-feature',
	params: [
		{ id: 'delay', as: 'number', defaultValue: 100 }
	],
	impl: function(context,delay) {
		var dialog = context.vars.$dialog;
		dialog.isPopup = true;
		jb.delay(10).then(() =>  { // delay - close older before
			var clickoutEm = jb.rx.Observable.fromEvent(document, 'mousedown');
			if (jb.studio.previewWindow)
				clickoutEm = clickoutEm.merge(jb.rx.Observable.fromEvent(
			      				(jb.studio.previewWindow || {}).document, 'mousedown'));

		 	clickoutEm.filter(e => jb.ui.closest(e.target,'.jb-dialog') == null)
   				.takeUntil(dialog.em.filter(e => e.type == 'close'))
   				.take(1).delay(delay).subscribe(()=>
		  			dialog.close())
  		})
	}
})

jb.component('dialog.close-dialog', {
	type: 'action',
	params: [
		{ id: 'id', as: 'string' },
		{ id: 'delay', as: 'number', defaultValue: 200 },
	],
	impl: (ctx,id,delay) =>
		jb.ui.dialogs.dialogs.filter(d=>d.id == id)
  			.forEach(d=>jb.delay(delay).then(d.close()))
})

jb.component('dialog.close-all-popups', {
	type: 'action',
	impl: ctx =>
		jb.ui.dialogs.dialogs.filter(d=>d.isPopup)
  			.forEach(d=>d.close())
})

jb.component('dialog.close-all', {
	type: 'action',
	impl: ctx =>
		jb.ui.dialogs.dialogs.forEach(d=>d.close())
})

jb.component('dialog-feature.auto-focus-on-first-input', {
	type: 'dialog-feature',
	params: [
		{ id: 'selectText', as: 'boolean' }
	],
	impl: (ctx,selectText) => ({
		afterViewInit: cmp => {
			jb.delay(1).then(_=> {
				var elem = ctx.vars.$dialog.el.querySelector('input,textarea,select');
				if (elem)
					jb.ui.focus(elem, 'dialog-feature.auto-focus-on-first-input',ctx);
				if (selectText)
					elem.select();
			})
		}
	})
})

jb.component('dialog-feature.css-class-on-launching-element', {
	type: 'dialog-feature',
	impl: context => ({
		afterViewInit: cmp => {
			var dialog = context.vars.$dialog;
			var control = context.vars.$launchingElement.el;
			jb.ui.addClass(control,'dialog-open');
			dialog.em.filter(e=>
				e.type == 'close')
				.take(1)
				.subscribe(()=>
          jb.ui.removeClass(control,'dialog-open'))
		}
	})
})

jb.component('dialog-feature.max-zIndex-on-click', {
	type: 'dialog-feature',
	params: [
		{ id: 'minZIndex', as: 'number'}
	],
	impl: function(context,minZIndex) {
		var dialog = context.vars.$dialog;

		return ({
			afterViewInit: cmp => {
				setAsMaxZIndex();
				dialog.el.onmousedown = setAsMaxZIndex;
			}
		})

		function setAsMaxZIndex() {
			var maxIndex = jb.ui.dialogs.dialogs.reduce(function(max,d) {
				return Math.max(max,(d.el && parseInt(d.el.style.zIndex || 100)+1))
			}, minZIndex || 100)
			dialog.el.style.zIndex = maxIndex;
		}
	}
})

jb.component('dialog-feature.drag-title', {
	type: 'dialog-feature',
	params: [
		{ id: 'id', as: 'string' }
	],
	impl: function(context, id) {
		var dialog = context.vars.$dialog;
		return {
		       css: '>.dialog-title { cursor: pointer }',
		       afterViewInit: function(cmp) {
		       	  var titleElem = cmp.base.querySelector('.dialog-title');
		       	  cmp.mousedownEm = jb.rx.Observable.fromEvent(titleElem, 'mousedown')
		       	  	.takeUntil( cmp.destroyed );

				  if (id && sessionStorage.getItem(id)) {
						var pos = JSON.parse(sessionStorage.getItem(id));
					    dialog.el.style.top  = pos.top  + 'px';
					    dialog.el.style.left = pos.left + 'px';
				  }

				  var mouseUpEm = jb.rx.Observable.fromEvent(document, 'mouseup').takeUntil( cmp.destroyed );
				  var mouseMoveEm = jb.rx.Observable.fromEvent(document, 'mousemove').takeUntil( cmp.destroyed );

				  if (jb.studio.previewWindow) {
				  	mouseUpEm = mouseUpEm.merge(jb.rx.Observable.fromEvent(jb.studio.previewWindow.document, 'mouseup'))
				  		.takeUntil( cmp.destroyed );
				  	mouseMoveEm = mouseMoveEm.merge(jb.rx.Observable.fromEvent(jb.studio.previewWindow.document, 'mousemove'))
				  		.takeUntil( cmp.destroyed );
				  }

				  var mousedrag = cmp.mousedownEm
				  		.do(e =>
				  			e.preventDefault())
				  		.map(e =>  ({
				          left: e.clientX - dialog.el.getBoundingClientRect().left,
				          top:  e.clientY - dialog.el.getBoundingClientRect().top
				        }))
				      	.flatMap(imageOffset =>
			      			 mouseMoveEm.takeUntil(mouseUpEm)
			      			 .map(pos => ({
						        top:  Math.max(0,pos.clientY - imageOffset.top),
						        left: Math.max(0,pos.clientX - imageOffset.left)
						     }))
				      	);

				  mousedrag.distinctUntilChanged().subscribe(pos => {
			        dialog.el.style.top  = pos.top  + 'px';
			        dialog.el.style.left = pos.left + 'px';
			        if (id) sessionStorage.setItem(id, JSON.stringify(pos))
			      });
			  }
	       }
	}
});

jb.component('dialog.dialog-ok-cancel', {
	type: 'dialog.style',
	params: [
		{ id: 'okLabel', as: 'string', defaultValue: 'OK' },
		{ id: 'cancelLabel', as: 'string', defaultValue: 'Cancel' },
	],
	impl :{$: 'custom-style',
		template: (cmp,state,h) => h('div',{ class: 'jb-dialog jb-default-dialog'},[
			h('div',{class: 'dialog-title'},state.title),
			h('button',{class: 'dialog-close', onclick: _=> cmp.dialogClose() },'×'),
			h(state.contentComp),
			h('div',{class: 'dialog-buttons'},[
				h('button',{class: 'mdl-button mdl-js-button mdl-js-ripple-effect', onclick: _=> cmp.dialogClose({OK: false}) },cmp.cancelLabel),
				h('button',{class: 'mdl-button mdl-js-button mdl-js-ripple-effect', onclick: _=> cmp.dialogClose({OK: true}) },cmp.okLabel),
			]),
		]),
	  css: `>.dialog-buttons { display: flex; justify-content: flex-end; margin: 5px }`,
	}
})

jb.component('dialog-feature.resizer', {
	type: 'dialog-feature',
  params: [
    { id: 'resizeInnerCodemirror', as: 'boolean', description: 'effective only for dialog with a single codemirror element' }
  ],
	impl: (ctx,codeMirror) => ({
					templateModifier: (vdom,cmp,state) => {
            if (vdom && vdom.nodeName != 'div') return vdom;
						vdom.children.push(jb.ui.h('img', {src: '/css/resizer.gif', class: 'resizer'}));
			      return vdom;
			    },
		      css: '>.resizer { cursor: pointer; position: absolute; right: 1px; bottom: 1px }',

		      afterViewInit: function(cmp) {
		       	  var resizerElem = cmp.base.querySelector('.resizer');
		       	  cmp.mousedownEm = jb.rx.Observable.fromEvent(resizerElem, 'mousedown')
		       	  	.takeUntil( cmp.destroyed );

						  var mouseUpEm = jb.rx.Observable.fromEvent(document, 'mouseup').takeUntil( cmp.destroyed );
						  var mouseMoveEm = jb.rx.Observable.fromEvent(document, 'mousemove').takeUntil( cmp.destroyed );

						  if (jb.studio.previewWindow) {
						  	mouseUpEm = mouseUpEm.merge(jb.rx.Observable.fromEvent(jb.studio.previewWindow.document, 'mouseup'))
						  		.takeUntil( cmp.destroyed );
						  	mouseMoveEm = mouseMoveEm.merge(jb.rx.Observable.fromEvent(jb.studio.previewWindow.document, 'mousemove'))
						  		.takeUntil( cmp.destroyed );
						  }

              var codeMirrorElem,codeMirrorSizeDiff;
              if (codeMirror) {
                codeMirrorElem = cmp.base.querySelector('.CodeMirror');
                if (codeMirrorElem)
                  codeMirrorSizeDiff = codeMirrorElem.getBoundingClientRect().top - cmp.base.getBoundingClientRect().top
                    + (cmp.base.getBoundingClientRect().bottom - codeMirrorElem.getBoundingClientRect().bottom);
              }

						  var mousedrag = cmp.mousedownEm
						  		.map(e =>  ({
						          left: cmp.base.getBoundingClientRect().left,
						          top:  cmp.base.getBoundingClientRect().top
						        }))
						      	.flatMap(imageOffset =>
					      			 mouseMoveEm.takeUntil(mouseUpEm)
					      			 .map(pos => ({
								        top:  pos.clientY - imageOffset.top,
								        left: pos.clientX - imageOffset.left
								     }))
						      	);

						  mousedrag.distinctUntilChanged().subscribe(pos => {
					        cmp.base.style.height  = pos.top  + 'px';
					        cmp.base.style.width = pos.left + 'px';
                  if (codeMirrorElem)
                    codeMirrorElem.style.height  = (pos.top - codeMirrorSizeDiff) + 'px';
					      });
					  }
	     })
})

jb.ui.dialogs = {
 	dialogs: [],
	addDialog: function(dialog,context) {
		var self = this;
		dialog.context = context;
		this.dialogs.forEach(d=>
			d.em.next({ type: 'new-dialog', dialog: dialog }));
		this.dialogs.push(dialog);
		if (dialog.modal && !document.querySelector('.modal-overlay'))
			jb.ui.addHTML(document.body,'<div class="modal-overlay"></div>');

		dialog.close = function(args) {
			if (dialog.context.vars.formContainer.err && args.OK) // not closing dialog with errors
				return;
			return Promise.resolve().then(_=>{
				if (dialog.closing) return;
				dialog.closing = true;
				if (dialog.onOK && args && args.OK)
					return dialog.onOK(context)
			}).then( _ => {
				dialog.em.next({type: 'close', OK: args && args.OK});
				dialog.em.complete();

				var index = self.dialogs.indexOf(dialog);
				if (index != -1)
					self.dialogs.splice(index, 1);
				if (dialog.modal && document.querySelector('.modal-overlay'))
					document.body.removeChild(document.querySelector('.modal-overlay'));
				jb.ui.dialogs.remove(dialog);
			})
		},
		dialog.closed = _ =>
			self.dialogs.indexOf(dialog) == -1;

		this.render(dialog);
	},
	closeAll: function() {
		this.dialogs.forEach(d=>
			d.close());
	},
  getOrCreateDialogsElem() {
    if (!document.querySelector('.jb-dialogs'))
      jb.ui.addHTML(document.body,'<div class="jb-dialogs"/>');
    return document.querySelector('.jb-dialogs');
  },
  render(dialog) {
    jb.ui.addHTML(this.getOrCreateDialogsElem(),`<div id="${dialog.instanceId}"/>`);
    var elem = document.querySelector(`.jb-dialogs>[id="${dialog.instanceId}"]`);
    jb.ui.render(jb.ui.h(dialog.comp),elem);
  },
  remove(dialog) {
    var elem = document.querySelector(`.jb-dialogs>[id="${dialog.instanceId}"]`);
    if (!elem) return; // already closed due to asynch request handling and multiple requests to close
    jb.ui.render('', elem, elem.firstElementChild);// react - remove
    // jb.ui.unmountComponent(elem.firstElementChild._component);
    this.getOrCreateDialogsElem().removeChild(elem);
  }
}
