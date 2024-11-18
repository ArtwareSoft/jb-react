dsl('zui')

component('gpuCode', {
  type: 'render_gpu',
  params: [
    {id: 'shaderCode', type: 'shader_code', mandatory: true, byName: true},
    {id: 'varyings', type: 'gpu_varying[]', as: 'array'},
    {id: 'utils', type: 'gpu_utils[]', as: 'array', description: 'util funcs'},
    {id: 'uniforms', type: 'uniform[]', as: 'array'},
    {id: 'zoomDependentUniforms', type: 'uniform[]', as: 'array'},
    {id: 'vertexCode', type: 'vertex_code', defaultValue: passAttsValues()},
  ],
  impl: (ctx,shaderCode,varyings,utils,uniforms,zoomDependentUniforms,vertexCode) => {
    const all_uniforms = [...uniforms,...zoomDependentUniforms].flatMap(x=>x)
    return { 
        calc: v => ({
          glCode: [vertexCode.calc(v,all_uniforms,varyings), shaderCode.calc(v,utils, all_uniforms,varyings)],
          uniforms: jb.objFromEntries([
            ...uniforms.flatMap(x=>x).map(uniform=>[uniform.id, {...uniform, value: uniform.val(ctx) }]),
            ...zoomDependentUniforms.flatMap(x=>x).map(uniform=>[uniform.id, {...uniform }]),
          ])
        }),
        calc_fe: () => ({ zoomDependentUniforms: zoomDependentUniforms.flatMap(x=>x) })
    }
  }
})
  
component('passAttsValues', {
  type: 'vertex_code',
  impl: ctx => ({
    calc: (v,uniforms,varyings) => jb.zui.vertexShaderCode({
        declarations: [
          ...uniforms.map(({glType,id,vecSize}) => `uniform ${glType} ${id}${vecSize ? `[${vecSize}]` : ''};`),
          ...varyings.map(({glType,id}) => `varying ${glType} ${id};`),
          ...v.atts.map(({glType,id}) => `attribute ${glType} _${id};varying ${glType} ${id};`)
        ].join('\n'),
        main: [
          ...v.atts.map(({glType,id}) => `${id} = _${id};`),
          ...varyings.map(({id,glCode}) => `${id} = ${glCode};`),
        ].join('\n')
    })
  })
})

component('colorOfPoint', {
  type: 'shader_code',
  params: [
    {id: 'codeInMain', as: 'string', newLinesInCode: true, description: 'can use canvasSize, pos,size, itemViewSize, elemBottomLeftCoord, inElem (offset in elem), rInElem ([0-1])'},
    {id: 'getTexturePixel', as: 'string', newLinesInCode: true, description: 'e.g. texture2D(atlas, texCoord)'}
  ],
  impl: (ctx,codeInMain,getTexturePixel) => ({
    calc: (v,utils, uniforms,varyings) => jb.zui.fragementShaderCode({
        declarations: [
          ...v.atts.map(({glType,id}) => `varying ${glType} ${id};`),
          ...uniforms.map(({glType,id,vecSize}) => `uniform ${glType} ${id}${vecSize ? `[${vecSize}]` : ''};`),
          ...varyings.map(({glType,id}) => `varying ${glType} ${id};`),
          getTexturePixel ? `vec4 getTexturePixel(vec2 texCoord) { return ${getTexturePixel};}` : '',
          ...utils.map(x=>x.code())].filter(x=>x).join('\n'),
        main: codeInMain
    })
  })
})

component('red', {
  type: 'shader_code',
  impl: colorOfPoint({ codeInMain: 'gl_FragColor = vec4(1.0,0.0,0.0, 1.0);' })
})

component('utils', {
  type: 'gpu_utils',
  params: [
    {id: 'code', as: 'string', dynamic: true, newLinesInCode: true},
  ]
})

component('varying', {
  type: 'gpu_varying',
  macroByValue: true,
  params: [
    {id: 'glType', as: 'string', mandatory: true},
    {id: 'id', as: 'string', mandatory: true},
    {id: 'glCode', mandatory: true}
  ]
})

component('uniforms', {
  type: 'uniform',
  params: [
    {id: 'uniforms', type: 'uniform[]', composite: true},
  ],
  impl: (ctx,uniforms) => uniforms
})

component('texture', {
  type: 'uniform',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'imageUrl', dynamic: true, mandatory: true}
  ],
  impl: (ctx,id,imageUrl) => ({id, glType: 'sampler2D', glMethod: '1i', val: imageUrl})
})

component('intVec', {
  type: 'uniform',
  macroByValue: true,
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'size', as: 'number', mandatory: true},
    {id: 'val', dynamic: true, mandatory: true},
  ],
  impl: (ctx,id,size,val) => ({id, val, glType: 'int', glMethod: '1iv', vecSize: size})
})

component('vec3Vec', {
  type: 'uniform',
  macroByValue: true,
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'size', as: 'number', mandatory: true},
    {id: 'val', dynamic: true, mandatory: true},
  ],
  impl: (ctx,id,size,val) => ({id, val, glType: 'vec3', glMethod: '3fv', vecSize: size})
})

component('int', {
  type: 'uniform',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'val', dynamic: true, mandatory: true},
  ],
  impl: (ctx,id,val) => ({id, val, glType: 'int', glMethod: '1i'})
})

component('float', {
  type: 'uniform',
  params: [
    {id: 'id', as: 'string'},
    {id: 'val', dynamic: true},
  ],
  impl: (ctx,id,val) => ({id, val, glType: 'float', glMethod: '1f'})
})

component('vec2', {
  type: 'uniform',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'val', dynamic: true, mandatory: true},
  ],
  impl: (ctx,id,val) => ({id, val, glType: 'vec2', glMethod: '2fv'})
})

component('vec3', {
  type: 'uniform',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'val', dynamic: true, mandatory: true},
  ],
  impl: (ctx,id,val) => ({id, val, glType: 'vec3', glMethod: '3fv'})
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

  async imageToTexture(gl, url) {
    const isPowerOf2 = value => (value & (value - 1)) === 0
    return new Promise( resolve => {
      const texture = gl.createTexture()
      const image = new Image()
      image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
        texture.width = image.width
        texture.height = image.height
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
  allocateSingleTextureUnit({view,uniformId, cmp}) {
    const lru = cmp.renderCounter
    const freeTexture = cmp.boundTextures.find(rec=>rec.view == view && rec.uniformId == uniformId) || cmp.boundTextures.filter(rec => rec.lru != lru).sort((r1,r2) => r1.lru - r2.lru)[0]
    return Object.assign(freeTexture, {lru,uniformId,view})
  },
  vertexShaderCode: ({declarations,main} = {}) => `attribute vec2 itemPos;
  uniform vec2 zoom;
  uniform vec2 center;
  uniform vec2 canvasSize;
  uniform vec2 itemViewSize;
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
    //gl_PointSize = max(size[0],size[1]) * 1.0;
    gl_PointSize = max(itemViewSize[0],itemViewSize[1]) * 1.0;
    ${main||''}
  }`,
    fragementShaderCode: ({declarations,main} = {}) => `precision highp float;
    precision highp float;
    uniform vec2 canvasSize;
    uniform vec2 pos;
    uniform vec2 size;
    uniform vec2 itemViewSize;
    varying vec2 elemBottomLeftCoord;
    ${declarations||''}

    void main() {
      vec2 inElem = gl_FragCoord.xy - elemBottomLeftCoord;
      if (inElem[0] >= size[0] || inElem[0] < 0.0 || inElem[1] >= size[1] || inElem[1] < 0.0) {
        gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0); 
        return;
      };
      vec2 rInElem = inElem/size;
      //bool isInElem = (rInElem[0] < 0.9 && rInElem[0] > 0.1 && rInElem[1] < 0.9 && rInElem[1] > 0.1 );
      //if (!isInElem) return;
      //gl_FragColor = vec4(rInElem, 0.0, 1.0);
      ${main||''}
    }`
})