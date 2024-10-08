dsl('zui')

component('image', {
  type: 'view',
  params: [
    {id: 'url', as: 'string', dynamic: 'true', description: '%% is item'},
    {id: 'preferedSize', as: 'string', defaultValue: '400,400'},
    {id: 'minSize', as: 'string', defaultValue: '32,32'},
    {id: 'viewFeatures', type: 'view_feature[]', dynamic: true},
    {id: 'build', type: 'imageBuild', defaultValue: imageBuild()}
  ],
  impl: (ctx,url,preferedSize,minSize,features,build) => { 
    const size = minSize.split(',').map(x=>+x)
    const ratio = size[1]/size[0]
    const zuiElem = jb.zui.image(ctx)
    const view = zuiElem.view = {
      id: jb.zui.imageViewCounter++,
      url,
      layoutRounds: 3, // todo: greedyness
      sizeNeeds: ({round, available }) => {
        if (round == 0) return minSize.split(',').map(x=>+x)
        if (round == 1) return preferedSize.split(',').map(x=>+x)
        if (available[0]*ratio < available[1])
          return [available[0], available[0]*ratio]
        return [available[1]/ratio, available[1]]
      },
      title: 'image',
      ctxPath: ctx.path,
      pivots: (s) => [],
      zuiElem,
      priority: 0,
      build
    }
    features().forEach(f=>f.enrich(view))
    return view
  }
})

extension('zui','image', {
    initExtension() {
      return { imageViewCounter : 0}
    },
    image: viewCtx => ({
      async calcBuffers(view, {itemsPositions, DIM }) {
        const src = [jb.zui.vertexShaderCode({
            id:'image',
            code: `attribute float atlasId;
            attribute float vertexIndex;
            attribute vec2 _imagePos;
            attribute float _ratio;
            uniform int atlasIdToUnit[20];
            uniform int atlasIdToHeight[20];
            varying float ratio;
            varying vec2 imagePos;
            varying float unit;
            varying vec2 atlasSize;
            `,
            main: `imagePos = _imagePos; 
            ratio = _ratio; 
            unit = float(atlasIdToUnit[int(atlasId)]);
            atlasSize = vec2(1024.0, float(atlasIdToHeight[int(atlasId)]));
            vec2 nSize = (size/2.0)/canvasSize;
            vec2 lSize = (vec2(size[0],-1.0*size[1])/2.0)/canvasSize;
            vec2 vertexPos = npos+nSize;
            if (vertexIndex == 1.0 || vertexIndex == 3.0)
              vertexPos = npos+lSize;
            else if (vertexIndex == 2.0 || vertexIndex == 4.0)
              vertexPos = npos-lSize;
            else if (vertexIndex == 5.0)
              vertexPos = npos-nSize;
            gl_Position = vec4( vertexPos * 2.0, 0.0, 1.0);
            `
            }), 
            jb.zui.fragementShaderCode({
              code: `${[0,1,2,3,4,5,6,7].map(i=>`uniform sampler2D atlas${i};`).join('')}
              varying vec2 imagePos;
              varying float ratio;
              varying float unit;
              varying vec2 atlasSize;

              vec4 getTexturePixel(vec2 texCoord) {
                if (unit == 0.0) {
                  return texture2D(atlas0, texCoord);
                } else if (unit == 1.0) {
                  return texture2D(atlas1, texCoord);
                } else if (unit == 2.0) {
                  return texture2D(atlas2, texCoord);
                } else if (unit == 3.0){
                  return texture2D(atlas3, texCoord);
                } else if (unit == 4.0) {
                  return texture2D(atlas4, texCoord);
                } else if (unit == 5.0) {
                  return texture2D(atlas5, texCoord);
                } else if (unit == 6.0){
                  return texture2D(atlas6, texCoord);
                } else if (unit == 7.0){
                  return texture2D(atlas7, texCoord);
                }
          }`,
              main: `gl_FragColor = getTexturePixel(vec2(imagePos[0] + 256.0*rInElem[0], 
                imagePos[1] + 256.0*ratio*(1.0 - rInElem[1])) /atlasSize);`
            })] 

          const atlasGroups = await jb.frame.fetch(`${jb.zui.partitionDir(view,DIM)}/groups.json`).then(r=>r.json())
          const xyToImage = jb.objFromEntries(atlasGroups.flatMap(g=>
            g.items.map(item=>[[item.x,item.y].join(','),{atlas: g.id, size: item.size, pos: item.pos} ])))
                
          const imageNodes = itemsPositions.sparse.map(([item, x,y]) => {
            const {atlas, pos, size} = xyToImage[[x,y].join(',')] || {atlas:0, pos: [0,0], size: [10,10]}
            item.imageDebug = `${atlas}-${pos.join(',')}`
            const imageRatio = size[0] ? (size[1]/ size[0]) : 0
            return [0,1,2,3,4,5].flatMap(i=>[x,y,i,atlas,imageRatio, ...pos])
          })            
          const vertexArray = new Float32Array(imageNodes.flatMap(v=>v).map(x=>1.0*x))

          const floatsInVertex = 7
          const vertexCount = vertexArray.length / floatsInVertex

          return { vertexArray, src, vertexCount, floatsInVertex }    
      },

      async asyncPrepare({DIM, view}) {
        view.atlasGroups = await jb.frame.fetch(`${jb.zui.partitionDir(view,DIM)}/groups.json`).then(r=>r.json())
        this.atlasIdToHeight = view.atlasGroups.map(g=>g.totalHeight)
      },

      renderGPUFrame({cmp, shaderProgram, glCanvas, gl, zoom, center, DIM, vertexCount, floatsInVertex, vertexBuffer, size, pos}) {
        
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

          const vertexIndex = gl.getAttribLocation(shaderProgram, 'vertexIndex')
          gl.enableVertexAttribArray(vertexIndex)
          gl.vertexAttribPointer(vertexIndex, 1, gl.FLOAT, false, floatsInVertex* Float32Array.BYTES_PER_ELEMENT, 2* Float32Array.BYTES_PER_ELEMENT)

          const atlasId = gl.getAttribLocation(shaderProgram, 'atlasId')
          gl.enableVertexAttribArray(atlasId)
          gl.vertexAttribPointer(atlasId, 1, gl.FLOAT, false, floatsInVertex* Float32Array.BYTES_PER_ELEMENT, 3* Float32Array.BYTES_PER_ELEMENT)

          const ratio = gl.getAttribLocation(shaderProgram, '_ratio')
          gl.enableVertexAttribArray(ratio)
          gl.vertexAttribPointer(ratio, 1, gl.FLOAT, false, floatsInVertex* Float32Array.BYTES_PER_ELEMENT, 4* Float32Array.BYTES_PER_ELEMENT)

          const imagePos = gl.getAttribLocation(shaderProgram, '_imagePos')
          gl.enableVertexAttribArray(imagePos)
          gl.vertexAttribPointer(imagePos, 2, gl.FLOAT, false, floatsInVertex* Float32Array.BYTES_PER_ELEMENT, 5* Float32Array.BYTES_PER_ELEMENT)

          const pid = jb.zui.partitionId(this.view,DIM)
          const atlasIdToUnit = jb.zui.allocateTexturesToUnits(this.view,{cmp,zoom,center,DIM,gl})
          const texturesToUse = cmp.boundTextures.filter(rec=>rec.view == this.view && rec.lru == cmp.renderCounter)
          //console.log(texturesToUse,jb.zui.atlasTexturePool)
          texturesToUse.forEach(rec => {
              gl.activeTexture(gl['TEXTURE'+(rec.i)])
              //const group = this.view.atlasGroups.find(g=>g.id == rec.group)
              gl.bindTexture(gl.TEXTURE_2D, jb.zui.atlasTexturePool[`${pid}-${rec.group}`])
              gl.uniform1i(gl.getUniformLocation(shaderProgram, `atlas${rec.i}`), rec.i)
          })
          gl.uniform1iv(gl.getUniformLocation(shaderProgram, 'atlasIdToUnit'), atlasIdToUnit)
          gl.uniform1iv(gl.getUniformLocation(shaderProgram, 'atlasIdToHeight'), this.atlasIdToHeight)
  
         gl.drawArrays(gl.TRIANGLES, 0, vertexCount)
      }
    })
})

extension('zui','atlasPool', {
  initExtension() {
    return { atlasTexturePool: {} }
  },
  partitionId(view,DIM) {
    return `${view.title}${view.build.imageSize}dim${DIM}`
  },
  partitionDir(view,DIM) {
    return jb.utils.calcDirectory(`${view.build.buildDir}/${jb.zui.partitionId(view,DIM)}`)
  },
  visualGroups(view,{zoom,center}) {
    const intersect = (r1,r2) => r1[0] <= r2[1] && r1[1] >= r2[0]
    const screenRange = [0,1].map(axis=> [center[axis] - zoom/2, center[axis] + zoom/2])
    return view.atlasGroups.filter(g=> 
      intersect(screenRange[0],[g.left,g.right]) && intersect(screenRange[1],[g.top,g.bottom]))
  },
  // fileSystem | texturePool | boundTextures
  allocateTexturesToUnits(view,{zoom,center,DIM,gl,cmp}) {
    const lru = cmp.renderCounter
    const boundTextures = cmp.boundTextures
    const pid = jb.zui.partitionId(view,DIM)
    const visualGroups = jb.zui.visualGroups(view,{zoom,center})
    visualGroups.forEach(g=>!jb.zui.atlasTexturePool[`${pid}-${g.id}`] && jb.zui.loadAtlasTexture({view,DIM,group:g, gl}))
    const readyGroups = visualGroups.filter(g=>jb.zui.atlasTexturePool[`${pid}-${g.id}`])

    const boundTextureByGroup = {}
    boundTextures.forEach(rec =>rec.group != null && (boundTextureByGroup[rec.group] = rec))
    readyGroups.map(g=> boundTextureByGroup[g.id] && Object.assign(boundTextureByGroup[g.id], {lru, view}))
    const freeTextures = boundTextures.filter(rec => rec.lru != lru).sort((r1,r2) => r1.lru - r2.lru)
    const groupsToBind = readyGroups.filter(g=>! boundTextureByGroup[g.id])

    // bind
    groupsToBind.map((g,i) => {
      if (!freeTextures[i])
        return jb.logError(`no free units. can not bind group ${g.id}`,{g, boundTextures: boundTextures.slice(0), freeTextures: freeTextures.slice(0)})
      Object.assign(freeTextures[i], {group: g.id, lru, view})
    })
    const newBoundTextureByGroup = {}
    boundTextures.forEach(rec =>rec.group != null && (newBoundTextureByGroup[rec.group] = rec))
    const atlasIdToUnit = view.atlasGroups.map(g=> jb.path(newBoundTextureByGroup,[g.id,'i']))

    return atlasIdToUnit
  },
  async loadAtlasTexture({view,DIM,group,gl}) {
    const texture = await jb.zui.imageToTexture(gl, `${jb.zui.partitionDir(view,DIM)}/atlas_${group.id}.png`,group)
    group.texture = texture
    jb.zui.atlasTexturePool[`${jb.zui.partitionId(view,DIM)}-${group.id}`] = texture
    console.log(`group ${group.id} loaded`, { ... jb.zui.atlasTexturePool })
    // view.refresh()
  },
  atalesToUseWithUnits(atlasGroups,{zoom,center}) {
    // TODO: write effeciently with no object allocations (just primitives or fixed arrays Uint32Array on stack)
    const atlasOfCenter = atlasGroups.find(g=> between(center[0],g.left,g.right) && between(center[1],g.top,g.bottom))
    const screenRange = [0,1].map(axis=> [center[axis] - zoom/2, center[axis] + zoom/2])
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

  },
})

extension('zui','buildAtlas', {
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
  // async prepareAtlasGroups(atlasGroups) {
  //   await atlasGroups.reduce(async (pr,g) => { await pr; await prepareAtlas(g) } , Promise.resolve())
  //   const fileContent = JSON.stringify(atlasGroups,null,2)
  //   debugger
  //   return

  //   async function prepareAtlas(group) {
  //     const images = await loadImages(group)
  //     images.sort((i1,i2) => i1.imageItem.size[1] - i2.imageItem.size[1])
  //     const lines = Array.from(new Array(Math.ceil(images.length/4)).keys())
  //     const linesHeight = lines.map(line => [0,1,2,3].reduce((max,i) => Math.max(max, images[line*4+i] ? images[line*4+i].imageItem.size[1] : 0),0))
  //     const totalHeight = group.totalHeight = linesHeight.reduce((sum,h) => sum + h, 0)
  //     const canvas = document.createElement('canvas');
  //     canvas.width = 1024; canvas.height = totalHeight;
  //     const cnvCtx = canvas.getContext('2d');
  //     images.map(({image,imageItem},i)=> {
  //       const left = 256 * (i % 4)
  //       const top = linesHeight.slice(0,Math.floor(i/4)).reduce((sum,h) => sum + h, 0)
  //       cnvCtx.drawImage(image, left, top)
  //       imageItem.pos = [left,top]
  //     })
  //     group.dataUrl = canvas.toDataURL('image/png')
  //   }


  //   async function loadImages(group) {
  //     return group.items.reduce( async (pr,imageItem) => {
  //       const before = await pr
  //       const curr = await new Promise(resolve => {
  //         const image = new Image()
  //         image.onload = () => {
  //           imageItem.size = [ image.naturalWidth, image.naturalHeight ]
  //           resolve({image,imageItem})
  //         }
  //         image.onerror = (e) =>  { debugger; resolve({image,imageItem}) }
  //         image.src = imageItem.url
  //       })
  //       return [...before, curr]
  //     }, Promise.resolve([]))
  //   }
  // },

  async prepareAtlasGroupsNodsjs(atlasGroups,partitionDir) {
    const { createCanvas, loadImage } = require('canvas')
    const sharp = require('sharp')
    const fs = require('fs')
    const fetch = require('node-fetch')

    await atlasGroups.reduce(async (pr,g) => { await pr; await prepareAtlas(g) } , Promise.resolve())
    fs.writeFileSync(`${partitionDir}/groups.json`, JSON.stringify(atlasGroups,null,2));

    async function prepareAtlas(group) {
      const images = await Promise.all(group.items.map( async imageItem => {
        try {
          const response = await fetch(imageItem.url)
          const imageBuffer = await response.buffer()
          const _image = await sharp(imageBuffer).png().toBuffer()
          const image = await loadImage(_image)
          imageItem.size = [ image.naturalWidth, image.naturalHeight ]
          return { image, imageItem }
        } catch(e) {
          console.log(e, imageItem.url)
        }
      }))
      
      images.sort((i1,i2) => i1.imageItem.size[1] - i2.imageItem.size[1])
      const lines = Array.from(new Array(Math.ceil(images.length/4)).keys())
      const linesHeight = lines.map(line => [0,1,2,3].reduce((max,i) => Math.max(max, images[line*4+i] ? images[line*4+i].imageItem.size[1] : 0),0))
      const totalHeight = group.totalHeight = linesHeight.reduce((sum,h) => sum + h, 0)
      const canvas = createCanvas(1024, totalHeight);
      const cnvCtx = canvas.getContext('2d');
      images.map(({image,imageItem},i)=> {
        const left = 256 * (i % 4)
        const top = linesHeight.slice(0,Math.floor(i/4)).reduce((sum,h) => sum + h, 0)
        cnvCtx.drawImage(image, left, top)
        imageItem.pos = [left,top]
      })
      fs.writeFileSync(`${partitionDir}/atlas_${group.id}.png`, canvas.toBuffer('image/png'))
    }
  },
  async buildPartition({cmpId}) {
    const itemlistProf = findItemlist(jb.comps[cmpId])
    const cmp = itemlistProf && jb.exec(itemlistProf)
    //cmp.calcRenderProps()
    await cmp.runBEMethod('buildPartition')

    function findItemlist(obj) {
      if (!obj || typeof obj != 'object') return
      if (obj.$ == 'zui.itemlist') return obj
      return Object.values(obj).map(v=>findItemlist(v)).filter(x=>x)[0]
    }
  },
  async buildPartitionFromItemList(ctx, {$props}) {
    const {itemView, itemsPositions, DIM} = $props
    await Promise.all(viewsForBuild(itemView).map(async view =>{
      const partitionDir = jb.zui.partitionDir(view,DIM)
      try {
        require('fs').mkdirSync(partitionDir)
      } catch(e) {}
      const groups = jb.zui.createAtlasSplit({mat: itemsPositions.mat , maxItemsInGroup : 15, DIM, ctx,view })
      await jb.zui.prepareAtlasGroupsNodsjs(groups, partitionDir)
    }))

    function viewsForBuild(view) {
      if (view.build) return [view]
      return (view.children || []).reduce( (acc, childView) => [...acc, ...viewsForBuild(childView)],[])
    }
  }
})

component('imageBuild', {
  type: 'imageBuild',
  params: [
    {id: 'buildDir', as: 'string', defaultValue: '/projects/zuiDemo/build'},
    {id: 'imageSize', as: 'string', defaultValue: '256'}
  ],
  impl: ctx=> ctx.params
})

component('buildPartition', {
  type: 'action<>',
  params: [
    {id: 'cmpId', as: 'string'}
  ],
  impl: ctx => jb.zui.buildPartition(ctx.params)
})