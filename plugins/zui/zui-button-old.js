dsl('zui')

component('button1', {
  type: 'control',
  params: [
    { id: 'title', mandatory: true, templateValue: 'click me', dynamic: true },
    { id: 'action', type: 'action<>', mandatory: true, dynamic: true },
    { id: 'fixedPos', mandatory: true, as: 'array', defaultValue: [10, 10] },
    { id: 'font', as: 'string', defaultValue: '500 16px Arial' },
    { id: 'opacity', as: 'number', defaultValue: 1.0 },
  ],
  impl: (ctx, title, action, fixedPos, font, opacity) => ({
    async init({ gl, canvasSize, glCanvas, cmp }) {
      const text = title()
      const metrics = jb.zui.measureCanvasCtx(font).measureText(text)
      const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
      const size = this.size = [metrics.width + 20, height + 10].map(x => Math.ceil(x))

      // Create button texture
      const canvas = jb.zui.createCanvas(...size)
      const ctx2d = canvas.getContext('2d')
      ctx2d.font = font
      ctx2d.textBaseline = 'top'
      ctx2d.textAlign = 'center'
      ctx2d.fillStyle = 'white'
      ctx2d.fillRect(0, 0, ...size) // Background
      ctx2d.fillStyle = 'black'
      ctx2d.fillText(text, size[0] / 2, 5) // Text in the center

      const url = await jb.zui.canvasToDataUrl(canvas)
      this.texture = await jb.zui.imageToTexture(gl, url)

      // Build shader program
      const vertexShader = `
        attribute vec2 quadPos;
        uniform vec2 canvasSize;
        uniform vec2 buttonPos;
        uniform vec2 buttonSize;
        uniform float clickEffect;
        void main() {
          vec2 normalizedPos = (buttonPos + quadPos * buttonSize) / canvasSize * 2.0 - 1.0;
          gl_Position = vec4(normalizedPos, 0.0, 1.0);
        }
      `
      const fragmentShader = `
      precision highp float;

      uniform sampler2D buttonTexture; // The texture containing button text
      uniform vec2 buttonPos;          // Top-left corner of the button in screen space
      uniform vec2 buttonSize;         // Size of the button in screen space
      uniform float roundCornerSize;   // Radius of the rounded corners
      uniform float opacity;           // Button opacity
      uniform float clickEffect;       // Click effect intensity (0.0 = normal, 1.0 = full effect)
      
      void main() {
        // Calculate the fragment position relative to the button
        vec2 fragPos = gl_FragCoord.xy - buttonPos;
      
        // Apply click effect: shrink the button slightly
        vec2 adjustedButtonSize = buttonSize * (1.0 - 0.1 * clickEffect);
        vec2 adjustedButtonPos = buttonPos + (buttonSize - adjustedButtonSize) / 2.0;
        fragPos = gl_FragCoord.xy - adjustedButtonPos;
      
        // Check if the fragment is outside the adjusted button bounds
        if (fragPos.x < 0.0 || fragPos.x > adjustedButtonSize.x || fragPos.y < 0.0 || fragPos.y > adjustedButtonSize.y) {
          discard; // Outside the button
        }
      
        // Control points for each corner (adjusted for click effect)
        vec2 topLeft = vec2(roundCornerSize, roundCornerSize);
        vec2 topRight = vec2(adjustedButtonSize.x - roundCornerSize, roundCornerSize);
        vec2 bottomLeft = vec2(roundCornerSize, adjustedButtonSize.y - roundCornerSize);
        vec2 bottomRight = vec2(adjustedButtonSize.x - roundCornerSize, adjustedButtonSize.y - roundCornerSize);
      
        // Calculate the distance to each corner control point
        float distTopLeft = length(fragPos - topLeft);
        float distTopRight = length(fragPos - topRight);
        float distBottomLeft = length(fragPos - bottomLeft);
        float distBottomRight = length(fragPos - bottomRight);
      
        // Discard fragments outside the rounded corners
        if (fragPos.x < roundCornerSize && fragPos.y < roundCornerSize && distTopLeft > roundCornerSize) {
          discard;
        }
        if (fragPos.x > adjustedButtonSize.x - roundCornerSize && fragPos.y < roundCornerSize && distTopRight > roundCornerSize) {
          discard;
        }
        if (fragPos.x < roundCornerSize && fragPos.y > adjustedButtonSize.y - roundCornerSize && distBottomLeft > roundCornerSize) {
          discard;
        }
        if (fragPos.x > adjustedButtonSize.x - roundCornerSize && fragPos.y > adjustedButtonSize.y - roundCornerSize && distBottomRight > roundCornerSize) {
          discard;
        }
      
        // Render the background with a click darkening effect
        vec3 backgroundColor = vec3(0.9, 0.9, 0.9) * (1.0 - 0.2 * clickEffect); // Darker when clicked
        vec4 baseColor = vec4(backgroundColor, opacity);
      
        // Map fragment position to normalized texture coordinates
        vec2 normalizedPos = fragPos / adjustedButtonSize;
      
        // Sample the texture for the text
        vec4 textColor = texture2D(buttonTexture, vec2(normalizedPos.x, 1.0 - normalizedPos.y)); // Flip vertically
      
        // Blend the text color with the background
        if (textColor.rgb == vec3(1.0)) {
          // If the texture pixel is white, use the background color
          gl_FragColor = baseColor;
        } else {
          // Otherwise, use the text color
          gl_FragColor = vec4(textColor.rgb * (1.0 - 0.2 * clickEffect), opacity); // Darker text when clicked
        }
      }
      
            `
      this.shaderProgram = jb.zui.buildShaderProgram(gl, [vertexShader, fragmentShader])
      this.clickEffect = 0

      glCanvas.addEventListener('pointerdown', () => {
        this.clickEffect = 1.0
        cmp.renderRequest = true
        setTimeout(() => {
          this.clickEffect = 0
          cmp.renderRequest = true
          action(ctx)
        }, 100)
      })
    },

    renderGPUFrame({ gl, canvasSize }) {
      const { shaderProgram, texture, size, clickEffect } = this

      // Use the shader program
      gl.useProgram(shaderProgram)

      // Define quad vertex data (normalized coordinates [0, 1])
      const vertices = new Float32Array([
        0, 0,  // Bottom-left
        1, 0,  // Bottom-right
        0, 1,  // Top-left
        1, 1   // Top-right
      ])

      // Create and bind the vertex buffer
      const vertexBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

      // Link the vertex data to the shader attribute
      const quadPosLocation = gl.getAttribLocation(shaderProgram, 'quadPos')
      gl.enableVertexAttribArray(quadPosLocation)
      gl.vertexAttribPointer(quadPosLocation, 2, gl.FLOAT, false, 0, 0)

      // Bind the texture
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.uniform1i(gl.getUniformLocation(shaderProgram, 'buttonTexture'), 0)

      // Pass uniforms to the shader
      gl.uniform2f(gl.getUniformLocation(shaderProgram, 'canvasSize'), ...canvasSize)
      gl.uniform2f(gl.getUniformLocation(shaderProgram, 'buttonPos'), fixedPos[0], canvasSize[1] - fixedPos[1] - size[1])
      gl.uniform2f(gl.getUniformLocation(shaderProgram, 'buttonSize'), ...size)
      gl.uniform1f(gl.getUniformLocation(shaderProgram, 'opacity'), opacity)
      gl.uniform1f(gl.getUniformLocation(shaderProgram, 'clickEffect'), clickEffect || 0)
      gl.uniform1f(gl.getUniformLocation(shaderProgram, 'roundCornerSize'), 10)
      
      // Draw the quad
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
  })
})
