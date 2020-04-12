jb.component('editableText.studioPrimitiveText', {
  type: 'editable-text.style',
  impl: customStyle({
    template: (cmp,{databind},h) => h('input', {
          class: 'mdc-text-field__input',
          value: databind, onchange: true, onkeyup: true, onblur: true
    }),
    css: '{ padding-left: 2px; padding-top: 5px; padding-bottom: 0; font-size: 1.2rem; margin-bottom1: 7px;} :focus { border-color: #3F51B5; border-width: 2px}',
    features: field.databindText(0, false)
  })
})

jb.component('editableText.floatingInput', {
  type: 'editable-text.style',
  impl: styleWithFeatures(editableText.mdcInput(),
    css(`~ .mdc-text-field__input  { font-size: 1.2rem; } ~ .mdc-text-field { width: 100%; margin-right: 13px;}`))
})

jb.studio.codeMirrorUtils = Object.assign(jb.studio.codeMirrorUtils || {}, {
  incNumberAtCursor(editor, {inc}) {
    const cur = editor.getCursor(), token = editor.getTokenAt(cur);
    if (!isNaN(+token.string)) {
      const prefix = editor.getTokenAt(CodeMirror.Pos(cur.line, cur.ch - token.string.length)).string;
      const val = prefix == '-' ? (prefix + token.string) : token.string;
      const newVal = `${(+val)+inc}`;
      if (prefix == '-')
        token.start--;
      editor.replaceRange(newVal, CodeMirror.Pos(cur.line, token.start), CodeMirror.Pos(cur.line, token.end))
    }
  }
})

jb.component('editableText.studioCodemirrorTgp', {
  type: 'editable-text.style',
  impl: editableText.codemirror({
    cm_settings: {
      '$': 'object',
      extraKeys: {
        'Alt-Left': editor => {
          jb.studio.codeMirrorUtils.incNumberAtCursor(editor, {inc:-1})
        },
        'Alt-Right': editor => {
          jb.studio.codeMirrorUtils.incNumberAtCursor(editor, {inc:1})
        },
        'Alt-F': editor => {
          try {
            const prof = eval('('+editor.getValue()+')')
            editor.setValue(jb.prettyPrint(prof))
          } catch (e) {}
        }
      }
    },
    mode: 'javascript'
  })
})


jb.component('button.selectProfileStyle', {
  type: 'button.style',
  impl: customStyle({
    template: (cmp,{title},h) =>
        h('input', { class: 'mdc-text-field__input', type: 'text', readonly: true, title,
            value: title, onmouseup: 'onclickHandler', onkeydown: 'clickedEnter',
        }),
    css: '{ cursor: pointer; padding-left: 2px; padding-top: 5px; padding-bottom: 0; font-size: 1.2rem; margin-bottom1: 7px; } :focus { border-color: #3F51B5; border-width: 2px}',
    features: interactive(
      (ctx,{cmp}) => cmp.clickedEnter = () => event.keyCode == 13 && cmp.onclickHandler()
    )
  })
})

jb.component('studio.propertyToolbarStyle', {
  type: 'button.style',
  impl: customStyle({
    template: (cmp,state,h) => h('i',{class: 'material-icons', onclick: true, title: 'more...' },'more_vert'),
    css: `{ cursor: pointer;width: 16px; font-size: 16px; vertical-align: super; opacity: 0.5; transform: translate(-5px, 10px);}
      ~:hover { opacity: 1}
    `
  })
})

jb.component('button.studioScript', {
  type: 'button.style',
  impl: customStyle({
    template: (cmp,state,h) =>
        h('input', { class: 'mdc-text-field__input', type: 'text', readonly: true, title: state.title,
            value: state.title,
            onmouseup: 'onclickHandler',
            onkeydown: 'clickedEnter',
        }),
    css: '{ padding-left: 2px; padding-top: 5px; padding-bottom: 0; font-size: 1.2rem; margin-bottom1: 7px; cursor: pointer; opacity: 0.8; font-style: italic; }',
    features: interactive(
      (ctx,{cmp}) => cmp.clickedEnter = ev => event.keyCode == 13 && cmp.onclickHandler()
    )
  })
})

jb.component('picklist.studioEnum', {
  type: 'picklist.style',
  impl: customStyle({
    template: (cmp,state,h) => h('select', { value: state.databind, onchange: true },
          state.options.map(option=>h('option',{value: option.code},option.text))
        ),
    css: `
{ display: block; padding: 0; width: 150px; font-size: 12px; height: 23px;
	color: #555555; background-color: #fff;
	border: 1px solid #ccc; border-radius: 4px;
	box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
	transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;
}
:focus { border-color: #66afe9; outline: 0;
	box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6); }
::placeholder { color: #999; opacity: 1; }
    `,
    features: field.databind()
  })
})

jb.component('text.studioMessage', {
  type: 'text.style',
  impl: customStyle({
    template: (cmp,state,h) => h('span',{class: 'studio-message'}, state.text),
    css: `{ position: absolute;
      z-index: 10000,
      color: white;  padding: 10px;  background: #327DC8;
      width: 1000px;
      margin-top: -100px;
      }`,
    features: text.bindText()
  })
})

jb.component('dialog.studioMultilineEdit', {
  type: 'dialog.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div',{ class: 'jb-dialog jb-popup'},[
      h('button',{class: 'dialog-close', onclick: 'dialogClose' },'×'),
      h(state.contentComp),
    ]),
    css: `{ background: #fff; position: absolute; min-width: 280px; min-height: 200px;
					box-shadow: 2px 2px 3px #d5d5d5; padding: 3px; border: 1px solid rgb(213, 213, 213)
				  }
				>.dialog-close {
						position: absolute;
						cursor: pointer;
						right: -7px; top: -22px;
						font: 21px sans-serif;
						border: none;
						background: transparent;
						color: #000;
						text-shadow: 0 1px 0 #fff;
						font-weight: 700;
						opacity: .2;
				}
				>.dialog-close:hover { opacity: .5 }
				`,
    features: [
      dialogFeature.maxZIndexOnClick(),
      dialogFeature.closeWhenClickingOutside(),
      dialogFeature.cssClassOnLaunchingElement()
    ]
  })
})
