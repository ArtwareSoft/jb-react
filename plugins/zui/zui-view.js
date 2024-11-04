dsl('zui')

component('view', {
  type: 'view',
  params: [
    {id: 'title', as: 'string', mandatory: true},
    {id: 'prop', type: 'itemProp', mandatory: true},
    {id: 'layout', type: 'layout_feature[]', mandatory: true, dynamic: true},
    {id: 'atts', type: 'att_calculator[]', dynamic: true},
    {id: 'renderGPU', type: 'render_gpu', dynamic: true},
    {id: 'renderD3', type: 'render_d3', dynamic: true},
  ],
  impl: (ctx,title,itemProp,layout,atts,renderGPU,renderD3) => ({ 
    createLayoutObj: id => jb.zui.assignFeatures({
      id, title, ctxPath: ctx.path, priority: itemProp.priority || 0,
    }, layout(ctx)),
    createBEObjs: id => [{ id, itemProp, ctxPath: ctx.path, atts: atts(), renderGPU: renderGPU(), calc() { return jb.zui.calcBEData(this) } }],
    createFEObjs: id => [{ title, id, ctxPath: ctx.path, textures: {},  renderGPU: renderGPU(), renderD3 }],
  })
})

extension('zui','view', {
  calcBEData(v) {
    return {
      id: v.id,
      atts: v.atts.map(att=> ({ id: att.id, size: att.size, ar: att.calc(v)})),
      glCode: v.renderGPU.calc(v)
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

component('color', {
  type: 'att_calculator',
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

