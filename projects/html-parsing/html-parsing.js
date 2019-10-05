jb.ns('gsmArena','html-parsing')

jb.component('html-parsing.main', { /* htmlParsing.main */
  type: 'control',
  impl: group({
    title: '',
    controls: [
      itemlist({
        items: pipeline('%$phone%', keys()),
        controls: [
          text({title: 'property', text: '%%', features: field.columnWidth('200')}),
          text({title: 'value', text: pipeline('%$phone/{%%}%')})
        ],
        style: table.withHeaders(),
        features: [css.width('446')]
      }),
      itemlist({
        items: '%$phone/spec-list%',
        controls: [
          text({title: 'feature', text: '%feature%'}),
          text({title: 'value', text: '%val%'})
        ],
        style: table.withHeaders(),
        features: [css.width('400')]
      })
    ],
    features: variable({
      name: 'phone',
      value: pipeline('%$samsung_galaxy_m30s-9818%', gsmArena.deviceParser())
    })
  })
})

jb.component('gsm-arena.device-parser', { /* gsmArena.deviceParser */
  impl: obj(
    prop(
        'name',
        extractText({
          startMarkers: '<h1 class=\"specs-phone-name-title\" data-spec=\"modelname\">',
          endMarker: '</h1>'
        })
      ),
    prop(
        'image',
        extractText({
          startMarkers: ['<div class=\"specs-photo-main\">', '<a href=\"', 'src=\"'],
          endMarker: '\"'
        })
      ),
    prop(
        'spec-list',
        pipeline(
          extractText({
              startMarkers: ['id=\"specs-list'],
              endMarker: 'class=\"note\"',
              repeating: 'true'
            }),
          extractText({
              startMarkers: 'class=\"ttl\">',
              endMarker: '</tr>',
              repeating: 'true'
            }),
          obj(
              prop('feature', extractText({startMarkers: '\">', endMarker: '<'})),
              prop('val', extractText({startMarkers: ['data-spec=', '\">'], endMarker: '<'}))
            )
        ),
        'array'
      )
  )
})



jb.component('html-parsing.makeToDevices', { /* htmlParsing.makeToDevices */
  type: 'control',
  impl: group({
    controls: [
      button({
        title: 'parse make',
        action: writeValue(
          '%$deviceUrls%',
          pipeline(
            '%$sampleMakePage%',
            extractText({startMarkers: 'class=\"makers\"', endMarker: '</ul>'}),
            extractText({startMarkers: '<a href=\"', endMarker: '.php', repeating: 'true'})
          )
        )
      }),
      button({
        title: 'crawl - devices url - parse device - store in results',
        action: runActionOnItems(
          pipeline('%$deviceUrls%', slice('0', '5')),
          runActions(
            writeValueAsynch(
                '%$devices/{%%}%',
                pipe(
                  http.get(
                      'http://jbartdb.appspot.com/jbart_db.js?op=proxy&url=https://www.gsmarena.com/%%.php'
                    ),
                  gsmArena.deviceParser()
                )
              ),
            writeValue('%$progress/{%%}%', 'done')
          )
        )
      }),
      itemlist({
        items: '%$deviceUrls%',
        controls: [
          text({title: 'url', text: '%%'}),
          text({
            title: 'status',
            text: pipeline('%$progress/{%%}%'),
            features: field.columnWidth('100')
          })
        ],
        style: table.mdl(),
        features: [css.width('600'), watchRef({ref: '%$progress%', includeChildren: 'yes'})]
      })
    ]
  })
})


jb.component('html-parsing.parseDevice', { /* htmlParsing.parseDevice */
  type: 'control',
  impl: group({

  })
})

jb.component('data-resource.progress', { /* dataResource.progress */
  watchableData: {

  }
})
