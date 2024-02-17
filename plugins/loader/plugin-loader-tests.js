component('loaderTest.studio', {
  impl: dataTest({
    calculate: pipeline(
      '%$PROJECTS_PATH%/jb-react/projects/studio/studio-main.js',
      typeAdapter('source-code<loader>', sourceCode(pluginsByPath('%%'), plugins('tgp-model-data'), {
        pluginPackages: packagesByPath('%%'),
        libsToInit: 'utils,tgp'
      }))
    ),
    expectedResult: and(equals('%projects/0%', 'studio'), equals(join({ items: '%plugins%' }), 'studio,tgp-model-data'))
  })
})

component('loaderTest.external', {
  impl: dataTest({
    calculate: pipeline(
      '%$PROJECTS_PATH%/amta/plugins/amta-parsing/parsing-tests.js',
      typeAdapter('source-code<loader>', sourceCode(pluginsByPath('%%'), plugins('tgp-model-data'), {
        pluginPackages: packagesByPath('%%'),
        libsToInit: 'utils,tgp'
      })),
      prettyPrint({ noMacros: true })
    ),
    expectedResult: contains(`{$: 'fileSystem', repo: 'amta', baseDir: '%$PROJECTS_PATH%/amta'}`,`plugins: ['amta-parsing-tests','tgp-model-data']`)
  })
})
