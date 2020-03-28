jb.ns('mdc.style')
jb.component('table.plain', {
  params: [
    {id: 'hideHeaders', as: 'boolean', type: 'boolean'}
  ],
  type: 'table.style,itemlist.style',
  impl: customStyle({
    template: (cmp,{items,fields,hideHeaders},h) => h('div#jb-itemlist',{},h('table',{},[
        ...(hideHeaders ? [] : [h('thead',{},h('tr',{},
          fields.map(f=>h('th',{'jb-ctx': f.ctxId, style: { width: f.width ? f.width + 'px' : ''} }, jb.ui.fieldTitle(cmp,f,h))) ))]),
        h('tbody#jb-drag-parent',{},
            items.map((item,index)=> jb.ui.item(cmp,h('tr#jb-item',{ 'jb-ctx': jb.ui.preserveCtx(cmp.ctx.setData(item))},
              fields.map(f=>
                h('td', jb.filterEmpty({ 'jb-ctx': jb.ui.preserveFieldCtxWithItem(f,item), class: f.class, title: f.hoverTitle &&  f.hoverTitle(item) }),
                  f.control ? h(f.control(item,index),{index, row: item}) : f.fieldData(item,index)))) ,item))
        ),
        items.length == 0 ? 'no items' : ''
        ])),
    css: `>table{border-spacing: 0; text-align: left; width: 100%}
    >table>tbody>tr>td { padding-right: 5px }
    `,
    features: table.initTableOrItemlist()
  })
})

jb.component('table.mdc', {
  type: 'table.style,itemlist.style',
  params: [
    {id: 'hideHeaders', as: 'boolean', type: 'boolean'},
    {id: 'classForTable', as: 'string', defaultValue: 'mdc-data-table__table mdc-data-table--selectable'}
  ],
  impl: customStyle({
    template: (cmp,{items,fields,classForTable,classForTd,sortOptions,hideHeaders},h) => 
      h('div#jb-itemlist mdc-data-table',{}, h('table',{ class: classForTable },[
      ...(hideHeaders ? [] : [h('thead',{},h('tr#mdc-data-table__header-row',{},
        fields.map((f,i) =>h('th#mdc-data-table__header-cell',{
          'jb-ctx': f.ctxId, 
          class: [ 
              (sortOptions && sortOptions.filter(o=>o.field == f)[0] || {}).dir == 'asc' ? 'mdc-data-table__header--sorted-ascending': '',
              (sortOptions && sortOptions.filter(o=>o.field == f)[0] || {}).dir == 'des' ? 'mdc-data-table__header--sorted-descending': '',
            ].filter(x=>x).join(' '), 
          style: { width: f.width ? f.width + 'px' : ''},
          onclick: 'toggleSort',
          fieldIndex: i
          }
          ,jb.ui.fieldTitle(cmp,f,h))) ))]),
        h('tbody#jb-drag-parent mdc-data-table__content',{},
            items.map((item,index)=> jb.ui.item(cmp,h('tr',{ class: 'jb-item mdc-data-table__row', 'jb-ctx': jb.ui.preserveCtx(cmp.ctx.setData(item))},fields.map(f=>
              h('td', jb.filterEmpty({ 
                'jb-ctx': jb.ui.preserveFieldCtxWithItem(f,item), 
                class: (f.class + ' ' + classForTd + ' mdc-data-table__cell').trim(), 
                title: f.hoverTitle &&  f.hoverTitle(item) 
              }) , f.control ? h(f.control(item,index)) : f.fieldData(item,index))))
              ,item))
        ),
        items.length == 0 ? 'no items' : ''
        ])),
    css: `{width: 100%} 
    ~ .mdc-data-table__header-cell {font-weight: 700}`,
    features: [table.initTableOrItemlist(), table.initSort(), mdcStyle.initDynamic()]
  })
})
