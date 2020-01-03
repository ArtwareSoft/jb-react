jb.component('editable-text.studio-primitive-text', {
  type: 'editable-text.style',
  impl :{$: 'custom-style',
      features :{$: 'field.databind-text' },
      template: (cmp,state,h) => h('input', {
          class: 'mdc-text-field__input',
          value: state.model,
          onchange: e => cmp.jbModel(e.target.value),
          onkeyup: e => cmp.jbModel(e.target.value,'keyup')
      }),
    css: `{ padding: 2px} :focus { border-color: #3F51B5; border-width: 2px}`,
	}
})

jb.component('button.select-profile-style', {
  type: 'button.style',
  impl :{$: 'custom-style',
   template: (cmp,state,h) =>
        h('input', { class: 'mdc-text-field__input', type: 'text', readonly: true, title: state.title,
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
   template: (cmp,state,h) => h('div',{class:'mdc-text-field'},[
        h('input', { class: 'mdc-text-field__input', id: 'jb_input_' + state.fieldId, type: 'text',
            value: state.model,
            onchange: e => cmp.jbModel(e.target.value),
            onkeyup: e => cmp.jbModel(e.target.value,'keyup'),
        }),
        h('label',{class: 'mdc-floating-label mdc-floating-label--float-above', for: 'jb_input_' + state.fieldId},state.title)
      ]),
      css: '{ margin-right: 13px; }', // for the x-button
      features :[
          {$: 'field.databind-text', debounceTime: 300, oneWay: true },
      ],
  }
})

jb.component('button.studio-script', {
  type: 'button.style',
  impl :{$: 'custom-style',
   template: (cmp,state,h) =>
        h('input', { class: 'mdc-text-field__input', type: 'text', readonly: true, title: state.title,
            value: state.title,
            onmouseup:ev => cmp.clicked(ev),
            onkeydown:ev => ev.keyCode == 13 && cmp.clicked(ev),
        }),
        css: `{ cursor: pointer; opacity: 0.8; font-style: italic; }`
  }
})

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

jb.component('label.studio-message', {
  type: 'label.style',
  impl :{$: 'custom-style',
    template: (cmp,state,h) => h('span',{class: 'studio-message'}, state.title),
    css: `{ position: absolute;
      z-index: 10000,
      color: white;  padding: 10px;  background: #327DC8;
      width: 1000px;
      margin-top: -100px;
      }`,
    features: {$: 'label.bind-title' }
  }
})
