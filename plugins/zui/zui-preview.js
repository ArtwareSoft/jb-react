
jb.component('zui.itemPreview', {
  type: 'control',
  impl: group({
    style: group.sections(header.h3()),
    controls: [
      dynamicControls({
        controlItems: pipeline('%$zuiCtx/props/zuiState%', keys()),
        genericControl: group({
          title: tgp.shortCompName('%$path%'),
          style: propertySheet.titlesAbove(),
          controls: dynamicControls({
            controlItems: pipeline('%$zuiCtx/props/zuiState%', property('%$path%'), entries()),
            genericControl: text(zui.formatValue('%$prop/1%'), '%$prop/0%'),
            itemVariable: 'prop'
          }),
          features: css.margin({left: '30px'})
        }),
        itemVariable: 'path'
      })
    ],
    features: [id('itemPreview'), css.width('400')]
  }),
  circuit1: 'zuiTest.itemlist'
})

jb.component('zui.formatValue', {
  params: [
    {id: 'val'}
  ],
  impl: (ctx,val) => {
    return Array.isArray(val) ? val.map(x=>format(x)).join(',') : format(val)
    function format(x) {
      return (typeof x == 'number') ? x.toFixed(2) : x
    }
  }
})

jb.component('zui.itemPreviewOld', {
  type: 'control',
  params: [
    {id: 'parentCompId', as: 'string'}
  ],
  impl: (ctx,parentCompId ) => {
    const { path, obj } = findPT(jb.comps[parentCompId],'zui.itemlist', parentCompId, 0) || {}
    const profile = { $: 'group', style: group.sections(text.span()), 
      controls: obj ? buildDebugCtrl(obj, path) : {$: 'text', title: 'zui.itemlist~itemView not found'},
      features: {$:'id', id: 'itemPreview'}
    }
    return ctx.run(profile, { type: 'control' })

    function findPT(obj, toFind, path, depth) {
      if (typeof obj != 'object' || !obj || depth > 10) return
      if (obj.$ == toFind) return { path, obj }
      return Object.keys(obj).reduce((found,key) => found || findPT(obj[key], toFind, `${path}~${key}`, depth+1), false)
    }

    function buildDebugCtrl(view, innerPath) {
      const children = view.views ? [{$: 'group', title: innerPath, controls: view.views.map((v,i)=>buildDebugCtrl(v,`${innerPath}~views~${i}`)) }] : []
      return {$: 'group', title: innerPath.slice(path.length), controls: [{$: 'zui.viewProps', path: innerPath}, ...children] }
    }
  }
})

jb.component('zui.viewProps', {
  type: 'control',
  params: [
    {id: 'path', as: 'string'}
  ],
  impl: (ctx, path) => {
    const toShow = jb.path(ctx.vars.zuiCtx,`props.zuiState.${path}`) 
    if (!toShow) return ctx.run({$: 'text', text: 'no data'}, { type: 'control' })
    const controls = Object.keys(toShow).map(title=>({$: 'text', text: `%$zuiCtx/state/${title}%`, title }))
    const profile = { $: 'group', controls, style: {$: 'propertySheet.titlesAbove'}}
    return ctx.run(profile, { type: 'control' })
  }
})

