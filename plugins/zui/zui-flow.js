dsl('zui')

// todo: calc atlas with iterator for all elements
// missingAtlas method and recalc atts
component('flow', {
  type: 'view',
  params: [
    {id: 'elements', type: 'flow_element[]'},
    {id: 'minSize', as: 'array', defaultValue: [200,100]},
    {id: 'maxWidth', as: 'number', defaultValue: 300},
    {id: 'align', type: 'align_image', defaultValue: keepProportions()},
    {id: 'MAX_ATLASES', as: 'number', defaultValue: 20}
  ],
  impl: view('flow', {
    layout: flowDown({ min: '%$minSize%', maxWidth: '%$maxWidth%' }),
    viewProps: [
        prop('elems', zuiFlow.emptyElems('%$elems%')),
        prop('atlases', list()),
    ],
    atts: attsOfElements({
      elements: '%$view.props.elems%',
      attsOfElem: [
        float('elem%$elem.id%atlasId', '%$elem/xyToImage/{%$item.xyPos%}/atlas%'),
        vec4('elem%$elem.id%PosSize', '%$elem/xyToImage/{%$item.xyPos%}/posSize%')
      ]
    }),
    renderGPU: gpuCode({
      shaderCode: imageColorOfPoint(),
      varyings: [
        varying('float', 'unit', 'float(atlasIdToUnit[int(atlasId)])'),
        varying('vec2', 'atlasSize', 'vec2(1024.0, float(atlasIdToHeight[int(atlasId)]))')
      ],
      utils: imageUtils('%$align%', '%$view.props.glCodeForTextPixelFunc%'),
      uniforms: [
        imageUniforms('%$align%'),
        intVec('atlasIdToHeight', '%$MAX_ATLASES%', '%$view/props/atlases/height%')
      ],
      zoomDependentUniforms: [
        atlasesOfExposedItems(),
        intVec('atlasIdToUnit', '%$MAX_ATLASES%', allocateTexturesToUnits())
      ]
    })
  })
})

component('flowItemsData', {
  params: [
    {id: 'elements', type: 'flow_element[]'},
    {id: 'maxWidth', as: 'number'},
    {id: 'MAX_ATLAS_SIZE', as: 'number', defaultValue: 1048576}
  ],
  type: 'inc_items_data',
  impl: (ctx,elemGCs, maxWidth, MAX_ATLAS_SIZE) => ({
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
    async calcMoreItemsData(view,center) { // runs in BE
        const {DIM,mat} = ctx.vars
        const {atlases, elems} = view.props
        const atlasObj = {}
        atlasObj.atlas = atlases.push(atlasObj)

        let atlasFull = false, yPos = 0
        const glyphs = []
        const iterator = jb.zui.areaIter(mat, DIM, ...center)
        for (let it = iterator.next(); !it.done && !atlasFull; it = iterator.next()) {
            elemGCs.filter((_,i)=>!elems[i].xyToPos[it.value.item.xy].item).forEach((elemGC,i) => {
                const size = elemGC.size(item, maxWidth)
                const pos = [0,yPos]
                elems[i].xyToPos[item.xyPos] = { atlas: atlasObj.atlas, pos, size, elemGC, item }
                glyphs.push({elem,pos,item})
                yPos += size[0]
            })
            atlasFull = yPos*maxWidth > MAX_ATLAS_SIZE
        }
        if (ypos == 0) {
            atlases.pop()
            return {}
        }

        atlasObj.size = [maxWidth, yPos]
        const canvas = jb.zui.createCanvas(...atlasObj.size)
        const cnvCtx = canvas.getContext('2d')
        glyphs.forEach(({elemGC,pos,item})=> elemGC.drawItem(cnvCtx, pos, item))
        atlasObj.url = await jb.zui.canvasToDataUrl(canvas)
        
        view.atts = view.attsF(ctxWithView).flatMap(x=>x).map(att=> ({...att, calc: null, ar: att.calc(view)}))
        view.renderGPU = view.renderGpuF(ctxWithView).calc(view)
        return {
          id: view.id,
          atts: view.atts,
          glCode: view.renderGPU.glCode,
          uniforms: Object.values(view.renderGPU.uniforms).map(({id,glType,glMethod,value}) => ({id,glType,glMethod,value})),
          props: jb.objFromEntries(view.propsF.filter(p=>p.passToFE).map(({id})=>[id, view.props[id]]))
        }    
    }
  })
})

component('zuiFlow.emptyElems', {
 params: [
    {id: 'elements', type: 'flow_element[]'},
],
  impl: async (ctx,_elems, maxWidth, MAX_ATLAS_SIZE) => {
    const elems = _elems.map(() => ({xyToPos:{}}))
    ctx.vars.items.forEach(item => elems.forEach(elem => elem.xyToPos[item.xyPos] = { atlas: 0, pos: [0,0], size: [0,0] }))
    return elems
  }
})

component('image', {
  type: 'flow_element',
  params: [
    {id: 'url', dynamic: true}
  ]
})

component('paragraph', {
  type: 'flow_element',
  params: [
    {id: 'title', dynamic: true},
    {id: 'content', dynamic: true}
  ]
})


extension('zui','flow', {
    *areaIter(mat, DIM, x, y) {
        let r = 0
        while (true) {
            let hasYielded = false;
            for (let i = -r; i <= r; i++) {
                if (x + i >= 0 && x + i < DIM) {
                    if (y - r >= 0 && mat[x + i][y - r]) { yield { item: mat[x + i][y - r], r }; hasYielded = true; }
                    if (y + r < DIM && mat[x + i][y + r]) { yield { item: mat[x + i][y + r], r }; hasYielded = true; }
                }
                if (y + i >= 0 && y + i < DIM) {
                    if (x - r >= 0 && mat[x - r][y + i]) { yield { item: mat[x - r][y + i], r }; hasYielded = true; }
                    if (x + r < DIM && mat[x + r][y + i]) { yield { item: mat[x + r][y + i], r }; hasYielded = true; }
                }
            }
            if (!hasYielded) break
            r++
        }
    },
})

extension('zui','paragraph', {
    calculateLineBreaksAndSpacing(text, lineWidth, font = '16px Arial') {
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
        lines.push({ words: currentLine, wordSpacing: 0 })
        return lines
    },
    drawParagraphOnCanvas(text, lineWidth, font = '16px Arial', lineHeight = 20) {
        const lines = calculateLineBreaksAndSpacing(text, lineWidth, font)
    
        const canvas = jb.zui.createCanvas(lineWidth,lines.length * lineHeight)
        const cnvCtx = canvas.getContext('2d')
        cnvCtx.font = font
        cnvCtx.fillStyle = 'black'
        cnvCtx.textBaseline = 'top'
    
        lines.forEach((line, index) => {
            let x = 0
            const y = index * lineHeight
    
            line.words.forEach(word => {
                cnvCtx.fillText(word, x, y)
                x += cnvCtx.measureText(word).width + line.wordSpacing // Move x position for the next word
            })
        })    
    }
        
})
