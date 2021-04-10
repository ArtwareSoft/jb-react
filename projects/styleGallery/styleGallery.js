jb.component('styleGallery.loadStyles', {
  params: [
    {id: 'component', as: 'string'}
  ],
  impl: runActionOnItem(
      remote.data(jb.studio.PTsOfType('%$component%') ,() => jb.parent),
      codeLoader.getCodeFromRemote('%%')
  )
})

jb.component('styleGallery.stylesOfUiComponent', {
  params: [
    {id: 'ctrl', as: 'string'}
  ],
  impl: (ctx,ctrl) => 
      jb.studio.PTsOfType(ctrl).filter(x=>['customStyle','styleByControl','styleWithFeatures'].indexOf(x) == -1).sort()
})

jb.component('styleGallery.variations', {
  impl: () => ({ 
    button: { prop: 'raised', values: [true,false] } 
  })
})

jb.component('styleGallery.controlVariations', {
  internal: true,
  params: [
    {id: 'ctrl', as: 'string'},
    {id: 'style', as: 'string'},
    {id: 'variations', defaultValue: styleGallery.variations() },
  ],
  impl: group({
    title: pipeline('%$style%', suffix('.')),
    controls: (ctx,{},{ctrl,style,variations}) => [{
      $: ctrl,
      style: {$: style},
      ... (ctrl == 'editableNumber' ? { databind: '%$person/age%', autoScale: true, max: 100 }
        : ctrl == 'multiSelect' ? { databind: '%$galleryMultiChoice/result%' }
        : ctrl == 'editableBoolean' ? { databind: '%$person/male%' }
        : { databind: '%$person/name%' } ),
      title: 'title',
      text: 'hello world',
      items: '%$people%',
      control: {$: 'text', text: '%%' },
      ... (ctrl == 'itemlist' && { controls: [{ $: 'text', text: '%name%', title: 'name'}, { $: 'text', text: '%age%', title: 'age'} ]}),
      ... (ctrl == 'group' && { controls: [{ $: 'text', title: 'title1', text: 'text1',
            features: [
              {$: 'feature.icon', icon: 'Account', position: 'pre', type: 'mdi'},
              {$: 'feature.icon', icon: 'delete', position: 'post', type: 'mdc'},
              {$: 'feature.icon', icon: 'AccountAlertOutline', position: 'raised', type: 'mdi'},
            ]          
          } ,{ $: 'text', title: 'title2', text: 'text2',
            features: [
              {$: 'feature.icon', icon: 'Account', position: 'pre', type: 'mdi'},
//                  {$: 'feature.icon', icon: 'delete', position: 'post', type: 'mdc'},
              {$: 'feature.icon', icon: 'AccountAlertOutline', position: 'raised', type: 'mdi'},
            ]          
          }] }),
      options: {$: 'picklist.options', options: '%$people/name%' },
      url: 'https://freesvg.org/img/UN-CONSTRUCTION-2.png',
      width: 100,
      height: 100,
      textForTrue: 'male',
      textForFalse: 'female',
      features: [
        {$: 'feature.icon', icon: 'Account', position: 'pre', type: 'mdi'},
        {$: 'feature.icon', icon: 'delete', position: 'post', type: 'mdc'},
        {$: 'feature.icon', icon: 'AccountAlertOutline', position: 'raised', type: 'mdi'}
      ]          
    }].flatMap(prof=>[(variations[ctrl]|| {prop: 'x', values:[1]})]
      .flatMap(e=> e.values.map(val => ({...prof, [e.prop] : val }))))
      .map(profile=> ctx.run(profile))
  })
})


jb.defComponents('button,text,editableText,editableNumber,editableBoolean,group,itemlist,picklist,image,multiSelect'.split(','),
  ctrl => jb.component(`styleGallery.${ctrl}`, ({ 
    type: 'control',
    params: [
      {id: 'ctrl', as: 'string', defaultValue: ctrl}
    ],
    require: [ {$: ctrl}, {$: 'feature.icon'}, ...(jb.studio.PTsOfType(jb.comps[ctrl].params.find(p=>p.id =='style').type).map(style=>({$: style})) )],
    impl: group({
  //    features: group.wait(styleGallery.loadStyles('%$ctrl%')),
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
        controlItems: styleGallery.stylesOfUiComponent(({},{},{ctrl}) => jb.comps[ctrl].params.find(p=>p.id =='style').type),
        genericControl: styleGallery.controlVariations('%$ctrl%','%$style%'),
        itemVariable: 'style'
      })
    }),
})))

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

jb.component('galleryMultiChoice',{ watchableData : {
  result: ["Homer Simpson"],
}})