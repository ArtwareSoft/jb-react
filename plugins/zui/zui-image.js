jb.dsl('zui')

jb.component('image', {
  type: 'view',
  params: [
    {id: 'url', as: 'string', dynamic: 'true', description: '%% is item' },
    {id: 'preferedSize', as: 'string', defaultValue: '400,600' },
    {id: 'minSize', as: 'string', defaultValue: '30,30' },
    {id: 'viewFeatures', type: 'view_feature[]', dynamic: true, flattenArray: true},
  ],
  impl: (ctx,url,preferedSize,minSize,features) => { 
    const zuiElem = jb.zui.image(ctx)
    const view = zuiElem.view = {
      id: jb.zui.imageViewCounter++,
      url,
      title: 'image',
      ctxPath: ctx.path,
      layoutSizes: ({size}) => [ ...minSize.split(',').map(x=>+x), ...preferedSize.split(',').map(x=>+x), 0,0],
      pivots: (s) => [],
      zuiElems: () => [zuiElem],
      priority: prop.priority || 0,
    }
    features().forEach(f=>f.enrich(view))
    return view
  }
})

jb.extension('zui','image', {
    initExtension() {
      return { imageViewCounter : 0}
    },
    image: viewCtx => ({
      renderProps: () => jb.zui.renderProps(viewCtx),
      async asyncPrepare({gl, itemsPositions, DIM}) {
        jb.zui.createAtlasSplit({mat: itemsPositions.mat , maxItemsInGroup : 15, DIM, ctx: viewCtx,view: this.view })
        //await jb.zui.prepareAtlasTextures(this.atlasGroups,{gl,ctx: viewCtx,view: this.view })

        this.atlasGroups = await jb.frame.fetch(jb.baseUrl+'/dist/atlas-img256-dim64.json').then(r=>r.json())
        await Promise.all(this.atlasGroups.map(async g=>g.texture = await jb.zui.imageToTexture(gl, g.dataUrl)))

      },
      prepareGPU({ gl, itemsPositions }) {
          const viewId = this.view.id

          const src = [jb.zui.vertexShaderCode({
            id:'image',
            code: `attribute vec2 image; 
            uniform int atlasIdToUnit[4];
            varying float imageIndex; 
            varying float unit;`,
            main: `imageIndex = image[1]; unit = float(atlasIdToUnit[int(image[0])]);`
            }), 
            jb.zui.fragementShaderCode({
              code: `${[0,1,2,3].map(i=>`uniform sampler2D atlas${i};`).join('')}
              varying float imageIndex; 
              varying float unit;

              vec4 getTexturePixel(vec2 texCoord) {
                if (unit == 0.0) {
                  return texture2D(atlas0, texCoord);
                } else if (unit == 1.0) {
                  return texture2D(atlas1, texCoord);
                } else if (unit == 2.0) {
                  return texture2D(atlas2, texCoord);
                } else {
                  return texture2D(atlas3, texCoord);
                }
              }
              `,
              main: `vec2 ratio = vec2(3.0,5.0);
              vec2 imageTopLeft = vec2( int(imageIndex/5.0), int(mod(imageIndex,5.0)) );

              gl_FragColor = getTexturePixel((imageTopLeft + inElem/size)/ratio);`
            })] 
           
          const imageNodes = itemsPositions.sparse.map(([item, x,y]) => 
            [x,y,item[`atlas_${viewId}`].atlas, item[`atlas_${viewId}`].imageIndex ])
          const vertexArray = new Float32Array(imageNodes.flatMap(v=>v).map(x=>1.0*x))

          const floatsInVertex = 4
          const vertexCount = vertexArray.length / floatsInVertex

          const buffers = {
              vertexBuffer: gl.createBuffer(),
              shaderProgram: jb.zui.buildShaderProgram(gl, src),
              vertexCount, floatsInVertex
          }    
          gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertexBuffer)
          gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW)
  
          return buffers

      },
      renderGPUFrame({ gl, glCanvas, zoom, center}, { vertexBuffer, shaderProgram, floatsInVertex, vertexCount }) {
          gl.useProgram(shaderProgram)
          const {size, pos } = this.renderProps()
        
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'zoom'), [zoom, zoom])
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'center'), center)
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'canvasSize'), [glCanvas.width, glCanvas.height])
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'gridSizeInPixels'), [glCanvas.width/ zoom, glCanvas.height/ zoom])
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'pos'), pos)
          gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'size'), size)

          gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
          const itemPos = gl.getAttribLocation(shaderProgram, 'itemPosimage')
          gl.enableVertexAttribArray(itemPos)
          gl.vertexAttribPointer(itemPos, 2, gl.FLOAT, false, floatsInVertex* Float32Array.BYTES_PER_ELEMENT, 0)

          const image = gl.getAttribLocation(shaderProgram, 'image')
          gl.enableVertexAttribArray(image)
          gl.vertexAttribPointer(image, 2, gl.FLOAT, false, floatsInVertex* Float32Array.BYTES_PER_ELEMENT, 2* Float32Array.BYTES_PER_ELEMENT)

          const atlass = jb.zui.atalesToUseWithUnits(this.atlasGroups,{zoom,center})
          atlass.forEach(atlas => {
            gl.activeTexture(gl['TEXTURE'+(4+atlas.unitIndex)])
            gl.bindTexture(gl.TEXTURE_2D, atlas.texture)
            gl.uniform1i(gl.getUniformLocation(shaderProgram, `atlas${atlas.unitIndex}`), 4+atlas.unitIndex)
          })
          gl.uniform1iv(gl.getUniformLocation(shaderProgram, 'atlasIdToUnit'), this.atlasGroups.map(at=>at.unitIndex))
  
         gl.drawArrays(gl.POINTS, 0, vertexCount)
      }
    })
})

jb.extension('zui','atlas', {
  createAtlasSplit({mat, maxItemsInGroup, DIM, view,ctx }) {
    let groupCounter = 0
    return recursiveSplit({top:0,left:0,bottom:DIM,right:DIM})

    function recursiveSplit(box) {
      const topLeft = createGroup(box)
      return [topLeft, 
       ... topLeft.bottom < box.bottom ? recursiveSplit({...box, right: topLeft.right, top: topLeft.bottom }) : [],
       ... topLeft.right < box.right ? recursiveSplit({...box, left: topLeft.right }) : []
      ]

      function createGroup({top,left,bottom,right}) {
        const group = { id:  groupCounter++, items: [] }
        let imageIndex = 0
        let itemsLeft = maxItemsInGroup - (mat[DIM*top+ left]?1:0)
        let overflow = false, y= top, x= left
        while (!overflow) {
          overflow = true
          if (y<bottom) {
            const _itemsInLine = itemsInLine(y+1,left,x)
            if (_itemsInLine < itemsLeft) {
              itemsLeft -= _itemsInLine
              _itemsInLine && addItemsToGroup(group,{top: y+1, left, bottom: y+1, right: x})
              y = y +1
              overflow = false
            }
          }
          if (x<right) {
            const _itemsInRow = itemsInRow(x+1,top,y+1)
            if (_itemsInRow < itemsLeft) {
              itemsLeft -= _itemsInRow
              _itemsInRow && addItemsToGroup(group,{top, left: x+1, bottom: y, right: x+1})
              x = x +1
              overflow = false
            }
          }
        }
        return Object.assign(group,{top, left, bottom: y, right: x})

        function itemsInLine(line,from,to) {
          let sum = 0
          for(i=from;i<=to;i++)
            sum += mat[DIM*line+ i]?1:0
          return sum
        }
        function itemsInRow(row,from,to) {
          let sum = 0
          for(i=from;i<=to;i++)
            sum += mat[DIM*i+ row]?1:0
          return sum
        }
        function addItemsToGroup(group, {top,left,bottom,right} ) {
          for(let y=top;y<=bottom;y++)
            for(let x=left;x<=right;x++) if (mat[DIM*y+x]) {
              const item = mat[DIM*y+x][0]
              item[`atlas_${view.id}`] = { atlas: group.id, imageIndex }
              group.items.push({ x,y, imageIndex, url: view.url( ctx.setData(item ))})
              imageIndex++
            }
        }
      }
    }
  },
  async prepareAtlasTextures(atlasGroups,{gl}) {
    //await atlasGroups.reduce(async (pr,g) => { await pr; await createAtlasTexture(g) } , Promise.resolve())
    await Promise.all(atlasGroups.map(g => createAtlasTexture(g)))
    const fileContent = JSON.stringify(atlasGroups,null,2)
    return

    async function createAtlasTexture(group) {
      console.log('create atlas for group',group)
      const canvas = document.createElement('canvas');
      canvas.width = 1024; canvas.height = 1024;
      const cnvCtx = canvas.getContext('2d');
      await Promise.all(group.items.map( ({imageIndex,url}) => {
        return new Promise(resolve => {
          const image = new Image()
          image.onload = () => {
            cnvCtx.drawImage(image, 256 * Math.floor(imageIndex / 4), 256 * (imageIndex % 4))
            resolve()
          }
          image.onerror = (e) =>  {
            debugger
            resolve()
          }
          image.src = url
        })
      }))
      group.dataUrl = canvas.toDataURL('image/png')
      //group.texture = await jb.zui.imageToTexture(gl, dataUrl)
    }
  },

  atalesToUseWithUnits(atlasGroups,{zoom,center}) {
    // TODO: write effeciently with no object allocations (just primitives or fixed arrays Uint32Array on stack)
    const atlasOfCenter = atlasGroups.find(g=> between(center[0],g.left,g.right) && between(center[1],g.top,g.bottom))
    const screenRange = [0,1].map(axis=> [center[axis] - zoom[axis]/2, center[axis] + zoom[axis]/2])
    const atlases = [atlasOfCenter, ... zoom < 10 ? 
        atlasGroups.filter(g=> g != atlasOfCenter && 
          intersect(screenRange[0],[g.left,g.right]) && 
          intersect(screenRange[1],[g.top,g.bottom])) : []].slice(0,4)
    // allocate units - try to keep current allocations
    const allocated = [null,null,null,null]
    atlases.forEach(a=> {
      if (a.unitIndex == null) return
      if (allocated[a.unitIndex])
        a.unitIndex = null
      allocated[a.unitIndex] = true
    })
    atlases.map(a=>{
      if (a.unitIndex == null) {
        const free = allocated.indexOf(null)
        a.unitIndex = free
        allocated[free] = true
      }
    })
    return atlases

    function intersect(r1,r2) {
      return between(r1[0], r2[0],r2[1]) || between(r1[1], r2[0],r2[1])
    }
    function between(x,from,to) {
      return x >= from && x <= to
    }

  }

})