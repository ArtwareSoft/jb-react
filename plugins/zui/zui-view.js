dsl('zui')

component('view', {
  type: 'view',
  params: [
    {id: 'title', as: 'string', mandatory: true},
    {id: 'itemProp', type: 'itemProp', mandatory: true},
    {id: 'layout', type: 'zooming_size', mandatory: true, dynamic: true},
    {id: 'viewProps', type: 'view_prop[]'},
    {id: 'incrementalItemsData', type: 'inc_items_data'},
    {id: 'atts', type: 'attribute[]', dynamic: true},
    {id: 'renderGPU', type: 'render_gpu', dynamic: true},
    {id: 'renderD3', type: 'render_d3', dynamic: true},
  ],
  impl: (ctx,title,itemProp,layout,propsF,incrementalItemsData, attsF, renderGpuF, renderD3F) => ({ 
    createLayoutObj: id => jb.zui.assignFeatures({
      id, title, ctxPath: ctx.path, priority: itemProp && itemProp.priority || 0,
    }, layout(ctx)),
    createBEObjs: id => [{ 
      id, title, itemProp, ctxPath: ctx.path, attsF, props: {}, propsF, incrementalItemsData, renderGpuF,
      async: propsF.reduce((acc,profF) => acc || profF.async, false),
      calc(ctx2) { return jb.zui.asyncBEData(ctx2 || ctx, this) }
    }],
    createFEObjs: id => [jb.zui.newFEView(ctx, { id, title, ctxPath: ctx.path, textures: {}, renderGpuF, incrementalItemsData, renderD3F})],
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
    await view.propsF.reduce((pr, prop) => pr.then(async () => jb.zui.assignProp(prop,view,await prop.calcProp(ctxWithView))), Promise.resolve())
    view.incrementalItemsData && await view.incrementalItemsData.calcMoreItemsData(view,{glLimits: ctx.vars.glLimits, center: ctx.vars.$props.tCenter})
    view.atts = view.attsF(ctxWithView).flatMap(x=>x).map(att=> ({...att, calc: null, ar: att.calc(view)}))
    view.renderGPU = view.renderGpuF(ctxWithView).calc(view)
    return {
      id: view.id,
      atts: view.atts,
      glCode: view.renderGPU.glCode,
      uniforms: Object.values(view.renderGPU.uniforms).map(({id,glType,glMethod,value}) => ({id,glType,glMethod,value})),
      props: jb.objFromEntries(view.propsF.filter(p=>p.passToFE).map(({id})=>[id, view.props[id]]))
    }
  },
  assignProp(prop,view,val) {
    if (prop.multiple)
      Object.assign(view.props,val)
    else
      view.props[prop.id] = val
  },
  assignFeatures(view, features) {
    features.forEach(feature => Object.assign(view,feature))
    return view
  },
  initGroup(ctx, title, layoutProps) {
    const { layout, views, layoutFeatures } = ctx.params
    const _views = views()
    return { 
      createLayoutObj: id => ({
        id,
        title: title || 'group',
        ctxPath: ctx.path,
        ...layout,
        ...(layoutFeatures||[]).reduce((acc,f) => ({...acc,...f}), {}),
        ...(layoutProps || {}),
        children: _views.map((v,i) =>v.createLayoutObj(`${id}~${i}`)).sort((x,y) => y.priority-x.priority )
      }),
      createBEObjs: id => _views.flatMap((v,i) =>v.createBEObjs(`${id}~${i}`)),
      createFEObjs: id => _views.flatMap((v,i) =>v.createFEObjs(`${id}~${i}`))
    }
  }
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

component('props', {
  type: 'view_prop',
  params: [
    {id: 'ids', as: 'string', description: 'as remark'},
    {id: 'calcProp', dynamic: true},
    {id: 'async', as: 'boolean', type: 'boolean<>', defaultValue: true},
    {id: 'passToFE', as: 'boolean', type: 'boolean<>'},
    {id: 'multiple', as: 'boolean', type: 'boolean<>', defaultValue: true},
  ]
})

component('asyncProp', {
  type: 'view_prop',
  params: [
    {id: 'id', as: 'string'},
    {id: 'calcProp', dynamic: true},
    {id: 'async', as: 'boolean', type: 'boolean<>', defaultValue: true},
    {id: 'passToFE', as: 'boolean', type: 'boolean<>'},
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
