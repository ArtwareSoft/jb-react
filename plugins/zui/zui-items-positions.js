dsl('zui')

component('xyByProps', {
  type: 'items_positions',
  params: [
    {id: 'xAtt', as: 'string', defaultValue: 'x'},
    {id: 'yAtt', as: 'string', defaultValue: 'y'},
    {id: 'features', type: 'prop_feature[]', dynamic: true}
  ],
  impl: (ctx,xAtt,yAtt,features) => {
    const DIM = ctx.vars.DIM
    const prop = {
      val: item => [item[xAtt],item[yAtt]],
      asText: item => [item[xAtt],item[yAtt]].join(','),
      pivots() { // create scale by order
        return [
            { att: 'x', spaceFactor: 1 , scale: item => item[xAtt]/DIM, preferedAxis: 'x' },
            { att: 'y', spaceFactor: 1 , scale: item => item[yAtt]/DIM, preferedAxis: 'y' }            
        ]
      }
    }
    features().forEach(f=>f.enrich(prop))
    return prop
  }
})

component('xyByIndex', {
  type: 'items_positions',
  params: [
    {id: 'features', type: 'prop_feature[]', dynamic: true}
  ],
  impl: (ctx,features) => {
    const {items, DIM }  = ctx.vars
    const dim = Math.ceil(Math.sqrt(items.length))
    items.map((item,i) => {item.x = (i % dim)/dim; item.y = Math.floor(i / dim)/dim })

    const prop = {
      val: item => [item.x,item.y],
      asText: item => [item.x,item.y].join(','),
      pivots() { // create scale by order
        const spaceFactor = Math.floor(DIM / dim)
        if (spaceFactor == 0)
          jb.logError('xyByIndex, DIM too low',{DIM,dim,ctx})
        return [
            { att: 'x', spaceFactor , scale: item => item.x, preferedAxis: 'x' },
            { att: 'y', spaceFactor , scale: item => item.y, preferedAxis: 'y' }            
        ]
      }
    }
    features().forEach(f=>f.enrich(prop))
    return prop
  }
})

extension('zui','itemsPositions', {
  calcItemsPositions(pivots, ctx) {
    const {items, DIM } = ctx.vars
    if (!pivots.x || !pivots.y)
      return jb.logError('no x,y pivots for position calculation',{pivots, ctx})

    const mat = Array(DIM**2)
    items.forEach(item => {
      const [x,y] = [Math.floor(DIM*pivots.x.scale(item)*pivots.x.spaceFactor), Math.floor(DIM*pivots.y.scale(item)*pivots.y.spaceFactor)]
      mat[DIM*y + x] = mat[DIM*y + x] || []
      mat[DIM*y + x].push(item)
//      item.originalXY = [x,y].join(',')
    })      
    repulsion()
    const sparse = Array.from(Array(DIM**2).keys()).filter(i=>mat[i]).map(i=> {
      const item = mat[i][0]
      const [xPos,yPos] = [i%DIM, Math.floor(i/DIM)]
      item.xyPos = [xPos,yPos].join(',')
      return [item, xPos,yPos] 
    })
    const itemPos = { id: 'itemPos', size: 2, ar: sparse.map(([item, xPos,yPos]) => [xPos,yPos]) }

    jb.log('zui calcItemsPositions',{mat, itemPos})
    // items positions are build like in x,y in math - from bottom-left to up-right
    //const vertexArray = new Float32Array(sparse.flatMap(([item, x,y]) => [1.0*x,1.0*(DIM-y-1)]))
    //const vertexArray = new Float32Array([1,1,5,5])

    return { mat, itemPos }

    function repulsion() {
        for (let i=0;i<DIM**2;i++)
            if (mat[i] && mat[i].length > 1)
                spreadItems(i)

        function spreadItems(i) {
            const items = mat[i]
            mat[i] = [items.pop()]
            const [x,y] = [i%DIM, Math.floor(i/DIM)]

            for (const [_x,_y,distance] of areaIterator(x,y)) {
                if (! mat[DIM*_y+ _x]) {
                    mat[DIM*_y+ _x] = [items.pop()]
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
                if (nx > -1 && nx < DIM && ny > -1 && ny < DIM) {
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