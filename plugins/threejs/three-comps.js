
jb.extension('three', {
  $requireLibs: ['/dist/three.js'],
  parseObject(json) {
    return new Promise(resolve => {
      new THREE.ObjectLoader().parse(json,obj => resolve(obj),() =>{}, err => resolve(err))
    })
  },
  createMesh(ctx, geometryId, noOfParams) {
    const geometry = new THREE[geometryId](...Object.values(ctx.params).slice(0,noOfParams))
    const meshParams = {}
    ;(ctx.params.meshParams() || []).forEach(f=> {
      if (f.setGeometry)
        f.setGeometry(geometry) 
    })    
    ;(ctx.params.meshParams() || []).forEach(f=> {
      if (f.initParam)
        jb.path(meshParams,f.initParam[0],f.initParam[1]) 
    })    
    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial(meshParams) )
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

        const animations = []
  
        const renderer = new THREE.WebGLRenderer()
        renderer.setSize( window.innerWidth, window.innerHeight )
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
    const res = new THREE.Scene()
    elements().forEach(m=>res.add(m))
    return res
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
  impl: ctx => jb.three.createMesh(ctx, 'BoxGeometry',3)
})

jb.component('three.sphere', {
  type: 'three.element',
  params: [
    {id: 'radius', as: 'number', defaultValue: 1},
    {id: 'meshParams', type: 'three.meshParam[]', dynamic: true},
  ],
  impl: ctx => jb.three.createMesh(ctx, 'SphereGeometry',1)
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
