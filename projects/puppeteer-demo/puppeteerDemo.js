jb.ns('puppeteerDemo')

jb.component('dataResource.events', {
  watchableData: []
})

jb.component('puppeteerDemo.main', {
  type: 'control',
  impl: group({
    controls: [
      group({
        title: '',
        layout: layout.horizontal('10'),
        controls: [
          editableText({title: 'query', databind: '%$query%'}),
          button({
            title: 'search',
            action: rx.pipe(
              pptr.session(true, pptr.gotoPage('http://www.artwaresoft.com/#?page=home'))
            ),
            raised: 'true'
          })
        ]
      }),
      itemlist({
        items: '%$events%',
        controls: [
          text('%%')
        ],
        features: watchRef('%$events%')
      }),
      group({
        controls: [
          image({url: pipeline('%$url/1%'), width: '595', height: '343'})
        ],
        features: group.wait({
          for: {
            '$': 'pptr.htmlFromPage',
            '$byValue': [
              {
                '$': 'pptr.headlessPage',
                url: 'http://www.google.com',
                extract: {'$': 'pptr.extractContent', selector: 'img', extract: 'src', multiple: true},
                features: pptr.waitForSelector({
                  selector: 'img',
                  whenDone: {'$': 'pptr.endSession', '$byValue': []}
                }),
                showBrowser: true
              }
            ]
          },
          varName: 'url'
        })
      })
    ]
  })
})

jb.component('dataResource.query', {
  watchableData: 'vitamins'
})
