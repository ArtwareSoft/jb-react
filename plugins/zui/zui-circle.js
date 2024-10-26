dsl('zui')

component('circle', {
  type: 'view',
  params: [
    {id: 'prop', type: 'itemProp'},
    {id: 'viewFeatures', type: 'view_feature[]', dynamic: true}
  ],
  impl: (ctx,prop,features) => { 
    const zuiElem = jb.zui.circleZuiElem()
    const view = zuiElem.view = {
      title: 'circle',
      ctxPath: ctx.path,
      layoutRounds: 2,
      sizeNeeds: ({round, available }) => round == 0 ? [5,5] : 
        [10 + 0.1*jb.zui.floorLog2(available[1]),10 + 0.1*jb.zui.floorLog2(available[1])],

      pivots: (s) => prop ? prop.pivots(s): [],
      zuiElem,
      priority: prop.priority || 0,
    }
    if (prop.colorScale)
      view.backgroundColorByProp = {prop,colorScale: prop.colorScale}
    features().forEach(f=>f.enrich(view))
    return view
  }
})

extension('zui','circle', {
    circleZuiElem: () => ({
      src: [jb.zui.vertexShaderCodeBase({
        declarations: 'attribute vec3 _backgroundColor;varying vec3 backgroundColor;',
        main: 'backgroundColor = _backgroundColor;'
      }), 
      jb.zui.fragementShaderCode({
        code: `varying vec3 backgroundColor;`,
        main: `vec2 r = abs(inElem-size*0.5) / min(size[0],size[1]);
        float distance = sqrt(r[0]*r[0] + r[1]*r[1]);
        if (distance < 0.5)
          gl_FragColor = vec4(backgroundColor,1.0);`
      })],      
      calcBuffers(view, {itemsPositions, DIM }) {
          const backgroundColor = view.backgroundColorByProp || { colorScale: x => [0,x,0], prop: {pivots: () => [ {scale: () => 1 }]}}
          const itemToColor01 = backgroundColor.prop.pivots({DIM})[0].scale

          const circleNodes = itemsPositions.sparse.map(([item, x,y]) => backgroundColor.colorScale(itemToColor01(item)))
          const vertexArray = new Float32Array(circleNodes.flatMap(v=> v.map(x=>1.0*x)))

          return { itemAtts: { backgroundColor: { vertexArray, floatsInVertex : 3 } } }    
      }
    })
})

component('view', {
  type: 'view',
  params: [
    {id: 'title', as: 'string'},
    {id: 'prop', type: 'itemProp'},
    {id: 'size', type: 'view_size[]', dynamic: true},
    {id: 'viewFeatures', type: 'view_feature[]', dynamic: true}
  ],
  impl: (ctx,title,prop,sizeFeatures, features) => { 
    const view = {
      title,
      ctxPath: ctx.path,
      pivots: (s) => prop ? prop.pivots(s): [],
      priority: prop.priority || 0,
    }
    ;[...sizeFeatures(ctx), ...features(ctx)].forEach(f=>f.enrich(view))
    return view
  }
})

component('circle2', {
  type: 'view',
  params: [
    {id: 'prop', type: 'itemProp'},
    {id: 'colorScale', type: 'color_scale', defaultValue: green()},
    {id: 'viewFeatures', type: 'view_feature[]', dynamic: true}
  ],
  impl: view('circle', '%$prop%', {
    size: smoothGrowth({ min: 5, base: 10, growthFactor: 0.1 }),
    viewFeatures: backgroundColorByProp({ colorScale: '%$colorScale%' })
  })
})
