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
      cmp.exposure = {}
      widget.BERxSource(cmp.id,'userDataListener',ctx)
    }),
    zui.canvasZoom(),
    frontEnd.method('render', (ctx,{cmp,widget,changeToCard,userData}) => {
      const rect = cmp.base && cmp.base.getBoundingClientRect()
      const canvasSize = jb.frame.document ? [rect.width,rect.height] : widget.screenSize
      const itemSize = [0,1].map(axis=>canvasSize[0]/widget.state.zoom)
      const detailsLevel = itemSize[0] < changeToCard ? 1 : 2
      const center = widget.state.center
      const transition = [0,1].map(axis=>canvasSize[axis]/2 - center[axis]*itemSize[axis])
      const ctxToUse = ctx.setVars({itemSize,canvasSize,detailsLevel,center, transition, zoomingGridCmp: cmp})
      cmp.sizePos(ctxToUse)
      Object.values(widget.cmps).forEach(gridCmp => gridCmp.detailsLevel && gridCmp.render(ctxToUse))
      Object.assign(userData,{detailsLevel, exposure: cmp.calcItemExposure(ctxToUse)})
    }),
    frontEnd.method('sizePos', (ctx,{cmp,itemSize,canvasSize,center, transition}) => {
      jb.zui.setCss(`sizePos-${cmp.clz}`, [
        `/* itemsize: ${itemSize}, center: ${center}, transition: ${transition}*/`,
        `.${cmp.clz} .zui-item { width: ${itemSize[0]}px; height: ${itemSize[1]}px }`,
        ...cmp.items.map(({xyPos,title}) => {
          const pos = [0,1].map(axis=>xyPos[axis]*itemSize[axis] + transition[axis])
          const visible = pos[0]+itemSize[0] > 0 && pos[0] <= canvasSize[0] && pos[1]+itemSize[1] > 0 && pos[1] <= canvasSize[1]
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
    frontEnd.method('calcItemExposure', (ctx,{cmp,itemSize,canvasSize,center,transition}) => {
      cmp.items.filter(({_detailsLevel}) => _detailsLevel < cmp.detailsLevel)
        .forEach(({xyPos,title}) => {
          const pos = [0,1].map(axis=>xyPos[axis]*itemSize[axis] + transition[axis])
          const distance = Math.sqrt((pos[0]-center[0])^2+(pos[1]-center[1])^2)
          const visible = pos[0]+itemSize[0] > 0 && pos[0] <= canvasSize[0] && pos[1]+itemSize[1] > 0 && pos[1] <= canvasSize[1]
          const screenRadius = Math.min(...canvasSize)
          const alpha = 1, falloffRate = 1
          if (visible)
            return Math.max(0, 1 - alpha * (distance / screenRadius))
          const offScreenDistance = distance - screenRadius
          const exposure = Math.exp(-offScreenDistance / (screenRadius * falloffRate))
          cmp.exposure[title] = Math.avg((cmp.exposure[title] || 0),exposure)
        })
      return cmp.exposure
    }),
    prop('userDataSubj', rx.subject()),
    flow(
      'userDataListener',
      source.subject('%$cmp.props.userDataSubj%'),
      rx.flatMap(source.data(zui.taskToRun())),
      rx.log('zui task to run'),
      rx.var('task'),
      rx.flatMap(domain.itemsSource('%$domain%', '%$task%'), {
        onInputBegin: runActions(
          zui.sendIncomingItems('%$task%'),
          addToArray('%$appData/runningTasks%'),
          writeValue('%startTime%', now())
        ),
        onInputEnd: runActions(
          writeValue('%actualDuration%', minus(now(), '%startTime%')),
          addToArray('%$appData/doneTasks%'),
          removeFromArray('%$appData/runningTasks%', '%%')
        )
      }),
      rx.do(zui.extendItem('%%', '%$task/detailsLevel%')),
      rx.map(extendWithObj(obj(
        prop('_detailsLevel', '%$task/detailsLevel%'),
        prop('_ctxVer', '%$task/ctxVer%'),
        prop('_modelId', '%$task/model/id%')
      ))),
      rx.log('zui new item from llm'),
      sink.action(addToArray('%$cmp.newItems%'))
    ),
    dataSource('updateFrontEnd', source.interval(1000), rx.map(zui.payloadForFE()), rx.filter('%%'), rx.log('zui new payload')),
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
    init((ctx,{cmp,widget}) => {
      cmp.doExtendItem = item => {
        const ctxWithItem = ctx.setData(item)
        ;(cmp.extendItem||[]).forEach(f=>f(ctxWithItem))
      }
    }),
    frontEnd.method('render', (ctx,{cmp,widget,itemSize,fontSizeMap, detailsLevel,zoomingGridCmp}) => {
      if (cmp.detailsLevel != detailsLevel) {
        cmp.base.style.display = 'none'
        return
      }
      cmp.base.style.display = 'block'
      if (cmp.base && !zoomingGridCmp.base.querySelector(`.${cmp.clz}`)) 
        zoomingGridCmp.base.appendChild(cmp.base)
      let fontSizes = {}
      if (fontSizeMap) {
        const baseSize = itemSize[0]
        const closestSize = Object.keys(fontSizeMap).map(Number).reduce((prev, curr) => (baseSize <= curr ? curr : prev), 320)
        fontSizes = {
          'title-font-size': `${fontSizeMap[closestSize].title}px`,
          'description-font-size': `${fontSizeMap[closestSize].description}px`
        }
      }
      const cssVars = cmp.dynamicCssVars ? cmp.dynamicCssVars(ctx) : {}
      jb.zui.setCssVars(cmp.clz, {...fontSizes, ...cssVars})
      cmp.base.style.display = 'block'
      zoomingGridCmp.items.forEach(item=>{
        let elem = cmp.base.querySelector(`[itemkey="${item.title}"]`)
        if (!elem) {
          const elem = document.createElement('div')
          elem.innerHTML = cmp.templateHtmlItem
          elem.setAttribute('itemkey',item.title)
          elem.setAttribute('xy',''+item.xyPos)
          elem.classList.add('zui-item')
          elem.item = item         
          cmp.base.appendChild(elem)  
          jb.zui.populateHtml(elem,ctx.setData(item))
        }
      })
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
    const { state, beAppCmpProxy } = widget
    const { userData } = ctx.vars
    const cmpId = ctx.vars.cmp.id
    const cmp = beAppCmpProxy.id == cmpId ? beAppCmpProxy : beAppCmpProxy.allDescendants().find(x=>x.id == cmpId)
    if (!cmp)
        return jb.logError(`updateUserData can not find cmp ${cmpId}`, {ctx})
    cmp.props.userDataSubj.trigger.next(cmp.ctx.dataObj({state, userData}))
  })
})

component('zui.extendItem', {
  type: 'action<>',
  params: [
    {id: 'item'},
    {id: 'detailsLevel', as: 'number'}
  ],
  impl: (ctx,item, detailsLevel) => {
    const {cmp} = ctx.vars
    cmp.children.filter(c=>c.props.detailsLevel == detailsLevel).forEach(child=>child.doExtendItem(item))
  }
})

component('zui.sendIncomingItems', {
  type: 'action<>',
  params: [
    {id: 'task'}
  ],
  impl: (ctx,task) => {}
})

component('zui.payloadForFE', {
  impl: ctx => {
    const { $model, cmp } = ctx.vars
    const { newItems, tasks } = cmp
    if (newItems.length) {
      const itemsMap = jb.objFromEntries(cmp.items.map(item=>[item.title,item]))
      const newItemsMap = jb.objFromEntries(newItems.map(item=>[item.title,item]))
      const keys = jb.utils.unique([...Object.keys(itemsMap), ... Object.keys(newItemsMap)])
      cmp.items = keys.map(k=>newItemsMap[k] || itemsMap[k])
      // todo - check if no need to re-layout the items (icon->card only or ctxVer update only with no new items!)
      cmp.itemsLayout = $model.itemsLayout(ctx.setVars({items: cmp.items}))
      cmp.newItems = []
      return { items : { cmpId: cmp.id, gridSize: cmp.itemsLayout.gridSize, items: cmp.items} }
    }
  }
})

component('spiral', {
  type: 'items_layout',
  params: [
    {id: 'pivot', as: 'string'}
  ],
  impl: (ctx,pivot) => jb.zui.spiral(pivot,ctx)
})

