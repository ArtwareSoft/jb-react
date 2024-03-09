using('tgp-core')

component('logsView.main', {
  params: [
    {id: 'logs'}
  ],
  type: 'control',
  impl: group({
    controls: group({
      controls: [
        logsView.toolbar(),
        group({
          controls: [
            itemlist({
              items: If({
                condition: isEmpty('%$logsView/logsViewQuery%'),
                then: '%$logs%',
                Else: pipeline('%$logs%', filter(contains('%$logsView/logsViewQuery%', { allText: '%logNames%' })))
              }),
              controls: text('%logNames%', {
                features: feature.byCondition(inGroup(list('exception','error'), '%logNames%'), css.color('var(--jb-error-fg)'))
              }),
              features: [
                itemlist.selection('%$logsView/selected%'),
                itemlist.keyboardSelection(),
                css.width('400', { minMax: 'min' })
              ]
            }),
            text(prettyPrint('%$logsView/selected%'), {
              style: text.codemirror({
                enableFullScreen: true,
                height: '600',
                lineWrapping: true,
                lineNumbers: true,
                formatText: false
              }),
              features: [
                watchRef('%$logsView/selected%'),
                codemirror.fold()
              ]
            })
          ],
          layout: layout.horizontal()
        })
      ],
      features: watchRef('%$logsView/logsViewQuery%', { allowSelfRefresh: true })
    }),
    features: watchable('logsView', obj())
  })
})

component('logsView.toolbar', {
  type: 'control',
  impl: group({
    controls: [
      editableText('query', '%$logsView/logsViewQuery%', {
        style: editableText.input(),
        features: [
          htmlAttribute('placeholder', 'query'),
          css.class('toolbar-input'),
          css.height('10'),
          css.margin('4'),
          css.width('300')
        ]
      })
    ],
    layout: layout.horizontal('2'),
    features: chromeDebugger.colors()
  })
})

component('chromeDebugger.colors', {
  type: 'feature',
  impl: features(
    css.color('var(--jb-menu-fg)', 'var(--jb-menubar-inactive-bg)'),
    css('border: 0px;'),
    css('~ option { background: white}')
  )
})
