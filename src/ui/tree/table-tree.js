jb.ns('table-tree,tree')
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

jb.component('tree.model-filter', {
    type: 'tree.node-model',
    description: 'filters a model by path filter predicate',
    params: [
        {id: 'model', type: 'tree.node-model', mandatory: true},
        {id: 'pathFilter', type: 'boolean', dynamic: true, mandatory: true, description: 'input is path. e.g a~b~c' }
    ],
    impl: (ctx, model, pathFilter) => Object.assign(Object.create(model),{
                children: path => model.children(path).filter(childPath => pathFilter(ctx.setData(childPath)))
    })
})
  
jb.component('table-tree.init', {
    type: 'feature',
    impl: ctx => ({
        beforeInit: cmp => {
            const treeModel = cmp.treeModel = cmp.ctx.vars.$model.treeModel()
            treeModel.maxDepth = treeModel.maxDepth || 5
            cmp.expanded = {[treeModel.rootPath]: true}
            treeModel.children(treeModel.rootPath).forEach(path=>cmp.expanded[path] = true)

            cmp.refresh = () => cmp.setState({items:cmp.calcItems()})
            cmp.itemsCache = {}
            cmp.headLineCache = {}
            cmp.calcItems = () => calcItems(treeModel.rootPath,0)
            cmp.leafFields = calcFields('leafFields')
            cmp.commonFields = calcFields('commonFields')
            cmp.fieldsForPath = path => treeModel.isArray(path) ? cmp.commonFields : cmp.leafFields.concat(cmp.commonFields)
            cmp.headline = item => getOrCreateHeadlineCmp(item)

            cmp.expandingFieldsOfItem = item => {
                const maxDepthAr = Array.from(new Array(treeModel.maxDepth))
                const depthOfItem = (item.path.match(/~/g) || []).length - (treeModel.rootPath.match(/~/g) || []).length - 1
                // return tds until depth and then the '>' sign, and then the headline
                return maxDepthAr.filter((e,i) => i < depthOfItem+2)
                    .map((e,i) => {
                        if (i < depthOfItem || i == depthOfItem && !treeModel.isArray(item.path)) 
                            return { empty: true }
                        if (i == depthOfItem) return {
                            expanded: cmp.expanded[item.path],
                            toggle: true
                        }
                        if (i == depthOfItem+1) return {
                            headline: true,
                            colSpan: treeModel.maxDepth-i+1
                        }
                        debugger
                    }
                )
            }

            cmp.flipExpandCollapse = e => {
                const path = cmp.elemToPath(e.target)
                if (!path) debugger
                cmp.expanded[path] = !(cmp.expanded[path]);
                cmp.refresh();
            }
            cmp.elemToPath = el => el && (el.getAttribute('path') || jb.ui.closest(el,'.jb-item') && jb.ui.closest(el,'.jb-item').getAttribute('path'))


            function calcItems(top) {
                if (cmp.ctx.vars.$model.includeRoot)
                    return refreshItemsFromCache(doCalcItems(top, 0))
                return refreshItemsFromCache(doCalcItems(top, -1).filter(x=>x.depth > -1))
            }
            function refreshItemsFromCache(items) {
                return items.map(item=>{
                    if (!cmp.itemsCache[item.path])
                        cmp.itemsCache[item.path] = item
                    return Object.assign(cmp.itemsCache[item.path],item)
                })
            }
            function doCalcItems(top, depth) {
                const item = [{path: top, depth, val: treeModel.val(top), expanded: cmp.expanded[top]}]
                if (cmp.expanded[top])
                    return treeModel.children(top).reduce((acc,child) => 
                        depth >= treeModel.maxDepth ? acc : acc = acc.concat(doCalcItems(child, depth+1)),item)
                return item
            }
            function getOrCreateControl(field,item,index) {
                if (!treeModel.FieldCache)
                    return field.control(item,index,true)
                cmp.ctrlCache = cmp.ctrlCache || {}
                const key = item.path+'~!'+item.expanded + '~' +field.ctxId
                cmp.ctrlCache[key] = cmp.ctrlCache[key] || field.control(item,index)
                return cmp.ctrlCache[key]
            }
            function calcFields(fieldsProp) {
                const fields = ctx.vars.$model[fieldsProp]().map(x=>x.field())
                fields.forEach(f=>f.cachedControl = (item,index) => getOrCreateControl(f,item,index))
                return fields
            }
            function headlineCmp(item) {
                return ctx.vars.$model.chapterHeadline(
                        cmp.ctx.setData({path: item.path, val: treeModel.val(item.path)})
                            .setVars({item,collapsed: ctx2 => !cmp.expanded[item.path]}))
            }
            function getOrCreateHeadlineCmp(item) {
                if (!treeModel.HeadLineCache)
                    return headlineCmp(item)
                if (!cmp.headLineCache[item.path])
                    cmp.headLineCache[item.path] = headlineCmp(item)
                return cmp.headLineCache[item.path]
            }
        },
        init: cmp => cmp.state.items = cmp.calcItems(),
    })
})
  
jb.component('table-tree.plain', {
    type: 'table-tree.style',
    params: [ 
      { id: 'hideHeaders',  as: 'boolean' },
      { id: 'gapWidth', as: 'number', defaultValue: 30 },
      { id: 'expColWidth', as: 'number', defaultValue: 16 },
      { id: 'noItemsCtrl', type: 'control', dynamic: true, defaultValue: text('no items') },
    ],
    impl: customStyle({
      template: (cmp,state,h) => h('table',{},[
          ...Array.from(new Array(cmp.treeModel.maxDepth)).map(f=>h('col',{width: cmp.expColWidth + 'px'})),
          h('col',{width: cmp.gapWidth + 'px'}),
          ...cmp.leafFields.concat(cmp.commonFields).map(f=>h('col',{width: f.width || '200px'})),
          ...(cmp.hideHeaders ? [] : [h('thead',{},h('tr',{},
          Array.from(new Array(cmp.treeModel.maxDepth+1)).map(f=>h('th',{class: 'th-expand-collapse'})).concat(
                [...cmp.leafFields, ...cmp.commonFields].map(f=>h('th',{'jb-ctx': f.ctxId},jb.ui.fieldTitle(cmp,f,h))) )))]),
          h('tbody',{class: 'jb-drag-parent'},
              state.items.map((item,index)=> jb.ui.item(cmp,h('tr',{ class: 'jb-item', path: item.path }, 
                [...cmp.expandingFieldsOfItem(item).map(f=>h('td',
                            f.empty ? { class: 'empty-expand-collapse'} : f.toggle ? {class: 'expandbox' } : {class: 'headline', colSpan: f.colSpan, onclick: 'flipExpandCollapse' },
                            f.empty ? '' : f.toggle ? h('span',{}, h('i',{class:'material-icons noselect', onclick: 'flipExpandCollapse'  },
                                            f.expanded ? 'keyboard_arrow_down' : 'keyboard_arrow_right')) : h(cmp.headline(item))
                )), 
                    ...cmp.fieldsForPath(item.path).map(f=>h('td', {'jb-ctx': jb.ui.preserveFieldCtxWithItem(f,item), class: 'tree-field'}, 
                        h(f.cachedControl(item,index),{index: index}))) ]
              ), item ))
          ),
          state.items.length == 0 ? h(cmp.noItemsCtrl()) : ''
          ]),
      css: `{border-spacing: 0; text-align: left;width: 100%; table-layout:fixed;}
      >tbody>tr>td>span { font-size:16px; cursor: pointer; display: flex; border: 1px solid transparent }
      >tbody>tr>td>span>i { font-size: 16px; }
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