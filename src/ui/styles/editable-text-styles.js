jb.component('editable-text.input', {
  type: 'editable-text.style',
  impl :{$: 'custom-style', 
      features :{$: 'field.databind' },
      template: (cmp,state,h) => h('input', { 
        value: cmp.jbModel(), 
        onchange: e => cmp.jbModel(e.target.value), 
        onkeyup: e => cmp.jbModel(e.target.value,'keyup')  }),
    css: '{height: 16px}'
  }
})

jb.component('editable-text.textarea', {
	type: 'editable-text.style',
	impl :{$: 'custom-style', 
      features :{$: 'field.databind' },
      template: (cmp,state,h) => h('textarea', { 
        value: cmp.jbModel(), onchange: e => cmp.jbModel(e.target.value), onkeyup: e => cmp.jbModel(e.target.value,'keyup')  }),
	}
})

jb.component('editable-text.mdl-input', {
  type: 'editable-text.style',
  params: [
    { id: 'width', as: 'number' },
  ],
  impl :{$: 'custom-style', 
   template: (cmp,state,h) => h('div',{class:'mdl-textfield mdl-js-textfield mdl-textfield--floating-label' },[ 
        h('input', { class: 'mdl-textfield__input', id: 'input_' + state.fieldId, type: 'text',
            value: cmp.jbModel(),
            onchange: e => cmp.jbModel(e.target.value),
            onkeyup: e => cmp.jbModel(e.target.value,'keyup'),
        }),
        h('label',{class: 'mdl-textfield__label', for: 'input_' + state.fieldId},state.title)
      ]),
      css: '{ {?width: %$width%px?} }',
      features :[
          {$: 'field.databind' },
          {$: 'mdl-style.init-dynamic'}
      ],
  }
})

jb.component('editable-text.mdl-input-no-floating-label', {
  type: 'editable-text.style',
  params: [
    { id: 'width', as: 'number' },
  ],
  impl :{$: 'custom-style', 
   template: (cmp,state,h) => 
        h('input', { class: 'mdl-textfield__input', type: 'text',
            value: cmp.jbModel(),
            onchange: e => cmp.jbModel(e.target.value),
            onkeyup: e => cmp.jbModel(e.target.value,'keyup'),
        }),
      css: '{ {?width: %$width%px?} }',
      features :[
          {$: 'field.databind' },
          {$: 'mdl-style.init-dynamic'}
      ],
  }
})

jb.component('editable-text.mdl-search', {
  type: 'editable-text.style',
  impl :{$: 'custom-style', 
      template: (cmp,state,h) => h('div',{class:'mdl-textfield mdl-js-textfield'},[ 
        h('input', { class: 'mdl-textfield__input', id: 'search_' + state.fieldId, type: 'text',
            value: cmp.jbModel(),
            onchange: e => cmp.jbModel(e.target.value),
            onkeyup: e => cmp.jbModel(e.target.value,'keyup'),
        }),
        h('label',{class: 'mdl-textfield__label', for: 'search_' + state.fieldId},state.title)
      ]),
      features: [
          {$: 'field.databind' },
          {$: 'mdl-style.init-dynamic'}
      ],
  }
})
