jb.dsl('zui')

jb.component('zui.itemlist', {
    type: 'control<>',
    params: [
        {id: 'itemView', type: 'view', mandatory: true, dynamic: true},
        {id: 'title', as: 'string'},
        {id: 'boardSize', as: 'number', defaultValue: 256},
        {id: 'initialZoom', as: 'number', description: 'in terms of board window. empty is all board'},
        {id: 'items', as: 'array', dynamic: true, mandatory: true},
        {id: 'onChange', type: 'action<>', dynamic: true } ,
        {id: 'style', type: 'itemlistStyle<zui>', dynamic: true, defaultValue: itemlistStyle()},
        {id: 'features', type: 'feature[]', dynamic: true, flattenArray: true}
    ],
    impl: ctx => jb.ui.ctrl(ctx)
})
  
jb.component('itemlistStyle', {
  type: 'itemlistStyle',
  impl: customStyle({
    typeCast: 'style',
    template: ({},{},h) => h('canvas',{width: 600, height: 460}),
    css: '{ touch-action: none; }',
    features: [
      calcProps((ctx,{$model})=> {
        const items = $model.items()
        const itemView = $model.itemView(ctx.setVars({items}))
        const DIM = $model.boardSize
        const onChange = $model.onChange.profile && $model.onChange
        const zoom = +($model.initialZoom || DIM)
        const pivots = itemView.pivots()
        const elems = itemView.zuiElems()

        return {
            DIM, ZOOM_LIMIT: [1, DIM*2], itemView, elems, items, pivots, onChange, center: [DIM* 0.5, DIM* 0.5], zoom
        }
      }),
      frontEnd.coLocation(),
      frontEnd.init(async ({},{cmp, el, $props}) => {
            const props = cmp.props = $props
            const gl = el.getContext('webgl', { alpha: true, premultipliedAlpha: true }) //el.getContext('webgl')
            gl.enable(gl.BLEND)
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

            Object.assign(props, { glCanvas: el, gl, aspectRatio: el.width/el.height })
            jb.zui.initZuiCmp(cmp,props)
            jb.zui.initViewCmp(cmp,props)
            await Promise.all(props.elems.map(elem =>elem.prepare && elem.prepare(props)).filter(x=>x))
            props.itemsPositions = jb.zui.calcItemsPositions(props) // todo - model
            if (cmp.ctx.vars.zuiCtx)
              cmp.ctx.vars.zuiCtx.props = props

            jb.zui.clearCanvas(props)
            cmp.render()
      }),
      frontEnd.prop('zuiEvents', rx.subject()),
      frontEnd.flow(
        source.frontEndEvent('pointerdown'),
        rx.log('zui pointerdown'),
        rx.var('pid', '%pointerId%'),
        rx.do(({},{cmp,pid}) => cmp.addPointer(pid)),
        rx.flatMap(
          rx.mergeConcat(
            rx.pipe(
              rx.merge(source.event('pointermove'), source.frontEndEvent('pointerup')),
              rx.filter('%$pid%==%pointerId%'),
              rx.do(({data},{cmp,pid}) => cmp.updatePointer(pid,data)),
              rx.takeWhile('%type%==pointermove'),
              rx.flatMap(source.data(({},{cmp}) => cmp.zoomEventFromPointers()))
            ),
            rx.pipe(
              source.data(({},{cmp,pid}) => cmp.momentumEvents(pid)),
              rx.var('delay', '%delay%'),
              rx.flatMap(rx.pipe(source.data('%events%'))),
              rx.delay('%$delay%'),
              rx.log('momentum zui')
            ),
            rx.pipe(source.data(1), rx.do(({data},{cmp}) => cmp.removePointer(data.pointerId)))
          )
        ),
        rx.do(({data},{cmp}) => cmp.updateZoomState(data)),
        sink.subjectNext('%$cmp.zuiEvents%')
      ),
      frontEnd.flow(source.subject('%$cmp.zuiEvents%'), sink.action('%$cmp.render()%')),
      frontEnd.flow(
        source.frontEndEvent('wheel'),
        rx.log('zui wheel'),
        rx.map(({},{sourceEvent}) => ({ dz: sourceEvent.deltaY > 0 ? 1.1 : sourceEvent.deltaY < 0 ? 0.9 : 1 })),
        rx.do(({data},{cmp}) => cmp.updateZoomState(data)),
        sink.subjectNext('%$cmp.zuiEvents%')
      )
    ]
  })
})
  
jb.extension('zui','view', {
  initViewCmp(cmp,props) {
    props.elems.forEach(elem => elem.buffers = elem.prepareGPU(props))
    Object.assign(cmp, {
      render() {
        const elems = props.elems.filter(el=>el.inScene(zoom))
        elems.forEach(elem => elem.calcExtraRenderingProps && Object.assign(props, elem.calcExtraRenderingProps(props)))
        elems.forEach(elem => elem.renderGPUFrame(props, elem.buffers))
        props.onChange && props.onChange(props)
      },
    })
  }
})

jb.extension('zui','text', {
  textZuiElem: {
    charSetSize: 64,
    txt_fields: ['2','4','8','16_0','16_1','32_0','32_1','32_2','32_3'],
    async prepare({gl}) {
      this.charSetTexture = await jb.zui.imageToTexture(gl,this.createCharSetImage())
    },
    createCharSetImage() {
        const fontSize = 16
        const txt = ' abcdefghijklmnopqrstuvwxyz0123456789!@#$%ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        const canvas = document.createElement('canvas')
        canvas.id = 'canvas'
        canvas.width = this.charSetSize * fontSize
        canvas.height = fontSize
        document.body.appendChild(canvas)
        const ctx = canvas.getContext('2d')
        ctx.font = `${fontSize}px monospace`
        ctx.textBaseline = 'top'
        ctx.textAlign = 'left'
        ctx.fillStyle = 'black'
        Array.from(new Array(txt.length).keys()).forEach(i=> ctx.fillText(txt[i],i*10,0))

        return canvas.toDataURL('image/png')
    },
    prepareGPU({ gl, DIM, itemsPositions }) {
      const txt_fields = this.txt_fields
      const src = [`
            attribute vec2 vertexPos;
            attribute vec2 inRectanglePos;
            ${txt_fields.map(fld => `attribute vec4 _text_${fld};`).join('\n')}
                            
            uniform vec2 zoom;
            uniform vec2 center;
            uniform vec2 canvasSize;
            uniform float textSquareInPixels;
            varying vec2 npos;
            
            ${txt_fields.map(fld => `varying vec4 text_${fld};`).join('\n')}
            
            void main() {
              ${txt_fields.map(fld => `text_${fld} = _text_${fld};`).join('\n')}
              vec2 _npos = vec2(2.0,2.0) * (vertexPos - center) / zoom;
              gl_Position = vec4(_npos , 0.0, 1.0);
              npos = _npos;
              gl_PointSize = textSquareInPixels;
            }
            
            `,
            `precision highp float;
            uniform sampler2D charSetTexture;
            uniform vec2 zoom;
            uniform int strLen;
            uniform vec2 canvasSize;
            uniform vec2 boxSize;
            uniform float charWidthInTexture;
            varying vec2 npos;
            ${txt_fields.map(fld => `varying vec4 text_${fld};\n`).join('\n')}

            vec4 getTextVec(float x) {
              if (strLen <= 2) return text_2;
              if (strLen <= 4) return text_4;
              if (strLen <= 8) return text_8;
              if (strLen <= 16) {
                if (x < 0.5) return text_16_0;
                return text_16_1;
              }
              if (strLen <= 32) {
                if (x < 0.25) return text_32_0;
                if (x < 0.5) return text_32_1;
                if (x < 0.75) return text_32_2;
                return text_32_3;
              }
            }
            
            float getIndexInVec(float x) {
              if (strLen <= 2) return 0.0;
              if (strLen <= 4) return floor(x * 2.0);
              if (strLen <= 8) return floor(x * 4.0);
              if (strLen <= 16) return floor(mod(x,0.5) * 8.0);
              if (strLen <= 32) return floor(mod(x,0.25) * 16.0);
            }

            float calcCharCode(float x) {
              int index = 0;
              int idx = int(getIndexInVec(x));
              vec4 vec = getTextVec(x);
              float flt = 0.0;
              for(int i=0;i<4;i++)
                if (idx == i) flt = vec[i];

              if (mod(x*float(strLen)/2.0 , 1.0) < 0.5)
                 return floor(flt/256.0);
              return mod(flt,256.0);
            }

            void main() {
              vec2 coord = vec2(2.0,2.0) * gl_FragCoord.xy / canvasSize - vec2(1.0,1.0);
              vec2 boxBaseDist = coord - (npos - boxSize*vec2(0.5,0.5));
              vec2 inBoxPos = boxBaseDist / boxSize;
              if (inBoxPos[0] < 0.0 || inBoxPos[0] > 1.0 || inBoxPos[1] < 0.0 || inBoxPos[1] > 1.0) {
                gl_FragColor = vec4(0.0, 0.0, 1.0, 0.0);
                return;                    
              }
              float inCharPos = mod(inBoxPos[0] * float(strLen), 1.0);
              vec2 texturePos = vec2((calcCharCode(inBoxPos[0]) + inCharPos) * charWidthInTexture, inBoxPos[1]);
              gl_FragColor = texture2D( charSetTexture, texturePos * vec2(1.0, -1.0));
            }`
        ]

        const textPosMatrix = [
          [[-1,-1], [0,-0.25]], // below
          [[-1,1], [0,0.25] ], // above [-1.5,0.1]
          [[-3,0], [-1.6,-0.1]], // left
          [[1,0], [0.1,0.4]], // right
        ]
        const { mat,sparse } = itemsPositions
        const textBoxNodes = sparse.map(([x,y,color, summaryLabel]) => [...calcTextPositions(x,y) , ...jb.zui.textsAsFloats(summaryLabel)])
        const vertexArray = new Float32Array(textBoxNodes.flatMap(v=> v.map(x=>1.0*x)))
        const floatsInVertex = 2 + 31
        const vertexCount = vertexArray.length / floatsInVertex

        const buffers = {
          vertexCount, floatsInVertex,
          vertexBuffer: gl.createBuffer(),
          shaderProgram: jb.zui.buildShaderProgram(gl, src)
        }    
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertexBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW)

        return buffers
    
        // specials algorithm to avoid collapse of texts, 
        function calcTextPositions(x,y) {
          for(let i=0;i<4;i++) {
            let empty = true
            for(let j=0;j<3;j++)
              if (mat[DIM*(y + textPosMatrix[i][0][1]) + x+textPosMatrix[i][0][0]+j]) empty = false;
            if (empty) {
              for(let j=0;j<3;j++)
                mat[DIM*(y + textPosMatrix[i][0][1]) + x+textPosMatrix[i][0][0]+j] = true;
              return [x+textPosMatrix[i][1][0], y+textPosMatrix[i][1][1]]
            }
          }
          return [-1,-1]
        }
    },
    calcExtraRenderingProps({zoom, glCanvas}) {
      const gridSizeInPixels = glCanvas.width/ zoom
      const strLen = 2**Math.floor(Math.log(gridSizeInPixels/10)/Math.log(2))
      //const textWidth =  2 -> 1, 4->1, 8-> , 16 32 -> 2.4
      const textSquareInPixels = 3 * glCanvas.width / zoom
      const boxSizeWidthFactor = strLen == 2 ? 0.8 : strLen == 4 ? 1 : strLen == 8 ? 2 : strLen == 16 ? 1.5 : 0.5 
      const boxSizeHeightFactor = strLen == 2 ? 4 : strLen == 4 ? 2 : strLen == 8 ? 1 : strLen == 16 ? 0.5 : 0.25 
      const boxSize = [boxSizeWidthFactor / zoom, boxSizeHeightFactor * 0.4 / zoom]
      const charWidthInTexture=  1/ (this.charSetSize * 1.6)
      return {strLen, boxSize, textSquareInPixels, charWidthInTexture}
    },
    renderGPUFrame({ glCanvas, gl, aspectRatio, zoom, center, strLen, boxSize, textSquareInPixels, charWidthInTexture} , { vertexCount, floatsInVertex, vertexBuffer, shaderProgram }) {
        gl.useProgram(shaderProgram)

        gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'zoom'), [zoom, zoom/aspectRatio]) // DIM units
        gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'center'), center) // DIM units
        gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'boxSize'), boxSize) // [-1..1] units
        gl.uniform1i(gl.getUniformLocation(shaderProgram, 'strLen'), strLen)
        gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'canvasSize'), [glCanvas.width, glCanvas.height])
        gl.uniform1f(gl.getUniformLocation(shaderProgram, 'textSquareInPixels'), textSquareInPixels) // in pixels
        gl.uniform1f(gl.getUniformLocation(shaderProgram, 'charWidthInTexture'), charWidthInTexture) // 0-1
        
        const vertexPos = gl.getAttribLocation(shaderProgram, 'vertexPos')
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
        gl.enableVertexAttribArray(vertexPos)
        gl.vertexAttribPointer(vertexPos, 2, gl.FLOAT, false, floatsInVertex* Float32Array.BYTES_PER_ELEMENT, 0)

        const sizes = [1,2,4, 4,4, 4,4,4,4]
        let offset = 2
        this.txt_fields.forEach((id,i) =>{
          const text1 = gl.getAttribLocation(shaderProgram, `_text_${id}`)
          gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
          gl.enableVertexAttribArray(text1)
          gl.vertexAttribPointer(text1, sizes[i], gl.FLOAT, false,  floatsInVertex* Float32Array.BYTES_PER_ELEMENT, offset* Float32Array.BYTES_PER_ELEMENT)
          offset += sizes[i]  
        })

        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, this.charSetTexture)
        gl.uniform1i(gl.getUniformLocation(shaderProgram, 'charSetTexture'), 0)

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
        gl.drawArrays(gl.POINTS, 0, vertexCount)
    }
  }  
})

jb.component('text', {
  type: 'view',
  params: [
    {id: 'prop', type: 'itemProp'},
    {id: 'features', type: 'feature[]', dynamic: true, flattenArray: true}
  ],
  impl: (ctx,prop, features) => {
    const view = {
      pivots: () => prop.pivots(),
      zuiElems: () => [jb.zui.textZuiElem],
      rt: {}
    }
    features().forEach(f=>f.enrichView(view))
    view.height = view.height || 16
    view.enterHeight = view.enterHeight || Math.floor(view.height/2)
    return view
  }
})

jb.component('group', {
  type: 'view',
  params: [
    {id: 'title', as: 'string'},
    {id: 'layout', type: 'layout', defaultValue: verticalOneByOne() },
    {id: 'views', type: 'view[]', dynamic: true },
    {id: 'features', type: 'feature[]', dynamic: true, flattenArray: true}
  ],
  impl: (ctx,title,layout,viewsF,features) => { 
    const views = viewsF()
    views.byPriority = views.slice(0).sort((x,y) => (x.priority || 0) - (y.priority || 0) )
    

    return {
      pivots: () => views.flatMap(v=>v.pivots()),
      zuiElems: () => views.flatMap(v=>v.zuiElems()),
      layout: size => layout(size, views),
      rt: {}
    }
  }
})

jb.component('verticalOneByOne', {
  type: 'layout',
  impl: ctx => ({
    layout(size, views) {
      let sizeLeft = size
      views.byPriority.forEach(v=>{
        if (sizeLeft == 0) {
          v.rt.height = 0
        } else if (sizeLeft > v.height) {
          v.rt.height = v.height
          sizeLeft -= v.height
        } else if (sizeLeft > v.enterHeight) {
          v.rt.height = sizeLeft
          sizeLeft = 0
        } else {
          v.rt.height = 0
          sizeLeft = 0
        }
      })
    }
  })
})

jb.component('horizontalOneByOne', {
  type: 'layout',
  params: [
  ],
  impl: ctx => ctx.params
})

jb.component('priorty', {
  type: 'feature',
  params: [
    {id: 'priority', as: 'number', description: 'scene enter order'}
  ],
  impl: (ctx,priority) => ({
    enrichView(v) { v.priority = priority}
  })
})


