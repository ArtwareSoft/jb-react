
jb.extension('zui','layout', {
  isVisible(el) {
    const { width, height } = el.state()
    return width && height    
  },
  // relevant for all zoom levels
  prepareItemView(itemView) {
    calcPath(itemView, '')
    const axes = [itemView.axis,itemView.axis ? 0 : 1]
    return { minRecords: axes.map(axis =>  calcMinReq(itemView, axis).sort((r1,r2) => r1.p - r2.p) ) }

    function calcMinReq(view, layoutAxis, overlap) {
      if (!view.children)
        return [{overlap, p: view.priority || 10000, path: view.path, axis: layoutAxis, title: view.title, min: view.layoutSizes({size:[0,0],zoom:1})[layoutAxis] }]
      const childOverlap = layoutAxis == view.axis ? 0 : (view.path || 'top')
      return view.children.flatMap(childView => calcMinReq(childView,layoutAxis,childOverlap))
    }

    function calcPath(view, path) {
      view.path = path
      ;(view.children || []).forEach((childView,i) => calcPath(childView, [path,''+i].filter(x=>x!='').join('~')))
    }
  },
  layoutView(itemView, renderProps,{minRecords}) {
    const axes = [itemView.axis,itemView.axis ? 0 : 1]
    const residue = axes.map(axis => allocMinSizes(minRecords[axis],renderProps.itemView.size[axis]))
    const records = axes.map(axis => minRecords[axis].filter(r=>r.alloc))
    records[0].forEach(r=>renderProps[r.path] = r)
    records[1].forEach(r=> Object.keys(r).filter(k=>typeof r[k] == 'number').forEach(k=>renderProps[r.path][k] += `,${r[k]}`))

//    console.log(residue,minRecords)
//    debugger

    function allocMinSizes(records,total) {
      const overlaps = {}
      return records.reduce((residue,r) => {
        const actualReq = Math.max(0, r.min - (overlaps[r.path] || 0))
        if (actualReq < residue) {
          r.alloc = r.min
          residue -= actualReq
          overlaps[r.path] = (overlaps[r.path] || 0) + actualReq
        }
        return residue
      }, total)
    }

  }
})