jb.component('openDialog', {
	type: 'action',
	params: [
		{ id: 'id', as: 'string' },
		{ id: 'style', type: 'dialog.style', dynamic: true, defaultValue: { $:'dialog.default' } },
		{ id: 'content', type: 'control', dynamic: true, defaultValue :{$: 'group'}, forceDefaultCreation: true },
		{ id: 'menu', type: 'control', dynamic: true },
		{ id: 'title', as: 'string', dynamic: true  },
		{ id: 'onOK', type: 'action', dynamic: true },
		{ id: 'modal', type: 'boolean', as: 'boolean' },
		{ id: 'features', type: 'dialog-feature[]', dynamic: true }
	],
	impl: function(context,id) {
		var modal = context.params.modal;
		var dialog = { 
			id: id, 
			onOK: context.params.onOK, 
			modal: modal, 
			em: new jb_rx.Subject(),
		};
//		dialog.em.subscribe(e=>console.log(e.type));

		var ctx = (modal ? context.setVars({dialogData: {}}) : context)
				.setVars({ $dialog: dialog });
		dialog.comp = jb_ui.ctrl(ctx).jbExtend({
			beforeInit: function(cmp) {
				cmp.title = ctx.params.title(ctx);
				cmp.dialog = dialog;
				cmp.dialog.$el = $(cmp.elementRef.nativeElement).children().first();
				cmp.dialog.$el.css('z-index',100);

				cmp.dialogClose = dialog.close;
				cmp.contentComp = ctx.params.content(ctx);
				cmp.menuComp = ctx.params.menu(ctx);
				cmp.hasMenu = !!ctx.params.menu.profile;
			},
		});
		jbart.jb_dialogs.addDialog(dialog,ctx);
		return dialog;
	}
})

jb.component('closeContainingPopup', {
	type: 'action',
	params: [
		{ id: 'OK', type: 'boolean', as: 'boolean', defaultValue: true}
	],
	impl: function(context,OK) {
		context.vars.$dialog && context.vars.$dialog.close({OK:OK});
	}
})

jb.component('dialog.default', {
	type: 'dialog.style',
	impl :{$: 'customStyle',
		noTemplateParsing: true,
		template: `<div class="jb-dialog jb-default-dialog">
				      <div class="dialog-title">{{title}}</div>
				      <button class="dialog-close" (click)="dialogClose()">&#215;</button>
				      <div *jbComp="contentComp"></div>
				    </div>` 
	}
})

jb.component('dialog.popup', {
  type: 'dialog.style',
  impl :{$: 'customStyle',
      template: '<div class="jb-dialog jb-popup"><div *jbComp="contentComp" class="dialog-content"></div></div>',
      features: [
        { $: 'dialog-feature.maxZIndexOnClick' },
        { $: 'dialog-feature.closeWhenClickingOutside' },
        { $: 'dialog-feature.cssClassOnLaunchingControl' },
        { $: 'dialog-feature.nearLauncherLocation' }
      ],
      css: `
      .jb-dialog { position: absolute; background: white; box-shadow: 2px 2px 3px #d5d5d5; padding: 3px 0; border: 1px solid rgb(213, 213, 213) }
      `
  }
})


jb.component('dialog-feature.uniqueDialog', {
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

function fixDialogOverflow($control,$dialog,offsetLeft,offsetTop) {
	var padding = 2,top,left;
	if ($control.offset().top > $dialog.height() && $control.offset().top + $dialog.height() + padding + (offsetTop||0) > window.innerHeight + window.pageYOffset)
		top = $control.offset().top - $dialog.height();
	if ($control.offset().left > $dialog.width() && $control.offset().left + $dialog.width() + padding + (offsetLeft||0) > window.innerWidth + window.pageXOffset)
		left = $control.offset().left - $dialog.width();
	if (top || left)
		return { top: top || $control.offset().top , left: left || $control.offset().left}
}

jb.component('dialog-feature.keyboard-shortcut', {
  type: 'dialog-feature',
  params: [
    { id: 'shortcut', as: 'string', description: 'Ctrl+C or Alt+V' },
    { id: 'action', type: 'action', dynamic: true },
  ],
  impl: (ctx,key,action) => ({
      init: cmp=> {
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

	    jb_rx.Observable.fromEvent(dialog.$el[0], 'keydown')
   	  		.takeUntil( cmp.destroyed )
			.filter(e=> e.keyCode != 17 && e.keyCode != 18) // ctrl ot alt alone
   	  		.subscribe(e=>
   	  			dialog.applyShortcut(e))

	}})
})

jb.component('dialog-feature.nearLauncherLocation', {
	type: 'dialog-feature',
	params: [
		{ id: 'offsetLeft', as: 'number', defaultValue: 0 },
		{ id: 'offsetTop', as: 'number' , defaultValue: 0 },
		{ id: 'rightSide', as: 'boolean' },
	],
	impl: function(context,offsetLeft,offsetTop,rightSide) {
		return {
			afterViewInit: function(cmp) {
				if (!context.vars.$launchingElement)
					return console.log('no launcher for dialog');
				var $control = context.vars.$launchingElement.$el;
				var pos = $control.offset();
				var $jbDialog = $(cmp.elementRef.nativeElement).findIncludeSelf('.jb-dialog');
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
	}
})

jb.component('dialog-feature.launcherLocationNearSelectedNode', {
	type: 'dialog-feature',
	params: [
		{ id: 'offsetLeft', as: 'number' },
		{ id: 'offsetTop', as: 'number' },
	],
	impl: function(context, offsetLeft, offsetTop) {
		return {
			afterViewInit: function(cmp) {
				var $elem = context.vars.$launchingElement.$el;
				var $control = $elem.closest('.selected').first();
				var pos = $control.offset();
				$(cmp.elementRef.nativeElement).findIncludeSelf('.jb-dialog').css('left', `${pos.left + offsetLeft}px`);
				$(cmp.elementRef.nativeElement).findIncludeSelf('.jb-dialog').css('top', `${pos.top + $control.outerHeight() + offsetTop}px`);
			}
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

jb.component('dialog-feature.closeWhenClickingOutside', {
	type: 'dialog-feature',
	params: [
		{ id: 'delay', as: 'number', defaultValue: 100 }
	],
	impl: function(context,delay) { 
		var dialog = context.vars.$dialog;
		dialog.isPopup = true;
		jb.delay(10).then(() =>  { // delay - close older before    		
			var clickoutEm = jb_rx.Observable.fromEvent(document, 'mousedown')
			      			.merge(jb_rx.Observable.fromEvent(
			      				(jbart.previewWindow || {}).document, 'mousedown'))
			      			.filter(e =>
			      				$(e.target).closest(dialog.$el[0]).length == 0)
   					 		.takeUntil(dialog.em.filter(e => e.type == 'close'));

		 	clickoutEm.take(1)
		  		.delay(delay)
		  		.subscribe(()=>
		  			dialog.close())
  		})
	}
})

jb.component('dialog.close-all-popups', {
	type: 'action',
	impl: ctx =>
		jbart.jb_dialogs.dialogs.filter(d=>d.isPopup)
  			.forEach(d=>d.close())
})

jb.component('dialog-feature.autoFocusOnFirstInput', {
	type: 'dialog-feature',
	impl: context => ({ 
		afterViewInit: cmp =>
			jb.delay(1).then(_=>
				jb_ui.focus(context.vars.$dialog.$el.find('input,textarea,select').first(), 'autoFocusOnFirstInput'))
	})
})

jb.component('dialog-feature.cssClassOnLaunchingControl', {
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

jb.component('dialog-feature.maxZIndexOnClick', {
	type: 'dialog-feature',
	params: [
		{ id: 'minZIndex', as: 'number'}
	],
	impl: function(context,minZIndex) {
		var dialog = context.vars.$dialog;

		return ({
			afterViewInit: cmp => {
				setAsMaxZIndex();
				dialog.$el.mousedown(setAsMaxZIndex);
			}
		})

		function setAsMaxZIndex() {
			var maxIndex = jbart.jb_dialogs.dialogs.reduce(function(max,d) { 
				return Math.max(max,(d.$el && parseInt(d.$el.css('z-index')) || 100)+1)
			}, minZIndex || 100)

			dialog.$el.css('z-index',maxIndex);
		}
	}
})

jb.component('dialog-feature.dragTitle', {
	type: 'dialog-feature',
	params: [
		{ id: 'id', as: 'string' }
	],
	impl: function(context, id) { 
		var dialog = context.vars.$dialog;
		return {
		       css: '.dialog-title { cursor: pointer }',
	           jbEmitter: true,
		       init: function(cmp) {
		       	  var titleElem = cmp.elementRef.nativeElement.querySelector('.dialog-title');
		       	  cmp.mousedownEm = jb_rx.Observable.fromEvent(titleElem, 'mousedown')
		       	  	.takeUntil( cmp.destroyed );
		       	  
				  if (id && sessionStorage.getItem(id)) {
						var pos = JSON.parse(sessionStorage.getItem(id));
					    dialog.$el[0].style.top  = pos.top  + 'px';
					    dialog.$el[0].style.left = pos.left + 'px';
				  }

				  var mouseUpEm = jb_rx.Observable.fromEvent(document, 'mouseup')
				      			.merge(jb_rx.Observable.fromEvent(
				      				(jbart.previewWindow || {}).document, 'mouseup'))
          						.takeUntil( cmp.destroyed )

				  var mouseMoveEm = jb_rx.Observable.fromEvent(document, 'mousemove')
				      			.merge(jb_rx.Observable.fromEvent(
				      				(jbart.previewWindow || {}).document, 'mousemove'))
          						.takeUntil( cmp.destroyed )

				  var mousedrag = cmp.mousedownEm
				  		.do(e => e.preventDefault())
				  		.map(e =>  ({
				          left: e.clientX - dialog.$el[0].getBoundingClientRect().left,
				          top:  e.clientY - dialog.$el[0].getBoundingClientRect().top
				        }))
				      	.flatMap(imageOffset => 
			      			 mouseMoveEm.takeUntil(mouseUpEm)
			      			 .map(pos => ({
						        top:  pos.clientY - imageOffset.top,
						        left: pos.clientX - imageOffset.left
						     }))
				      	);

				  mousedrag.distinctUntilChanged().subscribe(pos => {
			        dialog.$el[0].style.top  = pos.top  + 'px';
			        dialog.$el[0].style.left = pos.left + 'px';
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
	impl :{$: 'customStyle',
		template: `
				<div class="jb-dialog jb-default-dialog">
				      <div class="dialog-title">{{title}}</div>
				      <button class="dialog-close" (click)="dialogClose()">&#215;</button>
				      <div *jbComp="contentComp"></div>
					  <div class="dialog-buttons">
							<button class="mdl-button mdl-js-button mdl-js-ripple-effect" (click)="dialogClose({OK:false})">%$cancelLabel%</button>
							<button class="mdl-button mdl-js-button mdl-js-ripple-effect" (click)="dialogClose({OK:true})">%$okLabel%</button>
					  </div>
				</div>		
		`,
	  css: `.dialog-buttons { display: flex; justify-content: flex-end; margin: 5px }`,
	}
})


jbart.jb_dialogs = {
 	dialogs: [],
	addDialog: function(dialog,context) {
		var self = this;
		dialog.context = context;
		this.dialogs.forEach(d=>
			d.em.next({ type: 'new-dialog', dialog: dialog }));
		this.dialogs.push(dialog);
		if (dialog.modal)
			$('body').prepend('<div class="modal-overlay"></div>');

		jb_ui.apply(context);

		dialog.close = function(args) {
			dialog.em.next({type: 'close'});
			dialog.em.complete();
			var index = self.dialogs.indexOf(dialog);
			if (index != -1)
				self.dialogs.splice(index, 1);
			if (dialog.onOK && args && args.OK) 
				try { 
					dialog.onOK(context);
				} catch (e) {
					console.log(e);
				}
			if (dialog.modal)
				$('.modal-overlay').first().remove();
			jb_ui.apply(context);
		},
		dialog.closed = function() {
			self.dialogs.indexOf(dialog) == -1
		}
	},
	closeAll: function() {
		this.dialogs.forEach(d=>
			d.close());
	}
}

