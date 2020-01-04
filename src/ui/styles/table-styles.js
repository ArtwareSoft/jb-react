jb.ns('mdc.style')
jb.component('table.with-headers', { /* table.withHeaders */
  params: [ 
    { id: 'hideHeaders',  as: 'boolean' },
  ],
  type: 'table.style,itemlist.style',
  impl: customStyle({
    template: (cmp,state,h) => h('div',{},h('table',{},[
        ...(cmp.hideHeaders ? [] : [h('thead',{},h('tr',{},
          cmp.fields.map(f=>h('th',{'jb-ctx': f.ctxId, style: { width: f.width ? f.width + 'px' : ''} }, jb.ui.fieldTitle(cmp,f,h))) ))]),
        h('tbody',{class: 'jb-drag-parent'},
            state.items.map((item,index)=> jb.ui.item(cmp,h('tr',
                { class: 'jb-item', 'jb-ctx': jb.ui.preserveCtx(cmp.ctx.setData(item))},cmp.fields.map(f=>
              h('td', jb.filterEmpty({ 'jb-ctx': jb.ui.preserveFieldCtxWithItem(f,item), class: f.class, title: f.hoverTitle &&  f.hoverTitle(item) }), 
                f.control ? h(f.control(item,index),{index, row: item}) : f.fieldData(item,index))))
              ,item))
        ),
        state.items.length == 0 ? 'no items' : ''
        ])),
    css: `>table{border-spacing: 0; text-align: left; width: 100%}
    >table>tbody>tr>td { padding-right: 5px }
    `,
    features: table.initTableOrItemlist()
  })
})


jb.component('table.mdc', { /* table.mdc */
  type: 'table.style,itemlist.style',
  params: [
    {
      id: 'classForTable',
      as: 'string',
      defaultValue: 'mdc-data-table__table mdc-data-table--selectable'
    }
  ],
  impl: customStyle({
    template: (cmp,state,h) => h('div',{class: 'mdc-data-table'}, h('table',{ class: cmp.classForTable },[
        h('thead',{},h('tr',{class:'mdc-data-table__header-row'},cmp.fields.map((f,i) =>h('th',{
          'jb-ctx': f.ctxId, 
          class: ['mdc-data-table__header-cell']
            .concat([ 
              (state.sortOptions && state.sortOptions.filter(o=>o.field == f)[0] || {}).dir == 'asc' ? 'mdc-data-table__header--sorted-ascending': '',
              (state.sortOptions && state.sortOptions.filter(o=>o.field == f)[0] || {}).dir == 'des' ? 'mdc-data-table__header--sorted-descending': '',
            ]).filter(x=>x).join(' '), 
          style: { width: f.width ? f.width + 'px' : ''},
          onclick: 'toggleSort',
          fieldIndex: i
          }
          ,jb.ui.fieldTitle(cmp,f,h))) )),
        h('tbody',{class: 'jb-drag-parent mdc-data-table__content'},
            state.items.map((item,index)=> jb.ui.item(cmp,h('tr',{ class: 'jb-item mdc-data-table__row', 'jb-ctx': jb.ui.preserveCtx(cmp.ctx.setData(item))},cmp.fields.map(f=>
              h('td', jb.filterEmpty({ 
                'jb-ctx': jb.ui.preserveFieldCtxWithItem(f,item), 
                class: (f.class + ' ' + cmp.classForTd + ' mdc-data-table__cell').trim(), 
                title: f.hoverTitle &&  f.hoverTitle(item) 
              }) , f.control ? h(f.control(item,index)) : f.fieldData(item,index))))
              ,item))
        ),
        state.items.length == 0 ? 'no items' : ''
        ])),
    css: `{width: 100%} 
    ~ .mdc-data-table__header-cell {font-weight: 700}`,
    features: [table.initTableOrItemlist(), table.initSort(), mdcStyle.initDynamic() ]
  })
})
