
jb.extension('zui','layout', {
  isVisible(el) {
    return jb.path(el.renderProps(),'visible')
  },
  floorLog2(size) {
    return 2**Math.floor(Math.log(size)/Math.log(2))
  },
  prepareItemView(itemView) {
    const shortPaths = calcShortPaths(itemView, '')
    const axes = [0,1]
    const records = axes.map(axis => calcMinRecord(itemView, axis).sort((r1,r2) => r1.p - r2.p))

    return { records, shortPaths }

    function calcMinRecord(view, layoutAxis) {
      if (!view.children) {
        return [{
          p: view.priority || 10000, path: view.shortPath, 
          axis: layoutAxis, title: view.title,
          min: view.sizeNeeds({round: 0, available:[0,0]})[layoutAxis] }]
        }
      return view.children.flatMap(childView => calcMinRecord(childView,layoutAxis))
    }

    function calcShortPaths(view, shortPath) {
      view.shortPath = shortPath
      if (!view.children) return { [shortPath]: view }
      return view.children.reduce(
        (acc, childView,i) => ({...acc, ...calcShortPaths(childView, [shortPath,''+i].filter(x=>x!='').join('~'))}),{})
    }
  },
  layoutView(itemView, renderProps,{records, shortPaths, zoom}) {
    const axes = [0,1]
    const spaceSize = 10
    const minRecords = records
    const { size } = renderProps.itemView
    if (!itemView.children)
      return renderProps[itemView.ctxPath] = {size}

    initSizes(itemView)
    const sizeVec = axes.map(axis => buildSizeVec(itemView,axis))

    axes.map(axis => records[axis].forEach(r=> ['prefered','max','alloc','size'].forEach(k=> delete r[k])))

    axes.map(axis => allocMinSizes(axis, minRecords[axis]))
    const filteredOut = {}
    calcGroupsSize(itemView)
    filterFirstToFit(itemView)

    const shownViews = calcShownViews(itemView).sort((v1,v2) => (v1.priority || 10000) - (v2.priority || 10000))
    shownViews.map(v=> {
      jb.path(renderProps,[v.ctxPath,'title'],v.title)
      jb.path(renderProps,[v.ctxPath,'visible'],true)
    })
    const primitiveShownViews = shownViews.filter(v=>!v.children)
    const rounds = primitiveShownViews.reduce((max,v) => Math.max(max,v.layoutRounds),0)
    for(let round=1;round<rounds;round++) {
      const otherAxis = itemView.layoutAxis ? 0 : 1
      const residu = itemView.children.map(ch=> size[otherAxis] - renderProps[ch.ctxPath].size[otherAxis])
      const resideInLayoutAxis = size[itemView.layoutAxis] - calcTotalSize(itemView.layoutAxis)

      primitiveShownViews.map(view=>{
        if (view.layoutRounds <= round) return
        const currentSize = renderProps[view.ctxPath].size
        const available = []
        available[otherAxis] = currentSize[otherAxis] + residu[view.shortPath.match(/^[0-9]+/)[0]]
        available[itemView.layoutAxis] = currentSize[itemView.layoutAxis] + resideInLayoutAxis
        const newSize = view.sizeNeeds({round, available, zoom })
        if (newSize[0] == 0 && newSize[1] == 0 || newSize[0] == currentSize[0] && newSize[1] == currentSize[1])
          return
        const oldSize = [currentSize[0],currentSize[1]]
        axes.map(axis=>renderProps[view.ctxPath].size[axis] = newSize[axis])

        if (calcTotalSize(0) > size[0] || calcTotalSize(1) > size[1])
          axes.map(axis=>renderProps[view.ctxPath].size[axis] = oldSize[axis])
      })
    }

    calcGroupsSize(itemView)
    assignCenterPositions(itemView,[0,0],size)
    writeRecordPropsForDebug()

    function allocMinSizes(axis,records) {
      records.map(r=>{
        const allocatedSize = renderProps[toCtxPath(r.path)].size
        allocatedSize[axis] = r.min
        if (calcTotalSize(axis) > size[axis])
          allocatedSize[axis] = 0
        else
          r.alloc = r.min
      })
    }

    function calcGroupsSize(view) { // bottom up
      if (!view.children) return
      view.children.map(ch=>calcGroupsSize(ch))
      const rProps = renderProps[view.ctxPath]
      rProps.size = axes.map(axis=> calcSizeOfVec(rProps.sizeVec[axis],axis))
    }

    function assignCenterPositions(view,basePos,availableSize) {
      renderProps[view.ctxPath].pos = basePos
      if (!view.children) return
      const main = view.layoutAxis, other = view.layoutAxis == 0 ? 1: 0
      const visibleChildren = view.children.filter(v=>jb.path(renderProps,[v.ctxPath,'visible']))
      visibleChildren.reduce((posInMain, child,i) => {
        const childSize = renderProps[child.ctxPath].size
        const childPos = []
        childPos[main] = posInMain + (i ? 0 : (availableSize[main] - renderProps[view.ctxPath].size[main]) / 2)
        childPos[other] = basePos[other] + (availableSize[other] - childSize[other]) / 2
        assignCenterPositions(child,childPos,childSize)
        return childPos[main] + childSize[main] + spaceSize
      },basePos[main])
    }

    function toCtxPath(shortPath) {
      return shortPaths[shortPath].ctxPath
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
      jb.path(renderProps,[v.ctxPath,'title'], v.title)
      jb.path(renderProps,[v.ctxPath,'sizeVec'], [])
      v.children.map(ch=> ch.children ? initSizes(ch) : jb.path(renderProps,[ch.ctxPath,'size'],[0,0]))
    }
    function buildSizeVec(v,axis) {
      const sumMax = (axis == v.layoutAxis) && !v.firstToFit
      return renderProps[v.ctxPath].sizeVec[axis] = {
        sumMax, elems: v.children.map(ch=> ch.children ? buildSizeVec(ch,axis) : renderProps[ch.ctxPath].size)
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
        const size = renderProps[ch.ctxPath].size
        return foundFit || size[0] != 0 && size[1] != 0
      } ,false)
    }
    function calcShownViews(view) {
      const size = renderProps[view.ctxPath].size
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
      ['size','p','min','prefered','max'].forEach(p=>minRecords[0].forEach((r,i) => {
        (r[p] != null) && jb.path(renderProps,[toCtxPath(r.path),p],`${fixVal(r[p])},${fixVal(minRecords[1][i][p])}`)
      }))
    }
  }
})