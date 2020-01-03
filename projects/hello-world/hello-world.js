jb.ns('helloWorld')
jb.component('hello-world.main', { /* helloWorld.main */
  type: 'control',
  impl: group({
    layout: layout.grid({columnSizes: list('200', '100', 'auto')}),
    controls: [
      text({text: 'hello there', title: 'my title'}),
      text({text: 'my text', title: 'my title', features: mdc.rippleEffect()}),
      button({title: 'click me', style: button.mdc(true)}),
      image({
        url: 'https://freesvg.org/img/UN-CONSTRUCTION-2.png',
        features: [css.height('100'), css.width('100')]
      })
    ]
  })
})

jb.component('data-resource.people', { /* dataResource.people */
  watchableData: [
    {
      name: 'Homedsf ds r',
      age: 42,
      male: false,
      children: [{name: 'Bart'}, {name: 'Lisa'}, {name: 'Maggie'}]
    },
    {
      name: 'Marge Simpson',
      age: 38,
      male: true,
      children: [{name: 'Bart'}, {name: 'Lisa'}, {name: 'Maggie'}]
    },
    {name: 'Bart Simpson', age: 12, male: false, children: []}
  ]
})

