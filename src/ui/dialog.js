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
			modal: modal,
			em: new jb.rx.Subject(),
		};

		var ctx = context.setVars({
			$dialog: dialog
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
		jb.ui.dialogs.addDialog(dialog,ctx);
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
				var $control = context.vars.$launchingElement.$el;
				var pos = $control.offset();
				var $jbDialog = $(cmp.base).findIncludeSelf('.jb-dialog');
				offsetLeft += rightSide ? $control.outerWidth() : 0;
				var fixedPosition = fixDialogOverflow($control,$jbDialog,offsetLeft,offsetTop);
				if (fixedPosition)
					$jbDialog.css('left', `${fixedPosition.left}px`)
						.css('top', `${fixedPosition.top}px`)
						.css('display','block');
				else
					$jbDialog.css('left', `${pos.left + offsetLeft}px`)
						.css('top', `${pos.top + $control.outerHeight() + offsetTop}px`)
						.css('display','block');
			}
		}

		function fixDialogOverflow($control,$dialog,offsetLeft,offsetTop) {
			var padding = 2,top,left;
			if ($control.offset().top > $dialog.height() && $control.offset().top + $dialog.height() + padding + (offsetTop||0) > window.innerHeight + window.pageYOffset)
				top = $control.offset().top - $dialog.height();
			if ($control.offset().left > $dialog.width() && $control.offset().left + $dialog.width() + padding + (offsetLeft||0) > window.innerWidth + window.pageXOffset)
				left = $control.offset().left - $dialog.width();
			if (top || left)
				return { top: top || $control.offset().top , left: left || $control.offset().left}
		}
	}
})

jb.component('dialog-feature.onClose', {
	type: 'dialog-feature',
	params: [
		{ id: 'action', type: 'action', dynamic: true}
	],
	impl: function(context,action) {
		context.vars.$dialog.em
			.filter(e => e.type == 'close')
			.take(1)
			.subscribe(()=>
				action())
	}
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

		 	clickoutEm.filter(e => $(e.target).closest(dialog.el).length == 0)
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
			var $control = context.vars.$launchingElement.$el;
			$control.addClass('dialog-open');
			dialog.em.filter(e=>
				e.type == 'close')
				.take(1)
				.subscribe(()=> {
					$control.removeClass('dialog-open');
				})
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
				$(dialog.el).mousedown(setAsMaxZIndex);
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
						        top:  pos.clientY - imageOffset.top,
						        left: pos.clientX - imageOffset.left
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

jb.component('dialog-feature.resizer', {
	type: 'dialog-feature',
	params: [
		{ id: 'id', as: 'string' }
	],
	impl: function(context, id) {
		var dialog = context.vars.$dialog;
		return {
					templateModifier: (vdom,cmp,state) => {
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

				  var mousedrag = cmp.mousedownEm
				  		.do(e =>
				  			e.preventDefault())
				  		.map(e =>  ({
				          left: dialog.el.getBoundingClientRect().left,
				          top:  dialog.el.getBoundingClientRect().top
				        }))
				      	.flatMap(imageOffset =>
			      			 mouseMoveEm.takeUntil(mouseUpEm)
									 .do(pos=>console.log(pos.clientY,pos.clientX,imageOffset,pos.clientY - imageOffset.top,pos.clientX - imageOffset.left))
			      			 .map(pos => ({
						        top:  pos.clientY - imageOffset.top,
						        left: pos.clientX - imageOffset.left
						     }))
				      	);

				  mousedrag.distinctUntilChanged().subscribe(pos => {
			        dialog.el.style.height  = pos.top  + 'px';
			        dialog.el.style.width = pos.left + 'px';
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

jb.ui.dialogs = {
 	dialogs: [],
 	redraw: function() {
		jb.ui.render(jb.ui.h('div',{ class: 'jb-dialogs'}, jb.ui.dialogs.dialogs.map(d=>jb.ui.h(d.comp)) )
			, document.body, document.querySelector('body>.jb-dialogs'));
 	},
	addDialog: function(dialog,context) {
		var self = this;
		dialog.context = context;
		this.dialogs.forEach(d=>
			d.em.next({ type: 'new-dialog', dialog: dialog }));
		this.dialogs.push(dialog);
		if (dialog.modal && !$('body>.modal-overlay')[0])
			$('body').prepend('<div class="modal-overlay"></div>');

		dialog.close = function(args) {
			return Promise.resolve().then(_=>{
				if (dialog.closing) return;
				dialog.closing = true;
				if (dialog.onOK && args && args.OK)
					return dialog.onOK(context)
			}).then( _ => {
				dialog.em.next({type: 'close'});
				dialog.em.complete();

				var index = self.dialogs.indexOf(dialog);
				if (index != -1)
					self.dialogs.splice(index, 1);
				if (dialog.modal)
					$('.modal-overlay').remove();
				jb.ui.dialogs.redraw();
			})
		},
		dialog.closed = _ =>
			self.dialogs.indexOf(dialog) == -1;

		this.redraw();
	},
	closeAll: function() {
		this.dialogs.forEach(d=>
			d.close());
	}
}
