jb.ns('puppeteerDemo')

jb.component('dataResource.events', {
  watchableData: [

  ]
})

jb.component('puppeteerDemo.main', {
  type: 'control',
  impl: group({
    controls: [
      group({
        title: '',
        layout: layout.flex({alignItems: 'baseline', spacing: '10'}),
        controls: [
          editableText({title: 'query', databind: '%$query%'}),
          button({
            title: 'refresh server code',
            action: pptr.sendCodeToServer(),
            raised: 'true'
          }),
          button({
            title: 'search',
            action: pptr.session({
              showBrowser: true,
              databindEvents: '%$events%',
              actions: [
                pptr.gotoPage({url: 'http://www.google.com/', waitUntil: 'networkidle0'}),
                pptr.waitForSelector('form input[name=q]'),
                pptr.type({
                  text: 'vitamin',
                  selector: 'form input[name=q]',
                  enterAtEnd: true,
                  delay: '100'
                }),
                pptr.mouseClick('input[type=\"submit\"]'),
                pptr.extractBySelector({selector: 'h3 a', extract: 'value'})
              ]
            }),
            raised: 'true'
          }),
          button({
            title: 'search2',
            action: pptr.session({
              showBrowser: true,
              databindEvents: '%$events%',
              actions: pptr.function(
                async (ctx,{page}) => { 
  await page.goto('https://google.com', { waitUntil: 'networkidle0' }) 
const title = await page.title()
await page.type('input[name=q]', 'puppeteer', { delay: 100 })
    await page.click('input[type="submit"]')
    await page.waitForSelector('h3 a')
    return await page.$$eval('h3 a', anchors => { return anchors.map(a => { return a.textContent }) })

}
              )
            }),
            raised: 'true'
          })
        ],
        features: variable({
          name: 'pptrSession',
          value: pptr.session({showBrowser: true, databindEvents: []})
        })
      }),
      itemlist({
        items: '%$events%',
        controls: [
          text({text: json.stringify('%%')})
        ],
        features: watchRef({ref: '%$events%', includeChildren: 'yes'})
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
                features: pptr.waitForSelector('img'),
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
