dsl('zui')

component('smoothGrowth', {
  type: 'view_size',
  description: 'grows with log function',
  params: [
    {id: 'min', mandatory: true, as: 'number', defaultValue: 5, byName: true},
    {id: 'base', mandatory: true, as: 'number', defaultValue: 5, description: 'when available jump from min to base'},
    {id: 'growthFactor', mandatory: true, as: 'number', defaultValue: 0.1, description: 'factor*log(available)'},
  ],
  impl: (ctx,min,base,growthFactor) => ({
    enrich(view) {
      view.layoutRounds = 2
      view.sizeNeeds = ({round, available }) => round == 0 ? [min,min] : 
        [base + growthFactor*jb.zui.floorLog2(available[1]),base + growthFactor*jb.zui.floorLog2(available[1])]
    }
  })
})

component('linearGrowth', {
  type: 'view_size',
  description: 'grows linearly to the available size',
  params: [
    {id: 'min', as: 'number', defaultValue: 5, byName: true},
    {id: 'rounds', as: 'number', defaultValue: 4, description: 'negotiate with brothers, the more round it will allow others with lowest priority to get real estate'},
  ],
  impl: (ctx,min,rounds) => ({
    enrich(view) {
      view.layoutRounds = rounds
      view.sizeNeeds = ({round, available }) => [min + available[0] * round/rounds, min + available[1] * round/rounds]
    }
  })
})

component('maxWidth', {
  type: 'view_size',
  params: [
    {id: 'max', as: 'number', mandatory: true},
  ],
  impl: (ctx,max) => ({
    enrich(view) {
      view.maxWidth = max
    }
  })
})

component('maxHeight', {
  type: 'view_size',
  params: [
    {id: 'max', as: 'number', mandatory: true},
  ],
  impl: (ctx,max) => ({
    enrich(view) {
      view.maxHeight = max
    }
  })
})

component('fixedRatio', {
  type: 'view_size',
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
      enrich(view) {
        view.layoutRounds= 3
        view.sizeNeeds = ({round, available }) => {
          if (round == 0) return min
          if (round == 1) return prefered
          if (available[0]*ratio < available[1])
            return [available[0], available[0]*ratio]
          return [available[1]/ratio, available[1]]
        }
      }  
    }
  }
})

extension('zui','layout', {
  floorLog2(size) {
    return 2**Math.floor(Math.log(size)/Math.log(2))
  },
  layoutView(cmp, vars) {
    const { itemView, records, shortPaths } = cmp
    const {zoom, elemsLayout} = cmp.state
    const axes = [0,1]
    const spaceSize = 10
    const size = elemsLayout.itemViewSize
    if (!itemView.children)
      return elemsLayout[itemView.ctxPath] = {size}

    initSizes(itemView)
    const sizeVec = axes.map(axis => buildSizeVec(itemView,axis))

    axes.map(axis => records[axis].forEach(r=> ['prefered','max','alloc','size'].forEach(k=> delete r[k])))

    axes.map(axis => allocMinSizes(axis, records[axis]))
    const filteredOut = {}
    calcGroupsSize(itemView)
    filterFirstToFit(itemView)

    const shownViews = calcShownViews(itemView).sort((v1,v2) => (v1.priority || 10000) - (v2.priority || 10000))
    shownViews.map(v=> {
      jb.path(elemsLayout,[v.ctxPath,'title'],v.title)
      jb.path(elemsLayout,[v.ctxPath,'visible'],true)
    })
    const primitiveShownViews = shownViews.filter(v=>!v.children)
    const rounds = primitiveShownViews.reduce((max,v) => Math.max(max,v.layoutRounds),0)
    for(let round=1;round<rounds;round++) {
      const otherAxis = itemView.layoutAxis ? 0 : 1
      const residu = itemView.children.map(ch=> size[otherAxis] - elemsLayout[ch.ctxPath].size[otherAxis])
      const resideInLayoutAxis = size[itemView.layoutAxis] - calcTotalSize(itemView.layoutAxis)

      primitiveShownViews.map(view=>{
        if (view.layoutRounds <= round) return
        const currentSize = elemsLayout[view.ctxPath].size
        const available = []
        available[otherAxis] = currentSize[otherAxis] + residu[view.shortPath.match(/^[0-9]+/)[0]]
        available[itemView.layoutAxis] = currentSize[itemView.layoutAxis] + resideInLayoutAxis
        const newSize = view.sizeNeeds({round, available, zoom })
        if (newSize[0] == 0 && newSize[1] == 0 || newSize[0] == currentSize[0] && newSize[1] == currentSize[1])
          return
        const oldSize = [currentSize[0],currentSize[1]]
        axes.map(axis=>elemsLayout[view.ctxPath].size[axis] = newSize[axis])

        if (calcTotalSize(0) > size[0] || calcTotalSize(1) > size[1])
          axes.map(axis=>elemsLayout[view.ctxPath].size[axis] = oldSize[axis])
      })
    }

    calcGroupsSize(itemView)
    assignCenterPositions(itemView,[0,0],size)
    writeRecordPropsForDebug()

    return primitiveShownViews.map(v=>v.shortPath)

    function allocMinSizes(axis,records) {
      records.map(r=>{
        const allocatedSize = elemsLayout[toCtxPath(r.path)].size
        const currentTotal = calcTotalSize(axis)
        allocatedSize[axis] = r.min
        const requestedTotal = calcTotalSize(axis)
        if (requestedTotal > size[axis]) {
          allocatedSize[axis] = 0
          jb.log('zui layout min alloc rejected',{axis, requested: r.min, available: size[axis], view: r.path, requestedTotal, currentTotal, r})
        } else {
          jb.log('zui layout min alloc accepted',{axis, requested: r.min, available: size[axis], view: r.path, requestedTotal, currentTotal, r})
          r.alloc = r.min
        }
      })
    }

    function calcGroupsSize(view) { // bottom up
      if (!view.children) return
      view.children.map(ch=>calcGroupsSize(ch))
      const rProps = elemsLayout[view.ctxPath]
      rProps.size = axes.map(axis=> calcSizeOfVec(rProps.sizeVec[axis],axis))
    }

    function assignCenterPositions(view,basePos,availableSize) {
      elemsLayout[view.ctxPath].pos = basePos
      if (!view.children) return
      const main = view.layoutAxis, other = view.layoutAxis == 0 ? 1: 0
      const visibleChildren = view.children.filter(v=>jb.path(elemsLayout,[v.ctxPath,'visible']))
      visibleChildren.reduce((posInMain, child,i) => {
        const childSize = elemsLayout[child.ctxPath].size
        const childPos = []
        childPos[main] = posInMain + (i ? 0 : (availableSize[main] - elemsLayout[view.ctxPath].size[main]) / 2)
        childPos[other] = basePos[other] + (availableSize[other] - childSize[other]) / 2
        assignCenterPositions(child,childPos,childSize)
        return childPos[main] + childSize[main] + spaceSize
      },basePos[main])
    }

    function toCtxPath(shortPath) {
      return shortPaths[shortPath]
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
      jb.path(elemsLayout,[v.ctxPath,'title'], v.title)
      jb.path(elemsLayout,[v.ctxPath,'sizeVec'], [])
      v.children.map(ch=> ch.children ? initSizes(ch) : jb.path(elemsLayout,[ch.ctxPath,'size'],[0,0]))
    }
    function buildSizeVec(v,axis) {
      const sumMax = (axis == v.layoutAxis) && !v.firstToFit
      return elemsLayout[v.ctxPath].sizeVec[axis] = {
        sumMax, elems: v.children.map(ch=> ch.children ? buildSizeVec(ch,axis) : elemsLayout[ch.ctxPath].size)
      }
      // keeping the size vec and not size[axis] beacuse it is used "by reference"
    }
    function calcTotalSize(axis) {
      return calcSizeOfVec(sizeVec[axis],axis)
    }
    function filterFirstToFit(view) {
      if (!view.children) return
      if (!view.firstToFit) return view.children.map(ch =>filterFirstToFit(ch))
      view.children.reduce((foundFit, ch) => {
        if (foundFit) filteredOutView(ch)
        const size = elemsLayout[ch.ctxPath].size
        return foundFit || size[0] != 0 && size[1] != 0
      } ,false)
    }
    function calcShownViews(view) {
      const size = elemsLayout[view.ctxPath].size
      if (filteredOut[view.shortPath] || size[0] == 0 || size[1] == 0) return []
      if (view.children)
        return [view, ...view.children.flatMap(ch=>calcShownViews(ch))]
      return [view]
    }
    function filteredOutView(view) {
      filteredOut[view.shortPath] = true
      ;(view.children||[]).map(ch => filteredOutView(ch))
    }
    function writeRecordPropsForDebug() {
      ['size','p','min','prefered','max'].forEach(p=>records[0].forEach((r,i) => {
        (r[p] != null) && jb.path(elemsLayout,[toCtxPath(r.path),p],`${fixVal(r[p])},${fixVal(records[1][i][p])}`)
      }))
    }
  }
})