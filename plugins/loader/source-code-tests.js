component('sourceCodeTest.studio', {
  impl: dataTest({
    calculate: pipeline(
      '%$PROJECTS_PATH%/jb-react/projects/studio/studio-main.js',
      typeAdapter('source-code<loader>', sourceCode(pluginsByPath('%%'), plugins('tgp-model-data'), {
        pluginPackages: packagesByPath('%%'),
        libsToInit: 'utils,tgp'
      })),
      first()
    ),
    expectedResult: equals(asIs({
      plugins: ['studio','tgp-model-data'],
      projects: ['studio'],
      libsToInit: 'utils,tgp'
    }))
  })
})

component('sourceCodeTest.sourceCodeByTgpPath', {
  impl: dataTest({
    calculate: typeAdapter('source-code<loader>', sourceCodeByTgpPath('test<>sourceCodeTest.sourceCodeByTgpPath~calculate')),
    expectedResult: equals(asIs({plugins: ['loader-tests']}))
  })
})

component('sourceCodeTest.external', {
  impl: dataTest({
    calculate: pipeline(
      '%$PROJECTS_PATH%/amta/plugins/amta-parsing/parsing-tests.js',
      typeAdapter('source-code<loader>', sourceCode(pluginsByPath('%%'), plugins('tgp-model-data'), {
        pluginPackages: packagesByPath('%%'),
        libsToInit: 'utils,tgp'
      })),
      first()
    ),
    expectedResult: equals(asIs({
        pluginPackages: [
          {$: 'defaultPackage'},
          {$: 'fileSystem', repo: 'amta', baseDir: '/home/shaiby/projects/amta'}
        ],
        plugins: ['amta-parsing-tests','tgp-model-data'],
        libsToInit: 'utils,tgp'
    }))
  })
})
