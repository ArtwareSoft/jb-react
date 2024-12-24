dsl('zui')

component('showTouchPointers', {
  type: 'control',
  impl: ctx => ({
    renderGPUFrame({ gl, glCanvas, canvasSize, cmp, ctx }) {
      const vertexArray = new Float32Array(cmp.pointers.flatMap(p=>[...pointTo01(p.p), ...(p.p || [0,0]) ]).map(x=>1.0*x))
      const key = vertexArray.join(',')
      if (key == cmp.lastShowTouchPointersKey) return
      cmp.lastShowTouchPointersKey = key

      const src = [`attribute vec4 pointersPos;
          uniform vec2 canvasSize;
          varying vec2 coord;

          void main() {
            gl_Position = vec4( pointersPos.xy * 2.0 - 1.0, 0.0, 1.0);
            coord = vec2(pointersPos[2],canvasSize[1] - pointersPos[3]) ;
            gl_PointSize = 100.0;
          }`,
          `precision highp float;
          varying vec2 coord;
          uniform vec2 canvasSize;
          void main() {
            vec2 r = abs(gl_FragCoord.xy - coord) / 100.0;
            float distance = sqrt(r[0]*r[0] + r[1]*r[1]);
            if (distance < 0.5)
              gl_FragColor = vec4(distance,0.0, 0.0, 0.2);
          }`
      ];

      const shaderProgram = cmp.shaderProgramForTouchPointers = cmp.shaderProgramForTouchPointers || jb.zui.buildShaderProgram(gl, src)
      gl.useProgram(shaderProgram)

      const vertexBuffer = gl.createBuffer()
      const vertexNumComponents = 4
      const vertexCount = vertexArray.length/vertexNumComponents
      if (vertexCount == 0) return

      gl.uniform2fv(gl.getUniformLocation(shaderProgram, 'canvasSize'), canvasSize)

      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW)
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
      const itemPos = gl.getAttribLocation(shaderProgram, 'pointersPos')
      gl.enableVertexAttribArray(itemPos)
      gl.vertexAttribPointer(itemPos, vertexNumComponents, gl.FLOAT, false, 0, 0)

      gl.drawArrays(gl.POINTS, 0, vertexCount)

      function pointTo01(p) {
        if (!p) return [0,0]
        return [p[0]/canvasSize[0], 1-p[1]/canvasSize[1]]
      }
    }
  })
})