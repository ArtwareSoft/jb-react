jb.dsl('zui')

jb.component('zui.itemlist', {
  type: 'control<>',
  params: [
    {id: 'itemView', type: 'view', mandatory: true, dynamic: true},
    {id: 'title', as: 'string'},
    {id: 'boardSize', as: 'number', defaultValue: 256},
    {id: 'initialZoom', as: 'number', description: 'in terms of board window. empty is all board'},
    {id: 'items', as: 'array', dynamic: true, mandatory: true},
    {id: 'itemProps', type: 'itemProp[]', dynamic: true, flattenArray: true},
    {id: 'onChange', type: 'action<>', dynamic: true},
    {id: 'style', type: 'itemlistStyle<zui>', dynamic: true, defaultValue: itemlistStyle()},
    {id: 'features', type: 'feature<>[]', dynamic: true, flattenArray: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})
  
jb.component('itemlistStyle', {
  type: 'itemlistStyle',
  params: [
    {id: 'width', as: 'number', defaultValue: 600},
    {id: 'height', as: 'number', defaultValue: 460}
  ],
  impl: customStyle({
    typeCast: 'style',
    template: ({},{width,height},h) => h('canvas',{width, height}),
    css: '{ touch-action: none; }',
    features: [
      calcProps(
        (ctx,{$model,zuiCtx},{width,height})=> {
        const DIM = $model.boardSize
        const items = $model.items()
        const zoom = +($model.initialZoom || DIM)
        const renderProps = {itemView: { size: [width,height], zoom }}
        const ctxWithItems = ctx.setVars({items, renderProps})
        const itemProps = $model.itemProps(ctxWithItems)
        const itemView = $model.itemView(ctxWithItems.setVars({itemProps}))
        const onChange = $model.onChange.profile && $model.onChange
        const pivotsFromItemProps = itemProps.flatMap(prop=>prop.pivots())
        const pivots = [...pivotsFromItemProps, ...itemView.pivots().filter(p=>! pivotsFromItemProps.find(_p => _p.att == p.att)) ]
        pivots.forEach(p=>{if (p.preferedAxis) pivots[p.preferedAxis] = p})
        const elems = itemView.zuiElems()
        const itemsPositions = jb.zui.calcItemsPositions({items, pivots, DIM})
        const props = {
          DIM, ZOOM_LIMIT: [1, DIM*2], itemView, elems, items, pivots, onChange, center: [DIM* 0.5, DIM* 0.5]
            , zoom, renderProps, itemsPositions,
            ...jb.zui.prepareItemView(itemView)
        }
        if (zuiCtx) 
          zuiCtx.props = props
        jb.zui.layoutView(itemView, renderProps, props)
        return props
      }
      ),
      frontEnd.coLocation(),
      frontEnd.init(
        async ({},{cmp, el, $props}) => {
          const props = cmp.props = $props
          const gl = el.getContext('webgl', { alpha: true, premultipliedAlpha: true })
          gl.enable(gl.BLEND)
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

          Object.assign(props, { glCanvas: el, gl, aspectRatio: el.width/el.height })
          jb.zui.initZuiCmp(cmp,props)
          jb.zui.initItemlistCmp(cmp,props)
          await Promise.all(props.elems.map(elem =>elem.prepare && elem.prepare(props)).filter(x=>x))

          jb.zui.clearCanvas(props)
          cmp.render()
          el.setAttribute('zui-rendered',true) // for tests
      }
      ),
      frontEnd.prop('zuiEvents', rx.subject()),
      frontEnd.flow(
        source.frontEndEvent('pointerdown'),
        rx.log('zui pointerdown'),
        rx.var('pid', '%pointerId%'),
        rx.do(
          ({},{cmp,pid}) => cmp.addPointer(pid)
        ),
        rx.flatMap(
          rx.mergeConcat(
            rx.pipe(
              rx.merge(source.event('pointermove'), source.frontEndEvent('pointerup')),
              rx.filter('%$pid%==%pointerId%'),
              rx.do(
                ({data},{cmp,pid}) => cmp.updatePointer(pid,data)
              ),
              rx.takeWhile('%type%==pointermove'),
              rx.flatMap(
                source.data(
                  ({},{cmp}) => cmp.zoomEventFromPointers()
                )
              )
            ),
            rx.pipe(
              source.data(
                ({},{cmp,pid}) => cmp.momentumEvents(pid)
              ),
              rx.var('delay', '%delay%'),
              rx.flatMap(rx.pipe(source.data('%events%'))),
              rx.delay('%$delay%'),
              rx.log('momentum zui')
            ),
            rx.pipe(
              source.data(1),
              rx.do(
                ({data},{cmp}) => cmp.removePointer(data.pointerId)
              )
            )
          )
        ),
        rx.do(
          ({data},{cmp}) => cmp.updateZoomState(data)
        ),
        sink.subjectNext('%$cmp.zuiEvents%')
      ),
      frontEnd.flow(source.subject('%$cmp.zuiEvents%'), sink.action('%$cmp.render()%')),
      frontEnd.flow(
        source.frontEndEvent('wheel'),
        rx.log('zui wheel'),
        rx.map(
          ({},{sourceEvent}) => ({ dz: sourceEvent.deltaY > 0 ? 1.1 : sourceEvent.deltaY < 0 ? 0.9 : 1 })
        ),
        rx.do(
          ({data},{cmp}) => cmp.updateZoomState(data)
        ),
        sink.subjectNext('%$cmp.zuiEvents%')
      )
    ]
  })
})

jb.extension('zui','itemlist', {
  initItemlistCmp(cmp,props) {
//    props.elems.forEach(elem => elem.specificProps && Object.assign(props, elem.specificProps(props)))
    props.elems.forEach(elem => elem.buffers = elem.prepareGPU(props))
    Object.assign(props, jb.zui.prepareItemView(props.itemView))
    Object.assign(cmp, {
      render() {
        const { itemView, zoom, glCanvas,elems, renderProps } = props
        const [width, height] = [glCanvas.width/ zoom, glCanvas.height/ zoom]
        renderProps.itemView = { size: [width,height], zoom }
        jb.zui.layoutView(itemView, renderProps, props)
        const visibleElems = elems.filter(el=> jb.zui.isVisible(el))
        visibleElems.forEach(elem => elem.calcElemProps && elem.calcElemProps(props) )
        visibleElems.forEach(elem => elem.renderGPUFrame(props, elem.buffers))
        console.log('renderProps', renderProps)
      },
    })
  },
  viewState(ctx) {
    const {renderProps} = ctx.vars
    return renderProps[ctx.path] = renderProps[ctx.path] || {}
  },
  isVisible(el) {
    const { width, height } = el.state()
    return width && height    
  },
  // relevant for all zoom levels
  prepareItemView(itemView) {
    return {
      minSizes: calcMin(itemView).sort((r1,r2) => r1.priority - r2.priority)
    }
    function calcMin(view, parentAxis = 1) {
      return view.children ? aggregateMinRecs(view.children.map(v => calcMin(v, view.layoutAxis))) 
        : [{p: view.priority, path: view.path, min: view.layoutSizes({size:[0,0],zoom:1}).slice(0,2) }]

      function aggregateMinRecs(childRecords) {
        if (parentAxis == view.layoutAxis)           // in the layout axis all records.
          return childRecords.flatMap(ar=>ar)
        // in the perpendicular axis - take only highest priority. bug - shadows lower priority and less demand
        return childRecords.flatMap(ar=>ar.sort((x,y) => x.priority < y.priority).slice(-1))
      }
    }
  },
  layoutView(itemView,renderProps,{minSizes}) {
    const itemViewSize = renderProps.itemView.size
    const {residualForPref, filteredViews} = allocateMinAndFilter()


    //calcLayoutNeeds(itemView)
    // const residualForPref = allocateMin(itemView)
    // const residualForMax = allocatePref(itemView,residualForPref)
    // allocateMax(itemView,residualForMax)

    function allocateMinAndFilter() {
      const viewPathsCount = {}
      ;[0,1].map(axis => minSizes.reduce((residual,item) => {
          const toAlloc = item.min[axis]
          if (toAlloc < residual) {
            viewPathsCount[item.path] = (viewPathsCount[item.path] || 0) + 1
            return residual - toAlloc
          }
       }, itemViewSize[axis]))
      const filteredViews = jb.objFromEntries(Object.keys(viewPathsCount).filter(k=>viewPathsCount[k] == 2).map(k=>[k,1]))
      Object.keys(filteredViews).slice(0).forEach(k=>{ // add parent groups as filtered
        k.split('~').slice(1,-1).reduce((acc,key) => {
          const path = `${acc}~${key}`
          filteredViews[path] = true
          return path
        },k.split('~')[0])
      })
      const filteredMinSizes = minSizes.filter(r=>filteredViews[r.path])
      const residualForPref = [0,1].map(axis => filteredMinSizes.reduce((residual,item) => {
          const toAlloc = item.min[axis]
          if (toAlloc < residual) {
            assignRenderPropsWithAxis(item.path,axis, 'allocMin', toAlloc)
            // if (isGroupChangingAxis(item.view)) {
            //   allocateMinAndFilter(item.view)
            // }
            return residual - toAlloc
          }
        }, itemViewSize[axis]))
      
      return {residualForPref, filteredViews}
    }

    function calcLayoutNeeds(view, type) { // bottom up
      const needs = view.children ? view.children.filter(v=>filteredViews[v.path]).reduce( (acc,v) => {
        const needs = calcLayoutNeeds(v)
        ;['min', 'pref', 'max'].forEach(t=> {
          if (acc[t]) acc[t] = [...jb.asArray(acc[t]),...needs[t]] 
        })
        return acc
      } , {}) : calcLeafNeeds(view, view.layoutSizes(itemViewSizes))
      return assignRenderProps(view.path,{needs})
    }

    function calcLeafNeeds(view, [minX, minY, prefX,PrefY, maxX,MaxY]) {
      const p = view.priority, path = view.path
      return { 
        min: {p, size: [minX, minY], path}, 
        ...(prefX || PrefY) ? {pref: {p, size: [prefX,PrefY], path}} : {}, 
        ...(maxX || MaxY) ? {max: { size: [maxX,MaxY], path}} : {}, 
      }
    }

    function assignRenderProps(path,obj) {
      return renderProps[path] = Object.assign(renderProps[path] || {},obj)
    }

    function assignRenderPropsWithAxis(path, axis, prop, val) {
      renderProps[path] = renderProps[path] || { prop: []}
      renderProps[path][prop] = renderProps[path][prop] || []
      renderProps[path][prop][axis] = val        
    }


  }
})