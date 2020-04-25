jb.ns('puppeteerDemo')

jb.component('puppeteerDemo.main', {
  type: 'control',
  impl: group({
    controls: [
      button('my button'),
      pptr.control(
        pptr.headlessPage({
          url: 'http://www.google.com',
          extract: pptr.extractContent({selector: 'img', extract: 'src'}),
          features: pptr.waitForSelector({selector: 'img', whenDone: pptr.endSession()}),
          showBrowser: true
        })
      ),
      group({
        controls: [
          image({url: pipeline('%$url/1%'), width: '100', height: '245'})
        ],
        features: group.wait({
          for: pptr.htmlFromPage(
            pptr.headlessPage({
              url: 'http://www.google.com',
              extract: pptr.extractContent({selector: 'img', extract: 'src', multiple: true}),
              features: pptr.waitForSelector({selector: 'img', whenDone: pptr.endSession()}),
              showBrowser: true
            })
          ),
          varName: 'url'
        })
      })
    ]
  })
})
