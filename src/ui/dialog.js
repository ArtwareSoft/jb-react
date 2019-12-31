jb.component('open-dialog', { /* openDialog */
  type: 'action',
  params: [
    {id: 'id', as: 'string'},
    {id: 'style', type: 'dialog.style', dynamic: true, defaultValue: dialog.default()},
    {
      id: 'content',
      type: 'control',
      dynamic: true,
      templateValue: group({}),
    },
    {id: 'menu', type: 'control', dynamic: true},
    {id: 'title', as: 'renderable', dynamic: true},
    {id: 'onOK', type: 'action', dynamic: true},
    {id: 'modal', type: 'boolean', as: 'boolean'},
    {id: 'features', type: 'dialog-feature[]', dynamic: true}
  ],
  impl: function(context,id) {
		const modal = context.params.modal;
		const dialog = {
			id: id,
      		instanceId: context.id,
			modal: modal,
			em: new jb.rx.Subject(),
		};

		const ctx = context.setVars({
			$dialog: dialog,
			dialogData: {},
			formContainer: { err: ''}
		})
		dialog.comp = jb.ui.ctrl(ctx,{
			beforeInit: cmp => {
				cmp.dialog = dialog;

				cmp.state.title = ctx.params.title(ctx);
				try {
					cmp.state.contentComp = ctx.params.content(cmp.ctx);
					cmp.hasMenu = !!ctx.params.menu.profile;
					if (cmp.hasMenu)
						cmp.menuComp = ctx.params.menu(cmp.ctx);
				} catch (e) {
					jb.logException(e,'dialog',ctx);
				}
				dialog.onOK = ctx2 => context.params.onOK(cmp.ctx.extendVars(ctx2));
				cmp.dialogCloseOK = () => dialog.close({OK: true});
				cmp.dialogClose = args => dialog.close(args);
				cmp.recalcTitle = (e,srcCtx) =>	jb.ui.setState(cmp,{title: ctx.params.title(ctx)},e,srcCtx)
			},
			afterViewInit: cmp => {
				cmp.dialog.el = cmp.base;
				if (!cmp.dialog.el.style.zIndex)
					cmp.dialog.el.style.zIndex = 100;
			},
		});

		if (!context.probe)
			jb.ui.dialogs.addDialog(dialog,ctx);
		else
			jb.studio.probeResEl = jb.ui.render(jb.ui.h(dialog.comp), jb.studio.probeEl || document.createElement('div'), jb.studio.probeResEl);

		return dialog;
	}
})

jb.component('dialog.close-containing-popup', { /* dialog.closeContainingPopup */
	description: 'close parent dialog',
	type: 'action',
	params: [
		{id: 'OK', type: 'boolean', as: 'boolean', defaultValue: true}
	],
	impl: (context,OK) => context.vars.$dialog && context.vars.$dialog.close({OK:OK})
})

jb.component('dialog-feature.unique-dialog', { /* dialogFeature.uniqueDialog */
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
		dialog.em.filter(e=> e.type == 'new-dialog')
			.subscribe(e=> {
				if (e.dialog != dialog && e.dialog.id == id )
					dialog.close();
		})
	}
})

jb.component('dialog-feature.drag-title', { /* dialogFeature.dragTitle */
	type: 'dialog-feature',
	params: [
	  {id: 'id', as: 'string'}
	],
	impl: function(context, id) {
		  const dialog = context.vars.$dialog;
		  return {
				 css: '>.dialog-title { cursor: pointer }',
				 afterViewInit: function(cmp) {
					   const titleElem = cmp.base.querySelector('.dialog-title');
					   cmp.mousedownEm = jb.rx.Observable.fromEvent(titleElem, 'mousedown')
						   .takeUntil( cmp.destroyed );
  
					if (id && sessionStorage.getItem(id)) {
						  const pos = JSON.parse(sessionStorage.getItem(id));
						  dialog.el.style.top  = pos.top  + 'px';
						  dialog.el.style.left = pos.left + 'px';
					}
  
					let mouseUpEm = jb.rx.Observable.fromEvent(document, 'mouseup').takeUntil( cmp.destroyed );
					let mouseMoveEm = jb.rx.Observable.fromEvent(document, 'mousemove').takeUntil( cmp.destroyed );
  
					if (jb.studio.previewWindow) {
						mouseUpEm = mouseUpEm.merge(jb.rx.Observable.fromEvent(jb.studio.previewWindow.document, 'mouseup'))
							.takeUntil( cmp.destroyed );
						mouseMoveEm = mouseMoveEm.merge(jb.rx.Observable.fromEvent(jb.studio.previewWindow.document, 'mousemove'))
							.takeUntil( cmp.destroyed );
					}
  
					const mousedrag = cmp.mousedownEm
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
					})
				}
			 }
	  }
  })
  
  jb.component('dialog.default', { /* dialog.default */
	type: 'dialog.style',
	impl: customStyle({
	  template: (cmp,state,h) => h('div',{ class: 'jb-dialog jb-default-dialog'},[
			  h('div',{class: 'dialog-title'},state.title),
			  h('button',{class: 'dialog-close', onclick: 'dialogClose' },'×'),
			  h(state.contentComp),
		  ]),
	  features: dialogFeature.dragTitle()
	})
  })

jb.component('dialog-feature.near-launcher-position', { /* dialogFeature.nearLauncherPosition */
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
				if (!context.vars.$launchingElement)
					return console.log('no launcher for dialog');
				const control = context.vars.$launchingElement.el;
				const launcherHeightFix = context.vars.$launchingElement.launcherHeightFix || jb.ui.outerHeight(control)
				const pos = jb.ui.offset(control);
				const jbDialog = jb.ui.findIncludeSelf(cmp.base,'.jb-dialog')[0];
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

jb.component('dialog-feature.onClose', { /* dialogFeature.onClose */
  type: 'dialog-feature',
  params: [
    {id: 'action', type: 'action', dynamic: true}
  ],
  impl: (ctx,action) => ctx.vars.$dialog.em.filter(e => e.type == 'close').take(1)
			.subscribe(e=> action(ctx.setData(e.OK)))
})

jb.component('dialog-feature.close-when-clicking-outside', { /* dialogFeature.closeWhenClickingOutside */
  type: 'dialog-feature',
  params: [
    {id: 'delay', as: 'number', defaultValue: 100}
  ],
  impl: function(context,delay) {
		const dialog = context.vars.$dialog;
		dialog.isPopup = true;
		jb.delay(10).then(() =>  { // delay - close older before
			let clickoutEm = jb.rx.Observable.fromEvent(document, 'mousedown');
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

jb.component('dialog.close-dialog', { /* dialog.closeDialog */
  type: 'action',
  params: [
    {id: 'id', as: 'string'},
    {id: 'delay', as: 'number', defaultValue: 200}
  ],
  impl: (ctx,id,delay) => jb.ui.dialogs.closeDialogs(jb.ui.dialogs.dialogs.filter(d=>d.id == id))
  
})

jb.component('dialog.close-all', { /* dialog.closeAll */
  type: 'action',
  impl: ctx => jb.ui.dialogs.closeAll()
})

jb.component('dialog-feature.auto-focus-on-first-input', { /* dialogFeature.autoFocusOnFirstInput */
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

jb.component('dialog-feature.css-class-on-launching-element', { /* dialogFeature.cssClassOnLaunchingElement */
  type: 'dialog-feature',
  impl: context => ({
		afterViewInit: cmp => {
			const dialog = context.vars.$dialog;
			const control = context.vars.$launchingElement.el;
			jb.ui.addClass(control,'dialog-open');
			dialog.em.filter(e=>
				e.type == 'close')
				.take(1)
				.subscribe(()=>
          jb.ui.removeClass(control,'dialog-open'))
		}
	})
})

jb.component('dialog-feature.max-zIndex-on-click', { /* dialogFeature.maxZIndexOnClick */
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

jb.component('dialog.dialog-ok-cancel', { /* dialog.dialogOkCancel */
  type: 'dialog.style',
  params: [
    {id: 'okLabel', as: 'string', defaultValue: 'OK'},
    {id: 'cancelLabel', as: 'string', defaultValue: 'Cancel'}
  ],
  impl: customStyle({
    template: (cmp,state,h) => h('div',{ class: 'jb-dialog jb-default-dialog'},[
			h('div',{class: 'dialog-title'},state.title),
			h('button',{class: 'dialog-close', onclick: 'dialogClose' },'×'),
			h(state.contentComp),
			h('div',{class: 'dialog-buttons'},[
				h('button',{class: 'mdl-button mdl-js-button mdl-js-ripple-effect', onclick: 'dialogClose' },cmp.cancelLabel),
				h('button',{class: 'mdl-button mdl-js-button mdl-js-ripple-effect', onclick: 'dialogCloseOK' },cmp.okLabel),
			]),
		]),
    css: '>.dialog-buttons { display: flex; justify-content: flex-end; margin: 5px }'
  })
})

jb.component('dialog-feature.resizer', { /* dialogFeature.resizer */
  type: 'dialog-feature',
  params: [
    {
      id: 'resizeInnerCodemirror',
      as: 'boolean',
      description: 'effective only for dialog with a single codemirror element',
      type: 'boolean'
    }
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
		cmp.mousedownEm = jb.rx.Observable.fromEvent(resizerElem, 'mousedown').takeUntil( cmp.destroyed );

		let mouseUpEm = jb.rx.Observable.fromEvent(document, 'mouseup').takeUntil( cmp.destroyed );
		let mouseMoveEm = jb.rx.Observable.fromEvent(document, 'mousemove').takeUntil( cmp.destroyed );

		if (jb.studio.previewWindow) {
			mouseUpEm = mouseUpEm.merge(jb.rx.Observable.fromEvent(jb.studio.previewWindow.document, 'mouseup'))
				.takeUntil( cmp.destroyed );
			mouseMoveEm = mouseMoveEm.merge(jb.rx.Observable.fromEvent(jb.studio.previewWindow.document, 'mousemove'))
				.takeUntil( cmp.destroyed );
		}

		let codeMirrorElem,codeMirrorSizeDiff;
		const mousedrag = cmp.mousedownEm.do(e=>{
			if (codeMirror) {
					codeMirrorElem = cmp.base.querySelector('.CodeMirror,.jb-textarea-alternative-for-codemirror');
					if (codeMirrorElem)
					codeMirrorSizeDiff = codeMirrorElem.getBoundingClientRect().top - cmp.base.getBoundingClientRect().top
						+ (cmp.base.getBoundingClientRect().bottom - codeMirrorElem.getBoundingClientRect().bottom);
			}
			}).map(e =>  ({
				left: cmp.base.getBoundingClientRect().left,
				top:  cmp.base.getBoundingClientRect().top
			})).flatMap(imageOffset =>
					mouseMoveEm.takeUntil(mouseUpEm)
					.map(pos => ({ top:  pos.clientY - imageOffset.top, left: pos.clientX - imageOffset.left }))
			)

		mousedrag.distinctUntilChanged().subscribe(pos => {
			cmp.base.style.height  = pos.top  + 'px';
			cmp.base.style.width = pos.left + 'px';
			if (codeMirrorElem)
				codeMirrorElem.style.height  = (pos.top - codeMirrorSizeDiff) + 'px';
			})
		}
	})
})

jb.component('dialog.popup', { /* dialog.popup */
  type: 'dialog.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div',{ class: 'jb-dialog jb-popup'},h(state.contentComp)),
    css: '{ position: absolute; background: white; box-shadow: 2px 2px 3px #d5d5d5; padding: 3px 0; border: 1px solid rgb(213, 213, 213) }',
    features: [
      dialogFeature.maxZIndexOnClick(),
      dialogFeature.closeWhenClickingOutside(),
      dialogFeature.cssClassOnLaunchingElement(),
      dialogFeature.nearLauncherPosition({})
    ]
  })
})

jb.component('dialog.div', { /* dialog.div */
	type: 'dialog.style',
	impl: customStyle({
	  template: (cmp,state,h) => h('div',{ class: 'jb-dialog jb-popup'},h(state.contentComp)),
	  css: '{ position: absolute }'
	})
})
  
jb.ui.dialogs = {
 	dialogs: [],
	addDialog(dialog,ctx) {
		const self = this;
		dialog.context = ctx;
		this.dialogs.forEach(d=>
			d.em.next({ type: 'new-dialog', dialog: dialog }));
		this.dialogs.push(dialog);
		if (dialog.modal && !document.querySelector('.modal-overlay'))
			jb.ui.addHTML(document.body,'<div class="modal-overlay"></div>');

		dialog.close = function(args) {
			if (dialog.context.vars.formContainer.err && args && args.OK) // not closing dialog with errors
				return;
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
				return self.refresh(ctx);
			})
		},
		dialog.closed = () => self.dialogs.indexOf(dialog) == -1;

		this.refresh(ctx);
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
	dialogsCmp(_ctx) {
		if (!this._dialogsCmp) {
			const ctx = _ctx || new jb.jbCtx()
			this._dialogsCmp = ctx.run(dialog.jbDialogs())
			jb.ui.render(jb.ui.h(this._dialogsCmp),ctx.vars.elemToTest || document.body,this._dialogsCmp)
		}
		return this._dialogsCmp
	},
    refresh(ctx) {
		this.dialogsCmp(ctx).setState()
	},
	reRenderAll() {
		return this.dialogs.reduce((p,dialog) => p.then(()=>
			Promise.resolve(dialog.close()).then(()=> {
				const openDialogAction = dialog.comp.ctx.path.split('~').reduce((obj,p)=>obj[p],jb.comps)
				dialog.comp.ctx.ctx({profile: openDialogAction, path: ''}).runItself()
			})), Promise.resolve())
	}
}

jb.component('dialog.jb-dialogs', { 
	type: 'control',
	params: [
	  {id: 'style', dynamic: true },
	],
	impl: ctx => jb.ui.ctrl(ctx,{
		afterViewInit: () => {},
		template: (cmp,state,h) => h('div', { class:'jb-dialogs' }, jb.ui.dialogs.dialogs.map(d=>h(d.comp))  )
	})
})
