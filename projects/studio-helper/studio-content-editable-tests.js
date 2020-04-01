jb.component('test.helloWorldCtrl',{
  type: 'control',
  impl: text('hello world')
})

jb.component('test.wixIslandGridCtrl',{
    type: 'control',
    impl: group({
        layout: layout.grid({
          columnSizes: list(13, 74, 83, 120, 16),
          rowSizes: list(11, 177, 79, 33, 74, 4, 31, 9, 21)
        }),
        controls: [
          text({
            text: 'HYDRA',
            style: text.htmlTag('span'),
            features: [
              css.layout('vertical-align:baseline'),
              css.detailedColor('color:rgb(87, 112, 131)'),
              css.typography(
                'font-family:Arial, Helvetica, sans-serif;font-size:10px;font-style:normal;font-variant-ligatures:normal;font-variant-caps:normal;font-weight:400;text-align:start;text-indent:0px;text-transform:none;-webkit-text-stroke-width:0px;text-decoration-style:initial;text-decoration-color:initial;font:20px proxima-n-w01-reg, sans-serif;font-size:20px;font-weight:bold;font-family:\"open sans\", sans-serif'
              ),
              css(
                'background:transparent;letter-spacing:normal;orphans:2;white-space:normal;widows:2;word-spacing:0px;overflow-wrap:break-word;pointer-events:none;pointer-events:auto;letter-spacing:0.08em'
              ),
              css('{ grid-area: 3 / 3 / span 1 / span 1}')
            ]
          }),
          text({
            text: '01/19 - 01/23',
            style: text.htmlTag('span'),
            features: [
              css.layout('vertical-align:baseline'),
              css.detailedColor('color:rgb(54, 181, 205)'),
              css.typography(
                'text-align:start;font-family:Arial, Helvetica, sans-serif;font-size:10px;font-style:normal;font-variant-ligatures:normal;font-variant-caps:normal;font-weight:400;text-indent:0px;text-transform:none;-webkit-text-stroke-width:0px;text-decoration-style:initial;text-decoration-color:initial;font:14px proxima-n-w01-reg, sans-serif;font-size:14px;font-family:avenir-lt-w01_35-light1475496, sans-serif'
              ),
              css(
                'background:transparent;overflow-wrap:break-word;letter-spacing:normal;orphans:2;white-space:normal;widows:2;word-spacing:0px;pointer-events:none;pointer-events:auto'
              ),
              css('{ grid-area: 4 / 2 / span 1 / span 2}')
            ]
          }),
          text({
            text: 'Click here to add your own content, or connect to data from your collections.',
            style: text.htmlTag('span'),
            features: [
              css.layout('vertical-align:baseline'),
              css.detailedColor('color:rgb(87, 112, 131)'),
              css.typography(
                'text-align:start;font-family:Arial, Helvetica, sans-serif;font-size:10px;font-style:normal;font-variant-ligatures:normal;font-variant-caps:normal;font-weight:400;text-indent:0px;text-transform:none;-webkit-text-stroke-width:0px;text-decoration-style:initial;text-decoration-color:initial;font:15px / 1.5em proxima-n-w01-reg, sans-serif'
              ),
              css(
                'background:transparent;overflow-wrap:break-word;letter-spacing:normal;orphans:2;white-space:normal;widows:2;word-spacing:0px;pointer-events:none;pointer-events:auto'
              ),
              css('{ grid-area: 5 / 2 / span 1 / span 3}')
            ]
          }),
          text({
            text: 'From:',
            style: text.htmlTag('span'),
            features: [
              css.layout('vertical-align:baseline'),
              css.detailedColor('color:rgb(87, 112, 131)'),
              css.typography(
                'text-align:start;font-family:Arial, Helvetica, sans-serif;font-size:10px;font-style:normal;font-variant-ligatures:normal;font-variant-caps:normal;font-weight:400;text-indent:0px;text-transform:none;-webkit-text-stroke-width:0px;text-decoration-style:initial;text-decoration-color:initial;font:15px / 1.5em proxima-n-w01-reg, sans-serif;font-family:avenir-lt-w01_35-light1475496, sans-serif;font-size:15px'
              ),
              css(
                'background:transparent;overflow-wrap:break-word;letter-spacing:normal;orphans:2;white-space:normal;widows:2;word-spacing:0px;pointer-events:none;pointer-events:auto'
              ),
              css('{ grid-area: 6 / 2 / span 2 / span 1}')
            ]
          }),
          text({
            text: '$550',
            style: text.htmlTag('span'),
            features: [
              css.layout('vertical-align:baseline'),
              css.detailedColor('color:rgb(54, 181, 205)'),
              css.typography(
                'text-align:start;font-family:Arial, Helvetica, sans-serif;font-size:10px;font-style:normal;font-variant-ligatures:normal;font-variant-caps:normal;font-weight:400;text-indent:0px;text-transform:none;-webkit-text-stroke-width:0px;text-decoration-style:initial;text-decoration-color:initial;font:26px / 1.5em proxima-n-w01-reg, sans-serif;font-size:26px;font-family:avenir-lt-w01_85-heavy1475544, sans-serif'
              ),
              css(
                'background:transparent;overflow-wrap:break-word;letter-spacing:normal;orphans:2;white-space:normal;widows:2;word-spacing:0px;pointer-events:none;pointer-events:auto'
              ),
              css('{ grid-area: 8 / 2 / span 2 / span 1}')
            ]
          }),
          text({
            text: 'Book Now',
            style: text.htmlTag('span'),
            features: [
              css.layout('vertical-align:baseline;display:inline-block;position:relative'),
              css.detailedColor('color:rgb(0, 0, 0);color:rgb(255, 255, 255)'),
              css.typography(
                'font-family:Arial, Helvetica, sans-serif;font-size:10px;font-style:normal;font-variant-ligatures:normal;font-variant-caps:normal;font-weight:400;text-align:start;text-indent:0px;text-transform:none;-webkit-text-stroke-width:0px;text-decoration-style:initial;text-decoration-color:initial;text-align:initial;font:15px / 1.4em helvetica-w01-roman, helvetica-w02-roman, helvetica-lt-w10-roman, sans-serif'
              ),
              css(
                'background:transparent;letter-spacing:normal;orphans:2;white-space:normal;widows:2;word-spacing:0px;background:rgb(54, 181, 205);cursor:pointer !important;transition:color 0.4s ease 0s;white-space:nowrap;padding-top:9px;padding-left:25px;padding-right:;padding-bottom:'
              ),
              css('{ grid-area: 7 / 4 / span 2 / span 1}')
            ]
          }),
          image({
            url: 'https://static.wixstatic.com/media/af9daef5b5684a679caf003614294ccd.jpg/v1/crop/x_584,y_0,w_5416,h_4000/fill/w_306,h_226,al_c,q_80,usm_0.66_1.00_0.01/af9daef5b5684a679caf003614294ccd.webp',
            style: image.img(),
            features: [
              css.layout('vertical-align:baseline'),
              css.width('306'),
              css.height('226'),
              css.detailedColor('color:rgb(0, 0, 0)'),
              css.typography(
                'font-family:Arial, Helvetica, sans-serif;font-size:10px;font-style:normal;font-variant-ligatures:normal;font-variant-caps:normal;font-weight:400;text-align:start;text-indent:0px;text-transform:none;-webkit-text-stroke-width:0px;text-decoration-style:initial;text-decoration-color:initial'
              ),
              css(
                'background:transparent;letter-spacing:normal;orphans:2;white-space:normal;widows:2;word-spacing:0px;overflow:hidden;object-fit:cover;z-index:-1'
              ),
              css('{ grid-area: 2 / 1 / span 2 / span 5}')
            ]
          })
        ],
        features: [id('island'),css('width: 783px; height: 449px;')]
      })
})

jb.component('contentEditableTest.text', {
  impl: uiTest({
    runBefore: ctx => jb.studio.studioWindow = window,
    control: text({ text: 'hello world', features: id('txt')}),
    action: runActions(ctx => {
      jb.ui.contentEditable.activate(jb.ui.elemOfSelector('#txt',ctx))
    },delay(10)),
    expectedResult: contains({text: 'view_quilt', allText: ctx => ctx.run(test.dialogContent('content-editable-toolbar'))})
  })
})

jb.component('contentEditableTest.text.positions', {
  impl: uiTest({
    runBefore: ctx => jb.studio.studioWindow = window,
    renderDOM: true, // needed for position thumbs
    control: text({ text: 'hello world', features: id('txt')}),
    action: runActions(ctx => jb.ui.contentEditable.activate(jb.ui.elemOfSelector('#txt',ctx)),
      delay(10),
      contentEditable.openPositionThumbs('x'),
      contentEditable.openPositionThumbs('y'),    
    ),
    expectedResult: contains({text: 'radio_button_unchecked', allText: ctx => ctx.run(test.dialogContent('positionThumbs'))})
  })
})

jb.component('contentEditableTest.grid', {
  impl: uiTest({
    runBefore: ctx => jb.studio.studioWindow = window,
    renderDOM: true, // needed for position thumbs
    control: test.wixIslandGridCtrl(),
    action: runActions(ctx => jb.ui.contentEditable.activate(jb.ui.elemOfSelector('#island',ctx)),
      delay(10),
      contentEditable.openGridEditor('Columns'),
      contentEditable.openGridEditor('Rows'),
    ),
    expectedResult: contains({text: 'radio_button_unchecked', allText: ctx => ctx.run(test.dialogContent('gridDialog'))})
  })
})

jb.component('contentEditableTest.grid.inStudio', {
  impl: uiTest({
    control: test.wixIslandGridCtrl(),
    runInPreview: runActions(
      delay(10),
      ctx => {
        if (jb.ui.contentEditableTestGrid) return
        jb.ui.contentEditableTestGrid = true
        const studiojb = jb.frame.parent.jb, studioWin = jb.frame.parent
        studiojb.ui.contentEditable.activate(document.querySelector('#island'))
        studiojb.exec(studioWin.contentEditable.openGridEditor('Columns'))
        studiojb.exec(studioWin.contentEditable.openGridEditor('Rows'))
      }
    ),
    expectedResult: contains({text: 'radio_button_unchecked', allText: ctx => ctx.run(test.dialogContent('gridDialog'))})
  })
})
