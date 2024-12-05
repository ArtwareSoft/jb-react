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
    frontEnd.var('zuiMode', '%$zuiMode%'),
    children('%$$model/controls()%'),
    '%$$model/layout%',
    // init((ctx,{cmp, $model, widget}) => {
    //   if (!cmp.topOfWidget) return
    //   cmp.extendedPayload = async topPayload => {
    //     const layoutCalculator = jb.zui.initLayoutCalculator(cmp)
    //     const {shownCmps} = layoutCalculator.calcStaticLayout()
    //     const mainShader = ''
    //     await staticCmps.reduce((pr,cmp,i)=>pr.then(async ()=> {
    //       const childPayload = await cmp.calcPayload()
    //       const { id } = cmp
    //       const shaderMain = res.uniforms.map(({glVar}) => `${glVar} = ${u.glVar}_${id}`)
    //       mainShader += `${i: '} else ' : ''}if (inSizePos(inTopElem,sizePos_${id})) {
    //         vec2 inGlyph = inTopElem - sizePos_${id}.zw;
    //         vec2 size = sizePos_${id}.xy;
    //         vec2 rInGlyph = inGlyph/size;
    //         ${res.uniforms.map(({glVar}) => `${glVar} = ${u.glVar}_${id}`)}
    //         ${shaderMain}
    //         `
    //       res.uniforms.forEach(u=>topPayload.uniforms.push({...u,glVar: `${u.glVar}_${id}`}))
    //     }), Promise.resolve())
    //     // merge sahder main
    //     return topPayload
    //   }
    // }),
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