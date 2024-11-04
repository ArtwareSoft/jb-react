dsl('zui')

component('gpuCode', {
  type: 'render_gpu',
  params: [
    {id: 'shaderCode', type: 'shader_code', mandatory: true},
    {id: 'vertexCode', type: 'vertex_code', defaultValue: passAttsValues()},
    {id: 'utils', type: 'gpu_utils[]', as: 'array', description: 'util funcs'},
    {id: 'uniforms', type: 'uniform[]', as: 'array'},
  ],
  impl: (ctx,shaderCode,vertexCode,utils,uniforms) => ({ 
        calc: v => [vertexCode.calc(v), shaderCode.calc(v,utils, uniforms)],
        uniforms
    })
})
  
component('passAttsValues', {
  type: 'vertex_code',
  impl: ctx => ({
    calc: v => jb.zui.vertexShaderCode({
        declarations: v.atts.map(({glType,id}) => `attribute ${glType} _${id};varying ${glType} ${id};`).join('\n'),
        main: v.atts.map(({glType,id}) => `${id} = _${id};`).join('\n')
    })
  })
})

component('colorOfPoint', {
  type: 'shader_code',
  params: [
    {id: 'codeInMain', as: 'string', newLinesInCode: true, byName: true, description: 'can use canvasSize, pos,size, gridSizeInPixels, elemBottomLeftCoord, inElem (offset in elem), rInElem ([0-1])'},
  ],
  impl: (ctx,codeInMain) => ({
    calc: (v,utils, uniforms) => jb.zui.fragementShaderCode({
        declarations: [
          ...v.atts.map(({glType,id}) => `varying ${glType} ${id};`),
          ...uniforms.map(({glType,id}) => `uniform ${glType} ${id};`),
          ...utils.map(x=>x.code)].filter(x=>x).join('\n'),
        main: codeInMain
    })
  })
})

component('redColor', {
  type: 'shader_code',
  impl: colorOfPoint({ codeInMain: 'gl_FragColor = vec4(1.0,0.0,0.0, 1.0);' })
})

component('utils', {
  type: 'gpu_utils',
  params: [
    {id: 'code', as: 'string', newLinesInCode: true},
  ]
})

component('texture', {
  type: 'uniform',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'imageUrl', dynamic: true, mandatory: true},
  ],
  impl: (ctx,id,imageUrl) => ({id, imageUrl, glType: 'sampler2D', glMethod: '1i'})
})

component('Int', {
  type: 'uniform',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'value', dynamic: true, mandatory: true},
  ],
  impl: (ctx,id,val) => ({id, val, glType: 'int', glMethod: '1i'})
})

component('Float', {
  type: 'uniform',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'value', dynamic: true, mandatory: true},
  ],
  impl: (ctx,id,val) => ({id, val, glType: 'float', glMethod: '1f'})
})

component('vec2', {
  type: 'uniform',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'value', dynamic: true, mandatory: true},
  ],
  impl: (ctx,id,val) => ({id, val, glType: 'vec2', glMethod: '2fv'})
})

component('vec3', {
  type: 'uniform',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'value', dynamic: true, mandatory: true},
  ],
  impl: (ctx,id,val) => ({id, val, glType: 'vec3', glMethod: '3fv'})
})


component('float', {
  type: 'uniform',
  params: [
    {id: 'id', as: 'string'},
    {id: 'value', dynamic: true},
  ],
  impl: ctx => ({glType: 'sampler2D', ...ctx.params})
})

component('prop', {
  type: 'fe_view_prop',
  params: [
    {id: 'id', as: 'string'},
    {id: 'val', dynamic: true},
  ]
})

extension('zui','GPU', {
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
        jb.logError('Error linking shader program:', {desc: gl.getProgramInfoLog(program), vtx: sources[0], fgm: sources[1]})
    
      return program
  },

  async imageToTexture(gl, url, group) {
    const isPowerOf2 = value => (value & (value - 1)) === 0
    return new Promise( resolve => {
      const texture = gl.createTexture()
      const image = new Image()
      if (group) group.image = image
      image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
          gl.generateMipmap(gl.TEXTURE_2D)
        } else {
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        }
        resolve(texture)
      }
      image.onerror = () => resolve(texture)
      image.src = url
    })
  },
  allocateSingleTextureUnit({view,cmp}) {
    const lru = cmp.renderCounter
    const freeTexture = cmp.boundTextures.find(rec=>rec.view == view) || cmp.boundTextures.filter(rec => rec.lru != lru).sort((r1,r2) => r1.lru - r2.lru)[0]
    return Object.assign(freeTexture, {lru, view})
  },
  vertexShaderCode: ({declarations,main} = {}) => `attribute vec2 itemPos;
  uniform vec2 zoom;
  uniform vec2 center;
  uniform vec2 canvasSize;
  uniform vec2 gridSizeInPixels;
  uniform vec2 pos;
  uniform vec2 size;
  varying vec2 elemBottomLeftCoord;
  ${declarations||''}

  void main() {
    vec2 elemCenterPx = pos+size/2.0;
    vec2 itemBottomLeftNdc = (itemPos - center) / (0.5*zoom);
    vec2 elemCenterNdc = itemBottomLeftNdc + elemCenterPx/(0.5*canvasSize);
    gl_Position = vec4( elemCenterNdc, 0.0, 1.0);
    vec2 elemBottomLeftOffsetNdc = pos/(0.5*canvasSize);
    vec2 elemBottomLeftNdc = itemBottomLeftNdc + elemBottomLeftOffsetNdc;
    elemBottomLeftCoord = (elemBottomLeftNdc + 1.0) * (0.5*canvasSize);
    gl_PointSize = max(size[0],size[1]) * 1.0;
    //gl_PointSize = max(gridSizeInPixels[0],gridSizeInPixels[1]) * 1.0;
    ${main||''}
  }`,
// Ndc [-1,1] 

  // vertexShaderCode: ({code,main,id} = {}) => `attribute vec2 itemPos${id};
  //   uniform vec2 zoom;
  //   uniform vec2 center;
  //   uniform vec2 canvasSize;
  //   uniform vec2 gridSizeInPixels;
  //   uniform vec2 pos;
  //   uniform vec2 size;
  //   varying vec2 elemTopLeftCoord;
  //   ${code||''}

  //   void main() {
  //     vec2 elemCenter = pos+size/2.0;
  //     vec2 elemCenterOffset = vec2(elemCenter[0],-1.0* elemCenter[1])/canvasSize;
  //     vec2 npos = (itemPos${id} +vec2(-0.5,+0.5) - center) / zoom + elemCenterOffset;
  //     gl_Position = vec4( npos * 2.0, 0.0, 1.0);
  //     elemTopLeftCoord = (npos + 0.5) * canvasSize - size/2.0;
  //     gl_PointSize = max(size[0],size[1]) * 1.0;
  //     ${main||''}
  //   }`,
    fragementShaderCode: ({declarations,main} = {}) => `precision highp float;
    precision highp float;
    uniform vec2 canvasSize;
    uniform vec2 pos;
    uniform vec2 size;
    uniform vec2 gridSizeInPixels;
    varying vec2 elemBottomLeftCoord;
    ${declarations||''}

    void main() {
      vec2 inElem = gl_FragCoord.xy - elemBottomLeftCoord;
      if (inElem[0] >= size[0] || inElem[0] < 0.0 || inElem[1] >= size[1] || inElem[1] < 0.0) {
        //gl_FragColor = vec4(1.0,1.0, 0.0, 1.0);
        return;
      };
      vec2 rInElem = inElem/size;
      //bool isInElem = (rInElem[0] < 0.9 && rInElem[0] > 0.1 && rInElem[1] < 0.9 && rInElem[1] > 0.1 );
      //if (!isInElem) return;
      //gl_FragColor = vec4(rInElem, 0.0, 1.0);
      ${main||''}
    }`
})