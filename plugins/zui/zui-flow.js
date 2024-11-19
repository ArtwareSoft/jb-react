dsl('zui')

component('growingFlow', {
  type: 'view',
  params: [
    {id: 'elements', type: 'flow_element[]'}
  ],
  impl: firstToFit(
    flow('%$elements%', { width: 900 }),
    flow('%$elements%', { width: 800 }),
    flow('%$elements%', { width: 700 }),
    flow('%$elements%', { width: 600 }),
    flow('%$elements%', { width: 500 }),
    flow('%$elements%', { width: 400 }),
    flow('%$elements%', { width: 300 }),
    flow('%$elements%', { width: 200 })
  )
})

component('flow', {
  type: 'view',
  params: [
    {id: 'elements', type: 'flow_element[]'},
    {id: 'width', as: 'number', defaultValue: 300},
    {id: 'minHeight', as: 'number', defaultValue: 50},
    {id: 'align', type: 'align_image', defaultValue: keepProportions()},
    {id: 'MAX_ATLAS_SIZE', as: 'number', defaultValue: 1048576}
  ],
  impl: view('flow', {
    layout: flowDown('%$width%', '%$minHeight%'),
    viewProps: [
      prop('elems', zuiFlow.emptyElems('%$elements%')),
      prop('width', '%$width%'),
      prop('MAX_ATLAS_SIZE', '%$MAX_ATLAS_SIZE%'),
      prop('xyToAtlas', obj()),
      FEProp('atlases', list()),
      FEProp('textures', obj())
    ],
    incrementalItemsData: flowItemsData('%$elements%'),
    atts: [
      float('atlasId', ({},{view,item}) => view.props.xyToAtlas[item.xyPos] == null ? -1 : view.props.xyToAtlas[item.xyPos]),
      attsOfElements('%$view.props.elems%', vec4('elem%$elem.id%posSize', '%$elem/xyToPos/{%$item.xyPos%}%'))
    ],
    renderGPU: gpuCode({
      shaderCode: colorOfPoint('gl_FragColor = getTexturePixel(inElem);'),
      varyings: varying('vec2', 'atlasSize', 'vec2(%$width%.0, float(atlasIdToHeight[int(atlasId)]))'),
      utils: [
        alignUtils(),
        utils(ctx => `vec4 getAtlasPixel(vec2 inElem, vec4 imagePosSize, vec3 align) {
          vec2 imagePos = vec2(imagePosSize[0],imagePosSize[1]);
          vec2 imageSize= vec2(imagePosSize[2],imagePosSize[3]);
          vec2 effSize = effectiveSize(align, size, imageSize);
          vec2 inImage = inImagePx(align, size, imageSize, effSize, inElem);
          vec2 rInImage = inImage / effSize;

          if (rInImage[0] < 0.0 || rInImage[0] >= 1.0 || rInImage[1] < 0.0 || rInImage[1] >= 1.0)
              return vec4(1.0, 0.0, 0.0, 0.0);
          
          vec2 texCoord = (imagePos + rInImage * imageSize) / atlasSize;
          ${ctx.vars.view.props.atlases.map(({id}) => `
          if (atlasId == ${id}.0)
              return texture2D(atlas${id}, texCoord);`).join('')} 
          return vec4(0.0, 1.0, 0.0, 0.0);
      }`),
        utils(ctx => `vec4 getTexturePixel(vec2 inElem) {
        float avgHeight = size[1]/noOfElements;
        float effHeight;
        float base = 0.0;
        ${ctx.vars.view.props.elems.map(({id}) => `
        effHeight = min(elem${id}posSize[3],avgHeight);
        if (inElem[1] < base + effHeight )
            return getAtlasPixel(vec2(inElem[0], inElem[1] - base),  elem${id}posSize, elemAlign[${id}] );

        base = base + effHeight;`).join('')}
        return vec4(1.0, 0.0, 0.0, 0.0);
    }`)
      ],
      uniforms: [
        vec3Vec('elemAlign', '%$view/props/elems/length%', '%$view/props/elems/align%'),
        intVec('atlasIdToHeight', '%$view/props/atlases/length%', '%$view/props/atlases/height%'),
        float('noOfElements', '%$view/props/elems/length%')
      ],
      zoomDependentUniforms: [
        zuiFlow.atlasesOfExposedItems(),
        intVec('atlasIdToUnit', '%$view/props/atlases/length%', zuiFlow.allocateTexturesToUnits())
      ]
    })
  })
})

component('flowItemsData', {
  type: 'inc_items_data',
  params: [
    {id: 'flowElements'},
  ],
  impl: (ctx,elemGCs) => ({
    needsItemsData(cmp, view,center,zoom) { // runs in FE
        const viewBeData = cmp.beDataGpu[view.id]
        const atlasAtts = Object.keys(viewBeData.atts).filter(k=>k.endsWith('PosSize')).map(k=>viewBeData.atts[k])
        const sum = [0,0]
        const missingCount = 0
        for (let x=Math.floor(center[0]-zoom/2) ;x <=center[0]-zoom/2; x++)
            for (let y=Math.floor(center[1]-zoom/2) ;y <=center[1]-zoom/2; y++)
                for(att in atlasAtts)
                    if (!att.xyToPos[`${x},${y}`].item) { missingCount ++; sum[0] += x, sum[1] +=y } 
        if (!missingCount) return
        return { center_avg: [sum[0]/missingCount, sum[1]/missingCount], missingCount }
    },
    async calcMoreItemsData(view,center,recalc = []) { // runs in BE
        const {DIM,mat} = ctx.vars
        const {atlases, elems, width, MAX_ATLAS_SIZE, textures, xyToAtlas} = view.props
        let curAtlas = {glyphs: [], height: 0, id: atlases.length}
        atlases.push(curAtlas)

        for await (const it of jb.zui.areaIter(mat, DIM, ...center.map(x=>Math.round(x)))) {
            if (curAtlas.height*width > MAX_ATLAS_SIZE) {
              curAtlas = {glyphs: [], height: 0, id: atlases.length}
              atlases.push(curAtlas)
            }

            const item = it.item
            xyToAtlas[item.xyPos] = curAtlas.id;

            await elems.reduce( (pr,elem, i) => pr.then(async ()=> {
                if (elem.xyToPos[item.xyPos].item) return
                const elemGC = elemGCs[i]
                const data = await elemGC.calc(item, width)
                const size = await elemGC.size(data, width)
                const pos = [0,curAtlas.height]
                elem.xyToPos[item.xyPos] = [...pos,...size]
                curAtlas.glyphs.push({elemGC,pos,data})
                curAtlas.height += size[1]
            }), Promise.resolve())
        }
        if (curAtlas.height == 0) atlases.pop()

        await atlases.reduce((pr, atlas) => pr.then( async () => {
          const {id,height,glyphs} = atlas
          if (textures[`atlas${id}`]) return
          const canvas = jb.zui.createCanvas(width,height)
          const cnvCtx = canvas.getContext('2d')
          cnvCtx.textBaseline = 'top'; cnvCtx.textAlign = 'left'; cnvCtx.fillStyle = 'black'
          glyphs.forEach(({elemGC,pos,data})=> elemGC.drawItem(cnvCtx, pos, data))
          textures[`atlas${id}`] = await jb.zui.canvasToDataUrl(canvas)
          delete atlas.glyphs
        }), Promise.resolve())
        const tt = 3
        
        // recalc atts ?   
    }
  })
})

component('zuiFlow.emptyElems', {
  params: [
    {id: 'flowElements'}
  ],
  impl: (ctx,elemGCs) => elemGCs.map(({align},id) => ({id, align, 
    xyToPos: jb.objFromEntries(ctx.vars.items.map(({xyPos})=>[xyPos,[0,0,0,0]])) }))
})

component('image', {
  type: 'flow_element',
  params: [
    {id: 'url', dynamic: true},
    {id: 'align', type: 'align_image', defaultValue: fill()}
  ]
})

component('paragraph', {
  type: 'flow_element',
  params: [
    {id: 'content', as: 'string', dynamic: true},
    {id: 'font', as: 'string', defaultValue: '500 16px Arial'},
    {id: 'lineHeight', as: 'number', defaultValue: 20},
    {id: 'align', type: 'align_image', defaultValue: keepSize('left', 'top')}
  ],
  impl: (ctx,content,font,lineHeight,align) => ({
        align,
        calc(item, width) {
            return jb.zui.calculateLineBreaksAndSpacing(content(ctx.setData(item)), width, font)
        },
        size(lines, width) {
            return [width, lines.length*lineHeight]
        },
        drawItem(cnvCtx, pos, lines) {
            cnvCtx.font = font
            lines.forEach((line, index) => {
                let x = 0
                const y = index * lineHeight
                line.words.forEach(word => {
                    cnvCtx.fillText(word,pos[0]+x,pos[1]+y)
                    x += cnvCtx.measureText(word).width + line.wordSpacing // Move x position for the next word
                })
            })
        }
  })
})

component('title', {
  type: 'flow_element',
  params: [
    {id: 'title', as: 'string', dynamic: true},
    {id: 'font', as: 'string', defaultValue: '900 16px Arial'},
    {id: 'align', type: 'align_image', defaultValue: keepSize('left', 'top')}
  ],
  impl: text('%$title()%', '%$font%', { align: '%$align%' })
})

component('text', {
  type: 'flow_element',
  params: [
    {id: 'text', as: 'string', dynamic: true},
    {id: 'font', as: 'string', defaultValue: '600 16px Arial'},
    {id: 'align', type: 'align_image', defaultValue: keepSize('left', 'top')}
  ],
  impl: (ctx,text,font,align) => ({
        align,
        calc(item, width) {
            return text(ctx.setData(item))
        },
        size(textStr, width) {
            const metrics = jb.zui.measureCanvasCtx(font).measureText(textStr)
            return [metrics.width, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent]
        },
        drawItem(cnvCtx, pos, textStr) {
            cnvCtx.font = font
            cnvCtx.fillText(textStr, ...pos)
        }
  })
})

component('group', {
  type: 'flow_element',
  params: [
    {id: 'elems', type: 'flow_element[]', composite: true},
    {id: 'spacing', as: 'number', defaultValue: 5},
    {id: 'align', type: 'align_image', defaultValue: keepSize('left', 'top')}
  ],
  impl: (ctx,elems,spacing,align) => ({
        align,
        calc(item, width) {
            return elems.map(elem=> { 
                const data = elem.calc(item,width)
                return { data, size: elem.size(data,width) }
            })
        },
        size(dataItems, width) {
            return [width, (spacing * elems.length-1) + elems.reduce((acc,elem,i) => acc + dataItems[i].size[1], 0)]
        },
        drawItem(cnvCtx, pos, dataItems, width) {
            let offset = 0
            elems.forEach((elem,i) => {
                elem.drawItem(cnvCtx,[pos[0], pos[1]+offset],dataItems[i].data)
                offset += dataItems[i].size[1] + spacing
            })
        }
  })
})

extension('zui','flow', {
    *areaIter(mat, DIM, x, y) {
        for (const item of mat[DIM * x + y] || []) yield { item, r: 0 }
        for (let r = 1; r < DIM; r++)
            for (let i = -r; i <= r; i++) {
                if (x + i >= 0 && x + i < DIM) {
                    if (y - r >= 0) for (const item of mat[DIM * (x + i) + (y - r)] || []) yield { item, r }
                    if (y + r < DIM) for (const item of mat[DIM * (x + i) + (y + r)] || []) yield {item, r }
                }    
                if (y + i >= 0 && y + i < DIM) {
                    if (x - r >= 0 && i !== -r && i !== r) for (const item of mat[DIM * (x - r) + (y + i)] || []) yield { item, r }
                    if (x + r < DIM && i !== -r && i !== r) for (const item of mat[DIM * (x + r) + (y + i)] || []) yield { item, r }
                }
        }
    }
})

extension('zui','paragraph', {
    calculateLineBreaksAndSpacing(text, lineWidth, font) {
        const mCtx = jb.zui.measureCanvasCtx(font)
    
        const lines = []
        let currentLine = []
        let currentLineWidth = 0
        const spaceWidth = mCtx.measureText(' ').width
    
        text.split(' ').forEach(word=> {
            const wordWidth = mCtx.measureText(word).width
    
            if (currentLineWidth + wordWidth + (currentLine.length > 0 ? spaceWidth : 0) > lineWidth) {
                const remainingSpace = lineWidth - currentLineWidth + (currentLine.length - 1) * spaceWidth
                const wordSpacing = currentLine.length > 1 ? remainingSpace / (currentLine.length - 1) : 0
    
                lines.push({ words: currentLine, wordSpacing, width: currentLineWidth })
                currentLine = [word]
                currentLineWidth = wordWidth
            } else {
                if (currentLine.length > 0) currentLineWidth += spaceWidth
                currentLine.push(word)
                currentLineWidth += wordWidth
            }
        })
        lines.push({ words: currentLine, wordSpacing: spaceWidth })
        return lines
    }
})

component('zuiFlow.atlasesOfExposedItems', {
  type: 'uniform',
  impl: ctx => {
    const { view, cmp} = ctx.vars
    //if (view.atlasesOfExposedItemsCache) return view.atlasesOfExposedItemsCache
    if (cmp.isBEComp)
      return view.props.atlases.map(({id})=>({id: `atlas${id}`, glType: 'sampler2D', glMethod: '1i'}))
    if (!cmp.beDataGpu[view.id]) return []
    return view.atlasesOfExposedItemsCache = cmp.beDataGpu[view.id].props.atlases.map(({id, url})=>({id: `atlas${id}`, glType: 'sampler2D', glMethod: '1i', 
      val: () => url
    }))
  }
})

component('zuiFlow.allocateTexturesToUnits', {
  impl: ctx => {
    const {view, cmp} = ctx.vars
    //if (view.allocateTexturesToUnitsCache) return view.allocateTexturesToUnitsCache

    const atlasIdToUnit = cmp.beDataGpu[view.id].props.atlases.map(({id}) => jb.zui.allocateSingleTextureUnit({view, uniformId: id,cmp}).i)
    return view.allocateTexturesToUnitsCache = new Int32Array(atlasIdToUnit)
  }
})
