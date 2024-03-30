extension('ui','dialog', {
  dialogTopCmp(ctx) {
      const widgetBody = jb.ui.widgetBody(ctx)
      const elem = widgetBody.querySelector(':scope>.jb-dialogs')
      if (elem) 
        return jb.ui.cmps[elem.getAttribute('cmp-id')]
      const dialogsCmp = ctx.run({$: 'control<>dialog.dialogsTop'})
      const vdom = dialogsCmp.renderVdomAndFollowUp()
      const {headlessWidget, headlessWidgetId, useFrontEndInTest} = ctx.vars
      if ((headlessWidget || useFrontEndInTest )&& widgetBody instanceof jb.ui.VNode) {
        jb.log('dialog headless createTop',{vdom,widgetBody})
        widgetBody.children.push(vdom)
        vdom.parentNode = widgetBody
        const delta = { children: { toAppend: [jb.ui.stripVdom(vdom)] }}
        jb.ui.sendRenderingUpdate(ctx,{delta ,widgetId: headlessWidgetId})
      } else {
        jb.ui.render(vdom,widgetBody)
        jb.log('dialog dom createTop',{vdom,widgetBody})
      }
      // jb.ui.render(vdom,widgetBody,{ctx})
      // if (ctx.vars.widgetId && jb.ui.FEEmulator)
      //   jb.ui.FEEmulator[ctx.vars.widgetId].body.appendChild(jb.ui.cloneVNode(widgetBody.querySelector(':scope>.jb-dialogs')))
      return dialogsCmp
    }
})

component('dialog.dialogsTop', {
  type: 'control',
  params: [
    {id: 'style', type: 'dialogs-style', defaultValue: dialogs.init(), dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

component('dialogs.init', {
  type: 'dialogs-style',
  impl: customStyle({
    template: ({},{},h) => h('div.jb-dialogs'),
    features: [
      method('open dialog', runActions(
        Var('currDialogElem', querySelector('[id="%id%"]')),
        Var('dialogVdom', '%calcVdom()%'),
        If({
          condition: '%$currDialogElem%',
          then: ui.applyNewVdom({ elem: '%$currDialogElem%', vdom: '%$dialogVdom%', strongRefresh: true }),
          Else: ui.applyDeltaToCmp({
            delta: obj(prop('children', obj(prop('toAppend', list('%$dialogVdom%'))))),
            cmpId: '%$cmp/cmpId%',
            assumedVdom: '%$currDialogElem%'
          })
        })
      )),
      method('close dialog', ui.applyDeltaToCmp({
        delta: obj(prop('children', obj(prop('deleteCmp', dialogs.cmpIdOfDialog('%%'))))),
        cmpId: '%$cmp/cmpId%'
      }))
    ]
  })
})

component('openDialog', {
  type: 'action<>',
  hasSideEffect: true,
  params: [
    {id: 'title', type: 'data', moreTypes: 'control<>', as: 'renderable', dynamic: true },
    {id: 'content', type: 'control', dynamic: true, templateValue: {$: 'group' }, defaultValue: { $ : 'text' } },
    {id: 'style', type: 'dialog-style', dynamic: true, defaultValue: dialog.default()},
    {id: 'menu', type: 'control', dynamic: true},
    {id: 'onOK', type: 'action', dynamic: true},
    {id: 'id', as: 'string'},
    {id: 'features', type: 'dialog-feature[]', dynamic: true},
  ],
  impl: ctx => {
    const $dialog = { id: ctx.params.id || `dlg-${ctx.id}`, calcVdom, launcherCmpId: ctx.exp('%$cmp/cmpId%') }
    const ctxWithDialog = ctx.setVars({ $dialog, dialogData: {}, formContainer: { err: ''} })
    $dialog.ctx = ctxWithDialog
    const cmp = jb.ui.ctrl(ctxWithDialog, {$: 'feature<>dialog.init'}) // activate the unique feature that may change the id
    jb.ui.dialogTopCmp(ctx).runBEMethod('open dialog',$dialog)

    function calcVdom() {
        return jb.ui.stripVdom(cmp.renderVdomAndFollowUp())
    }
  }
})

component('unique', {
  type: 'dialog-feature',
  params: [
    {id: 'id', as: 'string', mandatory: true}
  ], 
  impl: (ctx,id) => {
    if (ctx.vars.$dialog) ctx.vars.$dialog.id = id
    return
  }
})

component('inPlaceDialog', {
  type: 'control<>',
  params: [
    {id: 'title', type: 'data', moreTypes: 'control<>', as: 'renderable', dynamic: true },
    {id: 'content', type: 'control', dynamic: true, templateValue: {$: 'group' }, defaultValue: { $ : 'text' } },
    {id: 'style', type: 'dialog-style', dynamic: true, defaultValue: dialog.default()},
    {id: 'menu', type: 'control', dynamic: true},
    {id: 'onOK', type: 'action', dynamic: true},
    {id: 'id', as: 'string'},
    {id: 'features', type: 'dialog-feature[]', dynamic: true},
  ],
  impl: ctx => {
	  const $dialog = { id: ctx.params.id || `dlg-${ctx.id}`, launcherCmpId: ctx.exp('%$cmp/cmpId%') }
    const ctxWithDialog = ctx.setVars({ $dialog, dialogData: {}, formContainer: { err: ''} })
    $dialog.ctx = ctxWithDialog
    return jb.ui.ctrl(ctxWithDialog, {$: 'feature<>dialog.init'})
  }
})

component('openDialog.probe', {
	autoGen: true,
	type: 'action<>',
  hidden: true,
	params: jb.utils.getUnresolvedProfile('openDialog','action<>').params,
	impl: ctx => jb.ui.ctrl(ctx.setVar('$dialog',{}), {$: 'feature<>dialog.init'}).renderVdom(),
})

component('dialog.init', {
  type: 'feature',
  impl: features(
//    calcProp('dummy', ctx => jb.log('dialog init uiComp', {dialog: ctx.vars.$dialog, cmp: ctx.vars.cmp,ctx})),
    calcProp('title', '%$$model/title()%'),
    calcProp('contentComp', '%$$model/content%'),
    calcProp('hasMenu', '%$$model/menu/profile%'),
    calcProp('menuComp', '%$$model/menu%'),
    feature.initValue('%$$dialog/cmpId%', '%$cmp/cmpId%', { alsoWhenNotEmpty: true }),
    htmlAttribute('id', '%$$dialog/id%'),
    method('dialogCloseOK', dialog.closeDialog(true)),
    method('dialogClose', dialog.closeDialog(false)),
    css('z-index: 100')
  )
})

component('dialog.closeDialog', {
  type: 'action',
  description: 'close parent dialog',
  params: [
    {id: 'OK', type: 'boolean', as: 'boolean', defaultValue: true}
  ],
  impl: If('%$$dialog%', runActions(
    If(and('%$OK%','%$$dialog.hasFields%'), (ctx,{$dialog}) => 
			jb.ui.checkFormValidation && jb.ui.checkFormValidation(jb.ui.elemOfCmp(ctx, $dialog.cmpId))),
    If(and('%$OK%', not('%$formContainer.err%')), (ctx,{$dialog}) => {
			jb.log('dialog onOK',{$dialog,ctx})
			$dialog.ctx.params.onOK(ctx)
		}),
    If({
      condition: or(not('%$OK%'), not('%$formContainer.err%')),
      then: dialog.closeDialogById('%$$dialog/id%')
    })
  ))
})

component('dialog.closeDialogById', {
  type: 'action',
  description: 'close dialog fast without checking validations and running onOK',
  params: [
    {id: 'id', as: 'string'}
  ],
  impl: (ctx,id) => jb.ui.dialogTopCmp(ctx).runBEMethod('close dialog',id)
})
  
component('dialog.closeAll', {
  type: 'action',
  impl: runActionOnItems(querySelectorAll('.jb-dialog'), dialog.closeDialogById('%@id%'))
})

component('dialog.closeAllPopups', {
  type: 'action',
  impl: runActionOnItems(querySelectorAll('.jb-popup'), dialog.closeDialogById('%@id%'))
})

component('dialog.isOpen', {
  type: 'boolean',
  params: [
    {id: 'id', as: 'string'}
  ],
  impl: typeAdapter('data<>', dialogs.cmpIdOfDialog('%$id%'))
})

component('dialogs.cmpIdOfDialog', {
  params: [
    {id: 'id', as: 'string'}
  ],
  impl: pipeline(querySelectorAll('[id="%$id%"]'),'%@cmp-id%',first())
})

component('modal', {
  description: 'blocks all other screen elements',
  type: 'dialog-feature',
  impl: features(
    frontEnd.init(() =>	jb.ui.addHTML(document.body,'<div class="modal-overlay"></div>')),
    frontEnd.onDestroy(() => Array.from(document.body.querySelectorAll('>.modal-overlay'))
			.forEach(el=>document.body.removeChild(el)))
  )
})

component('source.eventIncludingPreview', {
  type: 'rx',
  params: [
    {id: 'event', as: 'string'}
  ],
  impl: source.merge(
    source.event('%$event%', () => jb.frame.document),
    source.event('%$event%', () => jb.path(jb.studio, 'previewWindow.document'))
  )
})

component('dragTitle', {
  type: 'dialog-feature',
  params: [
    {id: 'id', as: 'string'},
    {id: 'useSessionStorage', as: 'boolean', type: 'boolean'},
    {id: 'selector', as: 'string', defaultValue: '.dialog-title'}
  ],
  impl: features(
    calcProp('sessionStorageId', 'dialogPos-%$id%'),
    calcProp('posFromSessionStorage', If('%$useSessionStorage%', getSessionStorage('%$$props/sessionStorageId%'))),
    css('%$selector% { cursor: pointer; user-select: none }'),
    frontEnd.method('setPos', ({data},{el}) => { 
      el.style.top = data.top + 'px'
			el.style.left = data.left +'px' 
		}),
    frontEnd.var('selector', '%$selector%'),
    frontEnd.var('useSessionStorage', '%$useSessionStorage%'),
    frontEnd.var('sessionStorageId', '%$$props/sessionStorageId%'),
    frontEnd.var('posFromSessionStorage', '%$$props/posFromSessionStorage%'),
    frontEnd.init(({},{el,posFromSessionStorage}) => {
			if (posFromSessionStorage) {
				el.style.top = posFromSessionStorage.top + 'px'
				el.style.left = posFromSessionStorage.left +'px'
			}
		}),
    frontEnd.prop('titleElem', ({},{el,selector}) => el.querySelector(selector)),
    frontEnd.flow(
      source.event('mousedown', '%$cmp/titleElem%'),
      rx.takeUntil('%$cmp/destroyed%'),
      rx.var('offset', ({data},{el}) => ({
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
  				}))
      )),
      sink.action(runActions(
        action.runFEMethod('setPos'),
        If('%$useSessionStorage%', action.setSessionStorage('%$sessionStorageId%', '%%'))
      ))
    )
  )
})

component('dialog.default', {
  type: 'dialog-style',
  impl: customStyle({
    template: ({},{title,contentComp},h) => h('div.jb-dialog jb-default-dialog',{},[
			  h('div.dialog-title',{},title),
			  h('button.dialog-close', {onclick: 'dialogClose' },'×'),
			  h(contentComp),
		  ]),
    features: dragTitle()
  })
})

component('nearLauncherPosition', {
  type: 'dialog-feature',
  params: [
    {id: 'offsetLeft', as: 'number', dynamic: true, defaultValue: 0},
    {id: 'offsetTop', as: 'number', dynamic: true, defaultValue: 0},
    {id: 'rightSide', as: 'boolean', type: 'boolean'},
    {id: 'insideLauncher', as: 'boolean', type: 'boolean'}
  ],
  impl: features(
    calcProp('launcherRectangle', '%$ev/elem/clientRect%'),
    frontEnd.var('launcherRectangle', '%$$props/launcherRectangle%'),
    frontEnd.var('launcherCmpId', '%$$dialog/launcherCmpId%'),
    frontEnd.var('pos', ({},{},{offsetLeft,offsetTop,rightSide,insideLauncher}) => ({offsetLeft: offsetLeft() || 0, offsetTop: offsetTop() || 0,rightSide,insideLauncher})),
    userStateProp('dialogPos', ({},{ev,$props},{offsetLeft,offsetTop,rightSide,insideLauncher}) => {
      if (!ev) return { left: 0, top: 0}
      const _offsetLeft = offsetLeft() || 0, _offsetTop = offsetTop() || 0
      if (!$props.launcherRectangle)
        return { left: _offsetLeft + (ev.clientX || 0), top: _offsetTop + (ev.clientY || 0)}
      return {
        left: $props.launcherRectangle.left + _offsetLeft  + (rightSide ? ev.elem.outerWidth : 0), 
        top:  $props.launcherRectangle.top  + _offsetTop   + (insideLauncher ? 0 : ev.elem.outerHeight)
      }
	  }),
    frontEnd.onRefresh(({},{$state,el}) => { 
      const {top,left} = $state.dialogPos || { top: 0, left: 0}
      jb.ui.setStyle(el,'top',`${top}px`)
      jb.ui.setStyle(el,'left',`${left}px`)
	  }),
    frontEnd.init((ctx,{cmp,pos,launcherCmpId,elemToTest}) => { // handle launcherCmpId
		  if (!elemToTest && launcherCmpId && cmp.state.dialogPos.left == 0 && cmp.state.dialogPos.top == 0) {
			  const el = jb.ui.elemOfCmp(ctx,launcherCmpId)
			  if (!el || !el.getBoundingClientRect) return // tests
const launcherRectangle = el.getBoundingClientRect()
			  const dialogPos = {
          left: launcherRectangle.left + pos.offsetLeft + (pos.rightSide ? jb.ui.outerWidth(el) : 0), 
          top:  launcherRectangle.top  + pos.offsetTop  + jb.ui.outerHeight(el)
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
      const window = jb.frame.window || {innerHeight: 800, innerWidth: 1200, pageYOffset: 0, pageXOffset: 0}
      const padding = 2, dialog_height = jb.ui.outerHeight(dialog), dialog_width = jb.ui.outerWidth(dialog);
      if (dialogPos.top > dialog_height && dialogPos.top + dialog_height + padding > window.innerHeight + window.pageYOffset)
        top = dialogPos.top - dialog_height
      if (dialogPos.left > dialog_width && dialogPos.left + dialog_width + padding > window.innerWidth + window.pageXOffset)
        left = dialogPos.left - dialog_width
      if (left || top)
        cmp.refreshFE({ dialogPos: { top: top || dialogPos.top , left: left || dialogPos.left} })
	  })
  )
})

component('dialogFeature.onClose', {
  type: 'dialog-feature',
  params: [
    {id: 'action', type: 'action', dynamic: true}
  ],
  impl: onDestroy(call('action'))
})

component('closeWhenClickingOutside', {
  type: 'dialog-feature',
  impl: features(
    feature.initValue('%$$dialog.isPopup%', true),
    frontEnd.flow(
      source.data(0),
      rx.delay(100),
      rx.flatMap(source.eventIncludingPreview('mousedown')),
      rx.takeUntil('%$cmp.destroyed%'),
      rx.filter(({data}) => jb.ui.closest(data.target,'.jb-dialog') == null),
      rx.var('dialogId', ({},{cmp}) => cmp.base.getAttribute('id')),
      sink.action(dialog.closeDialogById('%$dialogId%'))
    )
  )
})

component('autoFocusOnFirstInput', {
  type: 'dialog-feature',
  params: [
    {id: 'selectText', as: 'boolean', type: 'boolean'}
  ],
  impl: features(
    frontEnd.var('selectText', '%$selectText%'),
    frontEnd.init((ctx,{el,selectText}) => {
	    const elem = jb.ui.querySelectorAll(el,'input,textarea,select').filter(e => e.getAttribute('type') != 'checkbox')[0]
		if (elem)
			jb.ui.focus(elem, 'dialog-feature.auto-focus-on-first-input',ctx);
		if (selectText)
			elem.select()
	  })
  )
})

component('popup.regainCanvasFocus', {
  type: 'action',
  impl: action.focusOnCmp('regain focus', '%$popupLauncherCanvas/cmpId%')
})

component('cssClassOnLaunchingElement', {
  type: 'dialog-feature',
  description: 'launching element toggles class "dialog-open" if the dialog is open',
  impl: features(
    frontEnd.prop('launchingElement', (ctx,{cmp}) => cmp.launchingCmp && jb.ui.elemOfCmp(ctx,cmp.launchingCmp)),
    frontEnd.init(({},{cmp}) => cmp.launchingElement && jb.ui.addClass(cmp.launchingElement,'dialog-open')),
    frontEnd.onDestroy(({},{cmp}) => cmp.launchingElement && jb.ui.removeClass(cmp.launchingElement,'dialog-open'))
  )
})

component('maxZIndexOnClick', {
  type: 'dialog-feature',
  params: [
    {id: 'minZIndex', as: 'number', defaultValue: 100}
  ],
  impl: features(
    frontEnd.var('minZIndex', '%$minZIndex%'),
    frontEnd.method('setAsMaxZIndex', (ctx,{el,minZIndex}) => {
			const dialogs = jb.frame.document && Array.from(document.querySelectorAll('.jb-dialog')) 
        || jb.ui.querySelectorAll(jb.ui.widgetBody(ctx),'.jb-dialog')
			const calcMaxIndex = dialogs.filter(dl=>!jb.ui.hasClass(dl, 'jb-popup')).reduce((max, _el) => 
				Math.max(max,(_el && parseInt(jb.ui.getStyle(_el,'zIndex') || 100)+1) || 100), minZIndex || 100)
			jb.ui.setStyle(el,'zIndex',calcMaxIndex)
	  }),
    frontEnd.init(({},{cmp}) => { cmp.state.frontEndStatus = 'ready'; cmp.runFEMethod('setAsMaxZIndex') }),
    frontEnd.flow(source.frontEndEvent('mousedown'), sink.FEMethod('setAsMaxZIndex'))
  )
})

component('dialog.dialogOkCancel', {
  type: 'dialog-style',
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
				h('button.mdc-button', {class: 'dialog-cancel', onclick: 'dialogClose' }, [h('div.mdc-button__ripple'), h('span.mdc-button__label',{},cancelLabel)]),
				h('button.mdc-button', {class: 'dialog-ok', onclick: 'dialogCloseOK' },[h('div.mdc-button__ripple'), h('span.mdc-button__label',{},okLabel)]),
			]),
		]),
    css: '>.dialog-buttons { display: flex; justify-content: flex-end; margin: 5px }',
    features: maxZIndexOnClick()
  })
})

component('dialogFeature.resizer', {
  type: 'dialog-feature',
  params: [
    {id: 'autoResizeInnerElement', as: 'boolean', description: 'effective element with "autoResizeInDialog" class', type: 'boolean'}
  ],
  impl: features(
    templateModifier(({},{vdom}) => { vdom && vdom.tag == 'div' && vdom.children.push(jb.ui.h('img.jb-resizer',{})) }),
    css('>.jb-resizer { cursor: pointer; position: absolute; right: 1px; bottom: 1px }'),
    frontEnd.var('autoResizeInnerElement', '%$autoResizeInnerElement%'),
    frontEnd.method('setSize', ({data},{cmp,el,autoResizeInnerElement}) => { 
		el.style.height = data.top + 'px'
		el.style.width = data.left + 'px'
		const innerElemToResize = el.querySelector('.autoResizeInDialog')
		if (!autoResizeInnerElement || !innerElemToResize) return
		cmp.innerElemOffset = cmp.innerElemOffset || innerElemToResize.getBoundingClientRect().top - el.getBoundingClientRect().top
				  + (el.getBoundingClientRect().bottom - innerElemToResize.getBoundingClientRect().bottom)
		innerElemToResize.style.height = (data.top - cmp.innerElemOffset) + 'px'
	  }),
    frontEnd.prop('resizerElem', ({},{cmp}) => cmp.base.querySelector('.jb-resizer')),
    frontEnd.flow(
      source.event('mousedown', '%$cmp.resizerElem%'),
      rx.takeUntil('%$cmp.destroyed%'),
      rx.var('offset', ({},{el}) => ({
			left: el.getBoundingClientRect().left,
			top:  el.getBoundingClientRect().top
		})),
      rx.flatMap(
        rx.pipe(
          source.eventIncludingPreview('mousemove'),
          rx.takeWhile('%buttons%!=0'),
          rx.map(({data},{offset}) => ({
				left: Math.max(0, data.clientX - offset.left),
				top: Math.max(0, data.clientY - offset.top),
			}))
        )
      ),
      sink.FEMethod('setSize')
    )
  )
})

component('dialog.popup', {
  type: 'dialog-style',
  impl: customStyle({
    template: ({},{contentComp},h) => h('div.jb-dialog jb-popup',{},h(contentComp)),
    css: '{ position: absolute; background: var(--jb-dropdown-bg); box-shadow: 2px 2px 3px var(--jb-dropdown-shadow); padding: 3px 0; border: 1px solid var(--jb-dropdown-border) }',
    features: [
      maxZIndexOnClick(),
      closeWhenClickingOutside(),
      cssClassOnLaunchingElement(),
      nearLauncherPosition()
    ]
  })
})

component('dialog.transparentPopup', {
  type: 'dialog-style',
  impl: customStyle({
    template: ({},{contentComp},h) => h('div.jb-dialog jb-popup',{},h(contentComp)),
    css: '{ position: absolute; padding: 3px 0; }',
    features: [maxZIndexOnClick(), closeWhenClickingOutside(), cssClassOnLaunchingElement(), nearLauncherPosition()]
  })
})
  
component('dialog.div', {
  type: 'dialog-style',
  impl: customStyle({
    template: ({},{contentComp},h) => h('div.jb-dialog jb-popup',{},h(contentComp)),
    css: '{ position: absolute }'
  })
})

component('popupLocation', {
  type: 'dialog-feature<>',
  impl: templateModifier(({},{vdom}) => { 
    const id = (vdom.getAttribute('id')||'').replace(/\s/g,'_')
    if (id && !jb.utils.sessionStorage(id))
      vdom.addClass(`default-location ${id}`)
  })
})
