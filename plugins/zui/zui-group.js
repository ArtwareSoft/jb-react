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
    variable('zuiMode', If('%$cmp/topOfWidget%', 'flowTop', '%$zuiMode%')),
    variableForChildren('zuiMode', If('%$zuiMode%==flowTop', 'flowElem', '%$zuiMode%')),
    children('%$$model/controls()%'),
    '%$$model/layout%',
    init((ctx,{cmp, $model, widget}) => {
      if (!cmp.topOfWidget) return
      cmp.extendedPayload = async (topPayload, flowDecendents) => {
        if (cmp.flowDecendents) return topPayload // ugly - avoid endless recurtion
        await flowDecendents.reduce((pr,child_cmp,i)=>pr.then(async ()=> {child_cmp.flowCmpIndex = i; await child_cmp.calcPayload() }), Promise.resolve())
        const layoutCalculator = jb.zui.initLayoutCalculator(cmp)
        const {elemsLayout } = layoutCalculator.calcItemLayout(null,ctx)
        cmp.topElemSize = elemsLayout[cmp.id].size
        cmp.shaderMainSnippets = []
        cmp.shaderDecls = []
        cmp.requiredForFlowMode = []
        // copy the uniforms from children to the group cmp
        const basicProps = ['margin','borderWidth','padding','borderRadius']
        const irrelevantProps = ['margin','borderWidth','padding','borderRadius','elemPos','elemSize','canvasSize']

        flowDecendents.forEach((child_cmp,i)=> {
          child_cmp.glVars.uniforms = child_cmp.glVars.uniforms.filter(u=>irrelevantProps.indexOf(u.glVar) == -1)
          cmp.uniform = [...cmp.uniform || [],
          { glVar: `elemBasics_${i}`, glMethod: '4fv', vecSize: 5, glType: 'vec4', val: () => [
            ...elemsLayout[child_cmp.id].size, ...elemsLayout[child_cmp.id].pos,
            ...basicProps.flatMap(p=>child_cmp[p] || [0,0,0,0])
          ]},
            ...child_cmp.glVars.uniforms.map(u=>({...u, glVar: `${u.glVar}_${i}`, val: () => u.value}))
          ]
          cmp.shaderMainSnippets[i] = (child_cmp.shaderMainSnippet || []).sort((p1,p2) => (p1.phase - p2.phase) || (p1.index - p2.index))
            .map(x=>x.code(child_cmp.calcCtx))
          cmp.shaderDecls[i] = (child_cmp.shaderDecl || []).sort((p1,p2) => (p1.phase - p2.phase) || (p1.index - p2.index))
            .map(x=>x.code(child_cmp.calcCtx))
          cmp.requiredForFlowMode = [...cmp.requiredForFlowMode, ...jb.asArray(child_cmp.props.requiredForFlowMode)]
        })
        cmp.flowDecendents = flowDecendents
        cmp.flowDecendentsUniforms = jb.utils.unique(flowDecendents.flatMap(cmp=>cmp.glVars.uniforms), u=>u.glVar)
        jb.utils.unique([...cmp.requiredForFlowMode,'flowMode']).forEach(f=>cmp.applyFeatures(ctx.run({$$: `feature<zui>${f}`})))
        const res = await cmp.calcPayload({items:[1]})
        return res
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
  impl: ctx => jb.zui.ctrl(ctx, layoutProp('allOrNone'))
})

component('firstToFit', {
  type: 'control',
  params: [
    {id: 'controls', mandatory: true, type: 'control[]', dynamic: true, composite: true},
    {id: 'layout', type: 'group_layout', defaultValue: vertical()},
    {id: 'style', type: 'group-style', dynamic: true, defaultValue: group()},
  ],
  impl: ctx => jb.zui.ctrl(ctx, layoutProp('firstToFit'))
})

component('children', {
  type: 'feature',
  params: [
    {id: 'children', as: 'array', dynamic: true}
  ],
  impl: (ctx,children) => ({children})
})

component('layoutProp', {
  type: 'group-feature',
  params: [
    {id: 'prop', as: 'string'}
  ],
  impl: (ctx,prop) => ({layoutProp: { [prop]: true } })
})

component('vertical', {
  type: 'group_layout',
  impl: () => ({layoutProp: { layoutAxis:  1 }})
})

component('horizontal', {
  type: 'group_layout',
  impl: () => ({layoutProp: { layoutAxis:  0 }})
})