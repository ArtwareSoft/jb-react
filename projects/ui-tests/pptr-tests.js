jb.component('dataTest.pptr.browser', {
  impl: dataTest({
    calculate2: rx.pipe(
      pptr.start(),
      pptr.mapPromise((ctx,{browser}) => { debugger; return browser.newPage() }),
      rx.take(1)
    ),
    expectedResult: equals(6)
  })
})

