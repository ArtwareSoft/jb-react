jb.component('person',{ watchableData : {
  name: "Homer Simpson",
  male: true,
  isMale: 'yes',
  age: 42
}})

jb.component('people',{ watchableData : [
  { "name": "Homer Simpson" ,age: 42 , male: true},
  { "name": "Marge Simpson" ,age: 38 , male: false},
  { "name": "Bart Simpson"  ,age: 12 , male: true}
]});

jb.component('picklists.main', { /* picklists.main */
  type: 'control',
  impl: group({
    layout: layout.flex({alignItems: '', justifyContent: '', direction: 'row', wrap: 'wrap'}),
    style: group.sections({
      titleStyle: header.mdcHeadline5(),
      sectionStyle: styleWithFeatures(
        group.div(),
        [group.card(), css.padding({left: '10', bottom: '20'})]
      ),
      innerGroupStyle: styleWithFeatures(group.div(), [css.padding({right: '50'})])
    }),
    controls: [
      dynamicControls({
        controlItems: pipeline(
          ctx => ctx.frame().parent.jb.studio.PTsOfType('picklist.style').filter(x=>x.indexOf('picklist') != -1)
        ),
        genericControl: picklist({
          title: pipeline('%$picklistStyle%', suffix('.')),
          databind: '%$person/name%',
          options: picklist.options('%$people/name%'),
          style: ctx => ctx.run({$: ctx.data})
        }),
        itemVariable: 'picklistStyle'
      })
    ]
  }),
  options: [
    picklist.options('%$people/name%')
  ]
})


jb.component('data-resource.person', { /* dataResource.person */
  watchableData: {
    name: 'Homer Simpson',
    male: true,
    isMale: 'yes',
    age: 42
  }
})

jb.component('picklists.custom', { /* picklists.custom */
  type: 'control',
  impl: group({
    controls: [
      picklist({
        title: 'hyperlinks',
        databind: '%$person/name%',
        options: picklist.options('%$people/name%'),
        features: watchRef('%$person/name%')
      }),
      picklist({
        title: '',
        databind: '%$person/name%',
        options: picklist.options('%$people/name%'),
        style: picklist.nativeMdLook()
      })
    ]
  })
})
