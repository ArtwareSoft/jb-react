dsl('zui')

component('circle', {
  type: 'view',
  params: [
    {id: 'prop', type: 'itemProp'},
    {id: 'colorScale', type: 'color_scale', defaultValue: greens()},
    {id: 'size', type: 'layout_feature[]', dynamic: true, defaultValue: smoothGrowth({ base: [5,5], growthFactor: 0.1 })}
  ],
  impl: view('circle', '%$prop%', {
    layout: '%$size%',
    atts: color('fillColor', '%$colorScale%'),
    renderGPU: gpuCode({
      shaderCode: colorOfPoint(`vec2 r = abs(inElem-size*0.5) / min(size[0],size[1]);
    float distance = sqrt(r[0]*r[0] + r[1]*r[1]);
    if (distance < 0.5)
      gl_FragColor = vec4(fillColor,1.0);`)
    })
  })
})

component('square', {
  type: 'view',
  params: [
    {id: 'prop', type: 'itemProp'},
    {id: 'colorScale', type: 'color_scale', defaultValue: greens()},
    {id: 'size', type: 'layout_feature[]', dynamic: true, defaultValue: smoothGrowth({ base: [5,5], growthFactor: 0.1 })}
  ],
  impl: view('square', '%$prop%', {
    layout: '%$size%',
    atts: color('fillColor', '%$colorScale%'),
    renderGPU: gpuCode({ shaderCode: colorOfPoint(`gl_FragColor = vec4(fillColor,1.0);`) })
  })
})

