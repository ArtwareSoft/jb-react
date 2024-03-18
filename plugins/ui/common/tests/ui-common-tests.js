using('ui-tests','markdown-editor')

component('uiTest.group', {
  impl: uiTest(group(text('hello world'), text('2')), contains('hello world','2'))
})

component('uiTest.text', {
  impl: uiTest(text('hello world', { features: css.color('green') }), contains('hello world','green'))
})

component('uiTest.text0', {
  impl: uiTest(text(0), contains('>0<'))
})

component('uiTest.html', {
  impl: uiTest(html('<p>hello world</p>'), contains('>hello world</p>'))
})

component('uiTest.html.inIframe', {
  impl: uiTest(html('<p>hello world</p>', { style: html.inIframe() }), contains('iframe'))
})

component('uiTest.text.allowAsynchValue', {
  impl: uiTest(text(pipe(delay(1), 'hello'), { features: text.allowAsynchValue() }), contains('hello'), {
    uiAction: waitForNextUpdate(),
    expectedCounters: {'start renderVdom': 2, 'refresh uiComp !request': 1}
  })
})

component('uiTest.button', {
  impl: uiTest({
    control: group(text('%$txt%'), button('btn1', writeValue('%$txt%', 'bbb')), { features: watchable('txt', 'aaa') }),
    expectedResult: contains('bbb'),
    uiAction: click()
  })
})










