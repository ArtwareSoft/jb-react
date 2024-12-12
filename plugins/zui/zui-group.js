dsl('zui')

component('group', {
  type: 'control',
  params: [
    {id: 'controls', mandatory: true, type: 'control[]', dynamic: true, composite: true},
    {id: 'layout', type: 'group_layout', defaultValue: vertical()},
    {id: 'style', type: 'group-style', dynamic: true, defaultValue: group()},
  ],
  impl: ctx => jb.zui.ctrl(ctx)
})

component('group', {
  type: 'group-style',
  impl: features(
    variable('renderRole', If('%$cmp/topOfWidget%', 'flowTop', '%$renderRole%')),
    variableForChildren('renderRole', If('%$cmp/topOfWidget%', 'flowElem', '%$renderRole%')), 
    children('%$$model/controls()%'),
    '%$$model/layout%',
    init((ctx,{cmp, $model, widget, renderRole}) => {
      if (['dynamicFlowTop','flowTop'].indexOf(renderRole) == -1) return
      cmp.enrichPropsFromDecendents = async flowDecendents => {
        //await flowDecendents.reduce((pr,child_cmp,i)=>pr.then(async ()=> {child_cmp.flowCmpIndex = i; await child_cmp.calcPayload() }), Promise.resolve())
        const layoutCalculator = jb.zui.initLayoutCalculator(cmp)
        const {elemsLayout,shownCmps } = layoutCalculator.calcItemLayout(null,ctx)
        cmp.topElemSize = elemsLayout[cmp.id].size
        cmp.shaderMainSnippets = []
        cmp.shaderDecls = []
        cmp.requiredForFlowMain = []
        // copy the uniforms from children to the group cmp
        const elemPartsProps = ['margin','borderWidth','padding','borderRadius']
        const irrelevantProps = ['margin','borderWidth','padding','borderRadius','elemPos','elemSize','canvasSize']
        const shownChildren = flowDecendents.filter(cmp=>shownCmps.indexOf(cmp.id) != -1)
        await shownChildren.reduce((pr,child_cmp,i)=>pr.then(async ()=> {child_cmp.flowCmpIndex = i; await child_cmp.calcPayload() }), Promise.resolve())

        shownChildren.forEach((child_cmp,i)=> {
          child_cmp.glVars.uniforms = [
            ...child_cmp.glVars.uniforms.filter(u=>irrelevantProps.indexOf(u.glVar) == -1),
            ... (child_cmp.glVars.uniforms.find(u=>u.glVar=='glyphSize') ? [] : 
              [ {glVar: 'glyphSize', glMethod: '2fv', glType: 'vec2', value: elemsLayout[child_cmp.id].size } ])
          ]
          const align = jb.path(child_cmp.glVars.uniforms.find(u=>u.glVar=='align'),'value') || [0,0,0]
          cmp.uniform = [...(cmp.uniform || []),
            { glVar: `elemParts_${i}`, glMethod: '4fv', vecSize: 6, glType: 'vec4', val: () => [
              ...elemsLayout[child_cmp.id].size, ...elemsLayout[child_cmp.id].pos,
              ...elemPartsProps.flatMap(p=>child_cmp[p] || [0,0,0,0]),
              ...align,0
            ]},
            ...child_cmp.glVars.uniforms.map(u=>({...u, glVar: `${u.glVar}_${i}`, val: () => u.value}))
          ]
          cmp.glAtt = [...(cmp.glAtt || []),
          ...child_cmp.glVars.glAtts.map(att=>({...att, glVar: `${att.glVar}_${i}`, calc: () => att.ar}))
          ]

          cmp.shaderMainSnippets[i] = (child_cmp.shaderMainSnippet || []).sort((p1,p2) => (p1.phase - p2.phase) || (p1.index - p2.index))
            .map(x=>x.code(child_cmp.calcCtx)).filter(x=>x)
          // cmp.shaderDecls[i] = (child_cmp.shaderDecl || []).sort((p1,p2) => (p1.phase - p2.phase) || (p1.index - p2.index))
          //   .map(x=>x.code(child_cmp.calcCtx))
          cmp.requiredForFlowMain = [...cmp.requiredForFlowMain, ...jb.asArray(child_cmp.props.requiredForFlowMain)]
        })
        cmp.shownChildren = shownChildren // used by code templates
        cmp.shownChildrenUniforms = jb.utils.unique(shownChildren.flatMap(cmp=>cmp.glVars.uniforms), u=>u.glVar)
        const requiredForFlowMain = cmp.renderRole == 'flowTop' ? ['flowTopMain'] : ['dynamicFlowTopMain']
        jb.utils.unique([...cmp.requiredForFlowMain,...requiredForFlowMain]).forEach(f=>cmp.applyFeatures(ctx.run({$$: `feature<zui>${f}`})))
        jb.log('zui flow enrichPropsFromDecendents',{cmp, shownChildren, flowDecendents, ctx})
        return cmp.renderRole == 'flowTop' ? {items:[1]} : null
      }
    })
  )
})

component('allOrNone', {
  type: 'control',
  params: [
    {id: 'controls', mandatory: true, type: 'control[]', dynamic: true, composite: true},
    {id: 'layout', type: 'group_layout', defaultValue: vertical()},
    {id: 'style', type: 'group-style', dynamic: true, defaultValue: group()},
  ],
  impl: ctx => jb.zui.ctrl(ctx, {layoutProp: { allOrNone: true } })
})

component('firstToFit', {
  type: 'control',
  params: [
    {id: 'controls', mandatory: true, type: 'control[]', dynamic: true, composite: true},
    {id: 'layout', type: 'group_layout', defaultValue: vertical()},
    {id: 'style', type: 'group-style', dynamic: true, defaultValue: group()},
  ],
  impl: ctx => jb.zui.ctrl(ctx, {layoutProp: { firstToFit: true } })
})

component('flow', {
  type: 'control',
  params: [
    {id: 'controls', mandatory: true, type: 'control[]', dynamic: true, composite: true},
    {id: 'layout', type: 'group_layout', defaultValue: vertical()},
    {id: 'style', type: 'group-style', dynamic: true, defaultValue: group()},
  ],
  impl: ctx => jb.zui.ctrl(ctx, ctx.run({$$: 'feature<zui>flowFeaturesForFlowGroup'}))
})

component('flowFeaturesForFlowGroup', {
  type: 'feature',
  impl: features(
    variable('renderRole', 'dynamicFlowTop'),
    variableForChildren('renderRole', If('%$inZoomingGrid%', 'dynamicFlowElem', 'flowElem'))
  )
})

component('children', {
  type: 'feature',
  params: [
    {id: 'children', as: 'array', dynamic: true}
  ],
  impl: (ctx,children) => ({children})
})

component('vertical', {
  type: 'group_layout',
  impl: () => ({layoutProp: { layoutAxis:  1 }})
})

component('horizontal', {
  type: 'group_layout',
  impl: () => ({layoutProp: { layoutAxis:  0 }})
})