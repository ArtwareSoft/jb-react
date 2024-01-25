component('tableTree', {
  type: 'control',
  params: [
    {id: 'title', as: 'string'},
    {id: 'treeModel', type: 'tree.node-model', dynamic: true, mandatory: true},
    {id: 'leafFields', type: 'control[]', dynamic: true},
    {id: 'commonFields', type: 'control[]', dynamic: true, as: 'array'},
    {id: 'chapterHeadline', type: 'control', dynamic: true, defaultValue: text(''), description: '$collapsed as parameter'},
    {id: 'style', type: 'table-tree.style', defaultValue: tableTree.plain(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true, as: 'array'}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

component('tree.modelFilter', {
  type: 'tree.node-model',
  description: 'filters a model by path filter predicate',
  params: [
    {id: 'model', type: 'tree.node-model', mandatory: true},
    {id: 'pathFilter', type: 'boolean', dynamic: true, mandatory: true, description: 'input is path. e.g a~b~c'}
  ],
  impl: (ctx, model, pathFilter) => Object.assign(Object.create(model), {
        children: path => model.children(path).filter(childPath => pathFilter(ctx.setData(childPath)))
    })
})

component('tableTree.init', {
  type: 'feature',
  impl: features(
    calcProp('model', '%$$model/treeModel()%'),
    method('flip', runActions(
      ({},{$state,ev}) => {
        $state.expanded = $state.expanded || {}
        $state.expanded[ev.path] = !$state.expanded[ev.path]
      },
      action.refreshCmp('%$$state%')
    )),
    calcProp('expanded', ({},{$state,$props}) => ({ ...$state.expanded, ...$props.expanded, [$props.model.rootPath]: true })),
    frontEnd.prop('elemToPath', () => el => el && (el.getAttribute('path') || jb.ui.closest(el,'.jb-item') && jb.ui.closest(el,'.jb-item').getAttribute('path'))),
    frontEnd.enrichUserEvent(({},{cmp,ev}) => ({ path: cmp.elemToPath(ev.target)})),
    calcProp('itemsCtxs', (ctx,{$props,$model}) => {
            const ctxOfItem = (item,index) => ctx.setData({path: item.path, val: $props.model.val(item.path)}).setVars({index, item})

            const rootPath = $props.model.rootPath, expanded = $props.expanded, model = $props.model
            const items = $model.includeRoot ? calcItems(rootPath, 0) : calcItems(rootPath, -1).filter(x=>x.depth > -1)
            const itemsCtxs = items.map((item,i) => ctxOfItem(item,i))
            //itemsCtxs.forEach(iCtx => jb.ui .preserveCtx(iCtx))
            return itemsCtxs

            function calcItems(top, depth) {
                const item = [{path: top, depth, val: model.val(top), expanded: expanded[top]}]
                if (expanded[top])
                    return model.children(top).reduce((acc,child) =>
                        depth >= model.maxDepth ? acc : acc = acc.concat(calcItems(child, depth+1)),item)
                return item
            }
        }),
    calcProp('maxDepth', firstSucceeding('%$$model/maxDepth%',5)),
    calcProp('headerFields', list('%$$model/leafFields()/field()%','%$$model/commonFields()/field()%')),
    calcProp('ctrlsMatrix', (ctx,{$model,$props}) => {
        const model = $props.model, maxDepth = $props.maxDepth
        const maxDepthAr = Array.from(new Array(maxDepth))
        const expandingFields = path => {
              const depthOfItem = (path.match(/~/g) || []).length - (model.rootPath.match(/~/g) || []).length - 1
                // return tds until depth and then the '>' sign, and then the headline
              return maxDepthAr.filter((e,i) => i < depthOfItem+3)
                    .map((e,i) => {
                        if (i < depthOfItem || i == depthOfItem && !model.isArray(path))
                            return { empty: true }
                        if (i == depthOfItem) return {
                            expanded: $props.expanded[path],
                            toggle: true
                        }
                        if (i == depthOfItem+1) return {
                            headline: true,
                            colSpan: maxDepth-i+1
                        }
                        if (i == depthOfItem+2) return {
                            resizer: true
                        }                        
                        debugger
                    }
               )
        }
        return $props.itemsCtxs.map(iCtx => ({
            headlineCtrl: $model.chapterHeadline(iCtx),
            expandingFields: expandingFields(iCtx.data.path),
            ctrls: [
              ...($props.model.isArray(iCtx.data.path) ? [] : $model.leafFields(iCtx) ), 
              ...$model.commonFields(iCtx)
            ]
        }))
    })
  )
})

component('tableTree.expandFirstLevel', {
  type: 'feature',
  impl: calcProp({
    id: 'before calcProps',
    value: ({},{$state,$props}) => {
      if ($state.refresh) return
      const pathsAsObj = jb.objFromEntries($props.model.children($props.model.rootPath) || []).map(path=>[path,true])
      $props.expanded = Object.assign($props.expanded || {}, pathsAsObj)
    },
    phase: 5
  })
})

component('tableTree.plain', {
  type: 'table-tree.style',
  params: [
    {id: 'hideHeaders', as: 'boolean', type: 'boolean'},
    {id: 'gapWidth', as: 'number', defaultValue: 30},
    {id: 'expColWidth', as: 'number', defaultValue: 16},
    {id: 'noItemsCtrl', type: 'control', dynamic: true, defaultValue: text('no items')}
  ],
  impl: customStyle({
    template: (cmp,{headerFields, ctrlsMatrix, itemsCtxs, expanded, maxDepth, hideHeaders, gapWidth, expColWidth, noItemsCtrl},h) => h('table',{},[
        ...Array.from(new Array(maxDepth)).map(()=>h('col',{width: expColWidth + 'px'})),
        h('col.gapCol',{width: gapWidth + 'px'}),
        h('col.resizerCol',{width: '5px'}),
        ...headerFields.map(f=>h('col',{width: f.width || '200px'})),
        ...(hideHeaders ? [] : [ h('thead',{},h('tr',{},
          [ ...Array.from(new Array(maxDepth+2)).map(f=>h('th.th-expand-collapse',{})),
            ...headerFields.map(f=>h('th',{'jb-ctx': f.ctxId}, jb.ui.fieldTitle(cmp,f,h)))
          ]
        ))]),
        h('tbody.jb-items-parent',{},
          itemsCtxs.map((iCtx,index)=> h('tr.jb-item', {path: iCtx.data.path, expanded: expanded[iCtx.data.path] },
            [...ctrlsMatrix[index].expandingFields.map(f=>h('td.drag-handle',
                f.empty ? { class: 'empty-expand-collapse'} :
                f.resizer ? {class: 'tt-resizer' } : 
                f.toggle ? {class: 'expandbox' } : {class: 'headline', colSpan: f.colSpan, onclick: 'flip' },
              (f.empty || f.resizer) ? '' :
              f.toggle ? h('span',{}, h('i',{class:'material-icons noselect', onclick: 'flip' },
                f.expanded ? 'keyboard_arrow_down' : 'keyboard_arrow_right')) : h(ctrlsMatrix[index].headlineCtrl)
              )),
              ...ctrlsMatrix[index].ctrls.map(ctrl=>h('td.tree-field', {'jb-ctx': iCtx.id}, h(ctrl,{index})))
            ]
        ))),
        itemsCtxs.length == 0 ? h(noItemsCtrl()) : ''
      ]),
    css: `{border-spacing: 0; text-align: left;width: 100%; table-layout:fixed;}
      >tbody>tr>td { vertical-align: bottom; height: 30px; }
      >tbody>tr>td>span { font-size:16px; cursor: pointer; border: 1px solid transparent }
      >tbody>tr>td>span>i { font-size: 16px; vertical-align: middle;}
      `,
    features: tableTree.init()
  })
})

component('tableTree.expandPath', {
  type: 'feature',
  params: [
    {id: 'paths', as: 'array', descrition: 'array of paths to be expanded'}
  ],
  impl: tree.expandPath('%$paths%')
})

component('tableTree.resizer', {
  type: 'feature',
  impl: features(
    css('>tbody>tr>td.tt-resizer { cursor: col-resize }'),
    frontEnd.method('setSize', ({data},{el}) => el.querySelector('.gapCol').width = data + 'px'),
    frontEnd.flow(
      source.frontEndEvent('mousedown'),
      rx.filter(ctx => jb.ui.hasClass(ctx.data.target,'tt-resizer')),
      rx.var('offset', ({data},{el}) => data.clientX - (+el.querySelector('.gapCol').width.slice(0,-2))),
      rx.flatMap(
        rx.pipe(
          source.frontEndEvent('mousemove'),
          rx.takeWhile('%buttons%!=0'),
          rx.map(({data},{offset}) => Math.max(0, data.clientX - offset))
        )
      ),
      sink.FEMethod('setSize')
    )
  )
})

component('tableTree.dragAndDrop', {
  type: 'feature',
  impl: features(
    frontEnd.requireExternalLibrary('dragula.js','css/dragula.css'),
    frontEnd.var('uiTest', '%$uiTest%'),
    frontEnd.onRefresh((ctx,{cmp}) => cmp.drake && (cmp.drake.containers = jb.ui.find(cmp.base,'.jb-items-parent'))),
    method('moveItem', (ctx,{$props}) => $props.model.move(ctx.data.from,ctx.data.to,ctx)),
    frontEnd.init((ctx,{uiTest, cmp}) => {
        if (uiTest) return
        const drake = cmp.drake = dragula([], {
          moves: (el, source, handle) => jb.ui.parents(handle,{includeSelf: true}).some(x=>jb.ui.hasClass(x,'drag-handle')) && (el.getAttribute('path') || '').match(/[0-9]$/)
        })
        drake.containers = jb.ui.find(cmp.base,'.jb-items-parent')
        drake.on('drag', function(el, source) {
          const path = cmp.elemToPath(el)
          el.dragged = { path, expanded: cmp.state.expanded[path]}
          delete cmp.state.expanded[path]; // collapse when dragging
        })

        drake.on('drop', (dropElm, target, source,_targetSibling) => {
          if (!dropElm.dragged) return;
          dropElm.parentNode.removeChild(dropElm);
          cmp.state.expanded[dropElm.dragged.path] = dropElm.dragged.expanded // restore expanded state
          const targetSibling = _targetSibling
          let targetPath = targetSibling ? cmp.elemToPath(targetSibling) : target.lastElementChild ? addToIndex(cmp.elemToPath(target.lastElementChild),1) : cmp.elemToPath(target);
          // strange dragule behavior fix
          const draggedIndex = Number(dropElm.dragged.path.split('~').pop());
          const targetIndex = Number(targetPath.split('~').pop()) || 0;
          if (target === source && targetIndex > draggedIndex)
            targetPath = addToIndex(targetPath,-1)
          const from = dropElm.dragged.path
          const sameParent = dropElm.dragged.path.split('~').slice(0,-1).join('~') == targetPath.split('~').slice(0,-1).join('~')
          dropElm.dragged = null;
          if (sameParent)
            ctx.run(action.runBEMethod('moveItem',() => ({from, to: targetPath})))
        })
    })
  )
})

