
jb.extension('zui','FE-utils', {
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
        if (this.pointers.length > 2) {
            jb.logError('zui more than 2 pointers', {pointers: this.pointers})
            this.pointers = this.pointers.slice(-2)
        }
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
        const factor = jb.ui.isMobile() ? 1.2 : 3
        if (dz)
          props.zoom *= dz**factor
        if (dp)
          props.center = [props.center[0] - dp[0]/w*props.zoom, props.center[1] + dp[1]/h*props.zoom]

        props.zoom = Math.max(props.ZOOM_LIMIT[0],Math.min(props.zoom, props.ZOOM_LIMIT[1]))

        jb.log('zui event',{dz, dp, zoom: props.zoom, center: props.center, cmp})
      },
      pointers: [],
      findPointer(pid) { return this.pointers.find(x=>x.pid == pid) },
      removeOldPointers() {
        const now = new Date().getTime()
        this.pointers = this.pointers.filter(pointer => now - pointer.time < 2000)
      },
      addPointer(pid) { 
        if (this.findPointer(pid))
          return jb.logError('zui pointer already exists', {pid})
        if (this.pointers.length > 1)
          this.removeOldPointers()
        if (this.pointers.length > 1)
          return jb.logError('zui pointer tring to add thirs pointer', {pid})

        this.pointers.push({pid})
      },
      removePointer(pid) {
        console.log('removePointer',pid,this.pointers)
        const found = this.pointers.findIndex(x=>x.pid == pid)
        console.log(found)
        if (found != -1)
          this.pointers.splice(found, 1)
      } ,
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
  vertexShaderCode: ({code,main,id} = {}) => `attribute vec2 itemPos${id};
    uniform vec2 zoom;
    uniform vec2 center;
    uniform vec2 canvasSize;
    uniform vec2 gridSizeInPixels;
    uniform vec2 pos;
    uniform vec2 size;
    varying vec2 elemTopLeftCoord;
    ${code||''}

    void main() {
      vec2 elemCenter = pos+size/2.0;
      vec2 elemCenterOffset = vec2(elemCenter[0],-1.0* elemCenter[1])/canvasSize;
      vec2 npos = (itemPos${id} +vec2(-0.5,+0.5) - center) / zoom + elemCenterOffset;
      gl_Position = vec4( npos * 2.0, 0.0, 1.0);
      elemTopLeftCoord = (npos + 0.5) * canvasSize - size/2.0;
      gl_PointSize = max(size[0],size[1]) * 1.0;
      ${main||''}
    }`,
    fragementShaderCode: ({code,main} = {}) => `precision highp float;
    precision highp float;
    uniform vec2 canvasSize;
    uniform vec2 pos;
    uniform vec2 size;
    uniform vec2 gridSizeInPixels;
    varying vec2 elemTopLeftCoord;
    ${code||''}

    void main() {
      vec2 inElem = gl_FragCoord.xy - elemTopLeftCoord;
      if (inElem[0] >= size[0] || inElem[0] < 0.0 || inElem[1] >= size[1] || inElem[1] < 0.0) return;
      vec2 rInElem = inElem/size;
      //bool isInElem = (rInElem[0] < 0.9 && rInElem[0] > 0.1 && rInElem[1] < 0.9 && rInElem[1] > 0.1 );
      //if (!isInElem) return;
      //gl_FragColor = vec4(rInElem, 0.0, 1.0);
      ${main||''}
    }`
})

jb.extension('zui','itemPositions', {
  calcItemsPositions({items, pivots, DIM}) {
    const mat = Array(DIM**2)
    items.forEach(item => {
      const [x,y] = [Math.floor(DIM*pivots.x.scale(item)*pivots.x.spaceFactor), Math.floor(DIM*pivots.y.scale(item)*pivots.y.spaceFactor)]
      mat[DIM*y + x] = mat[DIM*y + x] || []
      mat[DIM*y + x].push(item)
    })      
    repulsion()

    return { mat, sparse: Array.from(Array(DIM**2).keys()).filter(i=>mat[i]).map(i=>
        [mat[i][0], i%DIM, Math.floor(i/DIM)] ) } //, scales.greens(pivots.x.scale(mat[i][0])) ])   }

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