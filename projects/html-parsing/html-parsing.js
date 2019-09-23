jb.component('html-parsing.main', { /* htmlParsing.main */
  type: 'control',
  impl: group({
    controls: [
      itemlist({
        items: pipeline('%$phone%', keys()),
        controls: [
          text({title: 'property', text: '%%', features: field.columnWidth('200')}),
          text({title: 'value', text: pipeline('%$phone/{%%}%')})
        ],
        style: table.withHeaders(),
        features: [
          css.width('446'),
          variable({name: 'phone', value: {'$': 'gsm-arena.last-page-parser'}})
        ]
      }),
      itemlist({
        items: '%$phone/spec-list%',
        controls: [
          text({title: 'feature', text: '%feature%'}),
          text({title: 'value', text: '%val%'})
        ],
        style: table.withHeaders(),
        features: [
          css.width('400'),
          variable({name: 'phone', value: {'$': 'gsm-arena.last-page-parser'}})
        ]
      })
    ],
    features: variable({name: 'phone', value: {'$': 'gsm-arena.last-page-parser'}})
  })
})

jb.component('gsm-arena.last-page-parser', { /* gsmArena.lastPageParser */
  impl: pipeline(
    "'%$samsung_galaxy_m30s-9818%",
    obj(
        prop(
            'name',
            {
              '$': 'extract-text',
              startMarkers: '<h1 class=\"specs-phone-name-title\" data-spec=\"modelname\">',
              endMarker: '</h1>'
            }
          ),
        prop(
            'image',
            {
              '$': 'extract-text',
              startMarkers: ['<div class=\"specs-photo-main\">', '<a href=\"', 'src=\"'],
              endMarker: '\"',
              includingStartMarker: undefined
            }
          ),
        prop(
            'spec-list',
            pipeline(
              {
                  '$': 'extract-text',
                  startMarkers: ['id=\"specs-list'],
                  repeating: 'true',
                  endMarker: 'class=\"note\"'
                },
              {
                  '$': 'extract-text',
                  startMarkers: 'class=\"ttl\">',
                  repeating: 'true',
                  endMarker: '</tr>'
                },
              obj(
                  prop('feature', {'$': 'extract-text', startMarkers: '\">', endMarker: '<'}),
                  prop(
                      'val',
                      {'$': 'extract-text', startMarkers: ['data-spec=', '\">'], endMarker: '<'}
                    )
                )
            ),
            'array'
          )
      )
  )
})
  

