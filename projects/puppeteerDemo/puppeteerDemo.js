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
                pptr.gotoPage({url: 'https://google.com/', waitUntil: 'networkidle0'}),
                pptr.type({
                  text: 'vitamin',
                  selector: 'input[name=q]',
                  enterAtEnd: true,
                  delay: 100
                }),
                pptr.extractBySelector({selector: 'h3', extract: 'textContent', multiple: true})
              ]
            }),
            raised: true
          }),
          button({
            title: 'search with js code',
            action: pptr.session({
              showBrowser: true,
              databindEvents: '%$events%',
              actions: pptr.function(
                async (ctx,{page}) => {
  await page.goto('https://google.com', { waitUntil: 'networkidle0' })
//const title = await page.title()
const frame = await page.mainFrame()
await frame.type('input[name=q]', 'puppeteer'+String.fromCharCode(13), { delay: 100 })
    await frame.waitForSelector('input[type=submit]')
	await jb.delay(1000)
    await frame.click('input[type=submit]')
    await frame.waitForSelector('h3 a')
    return await frame.$$eval('h3 a', anchors => { return anchors.map(a => { return a.textContent }) })

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
        controls: [text({text: json.stringify('%data%')})],
        features: watchRef({ref: '%$events%', includeChildren: 'yes'})
      }),
      group({
        layout: layout.vertical(),
        controls: [
          text({text: 'start puppeteer server:', title: 'my title', style: header.h4()}),
          text({text: 'cd .../projects/jb-puppeteer-server/', title: 'my title'}),
          text({text: 'npm start', title: 'my title'})
        ]
      })
    ]
  })
})

jb.component('dataResource.query', {
  watchableData: 'vitamins'
})

jb.component('puppeteerDemo.jbart', {
  type: 'control',
  impl: group({
    title: '',
    controls: [
      button({
        title: 'search in itemlist',
        action: rx.pipe(
          pptr.session({
              showBrowser: true,
              actions: [
                pptr.gotoPage(
                  'https://artwaresoft.github.io/jb-react/bin/studio/studio-cloud.html?project=itemlists&page=itemlists.main&profile_path=itemlists.main&host=github&hostProjectId=http://artwaresoft.github.io/jb-react/projects/itemlists'
                ),
                pptr.waitForSelector({selector: '.studio-pages-items>.jb-item:nth-child(5)'}),
                pptr.mouseClick({
                  selector: '.studio-pages-items>.jb-item:nth-child(6)',
                  button: 'left',
                  clickCount: '1',
                  delay: '100'
                }),
                pptr.waitForSelector('#input_0'),
                pptr.type({text: '22', selector: '#input_0', delay: 100})
              ]
            })
        )
      })
    ]
  })
})
