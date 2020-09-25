jb.ns('mdcStyle,table')

jb.component('itemlist.ulLi', {
  type: 'itemlist.style',
  impl: customStyle({
    template: ({},{ctrls,itemsCtxs},h) => h('ul.jb-itemlist',{},
        ctrls.map((ctrl,index) => h('li.jb-item', {'jb-ctx': itemsCtxs[index] }, ctrl.map(singleCtrl=>h(singleCtrl))))),
    css: `{ list-style: none; padding: 0; margin: 0;}
    >li { list-style: none; padding: 0; margin: 0;}`,
    features: itemlist.init()
  })
})

jb.component('itemlist.div', {
  type: 'itemlist.style',
  params: [
    {id: 'spacing', as: 'number', defaultValue: 0}
  ],
  impl: customStyle({
    template: ({},{ctrls,itemsCtxs},h) => h('div.jb-itemlist jb-drag-parent',{},
        ctrls.map((ctrl,index) => h('div.jb-item', {'jb-ctx': itemsCtxs[index]}, ctrl.map(singleCtrl=>h(singleCtrl))))),
    features: itemlist.init()
  })
})

jb.component('itemlist.horizontal', {
  type: 'itemlist.style',
  params: [
    {id: 'spacing', as: 'number', defaultValue: 0}
  ],
  impl: customStyle({
    template: ({},{ctrls,itemsCtxs},h) => h('div.jb-itemlist jb-drag-parent',{},
        ctrls.map((ctrl,index) => h('div.jb-item', {'jb-ctx': itemsCtxs[index]}, ctrl.map(singleCtrl=>h(singleCtrl))))),
    css: `{display: flex}
        >* { margin-right: %$spacing%px }
        >*:last-child { margin-right:0 }`,
    features: itemlist.init()
  })
})

jb.component('table.plain', {
  params: [
    {id: 'hideHeaders', as: 'boolean', type: 'boolean'}
  ],
  type: 'itemlist.style',
  impl: customStyle({
    template: (cmp,{itemsCtxs,ctrls,hideHeaders},h) => h('div.jb-itemlist',{},h('table',{},[
        ...(hideHeaders ? [] : [h('thead',{},h('tr',{},
          ctrls[0] && ctrls[0].map(ctrl=>ctrl.field()).map(f=>h('th',{'jb-ctx': f.ctxId, style: { width: f.width ? f.width + 'px' : ''} }, jb.ui.fieldTitle(cmp,f,h))) ))]),
        h('tbody.jb-drag-parent',{},
          ctrls.map((ctrl,index)=> h('tr.jb-item',{ 'jb-ctx': itemsCtxs[index]}, ctrl.map( singleCtrl => h('td',{}, h(singleCtrl)))))),
        itemsCtxs.length == 0 ? 'no items' : ''            
    ])),
    css: `>table{border-spacing: 0; text-align: left; width: 100%}
    >table>tbody>tr>td { padding-right: 5px }
    `,
    features: itemlist.init()
  })
})

jb.component('table.mdc', {
  type: 'itemlist.style',
  params: [
    {id: 'hideHeaders', as: 'boolean', type: 'boolean'},
    {id: 'classForTable', as: 'string', defaultValue: 'mdc-data-table__table mdc-data-table--selectable'}    
  ],
  impl: customStyle({
    template: (cmp,{ctrls,itemsCtxs,sortOptions,hideHeaders,classForTable},h) => 
      h('div.jb-itemlist mdc-data-table',{}, h('table',{class: classForTable}, [
        ...(hideHeaders ? [] : [h('thead',{},h('tr.mdc-data-table__header-row',{},
            ctrls[0] && ctrls[0].map(ctrl=>ctrl.field()).map((f,i) =>h('th.mdc-data-table__header-cell',{
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
        h('tbody.jb-drag-parent mdc-data-table__content',{},
            ctrls.map((ctrl,index)=> h('tr.jb-item mdc-data-table__row',{ 'jb-ctx': itemsCtxs[index]}, ctrl.map( singleCtrl => 
              h('td.mdc-data-table__cell', {}, h(singleCtrl)))))),
        itemsCtxs.length == 0 ? 'no items' : ''            
    ])),
    css: `{width: 100%}  
    ~ .mdc-data-table__header-cell, ~ .mdc-data-table__cell {color: var(--jb-fg)}`,
    features: [itemlist.init(), mdcStyle.initDynamic()]
  })
})
