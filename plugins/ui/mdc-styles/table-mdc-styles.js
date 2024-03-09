
component('table.mdc', {
  type: 'table-style',
  params: [
    {id: 'hideHeaders', as: 'boolean', type: 'boolean'},
    {id: 'classForTable', as: 'string', defaultValue: 'mdc-data-table__table mdc-data-table--selectable'}
  ],
  impl: table.style({
    itemlistStyle: customStyle({
      template: (cmp,{ctrls,sortOptions,hideHeaders,classForTable,headerFields},h) => 
      h('div.jb-itemlist mdc-data-table',{}, h('table',{class: classForTable}, [
        ...(hideHeaders ? [] : [h('thead',{},h('tr.mdc-data-table__header-row',{},
            headerFields.map((f,i) =>h('th.mdc-data-table__header-cell',{
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
        h('tbody.jb-items-parent mdc-data-table__content',{},ctrls.map( ctrl=> h(ctrl[0]))),
        ctrls.length == 0 ? 'no items' : ''            
    ])),
      css: `{width: 100%}  
    ~ .mdc-data-table__header-cell, ~ .mdc-data-table__cell {color: var(--jb-fg)}`,
      features: [
        itemlist.init(),
        mdcStyle.initDynamic(),
        calcProp('headerFields', '%$$tableModel/controls()/field()%')
      ]
    }),
    lineStyle: customStyle({
      template: ({},{ctrls},h) => h('tr.jb-item mdc-data-table__row',{}, ctrls.map(ctrl=> h('td.mdc-data-table__cell',{}, h(ctrl)))),
      features: group.initGroup()
    })
  })
})