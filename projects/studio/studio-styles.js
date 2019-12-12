jb.component('editable-text.studio-primitive-text', { /* editableText.studioPrimitiveText */
  type: 'editable-text.style',
  impl: customStyle({
    template: (cmp,state,h) => h('input', {
          class: 'mdl-textfield__input',
          value: state.model, onchange: true, onkeyup: true, onblur: true
      }),
    css: ':focus { border-color: #3F51B5; border-width: 2px}',
    features: field.databindText(500,false)
  })
})

jb.component('editable-text.floating-input', { /* editableText.floatingInput */
  type: 'editable-text.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div',{class:'mdl-textfield mdl-js-textfield mdl-textfield--floating-label'},[
      h('input', { class: 'mdl-textfield__input', id1: 'jb_input_' + state.fieldId, type: 'text', autocomplete: 'nop',
          value: state.model, onchange: true, onkeyup: true, onblur: true,
      }),
      h('label',{class: 'mdl-textfield__label', for: 'jb_input_' + state.fieldId},state.title)
  ]),
    css: '{ margin-right: 13px; }',
    features: [field.databindText(300, true), mdlStyle.initDynamic()]
  })
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

jb.component('editable-text.studio-codemirror-tgp', { /* editableText.studioCodemirrorTgp */
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


jb.component('button.select-profile-style', { /* button.selectProfileStyle */
  type: 'button.style',
  impl: customStyle({
    init: cmp => cmp.clickedEnter = ev => ev.keyCode == 13 && cmp.onclickHandler(ev),
    template: (cmp,state,h) =>
        h('input', { class: 'mdl-textfield__input', type: 'text', readonly: true, title: state.title,
            value: state.title,
            onmouseup: 'onclickHandler',
            onkeydown: 'clickedEnter',
        }),
    css: '{ cursor: pointer; } :focus { border-color: #3F51B5; border-width: 2px}'
  })
})

jb.component('studio.property-toolbar-style', { /* studio.propertyToolbarStyle */
  type: 'button.style',
  impl: customStyle({
    template: (cmp,state,h) => h('i',{class: 'material-icons', onclick: true },'more_vert'),
    css: '{ cursor: pointer;width: 16px; font-size: 16px; padding-top: 3px }'
  })
})


jb.component('editable-text.jb-editor-floating-input', { /* editableText.jbEditorFloatingInput */
  type: 'editable-text.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div',{class:'mdl-textfield mdl-js-textfield mdl-textfield--floating-label'},[
        h('input', { class: 'mdl-textfield__input', id: 'jb_input_' + state.fieldId, type: 'text',
            value: state.model,
            onchange: true,
            onkeyup: true,
        }),
        h('label',{class: 'mdl-textfield__label', for: 'jb_input_' + state.fieldId},state.title)
      ]),
    css: '{ margin-right: 13px; }',
    features: [field.databindText(300, true), mdlStyle.initDynamic()]
  })
})

jb.component('button.studio-script', { /* button.studioScript */
  type: 'button.style',
  impl: customStyle({
    init: cmp => cmp.clickedEnter = ev => ev.keyCode == 13 && cmp.onclickHandler(ev),
    template: (cmp,state,h) =>
        h('input', { class: 'mdl-textfield__input', type: 'text', readonly: true, title: state.title,
            value: state.title,
            onmouseup: 'onclickHandler',
            onkeydown: 'clickedEnter',
        }),
    css: '{ cursor: pointer;width1: 367px; opacity: 0.8; font-style: italic; }'
  })
})

jb.component('picklist.studio-enum', { /* picklist.studioEnum */
  type: 'picklist.style',
  impl: customStyle({
    template: (cmp,state,h) => h('select', { value: state.model, onchange: true },
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


jb.component('property-sheet.studio-properties', { /* propertySheet.studioProperties */
  type: 'group.style',
  impl: customStyle({
    template: (cmp,state,h) => h('table',{}, state.ctrls.map(ctrl=>
      h('tr',{ class: 'property' },[
          h('td',{ class: 'property-title', title: ctrl.title}, ctrl.title),
          h('td',{ class: 'property-ctrl'},h(ctrl)),
          h('td',{ class: 'property-toolbar'}, h(ctrl.toolbar) ),
      ])
    )),
    css: `
      { width: 100% }
      >.property>.property-title { width: 90px; padding-right: 5px; padding-top: 5px }
      >.property>td { vertical-align: top; }
    `,
    features: group.initGroup()
  })
})

jb.component('property-sheet.studio-properties-in-tgp', { /* propertySheet.studioPropertiesInTgp */
  type: 'group.style',
  impl: customStyle({
    template: (cmp,state,h) => h('table',{}, state.ctrls.map(ctrl=>
      h('tr',{ class: 'property' },[
          h('td',{ class: 'property-title', title: ctrl.title}, ctrl.title),
          h('td',{ class: 'property-ctrl'},h(ctrl)),
          h('td',{ class: 'property-toolbar'}, h(ctrl.toolbar) ),
      ])
    )),
    css: `
      { width: 100% }
      >.property>.property-title { width: 90px; padding-right: 5px; padding-top: 5px; font-weight: bold; }
      >.property>.property-ctrl { }
      >.property>td { vertical-align: top; }
    `,
    features: group.initGroup()
  })
})


jb.component('property-sheet.studio-plain', { /* propertySheet.studioPlain */
  type: 'group.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div',{}, state.ctrls.map(ctrl=>
      h('div',{ class: 'property' },[
          h('label',{ class: 'property-title', title: ctrl.title}, ctrl.title),
          h('div',{ class: 'input-and-toolbar'}, [
            h(ctrl),
            h(ctrl.toolbar)
          ])
    ]))),
    css: `>.property { margin-bottom: 5px; display: flex }
      >.property:last-child { margin-bottom:0px }
      >.property>.input-and-toolbar { display: flex; }
      >.property>.input-and-toolbar>.toolbar { height: 16px; margin-left: 10px }
      >.property>.property-title {
        min-width: 90px;
        width: 90px;
        overflow:hidden;
        text-overflow:ellipsis;
        vertical-align:top;
        margin-top:2px;
        font-size:14px;
        margin-right: 10px;
        margin-left: 7px;
      },
      >.property>*:last-child { margin-right:0 }`,
    features: group.initGroup()
  })
})

jb.component('editable-boolean.studio-expand-collapse-in-toolbar', { /* editableBoolean.studioExpandCollapseInToolbar */
  type: 'editable-boolean.style',
  impl: customStyle({
    template: (cmp,state,h) => h('button',{class: 'md-icon-button md-button',
          onclick: 'toggle',
          title: cmp.jbModel() ? 'collapse' : 'expand'},
            h('i',{class: 'material-icons'}, cmp.jbModel() ? 'keyboard_arrow_down' : 'keyboard_arrow_right')
          ),
    css: `{ width: 24px; height: 24px; padding: 0; margin-top: -3px;}
     	>i { font-size:12px;  }`
  })
})

jb.component('editable-boolean.studio-expand-collapse-in-array', { /* editableBoolean.studioExpandCollapseInArray */
  type: 'editable-boolean.style',
  impl: customStyle({
    template: (cmp,state,h) => h('button',{class: 'md-icon-button md-button',
          onclick: 'toggle',
          title: cmp.jbModel() ? 'collapse' : 'expand'},
            h('i',{class: 'material-icons'}, cmp.jbModel() ? 'keyboard_arrow_down' : 'keyboard_arrow_right')
          ),
    css: `{ width: 24px; height: 24px; padding: 0; }
     	>i { font-size:12px;  }
      `
  })
})

jb.component('dialog-feature.studio-position-under-property', { /* dialogFeature.studioPositionUnderProperty */
  type: 'dialog-feature',
  impl: (context,offsetLeft,offsetTop) => ({
			afterViewInit: function(cmp) {
				if (!context.vars.$launchingElement)
					return console.log('no launcher for dialog');
				var control = jb.ui.parents(context.vars.$launchingElement.el).filter(el=>jb.ui.matches(el,'.input-and-toolbar'));
				var pos = jb.ui.offset(control);
				var jbDialog = jb.ui.findIncludeSelf(cmp.base,'.jb-dialog')[0];
        if (jbDialog) {
  				jbDialog.style.left = `${pos.left}px`;
          jbDialog.style.top = `${pos.top}px`;
          jbDialog.style.display = 'block';
        }
			}
		})
})

jb.component('label.studio-message', { /* label.studioMessage */
  type: 'label.style',
  impl: customStyle({
    template: (cmp,state,h) => h('span',{class: 'studio-message'}, state.text),
    css: `{ position: absolute;
      z-index: 10000,
      color: white;  padding: 10px;  background: #327DC8;
      width: 1000px;
      margin-top: -100px;
      }`,
    features: label.bindText()
  })
})

jb.component('dialog.studio-multiline-edit', { /* dialog.studioMultilineEdit */
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
      dialogFeature.cssClassOnLaunchingElement(),
      dialogFeature.studioPositionUnderProperty()
    ]
  })
})

jb.component('studio.toolbar-style', { /* studio.toolbarStyle */
  type: 'group.style',
  impl: customStyle({
    template: (cmp,state,h) => h('section',{class:'jb-group'},
        state.ctrls.map(ctrl=> jb.ui.item(cmp,h(ctrl),ctrl.ctx))),
    css: `{
            display: flex;
            height: 33px;
            width: 100%;
        }
        >*:not(:last-child) { padding-right: 8px }
        >* { margin-right: 0 }`,
    features: group.initGroup()
  })
})
