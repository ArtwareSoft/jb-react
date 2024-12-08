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
    zoomingSize('%$$model/size()%'),
    modeByContext(),
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

