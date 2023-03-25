
jb.extension('zui','layout', {
  isVisible(el) {
    return jb.path(el.renderProps(),'size')
  },
  floorLog2(size) {
    return 2**Math.floor(Math.log(size)/Math.log(2))
  },
  // relevant for all zoom levels
  prepareItemView(itemView) {
    const shortPaths = calcShortPaths(itemView, '')
    const axes = [0,1] //[itemView.axis,itemView.axis ? 0 : 1]
    const records = axes.map(axis => calcMinRecord(itemView, axis).sort((r1,r2) => r1.p - r2.p))
    const overlaps = axes.map(axis => records[axis].map(x=>x.overlap).map(id => {
          const recs =  records[axis].filter(x=> id == x.overlap) 
          return { id, recs, p: recs.reduce((sum,r) => sum + r.p,0) / records.length }
    }).sort((r1,r2) => r1.p - r2.p))

    // notFirstInView - used to allocate spaces for non first
    axes.map(axis => {
      const notFirstInView = {}
      records[axis].map(r=>{
        const parentPath = r.path.split('~').slice(0,-1).join('~')
        r.notFirstInView = notFirstInView[parentPath] ? 1 : 0
        notFirstInView[parentPath] = 1
      })
    })

    return { records, overlaps, shortPaths }

    function calcMinRecord(view, layoutAxis, overlap) {
      if (!view.children) {
        return [{
          overlap: overlap === 0 ? view.shortPath : overlap, 
          p: view.priority || 10000, 
          path: view.shortPath, 
          axis: layoutAxis, title: view.title,
          min: view.layoutSizes({size:[0,0],zoom:1})[layoutAxis] }]
        }
      const childOverlap = layoutAxis == view.axis ? 0 : (view.shortPath || 'top')
      return view.children.flatMap(childView => calcMinRecord(childView,layoutAxis,childOverlap))
    }

    function calcShortPaths(view, shortPath) {
      view.shortPath = shortPath
      if (!view.children) return { [shortPath]: view }
      return view.children.reduce(
        (acc, childView,i) => ({...acc, ...calcShortPaths(childView, [shortPath,''+i].filter(x=>x!='').join('~'))}),{})
    }
  },
  layoutView(itemView, renderProps,{records, overlaps, shortPaths}) {
    const axes = [0,1]
    const spaceSize = 10
    const minRecords = records
    const { size, zoom } = renderProps.itemView
    axes.map(axis => records[axis].forEach(r=> ['prefered','max','alloc','allocPref','allocMax','size'].forEach(k=> delete r[k])))

    axes.map(axis => allocMinSizes(minRecords[axis], size[axis]))
    const filteredOut = {}
    axes.map(axis => minRecords[axis].map(r=> !r.alloc && (filteredOut[r.path] = true)))
    axes.map(axis => minRecords[axis].filter(r=>filteredOut[r.path]).map(r=>delete r['alloc']))
    const shownRecords = axes.map(axis => minRecords[axis].filter(r=>!filteredOut[r.path]))
    // alloc min again with only the filtered records
    const residueForPrefered = renderProps.itemView.residueForPrefered  = 
      axes.map(axis => allocMinSizes(shownRecords[axis],size[axis]))

    // calc overlaps needs for prefered and max
    axes.map(axis => shownRecords[axis].forEach(r=>extendRecordNeeds(r)))
    axes.map(axis => overlaps[axis].forEach(overlap=> {
      overlap.maxPref = overlap.recs.reduce((max,r) => Math.max(max,r.prefered || 0),0)
      overlap.maxMax = overlap.recs.reduce((max,r) => Math.max(max,r.max || 0),0)
    }))

    const residueForMax = renderProps.itemView.residueForMax = 
      axes.map(axis => allocPrefredSizes(overlaps[axis],residueForPrefered[axis]))
    renderProps.itemView.residueForMargins = 
      axes.map(axis => allocMaxSizes(overlaps[axis],residueForMax[axis]))

    // calc sizes into render props
    axes.map(axis => shownRecords[axis].map(r=> {
      r.size = r.alloc + (r.allocPref || 0) + (r.allocMax || 0)
      const rProp = renderProps[toCtxPath(r.path)] = renderProps[toCtxPath(r.path)] || {title: shortPaths[r.path].title, path: r.path, size: []}
      rProp.size[axis] = r.size
    }))
    //minRecords[0].forEach(r=>renderProps[toCtxPath(r.path)] = {title: shortPaths[r.path].title, path: r.path})
    calcGroupsSize(itemView) // bottom up
    calcChildMargins(itemView,[0,0],size,true) // top down
    calcPositions(itemView,[0,0])

    // write to renderProps
    const calcSizeProps = ['overlap','p','min','alloc','prefered','max','allocPref']
    const posProps = ['size','margin','pos']

    ;[
//      ...calcSizeProps, 
//      ...posProps
    ].forEach(p=>minRecords[0].forEach((r,i) => {
      (r[p] != null) && jb.path(renderProps,[toCtxPath(r.path),p],`${fixVal(r[p])},${fixVal(minRecords[1][i][p])}`)
    }))

    function allocMinSizes(records,total) {
      const overlaps = {}
      return records.reduce((residue,r) => {
        const actualReq = Math.max(0, r.min - (overlaps[r.path] || 0)) + r.notFirstInView * spaceSize
        if (actualReq < residue) {
          r.alloc = r.min
          residue -= actualReq
          overlaps[r.path] = (overlaps[r.path] || 0) + actualReq
        }
        return residue
      }, total)
    }

    function extendRecordNeeds(rec) {
      const view = shortPaths[rec.path]
      const layoutSizes = view.layoutSizes({size,zoom})
      rec.prefered = layoutSizes[2+rec.axis]
      rec.max = layoutSizes[4+rec.axis]
    }

    function allocPrefredSizes(overlaps,total) {
      return overlaps.reduce((residue,overlap) => {
        const actualReq = Math.min(overlap.maxPref,residue)
        if (actualReq) {
          residue -= actualReq
          overlap.allocPref = actualReq
          overlap.recs.forEach(r=> r.allocPref = Math.min(actualReq, r.prefered))
        }
        return residue
      }, total)      
    }

    function allocMaxSizes(overlaps,total) {
      return overlaps.reduce((residue,overlap) => {
        const actualReq = Math.min(overlap.maxMax,residue)
        if (actualReq) {
          residue -= actualReq
          overlap.allocMax = actualReq
          overlap.recs.forEach(r=> r.allocMax = Math.min(actualReq, r.max))
        }
        return residue
      }, total)      
    }

    function calcGroupsSize(view) { // bottom up
      renderProps[view.ctxPath] = renderProps[view.ctxPath] || {title: view.title, path: view.shortPath }
      const visibleChildren = (view.children ||[]).filter(child=>child.children || jb.path(renderProps[child.ctxPath],'size.0'))
      visibleChildren.map(child => calcGroupsSize(child))
      if (!renderProps[view.ctxPath].size)
        renderProps[view.ctxPath].size = [0,1].map(axis=> 
          visibleChildren.reduce((acc,child,i) => (i ? spaceSize : 0) + acc + renderProps[child.ctxPath].size[axis],0 ))
    }

    function calcChildMargins(view,margins,availableSize,firstViewInAxis) {
      renderProps[view.ctxPath] = renderProps[view.ctxPath] || {}
      renderProps[view.ctxPath].margins = margins
      const main = view.axis, other = view.axis == 0 ? 1: 0
      const visibleChildren = (view.children ||[]).filter(child=>jb.path(renderProps[child.ctxPath],'size.0'))
      const spaceSum = spaceSize * Math.max(0,visibleChildren.length-1)
      visibleChildren.map((child,i) => {
        const childSize = axes.map(axis => renderProps[child.ctxPath].size[axis])
        const childResidue = axes.map(axis => availableSize[axis] - childSize[axis])
        const childMargins = []
        childMargins[main] = firstViewInAxis && i == 0 ? (childResidue[main] - spaceSum)/2 : spaceSize
        childMargins[other] = childResidue[other]/2
        const firstViewInAxisForChild = child.axis == main ? false: true
        const availableSizeForChild = [...availableSize]
        if (child.axis == view.axis)
          availableSizeForChild[main] = childSize[main]
        else
          availableSizeForChild[other] = childSize[other]

        calcChildMargins(child,childMargins,availableSizeForChild,firstViewInAxisForChild)
      })
    }

    function calcPositions(view,basePos) {
      const main = view.axis, other = view.axis == 0 ? 1: 0
      const rProps = renderProps[view.ctxPath] 
      rProps.pos = [basePos[0] + rProps.margins[0], basePos[1] + rProps.margins[1]]
      const visibleChildren = (view.children ||[]).filter(child=>jb.path(renderProps[child.ctxPath],'size.0'))
      visibleChildren.reduce((posAcc, child) => {
        const childPos = []
        childPos[main] = posAcc
        childPos[other] = basePos[other]
        calcPositions(child,childPos)
        const childProps = renderProps[child.ctxPath]
        return posAcc + childProps.size[main] + childProps.margins[main]
      },basePos[main])
    }

    function toCtxPath(shortPath) {
      return shortPaths[shortPath].ctxPath
    }
    function fixVal(v) {
      return typeof v == 'number' ? v.toFixed(2) : v
    }
  }
})