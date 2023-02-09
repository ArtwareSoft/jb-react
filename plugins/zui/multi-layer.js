jb.dsl('zui')

jb.component('zui.multiLayer', {
  type: 'control<>',
  params: [
    {id: 'title', as: 'string'},
    {id: 'boardSize', as: 'number', defaultValue: 256},
    {id: 'initialZoom', as: 'number', description: 'in terms of board window. empty is all board'},
    {id: 'items', as: 'array', dynamic: true, mandatory: true},
    {id: 'layers', type: 'layer<zui>[]', mandatory: true, dynamic: true},
    {id: 'onChange', type: 'action<>', dynamic: true } ,
    {id: 'style', type: 'multiLayerStyle<zui>', dynamic: true, defaultValue: multiLayerStyle()},
    {id: 'features', type: 'feature[]', dynamic: true, flattenArray: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('multiLayerStyle', {
  type: 'multiLayerStyle',
  impl: customStyle({
    typeCast: 'style',
    template: ({},{},h) => h('canvas',{width: 600, height: 460}),
    css: '{ touch-action: none; }',
    features: [
      calcProps((ctx,{$model})=> {
        const items = $model.items()
        const DIM = $model.boardSize
        const onChange = $model.onChange.profile && $model.onChange
        const zoom = +($model.initialZoom || DIM)
        const _greens = jb.d3.lib().scaleSequential(jb.frame.d3.interpolateLab('green','white'))
        const greens = x => jb.frame.d3.color(_greens(x))
        const pivots = { x: pivot('price'), y: pivot('hits') }
        const layers = $model.layers()
        const summaryLabel = item => `${item.title} (${item.price}, ${item.hits})`

        return {
            DIM, ZOOM_LIMIT: [1, DIM*2], layers, items, pivots, summaryLabel, scales: { greens }, onChange,
            center: [DIM* 0.5, DIM* 0.5], stage: 0 , zoom
        }

        function pivot(att) {
            items.sort((i1,i2) => i2[att] - i1[att] ).forEach((x,i) => x[`scale_${att}`] = i/items.length)
            return { att, scale: x => x[`scale_${att}`] }
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
            jb.zui.initLayerCmp(cmp,props)
            await Promise.all(props.layers.map(layer =>layer.prepare && layer.prepare(props)).filter(x=>x))
            props.itemsPositions = jb.zui.calcItemsPositions(props)
            if (cmp.ctx.vars.zuiCtx)
              cmp.ctx.vars.zuiCtx.props = props

            jb.zui.clearCanvas(props)
            cmp.firstRender()
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

jb.extension('zui','multiLayer', {
  initLayerCmp(cmp,props) {
    Object.assign(cmp, {
      render() {
        props.layers.forEach(layer => layer.calcExtraRenderingProps && Object.assign(props, layer.calcExtraRenderingProps(props)))
        props.layers.forEach(layer => layer.renderGPUFrame(props, layer.buffers))
        props.onChange && props.onChange(props)
      },
      firstRender() {
        props.layers.forEach(layer => {
            layer.buffers = layer.prepareGPU(props)
            layer.calcExtraRenderingProps && Object.assign(props, layer.calcExtraRenderingProps(props))
            layer.renderGPUFrame(props, layer.buffers)
        })
        //props.onChange && props.onChange(props)
      }
    })
  },
  initZuiCmp(cmp,props) {
    const w = props.glCanvas.offsetWidth, h = props.glCanvas.offsetHeight

    Object.assign(cmp, {
      updatePointer(pid,sourceEvent) {
        const pointer = this.pointers.find(x=>x.pid == pid)
        if (!pointer) return
        const dt = pointer.dt = sourceEvent.timeStamp - (pointer.time || 0)
        const [x,y] = [sourceEvent.offsetX, sourceEvent.offsetY];
        const dp = (!pointer.p) ? [0,0] : [x - pointer.p[0], y - pointer.p[1]]
        const v = dt == 0 ? [0,0] : [0,1].map(axis => dp[axis]/dt)
        Object.assign(pointer, {
            time: sourceEvent.timeStamp,
            vAvg: pointer.v ? [0,1].map(axis=> pointer.v[axis] * 0.8 + v[axis] *0.2) : v,
            p: [x,y], v, dp, sourceEvent
        })
        const otherPointer = this.pointers.length > 1 && this.pointers.find(x=>x.pid != pid)
        if (otherPointer && otherPointer.p) {
            const gap = Math.hypot(...[0,1].map(axis => Math.abs(pointer.p[axis] - otherPointer.p[axis])))
            const dscale = (gap == 0  || pointer.gap == 0) ? 1 : pointer.gap / gap
            otherPointer.dscale = pointer.dscale = dscale
            otherPointer.gap = pointer.gap = gap
        }
        jb.log('zui update pointers', {v: `[${pointer.v[0]},${pointer.v[1]}]` , pointer, otherPointer, cmp})
        if (this.pointers.length > 2)
            jb.logError('zui more than 2 pointers', {pointers: this.pointers})
      },      
      zoomEventFromPointers() {
          return cmp.pointers.length == 0 ? [] : cmp.pointers[1] 
              ? [{ p: avg('p'), dp: avg('dp'), v: avg('v'), dz: cmp.pointers[0].dscale }]
              : [{ v: cmp.pointers[0].v, dp: cmp.pointers[0].dp }]
      
          function avg(att) {
            const pointers = cmp.pointers.filter(p=>p[att])
            return [0,1].map(axis => pointers.reduce((sum,p) => sum + p[att][axis], 0) / pointers.length)
          }
      },
      updateZoomState({ dz, dp }) {
        if (dz)
          props.zoom *= dz
        if (dp)
          props.center = [props.center[0] - dp[0]/w*props.zoom, props.center[1] + dp[1]/h*props.zoom]

        props.zoom = Math.max(props.ZOOM_LIMIT[0],Math.min(props.zoom, props.ZOOM_LIMIT[1]))

        jb.log('zui event',{dz, dp, zoom: props.zoom, center: props.center, cmp})
      },
      pointers: [],
      findPointer(pid) { return this.pointers.find(x=>x.pid == pid) },
      addPointer(pid) { !this.findPointer(pid) && this.pointers.push({pid}); },
      removePointer(pid) { this.pointers.splice(this.pointers.findIndex(x=>x.pid == pid), 1)} ,
      momentumEvents(pid) {
        const pointer = this.pointers.find(x=>x.pid == pid)
        if (!pointer) return { delay: 0, events: [] }
        const target = [limitJump(w,500*pointer.vAvg[0]), limitJump(h,500*pointer.vAvg[1])]
        const n = 50
        const dps = Array.from(new Array(n).keys()).map( i => smoth(i,n))
        return { delay: 5, events: dps.map(dp=>({dp})) }

        function limitJump(limit,value) {
          return Math.sign(value) * Math.min(Math.abs(value),limit)
        }
        function smoth(i,n) {
          return [0,1].map(axis => target[axis] * (Math.sin((i+1)/n*Math.PI/2) - Math.sin(i/n*Math.PI/2)))
        }
      },
    })
  },
  calcItemsPositions({items, pivots, scales, summaryLabel, DIM}) {
      const mat = Array(DIM**2)
      items.forEach(item => {
        const [x,y] = [Math.floor(DIM*pivots.x.scale(item)), Math.floor(DIM*pivots.y.scale(item))]
        mat[DIM*y + x] = mat[DIM*y + x] || []
        mat[DIM*y + x].push(item)
      })      
      repulsion()

      return { mat, sparse: Array.from(Array(DIM**2).keys()).filter(i=>mat[i]).map(i=>
          [i%DIM, Math.floor(i/DIM), scales.greens(pivots.x.scale(mat[i][0])), summaryLabel(mat[i][0]) ]) 
      }

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
  },
  buildShaderProgram(gl, sources) {
      const program = gl.createProgram()
    
      sources.forEach((src,i) => {
        const shader = gl.createShader(i ? gl.FRAGMENT_SHADER : gl.VERTEX_SHADER)
        gl.shaderSource(shader, src)
        gl.compileShader(shader)

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {  
            jb.logError(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`, { src })
            gl.deleteShader(shader)
        }            
        shader && gl.attachShader(program, shader)
      })
    
      gl.linkProgram(program)
    
      if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        jb.logError('Error linking shader program:', {desc: gl.getProgramInfoLog(program), shaderInfo})
    
      return program
  },
  clearCanvas({gl, glCanvas}) {
    gl.viewport(0, 0, glCanvas.width, glCanvas.height)
    gl.clearColor(0.8, 0.9, 1.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)    
  },
  hexToBinary: hexString => Uint8Array.from(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16))),
  async imageToTexture(gl, url) {
    return new Promise( resolve => {
      const texture = gl.createTexture()
      const image = new Image()
      image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
          gl.generateMipmap(gl.TEXTURE_2D);
        } else {
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
        resolve(texture)

        function isPowerOf2(value) {
          return (value & (value - 1)) === 0
        }
      }
      image.src = url
    })
  },
  textsAsFloats(text) { // 31 floats = 1 + 2 + 4 + (4+4) + (4+4+4+4)
    const words = text.split(' ').filter(x=>x)
    const text2 = words.length < 2 ? text.slice(0,2) : words.slice(0,2).map(x=>x[0].toUpperCase()).join('')
    const text4 = words.length < 2 ? text.slice(0,4) : [words[0].slice(0,1), words[1].slice(0,2)].join(' ')
    const text8 = words.length < 2 ? text.slice(0,8) : [words[0].slice(0,3), words[1].slice(0,4)].join(' ')
    const ret = [...encode(text2,2),...encode(text4,4) ,...encode(text8,8), ...encode(text.slice(0,16),16) , ...encode(text.slice(0,32),32) ]
    return ret

    function encode(text,size) {
      const pad = '                  '.slice(0,Math.ceil((size-text.length)/2))
      const txtChars = charset((pad + text + pad).slice(0,size))
      const floats = Array.from(new Array(Math.ceil(size/2)).keys())
          .map(i => twoCharsToFloat(txtChars[i*2],txtChars[i*2+1]))
      return floats
    }
    function charset(text) {
      return Array.from(text).map(x=>
        x.match(/[a-z]/) ? x[0].charCodeAt(0)-97+1 : 
        x.match(/[A-Z]/) ? x[0].charCodeAt(0)-65+42 : 
        x.match(/[0-9]/) ? x[0].charCodeAt(0)-48+27 : 0)
    }
    function twoCharsToFloat(char1, char2) {
      return char1 * 256 + char2
    }
  }  
})

jb.component('circles', {
  type: 'layer',
  params: [
    {id: 'circleSize', dynamic: true, defaultValue: ({data}) => 10 + 2 * Math.log(data.DIM/data.zoom)}
  ],
  impl: (ctx,circleSizeF) => ({
        fromZoom: 8, toZoom: 8,
        async prepare({gl}) {
          this.pointTexture = await jb.zui.imageToTexture(gl, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAAZiS0dEAAAAAAAA+UO7fwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sHDgwCEMBJZu0AAAAdaVRYdENvbW1lbnQAAAAAAENyZWF0ZWQgd2l0aCBHSU1QZC5lBwAABM5JREFUWMO1V0tPG2cUPZ4Hxh6DazIOrjFNqJs0FIMqWFgWQkatsmvVbtggKlSVRVf5AWz4AWz4AUSKEChll19QJYSXkECuhFxsHjEhxCYm+DWGMZ5HF72DJq4bAzFXurI0M/I5997v3u9cC65vTJVn2lX/xHINQOYSBLTLEuIuCWw4Z3IGAEvf6ASmVHjNzHCXBG4A0AjACsAOwEbO0nsFQBnAGYASAIl+ZRMR7SolMEdsByD09fV5R0ZGgg8ePPjW5/N1iqLYpuu6RZblciKR2I9Go69evnwZnZ+fjwI4IS8AKBIRzeQfJWCANwKwh0KhtrGxsYehUOin1tbW+zzP23ietzY2NnIAoGmaLsuyUiqVyvl8XtrY2NiamZn589mzZxsAUgCOAeQAnFI2tI+VxIjaAeDzoaGh7xYWFuZOTk6OZVk+12uYqqq6JEnn0Wg0OT4+/geAXwGEAdwDIFJQXC1wO4DWR48e/RCPxxclSSroVzRFUbSDg4P848ePFwH8DuAhkWih83TRQWxFOXgAwvDwcOfo6OhvXV1d39tsNtuVBwTDWBwOh1UUxVsMw1hXVlbSdCgNV43uYSvrHg6H24aHh38eHBz85TrgF9FYLHA4HLzH43FvbW2d7u/vG+dANp8FpqIlbd3d3V8Fg8EfBUFw4BONZVmL3+9vHhkZCQL4AoAHgJPK8G+yzC0XDofdoVAo5PP5vkadTBAEtr+/39ff3x8gAp/RPOEqx2qjx+NpvXv3bk9DQ0NDvQgwDIOWlhZrMBj8kgi0UJdxRgYMArzL5XJ7vd57qLPZ7Xamp6fnNgBXtQxcjFuHw+Hyer3t9SYgCAITCAScAJoBNNEY/08GOFVVrfVMv7kMNDntFD1vjIAPrlRN0xjckOm6biFQ3jwNPwDMZrOnqVTqfb3Bi8Wivru7W/VCYkwPlKOjo0IikXh7EwQikYgE4Nw0CfXKDCipVCoTj8df3QABbW1tLUc6oUgkFPMkVACUNjc337148eKvw8PDbJ2jP1taWkoCyNDVXDSECmNSK4qiKNLq6urW8+fPI/UicHx8rD59+jSVy+WOAKSJhKENwFItLtoxk8mwsixzHR0dHe3t7c5PAU+n09rs7OzJkydPYqVSaQfANoDXALIk31S2smU1TWMPDg7K5XKZ7+3t9TudTut1U7+wsFCcmJiIpdPpbQBxADsAknQWymYCOukBHYCuKApisdhpMpnURFEU79y503TVyKenpzOTk5M7e3t7MQKPV0Zv1gNm+awB0MvlshqLxfLb29uyJElWURSbXC4XXyvqxcXFs6mpqeTc3Nzu3t7e3wQcA7BPZ8Cov1pNlJplmQtAG8MwHV6v95tAINA5MDBwPxAIuLu6upr8fr/VAN3c3JQjkcjZ+vp6fnl5+d2bN29SuVzuNYAEpf01CdRChUL+X1VskHACuA3Ay3Fcu9vt7nA6nZ7m5uYWQRCaNE3jVVW15PP580KhIGUymWw2m00DOAJwSP4WwPtq4LX2Ao6USxNlQyS/RcQcdLGwlNIz6vEMAaZpNzCk2Pll94LK/cDYimxERiBwG10sxjgvEZBE0UpE6vxj+0Ct5bTaXthgEhRmja8QWNkkPGsuIpfdjpkK+cZUWTC0KredVmtD/gdlSl6EG4AMvQAAAABJRU5ErkJggg==')
        },
        prepareGPU({ gl, DIM, itemsPositions }) {
            const src = [`attribute vec2 itemPos;
                uniform vec2 zoom;
                uniform vec2 center;
                uniform float circleSize;
            
                void main() {
                  gl_Position = vec4((itemPos - center) / zoom * vec2(2.0,2.0), 0.0, 1.0);
                  gl_PointSize = circleSize;
                }`,
                `precision highp float;
                uniform sampler2D pointTexture;
                uniform vec4 globalColor;
    
                void main() {
                    gl_FragColor = globalColor * texture2D( pointTexture, gl_PointCoord );
                }`
            ]
             
            const vertexArray = new Float32Array(itemsPositions.sparse.flatMap(x=>x.slice(0,2)).map(x=>1.0*x))

            const buffers = {
                vertexBuffer: gl.createBuffer(),
                shaderProgram: jb.zui.buildShaderProgram(gl, src),
                vertexNumComponents: 2,
                vertexCount: vertexArray.length/2,
            }    
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertexBuffer)
            gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW)

            return buffers        
        },
        calcExtraRenderingProps({zoom, DIM}) {
          const circleSize = circleSizeF(ctx.setData({zoom, DIM}))
          return {circleSize}
        },        
        renderGPUFrame({ gl, aspectRatio, zoom, center, circleSize}, { vertexBuffer, shaderProgram, vertexNumComponents, vertexCount }) {
            gl.useProgram(shaderProgram)
          
            gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'zoom'), [zoom, zoom/aspectRatio])
            gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'center'), center)
            gl.uniform1f(gl.getUniformLocation(shaderProgram, 'circleSize'), circleSize)
            gl.uniform4fv(gl.getUniformLocation(shaderProgram, 'globalColor'), [0.1, 0.7, 0.2, 1.0])
          
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
            const itemPos = gl.getAttribLocation(shaderProgram, 'itemPos')
            gl.enableVertexAttribArray(itemPos)
            gl.vertexAttribPointer(itemPos, vertexNumComponents, gl.FLOAT, false, 0, 0)

            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_2D, this.pointTexture)
            gl.uniform1i(gl.getUniformLocation(shaderProgram, 'pointTexture'), 0)

           gl.drawArrays(gl.POINTS, 0, vertexCount)
        }
  })
})

jb.component('summaryLabel', {
  type: 'layer',
  params: [
    {id: 'noOfChars', as: 'number', defaultValue: 16}
  ],
  impl: (ctx, noOfChars) => ({
        fromZoom: 16, toZoom: 8, charSetSize: 64,
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
  })
})