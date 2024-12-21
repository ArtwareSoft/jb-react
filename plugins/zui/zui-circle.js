dsl('zui')

component('circle', {
  type: 'control',
  params: [
    {id: 'size', type: 'zooming_size', dynamic: true, defaultValue: smoothGrowth({ base: [5,5], growthFactor: 0.1 })},
    {id: 'style', type: 'circle-style', defaultValue: circle(), dynamic: true},
    {id: 'features', type: 'feature', dynamic: true}
  ],
  impl: ctx => jb.zui.ctrl(ctx)
})

component('circle', {
  type: 'circle-style',
  params: [],
  impl: features(
    frontEnd.method('zoomingCss', (ctx,{cmp,itemSize}) => {
      const [width,height] = [0,1].map(axis=> 0.1 *jb.zui.floorLog2(itemSize[axis]))
      jb.zui.setCss(`dynamic-${cmp.clz}`, `.${cmp.clz} { width: ${width}px; height: ${height}px;}` )
    }),
    html('<div class="%$cmp/clz%"><div class="circle"></div></div>'),
    css('.%$cmp/clz%>.circle { width: 100%; height: 100%; background-color: red; border-radius: 50%; }'),
    frontEnd.uniforms(vec2('glyphSize', '%$elemLayout.size%')),
    uniforms(vec2('glyphSize', [5,5]), vec3('align', [0,0,0])),
    zoomingSize('%$$model/size()%'),
    mainByContext(),
    centerRadius(),
    valueColor('fill'),
    color('fill', 'red'),
    fillCircleElem()
  )
})

component('centerRadius', {
  type: 'feature',
  params: [],
  impl: shaderMainSnippet(`vec2 center = glyphSize * 0.5;
    float radius = min(glyphSize[0], glyphSize[1]) * 0.5;`)
})

component('fillCircleElem', {
  type: 'feature',
  params: [],
  impl: dependentFeature({
    feature: shaderMainSnippet(`if (length(inGlyph - center) <= radius) gl_FragColor = vec4(fillColor, 1.0);`),
    glVars: ['fillColor']
  })
})

component('fillCircleElem1', {
  type: 'feature',
  params: [],
  impl: dependentFeature({
    feature: shaderMainSnippet(`gl_FragColor = vec4(1.0,0.0,0.0, 1.0);`),
    glVars: ['fillColor']
  })
})

