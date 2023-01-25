jb.dsl('zui')

jb.component('nativeCircles', {
  type: 'stage',
  params: [
    
  ],
  impl: ctx => ({
        fromZoom: 1000, toZoom: 8,
        calcItemsPositions({items, pivots, scales, summaryLabel, DIM}, formerStagePositions) {
            const mat = Array(DIM**2)
            initMat()
            repulsion()

            return { mat, sparse: Array.from(Array(DIM**2).keys()).filter(i=>mat[i]).map(i=>
                [Math.floor(i/DIM), i%DIM, scales.greens(pivots.x.scale(mat[i][0])), summaryLabel(mat[i][0]) ]) 
            }

            function initMat() {
                items.forEach(item => {
                    const [x,y] = [Math.floor(DIM*pivots.x.scale(item)), Math.floor(DIM*pivots.y.scale(item))]
                    mat[DIM*x + y] = mat[DIM*x + y] || []
                    mat[DIM*x + y].push(item)
                    //const sortAtt = `scale_${xPivot.att}`
                    //mat[DIM*x + y].sort((i1,i2) => i1[sortAtt] - i2[sortAtt] )
                })
            }
    
            function repulsion() {
                for (let i=0;i<DIM**2;i++)
                    if (mat[i] && mat[i].length > 1)
                        spreadItems(i)
    
                function spreadItems(i) {
                    const items = mat[i]
                    mat[i] = [items.pop()]
                    const [x,y] = [Math.floor(i/DIM),i%DIM]
    
                    for (const [_x,_y,distance] of areaIterator(x,y)) {
                        if (! mat[DIM*_x+ _y]) {
                            mat[DIM*_x+ _y] = [items.pop()]
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
        prepareGPU({ gl, itemsPositions }) {
            const src = [`attribute vec2 aVertexPosition;
                uniform vec2 uScalingFactor;
                uniform vec2 center;
            
                void main() {
                gl_Position = vec4((aVertexPosition - center) * uScalingFactor, 0.0, 1.0);
                gl_PointSize = 5.0;
                }`,
                
                `precision highp float;
                uniform vec4 uGlobalColor;
                
                void main() {
                gl_FragColor = uGlobalColor;
                }`
            ]
    
            const shaderSet = [  {type: gl.VERTEX_SHADER,source: src[0] }, {type: gl.FRAGMENT_SHADER,source: src[1] } ];
          
            const vertexArray = new Float32Array(itemsPositions.sparse.flatMap(x=>x.slice(0,2)).map(x=>1.0*x))
            const buffers = {
                vertexBuffer: gl.createBuffer(),
                shaderProgram: buildShaderProgram(shaderSet),
                vertexNumComponents: 2,
                vertexCount: vertexArray.length/2
            }    
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertexBuffer)
            gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW)

            return buffers
        
            function buildShaderProgram(shaderInfo) {
                const program = gl.createProgram()
              
                shaderInfo.forEach((desc) => {
                  const shader = gl.createShader(desc.type)
                  gl.shaderSource(shader, desc.source)
                  gl.compileShader(shader)
      
                  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {  alert(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`)
                      gl.deleteShader(shader)
                      return null
                  }            
                  if (shader)
                    gl.attachShader(program, shader)
                })
              
                gl.linkProgram(program)
              
                if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                  console.log("Error linking shader program:")
                  console.log(gl.getProgramInfoLog(program))
                }
              
                return program
            }        
        },
        renderGPUFrame({DIM, gl, glCanvas, aspectRatio, buffers, zoom, center}) {
            const { vertexBuffer, shaderProgram, vertexNumComponents, vertexCount } = buffers
    
            gl.viewport(0, 0, glCanvas.width, glCanvas.height)
            gl.clearColor(0.8, 0.9, 1.0, 1.0)
            gl.clear(gl.COLOR_BUFFER_BIT)
          
            gl.useProgram(shaderProgram)
          
            const uScalingFactor = gl.getUniformLocation(shaderProgram, "uScalingFactor")
            const uGlobalColor = gl.getUniformLocation(shaderProgram, "uGlobalColor")
          
            const scale = 1.0/zoom
            gl.uniform2fv(uScalingFactor, [scale, scale*aspectRatio])
            gl.uniform2fv(gl.getUniformLocation(shaderProgram, "center"), center)
            gl.uniform4fv(uGlobalColor, [0.1, 0.7, 0.2, 1.0])
          
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
          
            const aVertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition")
            gl.enableVertexAttribArray(aVertexPosition)
            gl.vertexAttribPointer(aVertexPosition, vertexNumComponents, gl.FLOAT, false, 0, 0)
          
            gl.drawArrays(gl.POINTS, 0, vertexCount)
        }
  })
})