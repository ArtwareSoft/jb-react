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

  vertexShaderCode: ({declarations,main} = {}) => `precision highp float;
  precision mediump int;

  attribute vec2 itemPos;
  uniform vec2 zoom;
  uniform vec2 center;
  uniform vec2 canvasSize;
  uniform vec2 itemViewSize;
  uniform vec2 pos;
  uniform vec2 size;
  varying vec2 elemBottomLeftCoord;
  ${declarations||''}
  vec2 invertY(vec2 pos) { return vec2(pos[0],-1.0*pos[1]); }

  void main() {
    vec2 elemCenterPx = invertY(pos+size/2.0);
    vec2 itemTopLeftNdc = (itemPos - center) / (0.5*zoom);
    vec2 elemCenterNdc = itemTopLeftNdc + elemCenterPx/(0.5*canvasSize);
    gl_Position = vec4( elemCenterNdc, 0.0, 1.0);
    //vec2 elemBottomLeftOffsetNdc = (pos+size)/(0.5*canvasSize);
    vec2 elemBottomLeftNdc = itemTopLeftNdc + invertY(pos+vec2(0.0,size[1])) / (0.5 * canvasSize);
    //vec2 elemBottomLeftNdc = itemTopLeftNdc - vec2(0,elemBottomLeftOffsetNdc[1]);
    elemBottomLeftCoord = (elemBottomLeftNdc + 1.0) * (0.5*canvasSize);
    gl_PointSize = max(size[0],size[1]) * 1.42;
    //gl_PointSize = max(itemViewSize[0],itemViewSize[1]) * 1.0;
    ${main||''}
  }`,
    fragementShaderCode: ({declarations,main} = {}) => `precision highp float;
    precision mediump int;
    uniform vec2 canvasSize;
    uniform vec2 pos;
    uniform vec2 size;
    uniform vec2 itemViewSize;
    varying vec2 elemBottomLeftCoord;
    ${declarations||''}

    void main() {
      vec2 inElem = gl_FragCoord.xy- elemBottomLeftCoord;
      inElem = vec2(inElem[0], size[1] - inElem[1]);

      if (inElem[0] >= size[0] || inElem[1] >= size[1]) {
        gl_FragColor = vec4(0.0, 0.0, 1.0, 0.0); 
        return;
      }
      if (inElem[0] < 0.0 || inElem[1] < 0.0) {
        gl_FragColor = vec4(0.0, 1.0, 0.0, 0.0); 
        return;
      }
      if (inElem[0] >= size[0] || inElem[0] < 0.0 || inElem[1] >= size[1] || inElem[1] < 0.0) {
        gl_FragColor = vec4(0.0, 0.0, 1.0, 0.0); 
        return;
      };
      vec2 rInElem = inElem/size;
      //gl_FragColor = vec4(rInElem, 0.0, 1.0); return;
      ${main||''}
    }`
})