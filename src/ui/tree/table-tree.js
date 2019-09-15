jb.ns('table-tree')
jb.ns('json')

jb.component('table-tree', {
    type: 'control',
    params: [
      {id: 'treeModel', type: 'tree.node-model', dynamic: true, mandatory: true},
      {id: 'leafFields', type: 'control[]', dynamic: true},
      {id: 'commonFields', type: 'control[]', dynamic: true},
      {id: 'chapterHeadline', type: 'control', dynamic: true, defaultValue: label(''), description: '$collapsed as parameter'},
      {id: 'style', type: 'table-tree.style', defaultValue: tableTree.plain(), dynamic: true},
      {id: 'features', type: 'feature[]', dynamic: true}
    ],
    impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('tree.node-model', {
    description: 'tree model of paths with ~ as separator',
    type: 'tree.node-model',
    params: [
      {id: 'rootPath', as: 'single', mandatory: true },
      {id: 'children', dynamic: true, mandatory: true, description: 'from parent path to children paths' },
      {id: 'pathToItem', dynamic: true, mandatory: true, description: 'value of path' },
      {id: 'icon', dynamic: true, as: 'string', description: 'icon name from material icons' },
      {id: 'isChapter', dynamic: true, as: 'boolean', description: 'path as input. differnt from children() == 0, as you can drop into empty array' },
      {id: 'maxDepth',  as: 'number', defaultValue: 3 },
    ],
    impl: ctx => ({
        rootPath: ctx.params.rootPath,
        children: path => ctx.params.children(ctx.setData(path)),
        val: path => ctx.params.pathToItem(ctx.setData(path)),
        icon: path => ctx.params.icon(ctx.setData(path)),
        title: () => '',
        isArray: path => ctx.params.isChapter.profile ? ctx.params.isChapter(ctx.setData(path)) : ctx.params.children(ctx.setData(path)).length,
        maxDepth: ctx.params.maxDepth
    })
})
  
jb.component('table-tree.init', {
    type: 'feature',
    impl: ctx => ({
        beforeInit: cmp => {
            const treeModel = cmp.treeModel = cmp.ctx.vars.$model.treeModel()
            treeModel.maxDepth = treeModel.maxDepth || 5
            cmp.state.expanded = {[treeModel.rootPath]: true}
            cmp.refresh = () => cmp.setState({items: cmp.calcItems()})
            cmp.calcItems = () => calcItems(treeModel.rootPath,0)
            cmp.leafFields = calcFields('leafFields')
            cmp.commonFields = calcFields('commonFields')
            cmp.fieldsForPath = path => treeModel.isArray(path) ? cmp.commonFields : cmp.leafFields.concat(cmp.commonFields)
            cmp.headline = item => ctx.vars.$model.chapterHeadline(
                cmp.ctx.setData({path: item.path, val: treeModel.val(item.path)})
                    .setVars({item,collapsed: !cmp.state.expanded[item.path]})).reactComp()

            cmp.treeFieldsOfItem = item => {
                const maxDepthAr = Array.from(new Array(treeModel.maxDepth))
                // return tds until depth and then the '>' sign with colSpan
                return maxDepthAr.filter((e,i) => i <= (item.path.match(/~/g) || []).length)
                    .map((e,i) => (item.path.match(/~/g) || []).length == i ? 
                    {
                        expandable: treeModel.isArray(item.path),
                        expanded: cmp.state.expanded[item.path],
                        toggle: () => { 
                            cmp.state.expanded[item.path] = !cmp.state.expanded[item.path]
                            cmp.refresh()
                        },
                        colSpan: treeModel.maxDepth-i + (treeModel.isArray(item.path) ? cmp.leafFields.length : 0)
                    } : {empty: true}
                )
            }
            
            function calcItems(top, depth) {
                if (cmp.state.expanded[top])
                    return treeModel.children(top).reduce((acc,child) => 
                        depth >= treeModel.maxDepth ? acc : acc = acc.concat(calcItems(child, depth+1)),[{path: top, depth, val: treeModel.val(top)}])
                return [{path: top, depth, val: treeModel.val(top)}]
            }
            function calcFields(fieldsProp) {
                const fields = ctx.vars.$model[fieldsProp]().map(x=>x.field)
                //fields.forEach(f=>f._control = (path,index) => f.control({path, val: treeModel.val(path)},index))
                return fields
            }
        },
        init: cmp => cmp.state.items = cmp.calcItems(),
    })
})
  
jb.component('table-tree.plain', {
    params: [ 
      { id: 'hideHeaders',  as: 'boolean' },
    ],
    type: 'table.style,itemlist.style',
    impl: customStyle({
      template: (cmp,state,h) => h('table',{},[
          ...Array.from(new Array(cmp.treeModel.maxDepth)).map(f=>h('col',{width: '16px'})),
          h('col',{width: '200px'}),
          ...cmp.leafFields.concat(cmp.commonFields).map(f=>h('col',{width: f.width || '200px'})),
          ...(cmp.hideHeaders ? [] : [h('thead',{},h('tr',{},
          Array.from(new Array(cmp.treeModel.maxDepth+1)).map(f=>h('th',{class: 'th-expand-collapse'})).concat(
                [...cmp.leafFields, ...cmp.commonFields].map(f=>h('th',{'jb-ctx': f.ctxId, style: { width: f.width ? f.width + 'px' : ''} },jb.ui.fieldTitle(cmp,f,h))) )))]),
          h('tbody',{class: 'jb-drag-parent'},
              state.items.map((item,index)=> jb.ui.item(cmp,h('tr',{ class: 'jb-item', path: item.path}, 
                [...cmp.treeFieldsOfItem(item).map(f=>h('td', 
                            f.empty ? { class: 'empty-expand-collapse'} : {class: 'expandbox', colSpan: f.colSpan}, 
                            f.empty ? '' : h('span',{}, [f.expandable ? h('i',{class:'material-icons noselect', onclick: _=> f.toggle() },
                                            f.expanded ? 'keyboard_arrow_down' : 'keyboard_arrow_right') : '', h(cmp.headline(item))])
                )), h('td',{class: 'tree-expand-title'}), 
                    ...cmp.fieldsForPath(item.path).map(f=>h('td', {'jb-ctx': jb.ui.preserveFieldCtxWithItem(f,item), class: 'tree-field'}, 
                        h(f.control(item,index),{index: index}))) ]
              ), item ))
          ),
          state.items.length == 0 ? 'no items' : ''
          ]),
      css: `{border-spacing: 0; text-align: left}
      >tbody>tr>td>ctrl { padding-right: 5px }
      >thead>.th-expand-collapse { width: 16px }
      >tbody>tr>td>span { font-size:16px; cursor: pointer; display: flex;
        align-items: center; width: 16px; border: 1px solid transparent }
      {width: 100%; table-layout:fixed;}
      `,
      features: tableTree.init()
    })
})

jb.component('json.path-selector', {
    description: 'select, query, goto path',
    params: [
        {id: 'base', as: 'single', description: 'object to start with' },
        {id: 'path', description: 'string with ~ separator or array' },
    ],
    impl: (ctx,base) => {
        const path = jb.val(ctx.params.path)
        const path_array = typeof path == 'string' ? path.split('~').filter(x=>x) : jb.asArray(path)
        return path_array.reduce((o,p) => o && o[p], base)
    }
})