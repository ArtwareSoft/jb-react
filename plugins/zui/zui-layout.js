dsl('zui')

component('smoothGrowth', {
  type: 'layout_feature',
  description: 'grows with log function',
  params: [
    {id: 'base', mandatory: true, as: 'array', defaultValue: [5,5], byName: true},
    {id: 'growthFactor', mandatory: true, as: 'number', defaultValue: 0.1, description: 'factor*log(available)'},
  ],
  impl: (ctx,base,growthFactor,keepProportion) => {
    return {
      layoutRounds: 2,
      sizeNeeds: ({round, available }) => {
        const avail = fixAvailable(available)
        return [0,1].map(axis=> base[axis] + growthFactor*jb.zui.floorLog2(avail[axis])) 
      }
    }
    function fixAvailable(ar) {
      if (base[0] == base[1]) return ar
      if (Math.min(...ar) == 0) return [0,0]
      const xFactor = Math.min(...[ar[0], ar[1]*base[0]/base[1]])/ar[0]
      return [ar[0]*xFactor, ar[1]*xFactor*base[1]/base[0]]
    }
  }
})

component('flowDown', {
  type: 'layout_feature',
  description: 'takes width and max available height',
  params: [
    {id: 'width', as: 'number'},
    {id: 'minHeight', as: 'number'}
  ],
  impl: (ctx,width,minHeight) => ({
      layoutRounds: 2,
      sizeNeeds: ({round, available }) => round ? [width, available[1]] : [width, minHeight]
  })
})

component('keepBaseRatio', {
  type: 'layout_feature',
  description: 'use all available yet keeps the base x/y ratio',
  params: [
    {id: 'base', as: 'array', defaultValue: [5,5], byName: true},
    {id: 'rounds', as: 'number', defaultValue: 2, description: 'negotiate with brothers, the more round it will allow others with lowest priority to get real estate'}
  ],
  impl: (ctx,base,rounds) => ({
      layoutRounds: rounds,
      sizeNeeds: ({round, available }) => {
        if (Math.min(...available) == 0) return base
        const xFactor = Math.min(...[available[0], available[1]*base[0]/base[1]])/available[0]
        return [available[0]*xFactor, available[0]*xFactor*base[1]/base[0]]
      }
  })
})

component('image', {
  type: 'layout_feature',
  params: [
    {id: 'prefered', as: 'array', byName: true, mandatory: true},
    {id: 'min', as: 'array', defaultValue: [16,16], byName: true}
  ],
  impl: (ctx,prefered,min) => ({
      layoutRounds: 3,
      sizeNeeds: ({round, available }) => {
        if (round == 0) return min
        if (round == 1) return prefered
        const xFactor = Math.min(...[available[0], available[1]*prefered[0]/prefered[1]])/available[0]
        return [available[0]*xFactor, available[0]*xFactor*prefered[1]/prefered[0]]
      }
  })
})

component('priorty', {
  type: 'layout_feature',
  params: [
    {id: 'priority', mandatory: true, as: 'number', description: 'scene enter order'}
  ],
  impl: (ctx,priority) => ({ priority })
})

component('maxWidth', {
  type: 'layout_feature',
  params: [
    {id: 'max', as: 'number', mandatory: true},
  ],
  impl: (ctx,maxWidth) => ({ maxWidth })
})

component('maxHeight', {
  type: 'layout_feature',
  params: [
    {id: 'max', as: 'number', mandatory: true},
  ],
  impl: (ctx,maxHeight) => ({ maxHeight })
})

component('fixedRatio', {
  type: 'layout_feature',
  description: 'used for images',
  params: [
    {id: 'min', as: 'string', defaultValue: '32,32', description: 'e.g. 16,32. ratio calculated from it'},
    {id: 'prefered', as: 'string', defaultValue: '400,400'},
  ],
  impl: (ctx,_min,_prefered) => {
    const min = _min.split(',').map(x=>+x)
    const prefered = _prefered.split(',').map(x=>+x)
    const ratio = min[1]/min[0]
    return { 
      layoutRounds: 3,
      sizeNeeds: ({round, available }) => {
        if (round == 0) return min
        if (round == 1) return prefered
        if (available[0]*ratio < available[1])
          return [available[0], available[0]*ratio]
        return [available[1]/ratio, available[1]]
      }
    }
  }
})

extension('zui','layout', {
  floorLog2(size) {
    return 2**Math.floor(Math.log(size)/Math.log(2))
  },
  initLayoutCalculator(_layoutCalculator) {
    const layoutCalculator = _layoutCalculator.children ? _layoutCalculator : { // wrap with group if single top single
      children: [_layoutCalculator],
      layoutAxis: 0,
      id: 'dummyGroup'
    }
    layoutCalculator.children = layoutCalculator.children || []

    const axes = [0,1]
    const minRecords = axes.map(axis => calcMinRecord(layoutCalculator, axis).sort((r1,r2) => r1.p - r2.p))
    layoutCalculator.layoutView = layoutView
    return layoutCalculator

    function calcMinRecord(view, layoutAxis,minSize = 0) {
      if (!view.children) {
        return [{
          p: view.priority || 10000, id: view.id,
          axis: layoutAxis, title: view.title,
          min: Math.max(minSize, view.sizeNeeds({round: 0, available:[0,0]})[layoutAxis]) }]
        }
      const minSizeForChildren = jb.asArray(view.minSize)[layoutAxis]
      return view.children.flatMap(childView => calcMinRecord(childView,layoutAxis,minSizeForChildren))
    }

    function layoutView(size) {
      const spaceSize = 10
      const elemsLayout = {}
      const topView = layoutCalculator

      // build data strucuture - TODO: recycle for better performance
      initSizes(topView)
      topView.sizeVec = axes.map(axis => buildSizeVec(topView,axis))

      const filteredOut = {}
      axes.map(axis => allocMinSizes(axis))
      calcGroupsSize(topView)
      filterAllOrNone(topView)
      axes.map(axis => allocMinSizes(axis))
      calcGroupsSize(topView)
      filterFirstToFit(topView)

      const shownViews = calcShownViews(topView).sort((v1,v2) => (v1.priority || 10000) - (v2.priority || 10000))
      shownViews.map(v=> {
        jb.path(elemsLayout,[v.id,'title'],v.title)
        jb.path(elemsLayout,[v.id,'visible'],true)
      })
      const primitiveShownViews = shownViews.filter(v=>!v.children)

      calcRounds(primitiveShownViews)
      calcGroupsSize(topView)
      assignCenterPositions(topView,[0,0],size)

      return { elemsLayout, shownViews: primitiveShownViews.map(v=>v.id) }

      function allocMinSizes(axis) {
        minRecords[axis].map(r=>{
          const allocatedSize = elemsLayout[r.id].size
          const currentTotal = calcTotalSize(axis)
          allocatedSize[axis] = filteredOut[r.id] ? 0 : r.min
          const requestedTotal = calcTotalSize(axis)
          if (requestedTotal > size[axis]) {
            jb.log('zui layout min alloc rejected',{axis, requested: r.min, available: size[axis], view: r.id, requestedTotal, currentTotal, r})
            allocatedSize[axis] = 0
          } else {
            jb.log('zui layout min alloc accepted',{axis, requested: r.min, available: size[axis], view: r.id, requestedTotal, currentTotal, r})
            r.alloc = r.min
          }
        })
      }

      function calcGroupsSize(view) { // bottom up
        if (!view.children) return
        view.children.map(ch=>calcGroupsSize(ch))
        const rProps = elemsLayout[view.id]
        rProps.size = axes.map(axis=> calcSizeOfVec(rProps.sizeVec[axis],axis))
      }

      function assignCenterPositions(view,basePos,availableSize) {
        elemsLayout[view.id].pos = basePos
        if (!view.children) return
        const main = view.layoutAxis, other = view.layoutAxis == 0 ? 1: 0
        const visibleChildren = view.children.filter(v=>jb.path(elemsLayout,[v.id,'visible']))
        visibleChildren.reduce((posInMain, child,i) => {
          const childSize = elemsLayout[child.id].size
          const childPos = []
          childPos[main] = posInMain + (i ? 0 : (availableSize[main] - elemsLayout[view.id].size[main]) / 2)
          childPos[other] = basePos[other] + (availableSize[other] - childSize[other]) / 2
          assignCenterPositions(child,childPos,childSize)
          return childPos[main] + childSize[main] + spaceSize
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
        const sumMax = (axis == v.layoutAxis) && !v.firstToFit
        return elemsLayout[v.id].sizeVec[axis] = {
          sumMax, elems: v.children.map(ch=> ch.children ? buildSizeVec(ch,axis) : elemsLayout[ch.id].size)
        }
        // keeping the size vec and not size[axis] beacuse it is used "by reference"
      }
      function calcTotalSize(axis) {
        return calcSizeOfVec(layoutCalculator.sizeVec[axis],axis)
      }
      function filterFirstToFit(view) {
        if (!view.children) return
        const res = view.children.map(ch =>filterFirstToFit(ch))
        if (!view.firstToFit) return res
        view.children.reduce((foundFit, ch) => {
          if (foundFit) 
            return filteredOutView(ch)
          const size = elemsLayout[ch.id].size
          return foundFit || size[0] != 0 && size[1] != 0
        } ,false)
      }
      function filterAllOrNone(view) {
        if (!view.children) return
        view.children.map(ch =>filterAllOrNone(ch))
        if (view.allOrNone) {
          const notAllShown = view.children.reduce((acc, ch) => 
            acc || filteredOut[ch.id] || elemsLayout[ch.id].size.reduce((acc,s) => acc*s,1) == 0, false)
          if (notAllShown)
            filteredOutView(view)
        }
      }
      function calcShownViews(view) {
        const size = elemsLayout[view.id].size
        if (filteredOut[view.id] || size[0] == 0 || size[1] == 0) return []
        if (view.children)
          return [view, ...view.children.flatMap(ch=>calcShownViews(ch))]
        return [view]
      }
      function calcRounds(primitiveShownViews) {
        const topAxis = layoutCalculator.layoutAxis
        const rounds = primitiveShownViews.reduce((max,v) => Math.max(max,v.layoutRounds),0)
        for(let round=1;round<rounds;round++) {
          const otherAxis = topAxis ? 0 : 1
          const childsResidu = topView.children.map(ch=> size[otherAxis] - elemsLayout[ch.id].size[otherAxis])
          let resideInLayoutAxis = size[topAxis] - calcTotalSize(topAxis)

          primitiveShownViews.map(view=>{
            if (view.layoutRounds <= round) return
            const currentSize = elemsLayout[view.id].size
            const available = []
            const childIndex = view.id.split('~')[1] || '0'
            available[otherAxis] = currentSize[otherAxis] + childsResidu[childIndex]
            available[topAxis] = currentSize[topAxis] + resideInLayoutAxis
            const newSize = view.sizeNeeds({round, available })
            if (newSize[0] == 0 && newSize[1] == 0 || newSize[0] == currentSize[0] && newSize[1] == currentSize[1])
              return
            const oldSize = [currentSize[0],currentSize[1]]
            axes.map(axis=>elemsLayout[view.id].size[axis] = newSize[axis])
            const newTotalSize = axes.map(axis=>calcTotalSize(axis))
            if (newTotalSize[0] > size[0] || newTotalSize[1] > size[1])
              axes.map(axis=>elemsLayout[view.id].size[axis] = oldSize[axis]) // revert
            else
              resideInLayoutAxis = size[topAxis] - newTotalSize[topAxis]
          })
        }
      }
      function filteredOutView(view) {
        filteredOut[view.id] = true
        ;(view.children||[]).map(ch => filteredOutView(ch))
        return true
      }
    }
  }
})