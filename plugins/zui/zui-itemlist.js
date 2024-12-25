dsl('zui')

component('itemlist', {
  type: 'control',
  params: [
    {id: 'items', as: 'array', dynamic: true, mandatory: true, byName: true},
    {id: 'itemControl', type: 'control', mandatory: true, dynamic: true},
    {id: 'itemsLayout', type: 'items_layout', dynamic: true, defaultValue: spiral()},
    {id: 'style', type: 'itemlist-style', dynamic: true, defaultValue: grid()},
    {id: 'features', type: 'feature<>[]', dynamic: true}
  ],
  impl: ctx => jb.zui.ctrl(ctx)
})

component('grid', {
  type: 'itemlist-style',
  impl: features(
    variable('items', '%$$model/items()%'),
    variable('itemsLayout', '%$$model/itemsLayout()%'),
    frontEnd.var('gridSize', '%$itemsLayout/gridSize%'),
    frontEnd.var('itemsXyPos', ({},{items}) => items.map(i=>i.xyPos)),
    frontEnd.var('initialZoomCenter', ['%$itemsLayout/initialZoom%','%$itemsLayout/center%']),
    variable('inZoomingGrid', true),
    html((ctx,{cmp}) => `<div class="zui-items ${cmp.clz}">`),
    css('.%$cmp.clz% {position: relative; width: 100%; height: 100%}'),
    zui.canvasZoom(),
    init((ctx,{cmp, itemsLayout, widget, $model}) => {
      const ctxForChildren = ctx.setVars({renderRole: 'zoomingGridElem', itemlistCmp: cmp}) // variableForChildren does not work with init
      cmp.children = [$model.itemControl(ctxForChildren).init()]
      cmp.extendedPayloadWithDescendants = async (res,descendants) => {
        const layoutCalculator = jb.zui.initLayoutCalculator(cmp)
        const {shownCmps} = layoutCalculator.calcItemLayout(itemsLayout.itemSize, ctx)
        const pack = { [res.id]: res }
        await descendants.filter(cmp=>!cmp.dynamicFlowElem).reduce((pr,cmp)=>pr.then(async ()=> {
          const { id , title, layoutProps, zoomingSizeProfile } = cmp

          pack[id] = cmp.children || shownCmps.indexOf(id) != -1 ? await cmp.calcPayload()
              : {id, title, zoomingSizeProfile, layoutProps, notReady: true } 
        }), Promise.resolve())
        return pack
      }
    }),
    frontEnd.init((ctx,{cmp,widget,initialZoomCenter}) => {
      widget.state.zoom = widget.state.tZoom = initialZoomCenter[0]
      widget.state.center = widget.state.tCenter = initialZoomCenter[1]
    }),
    frontEnd.method('zoomingCss', (ctx,{cmp,itemSize,widget,itemsXyPos}) => {
      const center = widget.state.center, canvasSize = widget.canvasSize
      jb.zui.setCss(`sizePos-${cmp.clz}`, [ // todo - move to vars
        `.${cmp.clz} .zui-item { width: ${itemSize[0]}px; height: ${itemSize[1]}px }`,
        ...itemsXyPos.map(xyPos => {
          const pos = xyPos.map((v,axis)=>(v- center[axis]+1)*itemSize[axis]+ canvasSize[axis]/2)
          const visible = pos[0]+itemSize[0] > 0 && pos[0] <= canvasSize[0] && pos[1]+itemSize[1] > 0 && pos[1] <= canvasSize[1]
          return `.${cmp.clz} .pos_${xyPos.join('-')} { ${visible ? `top: ${canvasSize[1] - pos[1]}px; left: ${pos[0]}px` : 'display:none'} }`
        })].join('\n')
      )
    }),
    frontEnd.method('buildLayoutCalculator', (ctx,{cmp,widget}) => {
      cmp.layoutCalculator = jb.zui.initLayoutCalculator(buildNode(cmp.id,0))

      function buildNode(id) {
        const cmpData = widget.cmpsData[id]
        const zoomingSize = cmpData.zoomingSizeProfile ? ctx.run(cmpData.zoomingSizeProfile) : {}
        const layoutProps = cmpData.layoutProps || {}
        const children = cmpData.childrenIds && cmpData.childrenIds.split(',').map((ch,i)=>buildNode(ch,i))
        return { id, children, zoomingSize, layoutProps, title: cmpData.title}
      }
    }),
    frontEnd.flow(
      source.animationFrame(),
      rx.flatMap(source.data('%$cmp.animationStep()%')),
      rx.do(({},{widget}) => widget.renderCounter++),
      //rx.var('itemSize', (ctx,{widget}) => [0,1].map(axis=>widget.canvasSize[0]/widget.state.zoom)),
      sink.action('%$widget.renderCmps()%')
    ),
    frontEnd.method('render', (ctx,{cmp,widget}) => {
      const itemSize = [0,1].map(axis=>widget.canvasSize[0]/widget.state.zoom)
      const {shownCmps, elemsLayout} = cmp.layoutCalculator.calcItemLayout(itemSize,ctx)
      widget.cmpsData[cmp.id].itemLayoutforTest = {shownCmps, elemsLayout}
      const toRender = Object.values(widget.cmps).filter(cmp=>shownCmps.indexOf(cmp.id) != -1)
      const notReady = toRender.filter(cmp=>cmp.notReady).map(cmp=>cmp.id)
      if (notReady.length) 
        widget.beProxy.beUpdateRequest(notReady)
      jb.log('zui itemlist render',{elemsLayout, shownCmps, toRender, notReady, ctx})
      if (!widget.canvas.querySelector(`.${cmp.clz}`)) widget.canvas.appendChild(cmp.el)
      const itemlistCmp = cmp
      const ctxWithItemSize = ctx.setVars({itemSize})
      itemlistCmp.zoomingCss && itemlistCmp.zoomingCss(ctxWithItemSize)
      Object.values(widget.cmps).filter(cmp=>cmp.el && cmp.renderRole == 'zoomingGridElem')
        .forEach(cmp=> cmp.el.style.display = shownCmps.indexOf(cmp.id) == -1 ? 'none' : 'block')
      toRender.filter(cmp=>!cmp.notReady)
          .forEach(cmp=>widget.renderCmp(cmp,ctx.setVars({itemlistCmp, itemSize, elemLayout: elemsLayout[cmp.id]})))
    })
  )
})

component('spiral', {
  type: 'items_layout',
  params: [
    {id: 'pivot', as: 'string'}
  ],
  impl: (ctx,pivot) => jb.zui.spiral(pivot,ctx)
})

component('zoomingGridElem', {
  type: 'feature',
  params: [],
  impl: features(
    html((ctx,{cmp,items}) => `<div class="${cmp.clz}">
  ${items.map(item=>`<div class="zui-item pos_${item.xyPos.join('-')}">${cmp.calcHtmlOfItem(item)}</div>`).join('\n')}
</div>`),
    css(`.%$cmp.clz% {width: 100%; height: 100%}
        .%$cmp.clz%>.zui-item {overflow: hidden; text-overflow: ellipsis; pointer-events: none; position: absolute; border1: 1px solid gray}`)
  )
})