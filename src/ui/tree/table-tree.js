jb.ns('table-tree,tree')
jb.ns('json')

jb.component('tableTree', {
  type: 'control',
  params: [
    {id: 'treeModel', type: 'tree.node-model', dynamic: true, mandatory: true},
    {id: 'leafFields', type: 'control[]', dynamic: true},
    {id: 'commonFields', type: 'control[]', dynamic: true, as: 'array'},
    {id: 'chapterHeadline', type: 'control', dynamic: true, defaultValue: text(''), description: '$collapsed as parameter'},
    {id: 'style', type: 'table-tree.style', defaultValue: tableTree.plain({}), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true, as: 'array'}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('tree.modelFilter', {
  type: 'tree.node-model',
  description: 'filters a model by path filter predicate',
  params: [
    {id: 'model', type: 'tree.node-model', mandatory: true},
    {id: 'pathFilter', type: 'boolean', dynamic: true, mandatory: true, description: 'input is path. e.g a~b~c'}
  ],
  impl: (ctx, model, pathFilter) => Object.assign(Object.create(model),{
                children: path => model.children(path).filter(childPath => pathFilter(ctx.setData(childPath)))
    })
})

jb.component('tableTree.init', {
  type: 'feature',
  params: [
    {id: 'autoOpenFirstLevel', as: 'boolean', type: 'boolean'}
  ],
  impl: features(
    calcProp({
        id: 'expanded',
        value: (ctx,{cmp,$props},{autoOpenFirstLevel}) => {
        const treeModel = cmp.treeModel
        cmp.state = cmp.state || {}
        const firstTime = !cmp.state.expanded
        cmp.state.expanded = cmp.state.expanded || {}
        if (firstTime) {
            const allPathsToExtend = [
                treeModel.rootPath,
                ...(autoOpenFirstLevel && treeModel.children(treeModel.rootPath) || []),
                ...($props.pathsToExtend || []),
            ]
            allPathsToExtend.forEach(path=>expandPathWithChildren(path))
        }
        return cmp.state.expanded

        function expandPathWithChildren(path) {
            path.split('~').reduce((base, x) => {
                const inner = base != null ? (base + '~' + x) : x;
                cmp.state.expanded[inner] = true
                return inner
            },null)
        }
    }
      }),
    calcProp({
        id: 'items',
        value: (ctx,{cmp}) => {
            const treeModel = cmp.treeModel
            if (ctx.vars.$model.includeRoot)
                return calcItems(treeModel.rootPath, 0)
            else
                return calcItems(treeModel.rootPath, -1).filter(x=>x.depth > -1)

            function calcItems(top, depth) {
                const item = [{path: top, depth, val: treeModel.val(top), expanded: cmp.state.expanded[top]}]
                if (cmp.state.expanded[top])
                    return treeModel.children(top).reduce((acc,child) =>
                        depth >= treeModel.maxDepth ? acc : acc = acc.concat(calcItems(child, depth+1)),item)
                return item
            }
        }
      }),
    interactiveProp('treeModel', '%$$model.treeModel%'),
    interactive(
        (ctx,{cmp}) => {
            cmp.state.expanded = jb.objFromEntries(Array.from(cmp.base.querySelectorAll('[expanded=true]'))
                    .map(x=>x.getAttribute('path')).concat([cmp.treeModel.rootPath]).map(x=>[x,true]))
            cmp.flip = (event) => {
                const path = elemToPath(event.target)
                if (!path) debugger
                path.split('~').slice(0,-1).reduce((base, x) => {
                    const inner = base != null ? (base + '~' + x) : x;
                    cmp.state.expanded[inner] = true
                    return inner
                },null)
                cmp.state.expanded[path] = !(cmp.state.expanded[path]);
                cmp.refresh(null,{srcCtx: ctx.componentContext});
            }
            function elemToPath(el) { return el && (el.getAttribute('path') || jb.ui.closest(el,'.jb-item') && jb.ui.closest(el,'.jb-item').getAttribute('path')) }
        }
      ),
    feature.init(
        (ctx,{cmp},{autoOpenFirstLevel}) => {
            const treeModel = cmp.treeModel = ctx.vars.$model.treeModel()
            cmp.renderProps.maxDepth = treeModel.maxDepth = (treeModel.maxDepth || 5)

            cmp.leafFields = calcFields('leafFields')
            cmp.commonFields = calcFields('commonFields')
            cmp.fieldsForPath = path => treeModel.isArray(path) ? cmp.commonFields : cmp.leafFields.concat(cmp.commonFields)
            cmp.headline = item => headlineCmp(item)

            cmp.expandingFieldsOfItem = item => {
                const maxDepthAr = Array.from(new Array(treeModel.maxDepth))
                const depthOfItem = (item.path.match(/~/g) || []).length - (treeModel.rootPath.match(/~/g) || []).length - 1
                // return tds until depth and then the '>' sign, and then the headline
                return maxDepthAr.filter((e,i) => i < depthOfItem+2)
                    .map((e,i) => {
                        if (i < depthOfItem || i == depthOfItem && !treeModel.isArray(item.path))
                            return { empty: true }
                        if (i == depthOfItem) return {
                            expanded: cmp.state.expanded[item.path],
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
            function calcFields(fieldsProp) {
                return ctx.vars.$model[fieldsProp]().map(x=>x.field())
            }
            function headlineCmp(item) {
                return ctx.vars.$model.chapterHeadline(
                        ctx.setData({path: item.path, val: treeModel.val(item.path)})
                            .setVars({item,collapsed: ctx2 => !cmp.state.expanded[item.path]}))
            }
        }
      )
  )
})

jb.component('tableTree.plain', {
  type: 'table-tree.style',
  params: [
    {id: 'hideHeaders', as: 'boolean', type: 'boolean'},
    {id: 'autoOpenFirstLevel', as: 'boolean', type: 'boolean'},
    {id: 'gapWidth', as: 'number', defaultValue: 30},
    {id: 'expColWidth', as: 'number', defaultValue: 16},
    {id: 'noItemsCtrl', type: 'control', dynamic: true, defaultValue: text('no items')}
  ],
  impl: customStyle({
    template: (cmp,{ expanded, items, maxDepth, hideHeaders, gapWidth, expColWidth, noItemsCtrl},h) => h('table',{},[
        ...Array.from(new Array(maxDepth)).map(f=>h('col',{width: expColWidth + 'px'})),
        h('col',{width: gapWidth + 'px'}),
        ...cmp.leafFields.concat(cmp.commonFields).map(f=>h('col',{width: f.width || '200px'})),
        ...(hideHeaders ? [] : [h('thead',{},h('tr',{},
        Array.from(new Array(maxDepth+1)).map(f=>h('th',{class: 'th-expand-collapse'})).concat(
            [...cmp.leafFields, ...cmp.commonFields].map(f=>h('th',{'jb-ctx': f.ctxId},jb.ui.fieldTitle(cmp,f,h))) )))]),
        h('tbody',{class: 'jb-drag-parent'},
          items.map((item,index)=> h('tr',{ class: 'jb-item', path: item.path, expanded: expanded[item.path] },
            [...cmp.expandingFieldsOfItem(item).map(f=>h('td',
              f.empty ? { class: 'empty-expand-collapse'} :
                f.toggle ? {class: 'expandbox' } : {class: 'headline', colSpan: f.colSpan, onclick: 'flip' },
              f.empty ? '' : f.toggle ? h('span',{}, h('i',{class:'material-icons noselect', onclick: 'flip'  },
                f.expanded ? 'keyboard_arrow_down' : 'keyboard_arrow_right')) : h(cmp.headline(item))
              )),
              ...cmp.fieldsForPath(item.path).map(f=>h('td', {'jb-ctx': jb.ui.preserveFieldCtxWithItem(f,item), class: 'tree-field'},
              h(f.control(item,index),{index: index})))
            ]
        ))),
        items.length == 0 ? h(noItemsCtrl()) : ''
      ]),
    css: `{border-spacing: 0; text-align: left;width: 100%; table-layout:fixed;}
      >tbody>tr>td { vertical-align: bottom; height: 30px; }
      >tbody>tr>td>span { font-size:16px; cursor: pointer; border: 1px solid transparent }
      >tbody>tr>td>span>i { font-size: 16px; vertical-align: middle;}
      `,
    features: tableTree.init('%$autoOpenFirstLevel%')
  })
})

jb.component('json.pathSelector', {
  description: 'select, query, goto path',
  params: [
    {id: 'base', as: 'single', description: 'object to start with'},
    {id: 'path', description: 'string with ~ separator or array'}
  ],
  impl: (ctx,base) => {
        const path = jb.val(ctx.params.path)
        const path_array = typeof path == 'string' ? path.split('~').filter(x=>x) : jb.asArray(path)
        return path_array.reduce((o,p) => o && o[p], base)
    }
})

jb.component('tableTree.expandPath', {
  type: 'table-tree.style',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: calcProp({
    id: 'pathsToExtend',
    value: ({},{$props},{path}) => [...path.split(','), ...($props.pathsToExtend || [])],
    phase: 5
  })
})

