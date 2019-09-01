jb.component('editable-text.input', {
  type: 'editable-text.style',
  impl :{$: 'custom-style',
      features :{$: 'field.databind-text' },
      template: (cmp,state,h) => h('input', {
        value: state.model,
        onchange: e => cmp.jbModel(e.target.value),
        onkeyup: e => cmp.jbModel(e.target.value,'keyup')  })
   
  }
})

jb.component('editable-text.textarea', {
	type: 'editable-text.style',
  params: [
    { id: 'rows', as: 'number', defaultValue: 4 },
    { id: 'cols', as: 'number', defaultValue: 120 },
    { id: 'oneWay', type: 'boolean', as: 'boolean', defaultValue: true}
  ],
  impl :{$: 'custom-style',
      features :[{$: 'field.databind-text', oneWay: '%$oneWay' }, {$: 'textarea.init-textarea-editor'}],
      template: (cmp,state,h) => h('textarea', {
        rows: cmp.rows, cols: cmp.cols,
        value: state.model, onchange: e => cmp.jbModel(e.target.value), onkeyup: e => cmp.jbModel(e.target.value,'keyup')  }),
	}
})

jb.component('textarea.init-textarea-editor', {
  type: 'feature',
  impl: ctx => ({
      beforeInit: cmp => {
        if (!jb.textEditor) return
        cmp.editor = {
          getCursorPos: () => jb.textEditor.offsetToLineCol(cmp.base.value,cmp.base.selectionStart),
          cursorCoords: () => {},
          markText: () => {},
          replaceRange: (text, from, to) => {
            const _from = jb.textEditor.lineColToOffset(cmp.base.value,from)
            const _to = jb.textEditor.lineColToOffset(cmp.base.value,to)
            cmp.base.value = cmp.base.value.slice(0,_from) + text + cmp.base.value.slice(_to)
          },
          setSelectionRange: (from, to) => {
            const _from = jb.textEditor.lineColToOffset(cmp.base.value,from)
            const _to = to && jb.textEditor.lineColToOffset(cmp.base.value,to) || _from
            cmp.base.setSelectionRange(_from,_to)
          },
        }
      }
  })
})

jb.component('editable-text.mdl-input', {
  type: 'editable-text.style',
  params: [
    { id: 'width', as: 'number' },
  ],
  impl :{$: 'custom-style',
   template: (cmp,state,h) => h('div',{class: ['mdl-textfield','mdl-js-textfield','mdl-textfield--floating-label',state.error ? 'is-invalid' : ''].join(' ') },[
        h('input', { class: 'mdl-textfield__input', id: 'input_' + state.fieldId, type: 'text',
            value: state.model,
            onchange: e => cmp.jbModel(e.target.value),
            onkeyup: e => cmp.jbModel(e.target.value,'keyup'),
        }),
        h('label',{class: 'mdl-textfield__label', for: 'input_' + state.fieldId},state.title),
        h('span',{class: 'mdl-textfield__error' }, state.error || '')
      ]),
      css: '{ {?width: %$width%px?} }',
      features :[
          {$: 'field.databind-text' },
          {$: 'mdl-style.init-dynamic'},
          ctx => ({
            beforeInit: cmp => cmp.elemToInput = elem => elem.children[0]
          })
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
            value: state.model,
            onchange: e => cmp.jbModel(e.target.value),
            onkeyup: e => cmp.jbModel(e.target.value,'keyup'),
        }),
      css: '{ {?width: %$width%px?} } :focus { border-color: #3F51B5; border-width: 2px}',
      features :[
          {$: 'field.databind-text' },
          {$: 'mdl-style.init-dynamic'}
      ],
  }
})

jb.component('editable-text.mdl-search', {
  description: 'debounced and one way binding',
  type: 'editable-text.style',
  impl :{$: 'custom-style',
      template: (cmp,{model, fieldId, title},h) => h('div',{class:'mdl-textfield mdl-js-textfield'},[
        h('input', { class: 'mdl-textfield__input', id: 'search_' + fieldId, type: 'text',
            value: model,
            onchange: e => cmp.jbModel(e.target.value),
            onkeyup: e => cmp.jbModel(e.target.value,'keyup'),
        }),
        h('label',{class: 'mdl-textfield__label', for: 'search_' + fieldId}, model ? '' : title)
      ]),
      features: [
          {$: 'field.databind-text' },
          {$: 'mdl-style.init-dynamic'},
      ],
  }
})
