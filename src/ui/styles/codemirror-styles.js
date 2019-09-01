(function() {

const posToCM = pos => pos && ({line: pos.line, ch: pos.col})
const posFromCM = pos => pos && ({line: pos.line, col: pos.ch})

jb.component('editable-text.codemirror', {
	type: 'editable-text.style',
	params: [
		{ id: 'cm_settings', as: 'single' },
		{ id: 'enableFullScreen', type: 'boolean', as: 'boolean', defaultValue: true},
		{ id: 'resizer', type: 'boolean', as: 'boolean', description: 'resizer id or true (id is used to keep size in session storage)' },
		{ id: 'height', as: 'number' },
		{ id: 'mode', as: 'string' },
		{ id: 'debounceTime', as: 'number', defaultValue: 300 },
		{ id: 'lineWrapping', as: 'boolean' },
		{ id: 'lineNumbers', as: 'boolean' },
		{ id: 'readOnly', options: ',true,nocursor' },
		{ id: 'onCtrlEnter', type: 'action', dynamic: true },
		{ id: 'hint', as: 'boolean' }
	],
	impl: function(ctx, cm_settings, _enableFullScreen, resizer, height, mode, debounceTime, lineWrapping) {
		return {
			template: (cmp,state,h) => h('div',{},h('textarea', {class: 'jb-codemirror', value: jb.tostring(cmp.ctx.vars.$model.databind()) })),
			css: '{width: 100%}',
			beforeInit: cmp =>
				cmp.state.databindRef = cmp.ctx.vars.$model.databind(),
			afterViewInit: cmp => {
				try {
					const data_ref = cmp.state.databindRef;
					cm_settings = cm_settings||{};
					const effective_settings = Object.assign({},cm_settings, {
						mode: mode || 'javascript',
						lineWrapping: lineWrapping,
						lineNumbers: ctx.params.lineNumbers,
						theme: 'solarized light',
						autofocus: false,
						extraKeys: Object.assign({
							'Ctrl-Space': 'autocomplete',
							'Ctrl-Enter': editor => ctx.params.onCtrlEnter(ctx.setVars({editor}))
						}, cm_settings.extraKeys || {}),
						readOnly: ctx.params.readOnly,
					});
					const editor = CodeMirror.fromTextArea(cmp.base.firstChild, effective_settings);
					cmp.editor = {
						getCursorPos: () => posFromCM(editor.getCursor()),
						markText: (from,to) => editor.markText(posToCM(from),posToCM(to), {className: 'jb-highlight-comp-changed'}),
						replaceRange: (text, from, to) => editor.replaceRange(text, posToCM(from),posToCM(to)),
						setSelectionRange: (from, to) => editor.setSelection(posToCM(from),posToCM(to)),
						cmEditor: editor
					}
					if (ctx.params.hint)
						tgpHint(CodeMirror)
					const wrapper = editor.getWrapperElement();
					if (height)
						wrapper.style.height = height + 'px';
					jb.delay(1).then(() => {
						if (_enableFullScreen)
							enableFullScreen(editor,jb.ui.outerWidth(wrapper), jb.ui.outerHeight(wrapper))
						editor.refresh(); // ????
					});
					editor.setValue(jb.tostring(data_ref));
				//cmp.lastEdit = new Date().getTime();
					editor.getWrapperElement().style.boxShadow = 'none'; //.css('box-shadow', 'none');
					!data_ref.oneWay && jb.isWatchable(data_ref) && jb.ui.refObservable(data_ref,cmp,{watchScript: ctx})
						.map(e=>jb.tostring(data_ref))
						.filter(x => x != editor.getValue())
						.subscribe(x=>{
							const cur = editor.getCursor()
							editor.setValue(x)
							editor.setSelection(cur)
							cmp.editor.markText({line: 0, col:0}, {line: editor.laseLine(), col: 0})
						});

					const editorTextChange = jb.rx.Observable.create(obs=>
						editor.on('change', () => {
							//cmp.lastEdit = new Date().getTime();
							obs.next(editor.getValue())
						})
					);
					editorTextChange.takeUntil( cmp.destroyed )
						.debounceTime(debounceTime)
						.filter(x =>
							x != jb.tostring(data_ref))
						.distinctUntilChanged()
						.subscribe(x=>
							jb.writeValue(data_ref,x));
				
				} catch(e) {
					jb.logException(e,'editable-text.codemirror',ctx);
					return;
				}
			 }
		}
	}
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
	if (!jb.ui.find('#jb_codemirror_fullscreen')[0])
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
        { id: 'cm_settings', as: 'single' },
        { id: 'enableFullScreen', type: 'boolean', as: 'boolean', defaultValue: true},
        { id: 'resizer', type: 'boolean', as: 'boolean', description: 'resizer id or true (id is used to keep size in session storage)' },
        { id: 'height', as: 'number' },
        { id: 'mode', as: 'string', options: 'htmlmixed,javascript,css' },
        { id: 'lineWrapping', as: 'boolean' },
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
                editor.getWrapperElement().style.boxShadow = 'none'; //.css('box-shadow', 'none');
                jb.ui.resourceChange.takeUntil(cmp.destroyed)
                    .map(()=> ctx.vars.$model.text())
                    .filter(x=>x)
                    .distinctUntilChanged()
                    .subscribe(x=>
                        editor.setValue(x));
            }
        }
    }
})

function tgpHint(CodeMirror) {}
  
})()