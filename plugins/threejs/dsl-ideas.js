/*
jb.component('button', {
  type: 'control,clickable',
  category: 'control:100,common:100',
  params: [
    {id: 'title', as: 'ref', mandatory: true, templateValue: 'click me', dynamic: true},
    {id: 'action', type: 'action', mandatory: true, dynamic: true},
    {id: 'style', type: 'button.style', defaultValue: button.mdc(), dynamic: true},
    {id: 'raised', as: 'boolean', dynamic: true },
    {id: 'features', type: 'feature,button.feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('button.initAction', {
  type: 'button.feature',
  category: 'button:0',
  impl: features(
    watchAndCalcModelProp('title'),
    watchAndCalcModelProp('raised'),
    method('onclickHandler', (ctx,{cmp, ev, $model}) => {
      if (jb.path(ev,'ev.ctrlKey'))
        cmp.runBEMethod('ctrlAction',ctx.data,ctx.vars)
      else if (jb.path(ev,'ev.alyKey'))
        cmp.runBEMethod('altAction',ctx.data,ctx.vars)
      else
        $model.action(ctx)
    }),
    feature.userEventProps('ctrlKey,altKey'),
    () => ({studioFeatures :{$: 'feature.contentEditable', param: 'title' }})
  )
})

jb.component('button.ctrlAction', {
  type: 'button.feature',
  category: 'button:70',
  description: 'action to perform on control+click',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: method('ctrlAction', (ctx,{},{action}) => action(ctx))
})

jb.component('button.altAction', {
  type: 'button.feature',
  category: 'button:70',
  description: 'action to perform on alt+click',
  params: [
    {id: 'action', type: 'action', mandatory: true, dynamic: true}
  ],
  impl: method('altAction', (ctx,{},{action}) => action(ctx))
})






jb.component('three', {
  type: 'control<ui>',
  params: [
    {id: 'scene', dsl: 'three', type: 'scene<three>', defaultValue: sampleScene()},
    {id: 'camera', dsl: 'three', type: 'camera<three>', defaultValue: perspectiveCamera(point(0, 0, 5))},
    {id: 'lights', dsl: 'three', type: 'light<three>[]', dynamic: true, flattenArray: true},
    {id: 'controls', dsl: 'three', type: 'control<three>[]'},
    {id: 'style', type: 'style', defaultValue: style(), dynamic: true},
    {id: 'features', type: 'feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('OrbitControls', {
  type: 'feature<ui>',
  impl: frontEnd.method('initOrbitControls', ctx => {
    console.log('OrbitControls')
    const { animations, camera, renderer } = ctx.vars
    const controls = new THREEOrbit.OrbitControls( camera, renderer.domElement )
    animations.push(() => controls.update())
  })
})

jb.component('rotate', {
  type: 'feature<ui>',
  impl: frontEnd.method('initRotate', ctx => {
    const { animations, scene } = ctx.vars
    animations.push(() => {
      const elem = scene.children[0]
      if(!elem) return
      elem.rotation.x += 0.01;
      elem.rotation.y += 0.01;      
    })
  })
})

// ****** light

jb.component('lights', {
  type: 'light<ui>',
  params: [
    {id: 'lights', type: 'light[]', as: 'array', composite: true}
  ],
  impl: ({},lights) => lights.flatMap(x=> Array.isArray(x) ? x: [x])
})
  
jb.component('allDirections', {
    type: 'light<ui>',
    params: [
        {id: 'color', description: '#hex or name', defaultValue: 0xaaaaaa },
        {id: 'params', type: 'lightParam[]', dynamic: true}
    ],
    impl: lights(
        ambient('%$color%'), 
        point(position(0, 200, 0), '%$color%'),
        point(position(100, 200, 100), '%$color%'),
        point(position(-100, -200, -100), '%$color%'),
    )
})
  
jb.component('ambient', {
  type: 'light<ui>',
  description: 'globally illuminates all objects equally. No shadow',
  params: [
    {id: 'color', description: '#hex or name', defaultValue: 11184810},
    {id: 'intensity', defaultValue: 1},
    {id: 'params', type: 'lightParam[]', dynamic: true}
  ],
  impl: (ctx,position,color,intensity, params) => {
      const light = new AmbientLight(new Color(color).getHex(), intensity)
      ;(params() || []).forEach(f=> {
        if (f.assign)
          jb.path(light,f.assign[0],f.assign[1])
      })    
      light.position.set(...Object.values(position)).normalize()
      return light
    }
})
  
jb.component('bulb', {
    type: 'light<>',
    description: 'emitted from a single point to all directions. lightbulb.',
    params: [
        {id: 'position', type: 'point', defaultValue: point(0, 0, 0)},
        {id: 'color', description: '#hex or name', defaultValue: 0xaaaaaa },
        {id: 'intensity', defaultValue: 1},
        {id: 'distance', description: 'max range. 0 unlimited', defaultValue: 0},
        {id: 'decay', defaultValue: 1},
        {id: 'params', type: 'lightParam[]', dynamic: true}
    ],
    impl: (ctx,position,color,intensity,distance,decay, params) => {
        const light = new PointLight(new Color(color).getHex(), intensity,distance,decay)
        ;(params() || []).forEach(f=> {
        if (f.assign)
            jb.path(light,f.assign[0],f.assign[1])
        })    
        light.position.set(...Object.values(position)).normalize()
        return light
    }
})
  */