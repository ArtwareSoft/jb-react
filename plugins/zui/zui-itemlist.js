
jb.dsl('zui')

jb.component('zui.itemlist', {
  type: 'control<>',
  params: [
    {id: 'itemView', type: 'view<zui>', mandatory: true, dynamic: true},
    {id: 'title', as: 'string'},
    {id: 'boardSize', as: 'number', defaultValue: 256},
    {id: 'initialZoom', as: 'number', description: 'in terms of board window. empty is all board'},
    {id: 'center', as: 'string', description: 'e.g., 2,7'},
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
    {id: 'width', as: 'string', defaultValue: '100%'},
    {id: 'height', as: 'string', defaultValue: '600'}
  ],
  impl: customStyle({
    typeCast: 'style',
    template: ({},{width,height},h) => h('canvas', {...jb.zui.calcWidthHeight(width, height), zuiBackEndForTest:true }),
    css: '{ touch-action: none; }',
    features: [
      calcProps(
        (ctx,{$model,zuiCtx},{width,height})=> {
        const sizeInPx = jb.zui.calcWidthHeight(width, height)
        const DIM = $model.boardSize
        const items = jb.utils.unique( $model.items(), x => x.name)
        const zoom = +($model.initialZoom || DIM)
        const tCenter = $model.center ? $model.center.split(',').map(x=>+x) : [DIM* 0.5, DIM* 0.5]
        const renderProps = {itemView: { size: [sizeInPx.width/zoom,sizeInPx.height/zoom], zoom }}
        const ctxWithItems = ctx.setVars({items, renderProps})
        const itemProps = $model.itemProps(ctxWithItems)
        const itemView = $model.itemView(ctxWithItems.setVars({itemProps}))
        const onChange = $model.onChange.profile && $model.onChange
        const pivotsFromItemProps = itemProps.flatMap(prop=>prop.pivots({DIM}))
        const pivots = [...pivotsFromItemProps, ...itemView.pivots({DIM}).filter(p=>! pivotsFromItemProps.find(_p => _p.att == p.att)) ]
        pivots.forEach(p=>{if (p.preferedAxis) pivots[p.preferedAxis] = p})
        const elems = itemView.zuiElems()
        const itemsPositions = pivots.x && pivots.y && jb.zui.calcItemsPositions({items, pivots, DIM})
        const props = {
          DIM, ZOOM_LIMIT: [1, jb.ui.isMobile() ? DIM: DIM*2], itemView, elems, items, pivots, onChange, tCenter, center: [],
            tZoom: zoom, renderProps, itemsPositions, width,height,
            ...jb.zui.prepareItemView(itemView)
        }
        if (zuiCtx) 
          zuiCtx.props = props
        itemsPositions && jb.zui.layoutView(itemView, renderProps, props)
        return props
      }
      ),
      frontEnd.coLocation(),
      frontEnd.method(
        'refreshCanvas',
        async ({},{cmp, el, $props}) => {
          const props = cmp.props = $props
          const sizeInPx = jb.zui.calcWidthHeight(props.width, props.height)
          el.width = sizeInPx.width;
          el.height = sizeInPx.height;
          jb.zui.clearCanvas(props)
          Object.assign(props, { aspectRatio: el.width/el.height })
          await jb.delay(1)
          cmp.render({},true)
        }
      ),
      frontEnd.init(
        async ({},{cmp, el, $props}) => {
          //document.body.style.overflow = "hidden"
          const props = cmp.props = $props
          const gl = el.getContext('webgl', { alpha: true, premultipliedAlpha: true })
          gl.enable(gl.BLEND)
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

          Object.assign(props, { glCanvas: el, gl, aspectRatio: el.width/el.height })
          jb.zui.initZuiCmp(cmp,props)
          await jb.zui.initItemlistCmp(cmp,props)

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
                ({},{cmp,pid}) => cmp.removePointer(pid)
              )
            )
          )
        ),
        rx.do(
          ({data},{cmp}) => cmp.updateZoomState(data)
        ),
        sink.subjectNext('%$cmp.zuiEvents%')
      ),
      frontEnd.flow(
        source.event(
          'wheel',
          () => jb.frame.document,
          obj(prop('capture', true))
        ),
        rx.takeUntil('%$cmp.destroyed%'),
        rx.log('zui wheel'),
        rx.map(
          ({},{sourceEvent}) => ({ dz: sourceEvent.deltaY > 0 ? 1.1 : sourceEvent.deltaY < 0 ? 1/1.1 : 1 })
        ),
        rx.do(
          ({data},{cmp}) => cmp.updateZoomState(data)
        ),
        sink.subjectNext('%$cmp.zuiEvents%')
      ),
      frontEnd.flow(
        source.event(
          'resize',
          () => jb.frame.window
        ),
        sink.FEMethod('refreshCanvas')
      ),
      frontEnd.flow(source.animationFrame(), sink.action('%$cmp.render()%')),
      frontEnd.flow(source.subject('%$cmp.zuiEvents%'), rx.debounceTime(100), sink.action('%$cmp.onChange()%'))
    ]
  })
})

// sink.refreshCmp('', obj(prop('strongRefresh', true)))

jb.extension('zui','itemlist', {
  async initItemlistCmp(cmp,props) {
    const debugElems = [
      jb.zui.showTouchPointers(cmp),
      //jb.zui.mark4PointsZuiElem(), 
      // jb.zui.markGridAreaZuiElem()
    ]
    await Promise.all(props.elems.map(elem =>elem.asyncPrepare && elem.asyncPrepare(props)).filter(x=>x))
    ;[...debugElems, ...props.elems].forEach(elem => elem.buffers = elem.prepareGPU(props))
    Object.assign(props, jb.zui.prepareItemView(props.itemView))
    const renderPropsCache = {}
    Object.assign(cmp, { 
      render(ctx,force) {
        if (cmp.calcAnimationStep(props) && !force) return
        const { glCanvas,elems, renderProps, itemView, zoom } = props

        const [width, height] = [glCanvas.width/ zoom, glCanvas.height/ zoom]
        if (renderPropsCache[zoom] && !force) {
          Object.assign(renderProps,renderPropsCache[zoom])
        } else {
          Object.keys(renderProps).forEach(k=>delete renderProps[k])
          renderProps.itemView = { size: [width,height], zoom }
          jb.zui.layoutView(itemView, renderProps, props)
          renderPropsCache[zoom] = JSON.parse(JSON.stringify(renderProps))
        }
        const visibleElems = [...debugElems, ...elems.filter(el=> jb.zui.isVisible(el))]
        visibleElems.forEach(elem => elem.calcElemProps && elem.calcElemProps(props) )
        visibleElems.forEach(elem => elem.renderGPUFrame(props, elem.buffers))
      },
      onChange: () => props.onChange(),
    })
  },
  renderProps(ctx) {
    const {renderProps} = ctx.vars
    return renderProps[ctx.path] = renderProps[ctx.path] || {}
  },
  calcWidthHeight(width, height) {
    if (width == '100%') {
      if (typeof screen != 'undefined' || typeof window != 'undefined') {
        return {
          width: typeof screen != 'undefined' ? screen.width : window.innerWidth,
          height: typeof screen != 'undefined' ? screen.height : window.innerHeight,
        }
      } else { // headless
        return { width: 600, height}
      }
    }
    return {width: +width, height: +height}
  }
})