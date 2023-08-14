using('ui')
component('dataResource.people', {
  watchableData: [
    {
      name: 'Homer',
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

component('helloWorld.main', {
  type: 'control',
  impl: group({
    controls: [
      group({
        title: '',
        style: group.sections(text.span()),
        controls: [
          group({
            title: 'group1',
            style: propertySheet.titlesAbove({spacing: '4'}),
            controls: [
              text({
                text: pipeline(Var('x', 'xcxcx'), '%$people%', '%name%'),
                title: 'aaaa',
                style: text.chip(),
                features: feature.icon('account_balance')
              })
            ],
            features: feature.icon('account_box')
          }),
          group({
            title: 'group2',
            style: propertySheet.titlesAbove({titleStyle: header.mdcSubtitle2(), spacing: '4'}),
            controls: [
              text({
                text: ' Hello %$people.name%',
                title: 'aaaa',
                style: text.chip(),
                features: feature.icon('account_balance')
              })
            ],
            features: feature.icon('account_box')
          })
        ]
      })
    ]
  })
})

component('helloWorld.main2', {
  type: 'control',
  impl: group({
    controls: [
      text('World')
    ]
  })
})

component('helloWorld.data1', {
  impl: pipeline('a')
})