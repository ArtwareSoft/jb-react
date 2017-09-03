jb.component('table.with-headers', {
  type: 'table.style',
  impl :{$: 'custom-style',
    template: (cmp,state,h) => h('table',{},[
        h('thead',{},h('tr',{},cmp.fields.map(f=>h('th',{'jb-ctx': f.ctxId, style: { width: f.width ? f.width + 'px' : ''} },f.title)) )),
        h('tbody',{class: 'jb-drag-parent'},
            state.items.map(item=> jb.ui.item(cmp,h('tr',{ class: 'jb-item', 'jb-ctx': jb.ui.preserveCtx(cmp.ctx.setData(item))},cmp.fields.map(f=>
              h('td', { 'jb-ctx': f.ctxId, class: f.class }, f.control ? h(f.control(item)) : f.fieldData(item))))
              ,item))
        ),
        state.items.length == 0 ? 'no items' : ''
        ]),
    features:{$: 'table.init'},
    css: `{border-spacing: 0; text-align: left}
    >tbody>tr>td { padding-right: 5px }
    `
  }
})

jb.component('table.mdl', {
  type: 'table.style',
  params: [
    { id: 'classForTable', as: 'string', defaultValue: 'mdl-data-table mdl-js-data-table mdl-data-table--selectable mdl-shadow--2dp'},
    { id: 'classForTd', as: 'string', defaultValue: 'mdl-data-table__cell--non-numeric'},
  ],
  impl :{$: 'custom-style',
    template: (cmp,state,h) => h('table',{ class: cmp.classForTable },[
        h('thead',{},h('tr',{},cmp.fields.map(f=>h('th',{
          'jb-ctx': f.ctxId, 
          class: [cmp.classForTd]
            .concat([ 
              (state.sortOptions && state.sortOptions.filter(o=>o.field == f)[0] || {}).dir == 'asc' ? 'mdl-data-table__header--sorted-ascending': '',
              (state.sortOptions && state.sortOptions.filter(o=>o.field == f)[0] || {}).dir == 'des' ? 'mdl-data-table__header--sorted-descending': '',
            ]).filter(x=>x).join(' '), 
          style: { width: f.width ? f.width + 'px' : ''},
          onclick: ev => cmp.toggleSort(f),
          }
          ,f.title)) )),
        h('tbody',{class: 'jb-drag-parent'},
            state.items.map(item=> jb.ui.item(cmp,h('tr',{ class: 'jb-item', 'jb-ctx': jb.ui.preserveCtx(cmp.ctx.setData(item))},cmp.fields.map(f=>
              h('td', { 'jb-ctx': f.ctxId, class: (f.class + ' ' + cmp.classForTd).trim() }, f.control ? h(f.control(item)) : f.fieldData(item))))
              ,item))
        ),
        state.items.length == 0 ? 'no items' : ''
        ]),
    features: [
      {$: 'table.init'},
      {$: 'table.init-sort'}
    ],
  }
})
