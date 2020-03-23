jb.component('cards.wixPostAdapter', {
    impl: obj(
      refProp('title', '%title%'),
      refProp('content', '%excerpt%'),
      prop(
          'image',
          pipeline(
            '%coverImage%',
            extractPrefix('.jpg/'),
            replace({find: 'image://v1/', replace: 'https://static.wixstatic.com/media/'}),
            '%%.jpg/v1/fit/w___WIDTH__,h___HEIGHT__,al_c,q_80/file.png'
          )
        )
    )
  })