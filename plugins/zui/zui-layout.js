
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
          p: view.priority || 10000, 
          path: view.shortPath, 
          axis: layoutAxis, title: view.title,
          fitPrefered: view.fitPrefered && view.fitPrefered(layoutAxis),
          min: view.layoutSizes({size:[0,0],zoom:1})[layoutAxis] }]
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
  layoutView(itemView, renderProps,{records, shortPaths}) {
    const axes = [0,1]
    const spaceSize = 10
    const minRecords = records
    const { size, zoom } = renderProps.itemView
    const sizeVec = buildSizeVec(itemView)

    axes.map(axis => records[axis].forEach(r=> ['prefered','max','alloc','size'].forEach(k=> delete r[k])))

    axes.map(axis => allocMinSizes(axis, minRecords[axis]))
    const filteredOut = {}
    axes.map(axis => minRecords[axis].map(r=> !r.alloc && (filteredOut[r.path] = true)))
    axes.map(axis => minRecords[axis].filter(r=>filteredOut[r.path]).map(r=>delete r['alloc']))
    const shownRecords = axes.map(axis => minRecords[axis].filter(r=>!filteredOut[r.path]))
    axes.map(axis => shownRecords[axis].map(r=>{
      jb.path(renderProps,[toCtxPath(r.path),'visible'],true)
      jb.path(renderProps,[toCtxPath(r.path),'title'],r.title)
    }))

    axes.map(axis => shownRecords[axis].forEach(r=>extendRecordNeeds(r)))
    axes.map(axis => allocMore(axis,shownRecords[axis],'prefered'))
    axes.map(axis => allocMore(axis,shownRecords[axis],'max'))

    calcGroupsSize(itemView) // bottom up
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

    function extendRecordNeeds(rec) {
      const view = shortPaths[rec.path]
      const layoutSizes = view.layoutSizes({size,zoom})
      rec.prefered = layoutSizes[2+rec.axis]
      rec.max = layoutSizes[4+rec.axis]
    }

    function allocMore(axis,records,prop) {
      records.map(r=>{
        const allocatedSize = renderProps[toCtxPath(r.path)].size
        const allocatedBefore = allocatedSize[axis]
        allocatedSize[axis] += r[prop]
        if (calcTotalSize(axis) > size[axis])
          allocatedSize[axis] = allocatedBefore
      })
    }

    function calcGroupsSize(view) { // bottom up
      if (!view.children) return
      view.children.map(ch=>calcGroupsSize(ch))
      const rProps = renderProps[view.ctxPath]
      rProps.size = axes.map(axis=> axis == view.layoutAxis ? sumMax(rProps.sizeVec,axis) : maxSum(rProps.sizeVec,axis))
    }

    function assignCenterPositions(view,basePos,availableSize) {
      renderProps[view.ctxPath].pos = basePos
      if (!view.children) return
      const main = view.layoutAxis, other = view.layoutAxis == 0 ? 1: 0
      const visibleChildren = view.children.filter(child=>!filteredOut[child.shortPath])
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
    function sumMax(v,axis) {
      let firstView = true
      return v.reduce((sum,elem) => {
          const size = Array.isArray(elem[axis]) ? maxSum(elem,axis) : elem[axis]
          const space = (firstView || !size) ? 0 : spaceSize
          if (size) firstView=false
          return sum + size + space
        },0)
    }
    function maxSum(v,axis) {
      return v.reduce((max,elem) => Math.max(max, Array.isArray(elem[axis]) ? sumMax(elem,axis) : (elem[axis] || 0)),0)
    }
    function buildSizeVec(v) {
      jb.path(renderProps,[v.ctxPath,'title'], v.title)
      return jb.path(renderProps,[v.ctxPath,'sizeVec'], 
        v.children.map(ch=> ch.children ? buildSizeVec(ch) : jb.path(renderProps,[ch.ctxPath,'size'],[0,0])))
    }
    function calcTotalSize(axis) {
      return axis == itemView.layoutAxis ? sumMax(sizeVec,axis) : maxSum(sizeVec,axis)
    }    
    function writeRecordPropsForDebug() {
      ['size','p','min','prefered','max'].forEach(p=>minRecords[0].forEach((r,i) => {
        (r[p] != null) && jb.path(renderProps,[toCtxPath(r.path),p],`${fixVal(r[p])},${fixVal(minRecords[1][i][p])}`)
      }))
    }
  }
})