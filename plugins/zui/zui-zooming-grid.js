dsl('zui')

/*
TODO:
how to know if item needs itemDataReq
  zoomingGridCmp.detailsLevel, appData.ctxVer, userData.modelQuality
how to know zoomingGridCmp.detailsLevel?
  no need for itemLayout, group, and firstSucceding
    itemlist -> iconCardDocItems
llmItem - title (key), _details,_ctxVer, _modelId, ...props
itemDataReq - title, _details, _ctxVer, exposure level
incomingItem - title, _details, _ctxVer, _tta (time to arrive), taskId

fe queues:
  itemReq
be queues:
  newItems
  itemsToUpdate:
  incomingItem? - maybe just send directly. no need for queue
*/

component('zoomingGrid', {
  type: 'control',
  params: [
    {id: 'iconControl', type: 'control', mandatory: true, dynamic: true},
    {id: 'cardControl', type: 'control', mandatory: true, dynamic: true},
    {id: 'cardControlWithIconData', type: 'control', mandatory: true, dynamic: true},
    {id: 'itemsLayout', type: 'items_layout', dynamic: true, defaultValue: spiral()},
    {id: 'style', type: 'zooming-grid-style', dynamic: true, defaultValue: zoomingGridStyle()},
    {id: 'features', type: 'feature<>[]', dynamic: true}
  ],
  impl: ctx => jb.zui.ctrl(ctx)
})

component('zoomingGridStyle', {
  params: [
    {id: 'changeToCard', as: 'number', defaultValue: 128}
  ],
  type: 'zooming-grid-style',
  impl: features(
    variable('itemsLayout', '%$$model/itemsLayout()%'),
    frontEnd.var('changeToCard', '%$changeToCard%'),
    frontEnd.var('initialZoomCenter', ['%$itemsLayout/initialZoom%','%$itemsLayout/center%','%$itemsLayout/gridSize%']),
    html((ctx,{cmp}) => `<div></div>`),
    css('.%$cmp.clz% {position: relative; width: 100%; height: 100%; overflow: hidden;}'),
    init((ctx,{cmp, itemsLayout, $model, screenSize}) => {
      cmp.items = []
      cmp.itemsFromLlm = []
      cmp.newItems = []
      cmp.itemsToUpdate = []
      cmp.itemsLayout = itemsLayout
      const ctxForChildren = ctx.setVars({zoomingGridCmp: cmp})
      cmp.children = [$model.iconControl(ctxForChildren).init(), $model.cardControl(ctxForChildren).init()]
      cmp.extendedPayloadWithDescendants = async (res,descendants) => {
        const pack = { [res.id]: res }
        await cmp.children.reduce((pr,cmp)=>pr.then(async ()=> { pack[cmp.id] = await cmp.calcPayload() }), Promise.resolve())
        return pack
      }
    }),
    frontEnd.init((ctx,{cmp,widget,initialZoomCenter}) => {
      if (jb.frame.document && !document.querySelector(`.${cmp.clz}`)) 
        document.querySelector('.zooming-grid').appendChild(cmp.base)
      
      widget.state.zoom = widget.state.tZoom = initialZoomCenter[0]
      widget.state.center = widget.state.tCenter = initialZoomCenter[1]
      widget.state.gridSize = initialZoomCenter[2]

      cmp.items = []
      cmp.itemsMap = {}
      cmp.exposure = {}
      widget.BERxSource(cmp.id,'userDataListener',ctx)
    }),
    zui.canvasZoom(),
    frontEnd.method('render', (ctx,{cmp,widget,changeToCard}) => {
      const rect = cmp.base && cmp.base.getBoundingClientRect()
      const canvasSize = jb.frame.document ? [rect.width,rect.height] : widget.screenSize
      const itemSize = [0,1].map(axis=>canvasSize[0]/widget.state.zoom)
      const detailsLevel = itemSize[0] < changeToCard ? 1 : 2
      const center = widget.state.center
      const ctxToUse = ctx.setVars({itemSize,canvasSize,detailsLevel,center, zoomingGridCmp: cmp})
      jb.log('zui render grid',{widget,ctxToUse,ctx})
      cmp.sizePos(ctxToUse)
      Object.assign(widget.userData,{detailsLevel, exposure: cmp.calcItemExposure(ctxToUse)})
      Object.values(widget.cmps).forEach(gridCmp => gridCmp.detailsLevel && gridCmp.render(ctxToUse))
    }),
    frontEnd.method('sizePos', (ctx,{cmp,itemSize,canvasSize,center}) => {
      jb.zui.setCss(`sizePos-${cmp.clz}`, [
        `/* center: ${center}*/`,
        `.${cmp.clz} .zui-item { width: ${itemSize[0]}px; height: ${itemSize[1]}px }`,
        ...cmp.items.map(({xyPos,title}) => {
          const pos = [0,1].map(axis=>(xyPos[axis]-center[axis]-0.5)*itemSize[axis] + canvasSize[axis]/2)
          const visible = pos[0]+itemSize[0]/2 > 0 && pos[0] <= canvasSize[0] && pos[1]+itemSize[1]/2 > 0 && pos[1] <= canvasSize[1]
          return `.${cmp.clz} div[itemkey="${title}"] { ${visible ? `top: ${pos[1]}px; left: ${pos[0]}px` : 'display:none'} } /* ${xyPos} ${pos.join(',')}*/`
        })].join('\n')
      )
    }),
    frontEnd.flow(
      source.animationFrame(),
      rx.flatMap(source.data('%$cmp.animationStep()%')),
      rx.do(({},{widget}) => widget.renderCounter++),
      sink.action('%$cmp.render()%')
    ),
    frontEnd.method('calcItemExposure', (ctx,{cmp,itemSize,canvasSize,center,transition,widget,detailsLevel}) => {
      const exposure = widget.userData.exposure = {}
      const screenRadius = Math.min(...canvasSize)/Math.max(...itemSize) + 3
      cmp.items.forEach(item => {
          const {xyPos,title,_detailsLevel} = item
          if (_detailsLevel >= detailsLevel) {
            delete exposure[title]
            return
          }
          const pos = [0,1].map(axis=>(xyPos[axis]-center[axis]-0.5)*itemSize[axis] + canvasSize[axis]/2)
          const distance = Math.sqrt((xyPos[0]-center[0])**2+(xyPos[1]-center[1])**2)
          const visible = pos[0]+itemSize[0]/2 > 0 && pos[0] <= canvasSize[0] && pos[1]+itemSize[1]/2 > 0 && pos[1] <= canvasSize[1]
          const exposureVal = Math.max(0, 1 - ((distance + (visible ? 0 : 10)) / screenRadius))
          exposure[title] = ((exposure[title] || 0) + exposureVal)/2
      })
      return exposure
    }),
    frontEnd.method('handlePayload', (ctx,vars) => ctx.setVars(vars).run({$: 'zui.hanleTaskPayload' }, 'action<>')),
    prop('userDataSubj', rx.subject()),
    flow(
      'userDataListener',
      source.subject('%$cmp.props.userDataSubj%'),
      rx.log('zui userDataListener'),
      rx.do(writeValue('%$appData.ctxVer%','%$userData.ctxVer%')),
      zui.itemsFromLlm(),
      sink.action(addToArray('%$cmp.itemsFromLlm%'))
    ),
    dataSource('updateFrontEnd', source.interval(1000), rx.map(zui.buildTaskPayload()), rx.filter('%%'), rx.log('zui new payload')),
    frontEnd.flow(
      zui.backEndSource('updateFrontEnd'),
      sink.action(({data},{widget}) => widget.handlePayload(data))
    ),
    frontEnd.flow(source.interval(1000), sink.updateUserData())
  )
})

component('zoomingGridElem', {
  type: 'feature',
  params: [
    {id: 'detailsLevel', as: 'number'}
  ],
  impl: features(
    prop('detailsLevel', '%$detailsLevel%'),
    frontEnd.method('render', (ctx,{cmp,widget,itemSize,baseFontSizes,fontScaleFactor, detailsLevel,zoomingGridCmp}) => {
      if (cmp.detailsLevel != detailsLevel) {
        cmp.base.style.display = 'none'
        return
      }
      cmp.base.style.display = 'block'
      if (cmp.base && !zoomingGridCmp.base.querySelector(`.${cmp.clz}`)) 
        zoomingGridCmp.base.appendChild(cmp.base)
      let fontSizes = {}
      if (fontScaleFactor) {
        cmp.fontMap = cmp.fontMap || jb.objFromEntries(Object.entries(fontScaleFactor).map(([size, factor]) => [+size, 
          jb.objFromEntries(Object.entries(baseFontSizes).map(([name,size]) => [`${name}-font-size`,`${Math.round(size*factor)}px`]))]
        ))
        const baseSize = itemSize[0]
        const closestSize = Object.keys(cmp.fontMap).reduce((acc, curr) => (baseSize > curr ? curr : acc), 1000)
        fontSizes = cmp.fontMap[closestSize]
      }
      const cssVars = cmp.dynamicCssVars ? cmp.dynamicCssVars(ctx) : {}
      jb.zui.setCssVars(cmp.clz, {...fontSizes, ...cssVars})
      cmp.base.style.display = 'block'
      zoomingGridCmp.items.forEach(item=>{
        let elem = cmp.base.querySelector(`[itemkey="${item.title}"]`)
        if (elem) {
          elem.item = item         
          jb.html.populateHtml(elem,ctx.setData(item))
        } else {
          const elem = document.createElement('div')
          elem.innerHTML = cmp.templateHtmlItem
          elem.setAttribute('itemkey',item.title)
          elem.setAttribute('xy',''+item.xyPos)
          elem.classList.add('zui-item')
          elem.item = item         
          cmp.base.appendChild(elem)  
          jb.html.populateHtml(elem,ctx.setData(item))
        }
      })
      cmp.base.querySelectorAll(`[itemkey]`)
        .forEach(el => !zoomingGridCmp.itemsMap[el.getAttribute('itemkey')] && el.parentNode.removeChild(el))
    }),
    init((ctx,{cmp,widget}) => {
      cmp.doExtendItem = item => {
        const ctxWithItem = ctx.setData(item)
        ;(cmp.extendItem||[]).forEach(f=>f(ctxWithItem))
      }
    }),
    html('<div class="%$cmp.clz%"></div>'),
    css(`.%$cmp.clz% {width: 100%; height: 100%}
        .%$cmp.clz%>.zui-item {overflow: hidden; text-overflow: ellipsis; pointer-events: none; position: absolute; 
          border1: 1px black solid; transition1: top 0.3s ease, left 0.3s ease;}`)
  )
})

component('sink.updateUserData', {
  type: 'rx<>',
  category: 'sink',
  impl: sink.action((ctx,{widget}) => {
    const { state, beAppCmpProxy, userData } = widget
    const cmpId = ctx.vars.cmp.id
    const cmp = beAppCmpProxy.id == cmpId ? beAppCmpProxy : beAppCmpProxy.allDescendants().find(x=>x.id == cmpId)
    if (!cmp)
        return jb.logError(`updateUserData can not find cmp ${cmpId}`, {ctx})
    cmp.props.userDataSubj.trigger.next(cmp.ctx.dataObj({state, userData}))
  })
})

component('spiral', {
  type: 'items_layout',
  params: [
    {id: 'pivot', as: 'string'}
  ],
  impl: (ctx,pivot) => jb.zui.spiral(pivot,ctx)
})

