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
  impl: customStyle({
    typeCast: 'style',
    template: ({},{},h) => h('canvas',{width: 600, height: 460}),
    css: '{ touch-action: none; }',
    features: [
      calcProps((ctx,{$model})=> {
        const items = $model.items()
        const zuiState = {}
        const ctxWithItems = ctx.setVars({items, zuiState})
        const itemProps = $model.itemProps(ctxWithItems)
        const itemView = $model.itemView(ctxWithItems.setVars({itemProps}))
        const DIM = $model.boardSize
        const onChange = $model.onChange.profile && $model.onChange
        const zoom = +($model.initialZoom || DIM)
        const pivotsFromItemProps = itemProps.flatMap(prop=>prop.pivots())
        const pivots = [...pivotsFromItemProps, ...itemView.pivots().filter(p=>! pivotsFromItemProps.find(_p => _p.att == p.att)) ]
        pivots.forEach(p=>{if (p.preferedAxis) pivots[p.preferedAxis] = p})
        const elems = itemView.zuiElems()

        return {
            DIM, ZOOM_LIMIT: [1, DIM*2], itemView, elems, items, pivots, onChange, center: [DIM* 0.5, DIM* 0.5], zoom, zuiState
        }
      }),
      frontEnd.coLocation(),
      frontEnd.init(async ({},{cmp, el, $props}) => {
          const props = cmp.props = $props
          const gl = el.getContext('webgl', { alpha: true, premultipliedAlpha: true })
          gl.enable(gl.BLEND)
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

          Object.assign(props, { glCanvas: el, gl, aspectRatio: el.width/el.height })
          props.itemsPositions = jb.zui.calcItemsPositions(props) // todo - model
          jb.zui.initZuiCmp(cmp,props)
          jb.zui.initViewCmp(cmp,props)
          await Promise.all(props.elems.map(elem =>elem.prepare && elem.prepare(props)).filter(x=>x))
          if (cmp.ctx.vars.zuiCtx) {
            cmp.ctx.vars.zuiCtx.props = props
            cmp.ctx.vars.zuiCtx.zuiState = props.zuiState
          }

          jb.zui.clearCanvas(props)
          cmp.render()
          el.setAttribute('zui-rendered',true) // for tests
      }),
      frontEnd.prop('zuiEvents', rx.subject()),
      frontEnd.flow(
        source.frontEndEvent('pointerdown'),
        rx.log('zui pointerdown'),
        rx.var('pid', '%pointerId%'),
        rx.do(({},{cmp,pid}) => cmp.addPointer(pid)),
        rx.flatMap(
          rx.mergeConcat(
            rx.pipe(
              rx.merge(source.event('pointermove'), source.frontEndEvent('pointerup')),
              rx.filter('%$pid%==%pointerId%'),
              rx.do(({data},{cmp,pid}) => cmp.updatePointer(pid,data)),
              rx.takeWhile('%type%==pointermove'),
              rx.flatMap(source.data(({},{cmp}) => cmp.zoomEventFromPointers()))
            ),
            rx.pipe(
              source.data(({},{cmp,pid}) => cmp.momentumEvents(pid)),
              rx.var('delay', '%delay%'),
              rx.flatMap(rx.pipe(source.data('%events%'))),
              rx.delay('%$delay%'),
              rx.log('momentum zui')
            ),
            rx.pipe(source.data(1), rx.do(({data},{cmp}) => cmp.removePointer(data.pointerId)))
          )
        ),
        rx.do(({data},{cmp}) => cmp.updateZoomState(data)),
        sink.subjectNext('%$cmp.zuiEvents%')
      ),
      frontEnd.flow(source.subject('%$cmp.zuiEvents%'), sink.action('%$cmp.render()%')),
      frontEnd.flow(
        source.frontEndEvent('wheel'),
        rx.log('zui wheel'),
        rx.map(({},{sourceEvent}) => ({ dz: sourceEvent.deltaY > 0 ? 1.1 : sourceEvent.deltaY < 0 ? 0.9 : 1 })),
        rx.do(({data},{cmp}) => cmp.updateZoomState(data)),
        sink.subjectNext('%$cmp.zuiEvents%')
      )
    ]
  })
})
  
jb.extension('zui','view', {
  initViewCmp(cmp,props) {
    props.elems.forEach(elem => elem.specificProps && Object.assign(props, elem.specificProps(props)))
    props.elems.forEach(elem => elem.buffers = elem.prepareGPU(props))
    Object.assign(cmp, {
      render() {
        const { itemView, zoom, glCanvas,elems, zuiState } = props
        const [width, height, top, left] = [glCanvas.width/ zoom, glCanvas.height/ zoom,0,0]
        itemView.layout({zoom,width,height,top, left})
        const visibleElems = elems.filter(el=> jb.zui.isVisible(el))
        visibleElems.forEach(elem => elem.calcElemProps && elem.calcElemProps(props) )
        visibleElems.forEach(elem => elem.renderGPUFrame(props, elem.buffers))
        props.onChange && props.onChange(props)
        console.log('zuiState', zuiState)
      },
    })
  },
  viewState(ctx) {
    const {zuiState} = ctx.vars
    return zuiState[ctx.path] = zuiState[ctx.path] || {}
  },
  isVisible(el) {
    const { width, height } = el.state()
    return width && height    
  }
})

jb.component('text', {
  type: 'view',
  params: [
    {id: 'prop', type: 'itemProp', mandatory: true},
    {id: 'viewFeatures', type: 'view_feature[]', dynamic: true, flattenArray: true}
  ],
  impl: (ctx,prop, features) => {
    const zuiElem = jb.zui.textZuiElem(ctx)
    const view = {
      title: 'text',
      state: () => jb.zui.viewState(ctx),
      pivots: () => prop.pivots(),
      zuiElems: () => [zuiElem],
      priority: prop.priority || 0,
      preferedHeight: () => 16,
      layout: (layoutProps) => ['width','height','top','left'].forEach(p=> 
        layoutProps[p] != null && (jb.zui.viewState(ctx)[p] = layoutProps[p]))
    }
    features().forEach(f=>f.enrichView(view))
    view.enterHeight = view.enterHeight || Math.floor(view.preferedHeight()/2)
    return view
  }
})

jb.component('circle', {
  type: 'view',
  params: [
    {id: 'prop', type: 'itemProp', mandatory: true},
    {id: 'viewFeatures', type: 'view_feature[]', dynamic: true, flattenArray: true},
    {id: 'circleSize', dynamic: true, defaultValue: ({vars}) => 10 + 2 * Math.log(vars.$props.DIM/vars.$props.zoom)},
    {id: 'colorScale', type: 'color_scale'}
  ],
  impl: (ctx,prop,features) => { 
    const zuiElem = jb.zui.circleZuiElem(ctx)
    const view = {
      title: 'circle',
      state: () => jb.zui.viewState(ctx),
      pivots: () => prop.pivots(),
      zuiElems: () => [zuiElem],
      priority: prop.priority || 0,
      preferedHeight: layoutProps => ctx.params.circleSize(ctx.setData(layoutProps)),
      enterHeight: 0.01,
      layout: (layoutProps) => ['width','height','top','left'].forEach(p=> 
        layoutProps[p] != null && (jb.zui.viewState(ctx)[p] = layoutProps[p]))
    }
    features().forEach(f=>f.enrichView(view))
    return view
  }
})

jb.component('group', {
  type: 'view',
  params: [
    {id: 'layout', type: 'layout', defaultValue: verticalOneByOne()},
    {id: 'views', mandatory: true, type: 'view[]', dynamic: true},
    {id: 'viewFeatures', type: 'view_feature[]', dynamic: true, flattenArray: true},
  ],
  impl: (ctx,layout,viewsF,features) => {
    const views = viewsF()
    views.byPriority = views.slice(0).sort((x,y) => y.priority-x.priority )
    
    const view = {
      title: 'group',
      state: () => jb.zui.viewState(ctx),
      pivots: () => views.flatMap(v=>v.pivots()),
      zuiElems: () => views.flatMap(v=>v.zuiElems()),
      layout: layoutProps => Object.assign(jb.zui.viewState(ctx), layout.layout(layoutProps, views)),
    }
    features().forEach(f=>f.enrichView(view))
    return view
  }
})

jb.component('verticalOneByOne', {
  type: 'layout',
  impl: ctx => ({
    layout(layoutProps, views) {
      const {height, top} = layoutProps
      let sizeLeft = height, accTop = top
      views.byPriority.forEach(v=>{
        const state = v.state()
        const viewPreferedHeight = v.preferedHeight(layoutProps)
        if (sizeLeft == 0) {
          state.height = 0
        } else if (sizeLeft > viewPreferedHeight) {
          state.height = viewPreferedHeight
          sizeLeft -= viewPreferedHeight
        } else if (sizeLeft > v.enterHeight) {
          state.height = sizeLeft
          sizeLeft = 0
        } else {
          state.height = 0
          sizeLeft = 0
        }
        v.layout({...layoutProps, height: null})
      })

      views.filter(v=>jb.zui.isVisible(v)).forEach(v=>{
        v.state().top = accTop
        accTop += height
      })
      return layoutProps
    }
  })
})

jb.component('horizontalOneByOne', {
  type: 'layout',
  params: [
  ],
  impl: ctx => ctx.params
})

jb.component('zui.debugProps', {
  type: 'control<>',
  impl: group({
    style: propertySheet.titlesLeft(),
    controls: [
      text('%$zuiCtx/props/DIM%', 'DIM'),
      text('%$zuiCtx/props/zoom%', 'zoom'),
      text('%$zuiCtx/props/textSquareInPixels%', 'textSquare px'),
      text('%$zuiCtx/props/strLen%', 'strLen'),
      text('%$zuiCtx/props/center[0]% , %$zuiCtx/props/center[1]%', 'center'),
      text('%$zuiCtx/props/boxSize[0]% , %$zuiCtx/props/boxSize[1]%', 'boxSize'),
      text('%$zuiCtx/props/circleSize%', 'circleSize px'),
      text('%$zuiCtx/props/pos10[0]%,%$zuiCtx/props/pos10[1]%', 'circle pos px')
    ],
    features: id('debugProps')
  })
})

