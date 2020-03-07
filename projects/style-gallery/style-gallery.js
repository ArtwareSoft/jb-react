jb.ns('style-gallery')

jb.component('person',{ watchableData : {
  name: "Homer Simpson",
  male: true,
  isMale: 'yes',
  age: 42
}})

jb.component('style-gallery.styles-of-ui-component', {
  params: [
    {id: 'component', as: 'string'}
  ],
  impl: (ctx,component) => ctx.frame().parent.jb.studio.PTsOfType(component)
    .filter(x=>['custom-style','style-by-control','style-with-features'].indexOf(x) == -1).sort()
})

const variations = { button: { prop: 'raised', values: [true,false] }}

'button,text,editable-text,editable-number,editable-boolean,group,itemlist,picklist,image'.split(',')
.forEach(ctrl=>
  jb.component(`style-gallery.${ctrl}`,  { type: 'control',
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
          databind: '%$person/name%',
          title: 'hello',
          text: 'text1',
          items: '%$person/name%',
          control: text('%%'),
          controls: [text({ title: 'title1', text: 'text1'} ),text({ title: 'title2', text: 'text2'}) ],
          options: picklist.options('%$people/name%'),
          style: ctx => ctx.run({$: ctx.data}),
          url: 'https://freesvg.org/img/UN-CONSTRUCTION-2.png',
          width: 100,
          height: 100,
        }].flatMap(prof=>[(variations[ctrl]|| {prop: 'x', values:[1]})].flatMap(e=> e.values.map(val => ({...prof, [e.prop] : val }))))
      }),
      itemVariable: '__style'
    })

  }),
}))

jb.component('data-resource.person', { /* dataResource.person */
  watchableData: {
    name: 'Homer Simpson',
    male: true,
    isMale: 'yes',
    age: 42
  }
})

jb.component('data-resource.people',{ watchableData : [
  { "name": "Homer Simpson" ,age: 42 , male: true},
  { "name": "Marge Simpson" ,age: 38 , male: false},
  { "name": "Bart Simpson"  ,age: 12 , male: true}
]});


