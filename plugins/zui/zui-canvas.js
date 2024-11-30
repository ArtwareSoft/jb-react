dsl('zui')

extension('zui','canvas', {
  measureCanvasCtx(font) {
    const mCtx = jb.zui._measureCanvasCtx = jb.zui._measureCanvasCtx || jb.zui.createCanvas(1, 1).getContext('2d')
    mCtx.font = font; mCtx.textBaseline = 'top'; mCtx.textAlign = 'left'; mCtx.fillStyle = 'black'
    return jb.zui._measureCanvasCtx
  },
  createCanvas(...size) {
    return jbHost.isNode ? require('canvas').createCanvas(...size) : new OffscreenCanvas(...size)
  },
  canvasToPackedBW(canvasCtx, width, height) {
    const imageData = canvasCtx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Step 3: Pack into 1-bit-per-pixel format
    const packedData = new Uint8Array(Math.ceil((width * height) / 8));
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4; // Position in RGBA array
            const gray = (data[i] + data[i + 1] + data[i + 2]) / 3; // Average to grayscale

            const bitPosition = y * width + x;
            const byteIndex = Math.floor(bitPosition / 8);
            const bitIndex = 7 - (bitPosition % 8); // Pack bits from left to right

            // For black text, invert the logic: black pixels (text) set the bit to 1
            if (gray < 128) { // Black pixel (text)
                packedData[byteIndex] |= (1 << bitIndex);
            }
        }
    }
    return packedData
  },
  async canvasToDataUrl(canvas) {
    if (jbHost.isNode) {
      const buffer = canvas.toBuffer('image/png')
      const base64 = buffer.toString('base64')
      return `data:image/png;base64,${base64}`
    } else {
        const blob = await canvas.convertToBlob()
        const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result)
            reader.onerror = reject
            reader.readAsDataURL(blob)
        })
        return dataUrl
    }
  },
  createGl(canvasSize,{ offscreen,canvas } = {}) {
    const glParams = { alpha: true, premultipliedAlpha: true }
    return jbHost.isNode ? require('gl')(...canvasSize, glParams)
      : offscreen ? new OffscreenCanvas(...canvasSize).getContext('webgl', glParams)
      : canvas.getContext('webgl', glParams)
  }
})

component('dim10x16', {
  type: 'font_dimention',
  impl: () => [10,16]
})

component('zui.fontDimention', {
  params: [
    {id: 'font', as: 'string', defaultValue: '500 16px Arial'},
  ],
  impl: (ctx,font) => {
      const text = 'Hello World'
      const avgMetrics = jb.zui.measureCanvasCtx(font).measureText(text)
      const maxMetrics = jb.zui.measureCanvasCtx(font).measureText('M')
      const height = avgMetrics.actualBoundingBoxAscent + avgMetrics.actualBoundingBoxDescent
    
      const ret = [maxMetrics.width, height+3].map(x=>Math.ceil(x))
      ret.avgWidth = avgMetrics.width/text.length
      return ret
  }
})

component('zui.imageOfText', {
  params: [
    {id: 'text', as: 'string', mandatory: true},
    {id: 'font', as: 'string', defaultValue: '500 16px Arial'},
    {id: 'padding', as: 'array', defaultValue: [10,20], description: '1,2, or 4 values, top right bottom left'}
  ],
  impl: async (ctx,text, font, pd) => {
    const padding = pd.length == 0 ? [0,0,0,0] 
      : pd.length == 1 ? [pd[0],pd[0],pd[0],pd[0]]
      : pd.length == 2 ? [pd[0],pd[1],pd[0],pd[1]]
      : pd.length == 4 ? pd : [0,0,0,0]
    const metrics = jb.zui.measureCanvasCtx(font).measureText(text)
    const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
    const size = [metrics.width + (padding[1] || 0) + (padding[3] || 0), height + (padding[0] || 0) + (padding[2] || 0)].map(x => Math.ceil(x))

    const canvas = jb.zui.createCanvas(...size)
    const ctx2d = canvas.getContext('2d')
    ctx2d.font = font
    ctx2d.textBaseline = 'top'
    ctx2d.textAlign = 'left'
    ctx2d.fillStyle = 'black'
    ctx2d.fillText(text, padding[3] || 0, padding[0] || 0)

    const value = await jb.zui.canvasToDataUrl(canvas)
    return { value, size }
  }
})

component('fill', {
  type: 'align_image',
  impl: () => [2,0,0]
})

component('keepProportions', {
  type: 'align_image',
  params: [
    {id: 'alignX', as: 'string', options: 'left,center,right', defaultValue: 'center'},
    {id: 'alignY', as: 'string', options: 'top,center,bottom', defaultValue: 'center'}
  ],
  impl: (ctx,alignX,alignY) => [1,['left','center','right'].indexOf(alignX), ['top','center','bottom'].indexOf(alignY)]
})

component('keepSize', {
  type: 'align_image',
  params: [
    {id: 'alignX', as: 'string', options: 'left,center,right', defaultValue: 'center'},
    {id: 'alignY', as: 'string', options: 'top,center,bottom', defaultValue: 'center'}
  ],
  impl: (ctx,alignX,alignY) => [0,['left','center','right'].indexOf(alignX), ['top','center','bottom'].indexOf(alignY)]
})

component('alignUtils', {
  description: 'Align image of a known size into a larger box. Provides two GL functions: effectiveSize() and inImagePx() \n    using vec2 size, vec2 imageSize, vec2 inElemPx, and the vec3 uniform [type: [keepSize,keepProportions,fill], alignX: [0,1,2] , alignY: [0,1,2]]',
  type: 'gpu_utils',
  impl: utils(`   
    vec2 effectiveSize(vec3 align, vec2 outerSize, vec2 imageSize) {
        if (align[0] == 0.0) { return imageSize; }
        if (align[0] == 2.0) { return outerSize; }

        float aspectRatioImage = imageSize[0] / imageSize[1];
        float aspectRatioBox = outerSize[0] / outerSize[1];
        if (aspectRatioImage > aspectRatioBox) {
          return vec2(outerSize[0], outerSize[0] / aspectRatioImage); // width-based scaling
        } else {
          return vec2(outerSize[1] * aspectRatioImage, outerSize[1]); // height-based scaling
        }
      }
      vec2 inImagePx(vec3 align, vec2 outerSize, vec2 imageSize, vec2 effSize, vec2 inElem) { 
        if (align[0] == 2.0) { return inElem; }
        float alignX = align[1];
        float alignY = align[2];
        float offsetX;
        float offsetY;

        if (align[0] == 0.0) {
          if (alignX == 0.0) {
            offsetX = 0.0;
          } else if (alignX == 1.0) {
            offsetX = 0.5 * (outerSize[0] - imageSize[0]);
          } else {
            offsetX = outerSize[0] - imageSize[0];
          }
  
          if (alignY == 0.0) {
            offsetY = 0.0;
          } else if (alignY == 1.0) {
            offsetY = 0.5 * (outerSize[1] - imageSize[1]);
          } else {
            offsetY = outerSize[1] - imageSize[1];
          }
          
          // Apply the alignment offset directly
          return inElem - vec2(offsetX, offsetY);          
        }
        if (align[0] == 1.0) {
          if (alignX == 0.0) {
            offsetX = 0.0;
          } else if (alignX == 1.0) {
            offsetX = 0.5 * (outerSize[0] - effSize[0]);
          } else {
            offsetX = outerSize[0] - effSize[0];
          }
  
          if (alignY == 0.0) {
            offsetY = 0.0;
          } else if (alignY == 1.0) {
            offsetY = 0.5 * (outerSize[1] - effSize[1]);
          } else {
            offsetY = outerSize[1] - effSize[1];
          }
          
          // Transform inElem to image coordinates
          return (inElem - vec2(offsetX, offsetY)) * (imageSize / effSize);  
        }
      }
    `)
})

component('imageColorOfPoint', {
  type: 'shader_code',
  params: [
    {id: 'getTexturePixel', as: 'string', newLinesInCode: true, description: 'e.g. texture2D(atlas, texCoord)'}
  ],
  impl: colorOfPoint({
    codeInMain: `
  vec2 effSize = effectiveSize(align, size, imageSize);
  vec2 inImage = inImagePx(align, size, imageSize, effSize, inElem);
  
  if (inImage[0] < 0.0 || inImage[0] >= effSize[0] || inImage[1] < 0.0 || inImage[1] >= effSize[1]) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    return;
  }
  
  vec2 rInImage = inImage / effSize;
  gl_FragColor = getTexturePixel((imagePos + rInImage * imageSize) / atlasSize);
`,
    getTexturePixel: '%$getTexturePixel%'
  })
})

component('imageColorOfPointOld', {
  type: 'shader_code',
  impl: colorOfPoint(`
  vec2 effSize = effectiveSize();
  vec2 inImage = inImagePx(effSize, inElem);
  
  if (inImage[0] < 0.0 || inImage[0] >= effSize[0] || inImage[1] < 0.0 || inImage[1] >= effSize[1]) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    return;
  }
  
  vec2 rInImage = inImage / effSize;
  gl_FragColor = getTexturePixel((imagePos + rInImage * imageSize) / atlasSize);
`)
})

component('zui.glLimits', {
  impl: ctx => {
    const gl = ctx.vars.cmp.gl
    return { glLimits : { 
      EXT_disjoint_timer_query: gl.getExtension('EXT_disjoint_timer_query'),
      MAX_COMBINED_TEXTURE_IMAGE_UNITS: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS), 
      MAX_TEXTURE_SIZE: gl.getParameter(gl.MAX_TEXTURE_SIZE)} 
    }
  }
})