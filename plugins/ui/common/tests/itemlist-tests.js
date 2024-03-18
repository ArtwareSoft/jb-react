component('itemlistTest.basic', {
  impl: uiTest({
    control: itemlist({ items: '%$people%', controls: text('%$item.name% - %name%') }),
    expectedResult: contains('Homer Simpson - Homer Simpson','Bart Simpson - Bart Simpson')
  })
})

component('itemlistTest.rx', {
  impl: uiTest({
    control: itemlist({
      items: rx.pipe(source.data('%$people%'), rx.delay(1)),
      controls: text('%$item.name% - %name%'),
      features: itemlist.incrementalFromRx()
    }),
    expectedResult: contains('Homer Simpson - Homer Simpson','Bart Simpson - Bart Simpson'),
    uiAction: waitForNextUpdate(8)
  })
})

component('itemlistTest.selection.autoSelectFirst', {
  impl: uiTest({
    control: itemlist({
      items: '%$people%',
      controls: text('%$item.name%'),
      features: itemlist.selection({ autoSelectFirst: true })
    }),
    expectedResult: contains('selected','Homer','Marge')
  })
})

component('itemlistTest.selection.nthChildSelector', {
  doNotRunInTests: true,
  impl: uiTest({
    control: itemlist({
      items: '%$people%',
      controls: text('%$item.name% - %name%'),
      features: itemlist.selection({ autoSelectFirst: true })
    }),
    expectedResult: contains('Homer Simpson - Homer Simpson','selected','Bart Simpson - Bart Simpson'),
    uiAction: click('ul>li:nth-child(2)'),
    emulateFrontEnd: true
  })
})

component('itemlistTest.Selection.click', {
  impl: uiTest({
    control: group(
      itemlist({
        items: '%$people%',
        controls: text('%$item.name%', { features: id('idx-%$index%') }),
        features: itemlist.selection({ databind: '%$globals/selectedPerson%' })
      }),
      text('-%$globals/selectedPerson/name%-', { features: watchRef('%$globals/selectedPerson%') })
    ),
    expectedResult: contains('-Marge Simpson-'),
    uiAction: click('#idx-2'),
    emulateFrontEnd: true
  })
})

component('itemlistTest.selection.databind', {
  impl: uiTest({
    control: group(
      itemlist({
        items: '%$people/name%',
        controls: text('%%'),
        features: [
          itemlist.selection({ databind: '%$globals/selectedPerson%', autoSelectFirst: true }),
          watchRef('%$globals/selectedPerson%')
        ]
      }),
      button('select Marge', writeValue('%$globals/selectedPerson%', '%$people/1/name%'))
    ),
    expectedResult: contains('Homer','selected','Marge','Bart'),
    uiAction: click('button')
  })
})

component('itemlistTest.KeyboardSelection', {
  impl: uiTest({
    vars: [Var('res', obj())],
    control: itemlist({
      items: '%$people%',
      controls: text('%name%'),
      features: [
        itemlist.selection({ autoSelectFirst: true }),
        itemlist.keyboardSelection({ onEnter: writeValue('%$res/selected%', '%name%') })
      ]
    }),
    expectedResult: equals('%$res/selected%', 'Homer Simpson'),
    uiAction: keyboardEvent('.jb-itemlist', 'keydown', { keyCode: 13, doNotWaitForNextUpdate: true }),
    emulateFrontEnd: true
  })
})

component('itemlistTest.primitiveArray', {
  impl: uiTest({
    control: itemlist({ items: '%$personWithPrimitiveChildren/childrenNames%', controls: text('%%') }),
    expectedResult: contains('Bart','Lisa','Maggie')
  })
})

component('itemlistTest.primitiveArrayItemShouldBeRef', {
  impl: uiTest({
    vars: [
      Var('isResultRef', obj(prop('answer', false)))
    ],
    control: itemlist({
      items: '%$personWithPrimitiveChildren/childrenNames%',
      controls: ctx => {
        ctx.runAction(writeValue('%$isResultRef/answer%', () => !!jb.db.isRef(ctx.data)))
        return ctx.run(text('%%'), 'control<>')
      }
    }),
    expectedResult: '%$isResultRef/answer%',
  })
})

component('itemlistTest.refChangeBug', {
  impl: uiTest({
    control: group(
      itemlist({
        items: '%$watchablePeople%',
        controls: text('%$item.name%', { features: id('itemlist%$index%') }),
        features: [
          id('itemlist'),
          itemlist.selection('%$globals/selectedPerson%', { autoSelectFirst: true }),
          itemlist.keyboardSelection({ autoFocus: true })
        ]
      }),
      text('%$globals/selectedPerson/name% selected', { features: watchRef('%$globals/selectedPerson%') })
    ),
    expectedResult: contains('Marge Simpson','Marge Simpson - watchable selected'),
    uiAction: uiActions(
      waitForNextUpdate(),
      runMethod('#itemlist', 'onSelection', { Data: 2 }),
      runMethod('#itemlist', 'onSelection', { Data: 1 })
    )
  })
})

component('itemlistTest.underGroupWait', {
  impl: uiTest({
    control: itemlist({
      items: '%$items%',
      controls: text('%name%'),
      features: group.wait(delay(1, obj(prop('name', 'homer'))), { varName: 'items' })
    }),
    expectedResult: contains('homer'),
    uiAction: waitForNextUpdate()
  })
})

component('itemlistTest.infiniteScroll.twice', {
  impl: uiTest({
    control: itemlist({
      items: range(0, 10),
      controls: text('%%'),
      visualSizeLimit: '7',
      features: [
        id('itemlist'),
        css.height('100', { overflow: 'scroll' }),
        itemlist.infiniteScroll(2),
        css.width('100')
      ]
    }),
    expectedResult: contains('>10<'),
    uiAction: uiActions(runMethod('#itemlist', 'fetchNextPage'), runMethod('#itemlist', 'fetchNextPage'))
  })
})

component('itemlistTest.infiniteScroll.table', {
  impl: uiTest({
    control: table({
      items: range(0, 10),
      controls: text('%%'),
      visualSizeLimit: '7',
      features: [
        id('itemlist'),
        css.height('100', { overflow: 'scroll' }),
        itemlist.infiniteScroll(4),
        css.width('100')
      ]
    }),
    expectedResult: contains('>10<','</tbody>'),
    uiAction: runMethod('#itemlist', 'fetchNextPage')
  })
})

component('itemlistTest.DD', {
  impl: uiTest({
    control: group(
      itemlist({
        items: '%$watchablePeople%',
        controls: text('%name%', { features: css.class('drag-handle') }),
        features: [
          itemlist.selection({ databind: '%$globals/selectedPerson%', autoSelectFirst: true }),
          itemlist.keyboardSelection({ autoFocus: true }),
          itemlist.dragAndDrop(),
          id('itemlist')
        ]
      }),
      text('----'),
      itemlist({
        items: '%$watchablePeople%',
        controls: text('%name%'),
        features: watchRef('%$watchablePeople%')
      })
    ),
    expectedResult: contains('Bart','Marge','Homer'),
    uiAction: keyboardEvent('#itemlist', 'keydown', { keyCode: 40, ctrl: 'ctrl' }),
    emulateFrontEnd: true
  })
})