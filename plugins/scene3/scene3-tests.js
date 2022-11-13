
jb.component('scene3Test.basic', {
  impl: uiTest({
    control: scene3.control({
      scene: scene(
        elementsFromItems(
          pipeline(range(), math.div('%%', 10)),
          sphere(0.05, [assign('position.z', '%%'), assign('position.y', 1), assign('position.x', -1)])
        ),
        allDirectionsLight()
      ),
      camera: perspectiveCamera(point(0, 0, 5)),
      lights: [],
      features: [OrbitControls()]
    }),
    expectedResult: equals(1, 1)
  })
})
