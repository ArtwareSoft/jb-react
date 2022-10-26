
jb.extension('three', {
  $requireLibs: ['/dist/three.js'],
  parseObject(json) {
    return new Promise(resolve => {
      new THREE.ObjectLoader().parse(json,obj => resolve(obj),() =>{}, err => resolve(err))
    })
  }
})

jb.component('three.control', {
  type: 'control',
  params: [
    {id: 'scene', type: 'three.scene', defaultValue: three.sampleScene()},
    {id: 'camera', type: 'three.camera', defaultValue: three.perspectiveCamera({position: three.point(0,0,5) })},
    {id: 'controls', type: 'three.control[]' },
    {id: 'style', type: 'three.style', defaultValue: three.style(), dynamic: true},
    {id: 'features', type: 'feature,three.feature[]', dynamic: true}
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

jb.component('three.rotateCube', {
  type: 'three.feature',
  impl: frontEnd.method('initRotateCube', ctx => {
    const { animations, scene } = ctx.vars
    animations.push(() => {
      const cube = scene.children[0]
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;      
    })
  })
})

jb.component('three.style', {
  type: 'three.style',
  impl: customStyle({
    template: ({},{},h) => h('div',{}),
    features: [
      frontEnd.var('sceneJson', ({},{$model}) => $model.scene.toJSON()),
      frontEnd.var('cameraJson', ({},{$model}) => $model.camera.toJSON()),
      frontEnd.var('cameraPos', ({},{$model}) => $model.camera.position.toArray()),
      frontEnd.requireExternalLibrary(['three.js']),
      frontEnd.requireExternalLibrary(['three-OrbitControls.js']),
      frontEnd.init(async ({},{cmp, el,sceneJson,cameraJson,cameraPos}) => {
        const animations = []
        const camera = await jb.three.parseObject(cameraJson)
        camera.aspect = window.innerWidth / window.innerHeight
        camera.position.fromArray(cameraPos)
        camera.updateProjectionMatrix()
        const scene = await jb.three.parseObject(sceneJson)
        const cube = scene.children[0]
  
        const renderer = new THREE.WebGLRenderer()
        renderer.setSize( window.innerWidth, window.innerHeight )
        el.appendChild( renderer.domElement )

        const initMEthods = cmp.base.frontEndMethods.map(x=>x.method).filter(x=>x.match(/init.+/))
        initMEthods.forEach(m=>cmp.runFEMethod(m,{},{animations, camera, scene, renderer}))
  
        //const controls = new THREE.OrbitControls( camera, renderer.domElement )
        // const geometry = new THREE.BoxGeometry( 1, 1, 1 )
        // const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } )
        // const cube = new THREE.Mesh( geometry, material )
        // scene.add( cube );

        
        renderer.render( scene, camera )
  
        function animate() {
          requestAnimationFrame( animate );
          animations.forEach(f=>f())
          //controls.update();
  
          // cube.rotation.x += 0.01;
          // cube.rotation.y += 0.01;
  
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
    {id: 'mesh', type: 'three.mesh[]', mandatory: true}
  ],
  impl: (ctx,mesh) => {
    const res = new THREE.Scene()
    mesh.forEach(m=>res.add(m))
    return res
  }
})

jb.component('three.mesh', {
  type: 'three.mesh',
  params: [
    {id: 'geometry', type: 'three.geometry', defaultValue: three.sphere(), mandatory: true  },
    {id: 'material', type: 'three.material', defaultValue: three.basicMaterial()}
  ],
  impl: ctx => new THREE.Mesh( ...Object.values(ctx.params) )
})

jb.component('three.box', {
  type: 'three.geometry',
  params: [
    {id: 'width', as: 'number', defaultValue: 1},
    {id: 'height', as: 'number', defaultValue: 1},
    {id: 'depth', as: 'number', defaultValue: 1}
  ],
  macroByValue: true,
  impl: ctx => new THREE.BoxGeometry(...Object.values(ctx.params))
})

jb.component('three.sphere', {
  type: 'three.geometry',
  params: [
    {id: 'radius', as: 'number', defaultValue: 1},
  ],
  impl: ctx => new THREE.BoxGeometry(...Object.values(ctx.params))
})

jb.component('three.basicMaterial', {
  type: 'three.material',
  params: [
    {id: 'color', description: 'hex or string', defaultValue: 65280}
  ],
  impl: ctx => new THREE.MeshBasicMaterial(ctx.params)
})

jb.component('three.sampleScene', {
  type: 'three.scene',
  impl: three.scene(three.mesh(three.box()))
})
