
extension('codemirror', {
	injectCodeMirror(ctx,{text,cmp,el,cm_settings,_enableFullScreen,formatText}) {
		if (cmp.editor) return
		if (text == null) {
			jb.logError('codemirror - no binding to text',{ctx, cmp})
			text = 'error'
		}
		const _extraKeys = { ...cm_settings.extraKeys, ...jb.path(cmp.extraCmSettings,'extraKeys')}
		const extraKeys = jb.objFromEntries(jb.entries(_extraKeys).map(e=>[
			e[0], (''+e[1]).replace(/\s/g,'').indexOf('()=>') == 0 ? e[1]
				: _ => ctx.setVar('ev',jb.ui.buildUserEvent({},el)).run(action.runBEMethod(e[1]))
		]))
		const gutters = [ ...(cm_settings.gutters || []), ...(jb.path(cmp.extraCmSettings,'gutters') || []) ]
		const settings = {...cm_settings, ...cmp.extraCmSettings, value: text || '', autofocus: false, extraKeys, gutters }
		cmp.editor = CodeMirror(el, settings)
		cmp.editor.getWrapperElement().setAttribute('jb_external','true')
		jb.ui.addClass(cmp.editor.getWrapperElement(),'autoResizeInDialog')
		if (formatText) {
			CodeMirror.commands.selectAll(cmp.editor)
			cmp.editor.autoFormatRange(cmp.editor.getCursor(true), cmp.editor.getCursor(false));
			cmp.editor.setSelection({line:0, ch:0})
		}
		//cmp.editor.refresh()
		_enableFullScreen && jb.delay(1).then(() => jb.codemirror.enableFullScreen(ctx,cmp,el))
	},
	mergeSettings(s1 = {},s2 = {}) {
		const extraKeys = {...(s1.extraKeys ||{}), ...(s2.extraKeys ||{})}
		const gutters = [...(s1.gutters ||[]), ...(s2.gutters ||[])]
		return {...s1,...s2,extraKeys,gutters}
    },
	enableFullScreen(ctx,cmp,el) {
		const width = jb.ui.outerWidth(el), height = jb.ui.outerHeight(el), editor = cmp.editor
		const fullScreenBtnHtml = '<div class="jb-codemirror-fullScreenBtnCss hidden"><img title="Full Screen (F11)" src="http://png-1.findicons.com/files/icons/1150/tango/22/view_fullscreen.png"/></div>'
		const escText = '<span class="jb-codemirror-escCss">Press ESC or F11 to exit full screen</span>'
		const lineNumbers = true
		const css = `
			.jb-codemirror-escCss { cursor:default; text-align: center; width: 100%; position:absolute; top:0px; left:0px; font-family: arial; font-size: 11px; color: #a00; padding: 2px 5px 3px; }
			.jb-codemirror-escCss:hover { text-decoration: underline; }
			.jb-codemirror-fullScreenBtnCss { position:absolute; bottom:5px; right:15px; -webkit-transition: opacity 1s; z-index: 20; }
			.jb-codemirror-fullScreenBtnCss.hidden { opacity:0; }
			.jb-codemirror-editorCss { position:relative; }
			.jb-codemirror-fullScreenEditorCss { padding-top: 20px, display: block; position: fixed !important; top: 0; left: 0; z-index: 99999999; }
		`;
		if (!jb.ui.find(document,'#jb_codemirror_fullscreen')[0])
			jb.ui.addHTML(document.head,`<style id="jb_codemirror_fullscreen" type="text/css">${css}</style>`)
	
		const jEditorElem = editor.getWrapperElement()
		  jb.ui.addClass(jEditorElem,'jb-codemirror-editorCss')
		const prevLineNumbers = editor.getOption('lineNumbers')
		  jb.ui.addHTML(jEditorElem,fullScreenBtnHtml)
		const fullScreenButton =jb.ui.find(jEditorElem,'.jb-codemirror-fullScreenBtnCss')[0]
		fullScreenButton.onclick = _ => switchMode()
		fullScreenButton.onmouseenter = _ => jb.ui.removeClass(fullScreenButton,'hidden')
		fullScreenButton.onmouseleave = _ => jb.ui.addClass(fullScreenButton,'hidden')
	
		const fullScreenClass = 'jb-codemirror-fullScreenEditorCss'
	
		function onresize() {
			const wrapper = editor.getWrapperElement()
			wrapper.style.width = window.innerWidth + 'px'
			wrapper.style.height = window.innerHeight + 'px'
			editor.setSize(window.innerWidth, window.innerHeight - 20)
			jEditorElem.style.height = document.body.innerHeight + 'px' //Math.max( document.body.innerHeight, $(window).height()) + 'px' );
		}
	
		function switchMode(onlyBackToNormal) {
			cmp.innerElemOffset = null
			if (jb.ui.hasClass(jEditorElem,fullScreenClass)) {
				jb.ui.removeClass(jEditorElem,fullScreenClass)
				window.removeEventListener('resize', onresize)
				editor.setOption('lineNumbers', prevLineNumbers)
				editor.setSize(width, height)
				editor.refresh()
				jEditorElem.removeChild(jb.ui.find(jEditorElem,'.jb-codemirror-escCss')[0])
				jEditorElem.style.width = null
			} else if (!onlyBackToNormal) {
				jb.ui.addClass(jEditorElem,fullScreenClass)
				window.addEventListener('resize', onresize)
				onresize()
				document.documentElement.style.overflow = 'hidden'
				if (lineNumbers) editor.setOption('lineNumbers', true)
				editor.refresh()
				jb.ui.addHTML(jEditorElem,escText)
				  jb.ui.find(jEditorElem,'.jb-codemirror-escCss')[0].onclick = _ => switchMode(true)
				jb.ui.focus(editor,'code mirror',ctx)
			}
		}
	
		editor.addKeyMap({
			'F11': () => switchMode(),
			'Esc': () => switchMode(true)
		})
	}	
})

component('editableText.codemirror', {
  type: 'editable-text.style',
  params: [
    {id: 'cm_settings', as: 'single'},
    {id: 'enableFullScreen', type: 'boolean', as: 'boolean', defaultValue: true},
    {id: 'height', as: 'string', defaultValue: 300},
    {id: 'mode', as: 'string'},
    {id: 'debounceTime', as: 'number', defaultValue: 300},
    {id: 'lineWrapping', as: 'boolean', type: 'boolean'},
    {id: 'lineNumbers', as: 'boolean', type: 'boolean'},
    {id: 'readOnly', options: ',true,nocursor'},
    {id: 'onCtrlEnter', type: 'action', dynamic: true},
    {id: 'hint', as: 'boolean', type: 'boolean'},
    {id: 'maxLength', as: 'number', defaultValue: 5000}
  ],
  impl: features(
    frontEnd.requireExternalLibrary(['codemirror.js','css/codemirror.css']),
	calcProp('text','%$$model/databind()%'),
	frontEnd.var('text', '%$$props/text%'),
    calcProp('textAreaAlternative',({},{$props},{maxLength}) => ($props.text || '').length > maxLength),
    () => ({
		  template: ({},{text,textAreaAlternative},h) => textAreaAlternative ? 
		  		h('textarea.jb-textarea-alternative-for-codemirror autoResizeInDialog', {value: text }) :
				h('div'),
	}),
	frontEnd.var('cm_settings', ({},{},{cm_settings,lineWrapping, mode, lineNumbers, readOnly}) => ({
		...cm_settings, lineWrapping, lineNumbers, readOnly, mode: mode || 'javascript',
	})),
	frontEnd.var('_enableFullScreen', '%$enableFullScreen%'),
	method('onCtrlEnter', call('onCtrlEnter')),
	//codemirror.enrichUserEvent(),
    frontEnd.init( (ctx,vars) => ! jb.ui.hasClass(vars.el, 'jb-textarea-alternative-for-codemirror')
		 && jb.codemirror.injectCodeMirror(ctx,vars)),
	frontEnd.onRefresh(({},{text,cmp}) => text != null && cmp.editor && cmp.editor.setValue(text)),
	method('writeText',writeValue('%$$model/databind()%','%%')),
	frontEnd.flow(
			source.callbag(({},{cmp}) => jb.callbag.create(obs=> cmp.editor && cmp.editor.on('change', () => obs(cmp.editor.getValue()))) ),
			rx.takeUntil('%$cmp/destroyed%'),
			rx.debounceTime('%$debounceTime%'),
			rx.distinctUntilChanged(),
			sink.BEMethod('writeText','%%')
	),
    css(({},{},{height}) => `{width: 100% }
		>div { box-shadow: none !important; ${jb.ui.propWithUnits('height',height)} !important}`)
  )
})

component('codemirror.textEditorKeys', {
	type: 'feature',
	impl: frontEnd.prop('extraCmSettings', ({},{cmp}) => jb.codemirror.mergeSettings(cmp.extraCmSettings, {
		extraKeys: {
			'Ctrl-Space': 'autocomplete',
			'Ctrl-Enter': () => jb.ui.runBEMethod(el,'onCtrlEnter'),
		},
	})),
})

component('codemirror.fold', {
	type: 'feature',
	impl: frontEnd.prop('extraCmSettings', ({},{cmp}) => jb.codemirror.mergeSettings(cmp.extraCmSettings, {
		extraKeys: {
			'Ctrl-Q': () => cmp.editor.foldCode(cmp.editor.getCursor())
		},
		lineWrapping: true,
		foldGutter: true,			
		gutters: [ 'CodeMirror-foldgutter' ]
	})),
})

component('codemirror.lineNumbers', {
	type: 'feature',
	impl: frontEnd.prop('extraCmSettings', ({},{cmp}) => jb.codemirror.mergeSettings(cmp.extraCmSettings, {
		lineNumbers: true,
		gutters: ['CodeMirror-linenumbers' ]
	})),
})

component('codemirror.enrichUserEvent', {
    type: 'feature',
    params: [
      {id: 'cmSelector', as: 'string', description: 'used for external buttons'}
    ],
    impl: features(
		frontEnd.var('cmSelector','%$cmSelector%'),
        frontEnd.enrichUserEvent((ctx,{cmp,cmSelector}) => {
			const elem = cmSelector ? jb.ui.widgetBody(ctx).querySelector(cmSelector) : cmp.base
			const editor = elem && elem.editor
            return editor && {
                outerHeight: jb.ui.outerHeight(elem), 
                outerWidth: jb.ui.outerWidth(elem), 
                clientRect: elem.getBoundingClientRect(),
                text: editor.getValue(),
                selectionStart: {line: editor.getCursor().line, col: editor.getCursor().ch}
            }
        })
    )
})

component('text.codemirror', {
  type: 'text.style',
  params: [
    {id: 'cm_settings', as: 'single'},
    {id: 'enableFullScreen', type: 'boolean', as: 'boolean', defaultValue: true},
	{id: 'height', as: 'number'},
    {id: 'lineWrapping', as: 'boolean', type: 'boolean'},
	{id: 'lineNumbers', as: 'boolean', type: 'boolean'},
	{id: 'formatText', as: 'boolean', type: 'boolean'},
    {id: 'mode', as: 'string', options: 'htmlmixed,javascript,css'},
  ],
  impl: features(
    frontEnd.requireExternalLibrary(['codemirror.js','css/codemirror.css']),
	frontEnd.var('text', '%$$model/text()%'),
    () => ({ template: ({},{},h) => h('div') }),
	frontEnd.var('cm_settings', ({},{},{cm_settings,lineWrapping, mode, lineNumbers}) => ({
		...cm_settings, lineWrapping, lineNumbers, readOnly: true, mode: mode || 'javascript',
	})),
	frontEnd.var('_enableFullScreen', '%$enableFullScreen%'),
	frontEnd.var('formatText', '%$formatText%'),
    frontEnd.init( (ctx,vars) => jb.codemirror.injectCodeMirror(ctx,vars)),
//	frontEnd.onRefresh((ctx,vars) => { jb.codemirror.injectCodeMirror(ctx,vars); vars.cmp.editor.setValue(vars.text) }),	
    css(({},{},{height}) => `{width: 100%}
		>div { box-shadow: none !important; ${jb.ui.propWithUnits('height',height)} !important}`)
  )
})
