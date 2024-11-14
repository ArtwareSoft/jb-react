dsl('zui')

extension('zui','canvas', {
  measureCanvasCtx(font) {
    jb.zui._measureCanvasCtx = jb.zui._measureCanvasCtx || jb.zui.createCanvas(1, 1).getContext("2d")
    jb.zui._measureCanvasCtx.font = font
    return jb.zui._measureCanvasCtx
  },
  createCanvas(...size) {
    return jbHost.isNode ? require('canvas').createCanvas(...size) : new OffscreenCanvas(...size)
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

component('fill', {
  type: 'align_image',
  impl: () => ({fill: true})
})

component('keepProportions', {
  type: 'align_image',
  params: [
    {id: 'alignX', as: 'string', options: 'left,center,right', defaultValue: 'center'},
    {id: 'alignY', as: 'string', options: 'top,center,bottom', defaultValue: 'center'}
  ],
  impl: ctx => ({...ctx.params, keepProportions: true})
})

component('keepSize', {
  type: 'align_image',
  params: [
    {id: 'alignX', as: 'string', options: 'left,center,right', defaultValue: 'center'},
    {id: 'alignY', as: 'string', options: 'top,center,bottom', defaultValue: 'center'}
  ],
  impl: ctx => ({...ctx.params, keepSize: true})
})

component('imageUniforms', {
  type: 'uniform',
  params: [
    {id: 'align', type: 'align_image'}
  ],
  impl: uniforms(
    Int('alignX', Switch(
      Case('%$align/alignX%==left', 0),
      Case('%$align/alignX%==center', 1),
      Case('%$align/alignX%==right', 2)
    )),
    Int('alignY', Switch(
      Case('%$align/alignY%==top', 0),
      Case('%$align/alignY%==center', 1),
      Case('%$align/alignY%==bottom', 2)
    ))
  )
})

component('imageUtils', {
  description: `Align image of a known size into a larger box. Provides two GL functions: effectiveSize() and inImagePx() 
    using vec2 size, vec2 imageSize, vec2 inElemPx, and the int uniforms alignX and alignY`,
  type: 'gpu_utils',
  params: [
    { id: 'align', type: 'align_image' },
    { id: 'getTexturePixelFunc', as: 'string' },
  ],
  impl: utils(({}, {}, { align, getTexturePixelFunc }) =>
    ['vec2 flipH(vec2 pos) { return vec2(pos[0],1.0-pos[1]); }'
    ,getTexturePixelFunc
    ,(align.fill ? `
      vec2 effectiveSize() { return size; }
      vec2 inImagePx(vec2 effSize, vec2 inElem) { return inElem; }
    `
    : align.keepProportions ? `
      vec2 effectiveSize() { 
        float aspectRatioImage = imageSize[0] / imageSize[1];
        float aspectRatioBox = size[0] / size[1];
        if (aspectRatioImage > aspectRatioBox) {
          return vec2(size[0], size[0] / aspectRatioImage); // width-based scaling
        } else {
          return vec2(size[1] * aspectRatioImage, size[1]); // height-based scaling
        }
      }

      vec2 inImagePx(vec2 effSize, vec2 inElem) {
        float offsetX;
        if (alignX == 0) {
          offsetX = 0.0;
        } else if (alignX == 1) {
          offsetX = 0.5 * (size[0] - effSize[0]);
        } else {
          offsetX = size[0] - effSize[0];
        }

        float offsetY;
        if (alignY == 0) {
          offsetY = 0.0;
        } else if (alignY == 1) {
          offsetY = 0.5 * (size[1] - effSize[1]);
        } else {
          offsetY = size[1] - effSize[1];
        }
        
        // Transform inElem to image coordinates
        return (inElem - vec2(offsetX, offsetY)) * (imageSize / effSize);
      }
    `
    : align.keepSize ? `
      vec2 effectiveSize() { return imageSize; }
      
      vec2 inImagePx(vec2 effSize, vec2 inElem) { 
        // Calculate offset based on alignX and alignY
        float offsetX;
        if (alignX == 0) {
          offsetX = 0.0;
        } else if (alignX == 1) {
          offsetX = 0.5 * (size[0] - imageSize[0]);
        } else {
          offsetX = size[0] - imageSize[0];
        }

        float offsetY;
        if (alignY == 0) {
          offsetY = 0.0;
        } else if (alignY == 1) {
          offsetY = 0.5 * (size[1] - imageSize[1]);
        } else {
          offsetY = size[1] - imageSize[1];
        }
        
        // Apply the alignment offset directly
        return inElem - vec2(offsetX, offsetY);
      }
    ` : '')].join('\n')
  )
})

component('imageColorOfPoint', {
  type: 'shader_code',
  impl: colorOfPoint(`
  vec2 effSize = effectiveSize();
  vec2 inImage = inImagePx(effSize, inElem);
  
  if (inImage[0] < 0.0 || inImage[0] >= effSize[0] || inImage[1] < 0.0 || inImage[1] >= effSize[1]) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    return;
  }
  
  vec2 rInImage = inImage / effSize;
  gl_FragColor = getTexturePixel((imagePos + flipH(rInImage) * imageSize) / atlasSize);
`)
})
