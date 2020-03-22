jb.ns('html-parsing')

jb.component('htmlParsing.main', {
  type: 'control',
  impl: group({
    title: '',
    controls: [
      itemlist({
        items: pipeline('%$phone%', keys()),
        controls: [
          text({text: '%%', title: 'property', features: field.columnWidth('200')}),
          text({text: pipeline('%$phone/{%%}%'), title: 'value'})
        ],
        style: table.plain(),
        features: [css.width('446')]
      }),
      itemlist({
        items: '%$phone/spec-list%',
        controls: [
          text({text: '%feature%', title: 'feature'}),
          text({text: '%val%', title: 'value'})
        ],
        style: table.plain(),
        features: [css.width('400')]
      })
    ],
    features: variable({
      name: 'phone',
      value: pipeline('%$samsung_galaxy_m30s-9818%', htmlParsing.deviceParser())
    })
  })
})

jb.component('htmlParsing.deviceParser', {
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
        value: extractText({startMarkers: ['<td', '>'], endMarker: '<'})
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
  ),
  testData: '%$samsung_galaxy_m30s-9818%'
})


jb.component('htmlParsing.makeToDevices', {
  type: 'control',
  impl: group({
    controls: [
      button({
        title: 'parse products page into urls',
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
        title: 'crawl devices urls - parse device - store in results',
        action: runActionOnItems(
          pipeline('%$deviceUrls%', slice('0', '5')),
          runActions(
            writeValue(
                '%$devices/{%%}%',
                pipe(
                  http.get('https://www.gsmarena.com/%%.php'),
                  htmlParsing.deviceParser(),
                  first()
                )
              ),
            writeValue('%$progress/{%%}%', 'done')
          )
        )
      }),
      itemlist({
        items: '%$deviceUrls%',
        controls: [
          text({text: '%%', title: 'url'}),
          text({
            text: pipeline('%$progress/{%%}%'),
            title: 'status',
            features: field.columnWidth('100')
          })
        ],
        style: table.mdc(),
        visualSizeLimit: '4',
        features: [css.width('600'), watchRef({ref: '%$progress%', includeChildren: 'yes'})]
      })
    ]
  })
})


jb.component('htmlParsing.parseDevice', {
  type: 'control',
  impl: group({
    controls: [
      group({
        layout: layout.horizontal(),
        controls: [
          text({
            text: pipeline(
              '%$devices%',
              properties(),
              wrapAsObject({
                  propertyName: '%id%',
                  value: pipeline(
                    '%val%',
                    assign(prop('Size', split({separator: 'inch', text: '%Size%', part: 'first'})))
                  )
                })
            ),
            title: 'fix values'
          }),
          itemlist({
            items: pipeline('%$devices%', properties(), '%val%'),
            controls: [
              text({text: '%name%', title: 'name', features: field.columnWidth('300')}),
              text({text: pipeline('%Price%', matchRegex('[0-9]+')), title: 'price'})
            ],
            style: table.plain(),
            visualSizeLimit: '12',
            features: [
              itemlist.selection({databind: '%$sel%'}),
              itemlist.keyboardSelection({}),
              css.width('600')
            ]
          }),
          group({
            style: propertySheet.titlesLeft({}),
            controls: [
              text({
                text: split({separator: 'inches', text: '%Size%', part: 'first'}),
                title: 'size'
              }),
              text({
                text: split({separator: ' ', text: '%Weight%', part: 'first'}),
                title: 'weight'
              }),
              text({text: matchRegex('[0-9]+', '%battery%'), title: 'battery'}),
              text({
                text: split({separator: 'out', text: '%Price%', part: 'second'}),
                title: 'price'
              }),
              text({
                text: split({separator: 'sed', text: '%Status%', part: 'second'}),
                title: 'year'
              }),
              image({
                url: '%image%',
                width: '100',
                height: '100',
                features: field.title('image')
              })
            ],
            features: [group.data('%$selected2%'), watchRef('%$selected%')]
          })
        ],
        features: variable({name: 'selected2', watchable: true})
      })
    ]
  })
})

jb.component('dataResource.progress', {
  watchableData: {
    
  }
})

jb.component('dataResource.sel', {
  watchableData: {
    Technology: 'GSM / HSPA / LTE',
    '2G bands': 'GSM 850 / 900 / 1800 / 1900 - SIM 1 & SIM 2 (dual-SIM model only)',
    '3G bands': 'HSDPA',
    '4G bands': 'LTE (unspecified)',
    Speed: 'HSPA 42.2/5.76 Mbps, LTE Cat4 150/50 Mbps',
    GPRS: 'Yes',
    EDGE: 'Yes',
    Announced: '2016, August',
    Status: 'Available. Released 2016, December',
    Dimensions: '153.8 x 75.6 x 8.5 mm (6.06 x 2.98 x 0.33 in)',
    Weight: '169 g (5.96 oz)',
    SIM: 'Single SIM (Micro-SIM) or Hybrid Dual SIM (Micro-SIM, dual stand-by)',
    Type: 'IPS LCD capacitive touchscreen, 16M colors',
    Size: '5.5 inches, 83.4 cm',
    Resolution: '1080 x 1920 pixels, 16:9 ratio (~401 ppi density)',
    OS: 'Android 6.0 (Marshmallow)',
    Chipset: 'Mediatek MT6753 (28 nm)',
    CPU: 'Octa-core 1.3 GHz Cortex-A53',
    GPU: 'Mali-T720MP3',
    'Card slot': 'microSD, up to 256 GB (uses shared SIM slot)',
    Internal: '32GB 3GB RAM',
    Single: '5 MP',
    Features: 'LED flash, HDR, panorama',
    Video: '',
    Loudspeaker: undefined,
    '3.5mm jack': undefined,
    WLAN: 'Wi-Fi 802.11 b/g/n, Wi-Fi Direct, hotspot',
    Bluetooth: '4.0, A2DP',
    GPS: 'Yes, with A-GPS',
    Radio: 'FM radio',
    USB: 'microUSB 2.0',
    Sensors: 'Fingerprint (front-mounted), accelerometer, proximity',
    'Non-removable Li-Po 4080 mAh battery': 'Non-removable Li-Po 4080 mAh battery',
    Colors: 'Black, White',
    Price: 'About 250 EUR',
    name: 'Acer Liquid Z6 Plus',
    image: 'https://www.gravatar.com/avatar/2900b88d10e585a546c9ff5140591320?r=g&s=50'
  }
})

jb.component('htmlParsing.productsParser', {
  type: 'data',
  impl: pipeline(
    extractText({startMarkers: 'class=\"makers\"', endMarker: '</ul>'}),
    extractText({startMarkers: '<a href=\"', endMarker: '.php', repeating: 'true'})
  ),
  testData: '%$sampleMakePage%'
})
