using('ui-misc','ui-styles')

component('browserTest.codeMirror', {
  impl: browserTest({
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

component('browserTest.featuresCss', {
  doNotRunInTests: true,
  impl: browserTest(text('Hello World', { features: css('color: red') }), {
    expectedResult: ctx => {
      const elem = jb.ui.widgetBody(ctx)
      document.body.appendChild(elem)
      const ret = getComputedStyle(elem.firstElementChild).color == 'rgb(255, 0, 0)'
      document.body.removeChild(elem)
      return ret
    }
  })
})

component('browserTest.picklist.mdcSelect', {
  doNotRunInTests: true,
  impl: browserTest({
    control: picklist('city', '%$personWithAddress/address/city%', {
      options: picklist.optionsByComma('Springfield,New York,Tel Aviv,London'),
      style: picklist.mdcSelect('200')
    }),
    expectedResult: contains('Springfield','New York')
  })
})

component('browserTest.coLocation', {
  impl: browserTest({
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

component('browserTest.itemlist.infiniteScroll', {
  doNotRunInTests: true,
  impl: browserTest({
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

component('uiTest.onDestroy', {
  impl: uiTest({
    control: group(
      button('click me', writeValue('%$person/name%', 'mukki')),
      group({
        controls: controlWithCondition('%$person/name%!=mukki', text('hello', { features: frontEnd.onDestroy(() => jb.frame.xx = 3) })),
        features: watchRef('%$person/name%')
      })
    ),
    expectedResult: equals(()=>jb.frame.xx, 3),
    uiAction: click(),
    emulateFrontEnd: true
  })
})


// component('browserTest.dialogCleanup', {
//   impl: browserTest({
//     vars: [
//       Var('cleanup', obj(prop('destroy'), prop('tickAfterDestroy')))
//     ],
//     control: button('click me', openDialog('hello', text('world'), {
//       id: 'hello',
//       features: ctx => ({
//           destroy: cmp => {
//             ctx.run(writeValue('%$cleanup/destroy%',
//               cmp.base && cmp.base.parentNode && cmp.base.parentNode.parentNode ? 'attached' : 'detached' ))
//             jb.delay(1).then(()=> ctx.run(writeValue('%$cleanup/tickAfterDestroy%',
//               cmp.base && cmp.base.parentNode && cmp.base.parentNode.parentNode ? 'attached' : 'detached' )))
//           }
//         })
//     })),
//     uiAction: uiActions(click('button'), action(dialog.closeAll()), delay(20)),
//     expectedResult: and(equals('%$cleanup/destroy%', 'attached'), equals('%$cleanup/tickAfterDestroy%', 'detached'))
//   })
// })

// // ensure the right order between the unmount that causes elem._component = null and the blur event which is automatically generated when detaching the dialog
// jb.component('uiTest.updateOnBlurWhenDialogClosed', {
//   impl: browserTest({
//     control: group({
//       controls: [
//         button({
//           title: 'click me',
//           action: ctx => ctx.setVars({elemToTest:null}).run(openDialog({content:
//             editableText({title: 'name', updateOnBlur: true, databind: '%$person/name%' })
//           }))
//         }),
//         text('%$person/name%')
//       ]
//     }),
//     action: click('button'),
//     expectedResult: true
//   })
// })

// jb.component('uiTest.cssDynamic', {
//   impl: browserTest({
//     control: group({
//       controls: [
//         text({
//           text: '%$color%',
//           features: [css.dynamic('{ color: %$color% }'), id('label')]
//         }),
//         button({
//           title: 'green',
//           action: writeValue('%$color%', 'green'),
//           features: id('green')
//         }),
//         button({title: 'blue', action: writeValue('%$color%', 'blue')})
//       ],
//       features: watchable('color','blue')
//     }),
//     action: click('#green'),
//     expectedResult: pipeline(ctx => jb.ui.cssOfSelector('#label',ctx), contains('color: green'))
//   })
// })


