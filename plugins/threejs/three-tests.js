
jb.component('threeTest.basic', {
  impl: uiTest({
    control: three.control({
      scene: three.scene(three.box('2', '3', '3', [three.color('blue'), three.scale(0.5)])),
      camera: three.perspectiveCamera(three.point(0, 0, 5)),
      features: [three.OrbitControls()]
    }),
    expectedResult: equals(1, 1)
  }),
  type: ''
})
