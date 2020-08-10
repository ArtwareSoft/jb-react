jb.ns('dialog,dialogs')

jb.component('openDialog', {
  type: 'action,has-side-effects',
  params: [
    {id: 'title', as: 'renderable', dynamic: true},
    {id: 'content', type: 'control', dynamic: true, templateValue: group()},
    {id: 'style', type: 'dialog.style', dynamic: true, defaultValue: dialog.default()},
    {id: 'singletonId', as: 'string', description: 'force one instance of the dialog'},
    {id: 'menu', type: 'control', dynamic: true},
    {id: 'onOK', type: 'action', dynamic: true},
    {id: 'features', type: 'dialog-feature[]', dynamic: true}
  ],
  impl: runActions(
	  Var('$dlg',(ctx,{},{singletonId}) => {
		const dialog = { 
			id: singletonId || `dlg-${ctx.id}`,
		}
		const ctxWithDialog = ctx.componentContext._parent.setVars({
			$dialog: dialog,
			dialogData: {},
			formContainer: { err: ''}
		})
		dialog.ctx = ctxWithDialog
		return dialog
	  }),
	  dialog.createDialogTopIfNeeded(),
	  action.subjectNext(dialogs.changeEmitter(), obj(prop('open',true), prop('dialog','%$$dlg%')))
  )
})

jb.component('openDialog.probe', {
	params: jb.comps.openDialog.params,
	impl: ctx => jb.ui.ctrl(ctx.setVar('$dialog',{}), dialog.init()).renderVdom()
})

jb.component('dialog.init', {
	type: 'feature',
	impl: features(
		calcProp('dummy',ctx => console.log('dialog.init', ctx)),
		calcProp('title', '%$$model/title%'),//(ctx,{$model}) => $model.title(ctx)),
		calcProp('contentComp', '%$$model/content%'),
		calcProp('hasMenu', '%$$model/menu/profile%'),
		calcProp('menuComp', '%$$model/menu%'),
		//passPropToFrontEnd('launchingCmp','%$cmp/cmpId%'),
		feature.init(writeValue('%$$dialog/cmpId%','%$cmp/cmpId%')),
		htmlAttribute('id','%$$dialog/id%'),

		method('dialogCloseOK', dialog.closeDialog(true)),
		method('dialogClose', dialog.closeDialog(false)),
		css('{z-index: 100; top: %$$state/dialogPos/top%px; left: %$$state/dialogPos/left%px }'),
	)
})

jb.component('dialog.buildComp', {
	params: [
		{id: 'dialog' },
	],
	impl: (ctx,dlg) => jb.ui.ctrl(dlg.ctx, dialog.init())
})

jb.component('dialog.createDialogTopIfNeeded', {
	type: 'action',
	impl: ctx => {
		const widgetBody = jb.ui.widgetBody(ctx)
		if (widgetBody.querySelector(':scope>.jb-dialogs')) return
		const vdom = ctx.run(dialog.dialogTop()).renderVdomAndFollowUp()
		if (ctx.vars.headlessWidget) {
			widgetBody.children.push(vdom)
			vdom.parentNode = widgetBody
		} else {
			jb.ui.render(vdom,widgetBody)
		}
	}
})

jb.component('dialog.closeDialog', {
	type: 'action',
	description: 'close parent dialog',
	params: [
		{id: 'OK', type: 'boolean', as: 'boolean', defaultValue: true},
	],
	impl: runActions(
		action.if(and('%$OK%','%$dialog.hasFields%', (ctx,{$dialog}) => 
			jb.ui.checkFormValidation && jb.ui.checkFormValidation(jb.ui.elemOfCmp(ctx, $dialog.cmpId)))),
		action.if(not('%$formContainer.err%'),
			runActions(
				({},{$dialog},{OK}) => OK && $dialog.ctx.params.onOK(),
				action.subjectNext(dialogs.changeEmitter(), obj(prop('close',true), prop('dialogId','%$$dialog/id%')))
			)
		)
	)
})

jb.component('dialog.closeDialogById', {
	type: 'action',
	description: 'close dialog fast without checking validations and running onOK',
	params: [
	  {id: 'id', as: 'string'},
	],
	impl: action.subjectNext(dialogs.changeEmitter(), obj(prop('close',true), prop('dialogId','%$id%')))
})
  
jb.component('dialog.closeAll', {
	type: 'action',
	impl: runActionOnItems(dialogs.shownDialogs(), dialog.closeDialogById('%%'))
})

jb.component('dialog.closeAllPopups', {
	type: 'action',
	impl: runActionOnItems(dialogs.shownPopups(), dialog.closeDialogById('%%'))
})

jb.component('dialogs.shownDialogs', {
	impl: ctx => jb.ui.find(jb.ui.widgetBody(ctx),'.jb-dialog').map(el=> el.getAttribute('id'))
})

jb.component('dialogs.cmpIdOfDialog', {
	params: [
		{id: 'id', as: 'string'},
  	],
	impl: (ctx,id) => jb.ui.find(jb.ui.widgetBody(ctx),`[id="${id}"]`).map(el=> el.getAttribute('cmp-id'))[0]
})

jb.component('dialogs.shownPopups', {
	impl: ctx => jb.ui.find(jb.ui.widgetBody(ctx),'.jb-popup').map(el=>el.getAttribute('id'))
})

jb.component('dialogFeature.modal', {
	description: 'blocks all other screen elements',
	type: 'dialog-feature',
	impl: features(
		frontEnd.init(() =>	jb.ui.addHTML(document.body,'<div class="modal-overlay"></div>')),
		frontEnd.onDestroy(() => Array.from(document.body.querySelectorAll('>.modal-overlay'))
			.forEach(el=>document.body.removeChild(el)))
	)
})

jb.component('dialogFeature.uniqueDialog', {
	type: 'dialog-feature',
	params: [
	  {id: 'id', as: 'string'},
	],
	impl: features(
		passPropToFrontEnd('uniqueId','%$id%'),
		followUp.flow(
			source.data(ctx => jb.ui.find(jb.ui.widgetBody(ctx),'.jb-dialog')
				.filter(el=>el.getAttribute('cmp-id') != ctx.vars.cmp.cmpId)),
			rx.filter('%pass.uniqueId%==%$id%'),
			rx.map(({data}) => data.getAttribute('id')),
			sink.action(dialog.closeDialogById('%%'))
		)
	)
})

jb.component('source.mouseMoveIncludingPreview', {
	type: 'rx',
	impl: rx.merge(
		source.event('mousemove', () => document),
		source.event('mousemove', () => jb.path(jb.studio, 'previewWindow.document'))
	)
})

jb.component('dialogFeature.dragTitle', {
	type: 'dialog-feature',
	params: [
	  {id: 'id', as: 'string'},
	  {id: 'useSessionStorage', as: 'boolean'},
	  {id: 'selector', as: 'string', defaultValue: '.dialog-title'},
	],
	impl: features(
		calcProp('sessionStorageId','dialogPos-%$id%'),
		calcProp('posFromSessionStorage', If('%$useSessionStorage%', getSessionStorage('%$$props/sessionStorageId%'))),
		css(If('%$$props/posFromSessionStorage%','{top: %$$props/posFromSessionStorage/top%px; left: %$$props/posFromSessionStorage/left%px }','')),
		css('%$selector% { cursor: pointer; user-select: none }'),
		frontEnd.method('setPos',({data},{el}) => { 
			el.style.top = data.top + 'px'
			el.style.left = data.left +'px' 
		}),
		passPropToFrontEnd('selector','%$selector%'),
		passPropToFrontEnd('useSessionStorage','%$$props/sessionStorageId%'),
		passPropToFrontEnd('sessionStorageId','%$$props/sessionStorageId%'),
		frontEnd.prop('titleElem',({},{el,selector}) => el.querySelector(selector)),
		frontEnd.flow(
			source.event('mousedown','%$cmp/titleElem%'), 
			rx.takeUntil('%$cmp/destroyed%'),
			rx.var('offset',({data},{el}) => ({
				left: data.clientX - el.getBoundingClientRect().left,
				top:  data.clientY - el.getBoundingClientRect().top
			})),
			rx.flatMap(rx.pipe(
				source.mouseMoveIncludingPreview(),
				rx.takeWhile('%buttons%!=0'),
				rx.var('ev'),
				rx.map(({data},{offset}) => ({
					left: Math.max(0, data.clientX - offset.left),
					top: Math.max(0, data.clientY - offset.top),
				})),
//				rx.log('drag'),
				sink.action(runActions(
					action.runFEMethod('setPos'),
					If('%$useSessionStorage%', action.setSessionStorage('%$sessionStorageId%','%%'))
				))
			)),
			sink.action()
		)
	)
})

jb.component('dialog.default', { /* dialog.default */
	type: 'dialog.style',
	impl: customStyle({
	  template: ({},{title,contentComp},h) => h('div#jb-dialog jb-default-dialog',{},[
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
  impl: features(
	  calcProp('launcherRectangle','%$ev/elem/clientRect%'),
	  passPropToFrontEnd('launcherRectangle','%$$props/launcherRectangle%'),
	  userStateProp('dialogPos', ({},{ev,$props},{offsetLeft,offsetTop,rightSide}) => {
		if (!ev) return { left: 0, top: 0}
		const _offsetLeft = offsetLeft() || 0, _offsetTop = offsetTop() || 0
		if (!$props.launcherRectangle)
			return { left: _offsetLeft + ev.clientX || 0, top: _offsetTop + ev.clientY || 0}
		return {
			left: $props.launcherRectangle.left + _offsetLeft  + (rightSide ? ev.elem.outerWidth : 0), 
			top:  $props.launcherRectangle.top  + _offsetTop   + ev.elem.outerHeight
		}
	  }),
	  frontEnd.init(({},{cmp,$state}) => { // fixDialogPositionAtScreenEdges
		const dialog = jb.ui.findIncludeSelf(cmp.base,'.jb-dialog')[0]
		const dialogPos = $state.dialogPos
		let top,left
		const padding = 2, dialog_height = jb.ui.outerHeight(dialog), dialog_width = jb.ui.outerWidth(dialog);
		if (dialogPos.top > dialog_height && dialogPos.top + dialog_height + padding > window.innerHeight + window.pageYOffset)
			top = dialogPos.top - dialog_height
		if (dialogPos.left > dialog_width && dialogPos.left + dialog_width + padding > window.innerWidth + window.pageXOffset)
			left = dialogPos.left - dialog_width
		if (left || top)
			cmp.refresh({ dialogPos: { top: top || dialogPos.top , left: left || dialogPos.left} })
	  }),
  )
})
  
//   function(context,offsetLeftF,offsetTopF,rightSide) {
// 		return {
// 			afterViewInit: function(cmp) {
// 				let offsetLeft = offsetLeftF() || 0, offsetTop = offsetTopF() || 0;
// 				const jbDialog = jb.ui.findIncludeSelf(cmp.base,'.jb-dialog')[0];
// 				if (!context.vars.$launchingElement) {
// 					if (typeof event == 'undefined')
// 						return console.log('no launcher for dialog');
// 					jbDialog.style.left = offsetLeft + event.clientX + 'px'
// 					jbDialog.style.top = offsetTop + event.clientY + 'px'
// 					return
// 				}
// 				const control = context.vars.$launchingElement.el;
// 				const launcherHeightFix = context.vars.$launchingElement.launcherHeightFix || jb.ui.outerHeight(control)
// 				const pos = jb.ui.offset(control);
// 				offsetLeft += rightSide ? jb.ui.outerWidth(control) : 0;
// 				const fixedPosition = fixDialogOverflow(control,jbDialog,offsetLeft,offsetTop);
// 				jbDialog.style.display = 'block';
// 				jbDialog.style.left = (fixedPosition ? fixedPosition.left : pos.left + offsetLeft) + 'px';
// 				jbDialog.style.top = (fixedPosition ? fixedPosition.top : pos.top + launcherHeightFix + offsetTop) + 'px';
// 			}
// 		}

// 		function fixDialogOverflow(control,dialog,offsetLeft,offsetTop) {
// 			let top,left
// 			const padding = 2,control_offset = jb.ui.offset(control), dialog_height = jb.ui.outerHeight(dialog), dialog_width = jb.ui.outerWidth(dialog);
// 			if (control_offset.top > dialog_height && control_offset.top + dialog_height + padding + (offsetTop||0) > window.innerHeight + window.pageYOffset)
// 				top = control_offset.top - dialog_height;
// 			if (control_offset.left > dialog_width && control_offset.left + dialog_width + padding + (offsetLeft||0) > window.innerWidth + window.pageXOffset)
// 				left = control_offset.left - dialog_width;
// 			if (top || left)
// 				return { top: top || control_offset.top , left: left || control_offset.left}
// 		}
// 	}
// })

jb.component('dialogFeature.onClose', {
  type: 'dialog-feature',
  params: [
    {id: 'action', type: 'action', dynamic: true}
  ],
  impl: backEnd.onDestroy(call('action'))
})

jb.component('dialogFeature.closeWhenClickingOutside', {
  type: 'dialog-feature',
  params: [
    {id: 'delay', as: 'number', defaultValue: 100}
  ],
  impl: features(
	  feature.init(writeValue('%$$dialog.isPopup%',true)),
	  frontEnd.flow(
	  	rx.merge(
			source.event('mousedown','%$cmp.base.ownerDocument%'),
			source.event('mousedown', () => jb.path(jb.studio,'previewWindow.document')),
		),
		rx.takeUntil('%$cmp.destroyed%'),
		rx.filter(({data}) => jb.ui.closest(data.target,'.jb-dialog') == null),
		rx.delay('%$delay%'),
		rx.var('dialogId', ({},{cmp}) => cmp.base.getAttribute('id')),
		sink.action(dialog.closeDialogById('%$dialogId%'))
	))
})

jb.component('dialogFeature.autoFocusOnFirstInput', {
  type: 'dialog-feature',
  params: [
    {id: 'selectText', as: 'boolean', type: 'boolean'}
  ],
  impl: frontEnd.init( (ctx,{cmp},{selectText}) => {
		const elem = cmp.base.querySelector('input,textarea,select');
		if (elem)
			jb.ui.focus(elem, 'dialog-feature.auto-focus-on-first-input',ctx);
		if (selectText)
			elem.select();
	})
})

jb.component('dialogFeature.cssClassOnLaunchingElement', {
  type: 'dialog-feature',
  description: 'launching element toggles class "dialog-open" if the dialog is open',
  impl: features(
	  frontEnd.prop('launchingElement', (ctx,{cmp}) => cmp.launchingCmp && jb.ui.elemOfCmp(ctx,cmp.launchingCmp)),
	  frontEnd.init( ({},{cmp}) => cmp.launchingElement && jb.ui.addClass(cmp.launchingElement,'dialog-open')),
	  frontEnd.onDestroy( ({},{cmp}) => cmp.launchingElement && jb.ui.removeClass(cmp.launchingElement,'dialog-open'))
  )
})
//     context => ({
// 		afterViewInit: cmp => {
// 			if (!context.vars.$launchingElement) return
// 			const {pipe,filter,subscribe,take} = jb.callbag
// 			const dialog = context.vars.$dialog;
// 			const control = context.vars.$launchingElement.el;
// 			jb.ui.addClass(control,'dialog-open');
// 			pipe(dialog.em, filter(e=> e.type == 'close'), take(1), subscribe(()=> jb.ui.removeClass(control,'dialog-open')))
// 		}
// 	})
// })

jb.component('dialogFeature.maxZIndexOnClick', {
  type: 'dialog-feature',
  params: [
    {id: 'minZIndex', as: 'number'}
  ],
  impl: features(
	  passPropToFrontEnd('minZIndex','%$minZIndex%'),
	  frontEnd.method('setAsMaxZIndex', ({},{el,minZIndex}) => {
		  	const dialogs = Array.from(document.querySelectorAll('.jb-dialog'))
			const calcMaxIndex = dialogs.reduce((max, _el) => 
				Math.max(max,(_el && parseInt(_el.style.zIndex || 100)+1) || 100), minZIndex || 100)
			el.style.zIndex = calcMaxIndex
	  }),
	  frontEnd.init(({},{cmp}) => { cmp.state.frontEndStatus = 'ready'; cmp.runFEMethod('setAsMaxZIndex') }),
	  frontEnd.flow(source.frontEndEvent('mousedown'), sink.FEMethod('setAsMaxZIndex'))
  )
})

jb.component('dialog.dialogOkCancel', {
  type: 'dialog.style',
  params: [
    {id: 'okLabel', as: 'string', defaultValue: 'OK'},
    {id: 'cancelLabel', as: 'string', defaultValue: 'Cancel'}
  ],
  impl: customStyle({
    template: (cmp,{title,contentComp,cancelLabel,okLabel},h) => h('div#jb-dialog jb-default-dialog',{},[
			h('div#dialog-title',{},title),
			h('button#dialog-close', { onclick: 'dialogClose' },'×'),
			h(contentComp),
			h('div#dialog-buttons',{},[
				h('button#mdc-button', {onclick: 'dialogClose' }, [h('div#mdc-button__ripple'), h('span#mdc-button__label',{},cancelLabel)]),
				h('button#mdc-button', {onclick: 'dialogCloseOK' },[h('div#mdc-button__ripple'), h('span#mdc-button__label',{},okLabel)]),
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
  impl: features(
	  templateModifier( ({},{vdom}) => { vdom && vdom.tag == 'div' && vdom.children.push(jb.ui.h('img#jb-resizer',{})) }),
	  css('>.jb-resizer { cursor: pointer; position: absolute; right: 1px; bottom: 1px }'),
	  frontEnd.method('setSize',({data},{cmp}) => { 
		cmp.base.style.height = data.top + 'px'
		cmp.base.style.width = data.left +'px'
		if (cmp.base.resizeInnerCodemirror)
			cmp.codeMirrorElem.style.height = (data.top - cmp.codeMirrorElemDiff) + 'px'
	  }),
	  frontEnd.prop('resizerElem',({},{cmp}) => cmp.base.querySelector('.jb-resizer')),
	  passPropToFrontEnd('resizeInnerCodemirror','%$resizeInnerCodemirror%'),
	  frontEnd.prop('codeMirrorElemDiff',({},{el,resizeInnerCodemirror}) => {
		  const codeMirrorElem = resizeInnerCodemirror && el.querySelector('.CodeMirror,.jb-textarea-alternative-for-codemirror')
		  return codeMirrorElem ? codeMirrorElem.getBoundingClientRect().top - el.getBoundingClientRect().top
				+ (el.getBoundingClientRect().bottom - codeMirrorElem.getBoundingClientRect().bottom) : 0
	  }),
	  frontEnd.flow(rx.pipe(
		source.event('mousedown','%$cmp.resizerElem%'), 
		rx.takeUntil('%$cmp.destroyed%'),
		rx.var('offset',({},{el}) => ({
			left: el.getBoundingClientRect().left,
			top:  el.getBoundingClientRect().top
		})),
		rx.flatMap(rx.pipe(
			source.mouseMoveIncludingPreview(), 
			rx.takeWhile('%buttons%!=0'),
			rx.map(({data},{offset}) => ({
				left: Math.max(0, data.clientX - offset.left),
				top: Math.max(0, data.clientY - offset.top),
			})),
			sink.FEMethod('setSize')
		)),
		sink.action()
	)))
})

jb.component('dialog.popup', {
  type: 'dialog.style',
  impl: customStyle({
	template: ({},{contentComp},h) => h('div#jb-dialog jb-popup',{},h(contentComp)),
    css: '{ position: absolute; background: var(--jb-dropdown-background); box-shadow: 2px 2px 3px var(--jb-dropdown-shadow); padding: 3px 0; border: 1px solid var(--jb-dropdown-border) }',
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
	  template: ({},{contentComp},h) => h('div#jb-dialog jb-popup',{},h(contentComp)),
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
    template: ({},{contentComp},h) => h('div#jb-dialog jb-popup',{},h(contentComp)),
    css: '{ position: absolute }'
  })
})

jb.component('dialogs.changeEmitter', {
	type: 'rx',
	params: [
		{id: 'widgetId', defaultValue: '%$widgetId%'},
	],
	category: 'source',
	impl: (ctx,widgetId) => {
		widgetId = widgetId || 'default'
		jb.ui.dlgEmitters = jb.ui.dlgEmitters || {}
		jb.ui.dlgEmitters[widgetId] = jb.ui.dlgEmitters[widgetId] || ctx.run(rx.subject({replay: true}))
		return jb.ui.dlgEmitters[widgetId]
	}
})

jb.component('dialog.dialogTop', {
	type: 'control',
	params: [
		{id: 'widgetId', defaultValue: '%$widgetId%'},
		{id: 'style', type: 'dialogs.style', defaultValue: dialogs.defaultStyle(), dynamic: true},
	],
	impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('dialogs.defaultStyle', {
	type: 'dialogs.style',
	impl: customStyle({
		template: ({},{},h) => h('div#jb-dialogs',{},[]),
		features: [
			followUp.flow(
				source.subject(dialogs.changeEmitter()),
				rx.filter('%open%'),
				rx.var('dialogVdom', pipeline(dialog.buildComp('%dialog%'),'%renderVdomAndFollowUp()%')),
				rx.var('delta', obj(prop('children', obj(prop('toAppend','%$dialogVdom%'))))),
				rx.log('open dialog'),
				sink.applyDeltaToCmp('%$delta%','%$followUpCmp/cmpId%')
			),
			followUp.flow(source.subject(dialogs.changeEmitter()), 
				rx.filter('%close%'),
				rx.var('dlgCmpId', dialogs.cmpIdOfDialog('%dialogId%')),
				rx.var('delta', obj(prop('children', obj(prop('deleteCmp','%$dlgCmpId%'))))),
				rx.log('close dialog'),
				sink.applyDeltaToCmp('%$delta%','%$followUpCmp/cmpId%')
			)
		]
	})
})
