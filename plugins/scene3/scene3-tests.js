jb.component('scene3Test.basic', {
  impl: uiTest({
    control: scene3.control({
      scene: scene(
        elementsFromItems(
          pipeline(range(), math.div('%%', 10)),
          sphere(0.05, [assign('position.z', '%%'), assign('position.y', 1), assign('position.x', -1)])
        )
      ),
      camera: perspectiveCamera(point(0, 0, 5)),
      lights: allDirectionsLight(),
      features: [OrbitControls()]
    }),
    expectedResult: contains('cmp-id')
  })
})
