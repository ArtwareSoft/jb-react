component('dataResource.events', {
  watchableData: [

  ]
})

component('puppeteerDemo.main', {
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
            action: pptr.refreshServerCode(),
            raised: 'true'
          }),
          button({
            title: 'search',
            action: {
              '$': 'pptr.session',
              showBrowser: true,
              databindEvents: '%$events%',
              actions: [
                pptr.newPage({url: 'https://google.com/', waitUntil: 'networkidle0'}),
                pptr.selectElement({select: pptr.querySelector('input')}),
                pptr.type({text: 'vitamin', enterAtEnd: true, delay: 100}),
                pptr.selectElement({select: pptr.querySelector('h3', true), startAt: '%$page%'}),
                rx.flatMapArrays(),
                pptr.selectElement({select: pptr.jsProperty('textContent')})
              ]
            },
            raised: true
          }),
          button({
            title: 'search with js code',
            action: {
              '$': 'pptr.session',
              showBrowser: true,
              databindEvents: '%$events%',
              actions: pptr.javascriptOnPptr(
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
            },
            raised: 'true'
          })
        ],
        features: variable({
          name: 'pptrSession',
          value: {'$': 'pptr.session', showBrowser: true, databindEvents: []}
        })
      }),
      itemlist({
        items: '%$events%',
        controls: [
          text({text: json.stringify('%data%')})
        ],
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

component('dataResource.query', {
  watchableData: 'vitamins'
})

component('puppeteerDemo.jbart', {
  type: 'control',
  impl: group({
    title: '',
    controls: [
      button({
        title: 'search in itemlist',
        action: pptr.session({
          showBrowser: true,
          actions: [
            pptr.newPage(
              'https://artwaresoft.github.io/jb-react/bin/studio/studio-cloud.html?project=itemlists&page=itemlists.main&profile_path=itemlists.main&host=github&hostProjectId=http://artwaresoft.github.io/jb-react/projects/itemlists'
            ),
            pptr.waitForSelector('.studio-pages-items>.jb-item:nth-child(5)'),
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
      })
    ]
  })
})


component('puppeteerDemo.preview', {
  type: 'control',
  impl: group({
    title: '',
    controls: [
      button({
        title: 'refresh server code',
        action: pptr.sendCodeToServer(),
        raised: false
      }),
      button({
        title: 'preview',
        action: pptr.session({
          showBrowser: true,
          actions: [
            pptr.newPage('http://localhost:8082/project/studio/itemlists'),
            pptr.selectElement({select: pptr.elementWithText('tableWithSearch')}),
            pptr.mouseClick({button: 'left', clickCount: 1, delay: 100}),
            pptr.selectElement({
              select: pptr.jsFunction("document.querySelector('iframe')")
            }),
            pptr.contentFrame(),
            rx.var('frame'),
            pptr.selectElement({select: pptr.querySelector('input')}),
            pptr.type('Marg'),
            pptr.selectElement({
              select: pptr.querySelector('.jb-item td:first-child', true),
              startAt: '%$frame%'
            }),
            rx.flatMapArrays(),
            pptr.selectElement({select: pptr.jsProperty('textContent')}),
            pptr.logData()
          ]
        })
      })
    ]
  })
})

component('puppeteerDemo.gsmArena', {
  type: 'control',
  impl: group({
    title: '',
    controls: [
      button({
        title: 'get phones',
        action: pptr.session({
          showBrowser: true,
          databindEvents: '%$phones%',
          processData: rx.innerPipe(rx.map(obj(prop('title', slice('0', 10))))),
          actions: [
            pptr.newPage({url: 'https://www.gsmarena.com/', waitUntil: 'load'}),
            pptr.elementWithText('Top 10 by daily interest'),
            pptr.xpath('..//a/@href'),
            rx.flatMapArrays(),
            pptr.jsProperty('value'),
            rx.take(2),
            pptr.newPage('https://www.gsmarena.com/%%'),
            pptr.selectElement({select: pptr.querySelector('.article-info')}),
            pptr.jsProperty('innerHTML'),
            pptr.logData()
          ]
        })
      }),
      itemlist({
        title: '',
        items: '%$phones%',
        controls: [
          text({text: '%title%', title: 'my title'})
        ]
      })
    ]
  })
})