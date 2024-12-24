
jb.component('tgpLangTest.byName', {
  impl: dataTest(
    jison.parse({
      parser: tgp.langParser(),
      goal: 'profileExp',
      text: 'button {title: \"xx\", action: a1()}',
      debug: true
    }),
    '%result.title% == xx'
  )
})

jb.component('tgpLangTest.playground', {
  impl: dataTest(
    jison.parse({
      parser: tgp.langParser(),
      goal: 'profileExp',
      text: 'button {title: \"xx\", action: a1()}',
      debug: true
    }),
    ctx => { console.log (ctx.data); return true }
  )
})
