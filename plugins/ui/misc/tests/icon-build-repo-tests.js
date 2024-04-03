using('testing','common','parsing')

component('parseMDCRepo', {
  impl: pipe(
    fileContent('/home/shaiby/projects/jb-react/dist/fonts/MaterialIcons-Regular.codepoints'),
    split('\n'),
    obj(
      prop('title', split(' ', { part: 'first' })),
      prop('code', split(' ', { part: 'last' })),
      prop('font', 'Material Icons')
    )
  )
})
component('parseMDCRepoTest', {
  doNotRunInTests: true,
  impl: dataTest(parseMDCRepo())
})

component('parseMDIRepo', {
  impl: pipe(
    fileContent('/home/shaiby/projects/jb-react/dist/css/material-design-icons.css'),
    replace('{\n  content', '{content'),
    split('\n'),
    filter(contains('{content:')),
    obj(
      prop('title', extractText({ startMarkers: '.mdi-', endMarker: ':before' })),
      prop('code', extractText({ startMarkers: 'content: "\\', endMarker: '"' })),
      prop('font', 'Material Design Icons')
    )
  )
})
component('parseMDIRepoTest', {
  doNotRunInTests: true,
  impl: dataTest(parseMDIRepo())
})

component('parseAwesomeRepo', {
  impl: pipe(
    fileContent('/home/shaiby/projects/jb-react/dist/css/font-awesome-6.css'),
    replace('{\n  content', '{content'),
    split('\n'),
    filter(contains('{content:')),
    obj(
      prop('title', extractText({ startMarkers: '.fa-', endMarker: '::before' })),
      prop('code', extractText({ startMarkers: 'content: "\\', endMarker: '"' })),
      prop('font', 'Font Awesome 6 Free')
    )
  )
})
component('parseAwesomeRepoTest', {
  doNotRunInTests: true,
  impl: dataTest(parseAwesomeRepo())
})

component('buildRepo', {
  impl: pipe(
    Var('f1', parseMDCRepo(), { async: true }),
    Var('f2', parseMDIRepo(), { async: true }),
    Var('f3', parseAwesomeRepo(), { async: true }),
    list('%$f1%','%$f2%','%$f3%'),
    wrapAsObject('%title%', selectProps('code','font')),
    prettyPrint({ singleLine: true, noMacros: true }),
    'jb.ui.fontRep = %%',
    first()
  )
})
component('buildRepoTest', {
  doNotRunInTests: true,
  impl: dataTest(buildRepo())
})