jb.ns('style-gallery')

jb.component('person',{ watchableData : {
  name: "Homer Simpson",
  male: true,
  isMale: 'yes',
  age: 42
}})

jb.component('galleryMultiChoice',{ watchableData : {
  result: ["Homer Simpson"],
}})

jb.component('styleGallery.stylesOfUiComponent', {
  params: [
    {id: 'component', as: 'string'}
  ],
  impl: (ctx,component) => ctx.frame().parent.jb.studio.PTsOfType(component)
    .filter(x=>['customStyle','styleByControl','styleWithFeatures'].indexOf(x) == -1).sort()
})

const variations = { button: { prop: 'raised', values: [true,false] }}

'button,text,editableText,editableNumber,editableBoolean,group,itemlist,picklist,image,multiSelect'.split(',')
.forEach(ctrl=>
  jb.component(`styleGallery.${ctrl}`,  { type: 'control',
  impl: group({
    layout: layout.grid({
      columnSizes: list('320', '320', '320'),
      columnGap: '10px',
      rowGap: '10px'
    }),
    style: group.sections({
      titleStyle: header.mdcHeadline6(),
      sectionStyle: styleWithFeatures(
        group.div(),
        [group.card(), css.padding({left: '10', bottom: '20'})]
      ),
      innerGroupStyle: styleWithFeatures(group.div(), [css.padding({top: '20', right: '20'})])
    }),
    controls: dynamicControls({
      controlItems: styleGallery.stylesOfUiComponent(jb.comps[ctrl].params.find(p=>p.id =='style').type),
      genericControl: group({
        title: pipeline('%$__style%', suffix('.')),
        controls: [{$: ctrl,
          ... (ctrl == 'editableNumber' ? { databind: '%$person/age%' }
            : ctrl == 'multiSelect' ? { databind: '%$galleryMultiChoice/result%' }
            : { databind: '%$person/name%' } ),
          title: 'title',
          text: 'hello world',
          items: '%$people%',
          control: text('%%'),
          ... (ctrl == 'itemlist' && { controls: [text({ text: '%name%', title: 'name'}), text({ text: '%age%', title: 'age'}) ]}),
          ... (ctrl == 'group' && { controls: [text({ title: 'title1', text: 'text1',
                features: [
                  feature.icon({icon: 'Account', position: 'pre', type: 'mdi'}),
                  feature.icon({icon: 'delete', position: 'post', type: 'mdc'}),
                  feature.icon({icon: 'AccountAlertOutline', position: 'raised', type: 'mdi'})
                ]          
              } ),text({ title: 'title2', text: 'text2',
                features: [
                  feature.icon({icon: 'Account', position: 'pre', type: 'mdi'}),
//                  feature.icon({icon: 'delete', position: 'post', type: 'mdc'}),
                  feature.icon({icon: 'AccountAlertOutline', position: 'raised', type: 'mdi'})
                ]          
              }) ] }),
          options: picklist.options('%$people/name%'),
          style: ctx => ctx.run({$: ctx.data}),
          url: 'https://freesvg.org/img/UN-CONSTRUCTION-2.png',
          width: 100,
          height: 100,
          features: [
            feature.icon({icon: 'Account', position: 'pre', type: 'mdi'}),
            feature.icon({icon: 'delete', position: 'post', type: 'mdc'}),
            feature.icon({icon: 'AccountAlertOutline', position: 'raised', type: 'mdi'})
          ]          
        }].flatMap(prof=>[(variations[ctrl]|| {prop: 'x', values:[1]})].flatMap(e=> e.values.map(val => ({...prof, [e.prop] : val }))))
      }),
      itemVariable: '__style'
    })

  }),
}))

jb.component('dataResource.person', {
  watchableData: {
    name: 'Homer Simpson',
    male: true,
    isMale: 'yes',
    age: 42
  }
})

jb.component('dataResource.people', {
  watchableData: [
    {name: 'Homer Simpson', age: 42, male: true},
    {name: 'Marge Simpson', age: 38, male: false},
    {name: 'Bart Simpson', age: 12, male: true}
  ]
})
jb.component('dataResource.people',{ watchableData : [
  { "name": "Homer Simpson" ,age: 42 , male: true},
  { "name": "Marge Simpson" ,age: 38 , male: false},
  { "name": "Bart Simpson"  ,age: 12 , male: true}
]});


