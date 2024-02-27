component('FETest.codeMirror', {
  impl: uiFrontEndTest({
    control: group(
      Var('js', obj(prop('text', `function f1() {
return 15
}`))),
      Var('css', obj(prop('text', '{ width: 15px; }'))),
      Var('html', obj(prop('text', '<div><span>hello</span></div>'))),
      editableText({ databind: '%$js/text%', style: editableText.codemirror({ mode: 'javascript' }), features: codemirror.fold() }),
      editableText({ databind: '%$css/text%', style: editableText.codemirror({ mode: 'css' }), features: [codemirror.fold(), codemirror.lineNumbers()] }),
      editableText({ databind: '%$html/text%', style: editableText.codemirror({ mode: 'htmlmixed' }) })
    ),
    uiAction: waitForSelector('.CodeMirror'),
    expectedResult: contains('function','f1',15),
    renderDOM: true
  })
})

component('FETest.featuresCss', {
  impl: uiFrontEndTest(text('Hello World', { features: css('color: red') }), {
    expectedResult: ctx => {
      const elem = jb.ui.widgetBody(ctx)
      document.body.appendChild(elem)
      const ret = getComputedStyle(elem.firstElementChild).color == 'rgb(255, 0, 0)'
      document.body.removeChild(elem)
      return ret
    }
  })
})

component('FETest.picklist.mdcSelect', {
  impl: uiFrontEndTest({
    control: picklist('city', '%$personWithAddress/address/city%', {
      options: picklist.optionsByComma('Springfield,New York,Tel Aviv,London'),
      style: picklist.mdcSelect('200')
    }),
    expectedResult: contains('Springfield','New York')
  })
})

component('FETest.coLocation', {
  impl: uiFrontEndTest({
    vars: [Var('toChange', obj())],
    control: button('change', runFEMethod('#btn', 'changeDB'), {
      features: [
        frontEnd.coLocation(),
        id('btn'),
        frontEnd.method('changeDB', writeValue('%$toChange.x%', 3))
      ]
    }),
    uiAction: click(),
    expectedResult: equals('%$toChange/x%', 3)
  })
})

component('FETest.itemlist.infiniteScroll', {
  impl: uiFrontEndTest({
    control: itemlist({
      items: range(0, 10),
      controls: text('%%'),
      visualSizeLimit: 7,
      features: [
        css.height('100', 'scroll'),
        itemlist.infiniteScroll(4),
        css.width('100')
      ]
    }),
    uiAction: uiActions(scrollBy('.jb-itemlist', 80), waitForSelector('ul>:nth-child(8)')),
    expectedResult: contains('>10<'),
    renderDOM: true
  })
})

component('uiTest.editableText.richPicklistHelper.setInput', {
  impl: uiFrontEndTest({
    control: editableText('name', '%$person/name%', {
      style: editableText.input(),
      features: [
        id('inp'),
        editableText.picklistHelper(picklist.optionsByComma('1111,2,3,4'), {
          onEnter: editableText.setInputState('%$selectedOption%', '%value%')
        })
      ]
    }),
    uiAction: uiActions(
      keyboardEvent('#inp', 'keyup', { keyCode: 37 }),
      keyboardEvent('#inp', 'keydown', { keyCode: 40 }),
      keyboardEvent('#inp', 'keyup', { keyCode: 13 })
    ),
    expectedResult: contains('1111</input-val>')
  })
})