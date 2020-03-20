jb.ns('cards,cards-demo,style-gallery')

jb.component('cards-demo.main', { /* cardsDemo.main */
  impl: group({
    layout: layout.horizontal('20'),
    controls: [
      card({
        data: '%$wix-blog/items/0%',
        style: card.box290(),
        adapter: cards.wixPostAdapter()
      })
    ]
  })
})

jb.component('style-gallery.styles-of-ui-component', {
  params: [
    {id: 'component', as: 'string'}
  ],
  impl: (ctx,component) => ctx.frame().parent.jb.studio.PTsOfType(component)
    .filter(x=>['custom-style','style-by-control','style-with-features'].indexOf(x) == -1).sort()
})

'card,card-list,card-filter'.split(',')
.forEach(ctrl=>
  jb.component(`cards-demo.${ctrl}`,  { type: 'control',
  impl: group({
    layout: layout.grid({
      columnSizes: list('600'),
      columnGap: '10px',
      rowGap: '10px'
    }),
    style: group.sections({
      titleStyle: header.mdcHeadline6(),
      sectionStyle: styleWithFeatures(
        group.div(),
        [css.padding({left: '10', bottom: '20'})]
      ),
      innerGroupStyle: styleWithFeatures(group.div(), [css.padding({top: '20', right: '20'})])
    }),
    controls: dynamicControls({
      controlItems: styleGallery.stylesOfUiComponent(jb.comps[ctrl].params.find(p=>p.id =='style').type),
      genericControl: group({
        title: pipeline('%$__style%', suffix('.')),
        controls: [{$: ctrl,
          data: '%$wix-blog/items/0%',
          adapter: cards.wixPostAdapter(),
          style: ctx => ctx.run({$: ctx.vars.__style}),
        }]
        //.flatMap(prof=>[(variations[ctrl]|| {prop: 'x', values:[1]})].flatMap(e=> e.values.map(val => ({...prof, [e.prop] : val }))))
      }),
      itemVariable: '__style'
    })
  }),
}))

jb.component('cards-demo.phone', { /* cardsDemo.phone */
  type: 'control',
  impl: group({
    controls: [
      group({
        controls: [
          text({text: '%title%', title: 'my title'}),
          image({url: '%image%', width: '200', height: '200'}),
          group({
            layout: layout.horizontal('20'),
            controls: [
              text({text: '%hits% hits', title: 'hits'}),
              text({text: '%Technology%', title: 'technology'})
            ]
          })
        ],
        features: group.data({data: '%$phones[0]%', itemVariable: ''})
      })
    ]
  })
})
