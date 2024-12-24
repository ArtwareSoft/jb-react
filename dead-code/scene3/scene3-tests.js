jb.component('scene3Test.basic', {
  impl: uiTest({
    control: scene3.control({
      scene: scene(box({depth: 0.1, meshParams: [assign()]})),
      camera: perspectiveCamera(),
      lights: allDirectionsLight(),
      features: [OrbitControls()]
    }),
    expectedResult: contains('cmp-id')
  })
})
