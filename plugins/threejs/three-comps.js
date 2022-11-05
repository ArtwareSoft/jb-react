
jb.extension('three', {
  $requireLibs: ['/dist/three.js'],
  parseObject(json) {
    return new Promise(resolve => {
      new THREE.ObjectLoader().parse(json,obj => resolve(obj),() =>{}, err => resolve(err))
    })
  },
  createMesh(ctx, geometryId, noOfParams) {
    const geometry = new THREE[`${geometryId}Geometry`](...Object.values(ctx.params).slice(0,noOfParams))
    const meshParams = {}
    ;(ctx.params.meshParams() || []).forEach(f=> {
      if (f.setGeometry)
        f.setGeometry(geometry) 
    })    
    ;(ctx.params.meshParams() || []).forEach(f=> {
      if (f.initParam)
        jb.path(meshParams,f.initParam[0],f.initParam[1]) 
    })
    const material = new THREE.MeshPhongMaterial( {
    //  color: 0xa0adaf,
    //  shininess: 10,
    //  specular: 0x111111,
      ...meshParams
    } );
    //const material = new THREE.MeshBasicMaterial(meshParams)
    const mesh = new THREE.Mesh(geometry, material)
    ;(ctx.params.meshParams() || []).forEach(f=> {
      if (f.assign)
        jb.path(mesh,f.assign[0],f.assign[1])
    })
    return mesh
  }
})

jb.component('three.control', {
  type: 'control',
  params: [
    {id: 'scene', type: 'three.scene', defaultValue: three.sampleScene()},
    {id: 'camera', type: 'three.camera', defaultValue: three.perspectiveCamera(three.point(0, 0, 5))},
    {id: 'lights', type: 'three.light[]', dynamic: true, flattenArray: true},
    {id: 'controls', type: 'three.control[]'},
    {id: 'style', type: 'three.style', defaultValue: three.style(), dynamic: true},
    {id: 'features', type: 'three.feature[]', dynamic: true}
  ],
  impl: ctx => jb.ui.ctrl(ctx)
})

jb.component('three.OrbitControls', {
  type: 'three.feature',
  impl: frontEnd.method('initOrbitControls', ctx => {
    console.log('OrbitControls')
    const { animations, camera, renderer } = ctx.vars
    const controls = new THREEOrbit.OrbitControls( camera, renderer.domElement )
    animations.push(() => controls.update())
  })
})

jb.component('three.rotate', {
  type: 'three.feature',
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

jb.component('three.style', {
  type: 'three.style',
  impl: customStyle({
    template: ({},{},h) => h('div',{}),
    features: [
      frontEnd.var('profilePath', ({},{$model}) => $model.ctx.path),
      frontEnd.requireExternalLibrary(['three.js']),
      frontEnd.requireExternalLibrary(['three-OrbitControls.js']),
      frontEnd.init(async ({},{el, cmp, profilePath }) => {
        const profile = profilePath.split('~').reduce((acc,p) => acc[p], jb.comps)
        const camera = jb.exec(profile.camera)
        const scene = jb.exec(profile.scene)
        const lights = jb.exec(profile.lights)()

        lights.forEach(m=>scene.add(m))        
        const animations = []
  
        const renderer = new THREE.WebGLRenderer()
        renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.domElement.setAttribute('jb_external','true')

        el.appendChild( renderer.domElement )

        jb.delay(1).then(() => {
          const initMEthods = cmp.base.frontEndMethods.map(x=>x.method).filter(x=>x.match(/init.+/))
          initMEthods.forEach(m=>cmp.runFEMethod(m,{},{animations, camera, scene, renderer}))
        })

        // const elem = scene.children[0]
        // elem.geometry.scale(0.5,0.5,0.5)       
  
        renderer.render( scene, camera )
  
        function animate() {
          requestAnimationFrame( animate );
          animations.forEach(f=>f())
          renderer.render( scene, camera );
        };
        animate();
      })
    ]
  })
})

jb.component('three.perspectiveCamera', {
  type: 'three.camera',
  params: [
    {id: 'position', type: 'three.point', defaultValue: three.point(0,0,0)},
    {id: 'vertical', description: 'from bottom to top of view, in degrees. Default is 50°', as: 'number', defaultValue: 50},
    {id: 'nearPlane', description: 'camera clips between near and far. distance to near plane', as: 'number', defaultValue: 0.1},
    {id: 'farPlane', description: 'camera clips between near and far. distance to far plane', as: 'number', defaultValue: 2000},
  ],
  impl: (ctx,position,vertical,nearPlane,farPlane) => {
    const res = new THREE.PerspectiveCamera( vertical, 1, nearPlane, farPlane )
    res.position.fromArray(Object.values(position))
    return res
  }
})

jb.component('three.point', {
  type: 'three.point',
  params: [
    {id: 'x', as: 'number'},
    {id: 'y', as: 'number'},
    {id: 'z', as: 'number'}
  ],
  macroByValue: true,
  impl: ctx => new THREE.Vector3(...Object.values(ctx.params))
})

jb.component('three.scene', {
  type: 'three.scene',
  params: [
    {id: 'elements', type: 'three.element[]', dynamic: true, flattenArray: true, mandatory: true}
  ],
  impl: (ctx,elements) => {
    const scene = new THREE.Scene()
    elements().forEach(m=>scene.add(m))
    return scene
  }
})

jb.component('three.elementsFromItems', {
  type: 'three.element',
  params: [
    {id: 'items', type: 'data', dynamic: true, mandatory: true},
    {id: 'genericElement', type: 'three.element', dynamic: true, mandatory: true}
  ],
  impl: pipeline('%$items()%', '%$genericElement()%' )
})

jb.component('three.box', {
  type: 'three.element',
  params: [
    {id: 'width', as: 'number', defaultValue: 1},
    {id: 'height', as: 'number', defaultValue: 1},
    {id: 'depth', as: 'number', defaultValue: 1},
    {id: 'meshParams', type: 'three.meshParam[]', dynamic: true}
  ],
  macroByValue: true,
  impl: ctx => jb.three.createMesh(ctx, 'Box',3)
})

jb.component('three.sphere', {
  type: 'three.element',
  params: [
    {id: 'radius', as: 'number', defaultValue: 1},
    {id: 'meshParams', type: 'three.meshParam[]', dynamic: true}
  ],
  impl: ctx => jb.three.createMesh(ctx, 'Sphere',1)
})

jb.component('three.meshParams', {
  type: 'three.meshParam',
  description: 'list of features, auto flattens',
  params: [
    {id: 'meshParams', type: 'three.meshParam[]', as: 'array', composite: true}
  ],
  impl: ({},meshParams) => meshParams.flatMap(x=> Array.isArray(x) ? x: [x])
})

jb.component('three.color', {
  type: 'three.meshParam',
  params: [
    {id: 'color', description: '#hex or name', defaultValue: 'red'}
  ],
  impl: (ctx,color) => ({ initParam: ['color',  new THREE.Color(color) ] })
})

jb.component('three.assign', {
  type: 'three.meshParam',
  params: [
    {id: 'to', as: 'string', options: 'position.z,position.y,position.x', mandatory: true},
    {id: 'val', as: 'number', defaultValue: 1, mandatory: true}
  ],
  impl: (ctx,to,val) => ({ assign: [to, val] })
})

jb.component('three.position', {
  params: [
    {id: 'x', as: 'number'},
    {id: 'y', as: 'number'},
    {id: 'z', as: 'number'}
  ],
  impl: three.meshParams([three.assign('position.z', '%%'), three.assign('position.y', 1), three.assign('position.x', -1)])
})


jb.component('three.scale', {
  type: 'three.meshParam',
  params: [
    {id: 'factor', as: 'number', defaultValue: 1}
  ],
  impl: (ctx, f) => ({ setGeometry: geometry => geometry.scale(f,f,f) })
})

jb.component('three.sampleScene', {
  type: 'three.scene',
  impl: three.scene(three.sphere())
})


// ****** light

jb.component('three.lights', {
  type: 'three.light',
  params: [
    {id: 'lights', type: 'three.light[]', as: 'array', composite: true}
  ],
  impl: ({},lights) => lights.flatMap(x=> Array.isArray(x) ? x: [x])
})

jb.component('three.allDirectionsLight', {
  type: 'three.light',
  params: [
    {id: 'params', type: 'three.lightParam[]', dynamic: true}
  ],
  impl: (ctx,params) => {
    const ambientLight = new THREE.AmbientLight( 0x000000 );
    const light1 = new THREE.PointLight( 0xff0000, 1, 0 );
    light1.position.set( 0, 200, 0 );
    const light2 = new THREE.PointLight( 0x00ff00, 1, 0 );
    light2.position.set( 100, 200, 100 );
    const light3 = new THREE.PointLight( 0x0000ff, 1, 0 );
    light3.position.set( - 100, - 200, - 100 );
    return [ambientLight,light1,light2,light3]
  }
})

jb.component('three.ambientLight', {
  type: 'three.light',
  description: 'globally illuminates all objects equally. No shadow',
  params: [
    {id: 'position', type: 'three.point', defaultValue: three.point(0, 0, 0)},
    {id: 'color', description: '#hex or name', defaultValue: 0xaaaaaa },
    {id: 'intensity', defaultValue: 1},
    {id: 'params', type: 'three.lightParam[]', dynamic: true}
  ],
  impl: (ctx,position,color,intensity, params) => {
    const light = new THREE.AmbientLight(new THREE.Color(color).getHex(), intensity)
    ;(params() || []).forEach(f=> {
      if (f.assign)
        jb.path(light,f.assign[0],f.assign[1])
    })    
    light.position.set(...Object.values(position)).normalize()
    return light
  }
})

jb.component('three.pointLight', {
  type: 'three.light',
  description: 'emitted from a single point to all directions. lightbulb.',
  params: [
    {id: 'position', type: 'three.point', defaultValue: three.point(0, 0, 0)},
    {id: 'color', description: '#hex or name', defaultValue: 0xaaaaaa },
    {id: 'intensity', defaultValue: 1},
    {id: 'distance', description: 'max range. 0 unlimited', defaultValue: 0},
    {id: 'decay', defaultValue: 1},
    {id: 'params', type: 'three.lightParam[]', dynamic: true}
  ],
  impl: (ctx,position,color,intensity,distance,decay, params) => {
    const light = new THREE.PointLight(new THREE.Color(color).getHex(), intensity,distance,decay)
    ;(params() || []).forEach(f=> {
      if (f.assign)
        jb.path(light,f.assign[0],f.assign[1])
    })    
    light.position.set(...Object.values(position)).normalize()
    return light
  }
})

jb.component('three.light.assign', {
  type: 'three.lightParam',
  params: [
    {id: 'to', as: 'string', options: 'position.z,position.y,position.x', mandatory: true},
    {id: 'val', as: 'number', defaultValue: 1, mandatory: true}
  ],
  impl: (ctx,to,val) => ({ assign: [to, val] })
})