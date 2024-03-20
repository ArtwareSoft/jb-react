using('ui-styles')

component('uiTest.layout.horizontal', {
  impl: uiTest({
    control: group(button('button1'), text('label1'), { layout: layout.horizontal({ spacing: 30 }) }),
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

component('uiTest.tabs.selectTab', {
  impl: uiTest({
    control: group(group(text('in tab1'), { title: 'tab1' }), group(text('in tab2'), { title: 'tab2' }), {
      style: group.tabs()
    }),
    expectedResult: and(contains('tab1','in tab2'), contains('tab2'), not(contains('in tab1'))),
    uiAction: selectTab('tab2')
  })
})

component('uiTest.group.accordion', {
  impl: uiTest({
    control: group(group(text('in tab1'), { title: 'tab1' }), group(text('in tab2'), { title: 'tab2' }), { style: group.accordion() }),
    expectedResult: contains('tab1','in tab1','tab2')
  })
})

component('uiTest.autoFocusOnFirstInput', {
  impl: uiTest({
    control: group(editableText('name', '%$person/name%'), editableText('age', '%$person/age%'), { features: group.autoFocusOnFirstInput() }),
    expectedResult: contains('__focus="autoFocusOnFirstInput"')
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

component('uiTest.propertySheet.fieldTitleOfLabel', {
  impl: uiTest({
    control: group(text('%$personWithAddress/address/city%', { features: field.title('City') }), { style: propertySheet.titlesLeft() }),
    expectedResult: contains('City')
  })
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

component('uiTest.groupWaitWithVar', {
  impl: uiTest({
    control: group(text('%$txt%'), {
      features: group.wait(pipe(delay(1), 'hello'), { varName: 'txt' })
    }),
    expectedResult: contains('hello'),
    uiAction: waitForNextUpdate()
  })
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
