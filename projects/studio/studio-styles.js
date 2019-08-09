jb.component('editable-text.studio-primitive-text', {
  type: 'editable-text.style',
  impl :{$: 'custom-style',
      features :{$: 'field.databind-text' },
      template: (cmp,state,h) => h('input', {
          class: 'mdl-textfield__input',
          value: state.model,
          onchange: e => cmp.jbModel(e.target.value),
          onkeyup: e => cmp.jbModel(e.target.value,'keyup')
      }),
    css: `{ width1: 367px} :focus { border-color: #3F51B5; border-width: 2px}`,
	}
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

jb.component('editable-text.studio-codemirror-tgp', {
  type: 'editable-text.style',
  impl :{$: 'editable-text.codemirror', mode: 'javascript',
    cm_settings :{$: 'object', 
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
    }
  }
})


jb.component('button.select-profile-style', {
  type: 'button.style',
  impl :{$: 'custom-style',
   template: (cmp,state,h) =>
        h('input', { class: 'mdl-textfield__input', type: 'text', readonly: true, title: state.title,
            value: state.title,
            onmouseup:ev => cmp.clicked(ev),
            onkeydown:ev => ev.keyCode == 13 && cmp.clicked(ev),
        }),
        css: `{ cursor: pointer;width1: 367px } :focus { border-color: #3F51B5; border-width: 2px}`
  }
})

jb.component('studio.property-toolbar-style', {
  type: 'button.style',
  impl :{$: 'custom-style',
      template: (cmp,state,h) => h('i',{class: 'material-icons',
        onclick: ev => cmp.clicked(ev)
      },'more_vert'),
      css: `{ cursor: pointer;width: 16px; font-size: 16px; padding-top: 3px }`,
  }
})


jb.component('editable-text.jb-editor-floating-input', {
  type: 'editable-text.style',
  impl :{$: 'custom-style',
   template: (cmp,state,h) => h('div',{class:'mdl-textfield mdl-js-textfield mdl-textfield--floating-label'},[
        h('input', { class: 'mdl-textfield__input', id: 'jb_input_' + state.fieldId, type: 'text',
            value: state.model,
            onchange: e => cmp.jbModel(e.target.value),
            onkeyup: e => cmp.jbModel(e.target.value,'keyup'),
        }),
        h('label',{class: 'mdl-textfield__label', for: 'jb_input_' + state.fieldId},state.title)
      ]),
      css: '{ margin-right: 13px; }', // for the x-button
      features :[
          {$: 'field.databind-text', debounceTime: 300, oneWay: true },
          {$: 'mdl-style.init-dynamic'}
      ],
  }
})

jb.component('button.studio-script', {
  type: 'button.style',
  impl :{$: 'custom-style',
   template: (cmp,state,h) =>
        h('input', { class: 'mdl-textfield__input', type: 'text', readonly: true, title: state.title,
            value: state.title,
            onmouseup:ev => cmp.clicked(ev),
            onkeydown:ev => ev.keyCode == 13 && cmp.clicked(ev),
        }),
        css: `{ cursor: pointer;width1: 367px; opacity: 0.8; font-style: italic; }`
  }
})

// jb.component('button.studio-script2', {
//   type: 'button.style',
//   impl :{$: 'custom-style',
//       template: (cmp,state,h) => h('div', { title: state.title, onclick: _ => cmp.clicked() },
//         h('div',{class:'inner-text'},state.title)),
//           css: `>.inner-text {
//   white-space: nowrap; overflow-x: hidden;
//   display: inline; height: 16px;
//   padding-left: 4px; padding-top: 2px;
//   font: 12px "arial"; color: #555555;
// }

// {
//   width: 149px;
//   border: 1px solid #ccc; border-radius: 4px;
//   cursor: pointer;
//   box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
//   background: #eee;
//   white-space: nowrap; overflow-x: hidden;
//   text-overflow: ellipsis;
// }`,
// }
// })


// todo: take from http://creativeit.github.io/getmdl-select/
 // <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label getmdl-select getmdl-select__fullwidth">
 //            <input class="mdl-textfield__input" type="text" id="sample1" value="Belarus" readonly tabIndex="-1">
 //            <label for="sample1" class="mdl-textfield__label">Country</label>
 //            <ul for="sample1" class="mdl-menu mdl-menu--bottom-left mdl-js-menu">
 //                <li class="mdl-menu__item">Germany</li>
 //                <li class="mdl-menu__item">Belarus</li>
 //                <li class="mdl-menu__item">Russia</li>
 //            </ul>
 //        </div>

jb.component('picklist.studio-enum', {
  type: 'picklist.style',
  impl :{$: 'custom-style',
      features :{$: 'field.databind' },
      template: (cmp,state,h) => h('select', { value: state.model, onchange: e => cmp.jbModel(e.target.value) },
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
    `
  }
})


jb.component('property-sheet.studio-properties', {
  type: 'group.style',
  impl :{$: 'custom-style',
    features :{$: 'group.init-group' },
    template: (cmp,state,h) => h('table',{}, state.ctrls.map(ctrl=>
      h('tr',{ class: 'property' },[
          h('td',{ class: 'property-title', title: ctrl.title}, ctrl.title),
          h('td',{ class: 'property-ctrl'},h(ctrl)),
          h('td',{ class: 'property-toolbar'}, h(ctrl.jbComp.toolbar) ),
      ])
    )),
    css: `
      { width: 100% }
      >.property>.property-title { width: 90px; padding-right: 5px; padding-top: 5px }
      >.property>td { vertical-align: top; }
    `,
  }
})

jb.component('property-sheet.studio-properties-in-tgp', {
  type: 'group.style',
  impl :{$: 'custom-style',
    features :{$: 'group.init-group' },
    template: (cmp,state,h) => h('table',{}, state.ctrls.map(ctrl=>
      h('tr',{ class: 'property' },[
          h('td',{ class: 'property-title', title: ctrl.title}, ctrl.title),
          h('td',{ class: 'property-ctrl'},h(ctrl)),
          h('td',{ class: 'property-toolbar'}, h(ctrl.jbComp.toolbar) ),
      ])
    )),
    css: `
      { width: 100% }
      >.property>.property-title { width: 90px; padding-right: 5px; padding-top: 5px; font-weight: bold; }
      >.property>.property-ctrl { }
      >.property>td { vertical-align: top; }
    `,

    css2: `>.property { margin-bottom: 5px; display: flex }
      >.property:last-child { margin-bottom:0px }
      >.property>.input-and-toolbar { display: flex; }
      >.property>.input-and-toolbar>.toolbar { height: 16px; margin-left: 10px; }
      >.property>.property-title {
        width: 75px;
        overflow:hidden;
        text-overflow:ellipsis;
        vertical-align:top;
        margin-top:2px;
        font-size:14px;
        margin-right: 10px;
        margin-left: 7px;
      },
      >.property>*:last-child { margin-right:0 }`
  }
})


jb.component('property-sheet.studio-plain', {
  type: 'group.style',
  impl :{$: 'custom-style',
    features :{$: 'group.init-group' },
    template: (cmp,state,h) => h('div',{}, state.ctrls.map(ctrl=>
      h('div',{ class: 'property' },[
          h('label',{ class: 'property-title', title: ctrl.title}, ctrl.title),
          h('div',{ class: 'input-and-toolbar'}, [
            h(ctrl),
            h(ctrl.jbComp.toolbar)
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
      >.property>*:last-child { margin-right:0 }`
  }
})

jb.component('editable-boolean.studio-expand-collapse-in-toolbar', {
  type: 'editable-boolean.style',
  impl :{$: 'custom-style',
      template: (cmp,state,h) => h('button',{class: 'md-icon-button md-button',
          onclick: _=> cmp.toggle(),
          title: cmp.jbModel() ? 'collapse' : 'expand'},
            h('i',{class: 'material-icons'}, cmp.jbModel() ? 'keyboard_arrow_down' : 'keyboard_arrow_right')
          ),
      css: `{ width: 24px; height: 24px; padding: 0; margin-top: -3px;}
     	>i { font-size:12px;  }`
   }
})

jb.component('editable-boolean.studio-expand-collapse-in-array', {
  type: 'editable-boolean.style',
  impl :{$: 'custom-style',
      template: (cmp,state,h) => h('button',{class: 'md-icon-button md-button',
          onclick: _=> cmp.toggle(),
          title: cmp.jbModel() ? 'collapse' : 'expand'},
            h('i',{class: 'material-icons'}, cmp.jbModel() ? 'keyboard_arrow_down' : 'keyboard_arrow_right')
          ),
      css: `{ width: 24px; height: 24px; padding: 0; }
     	>i { font-size:12px;  }
      `
   }
})


jb.component('dialog.studio-multiline-edit',{
	type: 'dialog.style',
  impl :{$: 'custom-style',
    template: (cmp,state,h) => h('div',{ class: 'jb-dialog jb-popup'},[
      h('button',{class: 'dialog-close', onclick:
        _=> cmp.dialogClose() },'×'),
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
				{ $: 'dialog-feature.max-zIndex-on-click' },
				{ $: 'dialog-feature.close-when-clicking-outside' },
				{ $: 'dialog-feature.css-class-on-launching-element' },
				{ $: 'dialog-feature.studio-position-under-property' }
			]
	}
})

jb.component('dialog-feature.studio-position-under-property', {
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

jb.component('group.studio-properties-accordion', {
  type: 'group.style',
  impl :{$: 'custom-style',
    template: (cmp,state,h) => h('section',{ class: 'jb-group'},
        state.ctrls.map((ctrl,index)=> jb.ui.item(cmp,h('div',{ class: 'accordion-section' },[
          h('div',{ class: 'header' },[
            h('div',{ class: 'title', onclick: _=> cmp.show(index) }, ctrl.title),
            h('button',{ class: 'mdl-button mdl-button--icon', title: cmp.expand_title(ctrl), onclick: _=> cmp.flip(index) },
              h('i',{ class: 'material-icons'}, state.shown == index ? 'keyboard_arrow_down' : 'keyboard_arrow_right')
            )
          ])].concat(state.shown == index ? [h(ctrl)] : [])),ctrl.ctx.data)
    )),
    css: `>.accordion-section>.header { cursor: pointer; display: flex; flex-direction: row; background: #eee; margin-bottom: 2px; justify-content: space-between}
>.accordion-section>.header>button:hover { background: none }
>.accordion-section>.header>button { margin-left: 0px }
>.accordion-section>.header>button>i { color: #; cursor: pointer }
>.accordion-section>.header>.title { margin: 5px }
>.accordion-section:last-child() { padding-top: 2px }
`,
      features : [
        {$: 'group.init-group' },
        {$: 'group.init-accordion', keyboardSupport: true, autoFocus: true },
        ctx =>({
          afterViewInit: cmp =>
            ctx.vars.PropertiesDialog.openFeatureSection = _ => cmp.show(1)
        })
      ]
  }
})

jb.component('label.studio-message', {
  type: 'label.style',
  impl :{$: 'custom-style',
    template: (cmp,state,h) => h('span',{class: 'studio-message'}, state.title),
    css: `{ position: absolute;
      color: white;  padding: 10px;  background: #327DC8;
      width: 1000px;
      margin-top: -100px;
      }`,
    features: {$: 'label.bind-title' }
  }
})
