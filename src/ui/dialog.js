jb.component('openDialog', {
  type: 'action,has-side-effects',
  params: [
    {id: 'title', as: 'renderable', dynamic: true},
    {id: 'content', type: 'control', dynamic: true, templateValue: group(), defaultValue: text('')},
    {id: 'style', type: 'dialog.style', dynamic: true, defaultValue: dialog.default()},
    {id: 'menu', type: 'control', dynamic: true},
	{id: 'onOK', type: 'action', dynamic: true},
	{id: 'id', as: 'string'},
    {id: 'features', type: 'dialog-feature[]', dynamic: true},
	{id: 'doOpen', type: 'action', dynamic: true, defaultValue: runActions(
		dialog.createDialogTopIfNeeded(),
		action.subjectNext(dialogs.changeEmitter(), obj(prop('open',true), prop('dialog', '%$$dialog%')))
	)}
  ],
  impl: ctx => {
	const $dialog = { id: ctx.params.id || `dlg-${ctx.id}`, launcherCmpId: ctx.exp('%$cmp/cmpId%') }
	const ctxWithDialog = ctx.setVars({
		$dialog,
		dialogData: {},
		formContainer: { err: ''},
	})
	$dialog.ctx = ctxWithDialog
	ctx.params.doOpen(ctxWithDialog)
  }
})

jb.component('openDialog.probe', {
	type: 'control:0',
	params: jb.comps.openDialog.params,
	impl: ctx => jb.ui.ctrl(ctx.setVar('$dialog',{}), {$: 'dialog.init'}).renderVdom(),
	require: {$: 'dialog.init'}
})

jb.component('dialog.init', {
	type: 'feature',
	impl: features(
		calcProp('dummy',ctx => jb.log('dialog init uiComp', {dialog: ctx.vars.$dialog, cmp: ctx.vars.cmp,ctx})),
		calcProp('title', '%$$model/title()%'),
		calcProp('contentComp', '%$$model/content%'),
		calcProp('hasMenu', '%$$model/menu/profile%'),
		calcProp('menuComp', '%$$model/menu%'),
		feature.initValue({to: '%$$dialog/cmpId%', value: '%$cmp/cmpId%', alsoWhenNotEmpty: true}),
		htmlAttribute('id','%$$dialog/id%'),

		method('dialogCloseOK', dialog.closeDialog(true)),
		method('dialogClose', dialog.closeDialog(false)),
		css('z-index: 100'),
	)
})

jb.component('dialog.buildComp', {
	type: 'control:0',
	params: [
		{id: 'dialog', defaultValue: '%$$dialog%' },
	],
	impl: (ctx,dlg) => jb.ui.ctrl(dlg.ctx, {$: 'dialog.init'}),
	require: {$: 'dialog.init'}
})

jb.component('dialog.createDialogTopIfNeeded', {
	type: 'action',
	impl: (ctx) => {
		const widgetBody = jb.ui.widgetBody(ctx)
		if (widgetBody.querySelector(':scope>.jb-dialogs')) return
		const vdom = ctx.run({$: 'dialog.dialogTop'}).renderVdomAndFollowUp()
		if (ctx.vars.headlessWidget && widgetBody instanceof jb.ui.VNode) {
			jb.log('dialog headless createTop',{vdom,widgetBody})
			widgetBody.children.push(vdom)
			vdom.parentNode = widgetBody
			const delta = { children: { toAppend: [jb.ui.stripVdom(vdom)] }}
			jb.ui.renderingUpdates.next({delta ,widgetId: ctx.vars.headlessWidgetId})
		} else {
			jb.ui.render(vdom,widgetBody)
			jb.log('dialog dom createTop',{vdom,widgetBody})
		}
	},
	require: {$: 'dialog.dialogTop'}
})

jb.component('dialog.closeDialog', {
	type: 'action',
	description: 'close parent dialog',
	params: [
		{id: 'OK', type: 'boolean', as: 'boolean', defaultValue: true},
	],
	impl: action.if('%$$dialog%' , runActions(
		action.if(and('%$OK%','%$$dialog.hasFields%', (ctx,{$dialog}) => 
			jb.ui.checkFormValidation && jb.ui.checkFormValidation(jb.ui.elemOfCmp(ctx, $dialog.cmpId)))),
		action.if(and('%$OK%', not('%$formContainer.err%')), (ctx,{$dialog}) => {
			jb.log('dialog onOK',{$dialog,ctx})
			$dialog.ctx.params.onOK(ctx)
		}),
		action.if(or(not('%$OK%'), not('%$formContainer.err%')),
			action.subjectNext(dialogs.changeEmitter(), obj(prop('close',true), prop('dialogId','%$$dialog/id%'))))
	))
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
	impl: runActionOnItems(dialog.shownDialogs(), dialog.closeDialogById('%%'))
})

jb.component('dialog.closeAllPopups', {
	type: 'action',
	impl: runActionOnItems(dialogs.shownPopups(), dialog.closeDialogById('%%'))
})

jb.component('dialog.shownDialogs', {
	impl: ctx => jb.ui.find(jb.ui.widgetBody(ctx),'.jb-dialog').map(el=> el.getAttribute('id'))
})

jb.component('dialog.isOpen', {
	params: [
		{id: 'id', as: 'string'},
  	],
	impl: dialogs.cmpIdOfDialog('%$id%')
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
	impl: If('%$id%', features(
		feature.initValue({to: '%$$dialog/id%',value: '%$id%', alsoWhenNotEmpty: true}),
		followUp.flow(
			source.data(ctx => jb.ui.find(jb.ui.widgetBody(ctx),'.jb-dialog')),
			rx.filter(({data},{cmp},{id}) => data.getAttribute('id') == id && data.getAttribute('cmp-id') != cmp.cmpId ),
			rx.map(({data}) => data.getAttribute('cmp-id')),
			rx.map(obj(prop('closeByCmpId',true), prop('cmpId','%%'), prop('dialogId','%$id%'))),
			rx.log('dialog close uniqueDialog'),
			sink.subjectNext(dialogs.changeEmitter())
		)
	))
})

jb.component('source.eventIncludingPreview', {
	type: 'rx',
	params: [
		{ id: 'event', as: 'string'}],
	impl: rx.merge(
		source.event('%$event%', () => document),
		source.event('%$event%', () => jb.path(jb.studio, 'previewWindow.document'))
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
		css('%$selector% { cursor: pointer; user-select: none }'),
		frontEnd.method('setPos',({data},{el}) => { 
			el.style.top = data.top + 'px'
			el.style.left = data.left +'px' 
		}),
		frontEnd.var('selector','%$selector%'),
		frontEnd.var('useSessionStorage','%$useSessionStorage%'),
		frontEnd.var('sessionStorageId','%$$props/sessionStorageId%'),
		frontEnd.var('posFromSessionStorage','%$$props/posFromSessionStorage%'),
		frontEnd.init(({},{el,posFromSessionStorage}) => {
			if (posFromSessionStorage) {
				el.style.top = posFromSessionStorage.top + 'px'
				el.style.left = posFromSessionStorage.left +'px'
			}
		}),
		frontEnd.prop('titleElem',({},{el,selector}) => el.querySelector(selector)),
		frontEnd.flow(
			source.event('mousedown','%$cmp/titleElem%'), 
			rx.takeUntil('%$cmp/destroyed%'),
			rx.var('offset',({data},{el}) => ({
				left: data.clientX - el.getBoundingClientRect().left,
				top:  data.clientY - el.getBoundingClientRect().top
			})),
			rx.flatMap(rx.pipe(
				source.eventIncludingPreview('mousemove'),
				rx.takeWhile('%buttons%!=0'),
				rx.var('ev'),
				rx.map(({data},{offset}) => ({
					left: Math.max(0, data.clientX - offset.left),
					top: Math.max(0, data.clientY - offset.top),
				})),
			)),
			sink.action(runActions(
				action.runFEMethod('setPos'),
				If('%$useSessionStorage%', action.setSessionStorage('%$sessionStorageId%','%%'))
			))
		)
	)
})

jb.component('dialog.default', {
	type: 'dialog.style',
	impl: customStyle({
	  template: ({},{title,contentComp},h) => h('div.jb-dialog jb-default-dialog',{},[
			  h('div.dialog-title',{},title),
			  h('button.dialog-close', {onclick: 'dialogClose' },'×'),
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
    {id: 'rightSide', as: 'boolean' }
  ],
  impl: features(
	  calcProp('launcherRectangle','%$ev/elem/clientRect%'),
	  frontEnd.var('launcherRectangle','%$$props/launcherRectangle%'),
	  frontEnd.var('launcherCmpId','%$$dialog/launcherCmpId%'),
	  frontEnd.var('pos',({},{},{offsetLeft,offsetTop,rightSide}) => ({offsetLeft: offsetLeft() || 0, offsetTop: offsetTop() || 0,rightSide})),
	  userStateProp('dialogPos', ({},{ev,$props},{offsetLeft,offsetTop,rightSide}) => {
		if (!ev) return { left: 0, top: 0}
		const _offsetLeft = offsetLeft() || 0, _offsetTop = offsetTop() || 0
		if (!$props.launcherRectangle)
			return { left: _offsetLeft + ev.clientX || 0, top: _offsetTop + ev.clientY || 0}
		return {
			left: $props.launcherRectangle.x + _offsetLeft  + (rightSide ? ev.elem.outerWidth : 0), 
			top:  $props.launcherRectangle.y  + _offsetTop   + ev.elem.outerHeight
		}
	  }),
	  frontEnd.onRefresh( ({},{$state,el}) => { 
		const {top,left} = $state.dialogPos || { top: 0, left: 0}
		el.style.top = `${top}px`
		el.style.left = `${left}px`
	  }),
	  frontEnd.init((ctx,{cmp,pos,launcherCmpId,elemToTest}) => { // handle launcherCmpId
		  if (!elemToTest && launcherCmpId && cmp.state.dialogPos.left == 0 && cmp.state.dialogPos.top == 0) {
			  const el = jb.ui.elemOfCmp(ctx,launcherCmpId)
			  if (!el) return
			  const launcherRectangle = el.getBoundingClientRect()
			  const dialogPos = {
				left: launcherRectangle.x + pos.offsetLeft + (pos.rightSide ? jb.ui.outerWidth(el) : 0), 
				top:  launcherRectangle.y  + pos.offsetTop  + jb.ui.outerHeight(el)
			  }
			  if (dialogPos.left != 0 || dialogPos.top != 0)
			  	cmp.refreshFE({ dialogPos })
		  }
	  }),
	  frontEnd.init(({},{cmp,elemToTest}) => { // fixDialogPositionAtScreenEdges
		if (elemToTest || cmp.state.dialogPos.left == 0 && cmp.state.dialogPos.top == 0) return
		const dialog = jb.ui.findIncludeSelf(cmp.base,'.jb-dialog')[0]
		const dialogPos = cmp.state.dialogPos
		let top,left
		const padding = 2, dialog_height = jb.ui.outerHeight(dialog), dialog_width = jb.ui.outerWidth(dialog);
		if (dialogPos.top > dialog_height && dialogPos.top + dialog_height + padding > window.innerHeight + window.pageYOffset)
			top = dialogPos.top - dialog_height
		if (dialogPos.left > dialog_width && dialogPos.left + dialog_width + padding > window.innerWidth + window.pageXOffset)
			left = dialogPos.left - dialog_width
		if (left || top)
			cmp.refreshFE({ dialogPos: { top: top || dialogPos.top , left: left || dialogPos.left} })
	  }),
  )
})

jb.component('dialogFeature.onClose', {
  type: 'dialog-feature',
  params: [
    {id: 'action', type: 'action', dynamic: true}
  ],
  impl: onDestroy(call('action'))
})

jb.component('dialogFeature.closeWhenClickingOutside', {
  type: 'dialog-feature',
  impl: features(
	  feature.initValue('%$$dialog.isPopup%',true),
	  frontEnd.flow(
		source.data(0), rx.delay(100), // wait before start listening
		rx.flatMap(source.eventIncludingPreview('mousedown')),
		// 	rx.merge(
		// 	source.event('mousedown','%$cmp.base.ownerDocument%'),
		// 	source.event('mousedown', () => jb.path(jb.studio,'previewWindow.document')),
		// )),
		rx.takeUntil('%$cmp.destroyed%'),
		rx.filter(({data}) => jb.ui.closest(data.target,'.jb-dialog') == null),
		rx.var('dialogId', ({},{cmp}) => cmp.base.getAttribute('id')),
		sink.action(dialog.closeDialogById('%$dialogId%'))
	))
})

jb.component('dialogFeature.autoFocusOnFirstInput', {
  type: 'dialog-feature',
  params: [
    {id: 'selectText', as: 'boolean', type: 'boolean'}
  ],
  impl: features(
	  frontEnd.var('selectText','%$selectText%'),
	  frontEnd.init( (ctx,{el,selectText}) => {
	    const elem = jb.ui.find(el,'input,textarea,select').filter(e => e.getAttribute('type') != 'checkbox')[0]
		if (elem)
			jb.ui.focus(elem, 'dialog-feature.auto-focus-on-first-input',ctx);
		if (selectText)
			elem.select()
	  })
  )
})

jb.component('popup.regainCanvasFocus', {
	type: 'action',
	impl: action.focusOnCmp('regain focus','%$popupLauncherCanvas/cmpId%')
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

jb.component('dialogFeature.maxZIndexOnClick', {
  type: 'dialog-feature',
  params: [
    {id: 'minZIndex', as: 'number', defaultValue: 100}
  ],
  impl: features(
	  frontEnd.var('minZIndex','%$minZIndex%'),
	  frontEnd.method('setAsMaxZIndex', ({},{el,minZIndex}) => {
		  	const dialogs = Array.from(document.querySelectorAll('.jb-dialog')).filter(dl=>!jb.ui.hasClass(dl, 'jb-popup'))
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
    template: (cmp,{title,contentComp,cancelLabel,okLabel},h) => h('div.jb-dialog jb-default-dialog',{},[
			h('div.dialog-title',{},title),
			h('button.dialog-close', { onclick: 'dialogClose' },'×'),
			h(contentComp),
			h('div.dialog-buttons',{},[
				h('button.mdc-button', {onclick: 'dialogClose' }, [h('div.mdc-button__ripple'), h('span.mdc-button__label',{},cancelLabel)]),
				h('button.mdc-button', {onclick: 'dialogCloseOK' },[h('div.mdc-button__ripple'), h('span.mdc-button__label',{},okLabel)]),
			]),
		]),
	css: '>.dialog-buttons { display: flex; justify-content: flex-end; margin: 5px }',
	features: dialogFeature.maxZIndexOnClick()
  })
})

jb.component('dialogFeature.resizer', {
  type: 'dialog-feature',
  params: [
    {id: 'autoResizeInnerElement', as: 'boolean', description: 'effective element with "autoResizeInDialog" class', type: 'boolean'}
  ],
  impl: features(
	  templateModifier( ({},{vdom}) => { vdom && vdom.tag == 'div' && vdom.children.push(jb.ui.h('img.jb-resizer',{})) }),
	  css('>.jb-resizer { cursor: pointer; position: absolute; right: 1px; bottom: 1px }'),
	  frontEnd.var('autoResizeInnerElement','%$autoResizeInnerElement%'),
	  frontEnd.method('setSize',({data},{cmp,el,autoResizeInnerElement}) => { 
		el.style.height = data.top + 'px'
		el.style.width = data.left + 'px'
		const innerElemToResize = el.querySelector('.autoResizeInDialog')
		if (!autoResizeInnerElement || !innerElemToResize) return
		cmp.innerElemOffset = cmp.innerElemOffset || innerElemToResize.getBoundingClientRect().top - el.getBoundingClientRect().top
				  + (el.getBoundingClientRect().bottom - innerElemToResize.getBoundingClientRect().bottom)
		innerElemToResize.style.height = (data.top - cmp.innerElemOffset) + 'px'
	  }),
	  frontEnd.prop('resizerElem',({},{cmp}) => cmp.base.querySelector('.jb-resizer')),
	  frontEnd.flow(
		source.event('mousedown','%$cmp.resizerElem%'), 
		rx.takeUntil('%$cmp.destroyed%'),
		rx.var('offset',({},{el}) => ({
			left: el.getBoundingClientRect().left,
			top:  el.getBoundingClientRect().top
		})),
		rx.flatMap(rx.pipe(
			source.eventIncludingPreview('mousemove'),
			rx.takeWhile('%buttons%!=0'),
			rx.map(({data},{offset}) => ({
				left: Math.max(0, data.clientX - offset.left),
				top: Math.max(0, data.clientY - offset.top),
			})),
		)),
		sink.FEMethod('setSize')
	))
})

jb.component('dialog.popup', {
  type: 'dialog.style',
  impl: customStyle({
	template: ({},{contentComp},h) => h('div.jb-dialog jb-popup',{},h(contentComp)),
    css: '{ position: absolute; background: var(--jb-dropdown-bg); box-shadow: 2px 2px 3px var(--jb-dropdown-shadow); padding: 3px 0; border: 1px solid var(--jb-dropdown-border) }',
    features: [
      dialogFeature.maxZIndexOnClick(),
      dialogFeature.closeWhenClickingOutside(),
      dialogFeature.cssClassOnLaunchingElement(),
      dialogFeature.nearLauncherPosition()
    ]
  })
})

jb.component('dialog.transparentPopup', {
	type: 'dialog.style',
	impl: customStyle({
	  template: ({},{contentComp},h) => h('div.jb-dialog jb-popup',{},h(contentComp)),
	  css: '{ position: absolute; padding: 3px 0; }',
	  features: [
		dialogFeature.maxZIndexOnClick(),
		dialogFeature.closeWhenClickingOutside(),
		dialogFeature.cssClassOnLaunchingElement(),
		dialogFeature.nearLauncherPosition()
	  ]
	})
})
  
jb.component('dialog.div', {
  type: 'dialog.style',
  impl: customStyle({
    template: ({},{contentComp},h) => h('div.jb-dialog jb-popup',{},h(contentComp)),
    css: '{ position: absolute }'
  })
})

jb.component('dialogs.changeEmitter', {
	type: 'rx',
	params: [
		{id: 'widgetId', defaultValue: '%$headlessWidgetId%'},
	],
	category: 'source',
	impl: (ctx,_widgetId) => {
		const widgetId = !ctx.vars.previewOverlay && _widgetId || 'default'
		jb.ui.dlgEmitters = jb.ui.dlgEmitters || {}
		jb.ui.dlgEmitters[widgetId] = jb.ui.dlgEmitters[widgetId] || ctx.run({$: 'rx.subject', replay: true})
		return jb.ui.dlgEmitters[widgetId]
	},
	require: {$: 'rx.subject'}
})

jb.component('dialogs.destroyAllEmitters', {
	type: 'action',
	impl: () => Object.keys(jb.ui.dlgEmitters||{}).forEach(k=>{
		jb.ui.dlgEmitters[k].trigger.complete()
		delete jb.ui.dlgEmitters[k]
	})
})

jb.component('dialog.dialogTop', {
	type: 'control',
	params: [
		{id: 'style', type: 'dialogs.style', defaultValue: dialogs.defaultStyle(), dynamic: true},
	],
	impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('dialogs.defaultStyle', {
	type: 'dialogs.style',
	impl: customStyle({
		template: ({},{},h) => h('div.jb-dialogs'),
		features: [
			followUp.flow(
				source.subject(dialogs.changeEmitter()),
				rx.filter('%open%'),
				rx.var('dialogVdom', pipeline(dialog.buildComp('%dialog%'),'%renderVdomAndFollowUp()%')),
				rx.var('delta', obj(prop('children', obj(prop('toAppend', pipeline('%$dialogVdom%', ({data}) => jb.ui.stripVdom(data))))))),
				rx.log('open dialog',obj(prop('dialogId','%dialog/id%'))),
				sink.applyDeltaToCmp('%$delta%','%$followUpCmp/cmpId%')
			),
			followUp.flow(source.subject(dialogs.changeEmitter()), 
				rx.filter('%close%'),
				rx.var('dlgCmpId', dialogs.cmpIdOfDialog('%dialogId%')),
				rx.filter('%$dlgCmpId%'),
				rx.var('delta', obj(prop('children', obj(prop('deleteCmp','%$dlgCmpId%'))))),
				rx.log('close dialog',obj(prop('dialogId','%dialogId%'))),
				sink.applyDeltaToCmp('%$delta%','%$followUpCmp/cmpId%')
			),
			followUp.flow(source.subject(dialogs.changeEmitter()), 
				rx.filter('%closeByCmpId%'),
				rx.var('delta', obj(prop('children', obj(prop('deleteCmp','%cmpId%'))))),
				rx.log('close dialog', obj(prop('dialogId','%dialogId%'))),
				sink.applyDeltaToCmp('%$delta%','%$followUpCmp/cmpId%')
			)			
		]
	})
})
