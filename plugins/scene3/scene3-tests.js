jb.component('scene3Test.basic', {
  impl: uiTest({
    control: scene3.control({
      scene: scene(
        elementsFromItems(
          pipeline(range(undefined, 5), math.div('%%', 5)),
          sphere(0.05, [assign('position.z', '%%'), assign('position.y', 1), assign('position.x', -1)])
        )
      ),
      camera: perspectiveCamera(point(10, '0', 3), 30),
      lights: allDirectionsLight(),
      features: [OrbitControls()]
    }),
    expectedResult: contains('cmp-id')
  })
})
