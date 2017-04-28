jb.component('editable-boolean.checkbox', {
  type: 'editable-boolean.style',
  impl :{$: 'custom-style', 
      features :{$: 'field.databind' },
      template: (cmp,state,h) => h('input', { type: 'checkbox',
        value: cmp.jbModel(), 
        onchange: e => cmp.jbModel(e.target.checked), 
        onkeyup: e => cmp.jbModel(e.target.checked,'keyup')  })
    }
})

jb.component('editable-boolean.checkbox-with-title', {
  type: 'editable-boolean.style',
  impl :{$: 'custom-style', 
      features :{$: 'field.databind' },
      template: (cmp,state,h) => h('div',{},h('input', { type: 'checkbox',
        value: cmp.jbModel(), 
        onchange: e => cmp.jbModel(e.target.checked), 
        onkeyup: e => cmp.jbModel(e.target.checked,'keyup')  }),{}, cmp.text())
  }
})


jb.component('editable-boolean.expand-collapse', {
  type: 'editable-boolean.style',
  impl :{$: 'custom-style', 
      features :{$: 'field.databind' },
      template: (cmp,state,h) => h('div',{},[
          h('input', { type: 'checkbox',
            value: cmp.jbModel(), 
            onchange: e => cmp.jbModel(e.target.checked), 
            onkeyup: e => cmp.jbModel(e.target.checked,'keyup')  }, cmp.text()),
          h('i',{class:'material-icons noselect', onclick: _=> cmp.toggle() }, cmp.jbModel() ? 'keyboard_arrow_down' : 'keyboard_arrow_right')
      ]),
      css: `>i { font-size:16px; cursor: pointer; }
          >input { display: none }`
  }
})