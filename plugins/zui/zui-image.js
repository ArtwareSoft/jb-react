dsl('zui')
using('net')

component('image', {
  type: 'view',
  params: [
    {id: 'image', type: 'image'},
    {id: 'preferedSize', as: 'array', defaultValue: [100,100], byName: true},
    {id: 'minSize', as: 'array', defaultValue: [32,32]}
  ],
  impl: view('image', image('%$image%'), {
    layout: image({ prefered: '%$preferedSize%', min: '%$minSize%' }),
    viewProps: [
      prop('atlasGroups', calcAtlasGroups('%$minSize%'), { async: true }),
      FEProp('atlasGroupsFE', pipeline('%$view.props.atlasGroups%', selectProps('id','left','right','top','bottom'))),
      FEProp('textures', objFromProperties(pipeline('%$view.props.atlasGroups%', obj(prop('id', 'atlas%id%'), prop('val', '%url%'))))),
      prop('xyToImage', objFromProperties(pipeline(
        '%$view.props.atlasGroups%',
        pipeline(
          Var('atlas', '%id%'),
          '%items%',
          obj(
            prop('id', '%item/xyPos%'),
            prop('val', obj(
              prop('atlas', '%$atlas%'),
              prop('size', '%size%'),
              prop('pos', '%pos%'),
              prop('ratio', ({data}) => data.size[0] ? (data.size[1]/ data.size[0]) : 0)
            ))
          )
        )
      ))),
      prop('atlasIdToHeight', '%$view.props.atlasGroups.totalHeight%'),
      prop('glCodeForTextPixelFunc', pipeline(
        '%$view.props.atlasGroups%',
        filter('%id% !=0'),
        'else if (unit == %id%.0) {\n        return texture2D(atlas%id%, texCoord);\n      }',
        join('\n')
      ))
    ],
    atts: [
      float('atlasId', '%$view.props.xyToImage/{%$item.xyPos%}/atlas%'),
      vec2('imagePos', '%$view.props.xyToImage/{%$item.xyPos%}/pos%'),
      vec2('imageSize', '%$view.props.xyToImage/{%$item.xyPos%}/size%'),
      float('imageRatio', '%$view.props.xyToImage/{%$item.xyPos%}/ratio%')
    ],
    renderGPU: gpuCode({
      shaderCode: colorOfPoint('gl_FragColor = getTexturePixel((imagePos + flipH(rInElem)*imageSize)/atlasSize);'),
      varyings: [
        varying('float', 'unit', 'float(atlasIdToUnit[int(atlasId)])'),
        varying('vec2', 'atlasSize', 'vec2(1024.0, float(atlasIdToHeight[int(atlasId)]))')
      ],
      utils: [
        utils(`vec4 getTexturePixel(vec2 texCoord) {
        if (unit == 0.0) {
          return texture2D(atlas0, texCoord);
        } %$view.props.glCodeForTextPixelFunc%
      }
      vec2 flipH(vec2 pos) {
        return vec2(pos[0],1.0-pos[1]);
      }`)
      ],
      uniforms: [
        intVec('atlasIdToHeight', 20, '%$view/props/atlasIdToHeight%')
      ],
      zoomDependentUniforms: [
        atlasesOfExposedItems(),
        intVec('atlasIdToUnit', 20, allocateTexturesToUnits())
      ]
    })
  })
})

component('atlasesOfExposedItems', {
  type: 'uniform',
  impl: ctx => {
    const { view, cmp} = ctx.vars
    if (cmp.isBEComp)
      return view.props.atlasGroups.map(({id, url})=>({id: `atlas${id}`, glType: 'sampler2D', glMethod: '1i'}))

    const { itemViewSize, elemsLayout, zoom, center } = cmp.state
    const { atlasGroupsFE } = cmp.beDataGpu[view.id].props
    return atlasGroupsFE.map(({id, url})=>({id: `atlas${id}`, glType: 'sampler2D', glMethod: '1i', 
      val: () => url
    }))
  }
})

component('allocateTexturesToUnits', {
  impl: ctx => {
    const {view,DIM,cmp} = ctx.vars
    const { itemViewSize, elemsLayout, zoom, center } = cmp.state

    const { atlasGroupsFE } = cmp.beDataGpu[view.id].props

    const lru = cmp.renderCounter
    const boundTextures = cmp.boundTextures
    const intersect = (r1,r2) => r1[0] <= r2[1] && r1[1] >= r2[0]
    const screenRange = [0,1].map(axis=> [center[axis] - zoom/2, center[axis] + zoom/2])
    const exposedGroups = atlasGroupsFE.filter(g=> 
      intersect(screenRange[0],[g.left,g.right]) && intersect(screenRange[1],[g.top,g.bottom]))

    // exposedGroups.forEach(g=>!jb.zui.atlasTexturePool[g.id] && jb.zui.loadAtlasTexture({view,DIM,group:g, gl}))
    const readyGroups = exposedGroups.filter(g=>view.textures[`atlas${g.id}`])
    
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
    const atlasIdToUnit = atlasGroupsFE.map(g=> jb.path(newBoundTextureByGroup,[g.id,'i']))

    return new Int32Array(atlasIdToUnit)
  }
})

component('calcAtlasGroups', {
  params: [
    {id: 'minSize', as: 'array'}
  ],
  impl: async (ctx,minSize) => {
    const {view, DIM, mat} = ctx.vars
    const ATLAS_SIZE = 1024
    const maxItemsInGroup = ATLAS_SIZE*ATLAS_SIZE/(minSize[0]*minSize[1])
    const groups = jb.zui.createAtlasGroups({view, DIM, mat,maxItemsInGroup,ctx})
    await groups.reduce((pr,g) => pr.then(() => jb.zui.calcAtlasImages(g,ctx)), Promise.resolve())
    return groups
  }
})

extension('zui','atlas', {
  createAtlasGroups({view, DIM, mat,maxItemsInGroup,ctx}) {
    let groupCounter = 0
    return recursiveSplit({top:0,left:0,bottom:DIM,right:DIM})

    function recursiveSplit(box) {
      const topLeft = createGroup(box)
      return [topLeft, 
       ... topLeft.bottom < box.bottom ? recursiveSplit({...box, right: topLeft.right, top: topLeft.bottom }) : [],
       ... topLeft.right < box.right ? recursiveSplit({...box, left: topLeft.right }) : []
      ]

      function createGroup({top,left,bottom,right}) {
        let imageIndex = 0
        const group = { id:  groupCounter++, items: [] }
        addItemsToGroup(group,{top, left, bottom: top, right: left})
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
            const _itemsInRow = itemsInRow(x+1,top,y)
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
              group.items.push({ item, imageIndex, imageF: view.itemProp.image})
              imageIndex++
            }
        }
      }
    }
  },

  async calcAtlasImages(group, ctx) {
    const images = await Promise.all(group.items.map( imageItem => imageBitmap(imageItem,ctx.setData(imageItem.item))))
    
    images.sort((i1,i2) => i1.image.height - i2.image.height)
    const lines = Array.from(new Array(Math.ceil(images.length/4)).keys())
    const linesHeight = lines.map(line => [0,1,2,3].reduce((max,i) => Math.max(max, images[line*4+i] ? images[line*4+i].image.height : 0),0))
    const totalHeight = group.totalHeight = linesHeight.reduce((sum,h) => sum + h, 0)
    const canvas = jb.zui.createCanvas(1024, totalHeight)
    const cnvCtx = canvas.getContext('2d')
    images.map(({image,imageItem},i)=> {
      const left = 256 * (i % 4)
      const top = linesHeight.slice(0,Math.floor(i/4)).reduce((sum,h) => sum + h, 0)
      cnvCtx.drawImage(image, left, top)
      imageItem.pos = [left,top]
      imageItem.size = [image.width, image.height]
    })
    group.url = await jb.zui.canvasToDataUrl(canvas)
    return group

    async function imageBitmap(imageItem,ctx) {
      try {
        if (imageItem.imageF.canvas) {
          const canvas = imageItem.imageF.canvas(ctx)
          const image = jbHost.isNode ? await require('canvas').loadImage(canvas.toBuffer('image/png'))
            : await canvas.convertToBlob().then(blob=>createImageBitmap(blob))
          return { image, imageItem }
        } else {
          const url = await imageItem.imageF.url(ctx)
          const response = await fetch(url)
          const imageBlob = await response.blob()
          const image = await createImageBitmap(imageBlob) 
          return { image, imageItem }
        }
      } catch(e) {
        console.log(e, image)
      }
    }
  }
})

component('image', {
  type: 'itemProp',
  params: [
    {id: 'image', type: 'image'},
  ]
})

component('url', {
  type: 'image',
  params: [
    {id: 'url', dynamic: true},
  ]
})

component('imageOfText', {
  type: 'image',
  params: [
    {id: 'text', dynamic: true},
    {id: 'font', as: 'string', defaultValue: '500 16px Arial' },
  ],
  impl: (ctx,textF,font) => ({
    canvas: _ctx => {
      const text = textF(_ctx)
      const tempCanvas = jb.zui.createCanvas(1, 1)
      const tempCtx = tempCanvas.getContext('2d')
      tempCtx.font = font
      const metrics = tempCtx.measureText(text)
      const textWidth = metrics.width
      const fontSizeMatch = font.match(/(\d+)px/)
      const fontSize = fontSizeMatch ? parseInt(fontSizeMatch[1], 10) : 16

      const canvas = jb.zui.createCanvas(textWidth, fontSize * 1.2) // 1.2 is a line-height factor to add padding
      const ctx2d = canvas.getContext('2d')
      ctx2d.font = font
      ctx2d.textBaseline = 'top'
      ctx2d.textAlign = 'left'
      ctx2d.fillStyle = 'black'
      ctx2d.fillText(text, 0, 0)
      return canvas
    },
    url(_ctx) {
      return jb.zui.canvasToDataUrl(this.canvas(_ctx))
    }
  })
})