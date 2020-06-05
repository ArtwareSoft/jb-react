jb.component('dataTest.pptr.browser', {
  impl: dataTest({
    calculate: rx.pipe(
      pptr.start(),
//      pptr.mapPromise((ctx,{browser}) => { debugger; return browser.newPage() }),
      rx.take(1)
    ),
    expectedResult: equals(6)
  })
})

