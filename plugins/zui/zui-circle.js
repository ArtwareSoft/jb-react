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
    renderGPU: gpuCode(colorOfPoint({
      codeInMain: `
    vec2 r = abs(inElem-size*0.5) / min(size[0],size[1]);
    float distance = sqrt(r[0]*r[0] + r[1]*r[1]);
    if (distance < 0.5)
      gl_FragColor = vec4(fillColor,1.0);`
    }))
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
    renderGPU: gpuCode(colorOfPoint({
      codeInMain: `
      gl_FragColor = vec4(fillColor,1.0);`
    }))
  })
})


// gpu: gpuRender({
//   requiredAtts: color('fillColor', '%$colorScale%', { prop: '%$prop%' }),
//   shaderCode: calcColor({
//    codeInMain: `
    // vec2 r = abs(inElem-size*0.5) / min(size[0],size[1]);
    // float distance = sqrt(r[0]*r[0] + r[1]*r[1]);
    // if (distance < 0.5)
    //   gl_FragColor = vec4(fillColor,1.0);`
//   })
// }),
// d3: d3Render({
//   enrichCtx: (ctx,{},{itemProp, colorScale}) => {
//     const linearScale = itemProp.pivots({DIM})[0].linearScale
//     return {calcCircleColor: item => '#' + colorScale(linearScale(item)).map(v => v.toString(16).padStart(2, '0')).join('') }    
//   },
//   append: (ctx,{d3Select, calcCircleColor},{itemProp, colorScale}) => d3Select.append('circle')
//     .attr('fill', ({item}) => calcCircleColor(item))
//     .attr('cx', ({item, elem}) => item.pos[0] + elem.pos[0]+ elem.size[0]/2)
//     .attr('cy', ({item, elem}) => item.pos[1] + elem.pos[1]+ elem.size[1]/2)
//     .attr('r', ({item, elem}) => elem.size[0])
//     .attr('transform', ({item, elem, z}) => z.transform),
//   onZoom: (ctx,{d3Select}) => d3Select
//     .attr('cx', ({item, elem}) => item.pos[0] + elem.pos[0]+ elem.size[0]/2)
//     .attr('cy', ({item, elem}) => item.pos[1] + elem.pos[1]+ elem.size[1]/2)
//     .attr('r', ({item, elem}) => elem.size[0])
//     .attr('transform', ({item, elem, z}) => z.transform)
// })

// component('circle', {
//   type: 'view',
//   params: [
//     {id: 'prop', type: 'itemProp'},
//     {id: 'viewFeatures', type: 'view_feature[]', dynamic: true}
//   ],
//   impl: (ctx,prop,features) => { 
//     const zuiElem = jb.zui.circleZuiElem()
//     const view = zuiElem.view = {
//       title: 'circle',
//       ctxPath: ctx.path,
//       layoutRounds: 2,
//       sizeNeeds: ({round, available }) => round == 0 ? [5,5] : 
//         [10 + 0.1*jb.zui.floorLog2(available[1]),10 + 0.1*jb.zui.floorLog2(available[1])],

//       pivots: (s) => prop ? prop.pivots(s): [],
//       zuiElem,
//       priority: prop.priority || 0,
//     }
//     if (prop.colorScale)
//       view.backgroundColorByProp = {prop,colorScale: prop.colorScale}
//     features().forEach(f=>f.enrich(view))
//     return view
//   }
// })

// extension('zui','circle', {
//     circleZuiElem: () => ({
//       src: [jb.zui.vertexShaderCodeBase({
//         declarations: 'attribute vec3 _backgroundColor;varying vec3 backgroundColor;',
//         main: 'backgroundColor = _backgroundColor;'
//       }), 
//       jb.zui.fragementShaderCode({
//         code: `varying vec3 backgroundColor;`,
//         main: `vec2 r = abs(inElem-size*0.5) / min(size[0],size[1]);
//         float distance = sqrt(r[0]*r[0] + r[1]*r[1]);
//         if (distance < 0.5)
//           gl_FragColor = vec4(backgroundColor,1.0);`
//       })],      
//       calcBuffers(view, {itemsPositions, DIM }) {
//           const backgroundColor = view.backgroundColorByProp || { colorScale: x => [0,x,0], prop: {pivots: () => [ {scale: () => 1 }]}}
//           const itemToColor01 = backgroundColor.prop.pivots({DIM})[0].scale

//           const circleNodes = itemsPositions.sparse.map(([item, x,y]) => backgroundColor.colorScale(itemToColor01(item)))
//           const vertexArray = new Float32Array(circleNodes.flatMap(v=> v.map(x=>1.0*x)))

//           return { itemAtts: { backgroundColor: { vertexArray, floatsInVertex : 3 } } }    
//       }
//     })
// })
