
jb.component('threeTest.basic', {
  impl: uiTest({
    control: three.control({
      camera: three.perspectiveCamera(three.point(0, 0, 5)),
      features: [three.OrbitControls(), three.rotateCube()]
    }),
    expectedResult: equals(1, 1)
  })
})
