jb.ns('cards,cards-demo,style-gallery')

jb.component('cardsDemo.main', {
  impl: group({
    layout: layout.horizontal('20'),
    controls: [
      card({
        data: '%$wixBlog/items%',
        style: card.box290(),
        adapter: cards.wixPostAdapter()
      })
    ]
  })
})

jb.component('styleGallery.stylesOfUiComponent', {
  params: [
    {id: 'component', as: 'string'}
  ],
  impl: (ctx,component) => ctx.frame().parent.jb.studio.PTsOfType(component)
    .filter(x=>['customStyle','styleByControl','styleWithFeatures'].indexOf(x) == -1).sort()
})

'card,cardList,cardFilter'.split(',')
.forEach(ctrl=>
  jb.component(`cardsDemo.${ctrl}`,  { type: 'control',
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

jb.component('cardsDemo.phone', {
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
        ]
      })
    ],
    features: group.data({data: '%$phones/0%', itemVariable: ''})
  })
})

jb.component('cardsDemo.card', {
  type: 'control',
  impl: group({
    layout: layout.grid({columnSizes: list('600'), columnGap: '10px', rowGap: '10px'}),
    style: group.sections({
      titleStyle: header.mdcHeadline6(),
      sectionStyle: styleWithFeatures(group.div(), [css.padding({left: '10', bottom: '20'})]),
      innerGroupStyle: styleWithFeatures(group.div(), [css.padding({top: '20', right: '20'})])
    }),
    controls: dynamicControls({
      controlItems: styleGallery.stylesOfUiComponent('card.style'),
      genericControl: group({
        title: pipeline('%$__style%', suffix('.')),
        controls: [
          card({
            data: '%$wixBlog/items/0%',
            style: ctx => ctx.run({$: ctx.vars.__style}),
            adapter: cards.wixPostAdapter()
          })
        ]
      }),
      itemVariable: '__style'
    })
  })
})

jb.component('cardsDemo.cardList', {
  type: 'control',
  impl: group({
    layout: layout.grid({columnSizes: list('600'), columnGap: '10px', rowGap: '10px'}),
    style: group.sections({
      titleStyle: header.mdcHeadline6(),
      sectionStyle: styleWithFeatures(group.div(), [css.padding({left: '10', bottom: '20'})]),
      innerGroupStyle: styleWithFeatures(group.div(), [css.padding({top: '20', right: '20'})])
    }),
    controls: dynamicControls({
      controlItems: styleGallery.stylesOfUiComponent('card-list.style'),
      genericControl: group({
        title: pipeline('%$__style%', suffix('.')),
        controls: [
          cardList({
            data: '%$wixBlog/items/0%',
            style: ctx => ctx.run({$: ctx.vars.__style}),
            adapter: cards.wixPostAdapter()
          })
        ]
      }),
      itemVariable: '__style'
    })
  })
})
