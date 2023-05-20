

component('studio.browseRx', {
  type: 'control',
  params: [
    {id: 'rx'}
  ],
  impl: itemlist({
        items: '%$rx%',
        controls: ui.dataBrowse('%d/vars%'),
        style: itemlist.ulLi(),
        features: [
          itemlist.incrementalFromRx(),
          css.height({height: '100%', overflow: 'scroll', minMax: 'max'})
        ]
  })
})

component('studio.showRxSniffer', {
  type: 'control',
  params: [
    {id: 'snifferLog'}
  ],
  impl: itemlist({
        items: source.data('%$snifferLog/result%'),
        controls: group({
          layout: layout.flex({spacing: '0'}),
          controls: [
            group({
              title: 'data',
              layout: layout.flex({justifyContent: data.if('%dir%==in', 'flex-start', 'flex-end')}),
              controls: ui.dataBrowse('%d%'),
              features: [css.width('100%'), css.margin({left: '10'})]
            }),
            button({
              title: '%dir%',
              action: openDialog({
                id: '',
                style: dialog.popup(),
                content: group({
                  controls: [
                    ui.dataBrowse('%d/vars%')
                  ]
                }),
                title: 'variables',
                features: dialogFeature.uniqueDialog('variables')
              }),
              style: button.href(),
              features: [css.margin({left: '10'}), feature.hoverTitle('show variables')]
            }),
            text({
              text: '%t%',
              title: 't',
              style: text.span(),
              features: [css.opacity('0.5'), css.margin({left: '10'})]
            }),
            text({
              text: '%time%',
              title: 'time',
              style: text.span(),
              features: [css.opacity('0.5'), css.margin({left: '10'})]
            })
          ],
          features: feature.byCondition('%dir%==out', css.color({background: 'var(--jb-menubar-inactive-bg)'}))
        }),
        style: itemlist.ulLi(),
        visualSizeLimit: 7,
        features: [
          itemlist.incrementalFromRx(),
          css.height({height: '100%', overflow: 'scroll', minMax: 'max'})
        ]
   })
})

