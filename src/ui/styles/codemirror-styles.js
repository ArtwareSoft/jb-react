(function() {
jb.ns('textEditor')

const posToCM = pos => pos && ({line: pos.line, ch: pos.col})
const posFromCM = pos => pos && ({line: pos.line, col: pos.ch})

jb.component('editableText.codemirror', {
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
	calcProp('text','%$$model/databind()%'),
	frontEnd.var('text', '%$$props/text%'),
    calcProp('textAreaAlternative',({},{$props},{maxLength}) => ($props.text || '').length > maxLength),
    ctx => ({
		  template: (cmp,{text,textAreaAlternative},h) => textAreaAlternative ? 
		  		h('textarea#jb-textarea-alternative-for-codemirror', {value: text }) :
				h('div'),
	}),
	frontEnd.var('cm_settings', ({},{},{cm_settings,lineWrapping, mode, lineNumbers, readOnly}) => ({
		...cm_settings, lineWrapping, lineNumbers, readOnly, mode: mode || 'javascript',
	})),
	frontEnd.var('_enableFullScreen', '%$enableFullScreen%'),
	method('onCtrlEnter', call('onCtrlEnter')),
	textEditor.cmEnrichUserEvent(),
    frontEnd.init( (ctx,{cmp,el,cm_settings,_enableFullScreen,text}) =>{
		if (jb.ui.hasClass(el, 'jb-textarea-alternative-for-codemirror')) return
		const adjustedExtraKeys = jb.objFromEntries(jb.entries(cm_settings.extraKeys).map(e=>[
			e[0], _ => ctx.setVar('ev',jb.ui.buildUserEvent({},el)).run(action.runBEMethod(e[1]))
		]))
		const effective_settings = Object.assign({}, cm_settings, {
			value: text,
			theme: 'solarized light',
			autofocus: false,
			extraKeys: Object.assign({
				'Ctrl-Space': 'autocomplete',
				'Ctrl-Enter': () => jb.ui.runBEMethod(el,'onCtrlEnter')
			}, adjustedExtraKeys),
		})
		cmp.editor = CodeMirror(el, effective_settings)
		_enableFullScreen && jb.delay(1).then(() => 
			enableFullScreen(ctx,cmp.editor,jb.ui.outerWidth(el), jb.ui.outerHeight(el)))
	}),
	frontEnd.onRefresh(({},{text,cmp}) => cmp.editor.setValue(text)),
	method('writeText',writeValue('%$$model/databind()%','%%')),
	frontEnd.flow(
			source.callbag(({},{cmp}) => jb.callbag.create(obs=> cmp.editor.on('change', () => obs(cmp.editor.getValue()))) ),
			rx.takeUntil('%$cmp/destroyed%'),
			rx.debounceTime('%$debounceTime%'),
			rx.distinctUntilChanged(),
			sink.BEMethod('writeText','%%')
	),
    css(({},{},{height}) => `{width: 100% }
		>div { box-shadow: none !important; ${jb.ui.propWithUnits('height',height)} !important}`)
  )
})

jb.component('textEditor.cmEnrichUserEvent', {
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
                selectionStart: posFromCM(editor.getCursor()),
            }
        })
    )
})

function enableFullScreen(ctx,editor,width,height) {
	const escText = '<span class="jb-codemirror-escCss">Press ESC or F11 to exit full screen</span>';
	const fullScreenBtnHtml = '<div class="jb-codemirror-fullScreenBtnCss hidden"><img title="Full Screen (F11)" src="http://png-1.findicons.com/files/icons/1150/tango/22/view_fullscreen.png"/></div>';
	const lineNumbers = true;
	const css = `
		.jb-codemirror-escCss { cursor:default; text-align: center; width: 100%; position:absolute; top:0px; left:0px; font-family: arial; font-size: 11px; color: #a00; padding: 2px 5px 3px; }
		.jb-codemirror-escCss:hover { text-decoration: underline; }
		.jb-codemirror-fullScreenBtnCss { position:absolute; bottom:5px; right:5px; -webkit-transition: opacity 1s; z-index: 20; }
		.jb-codemirror-fullScreenBtnCss.hidden { opacity:0; }
		.jb-codemirror-editorCss { position:relative; }
		.jb-codemirror-fullScreenEditorCss { padding-top: 20px, display: block; position: fixed !important; top: 0; left: 0; z-index: 99999999; }
	`;
	if (!jb.ui.find(document,'#jb_codemirror_fullscreen')[0])
    	jb.ui.addHTML(document.head,`<style id="jb_codemirror_fullscreen" type="text/css">${css}</style>`);

	const jEditorElem = editor.getWrapperElement();
  	jb.ui.addClass(jEditorElem,'jb-codemirror-editorCss');
	const prevLineNumbers = editor.getOption("lineNumbers");
  	jb.ui.addHTML(jEditorElem,fullScreenBtnHtml);
	const fullScreenButton =jb.ui.find(jEditorElem,'.jb-codemirror-fullScreenBtnCss')[0];
	fullScreenButton.onclick = _ => switchMode();
	fullScreenButton.onmouseenter = _ => jb.ui.removeClass(fullScreenButton,'hidden');
	fullScreenButton.onmouseleave = _ => jb.ui.addClass(fullScreenButton,'hidden');

	const fullScreenClass = 'jb-codemirror-fullScreenEditorCss';

	function onresize() {
		const wrapper = editor.getWrapperElement();
		wrapper.style.width = window.innerWidth + 'px';
		wrapper.style.height = window.innerHeight + 'px';
		editor.setSize(window.innerWidth, window.innerHeight - 20);
		jEditorElem.style.height = document.body.innerHeight + 'px'; //Math.max( document.body.innerHeight, $(window).height()) + 'px' );
	}

	function switchMode(onlyBackToNormal) {
		if (jb.ui.hasClass(jEditorElem,fullScreenClass)) {
			jb.ui.removeClass(jEditorElem,fullScreenClass)
			window.removeEventListener('resize', onresize)
			editor.setOption("lineNumbers", prevLineNumbers)
			editor.setSize(width, height)
			editor.refresh()
			jEditorElem.removeChild(jb.ui.find(jEditorElem,'.jb-codemirror-escCss')[0])
		} else if (!onlyBackToNormal) {
			jb.ui.addClass(jEditorElem,fullScreenClass)
			window.addEventListener('resize', onresize)
			onresize()
			document.documentElement.style.overflow = "hidden"
			if (lineNumbers) editor.setOption("lineNumbers", true)
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

jb.component('text.codemirror', {
  type: 'text.style',
  params: [
    {id: 'cm_settings', as: 'single'},
    {id: 'enableFullScreen', type: 'boolean', as: 'boolean', defaultValue: true},
	{id: 'height', as: 'number'},
    {id: 'lineWrapping', as: 'boolean', type: 'boolean'},
    {id: 'lineNumbers', as: 'boolean', type: 'boolean'},
    {id: 'mode', as: 'string', options: 'htmlmixed,javascript,css'},
  ],
  impl: features(
	text.bindText(),
	frontEnd.var('text', '%$$props/text%'),
    ctx => ({ template: ({},{},h) => h('div') }),
	frontEnd.var('cm_settings', (ctx,{},{cm_settings,lineWrapping, mode, lineNumbers}) => ({
		...cm_settings, lineWrapping, lineNumbers, readOnly: true, mode: mode || 'javascript',
	})),
	frontEnd.var('_enableFullScreen', '%$enableFullScreen%'),
    frontEnd.init( (ctx,{el}) => {
		const cm_settings = cmp.base.cm_settings
		const effective_settings = Object.assign({}, cm_settings, {
			theme: 'solarized light',
			autofocus: false,
		})
		cmp.editor = CodeMirror(el, effective_settings)
		_enableFullScreen && jb.delay(1).then(() => 
			enableFullScreen(ctx,cmp.editor,jb.ui.outerWidth(el), jb.ui.outerHeight(el)))
	}),
	frontEnd.onRefresh(({},{text,cmp}) => cmp.editor.setValue(text)),	
    css(({},{},{height}) => `{width: 100%}
		>div { box-shadow: none !important; ${jb.ui.propWithUnits('height',height)} !important}`)
  )
})

			// let editor = null
			// cmp.editor = {
			// 	data_ref: cmp.data_ref,
			// 	cmp,
			// 	ctx: () => cmp.ctx.setVars({$launchingElement: { el : cmp.base, launcherHeightFix: 1 }}),
			// 	getCursorPos: () => posFromCM(editor.getCursor()),
			// 	charCoords(pos) {
			// 		return editor.charCoords(posToCM(pos),'window')
			// 	},
			// 	cursorCoords() {
			// 		return editor.cursorCoords('window')
			// 	},
			// 	normalizePreviewCoords(coords) {
			// 		const previewIframe = document.querySelector('.preview-iframe')
			// 		if (!previewIframe) return coords

			// 		const offset = jb.ui.offset(previewIframe)
			// 		return coords && Object.assign(coords,{
			// 			top: coords.top - offset.top,
			// 			left: coords.left - offset.left
			// 		})
			// 	},
			// 	refreshFromDataRef: () => editor.setValue(jb.tostring(jb.val(cmp.data_ref))),
			// 	setValue: text => editor.setValue(text),
			// 	storeToRef: () => jb.writeValue(cmp.data_ref,editor.getValue(), ctx),
			// 	isDirty: () => editor.getValue() !== jb.tostring(jb.val(cmp.data_ref)),
			// 	markText: (from,to) => editor.markText(posToCM(from),posToCM(to), {className: 'jb-highlight-comp-changed'}),
			// 	replaceRange: (text, from, to) => editor.replaceRange(text, posToCM(from),posToCM(to)),
			// 	setSelectionRange: (from, to) => editor.setSelection(posToCM(from),posToCM(to)),
			// 	focus: () => editor.focus(),
			// 	formatComponent() {
			// 		const {text, from, to} = jb.textEditor.formatComponent(editor.getValue(),this.getCursorPos(),cmp.data_ref.jbToUse)
			// 		this.replaceRange(text, from, to)
			// 	},
			// 	cmEditor: editor
			// }

				// 		cmp.frontEndRefresh = () => {
	// 			cmp.editor.cmEditor = editor = CodeMirror.fromTextArea(cmp.base.firstChild, effective_settings);
	// 			cmp.data_ref = cmp.ctx.vars.$model.databind()
	// 			editor.setValue(jb.tostring(jb.val(cmp.data_ref)))

	// 			const {pipe,map,filter,subscribe,distinctUntilChanged,create,debounceTime,takeUntil} = jb.callbag

	// 			pipe(
	// 				create(obs=> editor.on('change', () => obs(editor.getValue()))),
	// 				takeUntil( cmp.destroyed ),
	// 				debounceTime(debounceTime),
	// 				filter(x => x != jb.tostring(jb.val(cmp.data_ref))),
	// 				distinctUntilChanged(),
	// 				subscribe(x=> jb.writeValue(cmp.data_ref,x, ctx)))

	// 			!cmp.data_ref.oneWay && jb.isWatchable(cmp.data_ref) && pipe(
	// 					jb.ui.refObservable(cmp.data_ref,cmp,{srcCtx: ctx}),
	// 					map(e=>jb.tostring(jb.val(cmp.data_ref))),
	// 					filter(x => x != editor.getValue()),
	// 					subscribe(x=>{
	// 						const cur = editor.getCursor()
	// 						editor.setValue(x)
	// 						editor.setSelection(cur)
	// 						cmp.editor.markText({line: 0, col:0}, {line: editor.lastLine(), col: 0})
	// 					}))
	// 		}
	// 		cmp.frontEndRefresh()
	// 		const wrapper = editor.getWrapperElement();
	// 		jb.delay(1).then(() => _enableFullScreen && enableFullScreen(editor,jb.ui.outerWidth(wrapper), jb.ui.outerHeight(wrapper)))

	// 	} catch(e) {
	// 		jb.logException(e,'editable-text.codemirror',ctx);
	// 		return;
	// 	}
	// }),

})()