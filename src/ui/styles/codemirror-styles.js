(function() {

const posToCM = pos => pos && ({line: pos.line, ch: pos.col})
const posFromCM = pos => pos && ({line: pos.line, col: pos.ch})

jb.component('editableText.codemirror', {
  type: 'editable-text.style',
  params: [
    {id: 'cm_settings', as: 'single'},
    {id: 'enableFullScreen', type: 'boolean', as: 'boolean', defaultValue: true},
    {id: 'resizer', type: 'boolean', as: 'boolean', description: 'resizer id or true (id is used to keep size in session storage)'},
    {id: 'height', as: 'string'},
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
    calcProp({id: 'text', value: '%$$model/databind%'}),
    calcProp({
        id: 'textAreaAlternative',
        value: ({},{$props},{maxLength}) => ($props.text || '').length > maxLength
      }),
    ctx => ({
		  template: (cmp,{text,textAreaAlternative},h) =>
			textAreaAlternative ? h('textarea', {class: 'jb-textarea-alternative-for-codemirror', value: text })
				: h('div',{},h('textarea', {class: 'jb-codemirror', value: text })),
	  }),
    interactive(
        (ctx,{cmp},{cm_settings, _enableFullScreen, readOnly, onCtrlEnter, mode, debounceTime, lineWrapping, lineNumbers}) =>{
		if (jb.ui.hasClass(cmp.base, 'jb-textarea-alternative-for-codemirror')) return
		try {
			cmp.data_ref = cmp.ctx.vars.$model.databind()
			if (cmp.data_ref instanceof Promise)
				jb.delay(1).then(() => cmp.refresh(null,{srcCtx: ctx.componentContext}))
			cm_settings = cm_settings||{};
			const adjustedExtraKeys = jb.objFromEntries(jb.entries(cm_settings.extraKeys).map(e=>[
				e[0], _ => jb.ui.wrapWithLauchingElement(ctx2 => ctx2.run(e[1]), cmp.ctx, cmp.base,
				{launcherHeightFix: 1})(cmp.ctx)
			]))
			const effective_settings = Object.assign({},cm_settings, {
				mode: mode || 'javascript',
				lineWrapping, lineNumbers, readOnly,
				theme: 'solarized light',
				autofocus: false,
				extraKeys: Object.assign({
					'Ctrl-Space': 'autocomplete',
					'Ctrl-Enter': editor => onCtrlEnter(ctx.setVars({editor}))
				}, adjustedExtraKeys),
			});
			let editor = null
			cmp.editor = {
				data_ref: cmp.data_ref,
				cmp,
				ctx: () => cmp.ctx.setVars({$launchingElement: { el : cmp.base, launcherHeightFix: 1 }}),
				getCursorPos: () => posFromCM(editor.getCursor()),
				charCoords(pos) {
					return editor.charCoords(posToCM(pos),'window')
				},
				cursorCoords() {
					return editor.cursorCoords('window')
				},
				normalizePreviewCoords(coords) {
					const previewIframe = document.querySelector('.preview-iframe')
					if (!previewIframe) return coords

					const offset = jb.ui.offset(previewIframe)
					return coords && Object.assign(coords,{
						top: coords.top - offset.top,
						left: coords.left - offset.left
					})
				},
				refreshFromDataRef: () => editor.setValue(jb.tostring(jb.val(cmp.data_ref))),
				setValue: text => editor.setValue(text),
				storeToRef: () => jb.writeValue(cmp.data_ref,editor.getValue(), ctx),
				isDirty: () => editor.getValue() !== jb.tostring(jb.val(cmp.data_ref)),
				markText: (from,to) => editor.markText(posToCM(from),posToCM(to), {className: 'jb-highlight-comp-changed'}),
				replaceRange: (text, from, to) => editor.replaceRange(text, posToCM(from),posToCM(to)),
				setSelectionRange: (from, to) => editor.setSelection(posToCM(from),posToCM(to)),
				focus: () => editor.focus(),
				formatComponent() {
					const {text, from, to} = jb.textEditor.formatComponent(editor.getValue(),this.getCursorPos(),cmp.data_ref.jbToUse)
					this.replaceRange(text, from, to)
				},
				cmEditor: editor
			}
			cmp.doRefresh = () => {
				cmp.editor.cmEditor = editor = CodeMirror.fromTextArea(cmp.base.firstChild, effective_settings);
				cmp.data_ref = cmp.ctx.vars.$model.databind()
				editor.setValue(jb.tostring(jb.val(cmp.data_ref)))

				const {pipe,map,filter,subscribe,distinctUntilChanged,create,debounceTime,takeUntil} = jb.callbag

				pipe(
					create(obs=> editor.on('change', () => obs(editor.getValue()))),
					takeUntil( cmp.destroyed ),
					debounceTime(debounceTime),
					filter(x => x != jb.tostring(jb.val(cmp.data_ref))),
					distinctUntilChanged(),
					subscribe(x=> jb.writeValue(cmp.data_ref,x, ctx)))

				!cmp.data_ref.oneWay && jb.isWatchable(cmp.data_ref) && pipe(
						jb.ui.refObservable(cmp.data_ref,cmp,{srcCtx: ctx}),
						map(e=>jb.tostring(jb.val(cmp.data_ref))),
						filter(x => x != editor.getValue()),
						subscribe(x=>{
							const cur = editor.getCursor()
							editor.setValue(x)
							editor.setSelection(cur)
							cmp.editor.markText({line: 0, col:0}, {line: editor.lastLine(), col: 0})
						}))
			}
			cmp.doRefresh()
			const wrapper = editor.getWrapperElement();
			jb.delay(1).then(() => _enableFullScreen && enableFullScreen(editor,jb.ui.outerWidth(wrapper), jb.ui.outerHeight(wrapper)))

		} catch(e) {
			jb.logException(e,'editable-text.codemirror',ctx);
			return;
		}
	}
      ),
    css(
        ({},{},{height}) => `{width: 100%; ${jb.ui.propWithUnits('height',height)}}
		>div { box-shadow: none !important}
	`
      )
  )
})

function enableFullScreen(editor,width,height) {
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
			jb.ui.removeClass(jEditorElem,fullScreenClass);
			window.removeEventListener('resize', onresize);
			editor.setOption("lineNumbers", prevLineNumbers);
			editor.setSize(width, height);
			editor.refresh();
			jEditorElem.removeChild(jb.ui.find(jEditorElem,'.jb-codemirror-escCss')[0]);
		} else if (!onlyBackToNormal) {
			jb.ui.addClass(jEditorElem,fullScreenClass);
			window.addEventListener('resize', onresize);
			onresize();
			document.documentElement.style.overflow = "hidden";
			if (lineNumbers) editor.setOption("lineNumbers", true);
			editor.refresh();
			jb.ui.addHTML(jEditorElem,escText);
      		jb.ui.find(jEditorElem,'.jb-codemirror-escCss')[0].onclick = _ => switchMode(true);
			jb.ui.focus(editor,'code mirror',ctx);
		}
	}

	editor.addKeyMap({
		"F11": function(editor) {
			switchMode();
		},
		"Esc": function(editor) {
			switchMode(true);
		}
	})
}

jb.component('text.codemirror', {
  type: 'text.style',
  params: [
    {id: 'cm_settings', as: 'single'},
    {id: 'enableFullScreen', type: 'boolean', as: 'boolean', defaultValue: true},
    {id: 'resizer', type: 'boolean', as: 'boolean', description: 'resizer id or true (id is used to keep size in session storage)'},
    {id: 'height', as: 'number'},
    {id: 'mode', as: 'string', options: 'htmlmixed,javascript,css'},
    {id: 'lineWrapping', as: 'boolean', type: 'boolean'}
  ],
  impl: function(ctx, cm_settings, _enableFullScreen, resizer,height, mode, lineWrapping) {
        return {
			template: (cmp,state,h) => h('textarea', {class: 'jb-codemirror'}),
			afterViewInit: function(cmp) {
                mode = mode || 'javascript';
                cm_settings = {
                    readOnly: true,
                    mode: mode,
                    lineWrapping: lineWrapping,
                    theme: 'solarized light',
                };
                try {
                  const editor = CodeMirror.fromTextArea(cmp.base.firstChild, effective_settings);
				  const wrapper = editor.getWrapperElement();
					if (height)
						wrapper.style.height = height + 'px';
					jb.delay(1).then(() => {
						if (_enableFullScreen)
							enableFullScreen(editor,jb.ui.outerWidth(wrapper), jb.ui.outerHeight(wrapper))
						editor.refresh(); // ????
					});
                } catch(e) {
                    jb.logException(e,'editable-text.codemirror',ctx);
                    return;
                }
				editor.getWrapperElement().style.boxShadow = 'none';
				const {pipe,map,filter,subscribe,distinctUntilChanged,takeUntil} = jb.callbag
				pipe(jb.ui.resourceChange(),
					takeUntil(cmp.destroyed),
                    map(()=> ctx.vars.$model.text()),
                    filter(x=>x),
                    distinctUntilChanged(),
                    subscribe(x=> editor.setValue(x)))
            }
        }
    }
})

function tgpHint(CodeMirror) {}

})()