jb.component('fb.postsData', {
  type: 'data',
  params: [
      {id: 'url' }
  ],
  impl: pipe(
      pptr.htmlFromPage({page: pptr.headlessPage({
          url: '%$url%',
          extract: pptr.resultSelector('.fb-post'),
          features: pptr.endlessScrollDown(),
          }),
      }),
      extractText({})
  )
})

jb.component('fb.example1', {
  params: [
      {id: 'url'}
  ],
  impl: pptr.crawler({
      rootUrl: '%$url%',
      pageCrawlers: [
          pptr.pageCrawler({
              id: 'get posts',
              urlPattern: 'xx',
              pageFeatures: pptr.endlessScrollDown(),
              extract: pptr.resultSelector({selector: 'a', value: 'href', multiple: true}),
              transformToUrlRequests: obj(prop('url','%%'), prop('varsForFollowing',obj(prop('a','')), prop('nextPptrPageType','parse posts'))),
          }),
          pptr.pageCrawler({
              id: 'parse posts',
              urlPattern: 'yy',
              pageFeatures: pptr.endlessScrollDown(),
              extract: pptr.resultSelector('.fb-post'),
              transformToResultItems: extractText({}),
          }),
      ]
  })
})

jb.component('puppeteer.artwaresoft.basic', {
  impl: dataTest({
    heavy: true,
    calculate: pptr.htmlFromPage(
          pptr.headlessPage({
            showBrowser: true,
            url: 'http://artwaresoft.com',
            extract: pptr.extractContent({selector: '.fld__Label3', extract: 'innerHTML'})
          })
    ),
    expectedResult: contains('Leading Edge DSL Technology')
  })
})

