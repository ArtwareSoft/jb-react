
jb.component('threeTest.basic', {
  impl: uiTest({
    control: three.control({
      scene: three.scene(
        three.box('2', '3', '3', [three.color('blue'), three.scale(0.5), three.assign('position.y', 1)]),
        three.elementsFromItems(list('1', '2', '3'), three.box(1, 1, 1, three.assign('position.y', '%%')))
      ),
      camera: three.perspectiveCamera(three.point(0, 0, 5)),
      features: [three.OrbitControls()]
    }),
    expectedResult: equals(1, 1)
  }),
  type: ''
})
