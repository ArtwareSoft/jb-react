dsl('zui')

component('xyByProps', {
  type: 'grid_pivot',
  params: [
    {id: 'xAtt', as: 'string', defaultValue: 'x'},
    {id: 'yAtt', as: 'string', defaultValue: 'y'},
    {id: 'normalized', as: 'boolean', type: 'boolean<>'},
  ],
  impl: (ctx,xAtt,yAtt,normalized) => {
    const {items,gridSize } = ctx.vars
    ;[xAtt,yAtt].forEach((att,axis)=>{
      const numericAtt = `n_${att}`
      items.forEach(item => item[numericAtt] = +item[att])
      items.sort((i1,i2) => +i1[numericAtt] - +i2[numericAtt])
      const from = normalized ? items[0][numericAtt] : 0
      const range = normalized ? ((items[items.length-1][numericAtt] - from) || 1) : gridSize[axis]
      items.forEach(item => item[`scale_${att}`] = (item[numericAtt] - from) / range)
    })
//    const spaceFactor = 0.999
    return {
        scaleX: item => item[`scale_${xAtt}`],
        scaleY: item => item[`scale_${yAtt}`]
    }
  }
})

component('xyByIndex', {
  type: 'grid_pivot',
  params: [
  ],
  impl: ctx => {
    const {items}  = ctx.vars
    const dim = Math.ceil(Math.sqrt(items.length))
    items.map((item,i) => {item.x = (i % dim)/dim; item.y = Math.floor(i / dim)/dim })
    const spaceFactor = 0.999
    return {
      scaleX: item => item.x/dim,
      scaleY: item => item.y/dim
    }
  }
})

component('spiral', {
  type: 'items_layout',
  params: [
    {id: 'pivot', as: 'string'}
  ],
  impl: (ctx,pivot) => {
    const { items, screenSize } = ctx.vars
    const numericAtt = `n_${pivot}`
    items.forEach(item => (item[numericAtt] = +item[pivot]))
    items.sort((i1, i2) => i1[numericAtt] - i2[numericAtt])

    const aspectRatio = screenSize[0] / screenSize[1]
    const itemsPerRow = Math.ceil(Math.sqrt(items.length / aspectRatio))
    const gridSize = [itemsPerRow,Math.ceil(items.length / itemsPerRow)]
    const center = [0, 1].map(axis => Math.floor(gridSize[axis] / 2))
    let x = center[0], y = center[1]
    let step = 1 // Step size
    let direction = 0 // 0 = right, 1 = down, 2 = left, 3 = up
    let stepsRemaining = 1 // Number of items to place in the current direction

    items.forEach(item => {
        item.xyPos = [x, y]
        if (direction === 0) x++
        else if (direction === 1) y++
        else if (direction === 2) x--
        else if (direction === 3) y--

        stepsRemaining--
        if (stepsRemaining === 0) {
            direction = (direction + 1) % 4 // Change direction
            if (direction === 0 || direction === 2) step++ // Increase step size every two turns
            stepsRemaining = step
        }
    })
    
    const initialZoom = Math.max(...gridSize)
    return { initialZoom, center, gridSize }
  }
})

component('groupByScatter', {
  type: 'items_layout',
  params: [
    {id: 'groupBy', as: 'string', description: 'property used for grouping'},
    {id: 'sort', as: 'string', description: 'property used for sorting inside group', byName: true},
    {id: 'groupGap', as: 'number', defaultValue: 1}
  ],
  impl: (ctx, groupBy, sortAtt, groupGap) => {
    const { items } = ctx.vars
    const groups = {}
    if (sortAtt) {
      const numericAtt = `n_${sortAtt}`
      items.forEach(item => (item[numericAtt] = +item[sortAtt]))
      items.sort((i1, i2) => i1[numericAtt] - i2[numericAtt])
    }
    items.forEach(item => {
      const groupKey = item[groupBy]
      groups[groupKey] = groups[groupKey] || []
      groups[groupKey].push(item)
    })

    const sortedGroups = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length)

    const groupCenters = [], groupLayouts = {}
    let gridBounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 }

    sortedGroups.forEach((groupKey, index) => {
      const groupItems = groups[groupKey]

      const itemsPerRow = Math.ceil(Math.sqrt(groupItems.length))
      const gridSize = [itemsPerRow, Math.ceil(groupItems.length / itemsPerRow)]
      const groupBoxSize = Math.max(...gridSize)
      let x = 0, y = 0

      if (index === 0) {
        x = 0
        y = 0
      } else {
        // Place subsequent groups around existing groups
        let placed = false
        for (const [cx, cy, otherSize] of groupCenters) {
          const candidates = [
            [cx + otherSize / 2 + groupBoxSize / 2 + groupGap, cy], // Right
            [cx - otherSize / 2 - groupBoxSize / 2 - groupGap, cy], // Left
            [cx, cy + otherSize / 2 + groupBoxSize / 2 + groupGap], // Top
            [cx, cy - otherSize / 2 - groupBoxSize / 2 - groupGap]  // Bottom
          ]

          for (const [candidateX, candidateY] of candidates) {
            const noOverlap = !groupCenters.some(([ox, oy, oSize]) => {
              const distance = Math.hypot(candidateX - ox, candidateY - oy)
              const combinedSize = (groupBoxSize + oSize) / 2 + groupGap
              return distance < combinedSize
            })
            if (noOverlap) {
              x = candidateX; y = candidateY; placed = true; break
            }
          }
          if (placed) break
        }

        if (!placed) {
          // If no valid position is found, expand the bounds and place
          x = gridBounds.maxX + groupBoxSize / 2 + groupGap
          y = gridBounds.maxY + groupBoxSize / 2 + groupGap
        }
      }

      gridBounds.minX = Math.min(gridBounds.minX, x - groupBoxSize / 2)
      gridBounds.maxX = Math.max(gridBounds.maxX, x + groupBoxSize / 2)
      gridBounds.minY = Math.min(gridBounds.minY, y - groupBoxSize / 2)
      gridBounds.maxY = Math.max(gridBounds.maxY, y + groupBoxSize / 2)

      groupCenters.push([x, y, groupBoxSize])
      groupLayouts[groupKey] = { gridSize, center: [x, y] }

      const center = [x,y].map((v,axis)=>Math.floor(v-gridSize[axis]/2))
      spiral(groupItems, center)
      // groupItems.forEach((item, idx) => {
      //   const pos = [idx % gridSize[0], Math.floor(idx / gridSize[0])]
      //   item.xyPos = [0,1].map(axis=>center[axis] + pos[axis])
      // })
    })


    items.forEach(item => item.xyPos = [item.xyPos[0] -gridBounds.minX, item.xyPos[1] -gridBounds.minY])
    const gridSize = [gridBounds.maxX - gridBounds.minX, gridBounds.maxY - gridBounds.minY]
    const center = [0, 1].map(axis => Math.floor(gridSize[axis] / 2))
    const initialZoom = Math.max(...gridSize)
    return { initialZoom, center, gridSize }

    function spiral(groupItems, center) {
      let x = center[0], y = center[1]
      let step = 1 // Step size
      let direction = 0 // 0 = right, 1 = down, 2 = left, 3 = up
      let stepsRemaining = 1 // Number of items to place in the current direction
  
      groupItems.forEach(item => {
          item.xyPos = [x, y]
          if (direction === 0) x++
          else if (direction === 1) y++
          else if (direction === 2) x--
          else if (direction === 3) y--
  
          stepsRemaining--
          if (stepsRemaining === 0) {
              direction = (direction + 1) % 4 // Change direction
              if (direction === 0 || direction === 2) step++ // Increase step size every two turns
              stepsRemaining = step
          }
      })
    }
  }
})

extension('zui','gridItemsLayout', {
  gridItemsLayout({gridSize,xyPivots, initialZoom, center}, ctx) {
    const {scaleX, scaleY} = xyPivots(ctx.setVars({gridSize}))
    const [X,Y] = gridSize.length == 1 ? [gridSize,gridSize] : gridSize
    const {items} = ctx.vars
    if (!scaleX || !scaleY)
      return jb.logError('no xyPivots for position calculation',{scaleX, scaleY, ctx})

    const spaceFactor = 0.999
    const mat = Array(X*Y)
    items.forEach(item => {
      const [x,y] = [Math.floor(X*scaleX(item)*spaceFactor), Math.floor(Y*scaleY(item)*spaceFactor)]
      mat[X*y + x] = mat[X*y + x] || []
      mat[X*y + x].push(item)
      item._beforeRepulsion = [x,y].join(',') // for debug
    })      
    repulsion()
    Array.from(Array(X*Y).keys()).filter(i=>mat[i]).map(i=> {
      const item = mat[i][0]
      const [xPos,yPos] = item.xyPos = [i%X, Math.floor(i/Y)]
      item.xyPosStr = [xPos,yPos].join(',')
    })

    jb.log('zui gridItemsLayout',{mat})

    return { mat, initialZoom, center, gridSize: [X,Y] }

    function repulsion() {
        for (let i=0;i<X*Y;i++)
            if (mat[i] && mat[i].length > 1)
                spreadItems(i)

        function spreadItems(i) {
            const items = mat[i]
            mat[i] = [items.pop()]
            const [x,y] = [i%X, Math.floor(i/Y)]

            for (const [_x,_y,distance] of areaIterator(x,y)) {
                if (! mat[X*_y+ _x]) {
                    mat[X*_y+ _x] = [items.pop()]
                    if (items.length == 0) return
                }
            }
        }    
    }

    function* areaIterator(x,y) {
        let distance = 2, tooFar = false
        while (!tooFar) {
            tooFar = true
            const n = noOfNeighbours(distance)
            for(_w=0;_w<n;_w++) {
                const w = _w*2*3.14/n || 0.001
                const nx = x + floor(distance*(Math.cos(w))), ny = y + floor(distance*(Math.sin(w)))
                if (nx > -1 && nx < X && ny > -1 && ny < Y) {
                    tooFar = false
                    yield [nx,ny,distance]
                }
            }
            distance++
        }
        function noOfNeighbours(distance) {
            return 4*distance
        }
        function floor(num) {
            return Math.sign(num) == -1 ? Math.floor(num+1) : Math.floor(num)
        }
    }
  }
})