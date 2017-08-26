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
	],
	impl: function(context, cm_settings, _enableFullScreen, resizer, height, mode, debounceTime, lineWrapping) {
		return {
			template: (cmp,state,h) => h('div',{},h('textarea', {class: 'jb-codemirror', value: jb.tostring(cmp.ctx.vars.$model.databind) })),
			css: '{width: 100%}',
			afterViewInit: cmp => {
				var data_ref = cmp.ctx.vars.$model.databind;
				var _cm_settings = Object.assign(cm_settings||{}, {
					mode: mode || 'javascript',
					lineWrapping: lineWrapping,
          lineNumbers: context.params.lineNumbers,
					theme: 'solarized light',
          autofocus: false,
					extraKeys: {
						'Ctrl-Space': 'autocomplete',
						'Ctrl-Enter': () => context.params.onCtrlEnter()
					},
          readOnly: context.params.readOnly,
				});
				try {
					var editor = CodeMirror.fromTextArea(cmp.base.firstChild, _cm_settings);
					var wrapper = editor.getWrapperElement();
					if (height)
						wrapper.style.height = height + 'px';
					// jb.delay(1).then(() => {
					// 	if (_enableFullScreen)
					// 		enableFullScreen(editor,jb.ui.outerWidth(wrapper), jb.ui.outerHeight(wrapper))
					// 	editor.refresh(); // ????
					// });
					editor.setValue(jb.tostring(data_ref));
				} catch(e) {
					jb.logException(e,'editable-text.codemirror');
					return;
				}
				//cmp.lastEdit = new Date().getTime();
				editor.getWrapperElement().style.boxShadow = 'none'; //.css('box-shadow', 'none');
				jb.ui.refObservable(data_ref,cmp,{throw: true})
					.map(e=>jb.tostring(data_ref))
//					.filter(x => new Date().getTime() - cmp.lastEdit > 500)
					.filter(x => x != editor.getValue())
					.catch(x=>editor.setValue('error') || []) // todo: also set to readOnly
					.subscribe(x=>
						editor.setValue(x));

				var editorTextChange = jb.rx.Observable.create(obs=>
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
			}
		}
	}
})

function enableFullScreen(editor,width,height) {
	var escText = '<span class="jb-codemirror-escCss">Press ESC or F11 to exit full screen</span>';
	var fullScreenBtnHtml = '<div class="jb-codemirror-fullScreenBtnCss hidden"><img title="Full Screen (F11)" src="http://png-1.findicons.com/files/icons/1150/tango/22/view_fullscreen.png"/></div>';
	var lineNumbers = true;
	var css = `
		.jb-codemirror-escCss { cursor:default; text-align: center; width: 100%; position:absolute; top:0px; left:0px; font-family: arial; font-size: 11px; color: #a00; padding: 2px 5px 3px; }
		.jb-codemirror-escCss:hover { text-decoration: underline; }
		.jb-codemirror-fullScreenBtnCss { position:absolute; bottom:5px; right:5px; -webkit-transition: opacity 1s; z-index: 20; }
		.jb-codemirror-fullScreenBtnCss.hidden { opacity:0; }
		.jb-codemirror-editorCss { position:relative; }
		.jb-codemirror-fullScreenEditorCss { padding-top: 20px, display: block; position: fixed !important; top: 0; left: 0; z-index: 99999999; }
	`;
	if (!jb.ui.find('#jb_codemirror_fullscreen')[0])
    jb.ui.addHTML(document.head,`<style id="jb_codemirror_fullscreen" type="text/css">${css}</style>`);

	var jEditorElem = editor.getWrapperElement();
  jb.ui.addClass(jEditorElem,'jb-codemirror-editorCss');
	var prevLineNumbers = editor.getOption("lineNumbers");
  jb.ui.addHTML(jEditorElem,fullScreenBtnHtml);
	var fullScreenButton =jb.ui.find('.jb-codemirror-fullScreenBtnCss')[0];
  fullScreenButton.onclick = _ => switchMode();
  fullScreenButton.onmouseenter = _ => jb.ui.removeClass(fullScreenButton,'hidden');
  fullScreenButton.onmouseleave = _ => jb.ui.addClass(fullScreenButton,'hidden');

	var fullScreenClass = 'jb-codemirror-fullScreenEditorCss';

	function onresize() {
		var wrapper = editor.getWrapperElement();
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
    impl: function(context, cm_settings, _enableFullScreen, resizer,height, mode, lineWrapping) {
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
                  var editor = CodeMirror.fromTextArea(cmp.base.firstChild, _cm_settings);
        					var wrapper = editor.getWrapperElement();
        					if (height)
        						wrapper.style.height = height + 'px';
        					jb.delay(1).then(() => {
        						if (_enableFullScreen)
        							enableFullScreen(editor,jb.ui.outerWidth(wrapper), jb.ui.outerHeight(wrapper))
        						editor.refresh(); // ????
        					});
                } catch(e) {
                    jb.logException(e,'editable-text.codemirror');
                    return;
                }
                editor.getWrapperElement().style.boxShadow = 'none'; //.css('box-shadow', 'none');
                jb.ui.resourceChange.takeUntil(cmp.destroyed)
                    .map(()=> context.vars.$model.text())
                    .filter(x=>x)
                    .distinctUntilChanged()
                    .subscribe(x=>
                        editor.setValue(x));
            }
        }
    }
})
