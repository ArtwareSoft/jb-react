
jb.component('threeTest.basic', {
  impl: uiTest({
    control: three.control({
      scene: three.scene(
        three.elementsFromItems(
          pipeline(range(), math.div('%%', 10)),
          three.sphere(0.05, [three.assign('position.z', '%%'), three.assign('position.y', 1), three.assign('position.x', -1)])
        ),
        three.allDirectionsLight()
      ),
      camera: three.perspectiveCamera(three.point(0, 0, 5)),
      features: [three.OrbitControls()]
    }),
    expectedResult: equals(1, 1)
  }),
  type: ''
})
