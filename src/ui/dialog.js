jb.component('openDialog', {
  type: 'action',
  params: [
    {id: 'id', as: 'string'},
    {id: 'style', type: 'dialog.style', dynamic: true, defaultValue: dialog.default()},
    {id: 'content', type: 'control', dynamic: true, templateValue: group({})},
    {id: 'menu', type: 'control', dynamic: true},
    {id: 'title', as: 'renderable', dynamic: true},
    {id: 'onOK', type: 'action', dynamic: true},
    {id: 'modal', type: 'boolean', as: 'boolean'},
    {id: 'features', type: 'dialog-feature[]', dynamic: true}
  ],
  impl: function(context,id) {
		const dialog = { id, modal: context.params.modal, em: jb.callbag.subject() }
		const ctx = context.setVars({
			$dialog: dialog,
			dialogData: {},
			formContainer: { err: ''}
		})
		dialog.content = () => jb.ui.dialogs.buildComp(ctx).renderVdom() // used by probe as breaking prop
		if (!context.probe)	jb.ui.dialogs.addDialog(dialog,ctx);
		return dialog
	}
})

jb.component('dialog.closeContainingPopup', {
  description: 'close parent dialog',
  type: 'action',
  params: [
    {id: 'OK', type: 'boolean', as: 'boolean', defaultValue: true}
  ],
  impl: (context,OK) => context.vars.$dialog && context.vars.$dialog.close({OK:OK})
})

jb.component('dialogFeature.uniqueDialog', {
  description: 'automatic close dialogs of the same id',
  type: 'dialog-feature',
  params: [
    {id: 'id', as: 'string'},
    {id: 'remeberLastLocation', type: 'boolean', as: 'boolean'}
  ],
  impl: function(context,id,remeberLastLocation) {
		if (!id) return;
		const dialog = context.vars.$dialog;
		dialog.id = id;
		jb.subscribe(dialog.em, e =>
			e.type == 'new-dialog' && e.dialog != dialog && e.dialog.id == id && dialog.close())
	}
})

jb.component('dialogFeature.dragTitle', {
	type: 'dialog-feature',
	params: [
	  {id: 'id', as: 'string'},
	  {id: 'selector', as: 'string', defaultValue: '.dialog-title'},
	],
	impl: function(context, id,selector) {

		  const dialog = context.vars.$dialog;
		  const {pipe,fromEvent,takeUntil,merge,Do, map,flatMap,distinctUntilChanged,fromPromise, forEach} = jb.callbag
		  return {
				 css: `${selector} { cursor: pointer }`,
				 afterViewInit: function(cmp) {
					const titleElem = cmp.base.querySelector(selector);
					const destroyed = fromPromise(cmp.destroyed)
					cmp.mousedownEm = pipe(fromEvent(titleElem, 'mousedown'),takeUntil(destroyed));

					if (id && jb.sessionStorage(id)) {
						  const pos = JSON.parse(jb.sessionStorage(id));
						  dialog.el.style.top  = pos.top  + 'px';
						  dialog.el.style.left = pos.left + 'px';
					}

					let mouseUpEm = pipe(fromEvent(document, 'mouseup'), takeUntil(destroyed))
					let mouseMoveEm = pipe(fromEvent(document, 'mousemove'), takeUntil(destroyed))

					if (jb.studio.previewWindow) {
						mouseUpEm = merge(mouseUpEm, pipe(fromEvent(jb.studio.previewWindow.document, 'mouseup')), takeUntil(destroyed))
						mouseMoveEm = merge(mouseMoveEm, pipe(fromEvent(jb.studio.previewWindow.document, 'mousemove')), takeUntil(destroyed))
					}

					pipe(
							cmp.mousedownEm,
							Do(e => e.preventDefault()),
							map(e =>  ({
								left: e.clientX - dialog.el.getBoundingClientRect().left,
								top:  e.clientY - dialog.el.getBoundingClientRect().top
						  	})),
							flatMap(imageOffset =>
								 pipe(mouseMoveEm, takeUntil(mouseUpEm),
									map(pos => ({
									top:  Math.max(0,pos.clientY - imageOffset.top),
									left: Math.max(0,pos.clientX - imageOffset.left)
									}))
								 )
							),
							//distinctUntilChanged(),
							forEach(pos => {
								dialog.el.style.top  = pos.top  + 'px';
								dialog.el.style.left = pos.left + 'px';
								if (id) jb.sessionStorage(id, JSON.stringify(pos))
							})
					)
				}
			 }
	  }
})

jb.component('dialog.default', { /* dialog.default */
	type: 'dialog.style',
	impl: customStyle({
	  template: (cmp,{title,contentComp},h) => h('div#jb-dialog jb-default-dialog',{},[
			  h('div#dialog-title',{},title),
			  h('button#dialog-close', {onclick: 'dialogClose' },'×'),
			  h(contentComp),
		  ]),
	  features: dialogFeature.dragTitle()
	})
})

jb.component('dialogFeature.nearLauncherPosition', {
  type: 'dialog-feature',
  params: [
    {id: 'offsetLeft', as: 'number', dynamic: true, defaultValue: 0},
    {id: 'offsetTop', as: 'number', dynamic: true, defaultValue: 0},
    {id: 'rightSide', as: 'boolean', type: 'boolean'}
  ],
  impl: function(context,offsetLeftF,offsetTopF,rightSide) {
		return {
			afterViewInit: function(cmp) {
				let offsetLeft = offsetLeftF() || 0, offsetTop = offsetTopF() || 0;
				const jbDialog = jb.ui.findIncludeSelf(cmp.base,'.jb-dialog')[0];
				if (!context.vars.$launchingElement) {
					if (typeof event == 'undefined')
						return console.log('no launcher for dialog');
					jbDialog.style.left = offsetLeft + event.clientX + 'px'
					jbDialog.style.top = offsetTop + event.clientY + 'px'
					return
				}
				const control = context.vars.$launchingElement.el;
				const launcherHeightFix = context.vars.$launchingElement.launcherHeightFix || jb.ui.outerHeight(control)
				const pos = jb.ui.offset(control);
				offsetLeft += rightSide ? jb.ui.outerWidth(control) : 0;
				const fixedPosition = fixDialogOverflow(control,jbDialog,offsetLeft,offsetTop);
				jbDialog.style.display = 'block';
				jbDialog.style.left = (fixedPosition ? fixedPosition.left : pos.left + offsetLeft) + 'px';
				jbDialog.style.top = (fixedPosition ? fixedPosition.top : pos.top + launcherHeightFix + offsetTop) + 'px';
			}
		}

		function fixDialogOverflow(control,dialog,offsetLeft,offsetTop) {
			let top,left
			const padding = 2,control_offset = jb.ui.offset(control), dialog_height = jb.ui.outerHeight(dialog), dialog_width = jb.ui.outerWidth(dialog);
			if (control_offset.top > dialog_height && control_offset.top + dialog_height + padding + (offsetTop||0) > window.innerHeight + window.pageYOffset)
				top = control_offset.top - dialog_height;
			if (control_offset.left > dialog_width && control_offset.left + dialog_width + padding + (offsetLeft||0) > window.innerWidth + window.pageXOffset)
				left = control_offset.left - dialog_width;
			if (top || left)
				return { top: top || control_offset.top , left: left || control_offset.left}
		}
	}
})

jb.component('dialogFeature.onClose', {
  type: 'dialog-feature',
  params: [
    {id: 'action', type: 'action', dynamic: true}
  ],
  impl: interactive( (ctx,{$dialog},{action}) => {
		const {pipe,filter,subscribe,take} = jb.callbag
		pipe($dialog.em, filter(e => e.type == 'close'), take(1), subscribe(e=> action(ctx.setData(e.OK)))
	)})
})

jb.component('dialogFeature.closeWhenClickingOutside', {
  type: 'dialog-feature',
  params: [
    {id: 'delay', as: 'number', defaultValue: 100}
  ],
  impl: function(context,_delay) {
		const dialog = context.vars.$dialog;
		dialog.isPopup = true;
		jb.delay(10).then(() =>  { // delay - close older before
			const {pipe, fromEvent, takeUntil,subscribe, merge,filter,take,delay} = jb.callbag
			let clickoutEm = fromEvent(document, 'mousedown');
			if (jb.studio.previewWindow)
				clickoutEm = merge(clickoutEm, fromEvent((jb.studio.previewWindow || {}).document, 'mousedown'))

			pipe(clickoutEm,
				filter(e => jb.ui.closest(e.target,'.jb-dialog') == null),
   				takeUntil( pipe(dialog.em, filter(e => e.type == 'close'))),
				take(1),
				delay(_delay),
				subscribe(()=> dialog.close())
			)
  		})
	}
})

jb.component('dialog.closeDialog', {
  type: 'action',
  params: [
    {id: 'id', as: 'string'},
    {id: 'delay', as: 'number', defaultValue: 200}
  ],
  impl: (ctx,id,delay) => jb.ui.dialogs.closeDialogs(jb.ui.dialogs.dialogs.filter(d=>d.id == id))
})

jb.component('dialog.closeAll', {
  type: 'action',
  impl: ctx => jb.ui.dialogs.closeAll()
})

jb.component('dialogFeature.autoFocusOnFirstInput', {
  type: 'dialog-feature',
  params: [
    {id: 'selectText', as: 'boolean', type: 'boolean'}
  ],
  impl: (ctx,selectText) => ({
		afterViewInit: cmp => {
			jb.delay(1).then(_=> {
				const elem = ctx.vars.$dialog.el.querySelector('input,textarea,select');
				if (elem)
					jb.ui.focus(elem, 'dialog-feature.auto-focus-on-first-input',ctx);
				if (selectText)
					elem.select();
			})
		}
	})
})

jb.component('dialogFeature.cssClassOnLaunchingElement', {
  type: 'dialog-feature',
  impl: context => ({
		afterViewInit: cmp => {
			if (!context.vars.$launchingElement) return
			const {pipe,filter,subscribe,take} = jb.callbag
			const dialog = context.vars.$dialog;
			const control = context.vars.$launchingElement.el;
			jb.ui.addClass(control,'dialog-open');
			pipe(dialog.em, filter(e=> e.type == 'close'), take(1), subscribe(()=> jb.ui.removeClass(control,'dialog-open')))
		}
	})
})

jb.component('dialogFeature.maxZIndexOnClick', {
  type: 'dialog-feature',
  params: [
    {id: 'minZIndex', as: 'number'}
  ],
  impl: function(context,minZIndex) {
		const dialog = context.vars.$dialog;

		return ({
			afterViewInit: cmp => {
				setAsMaxZIndex();
				dialog.el.onmousedown = setAsMaxZIndex;
			}
		})

		function setAsMaxZIndex() {
			const maxIndex = jb.ui.dialogs.dialogs.reduce((max,d) =>
				Math.max(max,(d.el && parseInt(d.el.style.zIndex || 100)+1) || 100)
			, minZIndex || 100)
			dialog.el.style.zIndex = maxIndex;
		}
	}
})

jb.component('dialog.dialogOkCancel', {
  type: 'dialog.style',
  params: [
    {id: 'okLabel', as: 'string', defaultValue: 'OK'},
    {id: 'cancelLabel', as: 'string', defaultValue: 'Cancel'}
  ],
  impl: customStyle({
    template: (cmp,{title,contentComp,cancelLabel,okLabel},h) => h('div',{ class: 'jb-dialog jb-default-dialog'},[
			h('div',{class: 'dialog-title'},title),
			h('button',{class: 'dialog-close', onclick: 'dialogClose' },'×'),
			h(contentComp),
			h('div',{class: 'dialog-buttons'},[
				h('button',{class: 'mdc-button', onclick: 'dialogClose' },cancelLabel),
				h('button',{class: 'mdc-button', onclick: 'dialogCloseOK' },okLabel),
			]),
		]),
    css: '>.dialog-buttons { display: flex; justify-content: flex-end; margin: 5px }'
  })
})

jb.component('dialogFeature.resizer', {
  type: 'dialog-feature',
  params: [
    {id: 'resizeInnerCodemirror', as: 'boolean', description: 'effective only for dialog with a single codemirror element', type: 'boolean'}
  ],
  impl: (ctx,codeMirror) => ({
	templateModifier: (vdom,cmp,state) => {
            if (vdom && vdom.tag != 'div') return vdom;
				vdom.children.push(jb.ui.h('img', {class: 'jb-resizer'}));
			return vdom;
	},
	css: '>.jb-resizer { cursor: pointer; position: absolute; right: 1px; bottom: 1px }',

	afterViewInit: function(cmp) {
		const resizerElem = cmp.base.querySelector('.jb-resizer');
		const {pipe, map, flatMap,takeUntil, merge,subscribe,Do} = jb.callbag

		cmp.mousedownEm = jb.ui.fromEvent(cmp,'mousedown',resizerElem)
		let mouseUpEm = jb.ui.fromEvent(cmp,'mouseup',document)
		let mouseMoveEm = jb.ui.fromEvent(cmp,'mousemove',document)

		if (jb.studio.previewWindow) {
			mouseUpEm = merge(mouseUpEm,jb.ui.fromEvent(cmp,'mouseup',jb.studio.previewWindow.document))
			mouseMoveEm = merge(mouseMoveEm,jb.ui.fromEvent(cmp,'mousemove',jb.studio.previewWindow.document))
		}

		let codeMirrorElem,codeMirrorSizeDiff;
		pipe(cmp.mousedownEm,
			Do(e=>{
				if (codeMirror) {
					codeMirrorElem = cmp.base.querySelector('.CodeMirror,.jb-textarea-alternative-for-codemirror');
					if (codeMirrorElem)
					codeMirrorSizeDiff = codeMirrorElem.getBoundingClientRect().top - cmp.base.getBoundingClientRect().top
						+ (cmp.base.getBoundingClientRect().bottom - codeMirrorElem.getBoundingClientRect().bottom);
				}
			}),
			map(e =>  ({
				left: cmp.base.getBoundingClientRect().left,
				top:  cmp.base.getBoundingClientRect().top
			})),
			flatMap(imageOffset =>
				pipe(mouseMoveEm,
					takeUntil(mouseUpEm),
					map(pos => ({ top:  pos.clientY - imageOffset.top, left: pos.clientX - imageOffset.left }))
				)
			),
			subscribe(pos => {
				cmp.base.style.height  = pos.top  + 'px';
				cmp.base.style.width = pos.left + 'px';
				if (codeMirrorElem)
					codeMirrorElem.style.height  = (pos.top - codeMirrorSizeDiff) + 'px';
			})
		  )
	}})
})

jb.component('dialog.popup', {
  type: 'dialog.style',
  impl: customStyle({
	template: (cmp,state,h) => h('div#jb-dialog jb-popup',{},h(state.contentComp)),
    css: '{ position: absolute; background: white; box-shadow: 2px 2px 3px #d5d5d5; padding: 3px 0; border: 1px solid rgb(213, 213, 213) }',
    features: [
      dialogFeature.maxZIndexOnClick(),
      dialogFeature.closeWhenClickingOutside(),
      dialogFeature.cssClassOnLaunchingElement(),
      dialogFeature.nearLauncherPosition({})
    ]
  })
})

jb.component('dialog.transparent-popup', {
	type: 'dialog.style',
	impl: customStyle({
	  template: (cmp,state,h) => h('div#jb-dialog jb-popup',{},h(state.contentComp)),
	  css: '{ position: absolute; padding: 3px 0; }',
	  features: [
		dialogFeature.maxZIndexOnClick(),
		dialogFeature.closeWhenClickingOutside(),
		dialogFeature.cssClassOnLaunchingElement(),
		dialogFeature.nearLauncherPosition({})
	  ]
	})
  })
  
jb.component('dialog.div', {
  type: 'dialog.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div',{ class: 'jb-dialog jb-popup'},h(state.contentComp)),
    css: '{ position: absolute }'
  })
})

jb.ui.dialogs = {
	dialogs: [],
	buildComp(ctx) { // used with addDialog profile
		const dialog = ctx.vars.$dialog
		return jb.ui.ctrl(ctx, features(
			calcProp('title', _ctx=> _ctx.vars.$model.title(_ctx)),
			calcProp('contentComp', '%$$model.content%'),
			calcProp('hasMenu', '%$$model/menu/profile%'),
			calcProp('menuComp', '%$$model/menu%'),
			feature.init( ({},{cmp}) => cmp.dialog = dialog),
			interactive( ({},{cmp}) => {
				dialog.cmp = cmp
				cmp.dialog = dialog
				dialog.onOK = ctx2 => ctx.params.onOK(cmp.ctx.extendVars(ctx2));
				cmp.dialogCloseOK = () => dialog.close({OK: true});
				cmp.dialogClose = args => dialog.close(args);
				dialog.el = cmp.base;
				if (!cmp.base.style.zIndex) cmp.base.style.zIndex = 100;
		})))
	},

	addDialog(dialog,ctx) {
		const self = this;
		jb.log('addDialog',[dialog])
		this.dialogs.push(dialog);
		if (dialog.modal && !document.querySelector('.modal-overlay'))
			jb.ui.addHTML(document.body,'<div class="modal-overlay"></div>');
		jb.ui.render(jb.ui.h(this.buildComp(ctx)), this.dialogsTopElem(ctx))
		this.dialogs.forEach(d=> d.em.next({ type: 'new-dialog', dialog }));

		dialog.close = function(args) {
			jb.log('closeDialog',[dialog])
			if (this.hasFields && jb.ui.checkFormValidation) {
				jb.ui.checkFormValidation(dialog.el)
				if (ctx.vars.formContainer.err && args && args.OK) // not closing dialog with errors
					return;
			}
			return Promise.resolve().then(_=>{
				if (dialog.closing) return;
				dialog.closing = true;
				if (dialog.onOK && args && args.OK)
					return dialog.onOK(ctx)
			}).then( _ => {
				dialog.em.next({type: 'close', OK: args && args.OK})
				dialog.em.complete();

				const index = self.dialogs.indexOf(dialog);
				if (index != -1)
					self.dialogs.splice(index, 1);
				if (dialog.modal && document.querySelector('.modal-overlay'))
					document.body.removeChild(document.querySelector('.modal-overlay'));
				jb.ui.unmount(dialog.el)
				if (dialog.el.parentElement === self.dialogsTopElem(ctx))
					self.dialogsTopElem(ctx).removeChild(dialog.el)
			})
		},
		dialog.closed = () => self.dialogs.indexOf(dialog) == -1;
	},
	closeDialogs(dialogs) {
		return dialogs.slice(0).reduce((pr,dialog) => pr.then(()=>dialog.close()), Promise.resolve())
	},
	closeAll() {
		return this.closeDialogs(this.dialogs)
	},
	closePopups() {
		return jb.ui.dialogs.closeDialogs(jb.ui.dialogs.dialogs.filter(d=>d.isPopup))
	},
	dialogsTopElem(ctx) {
		if (!this._dialogsTopElem) {
			this._dialogsTopElem = (ctx.vars.elemToTest || document.body).ownerDocument.createElement('div')
			this._dialogsTopElem.className = 'jb-dialogs'
			;(ctx.vars.elemToTest || document.body).appendChild(this._dialogsTopElem)
		}
		return this._dialogsTopElem
	},
	reRenderAll(ctx) {
		this._dialogsTopElem && Array.from(this._dialogsTopElem.children).filter(x=>x).forEach(el=> jb.ui.refreshElem(el,null,{srcCtx: ctx}))
	}
}
