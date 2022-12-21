jb.dsl('zui')

jb.component('zui.control', {
  type: 'control<>',
  params: [
    {id: 'style', type: 'style<zui>', defaultValue: {'$': 'gpu', '$byValue': []}, dynamic: true},
    {id: 'features', type: 'feature<>[],feature<zui>[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('gpu', {
    type: 'style<zui>',
    impl: customStyle({
      typeCast: 'style',
      template: ({},{},h) => h('canvas',{width: 600, height: 460}),
      features: [
        frontEnd.requireExternalLibrary(['d3-scale.js','d3-color.js','d3-interpolate.js']),
        frontEnd.init(({},{cmp, el}) => {
            jb.zui.gpu(el, cmp) 
        }),
        frontEnd.flow(
            source.frontEndEvent('wheel'),
            rx.log('zoom'),
            sink.action(({},{cmp, sourceEvent, el}) => {
                const dz = sourceEvent.deltaY > 0 ? 0.9 : sourceEvent.deltaY < 0 ? 1.1 : 1
                const x = sourceEvent.offsetX, y = sourceEvent.offsetY
                const [w,h] = [el.offsetWidth, el.offsetHeight]
                cmp.zoom(dz, {x: x-w/2, y: y-h/2 })
            })
        ),
		frontEnd.flow(
            source.frontEndEvent('pointerdown'),
            rx.log('move start'),
            rx.var('prevPos',obj()),
            rx.flatMap(rx.pipe(
              source.event('pointermove'),
              rx.takeUntil(source.event('pointerup'))
              //rx.takeWhile('%buttons%!=0')
            )),
            rx.log('move'),
            sink.action(({},{cmp, prevPos, sourceEvent}) => {
                  if (prevPos.x != null)
                    cmp.pan(sourceEvent.pageX - prevPos.x, sourceEvent.pageY - prevPos.y)
                  prevPos.x = sourceEvent.pageX
                  prevPos.y = sourceEvent.pageY
            })
        )
    ]
    })
})


jb.extension('zui', {
    initExtension() {
        return { DIM : 215 }
    },
    itemsBox() {
        const DIM = jb.zui.DIM
        const phones = jb.utils.calcVar(new jb.core.jbCtx(),'phones')
        const pricePivot = pivot('price')
        const mat = jb.zui.calcForces(phones, pricePivot, pivot('hits'), pivot('year'))
        return { mat, sparse: Array.from(Array(DIM**2).keys()).filter(i=>mat[i]).map(i=>
            [Math.floor(i/DIM), i%DIM, 
            pricePivot.colorScale(mat[i][0]),
            `${mat[i][0].title} (${mat[i][0].price}, ${mat[i][0].hits})`
        ]) }

        function pivot(att) {
            phones.sort((i1,i2) => i2[att] - i1[att] ).forEach((x,i) => x[`scale_${att}`] = i/phones.length)
            const colorScaleF = jb.frame.d3.interpolateLab('green','white')
            const colorScale = x => colorScaleF(x[`scale_${att}`])
            return { att, scale: x => x[`scale_${att}`], colorScale }
        }            
    },
    calcForces(items,xPivot,yPivot) {
        const DIM = jb.zui.DIM
        const mat = Array(DIM**2)

        initMat()
        repulsion()
        return mat

        function initMat() {
            items.forEach(item => {
                const [x,y] = [Math.floor(DIM*xPivot.scale(item)), Math.floor(DIM*yPivot.scale(item))]
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

        function attraction(centerX, centerY) {
            for(distance=1;true;distance++) {
                const iter = neighbours(centerX, centerY,distance)
                while(!iter.done) {
                    [x,y,w] = iter.next()
                    if (!math[x,y]) { 
                        [x1,y1] = firstNonEmptyAtAngle(w,distance)
                        if (x1 !== null) {
                            math[x,y] = math[x1,y1]
                            math[x1,y1] = null
                        }
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
    gpu(glCanvas,cmp) {
        const src = [`attribute vec2 aVertexPosition;
        uniform vec2 uScalingFactor;
        uniform vec2 uPanFactor;
     
        void main() {
          gl_Position = vec4(uPanFactor + aVertexPosition * uScalingFactor, 0.0, 1.0);
          gl_PointSize = 5.0;
        }`,
        
    `precision highp float;
    uniform vec4 uGlobalColor;
    
    void main() {
      gl_FragColor = uGlobalColor;
    }`
    ]

        const DIM = jb.zui.DIM
        const gl = glCanvas.getContext("webgl")
        const shaderSet = [  {type: gl.VERTEX_SHADER,source: src[0] }, {type: gl.FRAGMENT_SHADER,source: src[1] } ];
      
        const shaderProgram = buildShaderProgram(shaderSet)
      
        let aspectRatio = glCanvas.offsetWidth/glCanvas.offsetHeight
        let currentScale = 1
        let currentPos = [-0.5,-0.5]
        
        const vertexArray = new Float32Array(jb.zui.itemsBox().sparse.flatMap(x=>x.slice(0,2)).map(x=>x/DIM))
        //console.log(vertexArray)

        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);
        
        const vertexNumComponents = 2;
        const vertexCount = vertexArray.length/vertexNumComponents;       
        
        cmp.handleZoomEvent = ({$,p,v,dz}) => {
            if ($ == 'pan') {
                currentPos[0] += v[0]/500
                currentPos[1] -= v[1]/500
            }
            if ($ == 'zoom') {
                const [dx,dy] = [p.x/currentScale,p.y/(currentScale*aspectRatio)]
                currentScale *= dz
                currentPos[0] *= dz
                currentPos[1] *= dz
                console.log(currentScale,dz,dx,dy)
                const [dxl,dyl] = [Math.sign(dx)*Math.log(Math.abs(dx)), Math.sign(dy)*Math.log(Math.abs(dy))]
                currentPos[0] -= Math.sign(dz-1)*currentScale*dxl/(DIM)
                currentPos[1] += Math.sign(dz-1)*currentScale*dyl/(DIM)
                if (currentScale < 1) {
                    currentScale = 1.0
                    currentPos = [-0.5,-0.5]
                }    
            }
            animateScene()
        }
        cmp.zoom = (dz, centerOffset) => {
            const [dx,dy] = [centerOffset.x/currentScale,centerOffset.y/(currentScale*aspectRatio)]
            currentScale *= dz
            currentPos[0] *= dz
            currentPos[1] *= dz
            console.log(currentScale,dz,dx,dy)
            const [dxl,dyl] = [Math.sign(dx)*Math.log(Math.abs(dx)), Math.sign(dy)*Math.log(Math.abs(dy))]
            currentPos[0] -= Math.sign(dz-1)*currentScale*dxl/(DIM)
            currentPos[1] += Math.sign(dz-1)*currentScale*dyl/(DIM)
            if (currentScale < 1) {
                currentScale = 1.0
                currentPos = [-0.5,-0.5]
            }
            animateScene()
        }
        cmp.pan = (dx,dy) => {
            currentPos[0] += dx/500
            currentPos[1] -= dy/500
            animateScene()
        }

        function animateScene() {
          let uScalingFactor, uPanFactor, uGlobalColor, aVertexPosition;

          gl.viewport(0, 0, glCanvas.width, glCanvas.height);
          gl.clearColor(0.8, 0.9, 1.0, 1.0);
          gl.clear(gl.COLOR_BUFFER_BIT);
        
          gl.useProgram(shaderProgram);
        
          uPanFactor = gl.getUniformLocation(shaderProgram, "uPanFactor");
          uScalingFactor = gl.getUniformLocation(shaderProgram, "uScalingFactor");
          uGlobalColor = gl.getUniformLocation(shaderProgram, "uGlobalColor");
        
          gl.uniform2fv(uScalingFactor, [currentScale*1.0, currentScale*aspectRatio]);
          gl.uniform2fv(uPanFactor, currentPos);
          gl.uniform4fv(uGlobalColor, [0.1, 0.7, 0.2, 1.0]);
        
          gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        
          aVertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        
          gl.enableVertexAttribArray(aVertexPosition);
          gl.vertexAttribPointer(aVertexPosition, vertexNumComponents, gl.FLOAT, false, 0, 0);
        
          gl.drawArrays(gl.POINTS, 0, vertexCount);
        
        //   requestAnimationFrame((currentTime) => {
        //     const deltaAngle = ((currentTime - previousTime) / 1000.0) * degreesPerSecond;
        
        //     currentAngle = (currentAngle + deltaAngle) % 360;
        
        //     previousTime = currentTime;
        //     animateScene();
        //   });
        }

        animateScene()

        function buildShaderProgram(shaderInfo) {
            const program = gl.createProgram();
          
            shaderInfo.forEach((desc) => {
              const shader = gl.createShader(desc.type);
              gl.shaderSource(shader, desc.source);
              gl.compileShader(shader);
  
              if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {  alert(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`);
                  gl.deleteShader(shader);
                  return null;
              }            
              if (shader) {
                gl.attachShader(program, shader);
              }
            });
          
            gl.linkProgram(program)
          
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
              console.log("Error linking shader program:");
              console.log(gl.getProgramInfoLog(program));
            }
          
            return program;
        }        
    }
})