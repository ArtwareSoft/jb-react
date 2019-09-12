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
      {id: 'isChapter', dynamic: true, as: 'boolean', description: 'path as input. children != [] is default' },
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
            cmp.state.expanded = {[treeModel.rootPath]: true}
            cmp.refresh = () => cmp.setState({items: cmp.calcItems()})
            cmp.calcItems = () => calcItems(treeModel.rootPath,0)
            cmp.leafFields = calcFields('leafFields')
            cmp.commonFields = calcFields('commonFields')
            cmp.fieldsForPath = path => treeModel.isArray(path) ? cmp.commonFields : cmp.leafFields.concat(cmp.commonFields)

            cmp.treeFieldsOfItem = (item) => Array.from(new Array(treeModel.maxDepth))
                .filter((e,i) => (item.path.match(/~/g) || []).length <= i)
                .map((e,i) => (item.path.match(/~/g) || []).length == i  && treeModel.isArray(item.path) ? 
                    {
                        expanded: cmp.state.expanded[item.path],
                        toogle: () => { 
                            cmp.state.expanded[item.path] = !cmp.state.expanded[item.path]
                            cmp.refresh()
                        },
                        headline: cmp.ctx.setData(treeModel.val(item.path)).setVars({item,collapsed: !cmp.state.expanded[item.path]})
                            .run(ctx.vars.$model.chapterHeadline.profile).reactComp(),
                        colSpan: treeModel.maxDepth - i + cmp.leafFields.length
                    } : {empty: true}
                )
            
            function enrichWithFieldAspects(ctrlProfile,field) {
                cmp.ctx.run(ctrlProfile.features || '',{as: 'array'}).forEach(f=>f.enrichField && f.enrichField(field))
                return field
            }

            function getOrCreateControl(path,ctrlProfile,createCtrl) {
                cmp.ctrlCash = cmp.ctrlCash || {}
                cmp.ctrlCash[path] = cmp.ctrlCash[path] || new Map()
                cmp.ctrlCash[path][ctrlProfile] = mp.ctrlCash[path][ctrlProfile] || createCtrl()
                return cmp.ctrlCash[path][ctrlProfile]
            }

            function calcItems(top, depth) {
                if (cmp.state.expanded[top])
                    return treeModel.children(top).reduce((acc,child) => 
                        acc = acc.concat(calcItems(child, depth+1)),[])
                return [{path: top, depth}]
            }
            function calcFields(fieldsProp) {
                return jb.asArray(ctx.vars.$model[fieldsProp].profile).filter(x=>x)
                .map(ctrlProfile => enrichWithFieldAspects(ctrlProfile, {
                    title: cmp.ctx.run(ctrlProfile.title || ''), 
                    class: '', 
                    control: (path,index) => getOrCreateControl(path,ctrlProfile,
                        () => cmp.ctx.setData(treeModel.val(path)).setVars({index: (index||0)+1}).run(ctrlProfile).reactComp()) 
                }))
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
          ...(cmp.hideHeaders ? [] : [h('thead',{},h('tr',{},
          Array.from(new Array(cmp.treeModel.maxDepth)).map(f=>h('th',{class: 'th-expand-collapse'})).concat(
                [...cmp.leafFields, ...cmp.commonFields].map(f=>h('th',{'jb-ctx': f.ctxId, style: { width: f.width ? f.width + 'px' : ''} },f.title)) )))]),
          h('tbody',{class: 'jb-drag-parent'},
              state.items.map((item,index)=> jb.ui.item(cmp,h('tr',{ class: 'jb-item'}, 
                cmp.treeFieldsOfItem(item).map(f=>h('td', f.empty ? {} : {class: 'expandbox', colSpan: f.colSpan}, f.empty ? '' :[
                    h('i',{class:'material-icons noselect', onclick: _=> f.toggle() }, f.expanded ? 'keyboard_arrow_down' : 'keyboard_arrow_right'),
                    h(f.headline)
                ])).concat(
                    cmp.fieldsForPath(item.path).map(f=>h('td', {class: 'ctrl'}, h(f.control(item.path,index),{index: index}))))
              ), cmp.treeModel.val(item.path) ))
          ),
          state.items.length == 0 ? 'no items' : ''
          ]),
      css: `{border-spacing: 0; text-align: left}
      >tbody>tr>td>ctrl { padding-right: 5px }
      >thead>.th-expand-collapse { width: 16px }
      >tbody>tr>td>expandbox { font-size:16px; cursor: pointer; width: 16px, border: 1px solid transparent }
      {width: 100%}
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