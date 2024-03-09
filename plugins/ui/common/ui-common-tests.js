using('ui-tests')

component('uiTest.group', {
  impl: uiTest(group(text('hello world'), text('2')), contains('hello world','2'))
})

component('uiTest.group1', {
  impl: group(button('click me'), button('click me'))
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

component('uiTest.controls', {
  impl: uiTest({
    control: group(
      text('hello'),
      controls(text('-1-'), controlWithCondition('1==2', text('-1.5-')), text('-2-')),
      text('world')
    ),
    expectedResult: contains('hello','-1-','-2-','world')
  })
})

component('uiTest.waitForWithPipe', {
  impl: uiTest({
    control: group(text('%%'), { features: group.wait(pipe(delay(1), 'hello')) }),
    expectedResult: and(contains('hello'), not(contains('loading'))),
    uiAction: waitForNextUpdate(),
    expectedCounters: {'init uiComp': 4},
  })
})

component('uiTest.waitForRx', {
  impl: uiTest({
    control: group(text('%%'), {
      features: group.wait(rx.pipe(source.interval(10), rx.take(1), rx.map('hello')))
    }),
    expectedResult: and(contains('hello'), not(contains('loading'))),
    uiAction: waitForNextUpdate(),
    expectedCounters: {'init uiComp': 4}
  })
})

component('uiTest.text.allowAsynchValue', {
  impl: uiTest(text(pipe(delay(1), 'hello'), { features: text.allowAsynchValue() }), contains('hello'), {
    uiAction: waitForNextUpdate(),
    expectedCounters: {'start renderVdom': 2, 'refresh uiComp !request': 1}
  })
})

component('uiTest.groupWaitWithVar', {
  impl: uiTest({
    control: group(text('%$txt%'), {
      features: group.wait(pipe(delay(1), 'hello'), { varName: 'txt' })
    }),
    expectedResult: contains('hello'),
    uiAction: waitForNextUpdate()
  })
})

// jb.component('uiTest.watchObservable', {
//   impl: uiTest({
//     vars: Var('promise', ctx => jb.delay(1)),
//     control: text({
//       text: '%$person/name%',
//       features: watchObservable({ toWatch: (ctx,{promise}) => jb.callbag.fromPromise(promise) })
//     }),
//     expectedCounters: {'start renderVdom': 2},
//     expectedResult: contains('Homer Simpson')
//   })
// })

component('uiTest.button', {
  impl: uiTest({
    control: group(text('%$txt%'), button('btn1', writeValue('%$txt%', 'bbb')), { features: watchable('txt', 'aaa') }),
    expectedResult: contains('bbb'),
    uiAction: click()
  })
})

component('uiTest.button.expectedEffects', {
  impl: uiTest({
    control: group(text('%$txt%'), button('btn1', writeValue('%$txt%', 'bbb')), { features: watchable('txt', 'aaa') }),
    expectedResult: contains('bbb'),
    uiAction: click({
      expectedEffects: Effects(checkLog('delta', '%delta%', { log: 'delta', condition: contains('$text="bbb"') }))
    })
  })
})

component('uiTest.button.expectedEffects.compChange', {
  impl: uiTest({
    control: group(text('%$txt%'), button('btn1', writeValue('%$txt%', 'bbb')), { features: watchable('txt', 'aaa') }),
    expectedResult: contains('bbb'),
    uiAction: click({ expectedEffects: Effects(compChange('bbb')) })
  })
})

// component('uiTest.button.disabled', {
//   impl: uiTest({
//     control: button({title: 'btn1', action: delay(100), style: button.native()}),
//     uiAction: click(),
//     expectedResult: contains('disabled')
//   })
// })



// component('uiTest.button.mdcIcon', {
//   impl: uiTest({
//     control: button({
//       title: 'btn1',
//       action: ctx => alert(1),
//       style: button.mdcIcon(icon('build'))
//     }),
//     expectedResult: contains('build')
//   })
// })


component('uiTest.editableText', {
  impl: uiTest(editableText('name', '%$person/name%', { style: editableText.input() }), contains('input','Homer Simpson'))
})

component('uiTest.editableText.onEnter', {
  impl: uiTest({
    control: editableText('name', '%$person/name%', {
      style: editableText.input(),
      features: feature.onKey('Enter', openDialog({ content: text('hello %$ev/value%') }))
    }),
    expectedResult: contains('hello Homer Simpson'),
    uiAction: keyboardEvent('input', 'keydown', { keyCode: '13' }),
    useFrontEnd: true
  })
})

component('uiTest.editableText.emptyData', {
  impl: uiTest(editableText('name', '%$person/name1%'), not(contains('undefined')))
})

component('uiTest.editableTextEmpty', {
  impl: uiTest(editableText('name', '%$person/name1%', { style: editableText.input() }), not(contains('object')))
})

component('uiTest.editableText.xButton', {
  impl: uiTest({
    control: editableText('name', '%$person/name%', { features: editableText.xButton() }),
    expectedResult: contains(['×','input','Homer Simpson'], { inOrder: false })
  })
})

component('uiTest.twoWayBinding', {
  impl: uiTest({
    control: group(editableText('name', '%$person/name%', { style: editableText.input() }), text('%$person/name%')),
    expectedResult: contains('<span','hello'),
    uiAction: setText('hello')
  })
})

// component('uiTest.remoteSectionExpandCollapse', {
//   impl: uiTest({
//     control: remote.widget(group({style: group.sectionExpandCollapse(text('open')), controls: text('hello')})),
//     expectedResult: contains('hello')
//   })
// })

component('uiTest.autoFocusOnFirstInput', {
  impl: uiTest({
    control: group(editableText('name', '%$person/name%'), editableText('age', '%$person/age%'), { features: group.autoFocusOnFirstInput() }),
    expectedResult: contains('__focus="autoFocusOnFirstInput"')
  })
})

component('uiTest.layout.horizontal', {
  impl: uiTest({
    control: group(button('button1'), text('label1'), { layout: layout.horizontal(30) }),
    expectedResult: contains('button1','label1','margin-right: 30px;')
  })
})

component('uiTest.layout.vertical', {
  impl: uiTest({
    control: group(button('button1'), text('label1'), { layout: layout.vertical(30) }),
    expectedResult: contains('button1','label1','margin-bottom: 30px;')
  })
})

component('uiTest.groupFlex', {
  impl: uiTest({
    control: group(button('button1'), text('label1'), { layout: layout.flex('row') }),
    expectedResult: contains('button1','label1')
  })
})

component('uiTest.dynamicControls', {
  impl: uiTest({
    control: group(dynamicControls(list('name','age'), editableText('%$controlItem%', '%$person/{%$controlItem%}%')), {
      style: propertySheet.titlesLeft()
    }),
    expectedResult: contains('name','age')
  })
})

component('uiTest.inlineControls', {
  impl: uiTest(group(text('a1'), inlineControls(text('a2'), text('a3'))), contains('a1','a2','a3'))
})

component('uiTest.tabs', {
  impl: uiTest({
    control: group(group(text('in tab1'), { title: 'tab1' }), group(text('in tab2'), { title: 'tab2' }), { style: group.tabs() }),
    expectedResult: and(contains('tab1','in tab1'), contains('tab2'), not(contains('in tab2')))
  })
})

component('uiTest.group.accordion', {
  impl: uiTest({
    control: group(group(text('in tab1'), { title: 'tab1' }), group(text('in tab2'), { title: 'tab2' }), { style: group.accordion() }),
    expectedResult: contains('tab1','in tab1','tab2')
  })
})

// jb.component('uiTest.markdown', {
//   impl: uiTest({
//     control: markdown(
//       `| Day     | Meal    | Price |
// | --------|---------|-------|
// | Monday  | pasta   | $6    |
// | Tuesday | chicken | $8    |    `
//     ),
//     expectedResult: contains('table')
//   })
// })

component('uiTest.styleByControl', {
  impl: uiTest({
    control: text('Hello World', { style: styleByControl(button('%$labelModel/text()%2'), 'labelModel') }),
    expectedResult: contains('Hello World2')
  })
})

component('uiTest.click.doNotWaitForNextUpdate', {
  impl: uiTest(button('Click Me', writeValue('%$person/name%', 'mukki')), equals('%$person/name%', 'mukki'), {
    uiAction: click({ doNotWaitForNextUpdate: true })
  })
})

component('uiTest.buttonX', {
  impl: uiTest(button('Click Me', { style: button.x() }), contains('×'))
})

component('uiTest.resource', {
  impl: uiTest(button('%$person.name%'), contains('Homer'))
})

component('uiTest.itemlist', {
  impl: uiTest({
    control: itemlist({ items: '%$people%', controls: text('%$item.name% - %name%') }),
    expectedResult: contains('Homer Simpson - Homer Simpson','Bart Simpson - Bart Simpson')
  })
})

component('uiTest.itemlistPrimitiveArray', {
  impl: uiTest({
    control: itemlist({ items: '%$personWithPrimitiveChildren/childrenNames%', controls: text('%%') }),
    expectedResult: contains('Bart','Lisa','Maggie')
  })
})

component('uiTest.itemlistPrimitiveArrayItemShouldBeRef', {
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

component('uiTest.itemlistRxSource', {
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

component('uiTest.itemlistWithSelect', {
  impl: uiTest({
    control: itemlist({
      items: '%$people%',
      controls: text('%$item.name% - %name%'),
      features: itemlist.selection({ autoSelectFirst: true })
    }),
    expectedResult: contains('Homer Simpson - Homer Simpson','Bart Simpson - Bart Simpson')
  })
})

component('FETest.itemlistWithSelect.click', {
  impl: uiTest({
    control: itemlist({
      items: '%$people%',
      controls: text('%$item.name% - %name%'),
      features: itemlist.selection({ autoSelectFirst: true })
    }),
    expectedResult: contains('Homer Simpson - Homer Simpson','selected','Bart Simpson - Bart Simpson'),
    uiAction: click('ul>li:nth-child(2)', { doNotWaitForNextUpdate: true }),
    useFrontEnd: true
  })
})

component('uiTest.itemlistSelection.autoSelectFirst', {
  impl: uiTest({
    control: itemlist({
      items: '%$people%',
      controls: text('%$item.name%'),
      features: [
        itemlist.selection('%$globals/selectedPerson%', { autoSelectFirst: true })
      ]
    }),
    expectedResult: contains('Homer Simpson')
  })
})

component('uiTest.itemlistSelection.click', {
  impl: uiTest({
    control: group(
      itemlist({
        items: '%$people%',
        controls: text('%$item.name%', { features: id('idx-%$index%') }),
        features: itemlist.selection('%$globals/selectedPerson%')
      }),
      text('-%$globals/selectedPerson/name%-', { features: watchRef('%$globals/selectedPerson%') })
    ),
    expectedResult: contains('-Marge Simpson-'),
    uiAction: click('#idx-2'),
    useFrontEnd: true
  })
})

component('uiTest.itemlistSelection.databind', {
  impl: uiTest({
    control: group(
      itemlist({
        items: '%$people/name%',
        controls: text('%%'),
        features: [
          itemlist.selection('%$globals/selectedPerson%', { autoSelectFirst: true }),
          watchRef('%$globals/selectedPerson%')
        ]
      }),
      button('select Marge', writeValue('%$globals/selectedPerson%', '%$people/1/name%'))
    ),
    expectedResult: contains('li','li','selected','Marge'),
    uiAction: click('button')
  })
})

component('uiTest.itemlistMDOfRefs.refChangeBug', {
  impl: uiTest({
    control: group(
      itemlist({
        items: '%$watchablePeople%',
        controls: text('%$item.name%', { features: id('itemlist%$index%') }),
        features: [
          id('itemlist'),
          itemlist.selection('%$globals/selectedPerson%', { autoSelectFirst: true }),
          itemlist.keyboardSelection(true)
        ]
      }),
      text('%$globals/selectedPerson/name% selected', {
        features: watchRef('%$globals/selectedPerson%')
      })
    ),
    expectedResult: contains('Marge Simpson','Marge Simpson - watchable selected'),
    uiAction: uiActions(
      waitForNextUpdate(),
      runMethod('#itemlist', 'onSelection', { Data: 2 }),
      runMethod('#itemlist', 'onSelection', { Data: 1 })
    )
  })
})

component('uiTest.itemlistKeyboardSelection', {
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
    useFrontEnd: true
  })
})

component('uiTest.BEOnDestroy', {
  impl: uiTest(text('%$person/name%'), contains('dialog closed'), {
    uiAction: uiActions(
      action(
        runActions(
          openDialog({
            content: text('in dialog', { features: onDestroy(writeValue('%$person/name%', 'dialog closed')) }),
            id: 'dlg'
          }),
          dialog.closeDialogById('dlg')
        )
      ),
      waitForText('dialog closed')
    )
  })
})

component('uiTest.onKey', {
  impl: uiTest({
    control: editableText('name', '%$person/name%', {
      features: [
        id('inp'),
        feature.onKey('ctrl-Enter', openDialog('hello'))
      ]
    }),
    expectedResult: contains('hello'),
    uiAction: keyboardEvent('#inp', 'keydown', { keyCode: 13, ctrl: 'ctrl' }),
    useFrontEnd: true
  })
})

component('uiTest.editableText.blockSelfRefresh', {
  impl: uiTest({
    control: group(editableText('name', '%$person/name%'), { features: watchRef('%$person/name%') }),
    expectedResult: contains('>name<'),
    uiAction: setText('hello', { doNotWaitForNextUpdate: true }),
    expectedCounters: {'start renderVdom': 2}
  })
})

component('uiTest.editableText.allowSelfRefresh', {
  impl: uiTest({
    control: group(editableText('name', '%$person/name%'), {
      features: watchRef('%$person/name%', { allowSelfRefresh: true })
    }),
    expectedResult: contains('hello'),
    uiAction: setText('hello'),
    expectedCounters: {'start renderVdom': 4}
  })
})

component('uiTest.propertySheet.titlesAbove', {
  impl: uiTest({
    control: group(editableText('name', '%$person/name%'), editableText('address', '%$person/age%'), { style: propertySheet.titlesAbove() }),
    expectedResult: contains('Homer')
  })
})

component('uiTest.propertySheet.titlesLeft', {
  impl: uiTest({
    control: group({
      controls: [
        editableText('name', '%$person/name%', { style: editableText.input() }),
        editableText('address', '%$person/age%', { style: editableText.input() })
      ],
      style: propertySheet.titlesLeft()
    }),
    expectedResult: contains('name:','Homer','display: grid')
  })
})

component('uiTest.innerLabel1Tst', {
  params: [
    {id: 'title', mandatory: true, dynamic: true}
  ],
  impl: text(call('title'))
})

component('uiTest.innerLabel2Tst', {
  params: [
    {id: 'title', mandatory: true, dynamic: true}
  ],
  impl: uiTest.innerLabel1Tst(call('title'))
})

component('uiTest.innerLabel3Tst', {
  params: [
    {id: 'title', mandatory: true, dynamic: true}
  ],
  impl: uiTest.innerLabel2Tst(call('title'))
})

component('uiTest.innerLabel', {
  impl: uiTest(uiTest.innerLabel3Tst('Hello World2'), contains('Hello World2'))
})

component('uiTest.propertySheet.fieldTitleOfLabel', {
  impl: uiTest({
    control: group(text('%$personWithAddress/address/city%', { features: field.title('City') }), { style: propertySheet.titlesLeft() }),
    expectedResult: contains('City')
  })
})

component('uiTest.refreshControlById.text', {
  impl: uiTest({
    vars: [
      Var('person1', () => ({ name: 'Homer' }))
    ],
    control: text('%$person1/name%', { features: id('t1') }),
    expectedResult: contains('Dan'),
    uiAction: uiActions(writeValue('%$person1/name%', 'Dan'), action(refreshControlById('t1')))
  })
})

component('uiTest.refreshControlById.withButton', {
  impl: uiTest({
    vars: [
      Var('person1', () => ({ name: 'Homer' }))
    ],
    control: group(
      text('%$person1/name%', { features: id('t1') }),
      button('refresh', runActions(writeValue('%$person1/name%', 'Dan'), refreshControlById('t1')))
    ),
    expectedResult: contains('Dan'),
    uiAction: click('button')
  })
})

component('uiTest.refreshByStateChange', {
  impl: uiTest({
    control: group(text('%$name%'), {
      features: [
        id('g1'),
        variable('name', 'name: %$$state/name%'),
        method('refresh', action.refreshCmp(obj(prop('name', 'Dan'))))
      ]
    }),
    expectedResult: contains('Dan'),
    uiAction: runMethod('#g1', 'refresh', { doNotWaitForNextUpdate: true })
  })
})

component('uiTest.refreshWithStyleByCtrl', {
  impl: uiTest({
    control: group({
      controls: [
        text('%$name%'),
        button('click', ctx => jb.ui.runBEMethodByElem(jb.ui.find(ctx, '#g1')[0], 'refresh'))
      ],
      style: group.sections(),
      features: [
        id('g1'),
        variable('name', ctx => ctx.exp('name: %$$state/name%')),
        method('refresh', action.refreshCmp(obj(prop('name', 'Dan'))))
      ]
    }),
    expectedResult: contains('Dan'),
    uiAction: click('button')
  })
})

component('uiTest.rawVdom', {
  impl: uiTest(ctx => jb.ui.h('div', {}, 'hello world'), contains('hello world'))
})

component('uiTest.firstSucceeding', {
  impl: uiTest({
    control: group({
      controls: [
        group(controlWithCondition('%$gender% == "male"', text('male')), { features: group.firstSucceeding() }),
        group({
          controls: [
            controlWithCondition('%$gender% == "female"', text('female')),
            controlWithCondition('%$gender% != "female"', text('male2')),
            controlWithCondition(true, text('second-succeeding'))
          ],
          features: group.firstSucceeding()
        })
      ],
      features: [
        variable('gender', 'male')
      ]
    }),
    expectedResult: and(contains('male','male2'), not(contains('second-succeeding')))
  })
})

component('uiTest.firstSucceedingInnerVar', {
  impl: uiTest({
    control: group(controlWithCondition('%$innerVar% == "5"', text('innerVar')), {
      features: [
        group.firstSucceeding(),
        variable('innerVar', '5')
      ]
    }),
    expectedResult: contains('innerVar')
  })
})

component('uiTest.group.firstSucceedingDefault', {
  impl: uiTest({
    control: group(controlWithCondition(false, text('female')), text('defaultCtrl'), { features: group.firstSucceeding() }),
    expectedResult: contains('defaultCtrl')
  })
})

component('uiTest.group.firstSucceedingWithoutCondition', {
  impl: uiTest({
    control: group(text('withoutCondition'), controlWithCondition(true, text('female')), { features: group.firstSucceeding() }),
    expectedResult: contains('withoutCondition')
  })
})

component('uiTest.firstSucceedingWatchableSample', {
  type: 'control',
  impl: group({
    controls: [
      editableText({ databind: '%$gender%' }),
      button('female', writeValue('%$gender%', 'female'), { features: id('female') }),
      button('zee', writeValue('%$gender%', 'zee'), { features: id('zee') }),
      button('male', writeValue('%$gender%', 'male'), { features: id('male') }),
      group(controlWithCondition('%$gender% == "male"', text('a male')), text('not male'), {
        features: [
          group.firstSucceeding(),
          watchRef('%$gender%')
        ]
      })
    ],
    features: watchable('gender', 'male')
  })
})

component('uiTest.firstSucceeding.watchRefreshOnCtrlChange', {
  impl: uiTest(uiTest.firstSucceedingWatchableSample(), contains('not male'), { uiAction: click('#female'), expectedCounters: {'start renderVdom': 9} })
})

component('uiTest.firstSucceeding.sameDoesNotRecreate', {
  impl: uiTest(uiTest.firstSucceedingWatchableSample(), contains('not male'), {
    uiAction: uiActions(click('#female'), click('#zee')),
    expectedCounters: {'start renderVdom': 11}
  })
})

component('uiTest.watchRef.recalcVars', {
  impl: uiTest({
    control: text('%$changed%', {
      features: [
        variable('changed', '--%$person/name%--'),
        watchRef('%$person/name%')
      ]
    }),
    expectedResult: contains('--hello--'),
    uiAction: writeValue('%$person/name%', 'hello')
  })
})

component('uiTest.hiddenRefBug', {
  impl: uiTest({
    control: group(text('hey', { features: hidden('%$hidden%') }), { features: watchable('hidden', false) }),
    expectedResult: contains('display:none')
  })
})

component('uiTest.validator', {
  impl: uiTest({
    control: group(
      editableText('project', '%$person/project%', {
        features: [
          id('fld'),
          validation(matchRegex('^[a-zA-Z_0-9]+$'), 'invalid project name')
        ]
      })
    ),
    expectedResult: contains('invalid project name'),
    uiAction: setText('a b', '#fld'),
    allowError: true
  })
})

component('uiTest.watchableVariableAsProxy', {
  impl: uiTest(group({ features: watchable('link', '%$person%') }), ctx => jb.db.resources[Object.keys(jb.db.resources).filter(x => x.match(/link:[0-9]*/))[0]][Symbol.for("isProxy")])
})


component('uiTest.watchableLinkWriteOriginalWatchLink', {
  impl: uiTest({
    control: group(text('%$person/name%'), text('%$link/name%'), { features: watchable('link', '%$person%') }),
    expectedResult: contains('hello','hello'),
    uiAction: writeValue('%$person/name%', 'hello')
  })
})

component('uiTest.watchableWriteViaLink', {
  impl: uiTest({
    control: group({
      controls: [
        text('%$person/name%'),
        text('%$link/name%'),
        button('set', writeValue('%$link/name%', 'hello'), { features: id('set') })
      ],
      features: watchable('link', '%$person%')
    }),
    expectedResult: contains('hello','hello'),
    uiAction: click('#set', { doNotWaitForNextUpdate: true })
  })
})

component('uiTest.watchableParentRefreshMaskChildren', {
  impl: uiTest(group(text('%$person/name%'), { features: watchRef('%$person/name%') }), contains('hello'), {
    uiAction: writeValue('%$person/name%', 'hello'),
    expectedCounters: {'refresh from observable elements': 1}
  })
})

component('uiTest.watchableUrl', {
  impl: uiTest(text('%$person/name%'), contains('observe="resources','~name;person~name'))
})

component('uiTest.itemlistWithGroupWait', {
  impl: uiTest({
    control: itemlist({
      items: '%$items%',
      controls: text('%name%'),
      features: group.wait(pipe(delay(1), () => [{ name: 'homer' }]), { varName: 'items' })
    }),
    expectedResult: contains('homer'),
    uiAction: waitForNextUpdate()
  })
})







