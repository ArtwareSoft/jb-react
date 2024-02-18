
component('table', {
  description: 'list, dynamic group, collection, repeat',
  type: 'control',
  category: 'group:80,common:80',
  params: [
    {id: 'title', as: 'string', dynamic: true},
    {id: 'items', as: 'array', dynamic: true, mandatory: true},
    {id: 'controls', type: 'control[]', description: 'fields', mandatory: true, dynamic: true},
    {id: 'style', type: 'table-style', defaultValue: table.plain()},
    {id: 'itemVariable', as: 'string', defaultValue: 'item'},
    {id: 'visualSizeLimit', as: 'number', defaultValue: 100, description: 'by default itemlist is limmited to 100 shown items'},
    {id: 'features', type: 'feature[]', dynamic: true, flattenArray: true},
    {id: 'lineFeatures', type: 'feature[]', dynamic: true, flattenArray: true}
  ],
  impl: itemlist({
    vars: [
      Var('$tableModel', ({},{},params) => params)
    ],
    title: '%$title()%',
    items: '%$items()%',
    controls: group('%$controls()%', { style: '%$style.lineStyle()%', features: '%$lineFeatures()%' }),
    style: '%$style.itemlistStyle()%',
    itemVariable: '%$itemVariable%',
    visualSizeLimit: '%$visualSizeLimit%',
    features: '%$features()%'
  })
})

component('table.style', {
  type: 'table-style',
  params: [
    {id: 'itemlistStyle', type: 'itemlist-style', dynamic: true},
    {id: 'lineStyle', type: 'group-style', dynamic: true, defaultValue: table.trTd()}
  ]
})

component('table.plain', {
  type: 'table-style',
  params: [
    {id: 'hideHeaders', as: 'boolean', type: 'boolean'}
  ],
  impl: table.style(
    customStyle({
      template: (cmp,{ctrls,hideHeaders,headerFields},h) => h('div.jb-itemlist',{},h('table',{},[
        ...(hideHeaders ? [] : [h('thead',{},h('tr',{},
        headerFields.map(f=>h('th',{'jb-ctx': f.ctxId, ...(f.width &&  { style: `width: ${f.width}px` }) }, jb.ui.fieldTitle(cmp,f,h))) ))]),
        h('tbody.jb-items-parent',{}, ctrls.map( ctrl=> h(ctrl[0]))),
        ctrls.length == 0 ? 'no items' : ''            
    ])),
      css: `>table{border-spacing: 0; text-align: left; width: 100%}
    >table>tbody>tr>td { padding-right: 5px }
    `,
      features: [
        itemlist.init(),
        calcProp('headerFields', '%$$tableModel/controls()/field()%')
      ]
    })
  )
})

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

component('table.trTd', {
  type: 'group-style',
  impl: customStyle({
    template: ({},{ctrls},h) => h('tr.jb-item',{}, ctrls.map(ctrl=> h('td',{}, h(ctrl)))),
    features: group.initGroup()
  })
})

component('table.enableExpandToEndOfRow', {
  type: 'feature',
  category: 'line-feature',
  description: 'allows expandToEndOfRow in table, set as lineFeatures',
  impl: templateModifier(({},{$props,vdom}) => {
    const expandIndex = $props.ctrls.findIndex(ctrl=> ctrl.renderProps.expandToEndOfRow)
    if (expandIndex != -1) {
        const colspan = vdom.children.length - expandIndex
        vdom.children = vdom.children.slice(0,expandIndex+1)
        vdom.children[expandIndex].setAttribute('colspan',''+colspan)
    }
  })
})

component('feature.expandToEndOfRow', {
  type: 'feature',
  category: 'table-field',
  description: 'requires table.enableExpandToEndOfRow as lineFeature. Put on a field to expandToEndOfRow by condition',
  params: [
    {id: 'condition', as: 'boolean', dynamic: true, type: 'boolean'}
  ],
  impl: calcProp('expandToEndOfRow', '%$condition()%')
})