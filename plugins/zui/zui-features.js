dsl('zui')

component('prop', {
  type: 'feature',
  description: 'define a variable to be used in the rendering calculation process',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'value', mandatory: true, dynamic: true, description: 'when empty, value is taken from model'},
    {id: 'priority', as: 'number', dynamic: true, defaultValue: 1, description: 'if same prop was defined elsewhere decides who will override. range 1-1000, can use the $state variable'},
    {id: 'phase', as: 'number', defaultValue: 10, description: 'props from different features can use each other, phase defines the calculation order'},
    {id: 'defaultValue'}
  ],
  impl: ctx => ({calcProp: {... ctx.params, index: jb.zui.fCounter++}, srcPath: ctx.path})
})

component('init', {
  type: 'feature',
  category: 'lifecycle',
  description: 'activated after variables and before calc properties',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true},
    {id: 'phase', as: 'number', defaultValue: 10}
  ],
  impl: ctx => ({ init: { ... ctx.params, index: jb.zui.fCounter++ }, srcPath: ctx.path})
})

component('props', {
  type: 'feature',
  description: 'define variables to be used in the rendering calculation process',
  params: [
    {id: 'props', as: 'object', mandatory: true, description: 'props as object', dynamic: true},
    {id: 'phase', as: 'number', defaultValue: 10, description: 'props from different features can use each other, phase defines the calculation order'}
  ],
  impl: (ctx,propsF,phase) => ({ calcProp: {id: '$props', value: ctx => propsF(ctx), phase, index: jb.zui.fCounter++ } , srcPath: ctx.path})
})

component('variable', {
  type: 'feature',
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'value', dynamic: true, defaultValue: '', mandatory: true},
    {id: 'phase', as: 'number', defaultValue: 10 }
  ],
  impl: (ctx, name, value, phase) => ({ extendCtx: {setVar: ctx => ctx.setVar(name,jb.val(value(ctx))), phase, index: jb.zui.fCounter++ }, srcPath: ctx.path})
})

component('variableForChildren', {
  type: 'feature',
  params: [
    {id: 'name', as: 'string', mandatory: true},
    {id: 'value', dynamic: true, defaultValue: '', mandatory: true},
    {id: 'phase', as: 'number', defaultValue: 10}
  ],
  impl: (ctx, name, value, phase) => ({ extendChildrenCtx: {setVar: ctx => ctx.setVar(name,jb.val(value(ctx))), phase, index: jb.zui.fCounter++ }, srcPath: ctx.path})
})

component('features', {
  type: 'feature',
  moreTypes: 'style',
  description: 'list of features, auto flattens',
  params: [
    {id: 'features', type: 'feature[]', as: 'array', typeAsParent: t=>t.replace(/style/,'feature'), composite: true}
  ],
  impl: (ctx,features) => features.flatMap(x=> Array.isArray(x) ? x: [x])
})

component('dependentFeature', {
  type: 'feature',
  moreTypes: 'style',
  params: [
    {id: 'feature', type: 'feature', composite: true},
    {id: 'glVars', as: 'array'}
  ],
  impl: (ctx,feature,glVars) => ({...feature, dependent : {glVars, feature} })
})

component('glAtt', {
  type: 'feature',
  params: [
    {id: 'att', type: 'attribute' },
  ],
  impl: (ctx,glAtt) => ({glAtt, srcPath: ctx.path})
})

component('shaderDecl', {
  type: 'feature',
  description: 'define function or header line',
  params: [
    {id: 'code', as: 'string', dynamic: true, newLinesInCode: true },
    {id: 'phase', as: 'number', defaultValue: 10},
  ],
  impl: ctx => ({shaderDecl: ctx.params, srcPath: ctx.path})
})

component('shaderMainSnippet', {
  type: 'feature',
  description: 'define code snippet to pur in main',
  params: [
    {id: 'code', as: 'string', dynamic: true, newLinesInCode: true },
    {id: 'phase', as: 'number', defaultValue: 10},
  ],
  impl: ctx => ({shaderMainSnippet: ctx.params, srcPath: ctx.path})
})

component('vertexDecl', {
  type: 'feature',
  description: 'define function or header line',
  params: [
    {id: 'code', as: 'string', dynamic: true, newLinesInCode: true },
    {id: 'phase', as: 'number', defaultValue: 10},
  ],
  impl: ctx => ({vertexDecl: ctx.params, srcPath: ctx.path})
})

component('vertexMainSnippet', {
  type: 'feature',
  description: 'define code snippet to pur in main',
  params: [
    {id: 'code', as: 'string', dynamic: true, newLinesInCode: true },
    {id: 'phase', as: 'number', defaultValue: 10},
  ],
  impl: ctx => ({vertexMainSnippet: ctx.params, srcPath: ctx.path})
})

component('varying', {
  type: 'feature',
  params: [
    {id: 'glType', as: 'string', mandatory: true},
    {id: 'glVar', as: 'string', mandatory: true},
    {id: 'glCode', mandatory: true}
  ],
  impl: ctx => ({varying: ctx.params, srcPath: ctx.path})
})

component('uniforms', {
  type: 'feature',
  params: [
    {id: 'uniforms', type: 'uniform[]', composite: true},
  ],
  impl: (ctx,uniform) => ({uniform, srcPath: ctx.path})
})

component('method', {
  type: 'feature',
  description: 'define backend event handler',
  params: [
    {id: 'id', as: 'string', mandatory: true, description: 'if using the pattern onXXHandler, or onKeyXXHandler automaticaly binds to UI event XX, assuming on-XX:true is defined at the template'},
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: (ctx,id) => ({method: {id, ctx}, srcPath: ctx.path})
})

component('If', {
  type: 'feature',
  description: 'conditional feature, define feature if then else condition',
  macroByValue: true,
  params: [
    {id: 'condition', type: 'boolean', as: 'boolean', mandatory: true},
    {id: 'then', type: 'feature', mandatory: true, dynamic: true, composite: true},
    {id: 'else', type: 'feature', dynamic: true}
  ],
  impl: (ctx,cond,_then,_else) =>	cond ? _then() : _else()
})

component('css', {
  description: 'e.g. {color: red; width: 20px} or div>.myClas {color: red} ',
  type: 'feature',
  params: [
    {id: 'css', mandatory: true, dynamic: true, as: 'string', newLinesInCode: true}
  ],
  impl: (ctx,css) => ({css: _ctx => jb.zui.parseCss(css(_ctx))})
})

component('css.class', {
  type: 'feature',
  params: [
    {id: 'class', mandatory: true, as: 'string'}
  ],
  impl: (ctx,clz) => ({cssClass: clz})
})

component('frontEnd.init', {
  type: 'feature',
  category: 'front-end',
  description: 'initializes the front end, mount, component did update. runs after props',
  params: [
    {id: 'action', type: 'action<>', mandatory: true, dynamic: true},
    {id: 'phase', as: 'number', defaultValue: 10},
  ],
  impl: (ctx,action,phase) => ({ frontEndMethod: { method: 'init', path: ctx.path, action: action.profile, phase} })
})

component('frontEnd.prop', {
  type: 'feature',
  category: 'front-end',
  description: 'assign front end property (calculated using the limited FE context). runs before init',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'value', mandatory: true, dynamic: true}
  ],
  impl: (ctx,id,value) => ({ frontEndMethod: { method: 'calcProps', path: ctx.path, _prop: id,
      action: (_ctx,{cmp}) => cmp[id] = value(_ctx) } })
})

component('frontEnd.var', {
  type: 'feature',
  description: 'calculate in the BE and pass to frontEnd',
  params: [
    {id: 'id', as: 'string', mandatory: true},
    {id: 'value', mandatory: true, dynamic: true}
  ],
  impl: ctx => ({ frontEndVar: ctx.params , srcPath: ctx.path})
})

component('frontEnd.method', {
  type: 'feature',
  category: 'front-end',
  description: 'register as front end method, the context is limited to cmp & state. can be run with cmp.runFEMetod(id,data,vars)',
  params: [
    {id: 'method', as: 'string'},
    {id: 'action', type: 'action<>', mandatory: true, dynamic: true},
    {id: 'phase', as: 'number', defaultValue: 10, description: 'init methods can register many times'},
  ],
  impl: (ctx,method,action,phase) => ({ frontEndMethod: { method, path: ctx.path, action: action.profile, phase} })
})

component('frontEnd.flow', {
  type: 'feature',
  category: 'front-end',
  description: 'rx flow at front end',
  params: [
    {id: 'elems', type: 'rx<>[]', as: 'array', dynamic: true, mandatory: true, templateValue: []},
    {id: 'phase', as: 'number', defaultValue: 20},
  ],
  impl: (ctx, elems, phase) => ({ frontEndMethod: { 
      method: 'init', path: ctx.path, _flow: elems.profile, phase,
      action: { $: 'action<>rx.pipe', elems: _ctx => elems(_ctx) }
    }})
})

component('frontEnd.uniforms', {
  type: 'feature',
  params: [
    {id: 'uniforms', type: 'uniform[]', composite: true}
  ],
  impl: (ctx,uniform) => ({frontEndUniform: { profile: ctx.profile.uniforms, path: ctx.path + '~uniforms' }, srcPath: ctx.path})
})

