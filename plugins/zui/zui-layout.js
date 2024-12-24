dsl('zui')

component('zoomingSize', {
  type: 'feature',
  params: [
    {id: 'size', type: 'zooming_size', mandatory: true},
    {id: 'priority', as: 'number', dynamic: true, defaultValue: 1, description: 'if same prop was defined elsewhere decides who will override. range 1-1000, can use the $state variable'}
  ],
  impl: (ctx,size,priority) => ({ zoomingSize: { path: ctx.path + '~size', profile : size.profile, ...size, priority } })
})

component('fixed', {
  type: 'zooming_size',
  params: [
    {id: 'base', mandatory: true, as: 'array', defaultValue: [5,5]},
  ],
  impl: (ctx,base) => ({
      layoutRounds: 1,
      sizeNeeds: ({round, available }) => base,
      profile: { $$: 'zooming_size<zui>fixed', base }
  })
})

component('fill', {
  type: 'zooming_size',
  params: [
    {id: 'min', as: 'number', defaultValue: 1, byName: true}
  ],
  impl: (ctx,min) => ({
      layoutRounds: 2,
      sizeNeeds: ({round, available }) => round ? available : [min,min],
      profile: { $$: 'zooming_size<zui>fill', min }
  })
})

extension('zui','layout', {
  initLayoutCalculator(layoutCalculator) {
    layoutCalculator.layoutProps.layoutAxis = layoutCalculator.layoutProps.layoutAxis || 0
    const axes = [0,1]
    const minRecords = axes.map(axis => calcMinRecord(layoutCalculator, axis).sort((r1,r2) => r1.p - r2.p))
    layoutCalculator.calcItemLayout = calcItemLayout
    setTopChildIndex(layoutCalculator, 0, 0)
    return layoutCalculator

    function setTopChildIndex(cmp, depth, topChildIndex) {
      cmp.topChildIndex = topChildIndex
      ;(cmp.children||[]).forEach((ch,i) => setTopChildIndex(ch,depth+1,depth ? topChildIndex : i))
    }

    function calcMinRecord(cmp, layoutAxis,minSize = 0) {
      if (!cmp.children) {
        return [{
          p: cmp.priority || 10000, id: cmp.id,
          axis: layoutAxis, title: cmp.title,
          min: Math.max(minSize, sizeNeeds(cmp, {round: 0, available:[0,0]})[layoutAxis]) }]
        }
      const minSizeForChildren = jb.asArray(cmp.minSize)[layoutAxis]
      return cmp.children.flatMap(childView => calcMinRecord(childView,layoutAxis,minSizeForChildren))
    }

    function sizeNeeds(cmp,args) {
      if (jb.path(cmp.zoomingSize,'sizeNeeds')) return cmp.zoomingSize.sizeNeeds(args)
      const { minWidth, minHeight } = cmp.layoutProps
      if (!minWidth || !minHeight)
        jb.logError(`missing size needs for cmp ${cmp.title}`,{cmp,ctx:cmp.ctx})
      return [minWidth, minHeight]
    }

    function calcItemLayout(itemSize, ctx) {
      const spaceSize = 10
      const elemsLayout = {}
      const topCmp = layoutCalculator

      // build data strucuture - TODO: recycle for better performance
      initSizes(topCmp)
      topCmp.sizeVec = axes.map(axis => buildSizeVec(topCmp,axis))

      const filteredOut = {}
      axes.map(axis => allocMinSizes(axis,itemSize))
      calcGroupsSize(topCmp)
      filterAllOrNone(topCmp)
      axes.map(axis => allocMinSizes(axis,itemSize))
      calcGroupsSize(topCmp)
      filterFirstToFit(topCmp)

      const shownCmps = calcShownViews(topCmp).sort((v1,v2) => (v1.priority || 10000) - (v2.priority || 10000))
      shownCmps.map(v=> {
        jb.path(elemsLayout,[v.id,'title'],v.title)
        jb.path(elemsLayout,[v.id,'visible'],true)
      })
      const primitiveShownCmps = shownCmps.filter(v=>!v.children)
      if (itemSize) {
        calcRounds(primitiveShownCmps,itemSize)
        calcGroupsSize(topCmp)
      }
      assignPositions(topCmp,[0,0],itemSize || elemsLayout[topCmp.id].size)
      if (Object.values(elemsLayout).flatMap(x=>[...(x.pos||[]), ...x.size]).filter(x=>isNaN(x)).length)
        jb.logError('bad layout result',{elemsLayout,ctx})

      return { elemsLayout, shownCmps: primitiveShownCmps.map(v=>v.id) }

      function allocMinSizes(axis,itemSize) {
        minRecords[axis].map(r=>{
          const allocatedSize = elemsLayout[r.id].size
          const currentTotal = calcTotalSize(axis)
          allocatedSize[axis] = filteredOut[r.id] ? 0 : r.min
          if (itemSize) {
            const requestedTotal = calcTotalSize(axis)
            if (requestedTotal > itemSize[axis]) {
              jb.log('zui layout min alloc rejected',{axis, requested: r.min, available: itemSize[axis], cmp: r.id, requestedTotal, currentTotal, r})
              allocatedSize[axis] = 0
            } else {
              jb.log('zui layout min alloc accepted',{axis, requested: r.min, available: itemSize[axis], cmp: r.id, requestedTotal, currentTotal, r})
              r.alloc = r.min
            }
          } else {
            r.alloc = r.min
          }
        })
      }

      function calcGroupsSize(cmp) { // bottom up
        if (!cmp.children) return
        cmp.children.map(ch=>calcGroupsSize(ch))
        const rProps = elemsLayout[cmp.id]
        rProps.size = axes.map(axis=> calcSizeOfVec(rProps.sizeVec[axis],axis))
      }

      function assignPositions(cmp,basePos,availableSize) {
        elemsLayout[cmp.id].pos = basePos
        if (!cmp.children || !availableSize) return
        const main = cmp.layoutProps.layoutAxis || 0
        const other = main == 0 ? 1: 0
        const visibleChildren = cmp.children.filter(v=>jb.path(elemsLayout,[v.id,'visible']))
        visibleChildren.reduce((posInMain, child,i) => {
          const childSize = elemsLayout[child.id].size
          const childPos = []
          childPos[main] = posInMain + (i ? 0 : (availableSize[main] - elemsLayout[cmp.id].size[main]) / 2)
          childPos[other] = basePos[other] + (availableSize[other] - childSize[other]) / 2
          assignPositions(child,childPos,childSize)
          const res = childPos[main] + childSize[main] + spaceSize
          if (isNaN(res)) debugger
          return res
        },basePos[main])
      }

      function fixVal(v) {
        return typeof v == 'number' ? v.toFixed(2) : v
      }
      function calcSizeOfVec(sizeVec,axis) {
        return sizeVec.sumMax ? sumMax(sizeVec) : maxSum(sizeVec)
        function sumMax(v) {
          let firstView = true
          return v.elems.reduce((sum,elem) => {
              const size = typeof elem[axis] == 'number' ? elem[axis] : calcSizeOfVec(elem,axis)
              const space = (firstView || !size) ? 0 : spaceSize
              if (size) firstView=false
              return sum + size + space
            },0)
        }
        function maxSum(v) {
          return v.elems.reduce((max,elem) => Math.max(max, typeof elem[axis] == 'number' ? elem[axis] : calcSizeOfVec(elem,axis)),0)
        }
      }
      function initSizes(v) {
        jb.path(elemsLayout,[v.id,'title'], v.title)
        jb.path(elemsLayout,[v.id,'sizeVec'], [])
        v.children.map(ch=> ch.children ? initSizes(ch) : jb.path(elemsLayout,[ch.id,'size'],[0,0]))
      }
      function buildSizeVec(v,axis) {
        const sumMax = (axis == v.layoutProps.layoutAxis) && !v.layoutProps.firstToFit
        return elemsLayout[v.id].sizeVec[axis] = {
          sumMax, elems: v.children.map(ch=> ch.children ? buildSizeVec(ch,axis) : elemsLayout[ch.id].size)
        }
        // keeping the size vec and not size[axis] beacuse it is used "by reference"
      }
      function calcTotalSize(axis) {
        return calcSizeOfVec(layoutCalculator.sizeVec[axis],axis)
      }
      function filterFirstToFit(cmp) {
        if (!cmp.children) return
        const res = cmp.children.map(ch =>filterFirstToFit(ch))
        if (!cmp.layoutProps.firstToFit) return res
        cmp.children.reduce((foundFit, ch) => {
          if (foundFit) 
            return filteredOutView(ch)
          const size = elemsLayout[ch.id].size
          return foundFit || size[0] != 0 && size[1] != 0
        } ,false)
      }
      function filterAllOrNone(cmp) {
        if (!cmp.children) return
        cmp.children.map(ch =>filterAllOrNone(ch))
        if (cmp.layoutProps.allOrNone) {
          const notAllShown = cmp.children.reduce((acc, ch) => 
            acc || filteredOut[ch.id] || elemsLayout[ch.id].size.reduce((acc,s) => acc*s,1) == 0, false)
          if (notAllShown)
            filteredOutView(cmp)
        }
      }
      function calcShownViews(cmp) {
        const size = elemsLayout[cmp.id].size
        if (filteredOut[cmp.id] || size[0] == 0 || size[1] == 0) return []
        if (cmp.children)
          return [cmp, ...cmp.children.flatMap(ch=>calcShownViews(ch))]
        return [cmp]
      }
      function calcRounds(primitiveShownCmps,itemSize) {
        const topAxis = layoutCalculator.layoutProps.layoutAxis
        const rounds = primitiveShownCmps.reduce((max,v) => Math.max(max,v.zoomingSize.layoutRounds),0)
        for(let round=1;round<rounds;round++) {
          const otherAxis = topAxis ? 0 : 1
          const childsResidu = topCmp.children.map(ch=> itemSize[otherAxis] - elemsLayout[ch.id].size[otherAxis])
          let resideInLayoutAxis = itemSize[topAxis] - calcTotalSize(topAxis)

          primitiveShownCmps.map(cmp=>{
            if (cmp.layoutRounds <= round) return
            const currentSize = elemsLayout[cmp.id].size
            const available = []
            available[otherAxis] = currentSize[otherAxis] + childsResidu[cmp.topChildIndex]
            available[topAxis] = currentSize[topAxis] + resideInLayoutAxis
            const newSize = sizeNeeds(cmp,{round, available }).map((v,axis)=>Math.min(v, available[axis]))
            const noChange = (newSize[0] == 0 && newSize[1] == 0 || newSize[0] == currentSize[0] && newSize[1] == currentSize[1])
            if (noChange) return
            const oldSize = [currentSize[0],currentSize[1]]
            axes.map(axis=>elemsLayout[cmp.id].size[axis] = newSize[axis])
            const newTotalSize = axes.map(axis=>calcTotalSize(axis))
            if (newTotalSize[0] > itemSize[0] || newTotalSize[1] > itemSize[1])
              axes.map(axis=>elemsLayout[cmp.id].size[axis] = oldSize[axis]) // revert
            else
              resideInLayoutAxis = itemSize[topAxis] - newTotalSize[topAxis]
          })
        }
      }
      function filteredOutView(cmp) {
        filteredOut[cmp.id] = true
        ;(cmp.children||[]).map(ch => filteredOutView(ch))
        return true
      }
    }
  },
  floorLog2(size) {
    return 2**Math.floor(Math.log(size)/Math.log(2))
  }
})
