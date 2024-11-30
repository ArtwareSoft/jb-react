dsl('zui')


component('xyByProps', {
  type: 'grid_pivot',
  params: [
    {id: 'normalized', as: 'boolean', type: 'boolean<>'},
    {id: 'xAtt', as: 'string', defaultValue: 'x'},
    {id: 'yAtt', as: 'string', defaultValue: 'y'}
  ],
  impl: (ctx,normalized,xAtt,yAtt) => {
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

extension('zui','gridItemsLayout', {
  gridItemsLayout({gridSize,xyPivots, initialZoom, center}, ctx) {
    const {scaleX, scaleY} = xyPivots(ctx.setVars({gridSize}))
    const [X,Y] = gridSize.length == 1 ? [gridSize,gridSize] : gridSize
    const {items, canvasSize} = ctx.vars
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

    const itemSize = [0,1].map(axis=>canvasSize[axis]/(initialZoom*gridSize[axis]))
    return { mat, initialZoom, center, gridSize: [X,Y], itemSize }

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