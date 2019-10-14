jb.ns('html-parsing')

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
      value: pipeline('%$samsung_galaxy_m30s-9818%', htmlParsing.deviceParser())
    })
  })
})

jb.component('html-parsing.device-parser', { /* htmlParsing.deviceParser */
  impl: pipeline(
    Var('input', '%%'),
    dynamicObject({
        items: pipeline(
          extractText({
              startMarkers: ['id=\"specs-list'],
              endMarker: 'class=\"note\"',
              repeating: 'true'
            }),
          extractText({
              startMarkers: 'class=\"ttl\">',
              endMarker: '</tr>',
              repeating: 'true'
            })
        ),
        propertyName: extractText({startMarkers: '\">', endMarker: '<'}),
        value: extractText({startMarkers: ['data-spec=', '\">'], endMarker: '<'})
      }),
    assign(
        prop(
            'name',
            extractText({
              text: '%$input%',
              startMarkers: '<h1 class=\"specs-phone-name-title\" data-spec=\"modelname\">',
              endMarker: '</h1>'
            })
          ),
        prop(
            'image',
            extractText({
              text: '%$input%',
              startMarkers: ['<div class=\"specs-photo-main\">', '<a href=\"', 'src=\"'],
              endMarker: '\"'
            })
          )
      ),
    first()
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
          pipeline('%$deviceUrls%', slice('0', '1')),
          runActions(
            writeValueAsynch(
                '%$devices/{%%}%',
                pipe(http.get('https://www.gsmarena.com/%%.php'), htmlParsing.deviceParser())
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
        visualSizeLimit: '4',
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
