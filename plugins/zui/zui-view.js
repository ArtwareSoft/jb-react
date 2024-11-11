dsl('zui')

component('view', {
  type: 'view',
  params: [
    {id: 'title', as: 'string', mandatory: true},
    {id: 'itemProp', type: 'itemProp', mandatory: true},
    {id: 'layout', type: 'layout_feature[]', mandatory: true, dynamic: true},
    {id: 'viewProps', type: 'view_prop[]'},
    {id: 'atts', type: 'attribute[]', dynamic: true},
    {id: 'renderGPU', type: 'render_gpu', dynamic: true},
    {id: 'renderD3', type: 'render_d3', dynamic: true},
  ],
  impl: (ctx,title,itemProp,layout,propsF,attsF, renderGpuF,renderD3F) => ({ 
    createLayoutObj: id => jb.zui.assignFeatures({
      id, title, ctxPath: ctx.path, priority: itemProp.priority || 0,
    }, layout(ctx)),
    createBEObjs: id => [{ 
      id, title, itemProp, ctxPath: ctx.path, attsF, props: {}, propsF, renderGpuF,
      async: propsF.reduce((acc,profF) => acc || profF.async, false),
      calc() { return this.async ? jb.zui.asyncBEData(ctx, this) : jb.zui.calcBEData(ctx, this)}
    }],
    createFEObjs: id => [jb.zui.newFEView(ctx, { id, title, ctxPath: ctx.path, textures: {}, renderGpuF, renderD3F})],
  })
})

extension('zui','view', {
  newFEView(ctx,view) {
    const ctxWithView = ctx.setVars({view})
    view.zoomDependentUniforms = view.renderGpuF(ctxWithView).calc_fe().zoomDependentUniforms
    return view
  },
  async asyncBEData(ctx, view) {
    const ctxWithView = ctx.setVars({view})
    await view.propsF.reduce((pr, {id,calcProp}) => pr.then(async () => view.props[id] = await calcProp(ctxWithView)), Promise.resolve())
    return jb.zui.calcBEData(ctx, view)
  },
  calcBEData(ctx, view) {
    const ctxWithView = ctx.setVars({view})
    if (!view.async)
      view.propsF.forEach(({id,calcProp}) => view.props[id] = calcProp(ctxWithView))
    view.atts = view.attsF(ctxWithView).map(att=> ({...att, calc: null, ar: att.calc(view)}))
    view.renderGPU = view.renderGpuF(ctxWithView).calc(view)
    return {
      id: view.id,
      atts: view.atts,
      glCode: view.renderGPU.glCode,
      uniforms: Object.values(view.renderGPU.uniforms).map(({id,glType,glMethod,value}) => ({id,glType,glMethod,value})),
      props: jb.objFromEntries(view.propsF.filter(p=>p.passToFE).map(({id})=>[id, view.props[id]]))
    }
  },
  assignFeatures(view, features) {
    features.forEach(feature => Object.assign(view,feature))
    return view
  },
  initGroup(ctx) {
    const { layout, views } = ctx.params
    const _views = views()
    return { 
      createLayoutObj: id => ({
        id,
        title: 'group',
        ctxPath: ctx.path,
        ...layout,
        children: _views.map((v,i) =>v.createLayoutObj(`${id}~${i}`)).sort((x,y) => y.priority-x.priority )
      }),
      createBEObjs: id => _views.flatMap((v,i) =>v.createBEObjs(`${id}~${i}`)),
      createFEObjs: id => _views.flatMap((v,i) =>v.createFEObjs(`${id}~${i}`))
    }
  }
})

component('float', {
  type: 'attribute',
  params: [
    {id: 'id', as: 'string'},
    {id: 'itemToFloat', dynamic: true},
  ],
  impl: (ctx,id, itemToFloat) => ({ 
      id,
      size: 1,
      glType: 'float',
      calc: view => ctx.vars.items.map(item => itemToFloat(ctx.setVars({item,view})))
  })
})

component('vec2', {
  type: 'attribute',
  params: [
    {id: 'id', as: 'string'},
    {id: 'itemToVec2', dynamic: true},
  ],
  impl: (ctx,id, itemToVec2) => ({ 
      id,
      size: 2,
      glType: 'vec2',
      calc: view => ctx.vars.items.map(item => itemToVec2(ctx.setVars({item,view})))
  })
})

component('color', {
  type: 'attribute',
  params: [
    {id: 'id', as: 'string'},
    {id: 'colorScale', type: 'color_scale', mandatory: true},
    {id: 'prop', type: 'itemProp', description: 'default prop is the view prop' },
  ],
  impl: (ctx,id, colorScale, prop) => ({ 
      id,
      size: 3,
      glType: 'vec3',
      calc(v) {
          const pivot = (prop || v.itemProp).pivots()[0]
          const linearScale = jb.path(pivot,'linearScale') || (() => 0)
          return ctx.vars.items.map(item => colorScale(linearScale(item)))
      }
  })
})

component('prop', {
  type: 'view_prop',
  params: [
    {id: 'id', as: 'string'},
    {id: 'calcProp', dynamic: true},
    {id: 'async', as: 'boolean', type: 'boolean<>'},
    {id: 'passToFE', as: 'boolean', type: 'boolean<>'}
  ]
})

component('FEProp', {
  type: 'view_prop',
  params: [
    {id: 'id', as: 'string'},
    {id: 'calcProp', dynamic: true},
    {id: 'async', as: 'boolean', type: 'boolean<>'},
    {id: 'passToFE', as: 'boolean', type: 'boolean<>', defaultValue: true}
  ]
})
